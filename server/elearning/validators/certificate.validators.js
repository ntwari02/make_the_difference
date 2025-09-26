const { body, param, query } = require('express-validator');

// Certificate creation validation
const validateCreateCertificate = [
  param('enrollmentId').isUUID().withMessage('Invalid enrollment ID'),
  body('templateId').optional().isUUID().withMessage('Invalid template ID'),
  body('partnerIds').optional().isArray().withMessage('Partner IDs must be an array'),
  body('partnerIds.*').optional().isUUID().withMessage('Invalid partner ID'),
  body('grade').optional().isString().isLength({ min: 1, max: 10 }).withMessage('Grade must be 1-10 characters'),
  body('score').optional().isNumeric().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100')
];

// Certificate sharing validation
const validateShareCertificate = [
  param('certificateId').isUUID().withMessage('Invalid certificate ID'),
  body('platform').isIn(['linkedin', 'facebook', 'twitter', 'email', 'direct_link', 'other']).withMessage('Invalid platform'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
];

// Certificate template creation validation
const validateCreateTemplate = [
  body('name').isString().isLength({ min: 2, max: 255 }).withMessage('Template name must be 2-255 characters'),
  body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('template_type').isIn(['course_completion', 'skill_assessment', 'partnership', 'custom']).withMessage('Invalid template type'),
  body('organization_id').optional().isUUID().withMessage('Invalid organization ID'),
  body('template_data').isObject().withMessage('Template data must be an object'),
  body('background_image_url').optional().isURL().withMessage('Invalid background image URL'),
  body('logo_url').optional().isURL().withMessage('Invalid logo URL')
];

// Partner organization creation validation
const validateCreatePartner = [
  body('name').isString().isLength({ min: 2, max: 255 }).withMessage('Partner name must be 2-255 characters'),
  body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('logo_url').optional().isURL().withMessage('Invalid logo URL'),
  body('website_url').optional().isURL().withMessage('Invalid website URL'),
  body('contact_email').optional().isEmail().withMessage('Invalid contact email'),
  body('contact_phone').optional().isString().isLength({ min: 10, max: 20 }).withMessage('Invalid contact phone'),
  body('partnership_type').isIn(['educational', 'corporate', 'government', 'ngo', 'other']).withMessage('Invalid partnership type')
];

// Course-partner association validation
const validateAssociatePartners = [
  param('courseId').isUUID().withMessage('Invalid course ID'),
  body('partnerIds').isArray({ min: 1 }).withMessage('At least one partner ID is required'),
  body('partnerIds.*').isUUID().withMessage('Invalid partner ID'),
  body('primaryPartnerId').optional().isUUID().withMessage('Invalid primary partner ID')
];

// Certificate revocation validation
const validateRevokeCertificate = [
  param('certificateId').isUUID().withMessage('Invalid certificate ID'),
  body('reason').isString().isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters')
];

// Certificate ID validation
const validateCertificateId = [
  param('certificateId').isUUID().withMessage('Invalid certificate ID')
];

// Verification code validation
const validateVerificationCode = [
  param('verificationCode').isString().isLength({ min: 32, max: 32 }).withMessage('Invalid verification code format')
];

// Query parameter validation for certificates
const validateCertificateFilters = [
  query('status').optional().isIn(['issued', 'revoked', 'expired', 'pending']).withMessage('Invalid status filter'),
  query('course_id').optional().isUUID().withMessage('Invalid course ID filter'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
];

// Template filters validation
const validateTemplateFilters = [
  query('template_type').optional().isIn(['course_completion', 'skill_assessment', 'partnership', 'custom']).withMessage('Invalid template type filter'),
  query('organization_id').optional().isUUID().withMessage('Invalid organization ID filter')
];

// Partner filters validation
const validatePartnerFilters = [
  query('partnership_type').optional().isIn(['educational', 'corporate', 'government', 'ngo', 'other']).withMessage('Invalid partnership type filter')
];

module.exports = {
  validateCreateCertificate,
  validateShareCertificate,
  validateCreateTemplate,
  validateCreatePartner,
  validateAssociatePartners,
  validateRevokeCertificate,
  validateCertificateId,
  validateVerificationCode,
  validateCertificateFilters,
  validateTemplateFilters,
  validatePartnerFilters
};
