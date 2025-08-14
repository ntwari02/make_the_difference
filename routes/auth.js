import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
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
      const [result] = await connection.query(
        'INSERT INTO users (full_name, email, password, security_questions_setup) VALUES (?, ?, ?, ?)',
        [full_name, email, hashedPassword, true]
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

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
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
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Forgot Password - Get security questions
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  
  try {
    // Check if user exists and has security questions set up
    const [users] = await db.query(`
      SELECT u.id, u.email, u.security_questions_setup,
             COUNT(usa.id) as question_count
      FROM users u
      LEFT JOIN user_security_answers usa ON u.id = usa.user_id
      WHERE u.email = ?
      GROUP BY u.id
    `, [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email address' 
      });
    }
    
    const user = users[0];
    
    if (!user.security_questions_setup || user.question_count < 2) {
      return res.status(400).json({ 
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
      questions: questions
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

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user.id,
        full_name: admin.full_name,
        email: admin.email,
        isAdmin: true,
        adminLevel: admin.admin_level,
        permissions: typeof admin.permissions === 'string' ? JSON.parse(admin.permissions || '{}') : (admin.permissions || {})
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error logging in as admin' });
  }
});

export default router; 
