const { executeQuery } = require('../../config/database');

const upsertProgress = async ({ enrollment_id, lesson_id, is_completed, time_spent_minutes, last_position_seconds, notes, quiz_score, progress_percentage }) => {
	const existing = await executeQuery(`SELECT id FROM course_progress WHERE enrollment_id = ? AND lesson_id = ?`, [enrollment_id, lesson_id]);
	if (existing.length) {
		const id = existing[0].id;
		await executeQuery(
			`UPDATE course_progress SET 
				is_completed = ?, 
				time_spent_minutes = ?, 
				last_position_seconds = ?, 
				notes = ?,
				quiz_score = ?,
				progress_percentage = ?,
				completed_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE completed_at END,
				updated_at = CURRENT_TIMESTAMP
			 WHERE id = ?`,
			[is_completed ? 1 : 0, time_spent_minutes ?? 0, last_position_seconds ?? 0, notes || null, quiz_score || null, progress_percentage || 0, is_completed ? 1 : 0, id]
		);
		const rows = await executeQuery(`SELECT * FROM course_progress WHERE id = ?`, [id]);
		return rows[0] || null;
	}
	await executeQuery(
		`INSERT INTO course_progress (id, enrollment_id, lesson_id, is_completed, time_spent_minutes, last_position_seconds, notes, quiz_score, progress_percentage, completed_at) 
		 VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END)`,
		[enrollment_id, lesson_id, is_completed ? 1 : 0, time_spent_minutes ?? 0, last_position_seconds ?? 0, notes || null, quiz_score || null, progress_percentage || 0, is_completed ? 1 : 0]
	);
	const rows = await executeQuery(`SELECT * FROM course_progress WHERE enrollment_id = ? AND lesson_id = ?`, [enrollment_id, lesson_id]);
	return rows[0] || null;
};

const updateLessonProgress = async (userId, lessonId, progressData) => {
	// First, get the enrollment for this user and lesson
	const enrollmentQuery = `
		SELECT ce.id as enrollment_id 
		FROM course_enrollments ce
		JOIN course_lessons cl ON ce.course_id = (
			SELECT course_id FROM course_modules WHERE id = cl.module_id
		)
		WHERE ce.user_id = ? AND cl.id = ?
	`;
	const enrollments = await executeQuery(enrollmentQuery, [userId, lessonId]);
	
	if (enrollments.length === 0) {
		throw new Error('User is not enrolled in this course or lesson does not exist');
	}
	
	const enrollmentId = enrollments[0].enrollment_id;
	
	// Update progress with the new data
	const {
		completed = false,
		time_spent = 0,
		progress_percentage = 0,
		notes = null,
		quiz_score = null,
		last_position = 0
	} = progressData;
	
	return upsertProgress({
		enrollment_id: enrollmentId,
		lesson_id: lessonId,
		is_completed: completed,
		time_spent_minutes: time_spent,
		progress_percentage: progress_percentage,
		notes: notes,
		quiz_score: quiz_score,
		last_position_seconds: last_position
	});
};

const getProgressForEnrollment = async (enrollmentId) => {
	return executeQuery(`SELECT * FROM course_progress WHERE enrollment_id = ?`, [enrollmentId]);
};

const getUserProgressSummary = async (userId) => {
	const rows = await executeQuery(`
		SELECT 
			cp.*,
			cl.title as lesson_title,
			cl.content_type,
			cl.duration_minutes,
			cm.title as module_title,
			c.title as course_title,
			c.id as course_id
		FROM course_progress cp
		JOIN course_lessons cl ON cp.lesson_id = cl.id
		JOIN course_modules cm ON cl.module_id = cm.id
		JOIN courses c ON cm.course_id = c.id
		JOIN course_enrollments ce ON cp.enrollment_id = ce.id
		WHERE ce.user_id = ?
		ORDER BY cp.updated_at DESC
	`, [userId]);
	return rows;
};

const getCourseProgress = async (userId, courseId) => {
	const rows = await executeQuery(`
		SELECT 
			cp.*,
			cl.title as lesson_title,
			cl.content_type,
			cl.duration_minutes,
			cl.order_index as lesson_order,
			cm.title as module_title,
			cm.order_index as module_order
		FROM course_progress cp
		JOIN course_lessons cl ON cp.lesson_id = cl.id
		JOIN course_modules cm ON cl.module_id = cm.id
		JOIN course_enrollments ce ON cp.enrollment_id = ce.id
		WHERE ce.user_id = ? AND cm.course_id = ?
		ORDER BY cm.order_index, cl.order_index
	`, [userId, courseId]);
	return rows;
};

module.exports = { 
	upsertProgress, 
	getProgressForEnrollment, 
	updateLessonProgress,
	getUserProgressSummary,
	getCourseProgress
};


