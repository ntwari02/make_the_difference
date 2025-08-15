import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
<<<<<<< HEAD
=======
import { bypassAuth } from '../middleware/auth.js';
>>>>>>> 9414e4dfd9fa5224f2112664b58d35261a786e42
import multer from 'multer';
import { body, validationResult, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
router.use(helmet());
router.use(hpp());

// Custom XSS prevention middleware (replacing deprecated xss-clean)
const xssPrevention = (req, res, next) => {
    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key]
                    .replace(/[<>]/g, '')
                    .replace(/[&]/g, '&amp;')
                    .replace(/["]/g, '&quot;')
                    .replace(/[']/g, '&#x27;')
                    .replace(/[/]/g, '&#x2F;');
            }
        });
    }
    
    // Sanitize body parameters
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key]
                    .replace(/[<>]/g, '')
                    .replace(/[&]/g, '&amp;')
                    .replace(/["]/g, '&quot;')
                    .replace(/[']/g, '&#x27;')
                    .replace(/[/]/g, '&#x2F;');
            }
        });
    }
    
    next();
};

router.use(xssPrevention);

// Rate limiting for admin routes
const adminRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(adminRateLimit);

// Enhanced admin authentication middleware with RBAC
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No authentication token, access denied',
                code: 'NO_TOKEN'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user with enhanced security checks
        const [users] = await db.query(`
            SELECT u.id, u.email, u.full_name, u.role, u.status, u.last_login,
                   au.admin_level, au.permissions, au.is_active as admin_active
            FROM users u
            LEFT JOIN admin_users au ON u.id = au.user_id
            WHERE u.id = ? AND u.status = 'active'
        `, [decoded.id]);

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found or inactive',
                code: 'USER_NOT_FOUND'
            });
        }

        const user = users[0];

        // Check if user is admin
        if (!user.admin_level || !user.admin_active) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied. Admin privileges required.',
                code: 'INSUFFICIENT_PRIVILEGES'
            });
        }

        // Parse permissions safely
        let permissions = {};
        try {
            permissions = user.permissions ? JSON.parse(user.permissions) : {};
        } catch (error) {
            console.error('Error parsing permissions:', error);
            permissions = {};
        }

        // Add user info to request with permissions
        req.user = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            admin_level: user.admin_level,
            permissions: permissions,
            last_login: user.last_login
        };

        // Log admin access
        console.log(`Admin access: ${user.email} (${user.admin_level}) - ${req.method} ${req.path}`);

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(401).json({ 
            success: false,
            message: 'Token verification failed, authorization denied',
            code: 'TOKEN_INVALID'
        });
    }
};

