const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/ai.controller');
const v = require('../validators/ai.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// All AI routes require authentication
router.use(authenticate);

// AI System Status
router.get('/status', ctrl.getAIStatus);

// AI Chatbot endpoints
router.post('/chat/message', v.validateChatMessage, handleValidation, ctrl.processChatMessage);
router.get('/chat/suggestions', ctrl.getChatSuggestions);

// Dynamic Pricing endpoints
router.get('/pricing/:carId/dynamic', ctrl.getDynamicPrice);
router.get('/pricing/:carId/recommendations', ctrl.getPricingRecommendations);

// Personalization endpoints
router.get('/personalization/recommendations', v.validateRecommendations, handleValidation, ctrl.getPersonalizedRecommendations);
router.get('/personalization/content', v.validateContentType, handleValidation, ctrl.getPersonalizedContent);
router.get('/personalization/profile', ctrl.getUserProfile);
router.post('/personalization/predict-behavior', v.validateBehaviorPrediction, handleValidation, ctrl.predictUserBehavior);

// Analytics endpoints
router.get('/analytics/insights', v.validateAnalyticsPeriod, handleValidation, ctrl.getBusinessInsights);
router.get('/analytics/trends', v.validateTrendsForecast, handleValidation, ctrl.getFutureTrends);
router.get('/analytics/behavior', v.validateBehaviorAnalysis, handleValidation, ctrl.getUserBehaviorAnalysis);
router.get('/analytics/optimization', ctrl.getOptimizationRecommendations);
router.get('/analytics/anomalies', v.validateAnomalyDetection, handleValidation, ctrl.detectAnomalies);

// Admin endpoints
router.get('/admin/dashboard', authorizeRoles('admin'), ctrl.getAIDashboard);

module.exports = router;
