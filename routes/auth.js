import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Check if user already exists
    const [existingUser] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await db.promise().query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, role || 'user']
    );

    // Create token
    const token = jwt.sign(
      { id: result.insertId, role: role || 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        full_name,
        email,
        role: role || 'user'
      }
    });
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
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
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
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  try {
    // Check if user exists
    const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(200).json({ success: true, message: 'If this email is registered, a reset link will be sent.' });
    }
    const user = users[0];
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
    // Save token and expiry in DB
    await db.promise().query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', [token, expiry, user.id]);
    // Send email
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${token}`;
    const msg = {
      to: email,
      from: 'your_verified_sender@yourdomain.com', // must match the verified sender
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. <a href="${resetUrl}">Click here to reset your password</a>. This link will expire in 1 hour.</p>`
    };
    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('SendGrid error:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      res.status(500).json({ success: false, message: 'Error sending reset email' });
      return;
    }
    res.json({ success: true, message: 'If this email is registered, a reset link will be sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending reset email' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password are required' });
  try {
    // Find user with valid token
    const [users] = await db.promise().query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()', [token]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    const user = users[0];
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    // Update password and clear token
    await db.promise().query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [hashedPassword, user.id]);
    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});

export default router; 