// Permission-based middleware
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Required permissions not found.',
                code: 'NO_PERMISSIONS'
            });
        }

        if (!req.user.permissions[permission]) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Permission '${permission}' required.`,
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        next();
    };
};

// Super admin middleware
const requireSuperAdmin = (req, res, next) => {
    if (req.user.admin_level !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super admin privileges required.',
            code: 'SUPER_ADMIN_REQUIRED'
        });
    }
    next();
};

// Input validation middleware
const validateInput = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
            code: 'VALIDATION_ERROR'
        });
    }
    next();
};

// Sanitize input data
const sanitizeInput = (data) => {
    if (typeof data === 'string') {
        return data.trim()
            .replace(/[<>]/g, '')
            .replace(/[&]/g, '&amp;')
            .replace(/["]/g, '&quot;')
            .replace(/[']/g, '&#x27;')
            .replace(/[/]/g, '&#x2F;');
    }
    if (typeof data === 'object' && data !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }
    return data;
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'profile_picture') {
            cb(null, 'uploads/profile_pictures/');
        } else {
            cb(null, 'uploads/documents/');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, uniqueSuffix + '-' + sanitizedName);
    }
});

const fileFilter = (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files
    }
});

// Dashboard statistics with enhanced security
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        // Use parameterized queries to prevent SQL injection
        const [usersCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE status = ?', ['active']);
        const [partnersCount] = await db.query('SELECT COUNT(*) as count FROM partners');
        const [scholarshipsCount] = await db.query('SELECT COUNT(*) as count FROM scholarships WHERE status = ?', ['active']);
        const [applicationsCount] = await db.query('SELECT COUNT(*) as count FROM scholarship_applications');
        const [pendingApplications] = await db.query('SELECT COUNT(*) as count FROM scholarship_applications WHERE status = ?', ['pending']);
        const [approvedApplications] = await db.query('SELECT COUNT(*) as count FROM scholarship_applications WHERE status = ?', ['approved']);

        // Get recent activity (last 7 days)
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
            success: true,
            data: {
                users: usersCount[0].count,
                partners: partnersCount[0].count,
                scholarships: scholarshipsCount[0].count,
                applications: applicationsCount[0].count,
                pendingApplications: pendingApplications[0].count,
                approvedApplications: approvedApplications[0].count,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching dashboard statistics',
            code: 'DASHBOARD_ERROR'
        });
    }
});

// Get users with enhanced security and pagination
router.get('/users', adminAuth, requirePermission('can_manage_users'), async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Validate pagination parameters
        if (parseInt(page) < 1 || parseInt(limit) < 1 || parseInt(limit) > 100) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pagination parameters',
                code: 'INVALID_PAGINATION'
            });
        }

        let query = `
            SELECT id, full_name, email, role, status, created_at, last_login 
            FROM users 
            WHERE 1=1
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const params = [];
        const countParams = [];

        // Add search filter
        if (search && search.trim()) {
            const searchTerm = `%${search.trim()}%`;
            query += ' AND (full_name LIKE ? OR email LIKE ?)';
            countQuery += ' AND (full_name LIKE ? OR email LIKE ?)';
            params.push(searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm);
        }

        // Add role filter
        if (role && ['user', 'admin'].includes(role)) {
            query += ' AND role = ?';
            countQuery += ' AND role = ?';
            params.push(role);
            countParams.push(role);
        }

        // Add status filter
        if (status && ['active', 'inactive'].includes(status)) {
            query += ' AND status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
            countParams.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [users] = await db.query(query, params);
        const [totalResult] = await db.query(countQuery, countParams);
        const total = totalResult[0].total;

        res.json({
            success: true,
            data: {
                users: users.map(user => ({
                    ...user,
                    full_name: sanitizeInput(user.full_name),
                    email: sanitizeInput(user.email)
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching users',
            code: 'USERS_FETCH_ERROR'
        });
    }
});

<<<<<<< HEAD
// Create user with validation
router.post('/users', 
    adminAuth, 
    requirePermission('can_manage_users'),
    [
        body('fullName')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Full name must be between 2 and 100 characters')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Full name can only contain letters and spaces'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        body('role')
            .isIn(['user', 'admin'])
            .withMessage('Role must be either user or admin'),
        body('status')
            .optional()
            .isIn(['active', 'inactive'])
            .withMessage('Status must be either active or inactive')
    ],
    validateInput,
    async (req, res) => {
        try {
            const { fullName, email, password, role = 'user', status = 'active' } = req.body;
=======
// Get dashboard statistics
router.get('/dashboard', bypassAuth, async (req, res) => {
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
>>>>>>> 9414e4dfd9fa5224f2112664b58d35261a786e42

            // Check if email already exists
            const [existingUsers] = await db.query(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

<<<<<<< HEAD
            if (existingUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists',
                    code: 'EMAIL_EXISTS'
                });
            }
=======
// Get all users with pagination and search
router.get('/users', bypassAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, full_name, email, status, created_at FROM users WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const params = [];
    const countParams = [];
>>>>>>> 9414e4dfd9fa5224f2112664b58d35261a786e42

            // Hash password with high cost factor
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert new user
            const [result] = await db.query(
                'INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
                [fullName, email, hashedPassword, role, status]
            );

            // Log user creation
            console.log(`User created by admin ${req.user.email}: ${email} (${role})`);

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    userId: result.insertId,
                    email: sanitizeInput(email),
                    role: role
                }
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating user',
                code: 'USER_CREATE_ERROR'
            });
        }
    }
);

<<<<<<< HEAD
// Update user with validation
router.put('/users/:id',
    adminAuth,
    requirePermission('can_manage_users'),
    [
        body('fullName')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Full name must be between 2 and 100 characters')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Full name can only contain letters and spaces'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('role')
            .isIn(['user', 'admin'])
            .withMessage('Role must be either user or admin'),
        body('status')
            .isIn(['active', 'inactive'])
            .withMessage('Status must be either active or inactive')
    ],
    validateInput,
    async (req, res) => {
        try {
            const { fullName, email, role, status } = req.body;
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID',
                    code: 'INVALID_USER_ID'
                });
            }

            // Check if user exists
            const [existingUser] = await db.query(
                'SELECT id, email FROM users WHERE id = ?',
                [userId]
            );

            if (existingUser.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Check if email exists for other users
            const [emailCheck] = await db.query(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, userId]
            );

            if (emailCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists',
                    code: 'EMAIL_EXISTS'
                });
            }

            // Update user
            const [result] = await db.query(
                'UPDATE users SET full_name = ?, email = ?, role = ?, status = ? WHERE id = ?',
                [fullName, email, role, status, userId]
            );

            // Log user update
            console.log(`User updated by admin ${req.user.email}: ${email} (${role})`);

            res.json({
                success: true,
                message: 'User updated successfully',
                data: {
                    userId: userId,
                    email: sanitizeInput(email),
                    role: role,
                    status: status
                }
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating user',
                code: 'USER_UPDATE_ERROR'
            });
        }
    }
);
=======
    // role filtering removed; admin is determined via admin_users
