const { executeQuery } = require('../../config/database');

const addFavorite = async (userId, courseId) => {
	await executeQuery(`INSERT INTO course_favorites (id, user_id, course_id) VALUES (UUID(), ?, ?)`, [userId, courseId]);
	return { success: true };
};

const removeFavorite = async (userId, courseId) => {
	await executeQuery(`DELETE FROM course_favorites WHERE user_id = ? AND course_id = ?`, [userId, courseId]);
	return { success: true };
};

const getUserFavorites = async (userId) => {
	return executeQuery(`
		SELECT c.* FROM course_favorites f
		JOIN courses c ON c.id = f.course_id
		WHERE f.user_id = ?
		ORDER BY f.created_at DESC
	`, [userId]);
};

module.exports = { addFavorite, removeFavorite, getUserFavorites };


