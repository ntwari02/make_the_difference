const { executeQuery } = require('../../config/database');

const getModulesByCourse = async (courseId, organizationId = null) => {
	if (organizationId) {
		return executeQuery(
			`SELECT m.* FROM course_modules m JOIN courses c ON c.id = m.course_id
			 WHERE m.course_id = ? AND (c.organization_id = ? OR c.organization_id IS NULL)
			 ORDER BY m.order_index ASC`,
			[courseId, organizationId]
		);
	}
	// If no org provided, only show global modules
	return executeQuery(
		`SELECT m.* FROM course_modules m JOIN courses c ON c.id = m.course_id
		 WHERE m.course_id = ? AND c.organization_id IS NULL
		 ORDER BY m.order_index ASC`,
		[courseId]
	);
};

const createModule = async (module) => {
	const fields = ['id','course_id','title','description','order_index','duration_minutes','is_preview'];
	const placeholders = fields.map(() => '?').join(',');
	const values = fields.map((f) => module[f] ?? null);
	await executeQuery(`INSERT INTO course_modules (${fields.join(',')}) VALUES (${placeholders})`, values);
	const rows = await executeQuery(`SELECT * FROM course_modules WHERE id = ?`, [module.id]);
	return rows[0] || null;
};

const updateModule = async (moduleId, updates) => {
	const set = [];
	const params = [];
	Object.entries(updates).forEach(([k, v]) => { set.push(`${k} = ?`); params.push(v); });
	params.push(moduleId);
	await executeQuery(`UPDATE course_modules SET ${set.join(', ')} WHERE id = ?`, params);
	const rows = await executeQuery(`SELECT * FROM course_modules WHERE id = ?`, [moduleId]);
	return rows[0] || null;
};

const deleteModule = async (moduleId) => {
	await executeQuery(`DELETE FROM course_modules WHERE id = ?`, [moduleId]);
	return { success: true };
};

module.exports = {
	getModulesByCourse,
	createModule,
	updateModule,
	deleteModule
};


