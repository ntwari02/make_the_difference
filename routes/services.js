import express from 'express';
import db from '../config/database.js';
import { auth, adminAuth } from '../middleware/auth.js';
const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const [services] = await db.promise().query('SELECT * FROM services');
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching services' });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const [services] = await db.promise().query(
      'SELECT * FROM services WHERE id = ?',
      [req.params.id]
    );

    if (services.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(services[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching service' });
  }
});

// Create service (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    const [result] = await db.promise().query(
      'INSERT INTO services (name, description, image_url) VALUES (?, ?, ?)',
      [name, description, image_url]
    );

    res.status(201).json({
      message: 'Service created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating service' });
  }
});

// Update service (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    const [result] = await db.promise().query(
      'UPDATE services SET name = ?, description = ?, image_url = ? WHERE id = ?',
      [name, description, image_url, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating service' });
  }
});

// Delete service (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const [result] = await db.promise().query(
      'DELETE FROM services WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting service' });
  }
});

export default router; 