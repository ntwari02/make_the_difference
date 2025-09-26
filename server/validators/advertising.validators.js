const { body, param, query } = require('express-validator');

const validateAdvertiser = {
  create: [
    body('business_name')
      .notEmpty()
      .withMessage('Business name is required')
      .isLength({ min: 2, max: 255 })
      .withMessage('Business name must be between 2 and 255 characters'),
    
    body('business_type')
      .isIn(['university', 'car_dealer', 'course_provider', 'scholarship_provider', 'general_business', 'partner'])
      .withMessage('Invalid business type'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    
    body('website_url')
      .optional()
      .isURL()
      .withMessage('Invalid website URL'),
    
    body('contact_email')
      .isEmail()
      .withMessage('Valid contact email is required'),
    
    body('contact_phone')
      .optional()
      .isMobilePhone()
      .withMessage('Invalid phone number'),
    
    body('business_address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Business address must not exceed 500 characters'),
    
    body('tax_id')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Tax ID must not exceed 100 characters'),
    
    body('payment_method')
      .optional()
      .isIn(['credit_card', 'bank_transfer', 'paypal', 'stripe'])
      .withMessage('Invalid payment method'),
    
    body('billing_address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Billing address must not exceed 500 characters')
  ],

  update: [
    body('business_name')
      .optional()
      .isLength({ min: 2, max: 255 })
      .withMessage('Business name must be between 2 and 255 characters'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    
    body('website_url')
      .optional()
      .isURL()
      .withMessage('Invalid website URL'),
    
    body('contact_email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
    
    body('contact_phone')
      .optional()
      .isMobilePhone()
      .withMessage('Invalid phone number'),
    
    body('business_address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Business address must not exceed 500 characters'),
    
    body('tax_id')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Tax ID must not exceed 100 characters'),
    
    body('payment_method')
      .optional()
      .isIn(['credit_card', 'bank_transfer', 'paypal', 'stripe'])
      .withMessage('Invalid payment method'),
    
    body('billing_address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Billing address must not exceed 500 characters')
  ]
};

const validateCampaign = {
  create: [
    body('campaign_name')
      .notEmpty()
      .withMessage('Campaign name is required')
      .isLength({ min: 2, max: 255 })
      .withMessage('Campaign name must be between 2 and 255 characters'),
    
    body('objective')
      .isIn(['awareness', 'traffic', 'leads', 'conversions', 'brand_awareness'])
      .withMessage('Invalid campaign objective'),
    
    body('budget_type')
      .isIn(['daily', 'lifetime'])
      .withMessage('Invalid budget type'),
    
    body('budget_amount')
      .isFloat({ min: 1, max: 100000 })
      .withMessage('Budget amount must be between $1 and $100,000'),
    
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    
    body('target_audience')
      .optional()
      .isObject()
      .withMessage('Target audience must be an object'),
    
    body('targeting_criteria')
      .optional()
      .isObject()
      .withMessage('Targeting criteria must be an object'),
    
    body('bid_strategy')
      .optional()
      .isIn(['manual', 'auto', 'auction'])
      .withMessage('Invalid bid strategy'),
    
    body('bid_amount')
      .optional()
      .isFloat({ min: 0.01, max: 1000 })
      .withMessage('Bid amount must be between $0.01 and $1,000')
  ],

  update: [
    body('campaign_name')
      .optional()
      .isLength({ min: 2, max: 255 })
      .withMessage('Campaign name must be between 2 and 255 characters'),
    
    body('objective')
      .optional()
      .isIn(['awareness', 'traffic', 'leads', 'conversions', 'brand_awareness'])
      .withMessage('Invalid campaign objective'),
    
    body('budget_type')
      .optional()
      .isIn(['daily', 'lifetime'])
      .withMessage('Invalid budget type'),
    
    body('budget_amount')
      .optional()
      .isFloat({ min: 1, max: 100000 })
      .withMessage('Budget amount must be between $1 and $100,000'),
    
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    
    body('target_audience')
      .optional()
      .isObject()
      .withMessage('Target audience must be an object'),
    
    body('targeting_criteria')
      .optional()
      .isObject()
      .withMessage('Targeting criteria must be an object'),
    
    body('bid_strategy')
      .optional()
      .isIn(['manual', 'auto', 'auction'])
      .withMessage('Invalid bid strategy'),
    
    body('bid_amount')
      .optional()
      .isFloat({ min: 0.01, max: 1000 })
      .withMessage('Bid amount must be between $0.01 and $1,000')
  ]
};

const validateCreative = {
  create: [
    body('creative_type')
      .isIn(['banner', 'video', 'sponsored_listing', 'email', 'sms', 'popup', 'interstitial'])
      .withMessage('Invalid creative type'),
    
    body('title')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Title must not exceed 255 characters'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    
    body('headline')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Headline must not exceed 255 characters'),
    
    body('call_to_action')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Call to action must not exceed 100 characters'),
    
    body('image_url')
      .optional()
      .isURL()
      .withMessage('Invalid image URL'),
    
    body('video_url')
      .optional()
      .isURL()
      .withMessage('Invalid video URL'),
    
    body('video_thumbnail')
      .optional()
      .isURL()
      .withMessage('Invalid video thumbnail URL'),
    
    body('landing_page_url')
      .optional()
      .isURL()
      .withMessage('Invalid landing page URL'),
    
    body('creative_assets')
      .optional()
      .isObject()
      .withMessage('Creative assets must be an object'),
    
    body('dimensions')
      .optional()
      .matches(/^\d+x\d+$/)
      .withMessage('Dimensions must be in format WIDTHxHEIGHT (e.g., 728x90)'),
    
    body('file_size')
      .optional()
      .isInt({ min: 1, max: 50000000 })
      .withMessage('File size must be between 1 and 50MB'),
    
    body('duration')
      .optional()
      .isInt({ min: 1, max: 300 })
      .withMessage('Duration must be between 1 and 300 seconds')
  ],

  update: [
    body('title')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Title must not exceed 255 characters'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    
    body('headline')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Headline must not exceed 255 characters'),
    
    body('call_to_action')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Call to action must not exceed 100 characters'),
    
    body('image_url')
      .optional()
      .isURL()
      .withMessage('Invalid image URL'),
    
    body('video_url')
      .optional()
      .isURL()
      .withMessage('Invalid video URL'),
    
    body('video_thumbnail')
      .optional()
      .isURL()
      .withMessage('Invalid video thumbnail URL'),
    
    body('landing_page_url')
      .optional()
      .isURL()
      .withMessage('Invalid landing page URL'),
    
    body('creative_assets')
      .optional()
      .isObject()
      .withMessage('Creative assets must be an object'),
    
    body('dimensions')
      .optional()
      .matches(/^\d+x\d+$/)
      .withMessage('Dimensions must be in format WIDTHxHEIGHT (e.g., 728x90)'),
    
    body('file_size')
      .optional()
      .isInt({ min: 1, max: 50000000 })
      .withMessage('File size must be between 1 and 50MB'),
    
    body('duration')
      .optional()
      .isInt({ min: 1, max: 300 })
      .withMessage('Duration must be between 1 and 300 seconds')
  ]
};

const validateAdvertiserId = [
  param('advertiserId')
    .isInt({ min: 1 })
    .withMessage('Invalid advertiser ID')
];

const validateCampaignId = [
  param('campaignId')
    .isInt({ min: 1 })
    .withMessage('Invalid campaign ID')
];

const validateCreativeId = [
  param('creativeId')
    .isInt({ min: 1 })
    .withMessage('Invalid creative ID')
];

const validatePlacementId = [
  param('placementId')
    .isInt({ min: 1 })
    .withMessage('Invalid placement ID')
];

const validateImpressionId = [
  param('impressionId')
    .isLength({ min: 32, max: 32 })
    .withMessage('Invalid impression ID')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateDateRange = [
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];

module.exports = {
  validateAdvertiser,
  validateCampaign,
  validateCreative,
  validateAdvertiserId,
  validateCampaignId,
  validateCreativeId,
  validatePlacementId,
  validateImpressionId,
  validatePagination,
  validateDateRange
};
