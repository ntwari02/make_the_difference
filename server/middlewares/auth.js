const jwt = require('jsonwebtoken');

const getTokenFromHeader = (req) => {
	const authHeader = req.headers['authorization'] || req.headers['Authorization'];
	if (!authHeader) return null;
	const parts = authHeader.split(' ');
	if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
		return parts[1];
	}
	return null;
};

const verifyWithMultipleSecrets = (token) => {
	const secrets = [
		process.env.JWT_ACCESS_SECRET,
		process.env.JWT_SECRET,
		'…',
		'dev_access_secret',
		'dev_secret_change_me'
	].filter(Boolean);
	let lastError = null;
	for (const s of secrets) {
		try {
			return jwt.verify(token, s);
		} catch (e) {
			lastError = e;
		}
	}
	throw lastError || new Error('Token verification failed');
};

const authenticate = (req, res, next) => {
	try {
		const token = getTokenFromHeader(req);
		if (!token) return res.status(401).json({ message: 'Authentication required' });
		const payload = verifyWithMultipleSecrets(token);
		const userId = payload.id || payload.sub;
		if (!userId) return res.status(401).json({ message: 'Invalid token payload' });
		req.user = { id: userId, role: payload.role || null, email: payload.email || null };
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
};

const optionalAuthenticate = (req, res, next) => {
	try {
		const token = getTokenFromHeader(req);
		if (!token) return next();
		const payload = verifyWithMultipleSecrets(token);
		const userId = payload.id || payload.sub;
		if (userId) {
			req.user = { id: userId, role: payload.role || null, email: payload.email || null };
		}
	} catch (_) {}
	return next();
};

const authorizeRoles = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ message: 'Authentication required' });
		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden: insufficient role' });
		}
		return next();
	};
};

module.exports = {
	authenticate,
	optionalAuthenticate,
	authorizeRoles
};


