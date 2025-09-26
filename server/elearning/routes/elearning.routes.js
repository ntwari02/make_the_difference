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
router.get('/courses/search', setOrgContext, optionalAuthenticate, ctrl.searchCourses);

// Additional public endpoints
router.get('/students', setOrgContext, authenticate, authorizeRoles('instructor','admin'), ctrl.getStudents);
router.get('/recommendations', optionalAuthenticate, ctrl.recommend);
router.get('/trending', setOrgContext, optionalAuthenticate, ctrl.getTrendingCourses);
router.get('/categories', optionalAuthenticate, ctrl.getCategories);

// Instructor: create/update/delete courses
router.post('/courses', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgMembershipHeader(['org_admin','instructor']), v.validateCreateCourse, handleValidation, ctrl.createCourse);
router.patch('/courses/:courseId', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForCourseParam(['org_admin','instructor']), ctrl.updateCourse);
router.delete('/courses/:courseId', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForCourseParam(['org_admin','instructor']), ctrl.deleteCourse);
router.post('/courses/:courseId/status', setOrgContext, authenticate, authorizeRoles('admin'), requireOrgForCourseParam(['org_admin']), v.validateUpdateCourseStatus, handleValidation, ctrl.setCourseStatus);

// Modules
router.get('/courses/:courseId/modules', setOrgContext, optionalAuthenticate, ctrl.listModules);
router.post('/courses/:courseId/modules', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForCourseParam(['org_admin','instructor']), v.validateCreateModule, handleValidation, ctrl.createModule);
router.patch('/modules/:moduleId', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForModuleParam(['org_admin','instructor']), ctrl.updateModule);
router.delete('/modules/:moduleId', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForModuleParam(['org_admin','instructor']), ctrl.deleteModule);

// Lessons
router.get('/modules/:moduleId/lessons', setOrgContext, optionalAuthenticate, ctrl.listLessons);
router.get('/lessons/:lessonId', setOrgContext, optionalAuthenticate, ctrl.getLesson);
router.post('/modules/:moduleId/lessons', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForModuleParam(['org_admin','instructor']), v.validateCreateLesson, handleValidation, ctrl.createLesson);
router.patch('/lessons/:lessonId', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForLessonParam(['org_admin','instructor']), ctrl.updateLesson);
router.put('/lessons/:lessonId/progress', authenticate, authorizeRoles('learner','admin','instructor'), v.validateUpdateLessonProgress, handleValidation, ctrl.updateLessonProgress);
router.delete('/lessons/:lessonId', setOrgContext, authenticate, authorizeRoles('instructor','admin'), requireOrgForLessonParam(['org_admin','instructor']), ctrl.deleteLesson);

// Enrollment & Progress
router.post('/courses/:courseId/enroll', authenticate, authorizeRoles('learner','admin','instructor'), ctrl.enroll);
router.get('/courses/:courseId/enrollment', authenticate, ctrl.getEnrollment);
router.get('/enrollments', authenticate, ctrl.getUserEnrollments);
router.get('/progress', authenticate, ctrl.getUserProgressSummary);
router.get('/courses/:courseId/progress', authenticate, ctrl.getCourseProgress);
router.get('/enrollments/:enrollmentId/progress', authenticate, ctrl.getProgress);
router.post('/progress', authenticate, v.validateUpsertProgress, handleValidation, ctrl.upsertProgress);
router.post('/courses/:courseId/complete', authenticate, ctrl.completeCourse);

// Reviews
router.post('/courses/:courseId/reviews', authenticate, authorizeRoles('learner','admin','instructor'), v.validateAddReview, handleValidation, ctrl.addReview);
router.get('/courses/:courseId/reviews', optionalAuthenticate, ctrl.listReviews);

// Favorites
router.post('/courses/:courseId/favorite', authenticate, authorizeRoles('learner','admin','instructor'), ctrl.addFavorite);
router.delete('/courses/:courseId/favorite', authenticate, authorizeRoles('learner','admin','instructor'), ctrl.removeFavorite);
router.get('/me/favorites', authenticate, ctrl.listFavorites);

// Analytics
router.get('/me/instructor/analytics', authenticate, authorizeRoles('instructor','admin'), analyticsCtrl.instructorOverview);
router.get('/admin/analytics/overview', authenticate, authorizeRoles('admin'), analyticsCtrl.adminOverview);

// Transactions
router.post('/transactions', authenticate, v.validateCreateTransaction, handleValidation, ctrl.createTransaction);
router.get('/transactions', authenticate, ctrl.getUserTransactions);
router.get('/transactions/:transactionId', authenticate, ctrl.getTransaction);

module.exports = router;


