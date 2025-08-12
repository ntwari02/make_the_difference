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
        const [users] = await db.query('SELECT id, email, full_name FROM users WHERE id = ?', [decoded.id]);

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
        
        // Get user from database to verify role
        const [users] = await db.query('SELECT id, email, full_name, role FROM users WHERE id = ?', [decoded.id]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        if (users[0].role !== 'admin') {
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