const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

// Get all partners
router.get('/', async (req, res) => {
  try {
    const [partners] = await db.promise().query('SELECT * FROM partners');
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

    const [result] = await db.promise().query(
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
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const [partners] = await db.promise().query(
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

// Update partner status (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const [result] = await db.promise().query(
      'UPDATE partners SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json({ message: 'Partner status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating partner status' });
  }
});

// Delete partner (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const [result] = await db.promise().query(
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
    const [testimonials] = await db.promise().query('SELECT * FROM testimonials');
    res.json(testimonials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching testimonials' });
  }
});

// Add testimonial (admin only)
router.post('/testimonials', adminAuth, async (req, res) => {
  try {
    const { partner_id, name, image_url, testimonial } = req.body;

    const [result] = await db.promise().query(
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
router.put('/testimonials/:id', adminAuth, async (req, res) => {
  try {
    const { name, image_url, testimonial } = req.body;

    const [result] = await db.promise().query(
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
router.delete('/testimonials/:id', adminAuth, async (req, res) => {
  try {
    const [result] = await db.promise().query(
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

module.exports = router; 