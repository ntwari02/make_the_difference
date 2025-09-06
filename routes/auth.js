import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';
import { generateAndSendOTP, verifyOTP } from '../utils/otp.js';
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, security_questions } = req.body;

    // Check if user already exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate security questions
    if (!security_questions || !Array.isArray(security_questions) || security_questions.length !== 3) {
      return res.status(400).json({ message: 'Three security questions are required' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Insert new user
      const defaultRole = 'user';
      const [result] = await connection.query(
        'INSERT INTO users (full_name, email, password, role, security_questions_setup) VALUES (?, ?, ?, ?, ?)',
        [full_name, email, hashedPassword, defaultRole, true]
      );

      const userId = result.insertId;

      // Insert security question answers
      for (const question of security_questions) {
        await connection.query(
          'INSERT INTO user_security_answers (user_id, question_id, answer) VALUES (?, ?, ?)',
          [userId, question.question_id, question.answer]
        );
      }

      await connection.commit();

      // Create token
      const token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: userId,
          full_name,
          email,
          isAdmin: false
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive. Please contact admin.' });
    }

    // Check if user is an admin - if so, redirect them to admin login
    const [adminCheck] = await db.query(
      'SELECT id FROM admin_users WHERE user_id = ? AND is_active = TRUE',
      [user.id]
    );

    if (adminCheck.length > 0) {
      return res.status(403).json({ 
        message: 'This is an admin account. Please use the admin login instead.',
        code: 'ADMIN_ACCOUNT'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Get user's profile picture from user_profile_pictures table
    let profilePicture = null;
    try {
      const [profilePics] = await db.query(
        'SELECT profile_picture_path FROM user_profile_pictures WHERE user_id = ?',
        [user.id]
      );
      
      if (profilePics.length > 0 && profilePics[0].profile_picture_path) {
        profilePicture = profilePics[0].profile_picture_path;
      }
    } catch (error) {
      console.log('Could not fetch profile picture:', error.message);
    }

    // Get additional profile fields (phone, bio) if they exist
    let phone = null;
    let bio = null;
    try {
      const [profileData] = await db.query(
        'SELECT phone, bio FROM users WHERE id = ?',
        [user.id]
      );
      
      if (profileData.length > 0) {
        phone = profileData[0].phone;
        bio = profileData[0].bio;
      }
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️ Profile columns (phone, bio) not found, using basic fields only');
      } else {
        console.log('Could not fetch additional profile data:', error.message);
      }
    }

    // Create token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: phone || '',
        bio: bio || '',
        profile_picture: profilePicture,
        profile_picture_path: profilePicture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Forgot Password - Get security questions (for both regular users and admin users)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email is required' });
  
  try {
    // First check if it's an admin user
    const [admins] = await db.query(`
      SELECT au.id, au.email, au.user_id, u.security_questions_setup,
             COUNT(usa.id) as question_count
      FROM admin_users au
      LEFT JOIN users u ON au.user_id = u.id
      LEFT JOIN user_security_answers usa ON u.id = usa.user_id
      WHERE au.email = ? AND au.is_active = TRUE
      GROUP BY au.id
    `, [email]);
    
    if (admins.length > 0) {
      // It's an admin user
      const admin = admins[0];

      // Try to get admin's security questions if any are set up
      let questions = [];
      try {
        const [q] = await db.query(`
          SELECT sq.id, sq.question
          FROM security_questions sq
          INNER JOIN user_security_answers usa ON sq.id = usa.question_id
          WHERE usa.user_id = ?
          ORDER BY sq.question
        `, [admin.user_id]);
        questions = q || [];
      } catch {}

      // Always allow admins to proceed, even if questions are not set up
      // Frontend can branch on questions.length === 0 to use email/OTP fallback
      return res.json({ 
        success: true, 
        message: questions.length ? 'Security questions retrieved successfully' : 'No security questions set for this admin. Proceed with email verification.',
        questions,
        isAdmin: true
      });
    }
    
    // Check if it's a regular user
    const [users] = await db.query(`
      SELECT u.id, u.email, u.security_questions_setup,
             COUNT(usa.id) as question_count
      FROM users u
      LEFT JOIN user_security_answers usa ON u.id = usa.user_id
      WHERE u.email = ?
      GROUP BY u.id
    `, [email]);
    
    if (users.length === 0) {
      return res.json({ 
        success: false, 
        message: 'If this email exists, we have sent instructions to proceed.' 
      });
    }
    
    const user = users[0];
    
    if (!user.security_questions_setup || user.question_count < 2) {
      return res.json({ 
        success: false, 
        message: 'Security questions not set up for this account. Please contact administrator.' 
      });
    }
    
    // Get user's security questions
    const [questions] = await db.query(`
      SELECT sq.id, sq.question
      FROM security_questions sq
      INNER JOIN user_security_answers usa ON sq.id = usa.question_id
      WHERE usa.user_id = ?
      ORDER BY sq.question
    `, [user.id]);
    
    res.json({ 
      success: true, 
      message: 'Security questions retrieved successfully',
      questions: questions,
      isAdmin: false
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error retrieving security questions' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password are required' });
  try {
    // Find user with valid token
    const [users] = await db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()', [token]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    const user = users[0];
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    // Update password and clear token
    await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [hashedPassword, user.id]);
    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email in admin_users
    const [admins] = await db.query(
      'SELECT * FROM admin_users WHERE email = ? AND is_active = TRUE',
      [email]
    );
    if (admins.length === 0) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }
    const admin = admins[0];

    // Get linked user for password
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [admin.user_id]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Admin user not found' });
    }
    const user = users[0];
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive. Please contact super admin.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Update last login
    try {
      await db.query(
        'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [admin.id]
      );
    } catch (error) {
      console.error('Error updating admin last login:', error);
    }

    // Get user's profile picture from user_profile_pictures table
    let profilePicture = null;
    try {
      const [profilePics] = await db.query(
        'SELECT profile_picture_path FROM user_profile_pictures WHERE user_id = ?',
        [user.id]
      );
      
      if (profilePics.length > 0 && profilePics[0].profile_picture_path) {
        profilePicture = profilePics[0].profile_picture_path;
      }
    } catch (error) {
      console.log('Could not fetch profile picture:', error.message);
    }

    // Get additional profile fields (phone, bio) if they exist
    let phone = null;
    let bio = null;
    try {
      const [profileData] = await db.query(
        'SELECT phone, bio FROM users WHERE id = ?',
        [user.id]
      );
      
      if (profileData.length > 0) {
        phone = profileData[0].phone;
        bio = profileData[0].bio;
      }
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️ Profile columns (phone, bio) not found, using basic fields only');
      } else {
        console.log('Could not fetch additional profile data:', error.message);
      }
    }

    // Safely parse permissions
    let parsedPermissions = {};
    try {
      parsedPermissions = typeof admin.permissions === 'string' ? JSON.parse(admin.permissions || '{}') : (admin.permissions || {});
    } catch (e) {
      parsedPermissions = {};
    }

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user.id,
        full_name: admin.full_name,
        email: admin.email,
        phone: phone || '',
        bio: bio || '',
        isAdmin: true,
        adminLevel: admin.admin_level,
        permissions: parsedPermissions,
        profile_picture: profilePicture,
        profile_picture_path: profilePicture
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error logging in as admin' });
  }
});

