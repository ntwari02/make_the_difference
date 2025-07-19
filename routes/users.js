import express from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';
import bcrypt from 'bcrypt';
const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const [user] = await db.promise().query(
            'SELECT id, fullName, email, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (!user.length) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    const { fullName, email } = req.body;
    
    try {
        // Check if email is already taken by another user
        const [existingUser] = await db.promise().query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, req.user.id]
        );
        
        if (existingUser.length) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        
        // Update user profile
        await db.promise().query(
            'UPDATE users SET fullName = ?, email = ? WHERE id = ?',
            [fullName, email, req.user.id]
        );
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    try {
        // Verify current password
        const [user] = await db.promise().query(
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
        await db.promise().query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

export default router; 