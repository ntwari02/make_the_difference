const { body, param, query } = require('express-validator');

const validateVisaOfficer = {
  getApplications: [
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
      .isIn(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled'])
      .withMessage('Invalid status'),
    
    query('country')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Country must be between 2 and 100 characters'),
    
    query('visa_type')
      .optional()
      .isIn(['tourist', 'student', 'work', 'business', 'transit', 'family', 'refugee', 'other'])
      .withMessage('Invalid visa type'),
    
    query('submitted_from')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format for submitted_from'),
    
    query('submitted_to')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format for submitted_to'),
    
    query('reviewed_by')
      .optional()
      .isUUID()
      .withMessage('Invalid reviewer ID')
  ],

  reviewApplication: [
    param('applicationId')
      .isUUID()
      .withMessage('Valid application ID is required'),
    
    body('status')
      .isIn(['approved', 'rejected', 'under_review'])
      .withMessage('Invalid status'),
    
    body('comments')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comments must be between 1 and 1000 characters'),
    
    body('required_actions')
      .optional()
      .isArray()
      .withMessage('Required actions must be an array')
  ],

  requestDocuments: [
    param('applicationId')
      .isUUID()
      .withMessage('Valid application ID is required'),
    
    body('required_documents')
      .isArray({ min: 1 })
      .withMessage('Required documents must be a non-empty array'),
    
    body('required_documents.*')
      .isLength({ min: 1, max: 255 })
      .withMessage('Each required document must be between 1 and 255 characters'),
    
    body('deadline')
      .isISO8601()
      .withMessage('Valid deadline date is required'),
    
    body('message')
      .optional()
      .isLength({ min: 1, max: 500 })
      .withMessage('Message must be between 1 and 500 characters')
  ],

  approveApplication: [
    param('applicationId')
      .isUUID()
      .withMessage('Valid application ID is required'),
    
    body('approval_details')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Approval details must be between 1 and 1000 characters'),
    
    body('validity_period')
      .isLength({ min: 1, max: 100 })
      .withMessage('Validity period must be between 1 and 100 characters'),
    
    body('conditions')
      .optional()
      .isArray()
      .withMessage('Conditions must be an array')
  ],

  rejectApplication: [
    param('applicationId')
      .isUUID()
      .withMessage('Valid application ID is required'),
    
    body('rejection_reason')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Rejection reason must be between 1 and 1000 characters'),
    
    body('rejection_code')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Rejection code must be between 1 and 50 characters'),
    
    body('appeal_instructions')
      .optional()
      .isLength({ min: 1, max: 500 })
      .withMessage('Appeal instructions must be between 1 and 500 characters')
  ],

  addNotes: [
    param('applicationId')
      .isUUID()
      .withMessage('Valid application ID is required'),
    
    body('notes')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Notes must be between 1 and 1000 characters'),
    
    body('is_internal')
      .optional()
      .isBoolean()
      .withMessage('is_internal must be a boolean')
  ],

  bulkUpdate: [
    body('application_ids')
      .isArray({ min: 1 })
      .withMessage('Application IDs must be a non-empty array'),
    
    body('application_ids.*')
      .isUUID()
      .withMessage('Each application ID must be valid'),
    
    body('status')
      .isIn(['approved', 'rejected', 'under_review'])
      .withMessage('Invalid status'),
    
    body('comments')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comments must be between 1 and 1000 characters')
  ]
};

const validateVisaOfficerQuery = [
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
    .isIn(['normal', 'urgent', 'oldest'])
    .withMessage('Invalid priority'),
  
  query('format')
    .optional()
    .isIn(['csv', 'json'])
    .withMessage('Invalid export format')
];

module.exports = {
  validateVisaOfficer,
  validateVisaOfficerQuery
};
