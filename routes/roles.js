import express from "express";
import db from "../config/database.js"; // Adjust path to your DB connection
const router = express.Router();

// Get all roles (with user count)
router.get('/roles', async (req, res) => {
  try {
    const [roles] = await db.query('SELECT * FROM roles');
  for (let role of roles) {
      // Without users.role, user_count aggregation by role is not applicable.
      role.user_count = 0;
  }
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching roles', error: err.message });
  }
});

// Get all permissions (grouped by category)
router.get('/permissions', async (req, res) => {
  try {
    const [perms] = await db.query('SELECT * FROM permissions');
    const grouped = {
      user_management: [],
      scholarship_management: [],
      system_settings: []
    };
    for (let perm of perms) {
      if (grouped[perm.category]) grouped[perm.category].push(perm);
    }
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching permissions', error: err.message });
  }
});

// Get a single role (with permissions)
router.get('/roles/:id', async (req, res) => {
  const { id } = req.params;
  // Validate id
  const roleId = parseInt(id, 10);
  if (Number.isNaN(roleId)) {
    return res.status(400).json({ message: 'Invalid role id' });
  }
  try {
    const [roles] = await db.query('SELECT * FROM roles WHERE role_id = ?', [roleId]);
    if (roles.length === 0) return res.status(404).json({ message: 'Role not found' });

    const [perms] = await db.query(
      `SELECT p.permission_id, p.permission_name, p.description, p.category
       FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.permission_id
       WHERE rp.role_id = ?`, [roleId]
    );

    const role = roles[0];
    role.permissions = perms;
    res.json(role);
  } catch (err) {
    console.error('Error fetching role:', err);
    res.status(500).json({ message: 'Error fetching role', error: err.message });
  }
});

// Create a new role
router.post('/roles', async (req, res) => {
  const { role_name, description, permissions } = req.body;
  if (!role_name) return res.status(400).json({ message: 'Role name required' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [roleResult] = await conn.query(
      'INSERT INTO roles (role_name, description) VALUES (?, ?)',
      [role_name, description]
    );
    const role_id = roleResult.insertId;

    if (Array.isArray(permissions) && permissions.length > 0) {
      const values = permissions.map(pid => [role_id, pid]);
      await conn.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
        [values]
      );
    }

    await conn.commit();
    res.json({ message: 'Role created', role_id });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Error creating role', error: err.message });
  } finally {
    conn.release();
  }
});

// Update a role
router.put('/roles/:id', async (req, res) => {
  const { role_name, description, permissions } = req.body;
  const { id } = req.params;
  if (!role_name) return res.status(400).json({ message: 'Role name required' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      'UPDATE roles SET role_name = ?, description = ? WHERE role_id = ?',
      [role_name, description, id]
    );

    await conn.query('DELETE FROM role_permissions WHERE role_id = ?', [id]);

    if (Array.isArray(permissions) && permissions.length > 0) {
      const values = permissions.map(pid => [id, pid]);
      await conn.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
        [values]
      );
    }

    await conn.commit();
    res.json({ message: 'Role updated' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Error updating role', error: err.message });
  } finally {
    conn.release();
  }
});

// Delete a role
router.delete('/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM roles WHERE role_id = ?', [id]);
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting role', error: err.message });
  }
});

export default router; 
