import express from 'express';
import db from '../config/database.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET all help requests
router.get('/requests', async (req, res) => {
    try {
        const [requests] = await db.query(`
            SELECT u.id, u.full_name, u.email, u.help_token, u.help_token_expiry, u.help_requested_at
            FROM users u
            WHERE u.help_token IS NOT NULL 
            AND u.help_token_expiry > NOW()
            AND u.help_requested_at IS NOT NULL
            ORDER BY u.help_requested_at DESC
        `);
        
        res.json({ 
            success: true, 
            requests: requests 
        });
    } catch (error) {
        console.error('Error fetching help requests:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching help requests' 
        });
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

export default router; 