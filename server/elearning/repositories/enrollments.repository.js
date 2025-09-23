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

module.exports = {
	enroll,
	getEnrollment,
	updateEnrollment,
	getUserEnrollments
};