export default router; 

// Get current authenticated user
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, full_name, email, role, status, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional: fetch profile picture
    let profile_picture = null;
    try {
      const [pics] = await db.query('SELECT profile_picture_path FROM user_profile_pictures WHERE user_id = ? LIMIT 1', [req.user.id]);
      if (pics && pics.length && pics[0].profile_picture_path) profile_picture = pics[0].profile_picture_path;
    } catch {}

    const user = rows[0];
    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      profile_picture
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Error fetching current user' });
  }
});

// Send OTP for password reset
router.post('/send-otp', async (req, res) => {
  try {
    console.log('📧 OTP Request received:', req.body);
    const { email, purpose = 'password_reset' } = req.body;
    
    if (!email) {
      console.log('❌ No email provided in request');
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    console.log('🔄 Processing OTP request for:', email);
    const result = await generateAndSendOTP(email, purpose);
    console.log('📦 OTP result:', result);
    
    if (result.success) {
      console.log('✅ OTP sent successfully');
      res.json({
        success: true,
        message: result.message,
        otp: result.otp // Only included in development
      });
    } else {
      console.log('❌ OTP send failed:', result.message);
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify OTP for password reset
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, purpose = 'password_reset' } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or OTP'
      });
    }

    const user = users[0];
    const verification = await verifyOTP(user.id, otp);
    
    if (verification.expired) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Generate reset token for password reset
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, purpose: 'password_reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30m' }
    );

    // Store reset token in database
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?',
      [resetToken, user.id]
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: resetToken
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
