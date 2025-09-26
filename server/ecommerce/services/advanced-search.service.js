const { executeQuery } = require('../../config/database');
const multer = require('multer');
const path = require('path');

class AdvancedSearchService {
  constructor() {
    this.setupMulter();
  }

  setupMulter() {
    // Configure multer for image uploads
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/search-images/');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'search-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'));
        }
      }
    });
  }

  // Visual Search: Analyze uploaded car image and find similar cars
  async visualSearch(imageFile, filters = {}) {
    try {
      // Simulate image analysis (in real implementation, use ML services like Google Vision API, AWS Rekognition, or custom models)
      const imageAnalysis = await this.analyzeCarImage(imageFile);
      
      // Extract car features from image analysis
      const carFeatures = this.extractCarFeaturesFromImage(imageAnalysis);
      
      // Search for cars with similar features
      const similarCars = await this.searchByCarFeatures(carFeatures, filters);
      
      // Log search analytics
      await this.logSearchAnalytics(null, 'visual', {
        image_features: carFeatures,
        results_count: similarCars.length
      });

      return {
        search_type: 'visual',
        image_analysis: imageAnalysis,
        extracted_features: carFeatures,
        results: similarCars,
        count: similarCars.length
      };
    } catch (error) {
      console.error('Error in visual search:', error);
      throw new Error('Visual search failed: ' + error.message);
    }
  }

  // Voice Search: Convert speech to text and process natural language queries
  async voiceSearch(audioFile, filters = {}) {
    try {
      // Simulate speech-to-text conversion (in real implementation, use services like Google Speech-to-Text, AWS Transcribe, or Azure Speech)
      const transcript = await this.convertSpeechToText(audioFile);
      
      // Process natural language query
      const processedQuery = await this.processNaturalLanguageQuery(transcript);
      
      // Execute search based on processed query
      const searchResults = await this.executeProcessedQuery(processedQuery, filters);
      
      // Log search analytics
      await this.logSearchAnalytics(null, 'voice', {
        transcript,
        processed_query: processedQuery,
        results_count: searchResults.length
      });

      return {
        search_type: 'voice',
        transcript,
        processed_query: processedQuery,
        results: searchResults,
        count: searchResults.length
      };
    } catch (error) {
      console.error('Error in voice search:', error);
      throw new Error('Voice search failed: ' + error.message);
    }
  }

  // Semantic Search: Understand intent behind search queries
  async semanticSearch(query, filters = {}) {
    try {
      // Process query for semantic understanding
      const semanticQuery = await this.processSemanticQuery(query);
      
      // Execute search with semantic understanding
      const results = await this.executeSemanticQuery(semanticQuery, filters);
      
      // Log search analytics
      await this.logSearchAnalytics(null, 'semantic', {
        original_query: query,
        semantic_query: semanticQuery,
        results_count: results.length
      });

      return {
        search_type: 'semantic',
        original_query: query,
        semantic_query: semanticQuery,
        results,
        count: results.length
      };
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw new Error('Semantic search failed: ' + error.message);
    }
  }

  // Advanced Filter Search: More granular filtering options
  async advancedFilterSearch(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        brand,
        model,
        year_min,
        year_max,
        price_min,
        price_max,
        mileage_min,
        mileage_max,
        fuel_type,
        transmission,
        body_type,
        car_condition,
        color,
        location,
        features,
        safety_rating_min,
        fuel_efficiency_min,
        depreciation_rate_max,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = filters;

      let query = `
        SELECT 
          c.*,
          u.first_name as seller_first_name,
          u.last_name as seller_last_name,
          u.phone as seller_phone,
          AVG(cr.rating) as avg_rating,
          COUNT(cr.id) as review_count,
          COUNT(cf.id) as favorites_count
        FROM cars c
        LEFT JOIN users u ON c.seller_id = u.id
        LEFT JOIN car_reviews cr ON c.id = cr.car_id AND cr.status = 'approved'
        LEFT JOIN car_favorites cf ON c.id = cf.car_id
        WHERE c.status = 'active'
      `;

      const params = [];

      // Apply filters
      if (brand) {
        query += ' AND c.brand = ?';
        params.push(brand);
      }

      if (model) {
        query += ' AND c.model = ?';
        params.push(model);
      }

      if (year_min) {
        query += ' AND c.year >= ?';
        params.push(year_min);
      }

      if (year_max) {
        query += ' AND c.year <= ?';
        params.push(year_max);
      }

      if (price_min) {
        query += ' AND c.price >= ?';
        params.push(price_min);
      }

      if (price_max) {
        query += ' AND c.price <= ?';
        params.push(price_max);
      }

      if (mileage_min) {
        query += ' AND c.mileage >= ?';
        params.push(mileage_min);
      }

      if (mileage_max) {
        query += ' AND c.mileage <= ?';
        params.push(mileage_max);
      }

      if (fuel_type) {
        query += ' AND c.fuel_type = ?';
        params.push(fuel_type);
      }

      if (transmission) {
        query += ' AND c.transmission = ?';
        params.push(transmission);
      }

      if (body_type) {
        query += ' AND c.body_type = ?';
        params.push(body_type);
      }

      if (car_condition) {
        query += ' AND c.car_condition = ?';
        params.push(car_condition);
      }

      if (color) {
        query += ' AND c.color = ?';
        params.push(color);
      }

      if (location) {
        query += ' AND c.location LIKE ?';
        params.push(`%${location}%`);
      }

      if (features) {
        const featureArray = Array.isArray(features) ? features : [features];
        featureArray.forEach((feature, index) => {
          query += ` AND JSON_CONTAINS(c.features, ?)`;
          params.push(`"${feature}"`);
        });
      }

      // Group by car
      query += ' GROUP BY c.id';

      // Apply sorting
      const validSortFields = ['created_at', 'price', 'year', 'mileage', 'avg_rating', 'favorites_count'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      query += ` ORDER BY c.${sortField} ${sortDirection}`;

      // Apply pagination
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = await executeQuery(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM cars c
        WHERE c.status = 'active'
      `;
      
      const countParams = [];
      const filterConditions = query.split('WHERE')[1].split('GROUP BY')[0];
      
      // Rebuild count query with same filters
      if (brand) countParams.push(brand);
      if (model) countParams.push(model);
      if (year_min) countParams.push(year_min);
      if (year_max) countParams.push(year_max);
      if (price_min) countParams.push(price_min);
      if (price_max) countParams.push(price_max);
      if (mileage_min) countParams.push(mileage_min);
      if (mileage_max) countParams.push(mileage_max);
      if (fuel_type) countParams.push(fuel_type);
      if (transmission) countParams.push(transmission);
      if (body_type) countParams.push(body_type);
      if (car_condition) countParams.push(car_condition);
      if (color) countParams.push(color);
      if (location) countParams.push(`%${location}%`);
      if (features) {
        const featureArray = Array.isArray(features) ? features : [features];
        featureArray.forEach(feature => countParams.push(`"${feature}"`));
      }

      const countResult = await executeQuery(countQuery + filterConditions, countParams);
      const total = countResult[0].total;

      return {
        results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        filters_applied: filters
      };
    } catch (error) {
      console.error('Error in advanced filter search:', error);
      throw new Error('Advanced filter search failed: ' + error.message);
    }
  }

  // Saved Searches: Allow users to save search criteria
  async saveSearch(userId, searchCriteria, searchName) {
    try {
      const query = `
        INSERT INTO saved_searches 
        (id, user_id, search_name, search_criteria, created_at)
        VALUES (UUID(), ?, ?, ?, NOW())
      `;

      await executeQuery(query, [
        userId,
        searchName,
        JSON.stringify(searchCriteria)
      ]);

      return { message: 'Search saved successfully' };
    } catch (error) {
      console.error('Error saving search:', error);
      throw new Error('Failed to save search: ' + error.message);
    }
  }

  // Get saved searches for a user
  async getSavedSearches(userId) {
    try {
      const query = `
        SELECT * FROM saved_searches 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `;

      return await executeQuery(query, [userId]);
    } catch (error) {
      console.error('Error getting saved searches:', error);
      throw new Error('Failed to get saved searches: ' + error.message);
    }
  }

  // Execute saved search
  async executeSavedSearch(savedSearchId, userId) {
    try {
      const query = `
        SELECT * FROM saved_searches 
        WHERE id = ? AND user_id = ?
      `;

      const savedSearch = await executeQuery(query, [savedSearchId, userId]);
      
      if (savedSearch.length === 0) {
        throw new Error('Saved search not found');
      }

      const searchCriteria = JSON.parse(savedSearch[0].search_criteria);
      return await this.advancedFilterSearch(searchCriteria);
    } catch (error) {
      console.error('Error executing saved search:', error);
      throw new Error('Failed to execute saved search: ' + error.message);
    }
  }

  // Helper methods (simulated implementations)
  async analyzeCarImage(imageFile) {
    // Simulate image analysis
    return {
      detected_brand: 'Toyota',
      detected_model: 'Camry',
      detected_color: 'Silver',
      detected_body_type: 'sedan',
      confidence: 0.85,
      features_detected: ['sunroof', 'leather_seats', 'navigation']
    };
  }

  extractCarFeaturesFromImage(imageAnalysis) {
    return {
      brand: imageAnalysis.detected_brand,
      model: imageAnalysis.detected_model,
      color: imageAnalysis.detected_color,
      body_type: imageAnalysis.detected_body_type,
      features: imageAnalysis.features_detected
    };
  }

  async searchByCarFeatures(carFeatures, filters) {
    let query = `
      SELECT c.*, 
        (CASE WHEN c.brand = ? THEN 0.3 ELSE 0 END +
         CASE WHEN c.model = ? THEN 0.2 ELSE 0 END +
         CASE WHEN c.color = ? THEN 0.2 ELSE 0 END +
         CASE WHEN c.body_type = ? THEN 0.2 ELSE 0 END +
         CASE WHEN JSON_CONTAINS(c.features, ?) THEN 0.1 ELSE 0 END
        ) as similarity_score
      FROM cars c
      WHERE c.status = 'active'
      HAVING similarity_score > 0.3
      ORDER BY similarity_score DESC
      LIMIT 20
    `;

    const params = [
      carFeatures.brand,
      carFeatures.model,
      carFeatures.color,
      carFeatures.body_type,
      JSON.stringify(carFeatures.features)
    ];

    return await executeQuery(query, params);
  }

  async convertSpeechToText(audioFile) {
    // Simulate speech-to-text conversion
    return "Find red SUVs under 30000 dollars";
  }

  async processNaturalLanguageQuery(transcript) {
    // Simulate natural language processing
    const query = transcript.toLowerCase();
    
    const processedQuery = {
      keywords: [],
      filters: {},
      intent: 'search'
    };

    // Extract color
    const colors = ['red', 'blue', 'green', 'black', 'white', 'silver', 'gray'];
    const foundColor = colors.find(color => query.includes(color));
    if (foundColor) {
      processedQuery.filters.color = foundColor;
    }

    // Extract body type
    const bodyTypes = ['suv', 'sedan', 'hatchback', 'coupe', 'convertible'];
    const foundBodyType = bodyTypes.find(type => query.includes(type));
    if (foundBodyType) {
      processedQuery.filters.body_type = foundBodyType;
    }

    // Extract price
    const priceMatch = query.match(/(\d+)\s*(?:thousand|k|dollars?)/i);
    if (priceMatch) {
      const price = parseInt(priceMatch[1]) * 1000;
      processedQuery.filters.price_max = price;
    }

    return processedQuery;
  }

  async executeProcessedQuery(processedQuery, filters) {
    const searchFilters = { ...processedQuery.filters, ...filters };
    return await this.advancedFilterSearch(searchFilters);
  }

  async processSemanticQuery(query) {
    // Simulate semantic processing
    return {
      intent: 'search',
      entities: ['car', 'vehicle'],
      filters: {},
      keywords: query.split(' ')
    };
  }

  async executeSemanticQuery(semanticQuery, filters) {
    // Execute search based on semantic understanding
    return await this.advancedFilterSearch({ ...semanticQuery.filters, ...filters });
  }

  async logSearchAnalytics(userId, searchType, metadata) {
    try {
      const query = `
        INSERT INTO search_analytics 
        (id, user_id, search_query, search_type, metadata, created_at)
        VALUES (UUID(), ?, ?, ?, ?, NOW())
      `;

      await executeQuery(query, [
        userId,
        JSON.stringify(metadata),
        searchType,
        JSON.stringify(metadata)
      ]);
    } catch (error) {
      console.error('Error logging search analytics:', error);
    }
  }
}

module.exports = new AdvancedSearchService();
