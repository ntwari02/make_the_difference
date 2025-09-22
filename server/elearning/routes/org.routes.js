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

// Create organization (admin only)
router.post('/', authenticate, authorizeRoles('admin'), v.validateCreateOrg, handleValidation, ctrl.createOrg);

// Add member to org (org_admin or platform admin)
router.post('/:orgId/members', authenticate, authorizeRoles('admin','instructor','student'), requireOrgMembershipParam(['org_admin']), v.validateAddMember, handleValidation, ctrl.addMember);

// List my orgs
router.get('/me', authenticate, ctrl.listMyOrgs);

module.exports = router;


