import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Simple password change endpoint - no complex middleware
router.post('/change-password', async (req, res) => {
    console.log('=== PASSWORD CHANGE ENDPOINT CALLED ===');
    console.log('Request received at:', new Date().toISOString());
    console.log('Request body:', req.body);
    console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    
    try {
        // Get the authorization token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid authorization header found');
            return res.status(401).json({ 
                success: false, 
                message: 'Authorization token required' 
            });
        }
        
        const token = authHeader.replace('Bearer ', '');
        console.log('Token extracted successfully');
        
        // Basic token validation (you can enhance this later)
        if (!token || token.length < 10) {
            console.log('Token format invalid');
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token format' 
            });
        }
        
        // Get password data
        const { currentPassword, newPassword } = req.body;
        console.log('Password fields received:', {
            currentPassword: currentPassword ? 'Present' : 'Missing',
            newPassword: newPassword ? 'Present' : 'Missing'
        });
        
        // Validate current password
        if (!currentPassword || typeof currentPassword !== 'string' || currentPassword.trim() === '') {
            console.log('Current password validation failed');
            return res.status(400).json({ 
                success: false, 
                message: 'Current password is required' 
            });
        }
        
        // Validate new password
        if (!newPassword || typeof newPassword !== 'string' || newPassword.trim() === '') {
            console.log('New password validation failed');
            return res.status(400).json({ 
                success: false, 
                message: 'New password is required' 
            });
        }
        
        if (newPassword.length < 8) {
            console.log('New password too short');
            return res.status(400).json({ 
                success: false, 
                message: 'New password must be at least 8 characters long' 
            });
        }
        
        if (currentPassword === newPassword) {
            console.log('Same password provided');
            return res.status(400).json({ 
                success: false, 
                message: 'New password cannot be the same as current password' 
            });
        }
        
        // Now verify the current password and update the database
        console.log('Starting database password verification and update...');
        
        // Decode the JWT token to get user information
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            console.log('Token decoded successfully:', { userId: decoded.id, email: decoded.email });
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError.message);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid or expired token' 
            });
        }
        
        try {
            // Get user from database using the decoded user ID
            const [users] = await pool.query('SELECT id, password FROM users WHERE id = ?', [decoded.id]);
            
            if (users.length === 0) {
                console.log('User not found in database');
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }
            
            const user = users[0];
            console.log('User found:', { id: user.id, hasPassword: !!user.password });
            
            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                console.log('Current password verification failed');
                return res.status(401).json({ 
                    success: false, 
                    message: 'Current password is incorrect' 
                });
            }
            
            console.log('Current password verified successfully');
            
            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            console.log('New password hashed successfully');
            
            // Update the password in the database
            await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, user.id]);
            console.log('Password updated in database successfully');
            
            res.json({ 
                success: true,
                message: 'Password updated successfully! You can now login with your new password.',
                timestamp: new Date().toISOString()
            });
            
        } catch (dbError) {
            console.error('Database error during password update:', dbError.message);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to update password in database' 
            });
        }
        
    } catch (error) {
        console.error('Error in password change endpoint:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during password change' 
        });
    }
});

// Test endpoint to verify routing is working
router.get('/test', (req, res) => {
    console.log('=== TEST ENDPOINT CALLED ===');
    res.json({ 
        success: true, 
        message: 'Password change routes are working!',
        timestamp: new Date().toISOString()
    });
});

export default router;
