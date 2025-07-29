import express from 'express';
import db from '../config/database.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Create notification (admin only)
router.post('/', adminAuth, async (req, res) => {
  const { user_id, title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required.' });
  }
  try {
    const [result] = await db.promise().query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [user_id || null, title, message]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating notification.' });
  }
});

// Get notifications for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM notifications WHERE user_id IS NULL OR user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notifications.' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const [result] = await db.promise().query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating notification.' });
  }
});

export default router; 