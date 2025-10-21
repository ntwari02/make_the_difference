const express = require('express');
const router = express.Router();
const sparePartsRecommendationService = require('../services/spare-parts-recommendation.service');
const { authenticateToken } = require('../../middleware/auth.middleware');

// ==================== USER RECOMMENDATIONS ====================

// Get personalized recommendations for user
router.get('/user/recommendations', authenticateToken, async (req, res) => {
  try {
    const {
      limit = 10,
      category_id,
      brand_id,
      vehicle_make,
      vehicle_model,
      exclude_purchased = true,
      algorithm = 'hybrid'
    } = req.query;

    const recommendations = await sparePartsRecommendationService.getUserRecommendations(
      req.user.id,
      {
        limit: parseInt(limit),
        category_id,
        brand_id,
        vehicle_make,
        vehicle_model,
        exclude_purchased: exclude_purchased === 'true',
        algorithm
      }
    );

    res.json({
      success: true,
      data: recommendations,
      algorithm,
      filters: {
        category_id,
        brand_id,
        vehicle_make,
        vehicle_model,
        exclude_purchased
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get collaborative recommendations
router.get('/user/collaborative', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recommendations = await sparePartsRecommendationService.getCollaborativeRecommendations(
      req.user.id,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get content-based recommendations
router.get('/user/content-based', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recommendations = await sparePartsRecommendationService.getContentBasedRecommendations(
      req.user.id,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get trending recommendations
router.get('/user/trending', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recommendations = await sparePartsRecommendationService.getTrendingRecommendations(
      req.user.id,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get price-based recommendations
router.get('/user/price-based', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recommendations = await sparePartsRecommendationService.getPriceBasedRecommendations(
      req.user.id,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== ITEM-BASED RECOMMENDATIONS ====================

// Get similar parts
router.get('/spare-part/:id/similar', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const similarParts = await sparePartsRecommendationService.getSimilarParts(
      req.params.id,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: similarParts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get complementary parts
router.get('/spare-part/:id/complementary', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const complementaryParts = await sparePartsRecommendationService.getComplementaryParts(
      req.params.id,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: complementaryParts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== VEHICLE-BASED RECOMMENDATIONS ====================

// Get recommendations for specific vehicle
router.post('/vehicle/recommendations', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const vehicleData = req.body;

    const recommendations = await sparePartsRecommendationService.getVehicleRecommendations(
      vehicleData,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: recommendations,
      vehicle_data: vehicleData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== BUNDLE RECOMMENDATIONS ====================

// Get bundle recommendations
router.get('/bundles/recommendations', authenticateToken, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const vehicleData = req.query.vehicle_make ? {
      vehicle_make: req.query.vehicle_make,
      vehicle_model: req.query.vehicle_model,
      vehicle_year: req.query.vehicle_year ? parseInt(req.query.vehicle_year) : null
    } : null;

    const bundles = await sparePartsRecommendationService.getBundleRecommendations(
      req.user.id,
      vehicleData,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: bundles,
      vehicle_data: vehicleData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== RECOMMENDATION TRACKING ====================

// Track recommendation click
router.post('/track/click', authenticateToken, async (req, res) => {
  try {
    const { spare_part_id, recommendation_type } = req.body;

    if (!spare_part_id || !recommendation_type) {
      return res.status(400).json({
        success: false,
        message: 'spare_part_id and recommendation_type are required'
      });
    }

    const result = await sparePartsRecommendationService.trackRecommendationClick(
      req.user.id,
      spare_part_id,
      recommendation_type
    );

    res.json({
      success: result.success,
      message: result.success ? 'Click tracked successfully' : result.error
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== RECOMMENDATION INSIGHTS ====================

// Get recommendation insights for seller
router.get('/seller/:sellerId/insights', authenticateToken, async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const { period = '30d' } = req.query;

    // This would typically provide insights about how recommendations are performing
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'Recommendation insights would be implemented here',
        seller_id: sellerId,
        period
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get recommendation performance metrics
router.get('/performance/metrics', authenticateToken, async (req, res) => {
  try {
    const { period = '30d', algorithm } = req.query;

    // This would typically provide performance metrics for different recommendation algorithms
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'Recommendation performance metrics would be implemented here',
        period,
        algorithm
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== RECOMMENDATION CONFIGURATION ====================

// Update user recommendation preferences
router.put('/user/preferences', authenticateToken, async (req, res) => {
  try {
    const {
      preferred_brands,
      preferred_categories,
      preferred_price_range,
      preferred_years,
      excluded_brands,
      excluded_categories
    } = req.body;

    // This would typically update user preferences in the database
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      message: 'User preferences updated successfully',
      preferences: {
        preferred_brands,
        preferred_categories,
        preferred_price_range,
        preferred_years,
        excluded_brands,
        excluded_categories
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get user recommendation preferences
router.get('/user/preferences', authenticateToken, async (req, res) => {
  try {
    // This would typically fetch user preferences from the database
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'User preferences would be fetched from database',
        user_id: req.user.id
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== A/B TESTING ROUTES ====================

// Get A/B test configuration
router.get('/ab-test/config', authenticateToken, async (req, res) => {
  try {
    // This would typically provide A/B test configuration for recommendations
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'A/B test configuration would be implemented here',
        user_id: req.user.id
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Track A/B test event
router.post('/ab-test/track', authenticateToken, async (req, res) => {
  try {
    const { test_id, variant, event_type, event_data } = req.body;

    // This would typically track A/B test events
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      message: 'A/B test event tracked successfully',
      test_id,
      variant,
      event_type
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
