/*
 End-to-end checklist runner for the E-learning API.
 - Requires the API server running at BASE_URL (default http://localhost:3001)
 - Uses /api/auth to register users, then sets roles directly in DB via mysql2
 - Exercises: public browse, course CRUD, module/lesson CRUD, publish, enroll, progress, reviews, favorites, analytics
*/
const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const asJson = (o) => JSON.stringify(o, null, 2);

async function getDb() {
	const conn = await mysql.createConnection({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT || 3306),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME
	});
	return conn;
}

function api(token) {
	return axios.create({
		baseURL: BASE_URL,
		validateStatus: () => true,
		headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		timeout: 15000
	});
}

async function ensureRole(email, role) {
	const conn = await getDb();
	await conn.execute('UPDATE users SET role = ? WHERE email = ?', [role, email]);
	await conn.end();
}

async function main() {
	const results = [];
	let currentStep = '';
	let lastStatus = null;
	let lastData = null;
	const add = (name, ok, info) => results.push({ name, ok, info });
	const assert = (cond, name, info) => { add(name, !!cond, info); if (!cond) throw new Error(name + ' failed'); };

	// Wait until API is healthy
	const pub = api();
	for (let i = 0; i < 20; i++) {
		try {
			const hr = await pub.get('/health');
			if (hr.status === 200 && hr.data && hr.data.status === 'ok') break;
		} catch (_) {}
		await wait(500);
	}

	// 1) Health
	currentStep = 'Health';
	let r = await pub.get('/health');
	lastStatus = r.status; lastData = r.data;
	assert(r.status === 200 && r.data && r.data.status === 'ok', 'Health');

	// 2) Create users (student, instructor, admin) via register
	const rand = () => Math.floor(Math.random() * 1e9);
	const student = { email: `student${rand()}@example.com`, password: 'Password123!', first_name: 'Stu', last_name: 'Dent' };
	const instructor = { email: `instructor${rand()}@example.com`, password: 'Password123!', first_name: 'In', last_name: 'Structor' };
	const admin = { email: `admin${rand()}@example.com`, password: 'Password123!', first_name: 'Ad', last_name: 'Min' };

	currentStep = 'Register student'; r = await pub.post('/api/auth/register', student); lastStatus = r.status; lastData = r.data;
	currentStep = 'Register instructor'; r = await pub.post('/api/auth/register', instructor); lastStatus = r.status; lastData = r.data;
	currentStep = 'Register admin'; r = await pub.post('/api/auth/register', admin); lastStatus = r.status; lastData = r.data;
	add('Register users', true);

	// 3) Set roles directly in DB
	await ensureRole(instructor.email, 'instructor');
	await ensureRole(admin.email, 'admin');
	add('Set roles (DB)', true);

	// 4) Login users
	const login = async (identifier, password) => { currentStep = `Login ${identifier}`; const lr = await pub.post('/api/auth/login', { identifier, password }); lastStatus = lr.status; lastData = lr.data; return lr.data; };
	const studentAuth = await login(student.email, student.password);
	const instructorAuth = await login(instructor.email, instructor.password);
	const adminAuth = await login(admin.email, admin.password);
	assert(!!studentAuth.access_token && !!instructorAuth.access_token && !!adminAuth.access_token, 'Login tokens');

	const asStudent = api(studentAuth.access_token);
	const asInstructor = api(instructorAuth.access_token);
	const asAdmin = api(adminAuth.access_token);

	// 5) Instructor creates course (free for easy enrollment)
	const coursePayload = {
		title: `Node 101 ${rand()}`,
		description: 'Basics of Node',
		short_description: 'Intro',
		price: 0,
		currency: 'USD',
		category: 'Programming',
		level: 'beginner',
		language: 'English',
		duration_hours: 5,
		tags: ['node', 'intro'],
		syllabus: [],
		requirements: [],
		learning_outcomes: []
	};
	currentStep = 'Create course';
	r = await asInstructor.post('/api/elearning/courses', coursePayload); lastStatus = r.status; lastData = r.data;
	assert(r.status === 201 && r.data && r.data.id, 'Create course', r.data);
	const courseId = r.data.id;

	// 6) Update course
	currentStep = 'Update course';
	r = await asInstructor.patch(`/api/elearning/courses/${courseId}`, { short_description: 'Updated intro', is_featured: true }); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200, 'Update course');

	// 7) Admin publishes course
	currentStep = 'Publish course';
	r = await asAdmin.post(`/api/elearning/courses/${courseId}/status`, { status: 'published' }); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200 && r.data.is_published === 1, 'Publish course');

	// 8) Modules CRUD
	currentStep = 'Create module';
	r = await asInstructor.post(`/api/elearning/courses/${courseId}/modules`, { title: 'Getting Started', description: 'Module desc', order_index: 0, duration_minutes: 60, is_preview: true }); lastStatus = r.status; lastData = r.data;
	assert(r.status === 201 && r.data && r.data.id, 'Create module');
	const moduleId = r.data.id;

	currentStep = 'Update module';
	r = await asInstructor.patch(`/api/elearning/modules/${moduleId}`, { title: 'Getting Started Updated' }); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200, 'Update module');

	// 9) Lessons CRUD
	currentStep = 'Create lesson';
	r = await asInstructor.post(`/api/elearning/modules/${moduleId}/lessons`, { title: 'Intro Lesson', content_type: 'text', content_text: 'Welcome', duration_minutes: 15, order_index: 0, is_preview: true }); lastStatus = r.status; lastData = r.data;
	assert(r.status === 201 && r.data && r.data.id, 'Create lesson');
	const lessonId = r.data.id;

	currentStep = 'Update lesson';
	r = await asInstructor.patch(`/api/elearning/lessons/${lessonId}`, { title: 'Intro Lesson Updated' }); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200, 'Update lesson');

	// 10) Public browse of course and modules/lessons
	currentStep = 'Get course public';
	r = await pub.get(`/api/elearning/courses/${courseId}`); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200 && r.data && r.data.id === courseId, 'Get course');

	// 11) Student enrolls (course is free)
	currentStep = 'Enroll course';
	r = await asStudent.post(`/api/elearning/courses/${courseId}/enroll`); lastStatus = r.status; lastData = r.data;
	assert(r.status === 201 && r.data && r.data.id, 'Enroll course');

	// 12) Get enrollment to obtain id
	currentStep = 'Get enrollment';
	r = await asStudent.get(`/api/elearning/courses/${courseId}/enrollment`); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200 && r.data && r.data.id, 'Get enrollment');
	const enrollmentId = r.data.id;

	// 13) Upsert progress
	currentStep = 'Upsert progress';
	r = await asStudent.post('/api/elearning/progress', { enrollment_id: enrollmentId, lesson_id: lessonId, is_completed: true, time_spent_minutes: 10, last_position_seconds: 120 }); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200 && r.data && r.data.id, 'Upsert progress');

	// 14) Get progress
	currentStep = 'Get progress list';
	r = await asStudent.get(`/api/elearning/enrollments/${enrollmentId}/progress`); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200 && Array.isArray(r.data), 'Get progress list');

	// 15) Complete course
	currentStep = 'Complete course';
	r = await asStudent.post(`/api/elearning/courses/${courseId}/complete`); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200, 'Complete course');

	// 16) Reviews
	currentStep = 'Add review';
	r = await asStudent.post(`/api/elearning/courses/${courseId}/reviews`, { rating: 5, comment: 'Great course!' }); lastStatus = r.status; lastData = r.data;
	assert(r.status === 201, 'Add review');

	currentStep = 'List reviews';
	r = await pub.get(`/api/elearning/courses/${courseId}/reviews`); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200 && Array.isArray(r.data), 'List reviews');

	// 17) Favorites
	currentStep = 'Add favorite';
	r = await asStudent.post(`/api/elearning/courses/${courseId}/favorite`); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200, 'Add favorite');

	currentStep = 'List favorites';
	r = await asStudent.get('/api/elearning/me/favorites'); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200 && Array.isArray(r.data), 'List favorites');

	currentStep = 'Remove favorite';
	r = await asStudent.delete(`/api/elearning/courses/${courseId}/favorite`); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200, 'Remove favorite');

	// 18) Analytics
	currentStep = 'Instructor analytics';
	r = await asInstructor.get('/api/elearning/me/instructor/analytics'); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200 && r.data && Array.isArray(r.data.courses), 'Instructor analytics');

	currentStep = 'Admin analytics';
	r = await asAdmin.get('/api/elearning/admin/analytics/overview'); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200 && r.data && r.data.mostPopular, 'Admin analytics');

	// 19) Paid course flow
	const paidCoursePayload = {
		title: `Node Paid ${rand()}`,
		description: 'Paid Node course',
		short_description: 'Paid',
		price: 39.99,
		currency: 'USD',
		category: 'Programming',
		level: 'intermediate',
		language: 'English',
		duration_hours: 8,
		tags: ['node','paid']
	};
	currentStep = 'Create paid course';
	r = await asInstructor.post('/api/elearning/courses', paidCoursePayload); lastStatus = r.status; lastData = r.data;
	assert(r.status === 201 && r.data && r.data.id, 'Create paid course', r.data);
	const paidCourseId = r.data.id;

	currentStep = 'Publish paid course';
	r = await asAdmin.post(`/api/elearning/courses/${paidCourseId}/status`, { status: 'published' }); lastStatus = r.status; lastData = r.data;
	assert(r.status === 200 && r.data.is_published === 1, 'Publish paid course');

	currentStep = 'Enroll paid should fail';
	r = await asStudent.post(`/api/elearning/courses/${paidCourseId}/enroll`); lastStatus = r.status; lastData = r.data;
	assert(r.status >= 400, 'Paid enroll requires purchase');

	currentStep = 'Insert purchase transaction';
	{
		const conn = await getDb();
		await conn.execute(
			`INSERT INTO transactions (id, user_id, type, amount, currency, status, description, metadata)
			 VALUES (UUID(), ?, 'course_purchase', ?, 'USD', 'completed', 'Checklist purchase', JSON_OBJECT('course_id', ?))`,
			[studentAuth.user.id, paidCoursePayload.price, paidCourseId]
		);
		await conn.end();
	}

	currentStep = 'Enroll paid after purchase';
	r = await asStudent.post(`/api/elearning/courses/${paidCourseId}/enroll`); lastStatus = r.status; lastData = r.data;
	assert(r.status === 201 && r.data && r.data.id, 'Enroll paid after purchase');

	console.log('\nChecklist Results:');
	for (const item of results) {
		console.log(`${item.ok ? '✔' : '✖'} ${item.name}${item.info ? ' - ' + (typeof item.info === 'string' ? item.info : asJson(item.info)) : ''}`);
	}
	console.log('\nAll done.');
}

main().catch((e) => {
	console.error('Checklist failed at step:', currentStep);
	console.error('HTTP status:', lastStatus);
	try { console.error('Response:', typeof lastData === 'string' ? lastData : asJson(lastData)); } catch (_) { console.error('Response: <unserializable>'); }
	console.error('Error:', e && e.message ? e.message : e);
	process.exit(1);
});


