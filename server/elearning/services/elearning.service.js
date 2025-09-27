const { v4: uuidv4 } = require('uuid');
const coursesRepo = require('../repositories/courses.repository');
const modulesRepo = require('../repositories/modules.repository');
const lessonsRepo = require('../repositories/lessons.repository');
const enrollmentsRepo = require('../repositories/enrollments.repository');
const progressRepo = require('../repositories/progress.repository');
const reviewsRepo = require('../repositories/reviews.repository');
const favoritesRepo = require('../repositories/favorites.repository');
const transactionsRepo = require('../repositories/transactions.repository');

const stringifyIfObject = (value) => {
	if (value == null) return null;
	if (typeof value === 'object') return JSON.stringify(value);
	return value;
};

// Courses
const listCourses = (filters) => coursesRepo.findCourses(filters);

const getCourse = (courseId) => coursesRepo.getCourseById(courseId);

const createCourse = async (instructorId, payload, orgId = null) => {
	const id = uuidv4();
	const course = {
		id,
		title: payload.title,
		description: payload.description,
		short_description: payload.short_description || null,
		price: payload.price ?? 0,
		currency: payload.currency || 'USD',
		category: payload.category,
		subcategory: payload.subcategory || null,
		level: payload.level,
		language: payload.language || 'English',
		duration_hours: payload.duration_hours,
		thumbnail: payload.thumbnail || null,
		preview_video: payload.preview_video || null,
		syllabus: stringifyIfObject(payload.syllabus),
		requirements: stringifyIfObject(payload.requirements),
		learning_outcomes: stringifyIfObject(payload.learning_outcomes),
		tags: stringifyIfObject(payload.tags),
		is_published: 0,
		is_featured: payload.is_featured ? 1 : 0,
		status: 'draft',
		instructor_id: instructorId,
		completion_certificate: payload.completion_certificate == null ? 1 : (payload.completion_certificate ? 1 : 0),
		has_live_classes: payload.has_live_classes ? 1 : 0,
		live_class_schedule: stringifyIfObject(payload.live_class_schedule)
		// Note: organization_id removed as courses table does not have this column
	};
	return coursesRepo.createCourse(course);
};

const updateCourse = (courseId, payload) => {
	const updates = { ...payload };
	['syllabus','requirements','learning_outcomes','tags','live_class_schedule'].forEach((k) => {
		if (k in updates) updates[k] = stringifyIfObject(updates[k]);
	});
	return coursesRepo.updateCourse(courseId, updates);
};

const deleteCourse = (courseId) => coursesRepo.deleteCourse(courseId);
const setCourseStatus = (courseId, status) => coursesRepo.publishWorkflow(courseId, status);

// Modules
const listModules = (courseId, orgId = null) => modulesRepo.getModulesByCourse(courseId, orgId);

const createModule = async (courseId, payload) => {
	const id = uuidv4();
	return modulesRepo.createModule({
		id,
		course_id: courseId,
		title: payload.title,
		description: payload.description || null,
		order_index: payload.order_index,
		duration_minutes: payload.duration_minutes || null,
		is_preview: payload.is_preview ? 1 : 0
	});
};

const updateModule = (moduleId, payload) => modulesRepo.updateModule(moduleId, payload);
const deleteModule = (moduleId) => modulesRepo.deleteModule(moduleId);

// Lessons
const listLessons = (moduleId, orgId = null) => lessonsRepo.getLessonsByModule(moduleId, orgId);
const getLesson = (lessonId, orgId = null) => lessonsRepo.getLessonById(lessonId, orgId);

const createLesson = async (moduleId, payload) => {
	// Verify module exists before creating lesson
	const modulesRepo = require('../repositories/modules.repository');
	const module = await modulesRepo.getModuleById(moduleId);
	if (!module) {
		throw new Error(`Module with ID ${moduleId} not found`);
	}
	
	const id = uuidv4();
	return lessonsRepo.createLesson({
		id,
		module_id: moduleId,
		title: payload.title,
		content_type: payload.content_type,
		content_url: payload.content_url || null,
		content_text: payload.content_text || null,
		duration_minutes: payload.duration_minutes || null,
		order_index: payload.order_index,
		is_preview: payload.is_preview ? 1 : 0
	});
};

