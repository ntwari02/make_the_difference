const { executeQuery, executeTransaction } = require('../../config/database');

const selectCourseBase = `
SELECT c.*
FROM courses c
`;

const findCourses = async ({ q, category, level, language, minPrice, maxPrice, isFeatured, isPublished, sortBy, sortDir, limit = 20, offset = 0, organization_id = null }) => {
	const where = [];
	const params = [];
	if (q) { where.push('(c.title LIKE ? OR c.description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
	if (category) { where.push('c.category = ?'); params.push(category); }
	if (level) { where.push('c.level = ?'); params.push(level); }
	if (language) { where.push('c.language = ?'); params.push(language); }
	if (minPrice != null) { where.push('c.price >= ?'); params.push(minPrice); }
	if (maxPrice != null) { where.push('c.price <= ?'); params.push(maxPrice); }
	if (isFeatured != null) { where.push('c.is_featured = ?'); params.push(!!isFeatured); }
	if (isPublished != null) { where.push('c.is_published = ?'); params.push(!!isPublished); }
	if (organization_id) { where.push('(c.organization_id = ? OR c.organization_id IS NULL)'); params.push(organization_id); } else { where.push('c.organization_id IS NULL'); }
	const order = ['title', 'price', 'rating', 'created_at', 'student_count'].includes(sortBy) ? sortBy : 'created_at';
	const dir = (sortDir || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
	const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
	const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, parseInt(limit, 10)) : 20;
	const safeOffset = Number.isFinite(Number(offset)) ? Math.max(0, parseInt(offset, 10)) : 0;
	const sql = `${selectCourseBase} ${whereSql} ORDER BY c.${order} ${dir} LIMIT ${safeLimit} OFFSET ${safeOffset}`;
	return executeQuery(sql, params);
};

const getCourseById = async (courseId) => {
	const rows = await executeQuery(`${selectCourseBase} WHERE c.id = ?`, [courseId]);
	return rows[0] || null;
};

const createCourse = async (course) => {
	const fields = [
		'id','title','description','short_description','price','currency','category','subcategory','level','language','duration_hours','thumbnail','preview_video','syllabus','requirements','learning_outcomes','tags','is_published','is_featured','status','instructor_id','completion_certificate','has_live_classes','live_class_schedule','organization_id'
	];
	const placeholders = fields.map(() => '?').join(',');
	const values = fields.map((f) => course[f] ?? null);
	const sql = `INSERT INTO courses (${fields.join(',')}) VALUES (${placeholders})`;
	await executeQuery(sql, values);
	return getCourseById(course.id);
};

const updateCourse = async (courseId, updates) => {
	const set = [];
	const params = [];
	Object.entries(updates).forEach(([k, v]) => {
		set.push(`${k} = ?`);
		params.push(v);
	});
	if (set.length === 0) return getCourseById(courseId);
	params.push(courseId);
	await executeQuery(`UPDATE courses SET ${set.join(', ')} WHERE id = ?`, params);
	return getCourseById(courseId);
};

const deleteCourse = async (courseId) => {
	await executeQuery(`DELETE FROM courses WHERE id = ?`, [courseId]);
	return { success: true };
};

const publishWorkflow = async (courseId, status) => {
	await executeQuery(`UPDATE courses SET status = ?, is_published = ? WHERE id = ?`, [status, status === 'published', courseId]);
	return getCourseById(courseId);
};

const getTrendingCourses = async ({ limit = 20, offset = 0, organization_id = null }) => {
	const where = [];
	const params = [];
	
	where.push('c.is_published = 1');
	where.push('c.status = "published"');
	
	if (organization_id) {
		where.push('(c.organization_id = ? OR c.organization_id IS NULL)');
		params.push(organization_id);
	} else {
		where.push('c.organization_id IS NULL');
	}
	
	const whereSql = `WHERE ${where.join(' AND ')}`;
	const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, parseInt(limit, 10)) : 20;
	const safeOffset = Number.isFinite(Number(offset)) ? Math.max(0, parseInt(offset, 10)) : 0;
	
	const sql = `
		SELECT c.*, 
			COALESCE(enrollment_count, 0) as enrollment_count,
			COALESCE(avg_rating, 0) as avg_rating,
			COALESCE(review_count, 0) as review_count
		FROM courses c
		LEFT JOIN (
			SELECT course_id, COUNT(*) as enrollment_count
			FROM course_enrollments 
			GROUP BY course_id
		) e ON c.id = e.course_id
		LEFT JOIN (
			SELECT course_id, AVG(rating) as avg_rating, COUNT(*) as review_count
			FROM course_reviews 
			GROUP BY course_id
		) r ON c.id = r.course_id
		${whereSql}
		ORDER BY (enrollment_count * 0.4 + avg_rating * 0.3 + review_count * 0.3) DESC, c.created_at DESC
		LIMIT ${safeLimit} OFFSET ${safeOffset}
	`;
	
	return executeQuery(sql, params);
};

const getCategories = async () => {
	const sql = `
		SELECT DISTINCT category, COUNT(*) as course_count
		FROM courses 
		WHERE is_published = 1 AND status = 'published'
		GROUP BY category
		ORDER BY course_count DESC, category ASC
	`;
	return executeQuery(sql);
};

const searchCourses = async (query, { limit = 20, offset = 0, organization_id = null }) => {
	const where = [];
	const params = [];
	
	// Search in title, description, and tags
	where.push('(c.title LIKE ? OR c.description LIKE ? OR c.tags LIKE ?)');
	const searchTerm = `%${query}%`;
	params.push(searchTerm, searchTerm, searchTerm);
	
	where.push('c.is_published = 1');
	where.push('c.status = "published"');
	
	if (organization_id) {
		where.push('(c.organization_id = ? OR c.organization_id IS NULL)');
		params.push(organization_id);
	} else {
		where.push('c.organization_id IS NULL');
	}
	
	const whereSql = `WHERE ${where.join(' AND ')}`;
	const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, parseInt(limit, 10)) : 20;
	const safeOffset = Number.isFinite(Number(offset)) ? Math.max(0, parseInt(offset, 10)) : 0;
	
	const sql = `${selectCourseBase} ${whereSql} ORDER BY c.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
	return executeQuery(sql, params);
};

module.exports = {
	findCourses,
	getCourseById,
	createCourse,
	updateCourse,
	deleteCourse,
	publishWorkflow,
	getTrendingCourses,
	getCategories,
	searchCourses
};


