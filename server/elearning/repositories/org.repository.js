const { executeQuery } = require('../../config/database');

const createOrganization = async ({ id, name, slug, logo = null, settings = null }) => {
	await executeQuery(`INSERT INTO organizations (id, name, slug, logo, settings) VALUES (?, ?, ?, ?, ?)`, [id, name, slug, logo, settings ? JSON.stringify(settings) : null]);
	const rows = await executeQuery(`SELECT * FROM organizations WHERE id = ?`, [id]);
	return rows[0] || null;
};

const addUserToOrganization = async ({ organization_id, user_id, role = 'learner' }) => {
	await executeQuery(`INSERT INTO organization_users (id, organization_id, user_id, role) VALUES (UUID(), ?, ?, ?)`, [organization_id, user_id, role]);
	return { success: true };
};

const listOrganizationsForUser = async (userId) => {
	return executeQuery(`SELECT o.* FROM organization_users ou JOIN organizations o ON o.id = ou.organization_id WHERE ou.user_id = ?`, [userId]);
};

module.exports = { createOrganization, addUserToOrganization, listOrganizationsForUser };
