const { executeQuery } = require('../../config/database');

const enroll = async (courseId, userId) => {
	await executeQuery(
		`INSERT INTO course_enrollments (id, course_id, user_id) VALUES (UUID(), ?, ?)`,
		[courseId, userId]
	);
	const rows = await executeQuery(`SELECT * FROM course_enrollments WHERE course_id = ? AND user_id = ?`, [courseId, userId]);
	return rows[0] || null;
};

const getEnrollment = async (courseId, userId) => {
	const rows = await executeQuery(`SELECT * FROM course_enrollments WHERE course_id = ? AND user_id = ?`, [courseId, userId]);
	return rows[0] || null;
};

const updateEnrollment = async (enrollmentId, updates) => {
	const set = [];
	const params = [];
	Object.entries(updates).forEach(([k, v]) => { set.push(`${k} = ?`); params.push(v); });
	params.push(enrollmentId);
	await executeQuery(`UPDATE course_enrollments SET ${set.join(', ')} WHERE id = ?`, params);
	const rows = await executeQuery(`SELECT * FROM course_enrollments WHERE id = ?`, [enrollmentId]);
	return rows[0] || null;
};

const getUserEnrollments = async (userId) => {
	const rows = await executeQuery(
		`SELECT ce.*, c.title as course_title, c.price, c.currency, c.thumbnail, c.instructor_id
		 FROM course_enrollments ce
		 JOIN courses c ON ce.course_id = c.id
		 WHERE ce.user_id = ?
		 ORDER BY ce.enrollment_date DESC`,
		[userId]
	);
	return rows;
};

const getStudentsWithProgress = async ({ limit = 20, offset = 0, organization_id = null }) => {
	const where = [];
	const params = [];
	
	if (organization_id) {
		where.push('(c.organization_id = ? OR c.organization_id IS NULL)');
		params.push(organization_id);
	} else {
		where.push('c.organization_id IS NULL');
	}
	
	const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
	const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, parseInt(limit, 10)) : 20;
	const safeOffset = Number.isFinite(Number(offset)) ? Math.max(0, parseInt(offset, 10)) : 0;
	
	const sql = `
		SELECT 
			ce.id as enrollment_id,
			ce.user_id,
			ce.course_id,
			ce.enrollment_date,
			ce.completion_date,
			ce.status as enrollment_status,
			c.title as course_title,
			c.category,
			c.level,
			c.price,
			c.currency,
			c.thumbnail,
			u.email,
			u.first_name,
			u.last_name,
			COALESCE(progress_summary.total_lessons, 0) as total_lessons,
			COALESCE(progress_summary.completed_lessons, 0) as completed_lessons,
			COALESCE(progress_summary.progress_percentage, 0) as progress_percentage,
			COALESCE(progress_summary.total_time_spent, 0) as total_time_spent_minutes
		FROM course_enrollments ce
		JOIN courses c ON ce.course_id = c.id
		JOIN users u ON ce.user_id = u.id
		LEFT JOIN (
			SELECT 
				enrollment_id,
				COUNT(*) as total_lessons,
				SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons,
				ROUND((SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as progress_percentage,
				SUM(time_spent_minutes) as total_time_spent
			FROM lesson_progress lp
			GROUP BY enrollment_id
		) progress_summary ON ce.id = progress_summary.enrollment_id
		${whereSql}
		ORDER BY ce.enrollment_date DESC
		LIMIT ${safeLimit} OFFSET ${safeOffset}
	`;
	
	return executeQuery(sql, params);
};

module.exports = {
	enroll,
	getEnrollment,
	updateEnrollment,
	getUserEnrollments,
	getStudentsWithProgress
};


