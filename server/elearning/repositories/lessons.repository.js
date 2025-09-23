const { executeQuery } = require('../../config/database');

const getLessonsByModule = async (moduleId, organizationId = null) => {
	if (organizationId) {
		return executeQuery(
			`SELECT l.* FROM course_lessons l
			 JOIN course_modules m ON m.id = l.module_id
			 JOIN courses c ON c.id = m.course_id
			 WHERE l.module_id = ? AND (c.organization_id = ? OR c.organization_id IS NULL)
			 ORDER BY l.order_index ASC`,
			[moduleId, organizationId]
		);
	}
	return executeQuery(
		`SELECT l.* FROM course_lessons l
		 JOIN course_modules m ON m.id = l.module_id
		 JOIN courses c ON c.id = m.course_id
		 WHERE l.module_id = ? AND c.organization_id IS NULL
		 ORDER BY l.order_index ASC`,
		[moduleId]
	);
};

const getLessonById = async (lessonId, organizationId = null) => {
	if (organizationId) {
		const rows = await executeQuery(
			`SELECT l.* FROM course_lessons l
			 JOIN course_modules m ON m.id = l.module_id
			 JOIN courses c ON c.id = m.course_id
			 WHERE l.id = ? AND (c.organization_id = ? OR c.organization_id IS NULL)
			 LIMIT 1`,
			[lessonId, organizationId]
		);
		return rows[0] || null;
	}
	const rows = await executeQuery(
		`SELECT l.* FROM course_lessons l
		 JOIN course_modules m ON m.id = l.module_id
		 JOIN courses c ON c.id = m.course_id
		 WHERE l.id = ? AND c.organization_id IS NULL
		 LIMIT 1`,
		[lessonId]
	);
	return rows[0] || null;
};

const createLesson = async (lesson) => {
	const fields = ['id','module_id','title','content_type','content_url','content_text','duration_minutes','order_index','is_preview'];
	const placeholders = fields.map(() => '?').join(',');
	const values = fields.map((f) => lesson[f] ?? null);
	await executeQuery(`INSERT INTO course_lessons (${fields.join(',')}) VALUES (${placeholders})`, values);
	const rows = await executeQuery(`SELECT * FROM course_lessons WHERE id = ?`, [lesson.id]);
	return rows[0] || null;
};

const updateLesson = async (lessonId, updates) => {
	const set = [];
	const params = [];
	Object.entries(updates).forEach(([k, v]) => { set.push(`${k} = ?`); params.push(v); });
	params.push(lessonId);
	await executeQuery(`UPDATE course_lessons SET ${set.join(', ')} WHERE id = ?`, params);
	const rows = await executeQuery(`SELECT * FROM course_lessons WHERE id = ?`, [lessonId]);
	return rows[0] || null;
};

const deleteLesson = async (lessonId) => {
	await executeQuery(`DELETE FROM course_lessons WHERE id = ?`, [lessonId]);
	return { success: true };
};

module.exports = {
	getLessonsByModule,
	getLessonById,
	createLesson,
	updateLesson,
	deleteLesson
};


