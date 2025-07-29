import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import pool from './config/database.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import roleRoutes from './routes/roles.js';
import planRoutes from './routes/plans.js';
import serviceRoutes from './routes/services.js';
import partnerRoutes from './routes/partners.js';
import paymentRoutes from './routes/payments.js';
import scholarshipRoutes from './routes/scholarships.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import applicationRoutes from './routes/applications.js';
import adminRoutes from './routes/admin.js';
import settingsRoutes from './routes/settings.js'; // ✅ ADDED HERE
import emailTemplatesRoutes from './routes/emailTemplates.js'; // ✅ ADDED HERE
import notificationsRoutes from './routes/notifications.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Database connection test
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    connection.release();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribe-newsletter', newsletterRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes); // ✅ ADDED HERE
app.use('/api/email-templates', emailTemplatesRoutes); // ✅ ADDED HERE
app.use('/api/notifications', notificationsRoutes);

// Serve uploads statically so profile pictures and documents are accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static HTML files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA-like behavior (optional but good practice)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
