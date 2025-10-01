const { body, param, query } = require('express-validator');

const validateModerator = {
  getFlaggedContent: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('content_type')
      .optional()
      .isIn(['car', 'course', 'scholarship', 'visa_service', 'user'])
      .withMessage('Invalid content type'),
    
    query('reason')
      .optional()
      .isIn(['spam', 'inappropriate', 'fraud', 'copyright', 'harassment', 'other'])
      .withMessage('Invalid reason'),
    
    query('priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    
    query('flagged_from')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format for flagged_from'),
    
    query('flagged_to')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format for flagged_to')
  ],

  moderateContent: [
    param('contentId')
      .isUUID()
      .withMessage('Valid content ID is required'),
    
    param('contentType')
      .isIn(['car', 'course', 'scholarship', 'visa_service'])
      .withMessage('Invalid content type'),
    
    body('action')
      .isIn(['approved', 'rejected', 'removed', 'flagged'])
      .withMessage('Invalid action'),
    
    body('reason')
      .optional()
      .isLength({ min: 1, max: 500 })
      .withMessage('Reason must be between 1 and 500 characters'),
    
    body('notes')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Notes must be between 1 and 1000 characters')
  ],

  approveContent: [
    param('contentId')
      .isUUID()
      .withMessage('Valid content ID is required'),
    
    param('contentType')
      .isIn(['car', 'course', 'scholarship', 'visa_service'])
      .withMessage('Invalid content type'),
    
    body('notes')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Notes must be between 1 and 1000 characters')
  ],

  rejectContent: [
    param('contentId')
      .isUUID()
      .withMessage('Valid content ID is required'),
    
    param('contentType')
      .isIn(['car', 'course', 'scholarship', 'visa_service'])
      .withMessage('Invalid content type'),
    
    body('reason')
      .isLength({ min: 1, max: 500 })
      .withMessage('Reason must be between 1 and 500 characters'),
    
    body('notes')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Notes must be between 1 and 1000 characters')
  ],

  removeContent: [
    param('contentId')
      .isUUID()
      .withMessage('Valid content ID is required'),
    
    param('contentType')
      .isIn(['car', 'course', 'scholarship', 'visa_service'])
      .withMessage('Invalid content type'),
    
    body('reason')
      .isLength({ min: 1, max: 500 })
      .withMessage('Reason must be between 1 and 500 characters'),
    
    body('notify_user')
      .optional()
      .isBoolean()
      .withMessage('notify_user must be a boolean')
  ],

  flagContent: [
    param('contentId')
      .isUUID()
      .withMessage('Valid content ID is required'),
    
    param('contentType')
      .isIn(['car', 'course', 'scholarship', 'visa_service', 'user'])
      .withMessage('Invalid content type'),
    
    body('reason')
      .isIn(['spam', 'inappropriate', 'fraud', 'copyright', 'harassment', 'other'])
      .withMessage('Invalid reason'),
    
    body('description')
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be between 1 and 500 characters')
  ],

  getUserReports: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('status')
      .optional()
      .isIn(['pending', 'resolved', 'dismissed'])
      .withMessage('Invalid status'),
    
    query('reason')
      .optional()
      .isIn(['spam', 'inappropriate', 'fraud', 'harassment', 'fake_profile', 'other'])
      .withMessage('Invalid reason'),
    
    query('reported_from')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format for reported_from'),
    
    query('reported_to')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format for reported_to')
  ],

  moderateUser: [
    param('userId')
      .isUUID()
      .withMessage('Valid user ID is required'),
    
    body('action')
      .isIn(['warn', 'suspend', 'ban', 'restrict'])
      .withMessage('Invalid action'),
    
    body('reason')
      .isLength({ min: 1, max: 500 })
      .withMessage('Reason must be between 1 and 500 characters'),
    
    body('duration')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Duration must be between 1 and 100 characters')
  ],

  addNotes: [
    param('contentId')
      .isUUID()
      .withMessage('Valid content ID is required'),
    
    param('contentType')
      .isIn(['car', 'course', 'scholarship', 'visa_service'])
      .withMessage('Invalid content type'),
    
    body('notes')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Notes must be between 1 and 1000 characters'),
    
    body('is_internal')
      .optional()
      .isBoolean()
      .withMessage('is_internal must be a boolean')
  ],

  bulkModerate: [
    body('content_ids')
      .isArray({ min: 1 })
      .withMessage('Content IDs must be a non-empty array'),
    
    body('content_ids.*')
      .isUUID()
      .withMessage('Each content ID must be valid'),
    
    body('content_type')
      .isIn(['car', 'course', 'scholarship', 'visa_service'])
      .withMessage('Invalid content type'),
    
    body('action')
      .isIn(['approved', 'rejected', 'removed'])
      .withMessage('Invalid action'),
    
    body('reason')
      .optional()
      .isLength({ min: 1, max: 500 })
      .withMessage('Reason must be between 1 and 500 characters')
  ]
};

const validateModeratorQuery = [
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for start_date'),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for end_date'),
  
  query('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid period'),
  
  query('priority')
    .optional()
    .isIn(['normal', 'high', 'oldest'])
    .withMessage('Invalid priority')
];

module.exports = {
  validateModerator,
  validateModeratorQuery
};
