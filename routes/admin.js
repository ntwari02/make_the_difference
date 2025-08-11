import express from 'express';
import db from '../config/database.js';
import { adminAuth } from '../middleware/auth.js';
import multer from 'multer';

// Set up multer storage for profile pictures and documents
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'profile_picture') {
            cb(null, 'uploads/profile_pictures/');
        } else {
            cb(null, 'uploads/documents/');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, ''));
    }
});
const upload = multer({ storage });
const router = express.Router();

// Initialize database schema - add missing columns if they don't exist
async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');
        
        // Create admin_users table if it doesn't exist
        const [adminTables] = await db.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'admin_users'
        `);
        
        if (adminTables.length === 0) {
            console.log('Creating admin_users table...');
            await db.query(`
                CREATE TABLE admin_users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    admin_level ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
                    permissions JSON,
                    is_active BOOLEAN DEFAULT TRUE,
                    last_login TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_email (email),
                    INDEX idx_admin_level (admin_level),
                    INDEX idx_is_active (is_active)
                )
            `);
            console.log('Admin users table created successfully');
            
            // Migrate existing admin users
            await migrateExistingAdmins();
        } else {
            console.log('Admin users table already exists');
        }

        // Add status column to scholarship_applications if it doesn't exist
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'scholarship_applications' 
            AND COLUMN_NAME = 'status'
        `);

        if (columns.length === 0) {
            await db.query(`
                ALTER TABLE scholarship_applications 
                ADD COLUMN status ENUM('pending', 'approved', 'rejected') 
                DEFAULT 'pending'
            `);
            console.log('Added status column to scholarship_applications table');
        }

        // Add status column to users if it doesn't exist
        const [userColumns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'status'
        `);

        if (userColumns.length === 0) {
            await db.query(`
                ALTER TABLE users 
                ADD COLUMN status ENUM('active', 'inactive') 
                DEFAULT 'active'
            `);
            console.log('Added status column to users table');
        }
        
        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database schema:', error);
        throw error;
    }
}

// Migrate existing admin users from users table to admin_users table
async function migrateExistingAdmins() {
    try {
        console.log('Starting admin migration...');
        
        // Get all users with role = 'admin'
        const [adminUsers] = await db.query(`
            SELECT id, full_name, email 
            FROM users 
            WHERE role = 'admin'
        `);
        
        if (adminUsers.length > 0) {
            console.log(`Found ${adminUsers.length} existing admin users to migrate`);
            
            for (const user of adminUsers) {
                try {
                    // Check if admin already exists in admin_users table
                    const [existingAdmin] = await db.query(`
                        SELECT id FROM admin_users WHERE user_id = ?
                    `, [user.id]);
                    
                    if (existingAdmin.length === 0) {
                        // Insert into admin_users table
                        await db.query(`
                            INSERT INTO admin_users (user_id, full_name, email, admin_level, permissions) 
                            VALUES (?, ?, ?, 'admin', '{}')
                        `, [user.id, user.full_name, user.email]);
                        
                        console.log(`Migrated admin user: ${user.email}`);
                    } else {
                        console.log(`Admin user ${user.email} already exists in admin_users table`);
                    }
                } catch (error) {
                    console.error(`Error migrating admin user ${user.email}:`, error);
                }
            }
            
            console.log('Admin migration completed successfully');
        } else {
            console.log('No existing admin users found to migrate');
        }
    } catch (error) {
        console.error('Error migrating existing admins:', error);
        throw error;
    }
}

// Initialize database on startup
initializeDatabase().catch(error => {
    console.error('Failed to initialize database:', error);
});

// Get dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get total users
    const [usersCount] = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Get total partners
    const [partnersCount] = await db.query('SELECT COUNT(*) as count FROM partners');
    
    // Get total scholarships
    const [scholarshipsCount] = await db.query('SELECT COUNT(*) as count FROM scholarships');
    
    // Get total applications
    const [applicationsCount] = await db.query('SELECT COUNT(*) as count FROM scholarship_applications');
    
    // Get total active subscriptions
    const [subscriptionsCount] = await db.query(
      'SELECT COUNT(*) as count FROM plan_subscriptions WHERE status = "active"'
    );
    
    // Get total revenue
    const [revenue] = await db.query(
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
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Get all users with pagination and search
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, full_name, email, role, status, created_at FROM users WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const params = [];
    const countParams = [];

    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ?)';
      countQuery += ' AND (full_name LIKE ? OR email LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
      countParams.push(searchParam, searchParam);
    }

    if (role) {
      query += ' AND role = ?';
      countQuery += ' AND role = ?';
      params.push(role);
      countParams.push(role);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await db.query(query, params);
    const [totalResult] = await db.query(countQuery, countParams);
    const total = totalResult[0].total;

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, full_name, email, role, status FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Create new user
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { fullName, email, password, role = 'user', status = 'active' } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required' });
    }

    // Check if email already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, role, status]
    );

    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
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
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.params.id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Update user
    const [result] = await db.query(
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
    // Check if user has applications
    const [applications] = await db.query(
      'SELECT COUNT(*) as count FROM scholarship_applications WHERE email_address IN (SELECT email FROM users WHERE id = ?)',
      [req.params.id]
    );

    if (applications[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing applications. Please delete applications first.' 
      });
    }

    const [result] = await db.query(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Get all newsletter subscribers
router.get('/newsletter-subscribers', adminAuth, async (req, res) => {
  try {
    const [subscribers] = await db.query('SELECT * FROM newsletter_subscribers');
    res.json(subscribers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching newsletter subscribers' });
  }
});

// Delete newsletter subscriber
router.delete('/newsletter-subscribers/:id', adminAuth, async (req, res) => {
  try {
    const [result] = await db.query(
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
    const [applicationTrends] = await db.query(`
      SELECT DATE_FORMAT(application_date, '%Y-%m') as month, COUNT(*) as count
      FROM scholarship_applications
      WHERE application_date IS NOT NULL
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `);

    // Scholarship distribution by type
    const [scholarshipDistribution] = await db.query(`
      SELECT scholarship_type, COUNT(*) as count
      FROM scholarships
      GROUP BY scholarship_type
    `);
    const scholarshipDistData = {
      'gov': 0,
      'private': 0,
      'ngo': 0,
      'other': 0
    };
    scholarshipDistribution.forEach(row => {
      scholarshipDistData[row.scholarship_type] = row.count;
    });

    // User registration by role
    const [userRegistration] = await db.query(`
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
    });

    // Applications by academic level
    const [statusOverview] = await db.query(`
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
      applicationTrends: applicationTrends.map(trend => ({
        month: trend.month,
        count: trend.count
      })),
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
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'status'
    `);

    // Add status column if it doesn't exist
    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN status ENUM('active', 'inactive') 
        DEFAULT 'active'
      `);
    }

    const [result] = await db.query(
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
    const { status, reviewer_notes } = req.body;
    const applicationId = req.params.id;

    // Validate status
    if (!['pending', 'under_review', 'approved', 'rejected', 'waitlisted'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const [result] = await db.query(
      'UPDATE scholarship_applications SET status = ?, reviewer_notes = ? WHERE application_id = ?',
      [status, reviewer_notes || null, applicationId]
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
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user with default password (they can reset it later)
    const defaultPassword = Math.random().toString(36).slice(-8); // Generate random password
    const [result] = await db.query(
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
        const [applications] = await db.query(`
            SELECT 
                sa.application_id, 
                sa.full_name, 
                sa.email_address, 
                sa.profile_picture_url,
                sa.date_of_birth,
                sa.gender,
                sa.phone_number,
                sa.address,
                sa.preferred_university,
                sa.country,
                sa.academic_level,
                sa.intended_major,
                sa.gpa_academic_performance,
                sa.uploaded_documents_json,
                sa.extracurricular_activities,
                sa.parent_guardian_name,
                sa.parent_guardian_contact,
                sa.financial_need_statement,
                sa.how_heard_about,
                sa.scholarship_id,
                sa.motivation_statement,
                sa.terms_agreed,
                sa.application_date,
                sa.status,
                COALESCE(s.name, 'Unknown Scholarship') as scholarship_name
            FROM scholarship_applications sa
            LEFT JOIN scholarships s ON sa.scholarship_id = s.id
            ORDER BY sa.application_date DESC
        `);
        // Map to camelCase for frontend
        const mapped = applications.map(app => ({
            applicationId: app.application_id,
            fullName: app.full_name,
            emailAddress: app.email_address,
            profilePictureUrl: app.profile_picture_url,
            dateOfBirth: app.date_of_birth,
            gender: app.gender,
            phoneNumber: app.phone_number,
            address: app.address,
            preferredUniversity: app.preferred_university,
            country: app.country,
            academicLevel: app.academic_level,
            intendedMajor: app.intended_major,
            gpaAcademicPerformance: app.gpa_academic_performance,
            uploadedDocumentsJson: app.uploaded_documents_json,
            extracurricularActivities: app.extracurricular_activities,
            parentGuardianName: app.parent_guardian_name,
            parentGuardianContact: app.parent_guardian_contact,
            financialNeedStatement: app.financial_need_statement,
            howHeardAbout: app.how_heard_about,
            scholarshipId: app.scholarship_id,
            motivationStatement: app.motivation_statement,
            termsAgreed: !!app.terms_agreed,
            applicationDate: app.application_date,
            status: app.status,
            scholarshipName: app.scholarship_name
        }));
        res.json(mapped);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

// Get application details
router.get('/applications/:id', adminAuth, async (req, res) => {
    try {
        const [applications] = await db.query(`
            SELECT 
                sa.application_id, 
                sa.full_name, 
                sa.email_address, 
                sa.profile_picture_url,
                sa.date_of_birth,
                sa.gender,
                sa.phone_number,
                sa.address,
                sa.preferred_university,
                sa.country,
                sa.academic_level,
                sa.intended_major,
                sa.gpa_academic_performance,
                sa.uploaded_documents_json,
                sa.extracurricular_activities,
                sa.parent_guardian_name,
                sa.parent_guardian_contact,
                sa.financial_need_statement,
                sa.how_heard_about,
                sa.scholarship_id,
                sa.motivation_statement,
                sa.terms_agreed,
                sa.application_date,
                sa.status,
                sa.reviewer_notes,
                COALESCE(s.name, 'Unknown Scholarship') as scholarship_name
            FROM scholarship_applications sa
            LEFT JOIN scholarships s ON sa.scholarship_id = s.id
            WHERE sa.application_id = ?
        `, [req.params.id]);

        if (applications.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Map to camelCase for frontend consistency
        const app = applications[0];
        const mapped = {
            applicationId: app.application_id,
            fullName: app.full_name,
            emailAddress: app.email_address,
            profilePictureUrl: app.profile_picture_url,
            dateOfBirth: app.date_of_birth,
            gender: app.gender,
            phoneNumber: app.phone_number,
            address: app.address,
            preferredUniversity: app.preferred_university,
            country: app.country,
            academicLevel: app.academic_level,
            intendedMajor: app.intended_major,
            gpaAcademicPerformance: app.gpa_academic_performance,
            uploadedDocumentsJson: app.uploaded_documents_json,
            extracurricularActivities: app.extracurricular_activities,
            parentGuardianName: app.parent_guardian_name,
            parentGuardianContact: app.parent_guardian_contact,
            financialNeedStatement: app.financial_need_statement,
            howHeardAbout: app.how_heard_about,
            scholarshipId: app.scholarship_id,
            motivationStatement: app.motivation_statement,
            termsAgreed: !!app.terms_agreed,
            applicationDate: app.application_date,
            status: app.status,
            reviewerNotes: app.reviewer_notes,
            scholarshipName: app.scholarship_name
        };

        res.json(mapped);
    } catch (error) {
        console.error('Error fetching application details:', error);
        res.status(500).json({ message: 'Error fetching application details' });
    }
});

// Delete application
router.delete('/applications/:id', adminAuth, async (req, res) => {
    try {
        const [result] = await db.query(
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

// Create application (admin)
router.post('/applications', adminAuth, upload.fields([
    { name: 'profile_picture_url', maxCount: 1 },
    { name: 'uploaded_documents_json', maxCount: 10 }
]), async (req, res) => {
    try {
        // Handle file uploads
        let profile_picture_url = null;
        if (req.files['profile_picture_url'] && req.files['profile_picture_url'][0]) {
            profile_picture_url = req.files['profile_picture_url'][0].path.replace(/\\/g, '/');
        }
        let uploaded_documents_json = null;
        if (req.files['uploaded_documents_json']) {
            const uploadedDocuments = req.files['uploaded_documents_json'].map(file => file.path.replace(/\\/g, '/'));
            uploaded_documents_json = JSON.stringify(uploadedDocuments);
        }

        const {
            full_name,
            email_address,
            date_of_birth,
            gender,
            phone_number,
            address,
            preferred_university,
            country,
            academic_level,
            intended_major,
            gpa_academic_performance,
            extracurricular_activities,
            parent_guardian_name,
            parent_guardian_contact,
            financial_need_statement,
            how_heard_about,
            scholarship_id,
            motivation_statement,
            terms_agreed
        } = req.body;
        
        // Validate required fields (adjust as needed)
        if (!full_name || !email_address || !country || !motivation_statement || !scholarship_id) {
            return res.status(400).json({ 
                message: 'Missing required fields.' 
            });
        }
        
        // Check if scholarship exists
        const [scholarships] = await db.query(
            'SELECT * FROM scholarships WHERE id = ?',
            [scholarship_id]
        );
        if (scholarships.length === 0) {
            return res.status(404).json({ message: 'Scholarship not found' });
        }

        // Insert application with all fields
        const [result] = await db.query(
            `INSERT INTO scholarship_applications (
                full_name, email_address, profile_picture_url, date_of_birth, gender, phone_number, address,
                preferred_university, country, academic_level, intended_major, gpa_academic_performance,
                uploaded_documents_json, extracurricular_activities, parent_guardian_name, parent_guardian_contact,
                financial_need_statement, how_heard_about, scholarship_id, motivation_statement, terms_agreed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                full_name, email_address, profile_picture_url, date_of_birth, gender, phone_number, address,
                preferred_university, country, academic_level, intended_major, gpa_academic_performance,
                uploaded_documents_json, extracurricular_activities, parent_guardian_name, parent_guardian_contact,
                financial_need_statement, how_heard_about, scholarship_id, motivation_statement, 
                terms_agreed === 'on' || terms_agreed === true ? 1 : 0
            ]
        );
        
        const [newApplication] = await db.query(
            'SELECT * FROM scholarship_applications WHERE application_id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Application created successfully',
            application: newApplication[0]
        });

    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ message: 'Error creating application' });
    }
});

