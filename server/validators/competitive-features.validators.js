const { body, param, query } = require('express-validator');

const competitiveFeaturesValidators = {
  // Validate one-click apply
  validateOneClickApply: [
    body('scholarshipIds').isArray({ min: 1 }).withMessage('At least one scholarship ID is required'),
    body('scholarshipIds.*').isUUID().withMessage('Invalid scholarship ID format'),
    body('options.submitImmediately').optional().isBoolean().withMessage('Submit immediately must be boolean'),
    body('options.customMotivation').optional().isLength({ min: 10, max: 1000 }).withMessage('Custom motivation must be 10-1000 characters'),
    body('options.customCareerGoals').optional().isLength({ min: 10, max: 500 }).withMessage('Custom career goals must be 10-500 characters'),
    body('options.financialNeed').optional().isObject().withMessage('Financial need must be an object'),
    body('options.additionalInfo').optional().isObject().withMessage('Additional info must be an object')
  ],

  // Validate notification ID
  validateNotificationId: [
    param('notificationId').isInt({ min: 1 }).withMessage('Invalid notification ID format')
  ],

  // Validate award points
  validateAwardPoints: [
    body('userId').isUUID().withMessage('Invalid user ID format'),
    body('points').isInt({ min: 1, max: 10000 }).withMessage('Points must be between 1 and 10000'),
    body('reason').notEmpty().isLength({ min: 5, max: 200 }).withMessage('Reason must be 5-200 characters'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object')
  ],

  // Validate create post
  validateCreatePost: [
    body('type').isIn(['scholarship_tip', 'success_story', 'question', 'resource', 'celebration']).withMessage('Invalid post type'),
    body('title').notEmpty().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('content').notEmpty().isLength({ min: 20, max: 2000 }).withMessage('Content must be 20-2000 characters'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('tags.*').optional().isLength({ min: 2, max: 50 }).withMessage('Each tag must be 2-50 characters'),
    body('is_anonymous').optional().isBoolean().withMessage('Anonymous flag must be boolean'),
    body('scholarship_id').optional().isUUID().withMessage('Invalid scholarship ID format'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array')
  ],

  // Validate post ID
  validatePostId: [
    param('postId').isInt({ min: 1 }).withMessage('Invalid post ID format')
  ],

  // Validate add comment
  validateAddComment: [
    body('content').notEmpty().isLength({ min: 5, max: 500 }).withMessage('Comment content must be 5-500 characters'),
    body('parentId').optional().isInt({ min: 1 }).withMessage('Invalid parent comment ID format')
  ],

  // Validate user ID
  validateUserId: [
    param('userId').isUUID().withMessage('Invalid user ID format')
  ],

  // Validate analytics filters
  validateAnalyticsFilters: [
    query('timeframe').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid timeframe'),
    query('format').optional().isIn(['json', 'csv']).withMessage('Invalid export format'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
  ],

  // Validate notification filters
  validateNotificationFilters: [
    query('type').optional().isIn(['deadline_reminder', 'new_match', 'status_update', 'document_request', 'interview_scheduled', 'award_announcement', 'payment_reminder', 'opportunity_alert']).withMessage('Invalid notification type'),
    query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
    query('read').optional().isBoolean().withMessage('Read filter must be boolean'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  // Validate gamification filters
  validateGamificationFilters: [
    query('timeframe').optional().isIn(['all', 'week', 'month']).withMessage('Invalid timeframe'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  // Validate social features filters
  validateSocialFilters: [
    query('type').optional().isIn(['scholarship_tip', 'success_story', 'question', 'resource', 'celebration']).withMessage('Invalid post type'),
    query('user_id').optional().isUUID().withMessage('Invalid user ID format'),
    query('scholarship_id').optional().isUUID().withMessage('Invalid scholarship ID format'),
    query('tags').optional().isString().withMessage('Tags must be a comma-separated string'),
    query('search').optional().isLength({ min: 2, max: 100 }).withMessage('Search term must be 2-100 characters'),
    query('sort_by').optional().isIn(['trending', 'recent', 'popular']).withMessage('Invalid sort option'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
  ],

  // Validate content report
  validateContentReport: [
    body('contentType').isIn(['post', 'comment', 'user']).withMessage('Invalid content type'),
    body('contentId').notEmpty().withMessage('Content ID is required'),
    body('reason').isIn(['spam', 'harassment', 'inappropriate', 'fake', 'other']).withMessage('Invalid report reason'),
    body('description').optional().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters')
  ],

  // Validate achievement data
  validateAchievementData: [
    body('achievementId').isIn(['first_application', 'applied_5', 'applied_10', 'applied_25', 'first_acceptance', 'perfect_match', 'early_bird', 'document_master', 'profile_complete', 'scholarship_guru']).withMessage('Invalid achievement ID'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object')
  ],

  // Validate leaderboard filters
  validateLeaderboardFilters: [
    query('timeframe').optional().isIn(['all', 'week', 'month']).withMessage('Invalid timeframe'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('country').optional().isLength({ min: 2, max: 100 }).withMessage('Country must be 2-100 characters')
  ],

  // Validate feed filters
  validateFeedFilters: [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('type').optional().isIn(['all', 'following', 'trending']).withMessage('Invalid feed type')
  ],

  // Validate success story filters
  validateSuccessStoryFilters: [
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
    query('country').optional().isLength({ min: 2, max: 100 }).withMessage('Country must be 2-100 characters'),
    query('scholarship_type').optional().isIn(['merit_based', 'need_based', 'athletic', 'artistic']).withMessage('Invalid scholarship type')
  ]
};

module.exports = competitiveFeaturesValidators;
