import express from 'express';
import db from '../config/database.js';
import crypto from 'crypto';

const router = express.Router();

function generateToken() {
    return crypto.randomBytes(24).toString('hex');
}

// Return an existing active reset/help token if present; do not generate new tokens here
router.get('/auto-reset-token', async (req, res) => {
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
router.post('/send-reset-form', async (req, res) => {
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
router.get('/verify-token', async (req, res) => {
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
router.get('/stats', async (req, res) => {
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
                    pending_requests: 0,
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
                pending_requests: 0,
                active_requests: 0,
                resolved_requests: 0
            }
        });
    }
});

// Complete reset via admin-help (new password provided with token)
router.post('/complete-reset', async (req, res) => {
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

export default router;


