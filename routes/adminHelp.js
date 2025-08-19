import express from 'express';
import db from '../config/database.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET all help requests
router.get('/requests', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.full_name, u.email, u.help_token, u.help_token_expiry, u.help_requested_at
            FROM users u
            WHERE u.help_token IS NOT NULL 
            AND u.help_token_expiry > NOW()
            AND u.help_requested_at IS NOT NULL
            ORDER BY u.help_requested_at DESC
        `);

        const items = rows.map(r => ({
            id: r.id,
            user_id: r.id,
            user_name: r.full_name,
            user_email: r.email,
            category: 'Password',
            subject: 'Needs password reset assistance',
            type: 'reset_password',
            status: 'open',
            priority: 'normal',
            created_at: r.help_requested_at
        }));

        res.json({ success: true, items });
    } catch (error) {
        console.error('Error fetching help requests:', error);
        res.status(500).json({ success: false, message: 'Error fetching help requests' });
    }
});

// POST admin reset password for user
router.post('/reset-password', async (req, res) => {
    try {
        const { user_id, new_password, admin_notes } = req.body;
        
        if (!user_id || !new_password) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID and new password are required' 
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        // Update user password and clear help tokens
        await db.query(`
            UPDATE users 
            SET password = ?, 
                help_token = NULL, 
                help_token_expiry = NULL, 
                help_requested_at = NULL,
                password_reset_by_admin = NOW(),
                admin_notes = ?
            WHERE id = ?
        `, [hashedPassword, admin_notes || null, user_id]);

        res.json({ 
            success: true, 
            message: 'Password has been reset by admin successfully' 
        });

    } catch (error) {
        console.error('Error resetting password by admin:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error resetting password' 
        });
    }
});

// POST dismiss help request (mark as resolved without reset)
router.post('/dismiss-request', async (req, res) => {
    try {
        const { user_id, admin_notes } = req.body;
        
        if (!user_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID is required' 
            });
        }

        // Clear help tokens and mark as dismissed
        await db.query(`
            UPDATE users 
            SET help_token = NULL, 
                help_token_expiry = NULL, 
                help_requested_at = NULL,
                admin_notes = ?
            WHERE id = ?
        `, [admin_notes || null, user_id]);

        res.json({ 
            success: true, 
            message: 'Help request has been dismissed' 
        });

    } catch (error) {
        console.error('Error dismissing help request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error dismissing help request' 
        });
    }
});

// GET help request statistics
router.get('/stats', async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN help_token_expiry > NOW() THEN 1 END) as active_requests,
                COUNT(CASE WHEN help_token_expiry <= NOW() THEN 1 END) as expired_requests
            FROM users 
            WHERE help_token IS NOT NULL
        `);
        
        res.json({ 
            success: true, 
            stats: stats[0] 
        });
    } catch (error) {
        console.error('Error fetching help request stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching statistics' 
        });
    }
});

// POST: send a secure password reset form/link to user email
router.post('/send-reset-form', async (req, res) => {
    try {
        const { id, user_id, email } = req.body;
        if (!email) {
            // For privacy, do not reveal if email exists; still return success
            return res.json({ success: true, message: 'If this email exists, a reset link will be sent.' });
        }

        // Generate a one-time token and expiry (30 minutes)
        const token = crypto.randomBytes(32).toString('hex');
        // Find user by email if user_id not provided
        let userId = user_id;
        if (!userId) {
            const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (!users || users.length === 0) {
                // Do not leak existence; return success
                return res.json({ success: true, message: 'If this email exists, a reset link will be sent.' });
            }
            userId = users[0].id;
        }

        await db.query(
            `UPDATE users SET help_token = ?, help_token_expiry = DATE_ADD(NOW(), INTERVAL 30 MINUTE), help_requested_at = NOW() WHERE id = ?`,
            [token, userId]
        );

        // TODO: integrate email service to send reset link. For now, return the link for dev.
        const resetLink = `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password.html?token=${token}&email=${encodeURIComponent(email)}`;

        return res.json({ success: true, message: 'Reset form link generated', resetLink });
    } catch (error) {
        console.error('Error sending reset form:', error);
        return res.status(500).json({ success: false, message: 'Failed to send reset form' });
    }
});

