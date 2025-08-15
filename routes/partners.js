import express from 'express';
import db from '../config/database.js';
import { auth, bypassAuth } from '../middleware/auth.js';
const router = express.Router();

// Get all partners
router.get('/', async (req, res) => {
  try {
    const [partners] = await db.query('SELECT * FROM partners');
    res.json(partners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching partners' });
  }
});

// Submit partnership request
router.post('/', async (req, res) => {
  try {
    const { name, email, organization, phone, message } = req.body;

    const [result] = await db.query(
      'INSERT INTO partners (name, email, organization, phone, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, organization, phone, message]
    );

    res.status(201).json({
      message: 'Partnership request submitted successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting partnership request' });
  }
});

// Get partner details (admin only)
router.get('/:id', bypassAuth, async (req, res) => {
  try {
    const [partners] = await db.query(
      'SELECT * FROM partners WHERE id = ?',
      [req.params.id]
    );

    if (partners.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json(partners[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching partner details' });
  }
});

// Delete partner (admin only)
router.delete('/:id', bypassAuth, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM partners WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting partner' });
  }
});

// Get all testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const [testimonials] = await db.query('SELECT * FROM testimonials');
    res.json(testimonials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching testimonials' });
  }
});

// Add testimonial (admin only)
router.post('/testimonials', bypassAuth, async (req, res) => {
  try {
    const { partner_id, name, image_url, testimonial } = req.body;

    const [result] = await db.query(
      'INSERT INTO testimonials (partner_id, name, image_url, testimonial) VALUES (?, ?, ?, ?)',
      [partner_id, name, image_url, testimonial]
    );

    res.status(201).json({
      message: 'Testimonial added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding testimonial' });
  }
});

// Update testimonial (admin only)
router.put('/testimonials/:id', bypassAuth, async (req, res) => {
  try {
    const { name, image_url, testimonial } = req.body;

    const [result] = await db.query(
      'UPDATE testimonials SET name = ?, image_url = ?, testimonial = ? WHERE id = ?',
      [name, image_url, testimonial, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating testimonial' });
  }
});

// Delete testimonial (admin only)
router.delete('/testimonials/:id', bypassAuth, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM testimonials WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting testimonial' });
  }
});

export default router; 
