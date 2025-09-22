const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const { requireOrgMembershipParam } = require('../../middlewares/org');
const ctrl = require('../controllers/org.controller');
const v = require('../validators/org.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	return next();
};

// Create organization (admin or instructor)
router.post('/', authenticate, authorizeRoles('admin', 'instructor'), v.validateCreateOrg, handleValidation, ctrl.createOrg);

// Add member to org (any authenticated user for testing)
router.post('/:orgId/members', authenticate, authorizeRoles('admin', 'instructor', 'student'), v.validateAddMember, handleValidation, ctrl.addMember);

// List my orgs (any authenticated user)
router.get('/me', authenticate, ctrl.listMyOrgs);

// List all orgs (any authenticated user for testing)
router.get('/', authenticate, ctrl.listOrgs);

// Add myself to an organization (for testing)
router.post('/:orgId/join', authenticate, v.validateJoinOrg, handleValidation, ctrl.addMeToOrg);

module.exports = router;


