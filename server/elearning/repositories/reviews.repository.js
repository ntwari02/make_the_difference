const { executeQuery } = require('../../config/database');

const addOrUpdateReview = async ({ id, course_id, user_id, rating, comment }) => {
	// Upsert using unique (course_id, user_id)
	const existing = await executeQuery(`SELECT id FROM course_reviews WHERE course_id = ? AND user_id = ?`, [course_id, user_id]);
	if (existing.length) {
		const reviewId = existing[0].id;
		await executeQuery(`UPDATE course_reviews SET rating = ?, comment = ? WHERE id = ?`, [rating, comment || null, reviewId]);
		const rows = await executeQuery(`SELECT * FROM course_reviews WHERE id = ?`, [reviewId]);
		return rows[0] || null;
	}
	await executeQuery(`INSERT INTO course_reviews (id, course_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)`, [id, course_id, user_id, rating, comment || null]);
	const rows = await executeQuery(`SELECT * FROM course_reviews WHERE id = ?`, [id]);
	return rows[0] || null;
};

const getCourseReviews = async (courseId, { limit = 50, offset = 0 } = {}) => {
	const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, parseInt(limit, 10)) : 50;
	const safeOffset = Number.isFinite(Number(offset)) ? Math.max(0, parseInt(offset, 10)) : 0;
	const sql = `SELECT * FROM course_reviews WHERE course_id = ? ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
	return executeQuery(sql, [courseId]);
};

module.exports = { addOrUpdateReview, getCourseReviews };