// Update application (admin)
router.put('/applications/:id', adminAuth, upload.fields([
    { name: 'profile_picture_url', maxCount: 1 },
    { name: 'uploaded_documents_json', maxCount: 10 }
]), async (req, res) => {
    try {
        const applicationId = req.params.id;
        
        // Check if application exists
        const [existingApplication] = await db.query(
            'SELECT * FROM scholarship_applications WHERE application_id = ?',
            [applicationId]
        );
        if (existingApplication.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        // Handle file uploads
        let profile_picture_url = existingApplication[0].profile_picture_url;
        if (req.files && req.files['profile_picture_url'] && req.files['profile_picture_url'][0]) {
            profile_picture_url = req.files['profile_picture_url'][0].path.replace(/\\/g, '/');
        }
        
        let uploaded_documents_json = existingApplication[0].uploaded_documents_json;
        if (req.files && req.files['uploaded_documents_json']) {
            const uploadedDocuments = req.files['uploaded_documents_json'].map(file => file.path.replace(/\\/g, '/'));
            uploaded_documents_json = JSON.stringify(uploadedDocuments);
        }

        const {
            full_name,
            email_address,
            date_of_birth,
            gender,
            phone_number,
            address,
            preferred_university,
            country,
            academic_level,
            intended_major,
            gpa_academic_performance,
            extracurricular_activities,
            parent_guardian_name,
            parent_guardian_contact,
            financial_need_statement,
            how_heard_about,
            scholarship_id,
            motivation_statement,
            terms_agreed
        } = req.body;

        // Validate required fields (adjust as needed)
        if (!full_name || !email_address || !country || !motivation_statement || !scholarship_id) {
            return res.status(400).json({ 
                message: 'Missing required fields.' 
            });
        }
        
        // Check if scholarship exists
        const [scholarships] = await db.query(
            'SELECT * FROM scholarships WHERE id = ?',
            [scholarship_id]
        );
        if (scholarships.length === 0) {
            return res.status(404).json({ message: 'Scholarship not found' });
        }
        
        // Update application with all fields
        const [result] = await db.query(
            `UPDATE scholarship_applications SET
                full_name = ?,
                email_address = ?,
                profile_picture_url = ?,
                date_of_birth = ?,
                gender = ?,
                phone_number = ?,
                address = ?,
                preferred_university = ?,
                country = ?,
                academic_level = ?,
                intended_major = ?,
                gpa_academic_performance = ?,
                uploaded_documents_json = ?,
                extracurricular_activities = ?,
                parent_guardian_name = ?,
                parent_guardian_contact = ?,
                financial_need_statement = ?,
                how_heard_about = ?,
                scholarship_id = ?,
                motivation_statement = ?,
                terms_agreed = ?
            WHERE application_id = ?`,
            [
                full_name,
                email_address,
                profile_picture_url,
                date_of_birth,
                gender,
                phone_number,
                address,
                preferred_university,
                country,
                academic_level,
                intended_major,
                gpa_academic_performance,
                uploaded_documents_json,
                extracurricular_activities,
                parent_guardian_name,
                parent_guardian_contact,
                financial_need_statement,
                how_heard_about,
                scholarship_id,
                motivation_statement,
                terms_agreed === 'on' || terms_agreed === true ? 1 : 0,
                applicationId
            ]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Application not found during update' });
        }
        
        // Fetch updated application
        const [updatedApplication] = await db.query(
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

// Alter scholarships table to add university column
router.post('/alter-scholarships', adminAuth, async (req, res) => {
    try {
        await db.query(
            `ALTER TABLE scholarships ADD COLUMN university VARCHAR(255) NOT NULL`
        );
        res.json({ message: 'Scholarships table altered successfully' });
    } catch (error) {
        console.error('Error altering scholarships table:', error);
        res.status(500).json({ message: 'Error altering scholarships table' });
    }
});

router.get('/dashboard/stats', adminAuth, async (req, res) => {
    try {
        const [userStats] = await db.query(
            `SELECT role, COUNT(*) as count
            FROM users
            GROUP BY role`
        );
        const userStatsData = {
            user: 0,
            admin: 0
        };
        userStats.forEach(row => {
            userStatsData[row.role] = row.count;
        });

        res.json({
            userStats: Object.values(userStatsData)
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Get system statistics
router.get('/system-stats', adminAuth, async (req, res) => {
  try {
    // Database size
    const [dbSize] = await db.query(`
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size in MB'
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);

    // Table row counts
    const [tableStats] = await db.query(`
      SELECT 
        table_name,
        table_rows
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY table_rows DESC
    `);

    // Recent activity (last 7 days)
    const [recentActivity] = await db.query(`
      SELECT 
        'applications' as type,
        COUNT(*) as count
      FROM scholarship_applications 
      WHERE application_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 
        'users' as type,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    res.json({
      databaseSize: dbSize[0]['DB Size in MB'],
      tableStats,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Error fetching system statistics' });
  }
});

// Get application statistics
router.get('/application-stats', adminAuth, async (req, res) => {
  try {
    // Applications by status
    const [statusStats] = await db.query(`
      SELECT 
        COALESCE(status, 'pending') as status,
        COUNT(*) as count
      FROM scholarship_applications 
      GROUP BY status
    `);

    // Applications by academic level
    const [levelStats] = await db.query(`
      SELECT 
        academic_level,
        COUNT(*) as count
      FROM scholarship_applications 
      GROUP BY academic_level
    `);

    // Applications by month (last 12 months)
    const [monthlyStats] = await db.query(`
      SELECT 
        DATE_FORMAT(application_date, '%Y-%m') as month,
        COUNT(*) as count
      FROM scholarship_applications 
      WHERE application_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    res.json({
      statusStats,
      levelStats,
      monthlyStats
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ message: 'Error fetching application statistics' });
  }
});

// Export data
router.get('/export/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json' } = req.query;

    let data;
    let filename;

    switch (type) {
      case 'applications':
        const [applications] = await db.query(`
          SELECT 
            sa.*,
            s.name as scholarship_name
          FROM scholarship_applications sa
          LEFT JOIN scholarships s ON sa.scholarship_id = s.id
          ORDER BY sa.application_date DESC
        `);
        data = applications;
        filename = 'applications';
        break;

      case 'users':
        const [users] = await db.query(`
          SELECT id, full_name, email, role, status, created_at
          FROM users
          ORDER BY created_at DESC
        `);
        data = users;
        filename = 'users';
        break;

      case 'scholarships':
        const [scholarships] = await db.query(`
          SELECT * FROM scholarships ORDER BY created_at DESC
        `);
        data = scholarships;
        filename = 'scholarships';
        break;

      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Error exporting data' });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Get all admin users
router.get('/admin-users', adminAuth, async (req, res) => {
  try {
    const [adminUsers] = await db.query(`
      SELECT au.*, u.email, u.full_name, u.status as user_status
      FROM admin_users au 
      JOIN users u ON au.user_id = u.id 
      ORDER BY au.created_at DESC
    `);
    
    res.json(adminUsers);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Error fetching admin users' });
  }
});

// Create new admin user
router.post('/admin-users', adminAuth, async (req, res) => {
  try {
    const { userId, adminLevel = 'admin', permissions = {} } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user exists
    const [users] = await db.query('SELECT id, full_name, email FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already an admin
    const [existingAdmin] = await db.query('SELECT id FROM admin_users WHERE user_id = ?', [userId]);
    
    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    // Insert new admin user
    const [result] = await db.query(`
      INSERT INTO admin_users (user_id, full_name, email, admin_level, permissions) 
      VALUES (?, ?, ?, ?, ?)
    `, [userId, users[0].full_name, users[0].email, adminLevel, JSON.stringify(permissions)]);

    res.status(201).json({ 
      message: 'Admin user created successfully',
      adminUserId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Error creating admin user' });
  }
});

// Update admin user
router.put('/admin-users/:id', adminAuth, async (req, res) => {
  try {
    const { adminLevel, permissions, isActive } = req.body;
    
    const [result] = await db.query(`
      UPDATE admin_users 
      SET admin_level = ?, permissions = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [adminLevel, JSON.stringify(permissions), isActive, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    res.json({ message: 'Admin user updated successfully' });
  } catch (error) {
    console.error('Error updating admin user:', error);
    res.status(500).json({ message: 'Error updating admin user' });
  }
});

// Delete admin user
router.delete('/admin-users/:id', adminAuth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM admin_users WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    res.json({ message: 'Admin user deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({ message: 'Error deleting admin user' });
  }
});

// Get admin user by ID
router.get('/admin-users/:id', adminAuth, async (req, res) => {
  try {
    const [adminUsers] = await db.query(`
      SELECT au.*, u.email, u.full_name, u.status as user_status
      FROM admin_users au 
      JOIN users u ON au.user_id = u.id 
      WHERE au.id = ?
    `, [req.params.id]);

    if (adminUsers.length === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    res.json(adminUsers[0]);
  } catch (error) {
    console.error('Error fetching admin user:', error);
    res.status(500).json({ message: 'Error fetching admin user' });
  }
});

// Update admin user last login
router.put('/admin-users/:id/last-login', adminAuth, async (req, res) => {
  try {
    const [result] = await db.query(`
      UPDATE admin_users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    res.json({ message: 'Last login updated successfully' });
  } catch (error) {
    console.error('Error updating last login:', error);
    res.status(500).json({ message: 'Error updating last login' });
  }
});

// Debug endpoint to check admin table status
router.get('/debug/admin-status', async (req, res) => {
  try {
    // Check if admin_users table exists
    const [adminTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'admin_users'
    `);
    
    let adminTableExists = adminTables.length > 0;
    let adminUsers = [];
    let usersWithAdminRole = [];
    
    if (adminTableExists) {
      // Get admin users
      [adminUsers] = await db.query(`
        SELECT au.*, u.email, u.full_name 
        FROM admin_users au 
        JOIN users u ON au.user_id = u.id
      `);
    }
    
    // Get users with admin role
    [usersWithAdminRole] = await db.query(`
      SELECT id, email, full_name, role 
      FROM users 
      WHERE role = 'admin'
    `);
    
    res.json({
      adminTableExists,
      adminUsersCount: adminUsers.length,
      adminUsers,
      usersWithAdminRoleCount: usersWithAdminRole.length,
      usersWithAdminRole
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manual migration endpoint
router.post('/migrate-admins', async (req, res) => {
  try {
    // Get all users with role = 'admin'
    const [adminUsers] = await db.query(`
      SELECT id, full_name, email 
      FROM users 
      WHERE role = 'admin'
    `);
    
    let migratedCount = 0;
    let errors = [];
    
    for (const user of adminUsers) {
      try {
        // Check if admin already exists in admin_users table
        const [existingAdmin] = await db.query(`
          SELECT id FROM admin_users WHERE user_id = ?
        `, [user.id]);
        
        if (existingAdmin.length === 0) {
          // Insert into admin_users table
          await db.query(`
            INSERT INTO admin_users (user_id, full_name, email, admin_level, permissions) 
            VALUES (?, ?, ?, 'admin', '{}')
          `, [user.id, user.full_name, user.email]);
          
          migratedCount++;
          console.log(`Migrated admin user: ${user.email}`);
        }
      } catch (error) {
        errors.push({ user: user.email, error: error.message });
      }
    }
    
    res.json({
      message: `Migration completed. ${migratedCount} users migrated.`,
      migratedCount,
      errors
    });
  } catch (error) {
    console.error('Error during migration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ensure admin table and migrate users endpoint
router.post('/ensure-admin-setup', async (req, res) => {
  try {
    console.log('Ensuring admin table setup...');
    
    // Check if admin_users table exists
    const [adminTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'admin_users'
    `);
    
    let tableCreated = false;
    let usersMigrated = 0;
    
    if (adminTables.length === 0) {
      // Create admin_users table
      await db.query(`
        CREATE TABLE admin_users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          admin_level ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
          permissions JSON,
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_email (email),
          INDEX idx_admin_level (admin_level),
          INDEX idx_is_active (is_active)
        )
      `);
      tableCreated = true;
      console.log('Admin users table created successfully');
    }
    
    // Migrate existing admin users
    const [adminUsers] = await db.query(`
      SELECT id, full_name, email 
      FROM users 
      WHERE role = 'admin'
    `);
    
    for (const user of adminUsers) {
      try {
        // Check if admin already exists in admin_users table
        const [existingAdmin] = await db.query(`
          SELECT id FROM admin_users WHERE user_id = ?
        `, [user.id]);
        
        if (existingAdmin.length === 0) {
          // Insert into admin_users table
          await db.query(`
            INSERT INTO admin_users (user_id, full_name, email, admin_level, permissions) 
            VALUES (?, ?, ?, 'admin', '{}')
          `, [user.id, user.full_name, user.email]);
          
          usersMigrated++;
          console.log(`Migrated admin user: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error migrating admin user ${user.email}:`, error);
      }
    }
    
    res.json({
      success: true,
      message: 'Admin setup completed successfully',
      tableCreated,
      usersMigrated,
      totalAdminUsers: adminUsers.length
    });
  } catch (error) {
    console.error('Error ensuring admin setup:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Create admin user from existing user
router.post('/create-admin', async (req, res) => {
  try {
    const { email, adminLevel = 'admin' } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const [users] = await db.query('SELECT id, full_name, email FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Check if admin_users table exists, create if not
    const [adminTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'admin_users'
    `);

    if (adminTables.length === 0) {
      await db.query(`
        CREATE TABLE admin_users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          admin_level ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
          permissions JSON,
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_email (email),
          INDEX idx_admin_level (admin_level),
          INDEX idx_is_active (is_active)
        )
      `);
    }

    // Check if user is already an admin
    const [existingAdmin] = await db.query('SELECT id FROM admin_users WHERE user_id = ?', [user.id]);
    
    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    // Insert new admin user
    const [result] = await db.query(`
      INSERT INTO admin_users (user_id, full_name, email, admin_level, permissions) 
      VALUES (?, ?, ?, ?, '{}')
    `, [user.id, user.full_name, user.email, adminLevel]);

    res.status(201).json({ 
      message: 'Admin user created successfully',
      adminUserId: result.insertId,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        admin_level: adminLevel
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Error creating admin user' });
  }
});

export default router; 
