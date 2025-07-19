import express from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get applications for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const [applications] = await db.promise().query(
      `SELECT sa.*, s.name as scholarship_name 
       FROM scholarship_applications sa
       JOIN scholarships s ON sa.scholarship_id = s.id
       WHERE sa.email_address = ?`,
      [req.user.email]
    );
    res.json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Get dashboard statistics for the logged-in user
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total applications for the user
    const [applicationsCount] = await db.promise().query(
      'SELECT COUNT(*) as count FROM scholarship_applications WHERE email_address = ?',
      [req.user.email]
    );

    // Get total available scholarships (not expired)
    const [scholarshipsCount] = await db.promise().query(
      "SELECT COUNT(*) as count FROM scholarships WHERE status = 'active' AND (deadline_date IS NULL OR deadline_date >= CURDATE())"
    );

    res.json({
      applications: applicationsCount[0].count,
      scholarships: scholarshipsCount[0].count
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
});

export default router; 