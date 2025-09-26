const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const competitiveFeaturesController = require('../controllers/competitive-features.controller');
const competitiveFeaturesValidators = require('../validators/competitive-features.validators');

const router = express.Router();

// Validation middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return next();
};

// ========== ONE-CLICK APPLY ROUTES ==========

// One-click apply to multiple scholarships
router.post('/one-click-apply',
  authenticate,
  authorizeRoles('student'),
  competitiveFeaturesValidators.validateOneClickApply,
  handleValidation,
  competitiveFeaturesController.oneClickApply
);

// Bulk apply to recommended scholarships
router.post('/bulk-apply-recommendations',
  authenticate,
  authorizeRoles('student'),
  competitiveFeaturesController.bulkApplyToRecommendations
);

// ========== SMART NOTIFICATIONS ROUTES ==========

// Get user notifications
router.get('/notifications',
  authenticate,
  competitiveFeaturesController.getUserNotifications
);

// Mark notification as read
router.put('/notifications/:notificationId/read',
  authenticate,
  competitiveFeaturesValidators.validateNotificationId,
  handleValidation,
  competitiveFeaturesController.markNotificationAsRead
);

// Process all notifications (admin)
router.post('/notifications/process-all',
  authenticate,
  authorizeRoles('admin'),
  competitiveFeaturesController.processAllNotifications
);

// ========== GAMIFICATION ROUTES ==========

// Get user dashboard
router.get('/dashboard',
  authenticate,
  competitiveFeaturesController.getUserDashboard
);

// Get leaderboard
router.get('/leaderboard',
  competitiveFeaturesController.getLeaderboard
);

// Check achievements
router.post('/achievements/check',
  authenticate,
  authorizeRoles('student'),
  competitiveFeaturesController.checkAchievements
);

// Award points (admin)
router.post('/points/award',
  authenticate,
  authorizeRoles('admin'),
  competitiveFeaturesValidators.validateAwardPoints,
  handleValidation,
  competitiveFeaturesController.awardPoints
);

// ========== SOCIAL FEATURES ROUTES ==========

// Create community post
router.post('/community/posts',
  authenticate,
  authorizeRoles('student'),
  competitiveFeaturesValidators.validateCreatePost,
  handleValidation,
  competitiveFeaturesController.createPost
);

// Get community posts
router.get('/community/posts',
  competitiveFeaturesController.getPosts
);

// Like a post
router.post('/community/posts/:postId/like',
  authenticate,
  authorizeRoles('student'),
  competitiveFeaturesValidators.validatePostId,
  handleValidation,
  competitiveFeaturesController.likePost
);

// Add comment to post
router.post('/community/posts/:postId/comments',
  authenticate,
  authorizeRoles('student'),
  competitiveFeaturesValidators.validatePostId,
  competitiveFeaturesValidators.validateAddComment,
  handleValidation,
  competitiveFeaturesController.addComment
);

// Get user feed
router.get('/community/feed',
  authenticate,
  authorizeRoles('student'),
  competitiveFeaturesController.getUserFeed
);

// Follow user
router.post('/community/users/:userId/follow',
  authenticate,
  authorizeRoles('student'),
  competitiveFeaturesValidators.validateUserId,
  handleValidation,
  competitiveFeaturesController.followUser
);

// Get success stories
router.get('/community/success-stories',
  competitiveFeaturesController.getSuccessStories
);

// ========== ANALYTICS ROUTES ==========

// Get dashboard analytics
router.get('/analytics/dashboard',
  authenticate,
  competitiveFeaturesController.getDashboardAnalytics
);

// Get user analytics
router.get('/analytics/user',
  authenticate,
  authorizeRoles('student'),
  competitiveFeaturesController.getUserAnalytics
);

// Get provider analytics
router.get('/analytics/provider',
  authenticate,
  authorizeRoles('university', 'admin'),
  competitiveFeaturesController.getProviderAnalytics
);

// Get performance insights
router.get('/analytics/insights',
  authenticate,
  authorizeRoles('admin'),
  competitiveFeaturesController.getPerformanceInsights
);

// Export analytics data
router.get('/analytics/export',
  authenticate,
  authorizeRoles('admin'),
  competitiveFeaturesController.exportAnalyticsData
);

module.exports = router;
