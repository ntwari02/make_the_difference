import express from 'express';
import db from '../config/database.js';
import { auth, bypassAuth } from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
const router = express.Router();

// Multer setup for service images
const servicesDir = path.resolve('uploads/services');
if (!fs.existsSync(servicesDir)) {
  fs.mkdirSync(servicesDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, servicesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Get all services
router.get('/', async (req, res) => {
  try {
    const [services] = await db.query('SELECT * FROM services');
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching services' });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const [services] = await db.query(
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

// Create service (admin only, supports file upload or image_url)
router.post('/', bypassAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    let finalImageUrl = image_url || null;
    if (req.file) {
      // Save relative path for frontend use
      finalImageUrl = `uploads/services/${req.file.filename}`;
    }
    if (!name || !description || !finalImageUrl) {
      return res.status(400).json({ message: 'Name, description, and image are required.' });
    }
    const [result] = await db.query(
      'INSERT INTO services (name, description, image_url) VALUES (?, ?, ?)',
      [name, description, finalImageUrl]
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
router.put('/:id', bypassAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    let finalImageUrl = image_url || null;
    if (req.file) {
      finalImageUrl = `uploads/services/${req.file.filename}`;
    }
    // Fetch current service to keep existing image if not updated
    const [currentRows] = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (currentRows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    const current = currentRows[0];
    const updateName = name || current.name;
    const updateDesc = description || current.description;
    const updateImageUrl = finalImageUrl || current.image_url;
    const [result] = await db.query(
      'UPDATE services SET name = ?, description = ?, image_url = ? WHERE id = ?',
      [updateName, updateDesc, updateImageUrl, req.params.id]
    );
    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating service' });
  }
});

// Delete service (admin only)
router.delete('/:id', bypassAuth, async (req, res) => {
  try {
    const [result] = await db.query(
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
