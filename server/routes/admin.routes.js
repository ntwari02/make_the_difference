const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const ctrl = require('../controllers/admin.controller');
const v = require('../validators/admin.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorizeRoles('admin'));

// Dashboard and Overview
router.get('/dashboard/overview', ctrl.getDashboardOverview);
router.get('/dashboard/alerts', ctrl.getPendingAlerts);
router.get('/dashboard/activity/recent', ctrl.getRecentActivity);

// User Management
router.get('/users', v.validateUserFilters, handleValidation, ctrl.getAllUsers);
router.post('/users', v.validateCreateUser, handleValidation, ctrl.createUser);
router.patch('/users/:userId', v.validateUpdateUser, handleValidation, ctrl.updateUser);
router.patch('/users/:userId/status', v.validateUserStatus, handleValidation, ctrl.updateUserStatus);
router.get('/users/:userId/activity', ctrl.getUserActivity);
router.get('/users/:userId/sessions', ctrl.getUserSessions);
router.delete('/users/:userId/sessions', ctrl.revokeUserSessions);

// System Analytics
router.get('/analytics/overview', ctrl.getSystemAnalytics);
router.get('/analytics/ecommerce', ctrl.getEcommerceAnalytics);
router.get('/analytics/elearning', ctrl.getElearningAnalytics);
router.get('/analytics/online-classes', ctrl.getOnlineClassesAnalytics);
router.get('/analytics/certificates', ctrl.getCertificateAnalytics);

// Content Moderation
router.get('/content/flagged', ctrl.getFlaggedContent);
router.patch('/content/:contentId/moderate', v.validateContentModeration, handleValidation, ctrl.moderateContent);
router.delete('/content/:contentId', ctrl.removeContent);

// System Configuration
router.get('/settings', ctrl.getSystemSettings);
router.patch('/settings', v.validateSystemSettings, handleValidation, ctrl.updateSystemSettings);
router.get('/feature-flags', ctrl.getFeatureFlags);
router.patch('/feature-flags/:flagId', v.validateFeatureFlag, handleValidation, ctrl.updateFeatureFlag);

// Audit and Logging
router.get('/audit-logs', v.validateAuditFilters, handleValidation, ctrl.getAuditLogs);
router.get('/user-activity/:userId', ctrl.getUserActivityLogs);
router.get('/system-events', v.validateSystemEventFilters, handleValidation, ctrl.getSystemEvents);

// Emergency Controls
router.post('/emergency/suspend-user', v.validateEmergencySuspend, handleValidation, ctrl.emergencySuspendUser);
router.post('/emergency/remove-content', v.validateEmergencyRemove, handleValidation, ctrl.emergencyRemoveContent);
router.patch('/maintenance-mode', v.validateMaintenanceMode, handleValidation, ctrl.toggleMaintenanceMode);

// Bulk Operations
router.post('/bulk/users/update-status', v.validateBulkUserUpdate, handleValidation, ctrl.bulkUpdateUserStatus);
router.post('/bulk/content/moderate', v.validateBulkContentModeration, handleValidation, ctrl.bulkModerateContent);
router.post('/bulk/notifications/send', v.validateBulkNotification, handleValidation, ctrl.sendBulkNotifications);

module.exports = router;
