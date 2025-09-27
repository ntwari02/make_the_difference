const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/certificate.controller');
const v = require('../validators/certificate.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// Public routes (no authentication required)
router.get('/verify/:verificationCode', ctrl.verifyCertificate);

// Authenticated routes
router.use(authenticate);

// Certificate management routes
router.get('/my-certificates', authorizeRoles('student', 'instructor', 'admin'), ctrl.getUserCertificates);
router.get('/:certificateId', authorizeRoles('student', 'instructor', 'admin'), ctrl.getCertificate);
router.get('/:certificateId/download', authorizeRoles('student', 'instructor', 'admin'), ctrl.downloadCertificate);
router.get('/:certificateId/analytics', authorizeRoles('student', 'instructor', 'admin'), ctrl.getCertificateAnalytics);
router.post('/:certificateId/share', authorizeRoles('student', 'instructor', 'admin'), v.validateShareCertificate, handleValidation, ctrl.shareCertificate);

// Certificate creation (admin/instructor only)
router.post('/enrollment/:enrollmentId', authorizeRoles('instructor', 'admin'), v.validateCreateCertificate, handleValidation, ctrl.createCertificate);

// Certificate template management (admin/instructor only)
router.get('/templates/list', authorizeRoles('instructor', 'admin'), ctrl.getCertificateTemplates);
router.post('/templates', authorizeRoles('instructor', 'admin'), v.validateCreateTemplate, handleValidation, ctrl.createCertificateTemplate);

// Partner organization management (admin only)
router.get('/partners/list', authorizeRoles('admin'), ctrl.getPartnerOrganizations);
router.post('/partners', authorizeRoles('admin'), v.validateCreatePartner, handleValidation, ctrl.createPartnerOrganization);

// Course-partner associations (instructor/admin only)
router.get('/courses/:courseId/partners', authorizeRoles('instructor', 'admin'), ctrl.getCoursePartners);
router.post('/courses/:courseId/partners', authorizeRoles('instructor', 'admin'), v.validateAssociatePartners, handleValidation, ctrl.associateCourseWithPartners);

// Certificate administration (admin only)
router.patch('/:certificateId/revoke', authorizeRoles('admin'), v.validateRevokeCertificate, handleValidation, ctrl.revokeCertificate);

module.exports = router;
