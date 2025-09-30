const { body, query, param } = require('express-validator');

// User Management Validators
const validateUserFilters = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['student', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'admin', 'advertiser']).withMessage('Invalid role'),
  query('status').optional().isIn(['active', 'inactive', 'all']).withMessage('Invalid status'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
  query('sort_by').optional().isIn(['created_at', 'email', 'first_name', 'last_name', 'role']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC')
];

const validateCreateUser = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('first_name').isLength({ min: 1, max: 100 }).withMessage('First name is required and must be less than 100 characters'),
  body('last_name').isLength({ min: 1, max: 100 }).withMessage('Last name is required and must be less than 100 characters'),
  body('phone').optional().custom((value) => {
    if (!value) return true; // Optional field
    // Allow various phone number formats
    const phoneRegex = /^[\+]?[0-9][\d]{0,15}$/;
    if (!phoneRegex.test(value)) {
      throw new Error('Valid phone number is required');
    }
    return true;
  }),
  body('role').optional().isIn(['student', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'admin', 'advertiser']).withMessage('Invalid role'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('is_verified').optional().isBoolean().withMessage('is_verified must be a boolean')
];

const validateUpdateUser = [
  param('userId').isUUID().withMessage('Valid user ID is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('first_name').optional().isLength({ min: 1, max: 100 }).withMessage('First name must be less than 100 characters'),
  body('last_name').optional().isLength({ min: 1, max: 100 }).withMessage('Last name must be less than 100 characters'),
  body('phone').optional().custom((value) => {
    if (!value) return true; // Optional field
    // Allow various phone number formats
    const phoneRegex = /^[\+]?[0-9][\d]{0,15}$/;
    if (!phoneRegex.test(value)) {
      throw new Error('Valid phone number is required');
    }
    return true;
  }),
  body('role').optional().isIn(['student', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'admin', 'advertiser']).withMessage('Invalid role'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('is_verified').optional().isBoolean().withMessage('is_verified must be a boolean')
];

const validateUserStatus = [
  param('userId').isUUID().withMessage('Valid user ID is required'),
  body('action').isIn(['suspend', 'activate', 'deactivate']).withMessage('Action must be suspend, activate, or deactivate'),
  body('reason').optional().isLength({ min: 1, max: 500 }).withMessage('Reason must be less than 500 characters'),
  body('duration').optional().isLength({ min: 1, max: 50 }).withMessage('Duration must be less than 50 characters')
];

// Analytics Validators
const validateAnalyticsFilters = [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Period must be 7d, 30d, 90d, or 1y'),
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('detailed').optional().isBoolean().withMessage('Detailed must be a boolean')
];

// Content Moderation Validators
const validateContentModeration = [
  param('contentId').isUUID().withMessage('Valid content ID is required'),
  body('action').isIn(['approve', 'reject', 'flag', 'remove']).withMessage('Action must be approve, reject, flag, or remove'),
  body('reason').isLength({ min: 1, max: 500 }).withMessage('Reason is required and must be less than 500 characters'),
  body('moderator_notes').optional().isLength({ max: 1000 }).withMessage('Moderator notes must be less than 1000 characters')
];

// System Configuration Validators
const validateSystemSettings = [
  body('max_file_size').optional().isLength({ min: 1, max: 20 }).withMessage('Max file size must be less than 20 characters'),
  body('auto_approve_courses').optional().isBoolean().withMessage('auto_approve_courses must be a boolean'),
  body('require_email_verification').optional().isBoolean().withMessage('require_email_verification must be a boolean'),
  body('maintenance_mode').optional().isBoolean().withMessage('maintenance_mode must be a boolean'),
  body('registration_enabled').optional().isBoolean().withMessage('registration_enabled must be a boolean'),
  body('max_users_per_org').optional().isInt({ min: 1, max: 10000 }).withMessage('max_users_per_org must be between 1 and 10000')
];

const validateFeatureFlag = [
  param('flagId').isUUID().withMessage('Valid feature flag ID is required'),
  body('is_enabled').isBoolean().withMessage('is_enabled must be a boolean'),
  body('target_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('target_percentage must be between 0 and 100'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
];

// Audit and Logging Validators
const validateAuditFilters = [
  query('admin_id').optional().isUUID().withMessage('Valid admin ID is required'),
  query('action').optional().isLength({ min: 1, max: 100 }).withMessage('Action must be less than 100 characters'),
  query('date_from').optional().isISO8601().withMessage('Date from must be a valid ISO date'),
  query('date_to').optional().isISO8601().withMessage('Date to must be a valid ISO date'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validateSystemEventFilters = [
  query('severity').optional().isIn(['info', 'warning', 'error', 'critical']).withMessage('Severity must be info, warning, error, or critical'),
  query('period').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Period must be 1h, 24h, 7d, or 30d'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Emergency Controls Validators
const validateEmergencySuspend = [
  body('user_id').isUUID().withMessage('Valid user ID is required'),
  body('reason').isLength({ min: 1, max: 500 }).withMessage('Reason is required and must be less than 500 characters'),
  body('duration').optional().isLength({ min: 1, max: 50 }).withMessage('Duration must be less than 50 characters')
];

const validateEmergencyRemove = [
  body('content_id').isLength({ min: 1, max: 100 }).withMessage('Valid content ID is required'),
  body('content_type').isIn(['car', 'course', 'review', 'message', 'user']).withMessage('Content type must be car, course, review, message, or user'),
  body('reason').isLength({ min: 1, max: 500 }).withMessage('Reason is required and must be less than 500 characters')
];

const validateMaintenanceMode = [
  body('enabled').isBoolean().withMessage('enabled must be a boolean'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message must be less than 500 characters'),
  body('estimated_duration').optional().isLength({ max: 100 }).withMessage('Estimated duration must be less than 100 characters')
];

// Bulk Operations Validators
const validateBulkUserUpdate = [
  body('user_ids').isArray({ min: 1, max: 100 }).withMessage('User IDs must be an array with 1-100 items'),
  body('user_ids.*').isUUID().withMessage('Each user ID must be a valid UUID'),
  body('action').isIn(['suspend', 'activate', 'deactivate', 'verify', 'unverify']).withMessage('Action must be suspend, activate, deactivate, verify, or unverify'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters')
];

const validateBulkContentModeration = [
  body('content_ids').isArray({ min: 1, max: 50 }).withMessage('Content IDs must be an array with 1-50 items'),
  body('content_ids.*').isLength({ min: 1, max: 100 }).withMessage('Each content ID must be valid'),
  body('action').isIn(['approve', 'reject', 'flag', 'remove']).withMessage('Action must be approve, reject, flag, or remove'),
  body('reason').isLength({ min: 1, max: 500 }).withMessage('Reason is required and must be less than 500 characters')
];

const validateBulkNotification = [
  body('user_ids').optional().isArray({ min: 1, max: 1000 }).withMessage('User IDs must be an array with 1-1000 items'),
  body('user_ids.*').optional().isUUID().withMessage('Each user ID must be a valid UUID'),
  body('role').optional().isIn(['student', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'admin', 'advertiser']).withMessage('Invalid role'),
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('message').isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be less than 1000 characters'),
  body('notification_type').isIn(['admin_announcement', 'system_update', 'security_alert', 'feature_release']).withMessage('Notification type must be admin_announcement, system_update, security_alert, or feature_release'),
  body('channels').optional().isArray().withMessage('Channels must be an array'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be low, medium, high, or urgent')
];

module.exports = {
  // User Management
  validateUserFilters,
  validateCreateUser,
  validateUpdateUser,
  validateUserStatus,
  
  // Analytics
  validateAnalyticsFilters,
  
  // Content Moderation
  validateContentModeration,
  
  // System Configuration
  validateSystemSettings,
  validateFeatureFlag,
  
  // Audit and Logging
  validateAuditFilters,
  validateSystemEventFilters,
  
  // Emergency Controls
  validateEmergencySuspend,
  validateEmergencyRemove,
  validateMaintenanceMode,
  
  // Bulk Operations
  validateBulkUserUpdate,
  validateBulkContentModeration,
  validateBulkNotification
};
