const express = require('express');
const { validationResult } = require('express-validator');
const ctrl = require('../controllers/elearning.controller');
const { authenticate, authorizeRoles, optionalAuthenticate } = require('../../middlewares/auth');
const { setOrgContext, requireOrgMembershipHeader, requireOrgForCourseParam, requireOrgForModuleParam, requireOrgForLessonParam } = require('../../middlewares/org');
const v = require('../validators/elearning.validators');
const analyticsCtrl = require('../controllers/analytics.controller');

const router = express.Router();

const handleValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	return next();
};

// Public browse/search
router.get('/courses', setOrgContext, optionalAuthenticate, ctrl.listCourses);
router.get('/courses/:courseId', setOrgContext, optionalAuthenticate, ctrl.getCourse);
router.get('/courses-recommended', optionalAuthenticate, ctrl.recommend);

// Instructor: create/update courses
router.post('/courses', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgMembershipHeader(['org_admin','instructor']), v.validateCreateCourse, handleValidation, ctrl.createCourse);
router.patch('/courses/:courseId', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForCourseParam(['org_admin','instructor']), ctrl.updateCourse);
router.post('/courses/:courseId/status', setOrgContext, authenticate, authorizeRoles('admin'), requireOrgForCourseParam(['org_admin']), v.validateUpdateCourseStatus, handleValidation, ctrl.setCourseStatus);

// Modules
router.get('/courses/:courseId/modules', setOrgContext, optionalAuthenticate, ctrl.listModules);
router.post('/courses/:courseId/modules', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForCourseParam(['org_admin','instructor']), v.validateCreateModule, handleValidation, ctrl.createModule);
router.patch('/modules/:moduleId', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForModuleParam(['org_admin','instructor']), ctrl.updateModule);
router.delete('/modules/:moduleId', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForModuleParam(['org_admin','instructor']), ctrl.deleteModule);

// Lessons
router.get('/modules/:moduleId/lessons', setOrgContext, optionalAuthenticate, ctrl.listLessons);
router.post('/modules/:moduleId/lessons', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForModuleParam(['org_admin','instructor']), v.validateCreateLesson, handleValidation, ctrl.createLesson);
router.patch('/lessons/:lessonId', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForLessonParam(['org_admin','instructor']), ctrl.updateLesson);
router.delete('/lessons/:lessonId', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForLessonParam(['org_admin','instructor']), ctrl.deleteLesson);

// Enrollment & Progress
router.post('/courses/:courseId/enroll', authenticate, authorizeRoles('student','admin','instructor'), ctrl.enroll);
router.get('/courses/:courseId/enrollment', authenticate, ctrl.getEnrollment);
router.post('/progress', authenticate, v.validateUpsertProgress, handleValidation, ctrl.upsertProgress);
router.get('/enrollments/:enrollmentId/progress', authenticate, ctrl.getProgress);
router.post('/courses/:courseId/complete', authenticate, ctrl.completeCourse);

// Reviews
router.post('/courses/:courseId/reviews', authenticate, authorizeRoles('student','admin','instructor'), v.validateAddReview, handleValidation, ctrl.addReview);
router.get('/courses/:courseId/reviews', optionalAuthenticate, ctrl.listReviews);

// Favorites
router.post('/courses/:courseId/favorite', authenticate, authorizeRoles('student','admin','instructor'), ctrl.addFavorite);
router.delete('/courses/:courseId/favorite', authenticate, authorizeRoles('student','admin','instructor'), ctrl.removeFavorite);
router.get('/me/favorites', authenticate, ctrl.listFavorites);

// Analytics
router.get('/me/instructor/analytics', authenticate, authorizeRoles('instructor','admin'), analyticsCtrl.instructorOverview);
router.get('/admin/analytics/overview', authenticate, authorizeRoles('admin'), analyticsCtrl.adminOverview);

module.exports = router;