// POST: resolve a help request; for password cases, clear password to force reset
router.post('/resolve', async (req, res) => {
    try {
        const { id, user_id, type } = req.body;
        if (!user_id) {
            return res.status(400).json({ success: false, message: 'user_id is required' });
        }

        // If password pain point, clear the password (set to empty string)
        if (type === 'reset_password') {
            await db.query(
                `UPDATE users SET password = '', help_token = NULL, help_token_expiry = NULL, help_requested_at = NULL WHERE id = ?`,
                [user_id]
            );
        } else {
            // Otherwise just clear help flags
            await db.query(
                `UPDATE users SET help_token = NULL, help_token_expiry = NULL, help_requested_at = NULL WHERE id = ?`,
                [user_id]
            );
        }

        return res.json({ success: true });
    } catch (error) {
        console.error('Error resolving help request:', error);
        return res.status(500).json({ success: false, message: 'Failed to resolve' });
    }
});

// POST: accept a user's help request so they can skip security questions
router.post('/accept', async (req, res) => {
    try {
        const { user_id, email, duration_minutes } = req.body;
        if (!user_id && !email) {
            return res.status(400).json({ success: false, message: 'user_id or email is required' });
        }

        // Find user id if only email provided
        let uid = user_id;
        if (!uid) {
            const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (!rows || rows.length === 0) {
                return res.json({ success: true, message: 'Accepted (if account exists).' });
            }
            uid = rows[0].id;
        }

        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const minutes = Math.max(5, Math.min(60, parseInt(duration_minutes || '30', 10)));

        await db.query(
            `UPDATE users SET help_token = ?, help_token_expiry = DATE_ADD(NOW(), INTERVAL ? MINUTE), help_requested_at = NOW() WHERE id = ?`,
            [token, minutes, uid]
        );

        return res.json({ success: true, message: 'Help request accepted', reset_token: token, expires_in_minutes: minutes });
    } catch (error) {
        console.error('Error accepting help request:', error);
        return res.status(500).json({ success: false, message: 'Failed to accept help request' });
    }
});

// GET: verify help reset token for a user
router.get('/verify-token', async (req, res) => {
    try {
        const { token, email } = req.query;
        if (!token || !email) {
            return res.json({ success: false, message: 'Missing token or email' });
        }
        const [rows] = await db.query(
            `SELECT id FROM users WHERE email = ? AND help_token = ? AND help_token_expiry > NOW()`,
            [email, token]
        );
        if (!rows || rows.length === 0) {
            return res.json({ success: false, message: 'Invalid or expired token' });
        }
        return res.json({ success: true });
    } catch (error) {
        console.error('Error verifying help token:', error);
        return res.status(500).json({ success: false, message: 'Failed to verify token' });
    }
});

// POST: complete password reset using help token
router.post('/complete-reset', async (req, res) => {
    try {
        const { token, email, new_password } = req.body;
        if (!token || !email || !new_password) {
            return res.json({ success: false, message: 'Token, email and new password are required' });
        }
        const [rows] = await db.query(
            `SELECT id FROM users WHERE email = ? AND help_token = ? AND help_token_expiry > NOW()`,
            [email, token]
        );
        if (!rows || rows.length === 0) {
            return res.json({ success: false, message: 'Invalid or expired token' });
        }
        const userId = rows[0].id;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);
        await db.query(
            `UPDATE users SET password = ?, help_token = NULL, help_token_expiry = NULL, help_requested_at = NULL, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`,
            [hashedPassword, userId]
        );
        return res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error completing help reset:', error);
        return res.status(500).json({ success: false, message: 'Failed to update password' });
    }
});

// GET: automatically provide a reset token if admin help is active for the email
router.get('/auto-reset-token', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.json({ success: false, message: 'Email is required' });
        }
        const [rows] = await db.query(
            `SELECT help_token FROM users WHERE email = ? AND help_token IS NOT NULL AND help_token_expiry > NOW()`,
            [email]
        );
        if (!rows || rows.length === 0) {
            return res.json({ success: false, message: 'No active admin help for this email' });
        }
        return res.json({ success: true, reset_token: rows[0].help_token });
    } catch (error) {
        console.error('Error getting auto reset token:', error);
        return res.status(500).json({ success: false, message: 'Failed to get auto reset token' });
    }
});

export default router; 
