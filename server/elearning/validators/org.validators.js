const { body, param } = require('express-validator');

const validateCreateOrg = [
	body('name').isString().isLength({ min: 2 }),
	body('slug').isString().isLength({ min: 2 }),
	body('logo').optional().custom((value) => {
		if (value === null || value === undefined || typeof value === 'string') {
			return true;
		}
		throw new Error('Logo must be a string or null');
	}),
	body('settings').optional().custom((value) => {
		if (value === null || value === undefined || typeof value === 'object') {
			return true;
		}
		throw new Error('Settings must be an object or null');
	})
];

const validateAddMember = [
	param('orgId').isString().isLength({ min: 10 }),
	body('user_id').isString().isLength({ min: 10 }),
	body('role').isIn(['org_admin','instructor','learner'])
];

const validateJoinOrg = [
	param('orgId').isString().isLength({ min: 10 }),
	body('role').optional().isIn(['org_admin','instructor','learner'])
];

const validateGetMembers = [
	param('orgId').isString().isLength({ min: 10 })
];

const validateRemoveMember = [
	param('orgId').isString().isLength({ min: 10 }),
	param('userId').isString().isLength({ min: 10 })
];

module.exports = { validateCreateOrg, validateAddMember, validateJoinOrg, validateGetMembers, validateRemoveMember };


