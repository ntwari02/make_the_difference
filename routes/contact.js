import axios from 'axios';
import express from 'express';
import db from '../config/database.js';
const router = express.Router();

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Insert the message into the contact_messages table
  const sql = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
  db.query(sql, [name, email, message], (err, result) => {
    if (err) {
      console.error('Error saving contact message:', err);
      return res.status(500).json({ error: 'Failed to save message. Please try again later.' });
    }
    res.status(200).json({ success: true, message: 'Message received. Thank you for contacting us!' });
  });
});

export default router;
