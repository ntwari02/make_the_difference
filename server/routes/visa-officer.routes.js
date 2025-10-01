const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const visaOfficerController = require('../controllers/visa-officer.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const { validateVisaOfficer } = require('../validators/visa-officer.validators');

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
  authorizeRoles(['visa_officer', 'admin']),
  visaOfficerController.getDashboard
);

// Application Management Routes
router.get('/applications',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  validateVisaOfficer.getApplications,
  handleValidation,
  visaOfficerController.getVisaApplications
);

router.get('/applications/:applicationId',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  visaOfficerController.getVisaApplication
);

router.put('/applications/:applicationId/review',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  validateVisaOfficer.reviewApplication,
  handleValidation,
  visaOfficerController.reviewVisaApplication
);

router.post('/applications/:applicationId/request-documents',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  validateVisaOfficer.requestDocuments,
  handleValidation,
  visaOfficerController.requestAdditionalDocuments
);

router.put('/applications/:applicationId/approve',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  validateVisaOfficer.approveApplication,
  handleValidation,
  visaOfficerController.approveVisaApplication
);

router.put('/applications/:applicationId/reject',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  validateVisaOfficer.rejectApplication,
  handleValidation,
  visaOfficerController.rejectVisaApplication
);

// Application Status Routes
router.get('/applications/status/:status',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  visaOfficerController.getApplicationsByStatus
);

router.get('/applications/pending',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  visaOfficerController.getPendingApplications
);

// Application Notes and History
router.post('/applications/:applicationId/notes',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  validateVisaOfficer.addNotes,
  handleValidation,
  visaOfficerController.addApplicationNotes
);

router.get('/applications/:applicationId/history',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  visaOfficerController.getApplicationHistory
);

// Bulk Operations
router.put('/applications/bulk-update',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  validateVisaOfficer.bulkUpdate,
  handleValidation,
  visaOfficerController.bulkUpdateApplications
);

// Analytics and Reports
router.get('/statistics',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  visaOfficerController.getVisaApplicationStats
);

router.get('/performance/:officerId',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  visaOfficerController.getPerformanceMetrics
);

router.get('/export',
  authenticate,
  authorizeRoles(['visa_officer', 'admin']),
  visaOfficerController.exportApplicationsData
);

module.exports = router;
