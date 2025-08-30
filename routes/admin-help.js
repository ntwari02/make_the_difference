import express from 'express';
import db from '../config/database.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Admin authentication middleware (same as admin-dashboard)
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('❌ No token provided in request headers');
            return res.status(401).json({ 
                success: false,
                message: 'No authentication token, access denied',
                code: 'NO_TOKEN'
            });
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (jwtError) {
            console.log('❌ JWT verification failed:', jwtError.message);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }
        
        // Get user with enhanced security checks
        const [users] = await db.query(`
            SELECT u.id, u.email, u.full_name, u.role, u.status, u.last_login
            FROM users u
            WHERE u.id = ? AND u.status = 'active'
        `, [decoded.id]);

        if (users.length === 0) {
            console.log('❌ User not found or inactive:', decoded.id);
            return res.status(401).json({ 
                success: false,
                message: 'User not found or inactive',
                code: 'USER_NOT_FOUND'
            });
        }

        const user = users[0];
        
        // Check if user is admin
        if (user.role !== 'admin') {
            console.log('❌ Non-admin user trying to access admin routes:', user.email);
            return res.status(403).json({ 
                success: false,
                message: 'Admin access required',
                code: 'ADMIN_ACCESS_REQUIRED'
            });
        }

        // Add user info to request
        req.user = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        };

        console.log('✅ Admin authentication successful for:', user.email);
        next();
    } catch (error) {
        console.error('❌ Admin auth error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error during authentication',
            code: 'AUTH_ERROR'
        });
    }
};

function generateToken() {
    return crypto.randomBytes(24).toString('hex');
}

