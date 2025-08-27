import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from '../config/database.js';
import { auth, bypassAuth } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for profile picture uploads
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, '..', 'uploads', 'profile_pictures');
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const safe = (file.originalname || 'avatar.png').replace(/[^a-zA-Z0-9_.-]/g, '_');
        cb(null, `${uniqueSuffix}-${safe}`);
    }
});

const uploadProfile = multer({ storage: profileStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const [user] = await db.query(
            'SELECT id, full_name, email, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (!user.length) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get user's profile picture from user_profile_pictures table
        let profilePicture = null;
        try {
            const [profilePics] = await db.query(
                'SELECT profile_picture_path FROM user_profile_pictures WHERE user_id = ?',
                [user[0].id]
            );
            
            if (profilePics.length > 0 && profilePics[0].profile_picture_path) {
                profilePicture = profilePics[0].profile_picture_path;
            }
        } catch (error) {
            console.log('Could not fetch profile picture:', error.message);
        }
        
        const userData = {
            ...user[0],
            profile_picture: profilePicture,
            profile_picture_path: profilePicture
        };
        
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

// Upload profile picture for regular users
router.post('/profile-picture', auth, uploadProfile.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        
        const userId = req.user.id;
        const relPath = `uploads/profile_pictures/${req.file.filename}`.replace(/\\/g, '/');
        
        // Get user email
        const [user] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
        if (!user.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update or create user profile picture record
        const [existingPic] = await db.query(
            'SELECT id FROM user_profile_pictures WHERE user_id = ?',
            [userId]
        );
        
        if (existingPic.length > 0) {
            // Update existing profile picture
            await db.query(
                'UPDATE user_profile_pictures SET profile_picture_path = ?, updated_at = NOW() WHERE user_id = ?',
                [relPath, userId]
            );
        } else {
            // Create new profile picture record
            await db.query(
                `INSERT INTO user_profile_pictures (user_id, profile_picture_path) 
                 VALUES (?, ?)`,
                [userId, relPath]
            );
        }
        
        res.json({ 
            success: true, 
            profile_picture: relPath,
            profile_picture_path: relPath
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    const { fullName, email } = req.body;
    
    try {
        // Validate input
        if (!fullName || !email) {
            return res.status(400).json({ message: 'Full name and email are required' });
        }
        
        // Check if email is already taken by another user
        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, req.user.id]
        );
        
        if (existingUser.length) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        
        // Update user profile - use correct column name 'full_name'
        await db.query(
            'UPDATE users SET full_name = ?, email = ? WHERE id = ?',
            [fullName, email, req.user.id]
        );
        
        // Return updated user data
        const [updatedUser] = await db.query(
            'SELECT id, full_name, email, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        
        // Get user's profile picture
        let profilePicture = null;
        try {
            const [profilePics] = await db.query(
                'SELECT profile_picture_path FROM user_profile_pictures WHERE user_id = ?',
                [req.user.id]
            );
            
            if (profilePics.length > 0 && profilePics[0].profile_picture_path) {
                profilePicture = profilePics[0].profile_picture_path;
            }
        } catch (error) {
            console.log('Could not fetch profile picture:', error.message);
        }
        
        const userData = {
            ...updatedUser[0],
            profile_picture: profilePicture,
            profile_picture_path: profilePicture
        };
        
        res.json({ 
            message: 'Profile updated successfully',
            user: userData
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    try {
        // Verify current password
        const [user] = await db.query(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (!user.length) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const isMatch = await bcrypt.compare(currentPassword, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password
        await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

// Get all users for email sending (admin only)
router.get('/all', bypassAuth, async (req, res) => {
    try {
        const { search, status } = req.query;
        
        let query = 'SELECT id, full_name, email, status FROM users WHERE 1=1';
        const params = [];
        
        if (search) {
            query += ' AND (full_name LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        // role filter removed; admin tracked in admin_users
        
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY full_name';
        
        const [users] = await db.query(query, params);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get users by role (admin only)
// removed by-role endpoint; not applicable without role column

// Get active users count (admin only)
router.get('/count', bypassAuth, async (req, res) => {
    try {
        const [result] = await db.query(
            'SELECT COUNT(*) as total FROM users WHERE status = "active"'
        );
        res.json({ total: result[0].total });
    } catch (error) {
        console.error('Error fetching user count:', error);
        res.status(500).json({ message: 'Error fetching user count' });
    }
});

export default router; 
