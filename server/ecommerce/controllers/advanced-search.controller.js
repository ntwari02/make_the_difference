const { ok, badRequest, notFound } = require('../../utils/response');
const advancedSearchService = require('../services/advanced-search.service');

// Visual search endpoint
const visualSearch = async (req, res) => {
  try {
    if (!req.file) {
      return badRequest(res, 'Image file is required for visual search');
    }

    const filters = req.body.filters ? JSON.parse(req.body.filters) : {};
    const results = await advancedSearchService.visualSearch(req.file, filters);

    return ok(res, results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Voice search endpoint
const voiceSearch = async (req, res) => {
  try {
    if (!req.file) {
      return badRequest(res, 'Audio file is required for voice search');
    }

    const filters = req.body.filters ? JSON.parse(req.body.filters) : {};
    const results = await advancedSearchService.voiceSearch(req.file, filters);

    return ok(res, results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Semantic search endpoint
const semanticSearch = async (req, res) => {
  try {
    const { query } = req.body;
    const filters = req.query;

    if (!query) {
      return badRequest(res, 'Search query is required');
    }

    const results = await advancedSearchService.semanticSearch(query, filters);

    return ok(res, results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Advanced filter search endpoint
const advancedFilterSearch = async (req, res) => {
  try {
    const filters = req.query;
    const results = await advancedSearchService.advancedFilterSearch(filters);

    return ok(res, results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Save search endpoint
const saveSearch = async (req, res) => {
  try {
    const { searchCriteria, searchName } = req.body;
    const userId = req.user.id;

    if (!searchCriteria || !searchName) {
      return badRequest(res, 'Search criteria and search name are required');
    }

    const result = await advancedSearchService.saveSearch(userId, searchCriteria, searchName);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get saved searches endpoint
const getSavedSearches = async (req, res) => {
  try {
    const userId = req.user.id;
    const savedSearches = await advancedSearchService.getSavedSearches(userId);

    return ok(res, {
      saved_searches: savedSearches,
      count: savedSearches.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Execute saved search endpoint
const executeSavedSearch = async (req, res) => {
  try {
    const { savedSearchId } = req.params;
    const userId = req.user.id;

    const results = await advancedSearchService.executeSavedSearch(savedSearchId, userId);

    return ok(res, results);
  } catch (error) {
    if (error.message.includes('not found')) {
      return notFound(res, error.message);
    }
    return res.status(500).json({ error: error.message });
  }
};

// Get search suggestions endpoint
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return ok(res, { suggestions: [] });
    }

    // Get brand suggestions
    const brandQuery = `
      SELECT DISTINCT brand, COUNT(*) as count
      FROM cars 
      WHERE brand LIKE ? AND status = 'active'
      GROUP BY brand
      ORDER BY count DESC
      LIMIT 5
    `;

    const { executeQuery } = require('../../config/database');
    const brandSuggestions = await executeQuery(brandQuery, [`%${q}%`]);

    // Get model suggestions
    const modelQuery = `
      SELECT DISTINCT model, COUNT(*) as count
      FROM cars 
      WHERE model LIKE ? AND status = 'active'
      GROUP BY model
      ORDER BY count DESC
      LIMIT 5
    `;

    const modelSuggestions = await executeQuery(modelQuery, [`%${q}%`]);

    // Get location suggestions
    const locationQuery = `
      SELECT DISTINCT location, COUNT(*) as count
      FROM cars 
      WHERE location LIKE ? AND status = 'active'
      GROUP BY location
      ORDER BY count DESC
      LIMIT 5
    `;

    const locationSuggestions = await executeQuery(locationQuery, [`%${q}%`]);

    const suggestions = [
      ...brandSuggestions.map(b => ({ type: 'brand', value: b.brand, count: b.count })),
      ...modelSuggestions.map(m => ({ type: 'model', value: m.model, count: m.count })),
      ...locationSuggestions.map(l => ({ type: 'location', value: l.location, count: l.count }))
    ].sort((a, b) => b.count - a.count).slice(0, 10);

    return ok(res, {
      query: q,
      suggestions,
      count: suggestions.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get search analytics endpoint (Admin only)
const getSearchAnalytics = async (req, res) => {
  try {
    const { period = '7d', limit = 100 } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 7;

    const query = `
      SELECT 
        search_type,
        COUNT(*) as total_searches,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(results_count) as avg_results,
        COUNT(CASE WHEN results_count > 0 THEN 1 END) as successful_searches,
        COUNT(CASE WHEN results_count > 0 THEN 1 END) / COUNT(*) as success_rate
      FROM search_analytics 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY search_type
      ORDER BY total_searches DESC
      LIMIT ?
    `;

    const { executeQuery } = require('../../config/database');
    const analytics = await executeQuery(query, [days, limit]);

    // Get popular search terms
    const popularTermsQuery = `
      SELECT 
        search_query,
        COUNT(*) as search_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM search_analytics 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND search_type = 'text'
      GROUP BY search_query
      ORDER BY search_count DESC
      LIMIT 20
    `;

    const popularTerms = await executeQuery(popularTermsQuery, [days]);

    return ok(res, {
      period,
      search_types: analytics,
      popular_terms: popularTerms,
      summary: {
        total_search_types: analytics.length,
        most_popular_type: analytics[0] || null
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get search filters options endpoint
const getSearchFilterOptions = async (req, res) => {
  try {
    const { executeQuery } = require('../../config/database');

    // Helper function to execute query with timeout and fallback
    const executeQueryWithTimeout = async (query, timeout = 5000) => {
      try {
        return await Promise.race([
          executeQuery(query),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), timeout)
          )
        ]);
      } catch (error) {
        console.warn(`Query failed: ${error.message}`);
        return []; // Return empty array as fallback
      }
    };

    // Get all available brands
    const brandsQuery = `
      SELECT DISTINCT brand, COUNT(*) as count
      FROM cars 
      WHERE status = 'active'
      GROUP BY brand
      ORDER BY brand ASC
      LIMIT 50
    `;

    // Get all available models
    const modelsQuery = `
      SELECT DISTINCT model, COUNT(*) as count
      FROM cars 
      WHERE status = 'active'
      GROUP BY model
      ORDER BY model ASC
      LIMIT 50
    `;

    // Get price range
    const priceRangeQuery = `
      SELECT 
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price
      FROM cars 
      WHERE status = 'active'
    `;

    // Get year range
    const yearRangeQuery = `
      SELECT 
        MIN(year) as min_year,
        MAX(year) as max_year
      FROM cars 
      WHERE status = 'active'
    `;

    // Get fuel types
    const fuelTypesQuery = `
      SELECT DISTINCT fuel_type, COUNT(*) as count
      FROM cars 
      WHERE status = 'active'
      GROUP BY fuel_type
      ORDER BY count DESC
      LIMIT 20
    `;

    // Get transmissions
    const transmissionsQuery = `
      SELECT DISTINCT transmission, COUNT(*) as count
      FROM cars 
      WHERE status = 'active'
      GROUP BY transmission
      ORDER BY count DESC
      LIMIT 20
    `;

    // Get body types
    const bodyTypesQuery = `
      SELECT DISTINCT body_type, COUNT(*) as count
      FROM cars 
      WHERE status = 'active'
      GROUP BY body_type
      ORDER BY count DESC
      LIMIT 20
    `;

    // Get car conditions
    const conditionsQuery = `
      SELECT DISTINCT car_condition, COUNT(*) as count
      FROM cars 
      WHERE status = 'active'
      GROUP BY car_condition
      ORDER BY count DESC
      LIMIT 20
    `;

    // Get colors
    const colorsQuery = `
      SELECT DISTINCT color, COUNT(*) as count
      FROM cars 
      WHERE status = 'active'
      GROUP BY color
      ORDER BY count DESC
      LIMIT 20
    `;

    // Execute queries with individual timeouts and error handling
    const [
      brands,
      models,
      priceRange,
      yearRange,
      fuelTypes,
      transmissions,
      bodyTypes,
      conditions,
      colors
    ] = await Promise.allSettled([
      executeQueryWithTimeout(brandsQuery),
      executeQueryWithTimeout(modelsQuery),
      executeQueryWithTimeout(priceRangeQuery),
      executeQueryWithTimeout(yearRangeQuery),
      executeQueryWithTimeout(fuelTypesQuery),
      executeQueryWithTimeout(transmissionsQuery),
      executeQueryWithTimeout(bodyTypesQuery),
      executeQueryWithTimeout(conditionsQuery),
      executeQueryWithTimeout(colorsQuery)
    ]);

    // Extract results, using fallback values for failed queries
    const getResult = (result) => result.status === 'fulfilled' ? result.value : [];
    const getFirstResult = (result) => result.status === 'fulfilled' && result.value.length > 0 ? result.value[0] : {};

    return ok(res, {
      brands: getResult(brands),
      models: getResult(models),
      price_range: getFirstResult(priceRange),
      year_range: getFirstResult(yearRange),
      fuel_types: getResult(fuelTypes),
      transmissions: getResult(transmissions),
      body_types: getResult(bodyTypes),
      car_conditions: getResult(conditions),
      colors: getResult(colors)
    });
  } catch (error) {
    console.error('Error in getSearchFilterOptions:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  visualSearch,
  voiceSearch,
  semanticSearch,
  advancedFilterSearch,
  saveSearch,
  getSavedSearches,
  executeSavedSearch,
  getSearchSuggestions,
  getSearchAnalytics,
  getSearchFilterOptions
};
