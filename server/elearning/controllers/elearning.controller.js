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

const deleteCourse = async (req, res) => {
	const data = await service.deleteCourse(req.params.courseId);
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
const getLesson = async (req, res) => ok(res, await service.getLesson(req.params.lessonId, req.org?.id || null));
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
const getUserEnrollments = async (req, res) => ok(res, await service.getUserEnrollments(req.user.id));
const upsertProgress = async (req, res) => {
	try {
		const result = await service.upsertProgress(req.body, req.user.id);
		return ok(res, result);
	} catch (error) {
		console.error('Error in upsertProgress:', error.message);
		return res.status(400).json({ 
			error: error.message,
			message: 'Failed to update progress'
		});
	}
};
const updateLessonProgress = async (req, res) => {
	try {
		const result = await service.updateLessonProgress(req.user.id, req.params.lessonId, req.body);
		return ok(res, {
			message: "Progress updated successfully",
			progress: {
				id: result.id,
				user_id: req.user.id,
				lesson_id: req.params.lessonId,
				completed: result.is_completed,
				time_spent: result.time_spent_minutes,
				progress_percentage: result.progress_percentage,
				notes: result.notes,
				quiz_score: result.quiz_score,
				last_position: result.last_position_seconds,
				completed_at: result.completed_at,
				updated_at: result.updated_at
			}
		});
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};
const getUserProgressSummary = async (req, res) => ok(res, await service.getUserProgressSummary(req.user.id));
const getCourseProgress = async (req, res) => ok(res, await service.getCourseProgress(req.user.id, req.params.courseId));
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

// Transactions
const createTransaction = async (req, res) => created(res, await service.createTransaction(req.user.id, req.body));
const getTransaction = async (req, res) => {
	const data = await service.getTransaction(req.params.transactionId);
	if (!data) return notFound(res);
	return ok(res, data);
};
const getUserTransactions = async (req, res) => ok(res, await service.getUserTransactions(req.user.id));

// Test transaction creation for development/testing
const createTestTransaction = async (req, res) => {
	const { courseId } = req.params;
	const userId = req.user.id;
	
	// Create a test transaction for the course
	const transactionData = {
		type: 'course_purchase',
		amount: 0, // Free for testing
		currency: 'USD',
		status: 'completed',
		description: `Test purchase for course ${courseId}`,
		metadata: {
			course_id: courseId,
			test_transaction: true
		}
	};
	
	const transaction = await service.createTransaction(userId, transactionData);
	return created(res, transaction);
};

// Create test payment method for development/testing
const createTestPaymentMethod = async (req, res) => {
	try {
		const userId = req.user.id;
		const { executeQuery } = require('../../config/database');
		
		// Create a test payment method
		const { v4: uuidv4 } = require('uuid');
		const paymentMethodId = uuidv4();
		
		const query = `
			INSERT INTO payment_methods 
			(id, user_id, type, provider, account_details, is_default, is_active, created_at)
			VALUES (?, ?, 'stripe', 'test_provider', ?, 1, 1, NOW())
		`;
		
		const accountDetails = {
			card_number: "4242424242424242",
			expiry_month: 12,
			expiry_year: 2025,
			cvc: "123",
			test_mode: true
		};
		
		await executeQuery(query, [
			paymentMethodId,
			userId,
			JSON.stringify(accountDetails)
		]);
		
		// Get the created payment method
		const paymentMethod = await executeQuery(
			'SELECT * FROM payment_methods WHERE id = ?',
			[paymentMethodId]
		);
		
		return created(res, {
			message: 'Test payment method created successfully',
			payment_method: paymentMethod[0],
			payment_method_id: paymentMethod[0].id,
			instructions: {
				step1: 'Use the payment_method_id above in your transaction requests',
				step2: 'Example transaction request:',
				example: {
					url: 'POST http://localhost:3001/api/elearning/transactions',
					headers: {
						'Authorization': 'Bearer YOUR_JWT_TOKEN',
						'Content-Type': 'application/json'
					},
					body: {
						type: 'course_purchase',
						amount: 99.99,
						currency: 'USD',
						payment_method_id: paymentMethod[0].id,
						description: 'Course purchase with valid payment method',
						metadata: {
							course_id: 'course-123'
						}
					}
				}
			}
		});
	} catch (error) {
		console.error('Error creating test payment method:', error);
		return res.status(500).json({ 
			error: error.message,
			message: 'Failed to create test payment method. You can still create transactions without payment_method_id.'
		});
	}
};

// Additional endpoints
const getStudents = async (req, res) => ok(res, await service.getStudents({ ...req.query, organization_id: req.org?.id || null }));
const getTrendingCourses = async (req, res) => ok(res, await service.getTrendingCourses({ ...req.query, organization_id: req.org?.id || null }));
const getCategories = async (req, res) => ok(res, await service.getCategories());
const searchCourses = async (req, res) => {
	const { q } = req.query;
	if (!q) return bad(res, 'Search query is required');
	const data = await service.searchCourses(q, { ...req.query, organization_id: req.org?.id || null });
	return ok(res, data);
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
	enroll,
	getEnrollment,
	getUserEnrollments,
	upsertProgress,
	updateLessonProgress,
	getUserProgressSummary,
	getCourseProgress,
	getProgress,
	completeCourse,
	addReview,
	listReviews,
	addFavorite,
	removeFavorite,
	listFavorites,
	recommend,
	createTransaction,
	getTransaction,
	getUserTransactions,
	createTestTransaction,
	createTestPaymentMethod,
	getStudents,
	getTrendingCourses,
	getCategories,
	searchCourses
};


