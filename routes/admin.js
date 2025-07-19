import express from 'express';
import db from '../config/database.js';
import { adminAuth } from '../middleware/auth.js';
const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get total users
    const [usersCount] = await db.promise().query('SELECT COUNT(*) as count FROM users');
    
    // Get total partners
    const [partnersCount] = await db.promise().query('SELECT COUNT(*) as count FROM partners');
    
    // Get total scholarships
    const [scholarshipsCount] = await db.promise().query('SELECT COUNT(*) as count FROM scholarships');
    
    // Get total applications
    const [applicationsCount] = await db.promise().query('SELECT COUNT(*) as count FROM scholarship_applications');
    
    // Get total active subscriptions
    const [subscriptionsCount] = await db.promise().query(
      'SELECT COUNT(*) as count FROM plan_subscriptions WHERE status = "active"'
    );
    
    // Get total revenue
    const [revenue] = await db.promise().query(
      'SELECT SUM(amount) as total FROM payments WHERE status = "completed"'
    );

    res.json({
      users: usersCount[0].count,
      partners: partnersCount[0].count,
      scholarships: scholarshipsCount[0].count,
      applications: applicationsCount[0].count,
      activeSubscriptions: subscriptionsCount[0].count,
      totalRevenue: revenue[0].total || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const [users] = await db.promise().query(
      'SELECT id, full_name, email, role, status FROM users'
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { fullName, email, role, status } = req.body;
    
    // Validate required fields
    if (!fullName || !email) {
      return res.status(400).json({ message: 'Full name and email are required' });
    }

    // Check if email exists for other users
    const [existingUsers] = await db.promise().query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.params.id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Update user
    const [result] = await db.promise().query(
      'UPDATE users SET full_name = ?, email = ?, role = ?, status = ? WHERE id = ?',
      [fullName, email, role || 'user', status || 'active', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const [result] = await db.promise().query(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Get all newsletter subscribers
router.get('/newsletter-subscribers', adminAuth, async (req, res) => {
  try {
    const [subscribers] = await db.promise().query('SELECT * FROM newsletter_subscribers');
    res.json(subscribers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching newsletter subscribers' });
  }
});

// Delete newsletter subscriber
router.delete('/newsletter-subscribers/:id', adminAuth, async (req, res) => {
  try {
    const [result] = await db.promise().query(
      'DELETE FROM newsletter_subscribers WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting subscriber' });
  }
});

// Get chart statistics
router.get('/chart-stats', adminAuth, async (req, res) => {
  try {
    // Application trends by month
    const [applicationTrends] = await db.promise().query(`
      SELECT DATE_FORMAT(application_date, '%Y-%m') as month, COUNT(*) as count
      FROM scholarship_applications
      GROUP BY month
      ORDER BY month ASC
    `);

    // Scholarship distribution by type
    const [scholarshipDistribution] = await db.promise().query(`
      SELECT type, COUNT(*) as count
      FROM scholarships
      GROUP BY type
    `);
    const scholarshipDistData = {
      'gov': 0,
      'private': 0,
      'ngo': 0,
      'other': 0
    };
    scholarshipDistribution.forEach(row => {
      scholarshipDistData[row.type] = row.count;
    });

    // User registration by role
    const [userRegistration] = await db.promise().query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    const userRegData = {
      user: 0,
      admin: 0
    };
    userRegistration.forEach(row => {
      userRegData[row.role] = row.count;
    })

    // Applications by academic level
    const [statusOverview] = await db.promise().query(`
      SELECT academic_level, COUNT(*) as count
      FROM scholarship_applications
      GROUP BY academic_level
    `);
    const statusOverviewData = {
      undergraduate: 0,
      graduate: 0,
      phd: 0
    };
    statusOverview.forEach(row => {
      statusOverviewData[row.academic_level] = row.count;
    });

    res.json({
      applicationTrends,
      scholarshipDistribution: Object.values(scholarshipDistData),
      userRegistration: Object.values(userRegData),
      statusOverview: Object.values(statusOverviewData)
    });
  } catch (error) {
    console.error('Error fetching chart stats:', error);
    res.status(500).json({ message: 'Error fetching chart stats' });
  }
});

// Update user status
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Check if status column exists
    const [columns] = await db.promise().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'status'
    `);

    // Add status column if it doesn't exist
    if (columns.length === 0) {
      await db.promise().query(`
        ALTER TABLE users 
        ADD COLUMN status ENUM('active', 'inactive') 
        DEFAULT 'active'
      `);
    }

    const [result] = await db.promise().query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Update application status
router.put('/applications/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const [result] = await db.promise().query(
      'UPDATE scholarship_applications SET status = ? WHERE application_id = ?',
      [status, applicationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

// Create user (admin only)
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { fullName, email, role, status } = req.body;
    
    // Validate required fields
    if (!fullName || !email) {
      return res.status(400).json({ message: 'Full name and email are required' });
    }

    // Check if email already exists
    const [existingUsers] = await db.promise().query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user with default password (they can reset it later)
    const defaultPassword = Math.random().toString(36).slice(-8); // Generate random password
    const [result] = await db.promise().query(
      'INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, defaultPassword, role || 'user', status || 'active']
    );

    res.status(201).json({
      message: 'User created successfully',
      id: result.insertId,
      defaultPassword // Send this only in development environment
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Get all scholarship applications
router.get('/applications', adminAuth, async (req, res) => {
    try {
        const [applications] = await db.promise().query(`
            SELECT sa.application_id, sa.full_name, sa.application_date, s.name as scholarship_name
            FROM scholarship_applications sa
            JOIN scholarships s ON sa.scholarship_id = s.id
            ORDER BY sa.application_date DESC
        `);
        
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

// Get application details
router.get('/applications/:id', adminAuth, async (req, res) => {
    try {
        const [applications] = await db.promise().query(`
            SELECT * FROM scholarship_applications
            WHERE application_id = ?
        `, [req.params.id]);

        if (applications.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(applications[0]);
    } catch (error) {
        console.error('Error fetching application details:', error);
        res.status(500).json({ message: 'Error fetching application details' });
    }
});

// Delete application
router.delete('/applications/:id', adminAuth, async (req, res) => {
    try {
        const [result] = await db.promise().query(
            'DELETE FROM scholarship_applications WHERE application_id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ message: 'Error deleting application' });
    }
});

// Update application
router.put('/applications/:id', adminAuth, async (req, res) => {
    try {
        const { full_name, email, university, country, motivation, scholarship_id } = req.body;
        const applicationId = req.params.id;

        // Validate required fields
        if (!full_name || !email || !university || !country || !motivation || !scholarship_id) {
            return res.status(400).json({ 
                message: 'All fields are required: full_name, email, university, country, motivation, scholarship_id' 
            });
        }

        // Check if scholarship exists
        const [scholarships] = await db.promise().query(
            'SELECT * FROM scholarships WHERE id = ?',
            [scholarship_id]
        );

        if (scholarships.length === 0) {
            return res.status(404).json({ message: 'Scholarship not found' });
        }

        // Check if application exists
        const [existingApplication] = await db.promise().query(
            'SELECT * FROM scholarship_applications WHERE application_id = ?',
            [applicationId]
        );

        if (existingApplication.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if email is already used by another application for the same scholarship
        const [existingApplications] = await db.promise().query(
            'SELECT * FROM scholarship_applications WHERE scholarship_id = ? AND email = ? AND application_id != ?',
            [scholarship_id, email, applicationId]
        );

        if (existingApplications.length > 0) {
            return res.status(400).json({ message: 'Another application with this email already exists for this scholarship' });
        }

        // Update application
        const [result] = await db.promise().query(
            `UPDATE scholarship_applications 
             SET full_name = ?, email = ?, university = ?, country = ?, 
                 motivation = ?, scholarship_id = ?
             WHERE application_id = ?`,
            [full_name, email, university, country, motivation, scholarship_id, applicationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Fetch updated application
        const [updatedApplication] = await db.promise().query(
            'SELECT * FROM scholarship_applications WHERE application_id = ?',
            [applicationId]
        );

        res.json({
            message: 'Application updated successfully',
            application: updatedApplication[0]
        });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ message: 'Error updating application' });
    }
});

export default router; 