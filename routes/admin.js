const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

// Get dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get total users
    const [usersCount] = await db.promise().query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    
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

    // Get application trends (last 6 months)
    const [applicationTrends] = await db.promise().query(`
      SELECT 
        DATE_FORMAT(submitted_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM scholarship_applications
      WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(submitted_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Get scholarship distribution by type
    const [scholarshipDistribution] = await db.promise().query(`
      SELECT 
        COALESCE(type, 'Other') as category,
        COUNT(*) as count
      FROM scholarships
      GROUP BY type
    `);

    // Get user types distribution
    const [userStats] = await db.promise().query(`
      SELECT 
        role,
        COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    // Process application trends data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trendsData = new Array(6).fill(0);
    applicationTrends.forEach(trend => {
      const monthIndex = new Date(trend.month + '-01').getMonth();
      trendsData[monthIndex] = trend.count;
    });

    // Process scholarship distribution data
    const categories = ['gov', 'private', 'ngo', 'other'];
    const distributionData = new Array(4).fill(0);
    scholarshipDistribution.forEach(item => {
      const index = categories.indexOf(item.category.toLowerCase());
      if (index === -1) {
        distributionData[3] += item.count; // Add to 'other' if category doesn't match
      } else {
        distributionData[index] = item.count;
      }
    });

    // Process user registration data - using actual database stats
    const registrationData = [
      userStats.find(stat => stat.role === 'user')?.count || 0,
      userStats.find(stat => stat.role === 'admin')?.count || 0
    ];

    // Get actual application status counts
    const [statusCounts] = await db.promise().query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM scholarship_applications
      GROUP BY status
    `);

    // Process status data using actual counts
    const statusData = [
      statusCounts.find(s => s.status === 'approved')?.count || 0,
      statusCounts.find(s => s.status === 'pending')?.count || 0,
      statusCounts.find(s => s.status === 'rejected')?.count || 0
    ];

    res.json({
      applicationTrends: trendsData,
      scholarshipDistribution: distributionData,
      userRegistration: registrationData,
      statusOverview: statusData
    });
  } catch (error) {
    console.error('Error fetching chart statistics:', error);
    res.status(500).json({ message: 'Error fetching chart statistics' });
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
      'UPDATE scholarship_applications SET status = ? WHERE id = ?',
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
            SELECT * FROM scholarship_applications
            ORDER BY submitted_at DESC
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
            WHERE id = ?
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
            'DELETE FROM scholarship_applications WHERE id = ?',
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
            'SELECT * FROM scholarship_applications WHERE id = ?',
            [applicationId]
        );

        if (existingApplication.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if email is already used by another application for the same scholarship
        const [existingApplications] = await db.promise().query(
            'SELECT * FROM scholarship_applications WHERE scholarship_id = ? AND email = ? AND id != ?',
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
             WHERE id = ?`,
            [full_name, email, university, country, motivation, scholarship_id, applicationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Fetch updated application
        const [updatedApplication] = await db.promise().query(
            'SELECT * FROM scholarship_applications WHERE id = ?',
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

module.exports = router; 