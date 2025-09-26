const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const scholarshipController = require('../controllers/scholarship.controller');
const scholarshipSuccessPredictorController = require('../controllers/scholarship-success-predictor.controller');
const scholarshipValidators = require('../validators/scholarship.validators');

const router = express.Router();

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

// ========== PUBLIC ROUTES ==========

// Get all scholarships with filters
router.get('/', scholarshipValidators.validateScholarshipFilters, handleValidation, scholarshipController.getScholarships);

// Get scholarship by ID
router.get('/:id', scholarshipValidators.validateScholarshipId, handleValidation, scholarshipController.getScholarshipById);

// Get featured scholarships
router.get('/featured/list', scholarshipController.getFeaturedScholarships);

// Get trending scholarships
router.get('/trending/list', scholarshipController.getTrendingScholarships);

// Get scholarship statistics
router.get('/stats/overview', scholarshipController.getScholarshipStats);

// ========== AUTHENTICATED ROUTES ==========

// Create scholarship application
router.post('/:id/apply', 
  authenticate, 
  authorizeRoles('student'), 
  scholarshipValidators.validateApplicationData, 
  handleValidation, 
  scholarshipController.createApplication
);

// Get user's applications
router.get('/applications/my', 
  authenticate, 
  authorizeRoles('student'), 
  scholarshipController.getUserApplications
);

// Get specific application
router.get('/applications/:id', 
  authenticate, 
  authorizeRoles('student'), 
  scholarshipValidators.validateApplicationId, 
  handleValidation, 
  scholarshipController.getApplicationById
);

// Update application
router.put('/applications/:id', 
  authenticate, 
  authorizeRoles('student'), 
  scholarshipValidators.validateApplicationUpdate, 
  handleValidation, 
  scholarshipController.updateApplication
);

// Withdraw application
router.delete('/applications/:id', 
  authenticate, 
  authorizeRoles('student'), 
  scholarshipValidators.validateApplicationId, 
  handleValidation, 
  scholarshipController.withdrawApplication
);

// Get user's application statistics
router.get('/applications/stats/my', 
  authenticate, 
  authorizeRoles('student'), 
  scholarshipController.getApplicationStats
);

// Get personalized scholarship recommendations
router.get('/recommendations/personalized', 
  authenticate, 
  authorizeRoles('student'), 
  scholarshipController.getPersonalizedRecommendations
);

// Get scholarship success prediction
router.get('/:scholarshipId/prediction', 
  authenticate, 
  authorizeRoles('student'), 
  scholarshipValidators.validateScholarshipId, 
  handleValidation, 
  scholarshipController.getSuccessPrediction
);

// Get comprehensive success prediction with detailed analysis
router.get('/:scholarshipId/success-prediction', 
  authenticate, 
  authorizeRoles('student'), 
  scholarshipValidators.validateScholarshipId, 
  handleValidation, 
  scholarshipSuccessPredictorController.getSuccessPrediction
);

// Get success prediction for application form
router.post('/:scholarshipId/success-prediction/form', 
  authenticate, 
  authorizeRoles('student'), 
  scholarshipValidators.validateScholarshipId, 
  handleValidation, 
  scholarshipSuccessPredictorController.getApplicationFormPrediction
);

// Get quick success check
router.get('/:scholarshipId/success-check', 
  authenticate, 
  authorizeRoles('student'), 
  scholarshipValidators.validateScholarshipId, 
  handleValidation, 
  scholarshipSuccessPredictorController.getQuickSuccessCheck
);

// ========== PROVIDER ROUTES (Universities, Organizations) ==========

// Create scholarship
router.post('/', 
  authenticate, 
  authorizeRoles('university', 'admin'), 
  scholarshipValidators.validateScholarshipData, 
  handleValidation, 
  scholarshipController.createScholarship
);

// Update scholarship
router.put('/:id', 
  authenticate, 
  authorizeRoles('university', 'admin'), 
  scholarshipValidators.validateScholarshipId, 
  scholarshipValidators.validateScholarshipUpdate, 
  handleValidation, 
  scholarshipController.updateScholarship
);

// Delete scholarship
router.delete('/:id', 
  authenticate, 
  authorizeRoles('university', 'admin'), 
  scholarshipValidators.validateScholarshipId, 
  handleValidation, 
  scholarshipController.deleteScholarship
);

// Get provider's scholarships
router.get('/provider/my', 
  authenticate, 
  authorizeRoles('university', 'admin'), 
  scholarshipController.getScholarshipsByProvider
);

// Get applications for a specific scholarship
router.get('/:scholarshipId/applications', 
  authenticate, 
  authorizeRoles('university', 'admin'), 
  scholarshipValidators.validateScholarshipId, 
  handleValidation, 
  scholarshipController.getScholarshipApplications
);

// Update application status
router.put('/applications/:id/status', 
  authenticate, 
  authorizeRoles('university', 'admin'), 
  scholarshipValidators.validateApplicationId, 
  scholarshipValidators.validateStatusUpdate, 
  handleValidation, 
  scholarshipController.updateApplicationStatus
);

// Get provider's application statistics
router.get('/applications/stats/provider', 
  authenticate, 
  authorizeRoles('university', 'admin'), 
  scholarshipController.getApplicationStats
);

// ========== ADMIN ROUTES ==========

// Get all applications (admin view)
router.get('/admin/applications/all', 
  authenticate, 
  authorizeRoles('admin'), 
  scholarshipController.getScholarshipApplications
);

// Get all scholarships (admin view)
router.get('/admin/scholarships/all', 
  authenticate, 
  authorizeRoles('admin'), 
  scholarshipController.getScholarships
);

module.exports = router;
