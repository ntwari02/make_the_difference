import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { bypassAuth } from '../middleware/auth.js';
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

// Permission-based middleware (super admin bypasses all checks)
const requirePermission = (permission) => {
    return (req, res, next) => {
        // Super admin: full access
        if (req.user && req.user.admin_level === 'super_admin') {
            return next();
        }

        if (!req.user || !req.user.permissions) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Required permissions not found.',
                code: 'NO_PERMISSIONS'
            });
        }

        // Support boolean flags or array-style permissions
        const perms = req.user.permissions;
        const hasPermission = Boolean(
            (typeof perms === 'object' && perms !== null && perms[permission]) ||
            (Array.isArray(perms) && perms.includes(permission)) ||
            perms === '*'
        );

        if (!hasPermission) {
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

// Dashboard route moved to admin-dashboard.js

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
            SELECT 
                u.id, u.full_name, u.email, u.role, u.status, u.created_at, u.last_login,
                au.admin_level, au.is_active AS admin_active
            FROM users u
            LEFT JOIN admin_users au ON au.user_id = u.id
            WHERE 1=1
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const params = [];
        const countParams = [];

        // Add search filter
        if (search && search.trim()) {
            const searchTerm = `%${search.trim()}%`;
            query += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
            countQuery += ' AND (full_name LIKE ? OR email LIKE ?)';
            params.push(searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm);
        }

        // Add role filter
        if (role && ['user', 'admin'].includes(role)) {
            query += ' AND u.role = ?';
            countQuery += ' AND role = ?';
            params.push(role);
            countParams.push(role);
        }

        // Add status filter
        if (status && ['active', 'inactive'].includes(status)) {
            query += ' AND u.status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
            countParams.push(status);
        }

        query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
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
            // Normalize permissions input (object of booleans, array of keys, or '*')
            const normalizePermissions = (input) => {
                if (!input) return null;
                if (input === '*' || input === '"*"') return '*';
                if (Array.isArray(input)) {
                    const obj = {};
                    input.forEach(key => { obj[String(key)] = true; });
                    return obj;
                }
                if (typeof input === 'object') return input;
                return null;
            };
            const requestedPermissions = normalizePermissions(req.body.permissions);

            // Check if email already exists
            const [existingUsers] = await db.query(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists',
                    code: 'EMAIL_EXISTS'
                });
            }

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

            // If creating an admin, create admin_users linkage with permissions
            try {
                if (role === 'admin') {
                    const isSuper = requestedPermissions === '*';
                    const adminLevel = isSuper ? 'super_admin' : 'admin';
                    const permissionsJson = isSuper
                        ? JSON.stringify('*')
                        : JSON.stringify(requestedPermissions || { can_manage_users: true });
                    await db.query(
                        `INSERT INTO admin_users (user_id, full_name, email, admin_level, permissions, is_active)
                         VALUES (?, ?, ?, ?, ?, 1)
                         ON DUPLICATE KEY UPDATE
                           full_name = VALUES(full_name),
                           email = VALUES(email),
                           admin_level = VALUES(admin_level),
                           permissions = VALUES(permissions),
                           is_active = 1`,
                        [result.insertId, fullName, email, adminLevel, permissionsJson]
                    );
                }
            } catch (linkErr) {
                console.warn('Admin linkage create warning:', linkErr?.message || linkErr);
            }

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
            // Normalize optional permissions
            const normalizePermissions = (input) => {
                if (!input) return null;
                if (input === '*' || input === '"*"') return '*';
                if (Array.isArray(input)) {
                    const obj = {};
                    input.forEach(key => { obj[String(key)] = true; });
                    return obj;
                }
                if (typeof input === 'object') return input;
                return null;
            };
            const requestedPermissions = normalizePermissions(req.body.permissions);

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

            // If role changed to admin, ensure admin_users row exists and active; apply permissions if provided
            try {
                if (role === 'admin') {
                    // Get existing admin linkage
                    const [adminRows] = await db.query('SELECT admin_level, permissions FROM admin_users WHERE user_id = ?', [userId]);
                    let adminLevel = (adminRows[0] && adminRows[0].admin_level) || 'admin';
                    let existingPerms = (adminRows[0] && adminRows[0].permissions) || null;
                    // Preserve existing permissions if none provided; else use requested
                    const isSuper = requestedPermissions === '*';
                    if (isSuper) {
                        adminLevel = 'super_admin';
                    }
                    const finalPermissions = isSuper
                        ? JSON.stringify('*')
                        : JSON.stringify(requestedPermissions || existingPerms || { can_manage_users: true });
                    await db.query(`
                        INSERT INTO admin_users (user_id, full_name, email, admin_level, permissions, is_active)
                        SELECT u.id, u.full_name, u.email, ?, ?, 1 FROM users u WHERE u.id = ?
                        ON DUPLICATE KEY UPDATE
                          full_name = VALUES(full_name),
                          email = VALUES(email),
                          admin_level = VALUES(admin_level),
                          permissions = VALUES(permissions),
                          is_active = 1;
                    `, [adminLevel, finalPermissions, userId]);
                } else {
                    // If demoted from admin, deactivate admin_users link
                    await db.query('UPDATE admin_users SET is_active = 0 WHERE user_id = ?', [userId]);
                }
            } catch (linkErr) {
                console.warn('Admin linkage update warning:', linkErr?.message || linkErr);
            }

            res.json({
                success: true,
                message: 'User updated successfully',
                data: {
                    id: userId,
                    full_name: sanitizeInput(fullName),
                    email: sanitizeInput(email),
                    role,
                    status
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

// Get user with admin permissions
router.get('/users/:id', adminAuth, requirePermission('can_manage_users'), async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const [rows] = await db.query(`
            SELECT u.id, u.full_name, u.email, u.role, u.status,
                   au.admin_level, au.permissions, au.is_active
            FROM users u
            LEFT JOIN admin_users au ON au.user_id = u.id
            WHERE u.id = ?
        `, [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const user = rows[0];
        let permissionsParsed = null;
        try { permissionsParsed = user.permissions ? JSON.parse(user.permissions) : null; } catch {}
        res.json({
            success: true,
            data: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                status: user.status,
                admin_level: user.admin_level,
                permissions: permissionsParsed === null ? user.permissions : permissionsParsed,
                is_admin_active: user.is_active === 1
            }
        });
    } catch (error) {
        console.error('Get user (with permissions) error:', error);
        res.status(500).json({ success: false, message: 'Error fetching user' });
    }
});

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

            // Check if user has applications
            const [applications] = await db.query(
                'SELECT COUNT(*) as count FROM scholarship_applications WHERE email_address IN (SELECT email FROM users WHERE id = ?)',
                [userId]
            );

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

// Application management routes moved to admin-dashboard.js

// Audit log and security settings routes moved to admin-dashboard.js

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

export default router;
