const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const moderatorController = require('../controllers/moderator.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const { validateModerator } = require('../validators/moderator.validators');

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

// Dashboard Routes
router.get('/dashboard',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  moderatorController.getDashboard
);

// Content Moderation Routes
router.get('/flagged-content',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  validateModerator.getFlaggedContent,
  handleValidation,
  moderatorController.getFlaggedContent
);

router.get('/content/:contentType/:contentId',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  moderatorController.getContentForModeration
);

router.put('/content/:contentType/:contentId/moderate',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  validateModerator.moderateContent,
  handleValidation,
  moderatorController.moderateContent
);

router.put('/content/:contentType/:contentId/approve',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  validateModerator.approveContent,
  handleValidation,
  moderatorController.approveContent
);

router.put('/content/:contentType/:contentId/reject',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  validateModerator.rejectContent,
  handleValidation,
  moderatorController.rejectContent
);

router.delete('/content/:contentType/:contentId',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  validateModerator.removeContent,
  handleValidation,
  moderatorController.removeContent
);

// Content Flagging Routes
router.post('/content/:contentType/:contentId/flag',
  authenticate,
  validateModerator.flagContent,
  handleValidation,
  moderatorController.flagContent
);

// User Moderation Routes
router.get('/user-reports',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  validateModerator.getUserReports,
  handleValidation,
  moderatorController.getUserReports
);

router.put('/users/:userId/moderate',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  validateModerator.moderateUser,
  handleValidation,
  moderatorController.moderateUser
);

// Moderation Queue and History
router.get('/queue',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  moderatorController.getModerationQueue
);

router.post('/content/:contentType/:contentId/notes',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  validateModerator.addNotes,
  handleValidation,
  moderatorController.addModerationNotes
);

router.get('/content/:contentType/:contentId/history',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  moderatorController.getModerationHistory
);

// Bulk Operations
router.put('/content/bulk-moderate',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  validateModerator.bulkModerate,
  handleValidation,
  moderatorController.bulkModerateContent
);

// Analytics and Reports
router.get('/statistics',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  moderatorController.getModerationStats
);

router.get('/performance/:moderatorId',
  authenticate,
  authorizeRoles(['moderator', 'admin']),
  moderatorController.getPerformanceMetrics
);

module.exports = router;
