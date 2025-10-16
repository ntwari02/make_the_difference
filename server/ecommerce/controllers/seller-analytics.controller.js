const { ok, badRequest } = require('../../utils/response');
const sellerAnalyticsService = require('../services/seller-analytics.service');

// Get seller statistics (KPIs for dashboard)
const getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const stats = await sellerAnalyticsService.getSellerStats(sellerId);
    return ok(res, stats);
  } catch (error) {
    console.error('Error in getSellerStats:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get detailed seller analytics with filters
const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const filters = req.query;
    const analytics = await sellerAnalyticsService.getSellerAnalytics(sellerId, filters);
    return ok(res, analytics);
  } catch (error) {
    console.error('Error in getSellerAnalytics:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSellerStats,
  getSellerAnalytics,
};
