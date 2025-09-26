const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/chatbot.controller');
const v = require('../validators/chatbot.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// All chatbot routes require authentication
router.use(authenticate);

// Chat endpoints
router.post('/message', v.validateMessage, handleValidation, ctrl.processMessage);
router.get('/session/:sessionId/history', v.validateSessionHistory, handleValidation, ctrl.getConversationHistory);
router.post('/session/start', ctrl.startNewSession);
router.get('/suggestions', ctrl.getChatbotSuggestions);
router.get('/status', ctrl.getChatbotStatus);

// Admin endpoints
router.get('/admin/analytics', authorizeRoles('admin'), ctrl.getChatbotAnalytics);
router.get('/admin/metrics', authorizeRoles('admin'), ctrl.getChatbotMetrics);
router.post('/admin/train', authorizeRoles('admin'), v.validateTrainingData, handleValidation, ctrl.trainChatbot);

module.exports = router;