// Get all help requests for admin
router.get('/requests', adminAuth, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                hr.id,
                hr.email,
                hr.pain_point,
                hr.subject,
                hr.message,
                hr.status,
                hr.created_at,
                hr.updated_at,
                u.id as user_id,
                u.full_name as user_name,
                u.email as user_email
            FROM help_requests hr
            LEFT JOIN users u ON hr.user_id = u.id
            ORDER BY 
                CASE hr.status 
                    WHEN 'pending' THEN 1 
                    WHEN 'active' THEN 2 
                    WHEN 'resolved' THEN 3 
                END,
                hr.created_at DESC
        `);

        return res.json({
            success: true,
            items: rows || []
        });

    } catch (error) {
        console.error('get help requests error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Accept help request (generate help token)
router.post('/accept', adminAuth, async (req, res) => {
    try {
        const { user_id, email, duration_minutes = 30 } = req.body;
        
        if (!user_id || !email) {
            return res.status(400).json({ success: false, message: 'User ID and email are required' });
        }

        const token = generateToken();
        const expiry = new Date(Date.now() + duration_minutes * 60 * 1000);

        await db.query(
            'UPDATE users SET help_token = ?, help_token_expiry = ? WHERE id = ?',
            [token, expiry, user_id]
        );

        // Update help request status
        await db.query(
            'UPDATE help_requests SET status = ?, updated_at = NOW() WHERE user_id = ? AND status != ?',
            ['resolved', user_id, 'resolved']
        );

        return res.json({ success: true, message: 'Help request accepted' });

    } catch (error) {
        console.error('accept help error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Resolve help request
router.post('/resolve', adminAuth, async (req, res) => {
    try {
        const { id, user_id, type } = req.body;
        
        if (!id) {
            return res.status(400).json({ success: false, message: 'Help request ID is required' });
        }

        await db.query(
            'UPDATE help_requests SET status = ?, updated_at = NOW() WHERE id = ?',
            ['resolved', id]
        );

        return res.json({ success: true, message: 'Help request resolved' });

    } catch (error) {
        console.error('resolve help error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Reset user password via admin
router.post('/reset-password', adminAuth, async (req, res) => {
    try {
        const { user_id, new_password, admin_notes } = req.body;
        
        if (!user_id || !new_password) {
            return res.status(400).json({ success: false, message: 'User ID and new password are required' });
        }

        const bcrypt = (await import('bcryptjs')).default;
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(String(new_password), salt);

        await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashed, user_id]
        );

        // Log the password reset
        await db.query(
            'INSERT INTO admin_actions (admin_id, action_type, target_user_id, details, created_at) VALUES (?, ?, ?, ?, NOW())',
            [req.user?.id || null, 'password_reset', user_id, admin_notes || 'Password reset by admin']
        );

        return res.json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error('reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Dismiss help request
router.post('/dismiss-request', adminAuth, async (req, res) => {
    try {
        const { user_id, admin_notes } = req.body;
        
        if (!user_id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Update help request status to resolved
        await db.query(
            'UPDATE help_requests SET status = ?, updated_at = NOW() WHERE user_id = ? AND status != ?',
            ['resolved', user_id, 'resolved']
        );

        // Log the dismissal
        await db.query(
            'INSERT INTO admin_actions (admin_id, action_type, target_user_id, details, created_at) VALUES (?, ?, ?, ?, NOW())',
            [req.user?.id || null, 'request_dismissed', user_id, admin_notes || 'Request dismissed by admin']
        );

        return res.json({ success: true, message: 'Request dismissed successfully' });

    } catch (error) {
        console.error('dismiss request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Return an existing active reset/help token if present; do not generate new tokens here
router.get('/auto-reset-token', adminAuth, async (req, res) => {
    try {
        const email = String(req.query.email || '').trim();
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const [rows] = await db.query(
            `SELECT reset_token, reset_token_expiry, help_token, help_token_expiry
             FROM users 
             WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))
             LIMIT 1`,
            [email]
        );
        if (!rows || rows.length === 0) return res.json({ success: false });
        const u = rows[0];
        const now = Date.now();
        const resetValid = u.reset_token && u.reset_token_expiry && new Date(u.reset_token_expiry).getTime() > now;
        const helpValid = u.help_token && u.help_token_expiry && new Date(u.help_token_expiry).getTime() > now;
        if (resetValid) return res.json({ success: true, reset_token: u.reset_token });
        if (helpValid) return res.json({ success: true, reset_token: u.help_token });
        return res.json({ success: false });
    } catch (error) {
        console.error('auto-reset-token error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Admin sends a reset form link to user (we just generate token and pretend email is sent)
router.post('/send-reset-form', adminAuth, async (req, res) => {
    try {
        const email = String((req.body && req.body.email) || '').trim();
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const [rows] = await db.query('SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) LIMIT 1', [email]);
        if (!rows || rows.length === 0) {
            // Do not reveal if user exists
            return res.json({ success: true, message: 'If the email exists, a reset link will be sent.' });
        }
        const userId = rows[0].id;
        const token = generateToken();
        await db.query('UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?', [token, userId]);

        // Normally, send email here. We return the link in response for development convenience
        const link = `/reset-password.html?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
        return res.json({ success: true, message: 'Reset link generated', link });
    } catch (error) {
        console.error('send-reset-form error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Verify token (used by reset-password.html)
router.get('/verify-token', adminAuth, async (req, res) => {
    try {
        const token = String(req.query.token || '').trim();
        const email = String(req.query.email || '').trim();
        if (!token || !email) return res.status(400).json({ success: false, message: 'Token and email are required' });

        const [rows] = await db.query('SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() AND LOWER(TRIM(email)) = LOWER(TRIM(?)) LIMIT 1', [token, email]);
        if (!rows || rows.length === 0) return res.json({ success: false, message: 'Invalid or expired token' });
        return res.json({ success: true });
    } catch (error) {
        console.error('verify-token error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get help system stats for admin dashboard
router.get('/stats', adminAuth, async (req, res) => {
    try {
        // Get count of active help requests (you can customize this based on your help system)
        const [helpStats] = await db.query(`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_requests,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_requests
            FROM help_requests
        `);

        // If help_requests table doesn't exist, return default stats
        if (helpStats.length === 0) {
            return res.json({
                success: true,
                stats: {
                    total_requests: 0,
                    open_requests: 0,
                    active_requests: 0,
                    resolved_requests: 0
                }
            });
        }

        return res.json({
            success: true,
            stats: helpStats[0]
        });

    } catch (error) {
        console.error('help stats error:', error);
        // Avoid double-send if a response was already sent
        if (res.headersSent) { return; }
        // Return default stats if there's an error
        return res.json({
            success: true,
            stats: {
                total_requests: 0,
                open_requests: 0,
                active_requests: 0,
                resolved_requests: 0
            }
        });
    }
});

// Complete reset via admin-help (new password provided with token)
router.post('/complete-reset', adminAuth, async (req, res) => {
    try {
        const { token, email, new_password } = req.body || {};
        if (!token || !email || !new_password) {
            return res.status(400).json({ success: false, message: 'Token, email and new password are required' });
        }

        // Re-use existing /auth/reset-password hashing path is separate; here hash locally to keep routes isolated
        const bcrypt = (await import('bcryptjs')).default;
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(String(new_password), salt);

        const [rows] = await db.query('SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() AND LOWER(TRIM(email)) = LOWER(TRIM(?)) LIMIT 1', [token, email]);
        if (!rows || rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        const userId = rows[0].id;

        await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [hashed, userId]);
        return res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('complete-reset error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Send feedback to user
router.post('/send-feedback', adminAuth, async (req, res) => {
    try {
        const { help_id, user_id, user_email, message } = req.body;

        // Validate required fields
        if (!help_id || !user_id || !user_email || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Here you would typically send an email to the user
        // For now, we'll just log the feedback and update the help request
        console.log(`Feedback sent to user ${user_email} for help request ${help_id}: ${message}`);

        // Update help request to mark feedback sent
        const updateHelpQuery = 'UPDATE help_requests SET status = ?, updated_at = NOW() WHERE id = ?';
        await db.query(updateHelpQuery, ['active', help_id]);

        // Log the action
        console.log(`Feedback sent for help request ${help_id} to user ${user_email}`);

        res.json({ success: true, message: 'Feedback sent successfully' });
    } catch (error) {
        console.error('Error sending feedback:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;