>>>>>>> 9414e4dfd9fa5224f2112664b58d35261a786e42

// Delete user with safety checks
router.delete('/users/:id',
    adminAuth,
    requirePermission('can_manage_users'),
    async (req, res) => {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID',
                    code: 'INVALID_USER_ID'
                });
            }

            // Prevent self-deletion
            if (userId === req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete your own account',
                    code: 'SELF_DELETE_NOT_ALLOWED'
                });
            }

<<<<<<< HEAD
            // Check if user has applications
            const [applications] = await db.query(
                'SELECT COUNT(*) as count FROM scholarship_applications WHERE email_address IN (SELECT email FROM users WHERE id = ?)',
                [userId]
            );
=======
// Get user by ID
router.get('/users/:id', bypassAuth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, full_name, email, status FROM users WHERE id = ?',
      [req.params.id]
    );
>>>>>>> 9414e4dfd9fa5224f2112664b58d35261a786e42

            if (applications[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete user with existing applications. Please delete applications first.',
                    code: 'USER_HAS_APPLICATIONS'
                });
            }

            // Soft delete - mark as inactive instead of hard delete
            const [result] = await db.query(
                'UPDATE users SET status = ? WHERE id = ?',
                ['inactive', userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Log user deletion
            console.log(`User deactivated by admin ${req.user.email}: User ID ${userId}`);

            res.json({
                success: true,
                message: 'User deactivated successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting user',
                code: 'USER_DELETE_ERROR'
            });
        }
    }
);

