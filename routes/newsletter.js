import express from 'express'
import db from '../config/database.js';
const router = express.Router()

// POST /api/subscribe-newsletter
router.post('/', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  // Save to DB
  const sql = 'INSERT INTO newsletter_subscribers (email) VALUES (?)';
  db.query(sql, [email], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'This email is already subscribed.' });
      }
      console.error('Error saving newsletter subscriber:', err);
      return res.status(500).json({ error: 'Failed to subscribe. Please try again later.' });
    }
    res.json({ success: true, message: 'Successfully subscribed to the newsletter!' });
  });
});

// GET /api/subscribe-newsletter - List all subscribers
router.get('/', (req, res) => {
  db.query('SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching newsletter subscribers:', err);
      return res.status(500).json({ error: 'Failed to fetch subscribers.' });
    }
    res.json({ success: true, subscribers: results });
  });
});

// GET /api/subscribe-newsletter/:email - Get a single subscriber by email
router.get('/:email', (req, res) => {
  const { email } = req.params;
  db.query('SELECT id, email, subscribed_at FROM newsletter_subscribers WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error fetching subscriber:', err);
      return res.status(500).json({ error: 'Failed to fetch subscriber.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Subscriber not found.' });
    }
    res.json({ success: true, subscriber: results[0] });
  });
});

// DELETE /api/subscribe-newsletter/:email - Delete a subscriber by email
router.delete('/:email', (req, res) => {
  const { email } = req.params;
  db.query('DELETE FROM newsletter_subscribers WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error('Error deleting subscriber:', err);
      return res.status(500).json({ error: 'Failed to delete subscriber.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subscriber not found.' });
    }
    res.json({ success: true, message: 'Subscriber deleted successfully.' });
  });
});

export default router;
