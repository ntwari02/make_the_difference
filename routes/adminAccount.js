import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { bypassAuth } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
import fs from 'fs';
const uploadsDir = path.join(__dirname, '../uploads/profile_pictures');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// GET admin account settings
router.get('/account', bypassAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // First try to get from admin_account_settings table
        let [adminSettings] = await db.query(
            'SELECT * FROM admin_account_settings WHERE user_id = ?',
            [userId]
        );
        
        if (adminSettings.length > 0) {
            const settings = adminSettings[0];
            return res.json({
                full_name: settings.full_name,
                email: settings.email,
                phone: settings.phone_number,
                position: settings.position,
                bio: settings.bio,
                timezone: settings.timezone,
                language: settings.language,
                theme_preference: settings.theme_preference,
                profile_picture: settings.profile_picture_path,
                notifications: {
                    email: settings.email_notifications === 1,
                    sms: settings.sms_notifications === 1,
                    push: settings.push_notifications === 1
                }
            });
        }
        
        // Fallback to users table (basic fields only)
        try {
            const [users] = await db.query(
                'SELECT email FROM users WHERE id = ?',
                [userId]
            );
            
            if (users.length > 0) {
                const user = users[0];
                return res.json({
                    full_name: '',
                    email: user.email,
                    phone: '',
                    position: '',
                    bio: '',
                    timezone: 'UTC',
                    language: 'en',
                    theme_preference: 'auto',
                    profile_picture: null,
                    notifications: {}
                });
            }
        } catch (error) {
            console.log('Could not query users table for extended fields:', error.message);
        }
        
        res.status(404).json({ error: 'Account settings not found' });
    } catch (error) {
        console.error('Error fetching admin account settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST/UPDATE admin account settings
router.post('/account', bypassAuth, upload.single('profilePicture'), async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            fullName,
            email,
            phone,
            position,
            bio,
            timezone,
            language,
            theme,
            notifications
        } = req.body;
        
        // Validate required fields
        if (!fullName || !email) {
            return res.status(400).json({ error: 'Full name and email are required' });
        }
        
        // Check if email is already taken by another user
        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, userId]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email is already taken by another user' });
        }
        
        let profilePicturePath = null;
        
        // Handle profile picture upload
        if (req.file) {
            profilePicturePath = `/uploads/profile_pictures/${req.file.filename}`;
        }
        
        // Parse notifications JSON
        let notificationsObj = {};
        if (notifications) {
            try {
                notificationsObj = JSON.parse(notifications);
            } catch (e) {
                notificationsObj = {};
            }
        }
        
        // Check if admin settings exist
        const [existingSettings] = await db.query(
            'SELECT id FROM admin_account_settings WHERE user_id = ?',
            [userId]
        );
        
        // Parse notifications JSON
        let emailNotifications = false;
        let smsNotifications = false;
        let pushNotifications = false;
        
        if (notifications) {
            try {
                const notificationsObj = JSON.parse(notifications);
                emailNotifications = notificationsObj.email || false;
                smsNotifications = notificationsObj.sms || false;
                pushNotifications = notificationsObj.push || false;
            } catch (e) {
                console.log('Error parsing notifications JSON:', e.message);
            }
        }
        
        if (existingSettings.length > 0) {
            // Update existing admin settings
            const updateFields = [];
            const updateValues = [];
            
            updateFields.push('full_name = ?', 'email = ?', 'phone_number = ?', 'position = ?', 
                            'bio = ?', 'timezone = ?', 'language = ?', 'theme_preference = ?', 
                            'email_notifications = ?', 'sms_notifications = ?', 'push_notifications = ?');
            updateValues.push(fullName, email, phone || null, position || null, bio || null,
                            timezone || 'UTC', language || 'en', theme || 'auto',
                            emailNotifications ? 1 : 0, smsNotifications ? 1 : 0, pushNotifications ? 1 : 0);
            
            if (profilePicturePath) {
                updateFields.push('profile_picture_path = ?');
                updateValues.push(profilePicturePath);
            }
            
            updateValues.push(userId);
            
            await db.query(
                `UPDATE admin_account_settings SET ${updateFields.join(', ')} WHERE user_id = ?`,
                updateValues
            );
        } else {
            // Create new admin settings
            await db.query(
                `INSERT INTO admin_account_settings 
                (user_id, full_name, email, phone_number, position, bio, timezone, language, theme_preference, profile_picture_path, email_notifications, sms_notifications, push_notifications) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, fullName, email, phone || null, position || null, bio || null,
                 timezone || 'UTC', language || 'en', theme || 'auto', profilePicturePath,
                 emailNotifications ? 1 : 0, smsNotifications ? 1 : 0, pushNotifications ? 1 : 0]
            );
        }
        
        // Also update the users table for consistency (only basic fields)
        try {
            await db.query(
                'UPDATE users SET email = ? WHERE id = ?',
                [email, userId]
            );
        } catch (error) {
            console.log('Could not update users table (may not have extended columns):', error.message);
        }
        
        // Return updated data
        res.json({
            full_name: fullName,
            email: email,
            phone: phone,
            position: position,
            bio: bio,
            timezone: timezone || 'UTC',
            language: language || 'en',
            theme_preference: theme || 'auto',
            profile_picture: profilePicturePath,
            notifications: {
                email: emailNotifications,
                sms: smsNotifications,
                push: pushNotifications
            }
        });
        
    } catch (error) {
        console.error('Error updating admin account settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST change password
router.post('/change-password', bypassAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long' });
        }
        
        // Get current user password
        const [users] = await db.query(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        // Get user's IP address
        const userIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
        
        // Start transaction
        await db.query('START TRANSACTION');
        
        try {
            // Update password in users table
            await db.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, userId]
            );
            
            // Add to password history
            await db.query(
                'INSERT INTO admin_password_history (user_id, password_hash, changed_by_ip) VALUES (?, ?, ?)',
                [userId, hashedPassword, userIP]
            );
            
            // Update login security table
            await db.query(
                `INSERT INTO admin_login_security (user_id, last_password_change, failed_login_attempts) 
                 VALUES (?, NOW(), 0) 
                 ON DUPLICATE KEY UPDATE last_password_change = NOW(), failed_login_attempts = 0`,
                [userId]
            );
            
            await db.query('COMMIT');
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
        
        res.json({ message: 'Password changed successfully' });
        
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE profile picture
router.delete('/profile-picture', bypassAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get current profile picture path
        const [adminSettings] = await db.query(
            'SELECT profile_picture_path FROM admin_account_settings WHERE user_id = ?',
            [userId]
        );
        
        if (adminSettings.length > 0 && adminSettings[0].profile_picture_path) {
            // Delete file from filesystem
            const filePath = path.join(__dirname, '..', adminSettings[0].profile_picture_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        // Update database to remove profile picture
        await db.query(
            'UPDATE admin_account_settings SET profile_picture_path = NULL WHERE user_id = ?',
            [userId]
        );
        
        res.json({ message: 'Profile picture removed successfully' });
        
    } catch (error) {
        console.error('Error removing profile picture:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router; 
