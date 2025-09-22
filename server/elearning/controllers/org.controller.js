const { v4: uuidv4 } = require('uuid');
const orgRepo = require('../repositories/org.repository');

const ok = (res, data) => res.json(data);
const created = (res, data) => res.status(201).json(data);

const createOrg = async (req, res) => {
	const id = uuidv4();
	const { name, slug, logo, settings } = req.body || {};
	const org = await orgRepo.createOrganization({ id, name, slug, logo, settings });
	return created(res, org);
};

const addMember = async (req, res) => {
	const { user_id, role } = req.body || {};
	await orgRepo.addUserToOrganization({ organization_id: req.params.orgId, user_id, role });
	return ok(res, { success: true });
};

const listMyOrgs = async (req, res) => {
	const orgs = await orgRepo.listOrganizationsForUser(req.user.id);
	return ok(res, orgs);
};

module.exports = { createOrg, addMember, listMyOrgs };


