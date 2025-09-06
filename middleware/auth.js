import jwt from 'jsonwebtoken';
import db from '../config/database.js';

// Temporary bypass middleware for development - removes authentication requirement
export const bypassAuth = async (req, res, next) => {
    // Set a mock admin user for development
    req.user = {
        id: 1,
        email: 'admin@example.com',
        full_name: 'Development Admin',
        role: 'admin',
        admin_level: 'super_admin',
        permissions: {
            users: ['read', 'write', 'delete'],
            applications: ['read', 'write', 'delete'],
            scholarships: ['read', 'write', 'delete'],
            settings: ['read', 'write'],
            analytics: ['read'],
            reports: ['read', 'write'],
            email_templates: ['read', 'write', 'delete']
        }
    };
    next();
};

export const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user from the database
        const [users] = await db.query('SELECT id, email, full_name FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0) {
            if (res.headersSent) {
                console.error('Headers already sent, cannot send user not found response');
                return;
            }
            return res.status(401).json({ message: 'User not found' });
        }

        // Add user from payload
        req.user = users[0];
        next();
    } catch (error) {
        // Check if response has already been sent
        if (res.headersSent) {
            console.error('Headers already sent, cannot send error response:', error.message);
            return;
        }
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export const adminAuth = async (req, res, next) => {
    console.log('=== REQUIRE ADMIN MIDDLEWARE ENTERED ===');
    console.log('req.user from previous middleware:', req.user);
    
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('ADMIN AUTH FAILED: No authentication token');
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Admin token decoded:', { id: decoded.id, email: decoded.email });
        
        // Get user from database
        const [users] = await db.query('SELECT id, email, full_name, role FROM users WHERE id = ?', [decoded.id]);
        console.log('Admin user from DB:', users[0]);
        
        if (users.length === 0) {
            console.log('ADMIN AUTH FAILED: User not found');
            if (res.headersSent) {
                console.error('Headers already sent, cannot send admin user not found response');
                return;
            }
            return res.status(401).json({ message: 'User not found' });
        }

        // Get admin user details from admin_users table
        const [adminUsers] = await db.query('SELECT * FROM admin_users WHERE user_id = ? AND is_active = TRUE', [decoded.id]);
        console.log('Admin users found:', adminUsers.length);
        
        if (adminUsers.length === 0) {
            console.log('ADMIN AUTH FAILED: No admin user found or inactive for user_id:', decoded.id);
            if (res.headersSent) {
                console.error('Headers already sent, cannot send admin account not found response');
                return;
            }
            return res.status(403).json({ message: 'Admin account not found or inactive' });
        }

        const adminUser = adminUsers[0];

        // Add admin user info to request
        req.user = {
            id: adminUser.user_id,
            email: adminUser.email,
            full_name: adminUser.full_name,
            admin_level: adminUser.admin_level,
            permissions: (() => {
                try {
                    if (adminUser.permissions && typeof adminUser.permissions === 'string') {
                        return JSON.parse(adminUser.permissions);
                    } else if (adminUser.permissions && typeof adminUser.permissions === 'object') {
                        return adminUser.permissions;
                    }
                    return null;
                } catch (e) {
                    console.log('ADMIN AUTH: Failed to parse permissions:', e.message);
                    return null;
                }
            })()
        };
        
        console.log('ADMIN AUTH SUCCESS: Admin user authorized:', req.user);
        next();
    } catch (error) {
        console.error('ADMIN AUTH ERROR:', error.message);
        // Check if response has already been sent
        if (res.headersSent) {
            console.error('Headers already sent, cannot send admin auth error response:', error.message);
            return;
        }
        res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }
};

// authenticateToken for user routes, adminAuth for admin routes
export const authenticateToken = auth;
export const requireAdmin = adminAuth;

// Permission checking middleware
export const checkPermission = (resource, action) => {
    return (req, res, next) => {
        // For development, bypass permission checks if using bypassAuth
        if (req.user && req.user.admin_level === 'super_admin') {
            return next();
        }

        if (!req.user || !req.user.permissions) {
            if (res.headersSent) {
                console.error('Headers already sent, cannot send permission error response');
                return;
            }
            return res.status(403).json({ 
                success: false, 
                error: 'Insufficient permissions' 
            });
        }

        const userPermissions = req.user.permissions;
        
        // Check if user has permission for the resource and action
        if (userPermissions[resource] && userPermissions[resource].includes(action)) {
            return next();
        }

        // Check if user has wildcard permissions
        if (userPermissions[resource] && userPermissions[resource].includes('*')) {
            return next();
        }

        if (res.headersSent) {
            console.error('Headers already sent, cannot send permission error response');
            return;
        }
        return res.status(403).json({ 
            success: false, 
            error: `Insufficient permissions: ${resource}:${action}` 
        });
    };
}; 