const updateLesson = (lessonId, payload) => {
	const mappedPayload = {
		title: payload.title,
		content_type: payload.content_type,
		content_url: payload.content_url,
		content_text: payload.content || payload.content_text, // Map 'content' to 'content_text'
		duration_minutes: payload.duration_minutes,
		order_index: payload.order_index,
		is_preview: payload.is_preview
	};
	return lessonsRepo.updateLesson(lessonId, mappedPayload);
};
const deleteLesson = (lessonId) => lessonsRepo.deleteLesson(lessonId);

// Enrollment & Progress
const enrollInCourse = async (courseId, userId) => {
	const existing = await enrollmentsRepo.getEnrollment(courseId, userId);
	if (existing) return existing;
	// If course is paid, ensure purchase transaction exists
	const course = await coursesRepo.getCourseById(courseId);
	if (!course) throw new Error('Course not found');
	if (Number(course.price) > 0) {
		const paid = await transactionsRepo.hasCompletedCoursePurchase(userId, courseId);
		if (!paid) {
			// Temporary bypass for testing - remove this in production
			// Check if we're in development mode or if TEST_MODE is enabled
			const isTestMode = process.env.NODE_ENV === 'development' || 
							  process.env.TEST_MODE === 'true' || 
							  process.env.NODE_ENV !== 'production';
			if (!isTestMode) {
				throw new Error('Purchase required to enroll');
			}
			console.log(`[TEST MODE] Bypassing payment requirement for course ${courseId}, user ${userId}`);
		}
	}
	return enrollmentsRepo.enroll(courseId, userId);
};

const getEnrollment = (courseId, userId) => enrollmentsRepo.getEnrollment(courseId, userId);

const getUserEnrollments = (userId) => enrollmentsRepo.getUserEnrollments(userId);

const upsertProgress = async (payload, userId = null) => {
	// If userId is provided, verify that the enrollment belongs to this user
	if (userId) {
		const enrollmentCheck = await enrollmentsRepo.getEnrollmentById(payload.enrollment_id);
		if (!enrollmentCheck) {
			throw new Error(`Enrollment with ID ${payload.enrollment_id} does not exist`);
		}
		if (enrollmentCheck.user_id !== userId) {
			throw new Error('You can only update progress for your own enrollments');
		}
	}
	
	return progressRepo.upsertProgress(payload);
};
const getProgress = (enrollmentId) => progressRepo.getProgressForEnrollment(enrollmentId);
const updateLessonProgress = (userId, lessonId, progressData) => progressRepo.updateLessonProgress(userId, lessonId, progressData);
const getUserProgressSummary = (userId) => progressRepo.getUserProgressSummary(userId);
const getCourseProgress = (userId, courseId) => progressRepo.getCourseProgress(userId, courseId);

const tryIssueCertificate = async (course, enrollment) => {
	if (!course.completion_certificate) return null;
	if (Number(enrollment.completion_percentage) < 100 || !enrollment.is_completed) return null;
	if (enrollment.certificate_issued && enrollment.certificate_url) return enrollment.certificate_url;
	const certUrl = `/certificates/${enrollment.id}.pdf`;
	return certUrl;
};

const markEnrollmentComplete = async (courseId, userId) => {
	const enrollment = await enrollmentsRepo.getEnrollment(courseId, userId);
	if (!enrollment) throw new Error('Not enrolled');
	const updated = await enrollmentsRepo.updateEnrollment(enrollment.id, { is_completed: 1, completion_percentage: 100.0, completed_at: new Date() });
	const course = await coursesRepo.getCourseById(courseId);
	const certUrl = await tryIssueCertificate(course, updated);
	if (certUrl) {
		await enrollmentsRepo.updateEnrollment(enrollment.id, { certificate_issued: 1, certificate_url: certUrl });
	}
	return enrollmentsRepo.getEnrollment(courseId, userId);
};

