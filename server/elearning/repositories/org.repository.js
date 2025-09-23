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

const listAllOrganizations = async () => {
	return executeQuery(`SELECT * FROM organizations ORDER BY created_at DESC`);
};

const getMembersForOrganization = async (organizationId) => {
	return executeQuery(`
		SELECT 
			ou.id,
			ou.role,
			ou.created_at as joined_at,
			u.id as user_id,
			u.email,
			u.first_name,
			u.last_name,
			u.profile_image
		FROM organization_users ou
		JOIN users u ON u.id = ou.user_id
		WHERE ou.organization_id = ?
		ORDER BY ou.created_at DESC
	`, [organizationId]);
};

const removeUserFromOrganization = async ({ organizationId, userId }) => {
	const result = await executeQuery(
		'DELETE FROM organization_users WHERE organization_id = ? AND user_id = ?',
		[organizationId, userId]
	);
	return { success: result.affectedRows > 0 };
};

module.exports = { createOrganization, addUserToOrganization, listOrganizationsForUser, listAllOrganizations, getMembersForOrganization, removeUserFromOrganization };
