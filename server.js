import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import scholarshipRoutes from './routes/scholarships.js';
import partnerRoutes from './routes/partners.js';
import serviceRoutes from './routes/services.js';
import paymentRoutes from './routes/payments.js';
import planRoutes from './routes/plans.js';
import roleRoutes from './routes/roles.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import applicationRoutes from './routes/applications.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from './config/database.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection test
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    connection.release();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribe-newsletter', newsletterRoutes);
app.use('/api/applications', applicationRoutes);

// Serve static HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_dashboard.html'));
});

app.get('/admin-roles', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_rolesPermissions.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error details
  console.error('--- ERROR START ---');
  console.error('Time:', new Date().toISOString());
  console.error('Request:', req.method, req.originalUrl);
  if (req.user) console.error('User:', req.user);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  if (err.stack) console.error('Stack:', err.stack);
  if (err.code) console.error('Error code:', err.code);
  if (err.status) console.error('HTTP status:', err.status);
  console.error('--- ERROR END ---');

  // Respond with JSON error
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
    code: err.code || undefined,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 