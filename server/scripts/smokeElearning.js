const axios = require('axios');

const BASE = process.env.BASE_URL || 'http://localhost:3001';

const j = (o) => JSON.stringify(o, null, 2);

async function main() {
	const client = axios.create({ baseURL: BASE, validateStatus: () => true, timeout: 10000 });

	console.log('1) HEALTH');
	let r = await client.get('/health');
	console.log(r.status, r.data);

	console.log('2) PUBLIC COURSES');
	r = await client.get('/api/elearning/courses');
	console.log(r.status, Array.isArray(r.data) ? `items=${r.data.length}` : r.data);

	console.log('3) RECOMMENDED');
	r = await client.get('/api/elearning/courses-recommended');
	console.log(r.status, Array.isArray(r.data) ? `items=${r.data.length}` : r.data);

	console.log('4) AUTH REGISTER/LOGIN');
	const email = `test${Math.floor(Math.random()*1e6)}@example.com`;
	const password = 'Password123!';
	await client.post('/api/auth/register', { email, password, first_name: 'Test', last_name: 'User' });
	r = await client.post('/api/auth/login', { identifier: email, password });
	if (r.status !== 200 || !r.data.access_token) throw new Error('Login failed');
	const token = r.data.access_token;
	const auth = axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true, timeout: 10000 });

	console.log('5) AUTH FAVORITES');
	r = await auth.get('/api/elearning/me/favorites');
	console.log(r.status, Array.isArray(r.data) ? `items=${r.data.length}` : r.data);

	console.log('OK: Smoke tests finished');
}

main().catch((e) => { console.error('Smoke failed:', e.message); process.exit(1); });


