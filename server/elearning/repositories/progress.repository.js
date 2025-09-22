const { executeQuery } = require('../../config/database');

const upsertProgress = async ({ enrollment_id, lesson_id, is_completed, time_spent_minutes, last_position_seconds }) => {
	const existing = await executeQuery(`SELECT id FROM course_progress WHERE enrollment_id = ? AND lesson_id = ?`, [enrollment_id, lesson_id]);
	if (existing.length) {
		const id = existing[0].id;
		await executeQuery(
			`UPDATE course_progress SET is_completed = ?, time_spent_minutes = ?, last_position_seconds = ?, completed_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id = ?`,
			[is_completed ? 1 : 0, time_spent_minutes ?? 0, last_position_seconds ?? 0, is_completed ? 1 : 0, id]
		);
		const rows = await executeQuery(`SELECT * FROM course_progress WHERE id = ?`, [id]);
		return rows[0] || null;
	}
	await executeQuery(
		`INSERT INTO course_progress (id, enrollment_id, lesson_id, is_completed, time_spent_minutes, last_position_seconds, completed_at) VALUES (UUID(), ?, ?, ?, ?, ?, CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END)`,
		[enrollment_id, lesson_id, is_completed ? 1 : 0, time_spent_minutes ?? 0, last_position_seconds ?? 0, is_completed ? 1 : 0]
	);
	const rows = await executeQuery(`SELECT * FROM course_progress WHERE enrollment_id = ? AND lesson_id = ?`, [enrollment_id, lesson_id]);
	return rows[0] || null;
};

const getProgressForEnrollment = async (enrollmentId) => {
	return executeQuery(`SELECT * FROM course_progress WHERE enrollment_id = ?`, [enrollmentId]);
};

module.exports = { upsertProgress, getProgressForEnrollment };


