const express = require('express');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/recommendations.controller');

const router = express.Router();

// Public routes (no authentication required)
router.get('/trending', ctrl.getTrendingCars);

// Authenticated user routes
router.get('/user/:id', authenticate, ctrl.getUserRecommendations);
router.get('/similar/:id', authenticate, ctrl.getSimilarCars);
router.post('/track-behavior', authenticate, ctrl.trackUserBehavior);
router.patch('/clicked/:recommendationId', authenticate, ctrl.markRecommendationClicked);
router.get('/preferences', authenticate, ctrl.getUserPreferences);
router.put('/preferences', authenticate, ctrl.updateUserPreferences);
router.get('/behavior-history', authenticate, ctrl.getUserBehaviorHistory);

// Admin routes
router.get('/admin/analytics', authenticate, authorizeRoles('admin'), ctrl.getRecommendationAnalytics);

module.exports = router;

