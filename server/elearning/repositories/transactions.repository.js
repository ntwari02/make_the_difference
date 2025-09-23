const { executeQuery } = require('../../config/database');

const hasCompletedCoursePurchase = async (userId, courseId) => {
	const rows = await executeQuery(
		`SELECT id FROM transactions 
		 WHERE user_id = ? 
		   AND type = 'course_purchase' 
		   AND status = 'completed' 
		   AND (
		     JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.course_id')) = ?
		     OR JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.courseId')) = ?
		     OR JSON_CONTAINS(JSON_EXTRACT(metadata, '$.course_ids'), JSON_QUOTE(?))
		   )
		 LIMIT 1`,
		[userId, courseId, courseId, courseId]
	);
	return rows.length > 0;
};

const getCourseRevenue = async (courseId) => {
	const rows = await executeQuery(
		`SELECT COALESCE(SUM(amount), 0) AS total_amount 
		 FROM transactions 
		 WHERE type = 'course_purchase' 
		   AND status = 'completed' 
		   AND (
		     JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.course_id')) = ?
		     OR JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.courseId')) = ?
		     OR JSON_CONTAINS(JSON_EXTRACT(metadata, '$.course_ids'), JSON_QUOTE(?))
		   )`,
		[courseId, courseId, courseId]
	);
	return Number(rows[0]?.total_amount || 0);
};

const getInstructorRevenue = async (instructorId) => {
	const rows = await executeQuery(
		`SELECT COALESCE(SUM(t.amount), 0) AS total_amount
		 FROM transactions t
		 JOIN courses c ON JSON_UNQUOTE(JSON_EXTRACT(t.metadata, '$.course_id')) = c.id
		 WHERE t.type = 'course_purchase' AND t.status = 'completed' AND c.instructor_id = ?`,
		[instructorId]
	);
	return Number(rows[0]?.total_amount || 0);
};

const createTransaction = async (transaction) => {
	const result = await executeQuery(
		`INSERT INTO transactions (id, user_id, type, amount, currency, status, payment_method_id, external_transaction_id, description, metadata)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			transaction.id,
			transaction.user_id,
			transaction.type,
			transaction.amount,
			transaction.currency,
			transaction.status,
			transaction.payment_method_id || null,
			transaction.external_transaction_id || null,
			transaction.description || null,
			JSON.stringify(transaction.metadata || {})
		]
	);
	return { id: transaction.id, ...transaction };
};

const getTransactionById = async (transactionId) => {
	const rows = await executeQuery(
		`SELECT * FROM transactions WHERE id = ?`,
		[transactionId]
	);
	return rows[0] || null;
};

const getUserTransactions = async (userId) => {
	const rows = await executeQuery(
		`SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC`,
		[userId]
	);
	return rows;
};

module.exports = { 
	hasCompletedCoursePurchase, 
	getCourseRevenue, 
	getInstructorRevenue,
	createTransaction,
	getTransactionById,
	getUserTransactions
};


