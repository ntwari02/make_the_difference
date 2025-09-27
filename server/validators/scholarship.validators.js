const { body, param, query } = require('express-validator');

const scholarshipValidators = {
  // Validate scholarship ID parameter
  validateScholarshipId: [
    param('id').custom((value) => {
      // Accept UUID format or custom scholarship ID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const customIdRegex = /^scholarship-\d+$/;
      
      if (uuidRegex.test(value) || customIdRegex.test(value)) {
        return true;
      }
      throw new Error('Invalid scholarship ID format. Must be UUID or scholarship-{number} format');
    })
  ],

  // Validate application ID parameter
  validateApplicationId: [
    param('id').isUUID().withMessage('Invalid application ID format')
  ],

  // Validate scholarship filters
  validateScholarshipFilters: [
    query('country').optional().isLength({ min: 2, max: 100 }).withMessage('Country must be 2-100 characters'),
    query('degree_level').optional().isIn(['undergraduate', 'graduate', 'phd', 'diploma', 'certificate', 'any']).withMessage('Invalid degree level'),
    query('field_of_study').optional().isString().withMessage('Field of study must be a string'),
    query('min_amount').optional().isFloat({ min: 0 }).withMessage('Minimum amount must be a positive number'),
    query('max_amount').optional().isFloat({ min: 0 }).withMessage('Maximum amount must be a positive number'),
    query('provider_type').optional().isIn(['university', 'government', 'private_organization', 'foundation', 'corporation']).withMessage('Invalid provider type'),
    query('is_featured').optional().isBoolean().withMessage('Featured flag must be boolean'),
    query('deadline_before').optional().isISO8601().withMessage('Deadline must be a valid date'),
    query('sort_by').optional().isIn(['deadline', 'amount', 'featured', 'popular', 'created_at']).withMessage('Invalid sort option'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be 1-100 characters')
  ],

  // Validate scholarship data for creation
  validateScholarshipData: [
    body('title').notEmpty().isLength({ min: 5, max: 255 }).withMessage('Title must be 5-255 characters'),
    body('description').notEmpty().isLength({ min: 20, max: 2000 }).withMessage('Description must be 20-2000 characters'),
    body('provider_name').notEmpty().isLength({ min: 2, max: 255 }).withMessage('Provider name must be 2-255 characters'),
    body('provider_type').isIn(['university', 'government', 'private_organization', 'foundation', 'corporation']).withMessage('Invalid provider type'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('amount_type').isIn(['fixed', 'partial', 'full', 'variable']).withMessage('Invalid amount type'),
    body('country').notEmpty().isLength({ min: 2, max: 100 }).withMessage('Country must be 2-100 characters'),
    body('university').optional().isLength({ min: 2, max: 255 }).withMessage('University must be 2-255 characters'),
    body('degree_level').isIn(['undergraduate', 'graduate', 'phd', 'diploma', 'certificate', 'any']).withMessage('Invalid degree level'),
    body('field_of_study').optional().isArray().withMessage('Field of study must be an array'),
    body('application_deadline').isISO8601().withMessage('Application deadline must be a valid date'),
    body('start_date').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('duration_months').optional().isInt({ min: 1, max: 120 }).withMessage('Duration must be 1-120 months'),
    body('eligibility_criteria').optional().isObject().withMessage('Eligibility criteria must be an object'),
    body('required_documents').optional().isArray().withMessage('Required documents must be an array'),
    body('application_process').optional().isLength({ min: 10, max: 1000 }).withMessage('Application process must be 10-1000 characters'),
    body('website_url').optional().isURL().withMessage('Website URL must be valid'),
    body('contact_email').optional().isEmail().withMessage('Contact email must be valid'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('is_merit_based').optional().isBoolean().withMessage('Merit-based flag must be boolean'),
    body('is_need_based').optional().isBoolean().withMessage('Need-based flag must be boolean'),
    body('is_athletic').optional().isBoolean().withMessage('Athletic flag must be boolean'),
    body('is_artistic').optional().isBoolean().withMessage('Artistic flag must be boolean'),
    body('gpa_requirement').optional().isFloat({ min: 0, max: 4.0 }).withMessage('GPA requirement must be 0-4.0'),
    body('language_requirements').optional().isObject().withMessage('Language requirements must be an object'),
    body('nationality_restrictions').optional().isArray().withMessage('Nationality restrictions must be an array'),
    body('age_limit_min').optional().isInt({ min: 16, max: 100 }).withMessage('Minimum age must be 16-100'),
    body('age_limit_max').optional().isInt({ min: 16, max: 100 }).withMessage('Maximum age must be 16-100'),
    body('application_fee').optional().isFloat({ min: 0 }).withMessage('Application fee must be non-negative'),
    body('is_featured').optional().isBoolean().withMessage('Featured flag must be boolean'),
    body('max_applications').optional().isInt({ min: 1 }).withMessage('Max applications must be positive')
  ],

  // Validate scholarship update data
  validateScholarshipUpdate: [
    body('title').optional().isLength({ min: 5, max: 255 }).withMessage('Title must be 5-255 characters'),
    body('description').optional().isLength({ min: 20, max: 2000 }).withMessage('Description must be 20-2000 characters'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('amount_type').optional().isIn(['fixed', 'partial', 'full', 'variable']).withMessage('Invalid amount type'),
    body('country').optional().isLength({ min: 2, max: 100 }).withMessage('Country must be 2-100 characters'),
    body('university').optional().isLength({ min: 2, max: 255 }).withMessage('University must be 2-255 characters'),
    body('degree_level').optional().isIn(['undergraduate', 'graduate', 'phd', 'diploma', 'certificate', 'any']).withMessage('Invalid degree level'),
    body('field_of_study').optional().isArray().withMessage('Field of study must be an array'),
    body('application_deadline').optional().isISO8601().withMessage('Application deadline must be a valid date'),
    body('start_date').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('duration_months').optional().isInt({ min: 1, max: 120 }).withMessage('Duration must be 1-120 months'),
    body('eligibility_criteria').optional().isObject().withMessage('Eligibility criteria must be an object'),
    body('required_documents').optional().isArray().withMessage('Required documents must be an array'),
    body('application_process').optional().isLength({ min: 10, max: 1000 }).withMessage('Application process must be 10-1000 characters'),
    body('website_url').optional().isURL().withMessage('Website URL must be valid'),
    body('contact_email').optional().isEmail().withMessage('Contact email must be valid'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('is_merit_based').optional().isBoolean().withMessage('Merit-based flag must be boolean'),
    body('is_need_based').optional().isBoolean().withMessage('Need-based flag must be boolean'),
    body('is_athletic').optional().isBoolean().withMessage('Athletic flag must be boolean'),
    body('is_artistic').optional().isBoolean().withMessage('Artistic flag must be boolean'),
    body('gpa_requirement').optional().isFloat({ min: 0, max: 4.0 }).withMessage('GPA requirement must be 0-4.0'),
    body('language_requirements').optional().isObject().withMessage('Language requirements must be an object'),
    body('nationality_restrictions').optional().isArray().withMessage('Nationality restrictions must be an array'),
    body('age_limit_min').optional().isInt({ min: 16, max: 100 }).withMessage('Minimum age must be 16-100'),
    body('age_limit_max').optional().isInt({ min: 16, max: 100 }).withMessage('Maximum age must be 16-100'),
    body('application_fee').optional().isFloat({ min: 0 }).withMessage('Application fee must be non-negative'),
    body('is_featured').optional().isBoolean().withMessage('Featured flag must be boolean'),
    body('max_applications').optional().isInt({ min: 1 }).withMessage('Max applications must be positive'),
    body('status').optional().isIn(['active', 'inactive', 'expired', 'draft']).withMessage('Invalid status')
  ],

  // Validate application data
  validateApplicationData: [
    param('id').custom((value) => {
      // Accept UUID format or custom scholarship ID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const customIdRegex = /^scholarship-\d+$/;
      
      if (uuidRegex.test(value) || customIdRegex.test(value)) {
        return true;
      }
      throw new Error('Invalid scholarship ID format. Must be UUID or scholarship-{number} format');
    }),
    body('application_data').isObject().withMessage('Application data must be an object'),
    body('documents').optional().custom((value) => {
      // Accept both object and array formats for documents
      if (typeof value === 'object' && (Array.isArray(value) || !Array.isArray(value))) {
        return true;
      }
      throw new Error('Documents must be an object or array');
    }),
    body('status').optional().isIn(['draft', 'submitted']).withMessage('Invalid application status')
  ],

  // Validate application update data
  validateApplicationUpdate: [
    body('application_data').optional().isObject().withMessage('Application data must be an object'),
    body('documents').optional().custom((value) => {
      // Accept both object and array formats for documents
      if (typeof value === 'object' && (Array.isArray(value) || !Array.isArray(value))) {
        return true;
      }
      throw new Error('Documents must be an object or array');
    }),
    body('status').optional().isIn(['draft', 'submitted']).withMessage('Invalid application status')
  ],

  // Validate status update
  validateStatusUpdate: [
    body('status').isIn(['under_review', 'shortlisted', 'accepted', 'rejected']).withMessage('Invalid status'),
    body('review_notes').optional().isLength({ min: 10, max: 500 }).withMessage('Review notes must be 10-500 characters')
  ],

  // Validate scholarship ID in URL
  validateScholarshipIdInUrl: [
    param('scholarshipId').isUUID().withMessage('Invalid scholarship ID format')
  ]
};

module.exports = scholarshipValidators;
