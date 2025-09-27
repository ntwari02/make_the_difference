// Organization context middleware
// Reads organization from header X-Org-Id or query ?org_id=
const { executeQuery } = require('../config/database');

const setOrgContext = (req, _res, next) => {
	const headerOrg = req.headers['x-org-id'] || req.headers['X-Org-Id'];
	const queryOrg = req.query.org_id;
	req.org = { id: String(headerOrg || queryOrg || '').trim() || null };
	return next();
};

const requireOrg = (req, res, next) => {
	if (!req.org || !req.org.id) return res.status(400).json({ message: 'organization required (X-Org-Id header or org_id query)' });
	return next();
};

const getMembership = async (userId, orgId) => {
	const rows = await executeQuery(`SELECT role FROM organization_users WHERE user_id = ? AND organization_id = ? LIMIT 1`, [userId, orgId]);
	return rows[0] || null;
};

const requireOrgMembershipHeader = (allowedRoles) => {
	return async (req, res, next) => {
		if (req.user?.role === 'admin') return next();
		if (!req.org || !req.org.id) return res.status(400).json({ message: 'organization required (X-Org-Id or org_id)' });
		const membership = await getMembership(req.user?.id, req.org.id);
		if (!membership) return res.status(403).json({ message: 'Not a member of this organization' });
		if (!allowedRoles.includes(membership.role)) return res.status(403).json({ message: 'Insufficient organization role' });
		return next();
	};
};

const requireOrgMembershipParam = (allowedRoles) => {
	return async (req, res, next) => {
		if (req.user?.role === 'admin') return next();
		const orgId = req.params.orgId;
		if (!orgId) return res.status(400).json({ message: 'organization id required in route' });
		const membership = await getMembership(req.user?.id, orgId);
		if (!membership) return res.status(403).json({ message: 'Not a member of this organization' });
		if (!allowedRoles.includes(membership.role)) return res.status(403).json({ message: 'Insufficient organization role' });
		return next();
	};
};

module.exports = { setOrgContext, requireOrg, requireOrgMembershipHeader, requireOrgMembershipParam };

// Resource-aware org membership guards (prevent spoofed org headers)
const getOrgIdByCourseId = async (courseId) => {
	// Note: courses table does not have organization_id column, so all courses are global
	return null;
};

const getOrgIdByModuleId = async (moduleId) => {
	// Note: courses table does not have organization_id column, so all courses are global
	return null;
};

const getOrgIdByLessonId = async (lessonId) => {
	// Note: courses table does not have organization_id column, so all courses are global
	return null;
};

const requireOrgForCourseParam = (allowedRoles) => {
	return async (req, res, next) => {
		if (req.user?.role === 'admin') return next();
		const orgId = await getOrgIdByCourseId(req.params.courseId);
		if (!orgId) return next(); // Global course: allow platform roles guard to decide
		const membership = await getMembership(req.user?.id, orgId);
		if (!membership) return res.status(403).json({ message: 'Not a member of this organization' });
		if (!allowedRoles.includes(membership.role)) return res.status(403).json({ message: 'Insufficient organization role' });
		return next();
	};
};

const requireOrgForModuleParam = (allowedRoles) => {
	return async (req, res, next) => {
		if (req.user?.role === 'admin') return next();
		const orgId = await getOrgIdByModuleId(req.params.moduleId);
		if (!orgId) return next();
		const membership = await getMembership(req.user?.id, orgId);
		if (!membership) return res.status(403).json({ message: 'Not a member of this organization' });
		if (!allowedRoles.includes(membership.role)) return res.status(403).json({ message: 'Insufficient organization role' });
		return next();
	};
};

const requireOrgForLessonParam = (allowedRoles) => {
	return async (req, res, next) => {
		if (req.user?.role === 'admin') return next();
		const orgId = await getOrgIdByLessonId(req.params.lessonId);
		if (!orgId) return next();
		const membership = await getMembership(req.user?.id, orgId);
		if (!membership) return res.status(403).json({ message: 'Not a member of this organization' });
		if (!allowedRoles.includes(membership.role)) return res.status(403).json({ message: 'Insufficient organization role' });
		return next();
	};
};

module.exports.requireOrgForCourseParam = requireOrgForCourseParam;
module.exports.requireOrgForModuleParam = requireOrgForModuleParam;
module.exports.requireOrgForLessonParam = requireOrgForLessonParam;