// Get applications with enhanced security
router.get('/applications',
    adminAuth,
    requirePermission('can_view_applications'),
    async (req, res) => {
        try {
            const { page = 1, limit = 10, status = '', search = '' } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

<<<<<<< HEAD
            let query = `
                SELECT 
                    sa.application_id, 
                    sa.full_name, 
                    sa.email_address, 
                    sa.status,
                    sa.application_date,
                    sa.academic_level,
                    sa.country,
                    COALESCE(s.name, 'Unknown Scholarship') as scholarship_name
                FROM scholarship_applications sa
                LEFT JOIN scholarships s ON sa.scholarship_id = s.id
                WHERE 1=1
            `;
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM scholarship_applications sa
                LEFT JOIN scholarships s ON sa.scholarship_id = s.id
                WHERE 1=1
            `;
            const params = [];
            const countParams = [];

            if (status && ['pending', 'approved', 'rejected'].includes(status)) {
                query += ' AND sa.status = ?';
                countQuery += ' AND sa.status = ?';
                params.push(status);
                countParams.push(status);
            }

            if (search && search.trim()) {
                const searchTerm = `%${search.trim()}%`;
                query += ' AND (sa.full_name LIKE ? OR sa.email_address LIKE ?)';
                countQuery += ' AND (sa.full_name LIKE ? OR sa.email_address LIKE ?)';
                params.push(searchTerm, searchTerm);
                countParams.push(searchTerm, searchTerm);
            }

            query += ' ORDER BY sa.application_date DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), offset);

            const [applications] = await db.query(query, params);
            const [totalResult] = await db.query(countQuery, countParams);
            const total = totalResult[0].total;

            res.json({
                success: true,
                data: {
                    applications: applications.map(app => ({
                        ...app,
                        full_name: sanitizeInput(app.full_name),
                        email_address: sanitizeInput(app.email_address)
                    })),
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit))
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching applications',
                code: 'APPLICATIONS_FETCH_ERROR'
            });
        }
    }
);

// Update application status
router.put('/applications/:id/status',
    adminAuth,
    requirePermission('can_manage_applications'),
    [
        body('status')
            .isIn(['pending', 'approved', 'rejected'])
            .withMessage('Status must be pending, approved, or rejected'),
        body('reviewer_notes')
            .optional()
            .isLength({ max: 1000 })
            .withMessage('Reviewer notes must be less than 1000 characters')
    ],
    validateInput,
    async (req, res) => {
        try {
            const { status, reviewer_notes } = req.body;
            const applicationId = parseInt(req.params.id);
=======
// Create new user
router.post('/users', bypassAuth, async (req, res) => {
  try {
    const { fullName, email, password, status = 'active' } = req.body;
    
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
      'INSERT INTO users (full_name, email, password, status) VALUES (?, ?, ?, ?)',
      [fullName, email, hashedPassword, status]
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
router.put('/users/:id', bypassAuth, async (req, res) => {
  try {
    const { fullName, email, status } = req.body;
    
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
      'UPDATE users SET full_name = ?, email = ?, status = ? WHERE id = ?',
      [fullName, email, status || 'active', req.params.id]
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
router.delete('/users/:id', bypassAuth, async (req, res) => {
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
router.get('/newsletter-subscribers', bypassAuth, async (req, res) => {
  try {
    const [subscribers] = await db.query('SELECT * FROM newsletter_subscribers');
    res.json(subscribers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching newsletter subscribers' });
  }
});

// Delete newsletter subscriber
router.delete('/newsletter-subscribers/:id', bypassAuth, async (req, res) => {
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
router.get('/chart-stats', bypassAuth, async (req, res) => {
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

    // User registration stats (users vs admins)
    const [[usersCountRow]] = await db.query(`
      SELECT COUNT(*) as count FROM users
    `);
    const [[adminsCountRow]] = await db.query(`
      SELECT COUNT(*) as count FROM admin_users WHERE is_active = TRUE
    `);

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
      userRegistration: [usersCountRow.count, adminsCountRow.count],
      statusOverview: Object.values(statusOverviewData)
    });
  } catch (error) {
    console.error('Error fetching chart stats:', error);
    res.status(500).json({ message: 'Error fetching chart stats' });
  }
});

// Update user status
router.put('/users/:id/status', bypassAuth, async (req, res) => {
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
router.put('/applications/:id/status', bypassAuth, async (req, res) => {
  try {
    const { status, reviewer_notes } = req.body;
    const applicationId = req.params.id;
>>>>>>> 9414e4dfd9fa5224f2112664b58d35261a786e42

            if (isNaN(applicationId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid application ID',
                    code: 'INVALID_APPLICATION_ID'
                });
            }

            // Check if application exists
            const [application] = await db.query(
                'SELECT application_id, email_address, status FROM scholarship_applications WHERE application_id = ?',
                [applicationId]
            );

            if (application.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found',
                    code: 'APPLICATION_NOT_FOUND'
                });
            }

            // Update application status
            const [result] = await db.query(
                'UPDATE scholarship_applications SET status = ?, reviewer_notes = ?, reviewed_at = NOW() WHERE application_id = ?',
                [status, reviewer_notes || null, applicationId]
            );

<<<<<<< HEAD
            // Log status update
            console.log(`Application status updated by admin ${req.user.email}: ${applicationId} -> ${status}`);

            res.json({
                success: true,
                message: 'Application status updated successfully',
                data: {
                    applicationId: applicationId,
                    status: status,
                    reviewer_notes: reviewer_notes
                }
            });
        } catch (error) {
            console.error('Error updating application status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating application status',
                code: 'APPLICATION_UPDATE_ERROR'
=======
// Create user (admin only)
router.post('/users', bypassAuth, async (req, res) => {
  try {
    const { fullName, email, status } = req.body;
    
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
      'INSERT INTO users (full_name, email, password, status) VALUES (?, ?, ?, ?)',
      [fullName, email, defaultPassword, status || 'active']
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
router.get('/applications', bypassAuth, async (req, res) => {
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
router.get('/applications/:id', bypassAuth, async (req, res) => {
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
router.delete('/applications/:id', bypassAuth, async (req, res) => {
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
router.post('/applications', bypassAuth, upload.fields([
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
>>>>>>> 9414e4dfd9fa5224f2112664b58d35261a786e42
            });
        }
    }
);

<<<<<<< HEAD
// System audit log
router.get('/audit-log',
    adminAuth,
    requireSuperAdmin,
    async (req, res) => {
        try {
            const { page = 1, limit = 50 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
=======
// Update application (admin)
router.put('/applications/:id', bypassAuth, upload.fields([
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
>>>>>>> 9414e4dfd9fa5224f2112664b58d35261a786e42

            // This would typically come from an audit_log table
            // For now, we'll return a placeholder
            res.json({
                success: true,
                data: {
                    logs: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        pages: 0
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching audit log:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching audit log',
                code: 'AUDIT_LOG_ERROR'
            });
        }
    }
);

// Security settings
router.get('/security-settings',
    adminAuth,
    requireSuperAdmin,
    async (req, res) => {
        try {
            res.json({
                success: true,
                data: {
                    rateLimiting: {
                        enabled: true,
                        windowMs: 15 * 60 * 1000,
                        maxRequests: 100
                    },
                    passwordPolicy: {
                        minLength: 8,
                        requireUppercase: true,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSpecialChars: false
                    },
                    sessionPolicy: {
                        maxAge: 24 * 60 * 60 * 1000, // 24 hours
                        secure: true,
                        httpOnly: true
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching security settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching security settings',
                code: 'SECURITY_SETTINGS_ERROR'
            });
        }
    }
);

// Health check endpoint
router.get('/health',
    adminAuth,
    async (req, res) => {
        try {
            // Check database connection
            const [dbCheck] = await db.query('SELECT 1 as health');
            
            res.json({
                success: true,
                data: {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    database: dbCheck.length > 0 ? 'connected' : 'disconnected',
                    admin: {
                        id: req.user.id,
                        email: req.user.email,
                        level: req.user.admin_level,
                        permissions: Object.keys(req.user.permissions || {})
                    }
                }
            });
        } catch (error) {
            console.error('Health check error:', error);
            res.status(500).json({
                success: false,
                data: {
                    status: 'unhealthy',
                    timestamp: new Date().toISOString(),
                    error: error.message
                }
            });
        }
    }
);

<<<<<<< HEAD
export default router;
=======
// Alter scholarships table to add university column
router.post('/alter-scholarships', bypassAuth, async (req, res) => {
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

router.get('/dashboard/stats', bypassAuth, async (req, res) => {
    try {
        // Return user count only; admin users tracked separately in admin_users
        const [userStats] = await db.query(
            `SELECT COUNT(*) as count FROM users`
        );
        const [adminStats] = await db.query(
            `SELECT COUNT(*) as count FROM admin_users WHERE is_active = TRUE`
        );

        res.json({
            users: userStats[0].count,
            admins: adminStats[0].count
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Get system statistics
router.get('/system-stats', bypassAuth, async (req, res) => {
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
router.get('/application-stats', bypassAuth, async (req, res) => {
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
router.get('/export/:type', bypassAuth, async (req, res) => {
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
          SELECT id, full_name, email, status, created_at
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

export default router; 
>>>>>>> 9414e4dfd9fa5224f2112664b58d35261a786e42
