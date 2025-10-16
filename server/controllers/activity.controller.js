const { ok, badRequest } = require('../utils/response');
const activityService = require('../services/activity.service');

// Get user activities
const getActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;
    const result = await activityService.getUserActivities(userId, filters);
    return ok(res, result);
  } catch (error) {
    console.error('Error in getActivities:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get seller activities (for seller dashboard)
const getSellerActivities = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const filters = req.query;
    const result = await activityService.getSellerActivities(sellerId, filters);
    return ok(res, result);
  } catch (error) {
    console.error('Error in getSellerActivities:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get activity summary
const getActivitySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || '7d';
    const summary = await activityService.getActivitySummary(userId, period);
    return ok(res, summary);
  } catch (error) {
    console.error('Error in getActivitySummary:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Log activity (for tracking user actions)
const logActivity = async (req, res) => {
  try {
    const activityData = {
      ...req.body,
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      session_id: req.sessionID
    };
    
    const activity = await activityService.logActivity(activityData);
    return ok(res, activity);
  } catch (error) {
    console.error('Error in logActivity:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getActivities,
  getSellerActivities,
  getActivitySummary,
  logActivity,
};
