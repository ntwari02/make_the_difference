const { ok, notFound, badRequest } = require('../../utils/response');
const recommendationsService = require('../services/recommendations.service');

// Get similar cars for a specific car
const getSimilarCars = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    const userId = req.user?.id;

    const similarCars = await recommendationsService.getSimilarCars(
      id, 
      userId, 
      parseInt(limit)
    );

    if (similarCars.length === 0) {
      return ok(res, { 
        message: 'No similar cars found',
        recommendations: []
      });
    }

    return ok(res, {
      car_id: id,
      recommendations: similarCars,
      count: similarCars.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get personalized recommendations for a user
const getUserRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, algorithm = 'hybrid' } = req.query;

    let recommendations = [];

    switch (algorithm) {
      case 'collaborative':
        recommendations = await recommendationsService.getCollaborativeRecommendations(
          id, 
          parseInt(limit)
        );
        break;
      case 'content_based':
        recommendations = await recommendationsService.getContentBasedRecommendations(
          req.query.car_id, 
          parseInt(limit)
        );
        break;
      case 'hybrid':
        recommendations = await recommendationsService.getHybridRecommendations(
          id, 
          req.query.car_id, 
          parseInt(limit)
        );
        break;
      case 'trending':
        recommendations = await recommendationsService.getTrendingCars(
          parseInt(limit),
          parseInt(req.query.days || 7)
        );
        break;
      case 'price_based':
        if (!req.query.car_id) {
          return badRequest(res, 'car_id is required for price-based recommendations');
        }
        recommendations = await recommendationsService.getPriceBasedRecommendations(
          req.query.car_id,
          parseFloat(req.query.price_range || 0.2),
          parseInt(limit)
        );
        break;
      default:
        return badRequest(res, 'Invalid algorithm type');
    }

    return ok(res, {
      user_id: id,
      algorithm,
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get trending cars
const getTrendingCars = async (req, res) => {
  try {
    const { limit = 10, days = 7 } = req.query;

    const trendingCars = await recommendationsService.getTrendingCars(
      parseInt(limit),
      parseInt(days)
    );

    return ok(res, {
      period: `${days} days`,
      trending_cars: trendingCars,
      count: trendingCars.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Track user behavior for recommendations
const trackUserBehavior = async (req, res) => {
  try {
    const { carId, action } = req.body;
    const userId = req.user.id;
    const metadata = req.body.metadata || {};

    if (!carId || !action) {
      return badRequest(res, 'carId and action are required');
    }

    const validActions = ['view', 'favorite', 'unfavorite', 'share', 'contact', 'purchase'];
    if (!validActions.includes(action)) {
      return badRequest(res, 'Invalid action type');
    }

    await recommendationsService.trackUserBehavior(
      userId,
      carId,
      action,
      {
        ...metadata,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      }
    );

    return ok(res, { 
      message: 'User behavior tracked successfully',
      user_id: userId,
      car_id: carId,
      action
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Mark recommendation as clicked
const markRecommendationClicked = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const userId = req.user.id;

    const query = `
      UPDATE car_recommendations 
      SET clicked = TRUE, clicked_at = NOW()
      WHERE id = ? AND user_id = ?
    `;

    const { executeQuery } = require('../../config/database');
    const result = await executeQuery(query, [recommendationId, userId]);

    if (result.affectedRows === 0) {
      return notFound(res, 'Recommendation not found');
    }

    return ok(res, { 
      message: 'Recommendation marked as clicked',
      recommendation_id: recommendationId
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get recommendation analytics (Admin only)
const getRecommendationAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    const analytics = await recommendationsService.getRecommendationAnalytics(period);

    return ok(res, {
      period,
      analytics,
      summary: {
        total_algorithms: analytics.length,
        best_performing: analytics.reduce((best, current) => 
          current.click_rate > best.click_rate ? current : best, 
          { click_rate: 0 }
        )
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get user preferences for recommendations
const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT * FROM user_preferences WHERE user_id = ?
    `;

    const { executeQuery } = require('../../config/database');
    const preferences = await executeQuery(query, [userId]);

    if (preferences.length === 0) {
      return notFound(res, 'User preferences not found');
    }

    return ok(res, preferences[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update user preferences for recommendations
const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    const query = `
      INSERT INTO user_preferences 
      (user_id, preferred_brands, preferred_models, preferred_price_range, 
       preferred_years, preferred_fuel_types, preferred_transmissions, 
       preferred_body_types, preferred_locations, excluded_brands, excluded_models)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        preferred_brands = VALUES(preferred_brands),
        preferred_models = VALUES(preferred_models),
        preferred_price_range = VALUES(preferred_price_range),
        preferred_years = VALUES(preferred_years),
        preferred_fuel_types = VALUES(preferred_fuel_types),
        preferred_transmissions = VALUES(preferred_transmissions),
        preferred_body_types = VALUES(preferred_body_types),
        preferred_locations = VALUES(preferred_locations),
        excluded_brands = VALUES(excluded_brands),
        excluded_models = VALUES(excluded_models),
        updated_at = NOW()
    `;

    const { executeQuery } = require('../../config/database');
    await executeQuery(query, [
      userId,
      JSON.stringify(preferences.preferred_brands || []),
      JSON.stringify(preferences.preferred_models || []),
      JSON.stringify(preferences.preferred_price_range || {}),
      JSON.stringify(preferences.preferred_years || {}),
      JSON.stringify(preferences.preferred_fuel_types || []),
      JSON.stringify(preferences.preferred_transmissions || []),
      JSON.stringify(preferences.preferred_body_types || []),
      JSON.stringify(preferences.preferred_locations || []),
      JSON.stringify(preferences.excluded_brands || []),
      JSON.stringify(preferences.excluded_models || [])
    ]);

    return ok(res, { 
      message: 'User preferences updated successfully',
      preferences
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get user behavior history
const getUserBehaviorHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, action } = req.query;

    let query = `
      SELECT 
        ubt.*,
        c.title as car_title,
        c.brand,
        c.model,
        c.year,
        c.price
      FROM user_behavior_tracking ubt
      JOIN cars c ON ubt.car_id = c.id
      WHERE ubt.user_id = ?
    `;

    const params = [userId];

    if (action) {
      query += ' AND ubt.action = ?';
      params.push(action);
    }

    query += ' ORDER BY ubt.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const { executeQuery } = require('../../config/database');
    const behaviorHistory = await executeQuery(query, params);

    return ok(res, {
      user_id: userId,
      behavior_history: behaviorHistory,
      count: behaviorHistory.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSimilarCars,
  getUserRecommendations,
  getTrendingCars,
  trackUserBehavior,
  markRecommendationClicked,
  getRecommendationAnalytics,
  getUserPreferences,
  updateUserPreferences,
  getUserBehaviorHistory
};

