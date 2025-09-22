const { body, param } = require('express-validator');

const validateCreateOrg = [
	body('name').isString().isLength({ min: 2 }),
	body('slug').isString().isLength({ min: 2 }),
	body('logo').optional().isString(),
	body('settings').optional()
];

const validateAddMember = [
	param('orgId').isString().isLength({ min: 10 }),
	body('user_id').isString().isLength({ min: 10 }),
	body('role').isIn(['org_admin','instructor','learner'])
];

module.exports = { validateCreateOrg, validateAddMember };


