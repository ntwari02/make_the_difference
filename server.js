import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import pool from './config/database.js';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import roleRoutes from './routes/roles.js';
import serviceRoutes from './routes/services.js';
import partnerRoutes from './routes/partners.js';
import paymentRoutes from './routes/payments.js';
import scholarshipRoutes from './routes/scholarships.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import applicationRoutes from './routes/applications.js';
import adminRoutes from './routes/admin.js';
import adminAccountRoutes from './routes/adminAccount.js';
import adminDashboardRoutes from './routes/admin-dashboard.js';
import adminApplicationsRoutes from './routes/admin-applications.js';
import settingsRoutes from './routes/settings.js'; // ✅ ADDED HERE
import emailTemplatesRoutes from './routes/emailTemplates.js'; // ✅ ADDED HERE
import securityQuestionsRoutes from './routes/securityQuestions.js'; // ✅ ADDED HERE
import adminHelpRoutes from './routes/admin-help.js'; // ✅ ADDED HERE
import notificationsRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js'; // ✅ ADDED HERE
import reportsRoutes from './routes/reports.js'; // ✅ ADDED HERE
import advertisementRoutes from './routes/advertisements.js'; // ✅ ADDED HERE
import servicesMonetizationRoutes from './routes/services-monetization.js';
import scholarshipDocumentsRoutes from './routes/scholarship-documents.js';
import partnershipImagesRoutes from './routes/partnership-images.js';
import userNotificationsApiRoutes from './routes/user-notifications.js';
import teamRoutes from './routes/team.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('etag', 'strong');
app.use(cors());
// Enable gzip/brotli compression for responses
app.use(compression({
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '25mb' }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Global request timeout safeguard (10s)
app.use((req, res, next) => {
    res.setTimeout(10000, () => {
        if (!res.headersSent) {
            res.status(503).json({ error: true, message: 'Request timed out' });
        }
    });
    next();
});

// Global API rate limiter (per IP)
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', apiLimiter);

// Basic rate limiting for heavy endpoints
const heavyLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/admin-dashboard', heavyLimiter);
app.use('/api/admin-applications', heavyLimiter);
app.use('/api/scholarships', heavyLimiter);
app.use('/api/scholarship-documents', heavyLimiter);
app.use('/api/partnership-images', heavyLimiter);
app.use('/api/user-notifications', heavyLimiter);

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
app.use('/api/services', serviceRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribe-newsletter', newsletterRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminAccountRoutes);
app.use('/api/admin-dashboard', adminDashboardRoutes);
app.use('/api/admin-dashboard', adminApplicationsRoutes);
app.use('/api/settings', settingsRoutes); // ✅ ADDED HERE
app.use('/api/email-templates', emailTemplatesRoutes); // ✅ ADDED HERE
app.use('/api/security-questions', securityQuestionsRoutes); // ✅ ADDED HERE
app.use('/api/admin-help', adminHelpRoutes); // ✅ ADDED HERE
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes); // ✅ ADDED HERE
app.use('/api/reports', reportsRoutes); // ✅ ADDED HERE
app.use('/api/advertisements', advertisementRoutes); // ✅ ADDED HERE
app.use('/api/services-monetization', servicesMonetizationRoutes);
app.use('/api/scholarship-documents', scholarshipDocumentsRoutes);
app.use('/api/partnership-images', partnershipImagesRoutes);
app.use('/api/user-notifications', userNotificationsApiRoutes);
app.use('/api/team', teamRoutes);


// Maintenance gate (must run BEFORE static serving)
app.use(async (req, res, next) => {
    try {
        // Allow API and admin routes to function during maintenance
        if (req.path.startsWith('/api') || req.path.startsWith('/admin')) return next();

        const [rows] = await pool.query("SELECT maintenance_mode, maintenance_pages FROM general_settings ORDER BY id DESC LIMIT 1");
        const settings = rows && rows[0] ? rows[0] : {};
        const maintenanceOn = settings.maintenance_mode === 'on' || settings.maintenance_mode === 1;
        if (!maintenanceOn) return next();

        let blockedPages = [];
        try { blockedPages = JSON.parse(settings.maintenance_pages || '[]'); } catch { blockedPages = []; }

        // If specific pages selected: only block those. If none selected: block nothing (advanced mode intent).
        if (blockedPages.length === 0) return next();

        // Normalize requested path to a page filename
        let p = req.path;
        if (!p || p === '/') p = '/home.html';
        // Only consider direct HTML requests or root
        const isHtml = p.endsWith('.html') || p === '/home.html';
        if (!isHtml) return next();

        const fileName = p.split('/').pop().toLowerCase();            // e.g., service.html
        const baseNoExt = fileName.replace(/\.html$/i, '');           // e.g., service
        const normalizedBlocked = blockedPages.map(x => {
            const s = String(x || '').toLowerCase();
            return { full: s, base: s.replace(/\.html$/i, '') };
        });

        const isBlocked = normalizedBlocked.some(entry => {
            return entry.full === fileName || entry.full === p.toLowerCase() || entry.base === baseNoExt;
        });
        if (isBlocked) {
            return res.sendFile(path.join(__dirname, 'public', 'maintenance.html'));
        }
        return next();
    } catch (e) {
        // On error, fail open
        return next();
    }
});

// Serve uploads statically so profile pictures and documents are accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static HTML files with caching for assets
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        // Cache busting via filenames is assumed for assets; HTML should not be cached aggressively
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (/(\.css|\.js|\.png|\.jpg|\.jpeg|\.gif|\.svg|\.webp|\.woff2?)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
    }
}));

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
