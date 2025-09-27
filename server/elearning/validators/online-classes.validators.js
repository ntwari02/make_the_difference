const { body, param, query } = require('express-validator');

// Online Classes Validators
const validateCreateOnlineClass = [
	body('course_id').isString().isLength({ min: 10 }),
	body('title').isString().isLength({ min: 5, max: 255 }),
	body('description').optional().isString().isLength({ max: 2000 }),
	body('class_type').optional().isIn(['live', 'recorded', 'hybrid']),
	body('start_time').isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
	body('end_time').isISO8601().withMessage('End time must be a valid ISO 8601 date'),
	body('duration_minutes').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
	body('max_participants').optional().isInt({ min: 1, max: 1000 }),
	body('is_recording_enabled').optional().isBoolean(),
	body('is_chat_enabled').optional().isBoolean(),
	body('is_screen_share_enabled').optional().isBoolean(),
	body('is_participant_video_enabled').optional().isBoolean(),
	body('is_participant_audio_enabled').optional().isBoolean()
];

const validateUpdateOnlineClass = [
	param('classId').isString().isLength({ min: 10 }),
	body('title').optional().isString().isLength({ min: 5, max: 255 }),
	body('description').optional().isString().isLength({ max: 2000 }),
	body('class_type').optional().isIn(['live', 'recorded', 'hybrid']),
	body('status').optional().isIn(['scheduled', 'live', 'completed', 'cancelled']),
	body('start_time').optional().isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
	body('end_time').optional().isISO8601().withMessage('End time must be a valid ISO 8601 date'),
	body('duration_minutes').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
	body('max_participants').optional().isInt({ min: 1, max: 1000 }),
	body('meeting_url').optional().isURL(),
	body('meeting_password').optional().isString().isLength({ min: 4, max: 20 }),
	body('recording_url').optional().isURL(),
	body('is_recording_enabled').optional().isBoolean(),
	body('is_chat_enabled').optional().isBoolean(),
	body('is_screen_share_enabled').optional().isBoolean(),
	body('is_participant_video_enabled').optional().isBoolean(),
	body('is_participant_audio_enabled').optional().isBoolean()
];

const validateClassId = [
	param('classId').isString().isLength({ min: 10 })
];

const validateEnrollInClass = [
	param('classId').isString().isLength({ min: 10 })
];

const validateClassFilters = [
	query('course_id').optional().isString().isLength({ min: 10 }),
	query('instructor_id').optional().isString().isLength({ min: 10 }),
	query('status').optional().isIn(['scheduled', 'live', 'completed', 'cancelled']),
	query('class_type').optional().isIn(['live', 'recorded', 'hybrid']),
	query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
	query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
	query('limit').optional().isInt({ min: 1, max: 100 }),
	query('page').optional().isInt({ min: 1 })
];

const validateAddClassMaterial = [
	param('classId').isString().isLength({ min: 10 }),
	body('title').isString().isLength({ min: 3, max: 255 }),
	body('description').optional().isString().isLength({ max: 1000 }),
	body('file_url').optional().isURL(),
	body('file_type').optional().isString().isLength({ max: 50 }),
	body('file_size').optional().isInt({ min: 0 }),
	body('is_required').optional().isBoolean()
];

const validateAddChatMessage = [
	param('classId').isString().isLength({ min: 10 }),
	body('message').isString().isLength({ min: 1, max: 1000 }),
	body('message_type').optional().isIn(['text', 'file', 'image', 'system']),
	body('is_public').optional().isBoolean()
];

const validateChatFilters = [
	param('classId').isString().isLength({ min: 10 }),
	query('limit').optional().isInt({ min: 1, max: 100 }),
	query('page').optional().isInt({ min: 1 })
];

module.exports = {
	validateCreateOnlineClass,
	validateUpdateOnlineClass,
	validateClassId,
	validateEnrollInClass,
	validateClassFilters,
	validateAddClassMaterial,
	validateAddChatMessage,
	validateChatFilters
};