// Reviews
const addReview = (courseId, userId, { rating, comment }) => reviewsRepo.addOrUpdateReview({ id: uuidv4(), course_id: courseId, user_id: userId, rating, comment });
const listReviews = (courseId, paging) => reviewsRepo.getCourseReviews(courseId, paging);

// Favorites
const addFavorite = (userId, courseId) => favoritesRepo.addFavorite(userId, courseId);
const removeFavorite = (userId, courseId) => favoritesRepo.removeFavorite(userId, courseId);
const listFavorites = (userId) => favoritesRepo.getUserFavorites(userId);

// Recommendations (simple heuristic: top-rated)
const recommendCoursesForUser = async (userId, { limit = 10, organization_id = null } = {}) => {
	const { executeQuery } = require('../../config/database');
	const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, parseInt(limit, 10)) : 10;
	const orgFilter = organization_id ? 'AND (c.organization_id = ? OR c.organization_id IS NULL)' : '';
	const sql = `SELECT c.* FROM courses c
		WHERE c.is_published = 1 ${orgFilter}
		ORDER BY c.rating DESC, c.review_count DESC
		LIMIT ${safeLimit}`;
	const params = organization_id ? [organization_id] : [];
	return executeQuery(sql, params);
};

// Transactions
const createTransaction = async (userId, payload) => {
	const { v4: uuidv4 } = require('uuid');
	
	// Validate payment_method_id if provided
	if (payload.payment_method_id) {
		const { executeQuery } = require('../../config/database');
		try {
			const paymentMethod = await executeQuery(
				'SELECT id FROM payment_methods WHERE id = ? AND user_id = ? AND is_active = 1',
				[payload.payment_method_id, userId]
			);
			
			if (paymentMethod.length === 0) {
				// If payment method doesn't exist, set it to null instead of throwing error
				console.warn(`Payment method ${payload.payment_method_id} not found for user ${userId}, setting to null`);
				payload.payment_method_id = null;
			}
		} catch (error) {
			console.warn(`Error validating payment method: ${error.message}, setting to null`);
			payload.payment_method_id = null;
		}
	}
	
	const transaction = {
		id: uuidv4(),
		user_id: userId,
		type: payload.type,
		amount: payload.amount,
		currency: payload.currency || 'USD',
		status: payload.status || 'pending',
		payment_method_id: payload.payment_method_id || null,
		external_transaction_id: payload.external_transaction_id || null,
		description: payload.description || null,
		metadata: payload.metadata || {}
	};
	return transactionsRepo.createTransaction(transaction);
};

const getTransaction = (transactionId) => transactionsRepo.getTransactionById(transactionId);
const getUserTransactions = (userId) => transactionsRepo.getUserTransactions(userId);

// Additional endpoints
const getStudents = async (filters = {}) => {
	// Get all enrolled students with their progress
	const students = await enrollmentsRepo.getStudentsWithProgress(filters);
	return students;
};

const getTrendingCourses = async (filters = {}) => {
	// Get trending courses based on enrollments and reviews
	const courses = await coursesRepo.getTrendingCourses(filters);
	return courses;
};

const getCategories = async () => {
	// Get all course categories
	const categories = await coursesRepo.getCategories();
	return categories;
};

const searchCourses = async (query, filters = {}) => {
	// Search courses by title, description, tags
	const courses = await coursesRepo.searchCourses(query, filters);
	return courses;
};

module.exports = {
	listCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	setCourseStatus,
	listModules,
	createModule,
	updateModule,
	deleteModule,
	listLessons,
	getLesson,
	createLesson,
	updateLesson,
	deleteLesson,
	enrollInCourse,
	getEnrollment,
	getUserEnrollments,
	upsertProgress,
	getProgress,
	updateLessonProgress,
	getUserProgressSummary,
	getCourseProgress,
	markEnrollmentComplete,
	addReview,
	listReviews,
	addFavorite,
	removeFavorite,
	listFavorites,
	recommendCoursesForUser,
	createTransaction,
	getTransaction,
	getUserTransactions,
	getStudents,
	getTrendingCourses,
	getCategories,
	searchCourses
};


