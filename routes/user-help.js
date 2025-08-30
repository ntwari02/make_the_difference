import express from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Submit a new help request
router.post('/submit', auth, async (req, res) => {
    try {
        const { email, painPoint, subject, message } = req.body;
        const userId = req.user.id;

        if (!email || !painPoint || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, issue type, subject, and message are required' 
            });
        }

        // Insert the help request
        const [result] = await db.query(
            'INSERT INTO help_requests (user_id, email, pain_point, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [userId, email, painPoint, subject, message, 'pending']
        );

        return res.json({
            success: true,
            message: 'Help request submitted successfully',
            requestId: result.insertId
        });

    } catch (error) {
        console.error('submit help request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all help requests for a specific user
router.get('/user-requests/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Ensure the authenticated user is requesting their own data
        if (req.user.id != userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        const [rows] = await db.query(`
            SELECT 
                hr.id,
                hr.email,
                hr.pain_point,
                hr.subject,
                hr.message,
                hr.status,
                hr.created_at,
                hr.updated_at
            FROM help_requests hr
            WHERE hr.user_id = ?
            ORDER BY hr.created_at DESC
        `, [userId]);

        return res.json({
            success: true,
            items: rows || []
        });

    } catch (error) {
        console.error('get user help requests error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get details for a specific help request
router.get('/request/:requestId', auth, async (req, res) => {
    try {
        const { requestId } = req.params;
        
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
                u.full_name as user_name
            FROM help_requests hr
            JOIN users u ON hr.user_id = u.id
            WHERE hr.id = ? AND hr.user_id = ?
        `, [requestId, req.user.id]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Help request not found' 
            });
        }

        return res.json({
            success: true,
            request: rows[0]
        });

    } catch (error) {
        console.error('get help request details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update a help request (only for pending requests)
router.put('/request/:requestId', auth, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { email, subject, message } = req.body;
        
        if (!email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, subject, and message are required' 
            });
        }

        // Check if the request exists and belongs to the user
        const [existing] = await db.query(
            'SELECT id, status FROM help_requests WHERE id = ? AND user_id = ?',
            [requestId, req.user.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Help request not found' 
            });
        }

        if (existing[0].status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only pending requests can be updated' 
            });
        }

        // Update the request
        await db.query(
            'UPDATE help_requests SET email = ?, subject = ?, message = ?, updated_at = NOW() WHERE id = ?',
            [email, subject, message, requestId]
        );

        return res.json({
            success: true,
            message: 'Help request updated successfully'
        });

    } catch (error) {
        console.error('update help request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Cancel a help request (only for pending requests)
router.delete('/request/:requestId', auth, async (req, res) => {
    try {
        const { requestId } = req.params;
        
        // Check if the request exists and belongs to the user
        const [existing] = await db.query(
            'SELECT id, status FROM help_requests WHERE id = ? AND user_id = ?',
            [requestId, req.user.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Help request not found' 
            });
        }

        if (existing[0].status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only pending requests can be cancelled' 
            });
        }

        // Delete the request
        await db.query(
            'DELETE FROM help_requests WHERE id = ?',
            [requestId]
        );

        return res.json({
            success: true,
            message: 'Help request cancelled successfully'
        });

    } catch (error) {
        console.error('cancel help request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
