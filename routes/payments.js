import express from 'express';
import db from '../config/database.js';
import { auth, adminAuth } from '../middleware/auth.js';
const router = express.Router();

// Get user's payments
router.get('/', auth, async (req, res) => {
  try {
    const [payments] = await db.promise().query(
      'SELECT * FROM payments WHERE user_id = ?',
      [req.user.id]
    );

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// Create payment
router.post('/', auth, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const user_id = req.user.id;

    const [result] = await db.promise().query(
      'INSERT INTO payments (user_id, amount, method, status) VALUES (?, ?, ?, "pending")',
      [user_id, amount, method]
    );

    res.status(201).json({
      message: 'Payment created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating payment' });
  }
});

// Update payment status (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const [result] = await db.promise().query(
      'UPDATE payments SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
});

// Get payment details
router.get('/:id', auth, async (req, res) => {
  try {
    const [payments] = await db.promise().query(
      'SELECT * FROM payments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payments[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching payment details' });
  }
});

// Get all payments (admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const [payments] = await db.promise().query(
      `SELECT p.*, u.full_name, u.email 
       FROM payments p 
       JOIN users u ON p.user_id = u.id 
       ORDER BY p.transaction_date DESC`
    );

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

export default router; 