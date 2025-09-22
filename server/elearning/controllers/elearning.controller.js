const service = require('../services/elearning.service');

// Helpers
const ok = (res, data) => res.json(data);
const created = (res, data) => res.status(201).json(data);
const bad = (res, message) => res.status(400).json({ message });
const notFound = (res) => res.status(404).json({ message: 'Not found' });

// Courses
const listCourses = async (req, res) => {
	const data = await service.listCourses({ ...req.query, organization_id: req.org?.id || null });
	return ok(res, data);
};

const getCourse = async (req, res) => {
	const data = await service.getCourse(req.params.courseId);
	if (!data) return notFound(res);
	return ok(res, data);
};

const createCourse = async (req, res) => {
	const orgId = req.org?.id || null;
	const data = await service.createCourse(req.user.id, req.body, orgId);
	return created(res, data);
};

const updateCourse = async (req, res) => {
	const data = await service.updateCourse(req.params.courseId, req.body);
	return ok(res, data);
};

const setCourseStatus = async (req, res) => {
	const { status } = req.body;
	const data = await service.setCourseStatus(req.params.courseId, status);
	return ok(res, data);
};

// Modules
const listModules = async (req, res) => ok(res, await service.listModules(req.params.courseId, req.org?.id || null));
const createModule = async (req, res) => created(res, await service.createModule(req.params.courseId, req.body));
const updateModule = async (req, res) => ok(res, await service.updateModule(req.params.moduleId, req.body));
const deleteModule = async (req, res) => ok(res, await service.deleteModule(req.params.moduleId));

// Lessons
const listLessons = async (req, res) => ok(res, await service.listLessons(req.params.moduleId, req.org?.id || null));
const createLesson = async (req, res) => created(res, await service.createLesson(req.params.moduleId, req.body));
const updateLesson = async (req, res) => ok(res, await service.updateLesson(req.params.lessonId, req.body));
const deleteLesson = async (req, res) => ok(res, await service.deleteLesson(req.params.lessonId));

// Enrollment & Progress
const enroll = async (req, res) => created(res, await service.enrollInCourse(req.params.courseId, req.user.id));
const getEnrollment = async (req, res) => {
	const data = await service.getEnrollment(req.params.courseId, req.user.id);
	if (!data) return notFound(res);
	return ok(res, data);
};
const upsertProgress = async (req, res) => ok(res, await service.upsertProgress(req.body));
const getProgress = async (req, res) => ok(res, await service.getProgress(req.params.enrollmentId));
const completeCourse = async (req, res) => ok(res, await service.markEnrollmentComplete(req.params.courseId, req.user.id));

// Reviews
const addReview = async (req, res) => created(res, await service.addReview(req.params.courseId, req.user.id, req.body));
const listReviews = async (req, res) => ok(res, await service.listReviews(req.params.courseId, req.query));

// Favorites
const addFavorite = async (req, res) => ok(res, await service.addFavorite(req.user.id, req.params.courseId));
const removeFavorite = async (req, res) => ok(res, await service.removeFavorite(req.user.id, req.params.courseId));
const listFavorites = async (req, res) => ok(res, await service.listFavorites(req.user.id));
const recommend = async (req, res) => ok(res, await service.recommendCoursesForUser(req.user?.id, { ...req.query, organization_id: req.org?.id || null }));

module.exports = {
	listCourses,
	getCourse,
	createCourse,
	updateCourse,
	setCourseStatus,
	listModules,
	createModule,
	updateModule,
	deleteModule,
	listLessons,
	createLesson,
	updateLesson,
	deleteLesson,
	enroll,
	getEnrollment,
	upsertProgress,
	getProgress,
	completeCourse,
	addReview,
	listReviews,
	addFavorite,
	removeFavorite,
	listFavorites,
	recommend
};


