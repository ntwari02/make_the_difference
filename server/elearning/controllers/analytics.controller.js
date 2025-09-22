const { executeQuery } = require('../../config/database');
const transactionsRepo = require('../repositories/transactions.repository');

const instructorOverview = async (req, res) => {
	const instructorId = req.user.id;
	const courses = await executeQuery(`SELECT id, title, student_count, rating, review_count FROM courses WHERE instructor_id = ?`, [instructorId]);
	const totalRevenue = await transactionsRepo.getInstructorRevenue(instructorId);
	return res.json({ courses, totalRevenue });
};

const adminOverview = async (req, res) => {
	const mostPopular = await executeQuery(`SELECT id, title, student_count FROM courses ORDER BY student_count DESC LIMIT 10`);
	const topInstructors = await executeQuery(`SELECT instructor_id, COUNT(*) as courses_count, SUM(student_count) as total_students FROM courses GROUP BY instructor_id ORDER BY total_students DESC LIMIT 10`);
	const revenuePerCourse = await executeQuery(`SELECT JSON_EXTRACT(metadata, '$.course_id') as course_id, SUM(amount) as revenue FROM transactions WHERE type='course_purchase' AND status='completed' GROUP BY JSON_EXTRACT(metadata, '$.course_id') ORDER BY revenue DESC LIMIT 50`);
	return res.json({ mostPopular, topInstructors, revenuePerCourse });
};

module.exports = { instructorOverview, adminOverview };


