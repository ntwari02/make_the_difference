const { v4: uuidv4 } = require('uuid');
const orgRepo = require('../repositories/org.repository');

const ok = (res, data) => res.json(data);
const created = (res, data) => res.status(201).json(data);

const createOrg = async (req, res) => {
	const id = uuidv4();
	const { name, slug, logo, settings } = req.body || {};
	const org = await orgRepo.createOrganization({ id, name, slug, logo, settings });
	
	// Automatically add the creator as org_admin
	await orgRepo.addUserToOrganization({ 
		organization_id: id, 
		user_id: req.user.id, 
		role: 'org_admin' 
	});
	
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

const listOrgs = async (req, res) => {
	const orgs = await orgRepo.listAllOrganizations();
	return ok(res, orgs);
};

const addMeToOrg = async (req, res) => {
	const { orgId } = req.params;
	const { role = 'learner' } = req.body || {};
	
	try {
		await orgRepo.addUserToOrganization({ 
			organization_id: orgId, 
			user_id: req.user.id, 
			role 
		});
		return ok(res, { success: true, message: 'Added to organization' });
	} catch (error) {
		if (error.code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ error: 'Already a member of this organization' });
		}
		throw error;
	}
};

const getMembers = async (req, res) => {
	const { orgId } = req.params;
	const members = await orgRepo.getMembersForOrganization(orgId);
	return ok(res, members);
};

const removeMember = async (req, res) => {
	const { orgId, userId } = req.params;
	const result = await orgRepo.removeUserFromOrganization({ organizationId: orgId, userId });
	
	if (!result.success) {
		return res.status(404).json({ error: 'Member not found in organization' });
	}
	
	return ok(res, { success: true, message: 'Member removed from organization' });
};

module.exports = { createOrg, addMember, listMyOrgs, listOrgs, addMeToOrg, getMembers, removeMember };


