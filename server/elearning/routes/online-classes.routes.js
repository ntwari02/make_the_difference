const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/online-classes.controller');
const v = require('../validators/online-classes.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	return next();
};

// Public routes
router.get('/live', ctrl.getLiveClasses);

// Authenticated routes
router.use(authenticate);

// Specific routes (must come before parameterized routes)
router.get('/upcoming/my-classes', authorizeRoles('student', 'instructor', 'admin'), ctrl.getUpcomingClasses);
router.get('/my-enrollments', authorizeRoles('student', 'instructor', 'admin'), ctrl.getUserClassEnrollments);

// Instructor/Admin routes
router.post('/', authorizeRoles('instructor', 'admin'), v.validateCreateOnlineClass, handleValidation, ctrl.createOnlineClass);

// Learner/Instructor/Admin routes
router.get('/', v.validateClassFilters, handleValidation, ctrl.listOnlineClasses);

// Parameterized routes (must come after specific routes)
router.get('/:classId', v.validateClassId, handleValidation, ctrl.getOnlineClass);
router.patch('/:classId', authorizeRoles('instructor', 'admin'), v.validateUpdateOnlineClass, handleValidation, ctrl.updateOnlineClass);
router.delete('/:classId', authorizeRoles('instructor', 'admin'), v.validateClassId, handleValidation, ctrl.deleteOnlineClass);
router.post('/:classId/start', authorizeRoles('instructor', 'admin'), v.validateClassId, handleValidation, ctrl.startClass);
router.post('/:classId/end', authorizeRoles('instructor', 'admin'), v.validateClassId, handleValidation, ctrl.endClass);
router.get('/:classId/attendance', authorizeRoles('instructor', 'admin'), v.validateClassId, handleValidation, ctrl.getClassAttendance);
router.post('/:classId/materials', authorizeRoles('instructor', 'admin'), v.validateAddClassMaterial, handleValidation, ctrl.addClassMaterial);
router.get('/:classId/materials', v.validateClassId, handleValidation, ctrl.getClassMaterials);
router.get('/:classId/chat', v.validateChatFilters, handleValidation, ctrl.getClassChatMessages);
router.post('/:classId/enroll', authorizeRoles('student', 'admin'), v.validateEnrollInClass, handleValidation, ctrl.enrollInClass);
router.get('/:classId/enrollments', authorizeRoles('instructor', 'admin'), v.validateClassId, handleValidation, ctrl.getClassEnrollments);
router.post('/:classId/join', authorizeRoles('student', 'instructor', 'admin'), v.validateClassId, handleValidation, ctrl.joinClass);
router.post('/:classId/leave', authorizeRoles('student', 'instructor', 'admin'), v.validateClassId, handleValidation, ctrl.leaveClass);
router.post('/:classId/chat', authorizeRoles('student', 'instructor', 'admin'), v.validateAddChatMessage, handleValidation, ctrl.addChatMessage);

module.exports = router;
