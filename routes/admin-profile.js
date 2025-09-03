import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/profile_pictures';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// Helper to get user data from DB
async function getUserData(userId) {
    const [rows] = await pool.query('SELECT id, full_name, email, profile_picture FROM users WHERE id = ?', [userId]);
    return rows[0];
}

// GET /api/admin/account - Fetch admin profile data
router.get('/account', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await getUserData(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Admin user not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching admin account data:', error);
        res.status(500).json({ message: 'Failed to fetch admin account data' });
    }
});

// POST /api/admin/account - Update admin profile data
router.post('/account', authenticateToken, requireAdmin, async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        return res.status(400).json({ message: 'Full name and email are required' });
    }

    try {
        await pool.query('UPDATE users SET full_name = ?, email = ? WHERE id = ?', [fullName, email, req.user.id]);
        const updatedUser = await getUserData(req.user.id);
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating admin account data:', error);
        res.status(500).json({ message: 'Failed to update admin account data' });
    }
});

// POST /api/admin/account/profile-picture - Upload profile picture
router.post('/account/profile-picture', authenticateToken, requireAdmin, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const profilePicturePath = req.file.path;
        // Delete old profile picture if exists
        const oldUserData = await getUserData(req.user.id);
        if (oldUserData && oldUserData.profile_picture) {
            const oldPath = path.join(process.cwd(), oldUserData.profile_picture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        await pool.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePicturePath, req.user.id]);
        const updatedUser = await getUserData(req.user.id);
        res.json({ message: 'Profile picture updated successfully', profile_picture: updatedUser.profile_picture });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Failed to upload profile picture' });
    }
});

// POST /api/admin/change-password - Change admin password (NEW SIMPLE VERSION)
router.post('/change-password', async (req, res) => {
    console.log('=== NEW PASSWORD CHANGE ENDPOINT CALLED ===');
    console.log('Request Body:', req.body);
    console.log('Request Headers:', req.headers);
    
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid authorization header');
            return res.status(401).json({ message: 'No valid authorization token provided' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        console.log('Token extracted:', token ? 'Present' : 'Missing');
        
        // Simple token validation (you can enhance this later)
        if (!token || token.length < 10) {
            console.log('Invalid token format');
            return res.status(401).json({ message: 'Invalid token format' });
        }
        
        // Get password data from request body
        const { currentPassword, newPassword } = req.body;
        console.log('Passwords received:', { 
            currentPassword: currentPassword ? 'Present' : 'Missing',
            newPassword: newPassword ? 'Present' : 'Missing'
        });
        
        // Validate passwords
        if (!currentPassword || typeof currentPassword !== 'string' || currentPassword.trim() === '') {
            console.log('Current password validation failed');
            return res.status(400).json({ message: 'Current password is required and cannot be empty' });
        }
        
        if (!newPassword || typeof newPassword !== 'string' || newPassword.trim() === '') {
            console.log('New password validation failed');
            return res.status(400).json({ message: 'New password is required and cannot be empty' });
        }
        
        if (newPassword.length < 8) {
            console.log('New password too short');
            return res.status(400).json({ message: 'New password must be at least 8 characters long' });
        }
        
        if (currentPassword === newPassword) {
            console.log('Same password provided');
            return res.status(400).json({ message: 'New password cannot be the same as current password' });
        }
        
        // For now, just return success (we'll add actual password update later)
        console.log('All validation passed - returning success');
        res.json({ 
            message: 'Password change request validated successfully!',
            note: 'This is a test endpoint - actual password update will be implemented next'
        });
        
    } catch (error) {
        console.error('Error in new password change endpoint:', error.message);
        res.status(500).json({ message: 'Internal server error during password change' });
    }
});

// SUPER BASIC TEST ENDPOINT
router.get('/test-basic', (req, res) => {
    console.log('=== BASIC TEST ENDPOINT CALLED ===');
    console.log('Request received at:', new Date().toISOString());
    res.json({ message: 'Basic test endpoint working!' });
});

export default router;
