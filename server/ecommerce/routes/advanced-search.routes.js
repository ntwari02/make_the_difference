const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/advanced-search.controller');
const v = require('../validators/advanced-search.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// Public routes (no authentication required)
router.get('/suggestions', ctrl.getSearchSuggestions);
router.get('/filter-options', ctrl.getSearchFilterOptions);

// Authenticated user routes
router.post('/visual', authenticate, v.validateVisualSearch, handleValidation, ctrl.visualSearch);
router.post('/voice', authenticate, v.validateVoiceSearch, handleValidation, ctrl.voiceSearch);
router.post('/semantic', authenticate, v.validateSemanticSearch, handleValidation, ctrl.semanticSearch);
router.get('/advanced-filters', authenticate, v.validateAdvancedFilters, handleValidation, ctrl.advancedFilterSearch);
router.post('/save', authenticate, v.validateSaveSearch, handleValidation, ctrl.saveSearch);
router.get('/saved', authenticate, ctrl.getSavedSearches);
router.get('/saved/:savedSearchId', authenticate, ctrl.executeSavedSearch);

// Admin routes
router.get('/admin/analytics', authenticate, authorizeRoles('admin'), ctrl.getSearchAnalytics);

module.exports = router;
