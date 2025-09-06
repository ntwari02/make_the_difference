import express from 'express';
import db from '../config/database.js';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
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
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;

    // First check if the additional columns exist
    let selectFields = 'id, full_name, email, created_at';
    
    try {
      // Try to select the additional columns
      await db.query('SELECT phone, bio, profile_picture FROM users LIMIT 1');
      selectFields += ', phone, bio, profile_picture';
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️ Profile columns (phone, bio, profile_picture) not found, using basic fields only');
      } else {
        throw error;
      }
    }

    const [users] = await db.query(
      `SELECT ${selectFields} FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
        profile_picture: user.profile_picture || '',
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', [
  body('full_name').trim().isLength({ min: 1 }).withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('bio').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;

    const { full_name, email, phone, bio } = req.body;

    // Check if email is already taken by another user
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email is already taken by another user'
      });
    }

    // Check if additional columns exist before updating
    let updateFields = 'full_name = ?, email = ?';
    let updateValues = [full_name, email];
    
    try {
      // Try to update the additional columns
      await db.query('SELECT phone, bio FROM users LIMIT 1');
      updateFields += ', phone = ?, bio = ?';
      updateValues.push(phone || null, bio || null);
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️ Profile columns (phone, bio) not found, updating basic fields only');
      } else {
        throw error;
      }
    }

    updateValues.push(userId);

    // Update user profile
    await db.query(
      `UPDATE users SET ${updateFields} WHERE id = ?`,
      updateValues
    );

    // Get updated user data using the same field selection logic
    let selectFields = 'id, full_name, email, created_at';
    
    try {
      await db.query('SELECT phone, bio, profile_picture FROM users LIMIT 1');
      selectFields += ', phone, bio, profile_picture';
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️ Profile columns not found, using basic fields only');
      } else {
        throw error;
      }
    }

    const [users] = await db.query(
      `SELECT ${selectFields} FROM users WHERE id = ?`,
      [userId]
    );

    const user = users[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
        profile_picture: user.profile_picture || '',
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Change password
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;

    const { currentPassword, newPassword } = req.body;

    // Get current user password
    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// Upload profile picture
router.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    console.log('=== PHOTO UPLOAD START ===');
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;
    console.log('Token decoded successfully, userId:', userId);

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const profilePicturePath = `/uploads/profiles/${req.file.filename}`;
    console.log('Profile picture path:', profilePicturePath);

    // Check if profile_picture column exists before updating
    try {
      await db.query('SELECT profile_picture FROM users LIMIT 1');
      console.log('Profile picture column exists, updating database...');
      
      // Column exists, update it
      const updateResult = await db.query(
        'UPDATE users SET profile_picture = ? WHERE id = ?',
        [profilePicturePath, userId]
      );
      console.log('Database update result:', updateResult);
      
      // Verify the update was successful
      const [verifyRows] = await db.query(
        'SELECT profile_picture FROM users WHERE id = ?',
        [userId]
      );
      console.log('Verification query result:', verifyRows[0]);
      
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️ Profile picture column not found, skipping update');
        return res.status(400).json({
          success: false,
          error: 'Profile picture functionality not available - database column missing'
        });
      } else {
        console.error('Database error during photo update:', error);
        throw error;
      }
    }

    console.log('Photo upload completed successfully');
    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profile_picture: profilePicturePath
    });

  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile picture'
    });
  }
});

// Remove profile picture
router.delete('/remove-photo', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;

    let currentPicture = null;

    // Check if profile_picture column exists
    try {
      await db.query('SELECT profile_picture FROM users LIMIT 1');
      
      // Get current profile picture
      const [users] = await db.query(
        'SELECT profile_picture FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      currentPicture = users[0].profile_picture;

      // Remove profile picture from database
      await db.query(
        'UPDATE users SET profile_picture = NULL WHERE id = ?',
        [userId]
      );
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️ Profile picture column not found, skipping removal');
        return res.status(400).json({
          success: false,
          error: 'Profile picture functionality not available - database column missing'
        });
      } else {
        throw error;
      }
    }

    // Delete file if it exists
    if (currentPicture && currentPicture.startsWith('/uploads/profiles/')) {
      const filePath = `public${currentPicture}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      success: true,
      message: 'Profile picture removed successfully'
    });

  } catch (error) {
    console.error('Remove photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove profile picture'
    });
  }
});

export default router;
