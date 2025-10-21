const express = require('express');
const router = express.Router();
const sparePartsAnalyticsService = require('../services/spare-parts-analytics.service');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');

// ==================== SELLER DASHBOARD ANALYTICS ====================

// Get seller dashboard overview
router.get('/seller/:sellerId/dashboard', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const { start_date, end_date, period = '30d' } = req.query;

    let dashboard;
    if (period) {
      dashboard = await sparePartsAnalyticsService.getAnalyticsSummary(sellerId, period);
    } else {
      dashboard = await sparePartsAnalyticsService.getSellerDashboardOverview(sellerId, {
        start_date,
        end_date
      });
    }

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get seller basic stats
router.get('/seller/:sellerId/stats', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const { start_date, end_date } = req.query;

    const stats = await sparePartsAnalyticsService.getSellerBasicStats(sellerId, {
      start_date,
      end_date
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get inventory analytics
router.get('/seller/:sellerId/inventory-analytics', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const { start_date, end_date } = req.query;

    const analytics = await sparePartsAnalyticsService.getInventoryAnalytics(sellerId, {
      start_date,
      end_date
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get sales analytics
router.get('/seller/:sellerId/sales-analytics', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const { start_date, end_date } = req.query;

    const analytics = await sparePartsAnalyticsService.getSalesAnalytics(sellerId, {
      start_date,
      end_date
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get performance metrics
router.get('/seller/:sellerId/performance-metrics', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const { start_date, end_date } = req.query;

    const metrics = await sparePartsAnalyticsService.getPerformanceMetrics(sellerId, {
      start_date,
      end_date
    });

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get trending data
router.get('/seller/:sellerId/trending', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const { start_date, end_date } = req.query;

    const trending = await sparePartsAnalyticsService.getTrendingData(sellerId, {
      start_date,
      end_date
    });

    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get recommendation insights
router.get('/seller/:sellerId/recommendations', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;

    const insights = await sparePartsAnalyticsService.getRecommendationInsights(sellerId);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== MARKET ANALYTICS ====================

// Get market analytics
router.get('/market/overview', async (req, res) => {
  try {
    const { category_id, brand_id, vehicle_make, price_range } = req.query;

    const analytics = await sparePartsAnalyticsService.getMarketAnalytics({
      category_id,
      brand_id,
      vehicle_make,
      price_range
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get market trends
router.get('/market/trends', async (req, res) => {
  try {
    const { period = '30d', category_id, brand_id } = req.query;

    // This would typically analyze market trends over time
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'Market trends analysis would be implemented here',
        period,
        filters: { category_id, brand_id }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get competitive analysis
router.get('/market/competitive-analysis', async (req, res) => {
  try {
    const { category_id, brand_id, vehicle_make } = req.query;

    // This would typically analyze competitor pricing, inventory, etc.
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'Competitive analysis would be implemented here',
        filters: { category_id, brand_id, vehicle_make }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== GLOBAL ANALYTICS ====================

// Get global spare parts statistics
router.get('/global/stats', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // This would typically provide global platform statistics
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'Global statistics would be implemented here',
        date_range: { start_date, end_date }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get platform performance metrics
router.get('/platform/performance', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // This would typically provide platform-wide performance metrics
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'Platform performance metrics would be implemented here',
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

// ==================== EXPORT ROUTES ====================

// Export seller analytics
router.get('/seller/:sellerId/export', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const { format = 'json', period = '30d' } = req.query;

    const analytics = await sparePartsAnalyticsService.getAnalyticsSummary(sellerId, period);

    if (format === 'csv') {
      // Convert to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="seller-analytics-${sellerId}-${period}.csv"`);
      
      // Simple CSV conversion (would be more sophisticated in production)
      res.send('Analytics data would be converted to CSV format here');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="seller-analytics-${sellerId}-${period}.json"`);
      res.json(analytics);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Export market analytics
router.get('/market/export', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { format = 'json', category_id, brand_id } = req.query;

    const analytics = await sparePartsAnalyticsService.getMarketAnalytics({
      category_id,
      brand_id
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="market-analytics.csv"');
      res.send('Market analytics data would be converted to CSV format here');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="market-analytics.json"');
      res.json(analytics);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
