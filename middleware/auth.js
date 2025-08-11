import jwt from 'jsonwebtoken';
import db from '../config/database.js';

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
        const [users] = await db.query('SELECT id, email, full_name, role FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Add user from payload
        req.user = users[0];
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // First check if admin_users table exists
        const [adminTables] = await db.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'admin_users'
        `);

        let isAdmin = false;
        let adminUser = null;

        if (adminTables.length > 0) {
            // Admin table exists, check if user exists in admin_users table
            const [adminUsers] = await db.query(`
                SELECT au.*, u.email, u.full_name 
                FROM admin_users au 
                JOIN users u ON au.user_id = u.id 
                WHERE au.user_id = ? AND au.is_active = TRUE
            `, [decoded.id]);
            
            if (adminUsers.length > 0) {
                isAdmin = true;
                adminUser = adminUsers[0];
            }
        } else {
            // Admin table doesn't exist, fall back to role check for backward compatibility
            const [users] = await db.query('SELECT id, email, full_name, role FROM users WHERE id = ?', [decoded.id]);
            
            if (users.length > 0 && users[0].role === 'admin') {
                isAdmin = true;
                adminUser = {
                    user_id: users[0].id,
                    email: users[0].email,
                    full_name: users[0].full_name,
                    admin_level: 'admin',
                    permissions: '{}'
                };
                console.log('Admin table not found, using role-based admin check');
            }
        }
        
        if (!isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        // Add admin user info to request
        req.user = {
            id: adminUser.user_id,
            email: adminUser.email,
            full_name: adminUser.full_name,
            admin_level: adminUser.admin_level,
            permissions: adminUser.permissions ? JSON.parse(adminUser.permissions) : null
        };
        
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }
}; 