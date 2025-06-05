const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { adminAuth } = require('../middleware/auth');

// Get all roles with their permissions
router.get('/roles', adminAuth, async (req, res) => {
    try {
        // Get roles with user count
        const [roles] = await pool.promise().query(`
            SELECT 
                r.role_id,
                r.role_name,
                r.description,
                COUNT(DISTINCT ur.user_id) as user_count
            FROM roles r
            LEFT JOIN user_roles ur ON r.role_id = ur.role_id
            GROUP BY r.role_id
        `);

        // Get permissions for each role
        for (let role of roles) {
            const [permissions] = await pool.promise().query(`
                SELECT 
                    p.permission_id,
                    p.permission_name,
                    p.description,
                    p.category
                FROM permissions p
                INNER JOIN role_permissions rp ON p.permission_id = rp.permission_id
                WHERE rp.role_id = ?
                ORDER BY p.category, p.permission_name
            `, [role.role_id]);
            
            role.permissions = permissions;
        }

        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Error fetching roles' });
    }
});

// Get all permissions grouped by category
router.get('/permissions', adminAuth, async (req, res) => {
    try {
        const [permissions] = await pool.promise().query(`
            SELECT 
                permission_id,
                permission_name,
                description,
                category
            FROM permissions
            ORDER BY category, permission_name
        `);

        // Group permissions by category
        const groupedPermissions = permissions.reduce((acc, perm) => {
            const category = perm.category.toLowerCase().replace(' ', '_');
            if (!acc[category + '_management']) {
                acc[category + '_management'] = [];
            }
            acc[category + '_management'].push(perm);
            return acc;
        }, {});

        res.json(groupedPermissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Error fetching permissions' });
    }
});

// Create new role
router.post('/roles', adminAuth, async (req, res) => {
    const promisePool = pool.promise();
    let connection;
    try {
        const { role_name, description, permissions } = req.body;

        if (!role_name || !Array.isArray(permissions)) {
            return res.status(400).json({ message: 'Role name and permissions array are required' });
        }

        connection = await promisePool.getConnection();
        await connection.beginTransaction();

        // Insert role
        const [roleResult] = await connection.query(
            'INSERT INTO roles (role_name, description) VALUES (?, ?)',
            [role_name, description]
        );

        // Insert role permissions
        if (permissions.length > 0) {
            const values = permissions.map(permId => [roleResult.insertId, permId]);
            await connection.query(
                'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
                [values]
            );
        }

        await connection.commit();
        res.json({ message: 'Role created successfully', role_id: roleResult.insertId });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error creating role:', error);
        res.status(500).json({ message: 'Error creating role' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Update role
router.put('/roles/:roleId', adminAuth, async (req, res) => {
    const promisePool = pool.promise();
    let connection;
    try {
        const { role_name, description, permissions } = req.body;
        const roleId = req.params.roleId;

        if (!role_name || !Array.isArray(permissions)) {
            return res.status(400).json({ message: 'Role name and permissions array are required' });
        }

        connection = await promisePool.getConnection();
        await connection.beginTransaction();

        // Update role
        await connection.query(
            'UPDATE roles SET role_name = ?, description = ? WHERE role_id = ?',
            [role_name, description, roleId]
        );

        // Delete existing permissions
        await connection.query(
            'DELETE FROM role_permissions WHERE role_id = ?',
            [roleId]
        );

        // Insert new permissions
        if (permissions.length > 0) {
            const values = permissions.map(permId => [roleId, permId]);
            await connection.query(
                'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
                [values]
            );
        }

        await connection.commit();
        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Error updating role' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Delete role
router.delete('/roles/:roleId', adminAuth, async (req, res) => {
    const promisePool = pool.promise();
    let connection;
    try {
        const roleId = req.params.roleId;

        connection = await promisePool.getConnection();
        await connection.beginTransaction();

        // Check if role is in use
        const [userCount] = await connection.query(
            'SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?',
            [roleId]
        );

        if (userCount[0].count > 0) {
            await connection.rollback();
            return res.status(400).json({ 
                message: 'Cannot delete role as it is assigned to users. Remove role from users first.' 
            });
        }

        // Delete role (role_permissions will be deleted automatically due to CASCADE)
        const [result] = await connection.query(
            'DELETE FROM roles WHERE role_id = ?',
            [roleId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Role not found' });
        }

        await connection.commit();
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error deleting role:', error);
        res.status(500).json({ message: 'Error deleting role' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Assign role to user
router.post('/users/:userId/roles', adminAuth, async (req, res) => {
    const promisePool = pool.promise();
    let connection;
    try {
        const { role_id } = req.body;
        const userId = req.params.userId;

        if (!role_id) {
            return res.status(400).json({ message: 'Role ID is required' });
        }

        connection = await promisePool.getConnection();
        await connection.beginTransaction();

        // Check if user exists
        const [user] = await connection.query(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );

        if (user.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if role exists
        const [role] = await connection.query(
            'SELECT role_id FROM roles WHERE role_id = ?',
            [role_id]
        );

        if (role.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Role not found' });
        }

        // Check if user already has this role
        const [existingRole] = await connection.query(
            'SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?',
            [userId, role_id]
        );

        if (existingRole.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'User already has this role' });
        }

        // Assign role to user
        await connection.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, role_id]
        );

        await connection.commit();
        res.json({ message: 'Role assigned successfully' });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error assigning role:', error);
        res.status(500).json({ message: 'Error assigning role' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Remove role from user
router.delete('/users/:userId/roles/:roleId', adminAuth, async (req, res) => {
    try {
        const { userId, roleId } = req.params;

        const [result] = await pool.promise().query(
            'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
            [userId, roleId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Role assignment not found' });
        }

        res.json({ message: 'Role removed successfully' });
    } catch (error) {
        console.error('Error removing role:', error);
        res.status(500).json({ message: 'Error removing role' });
    }
});

// Get user's roles
router.get('/users/:userId/roles', adminAuth, async (req, res) => {
    try {
        const userId = req.params.userId;

        const [roles] = await pool.promise().query(`
            SELECT 
                r.role_id,
                r.role_name,
                r.description
            FROM roles r
            INNER JOIN user_roles ur ON r.role_id = ur.role_id
            WHERE ur.user_id = ?
        `, [userId]);

        res.json(roles);
    } catch (error) {
        console.error('Error fetching user roles:', error);
        res.status(500).json({ message: 'Error fetching user roles' });
    }
});

module.exports = router; 