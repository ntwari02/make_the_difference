const { body, param, query } = require('express-validator');

// Courses
const validateCreateCourse = [
	body('title').isString().isLength({ min: 3 }),
	body('description').isString().isLength({ min: 10 }),
	body('price').optional().isFloat({ min: 0 }),
	body('currency').optional().isString().isLength({ min: 3, max: 3 }),
	body('category').isString(),
	body('level').isIn(['beginner','intermediate','advanced','expert']),
	body('language').optional().isString(),
	body('duration_hours').isInt({ min: 1 })
];

const validateUpdateCourseStatus = [
	param('courseId').isString().isLength({ min: 10 }),
	body('status').isIn(['draft','pending_review','approved','rejected','published'])
];

// Modules
const validateCreateModule = [
	param('courseId').isString().isLength({ min: 10 }),
	body('title').isString().isLength({ min: 3 }),
	body('order_index').isInt({ min: 0 })
];

// Lessons
const validateCreateLesson = [
	param('moduleId').isString().isLength({ min: 10 }),
	body('title').isString().isLength({ min: 3 }),
	body('content_type').isIn(['video','text','quiz','assignment','live']),
	body('order_index').isInt({ min: 0 })
];

// Enrollment & Progress
const validateUpsertProgress = [
	body('enrollment_id').isString().isLength({ min: 10 }),
	body('lesson_id').isString().isLength({ min: 10 }),
	body('is_completed').optional().isBoolean(),
	body('time_spent_minutes').optional().isInt({ min: 0 }),
	body('last_position_seconds').optional().isInt({ min: 0 })
];

// Reviews
const validateAddReview = [
	body('rating').isInt({ min: 1, max: 5 }),
	body('comment').optional().isString()
];

module.exports = {
	validateCreateCourse,
	validateUpdateCourseStatus,
	validateCreateModule,
	validateCreateLesson,
	validateUpsertProgress,
	validateAddReview
};


