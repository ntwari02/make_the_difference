import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import connectMySQL from 'express-mysql-session';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import pool from './config/database.js';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import roleRoutes from './routes/roles.js';
import serviceRoutes from './routes/services.js';
import adminServicesRoutes from './routes/admin-services.js';

import paymentRoutes from './routes/payments.js';
import scholarshipRoutes from './routes/scholarships.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import applicationRoutes from './routes/applications.js';
import adminRoutes from './routes/admin.js';
import adminAccountRoutes from './routes/adminAccount.js';
import adminDashboardRoutes from './routes/admin-dashboard.js';
import adminApplicationsRoutes from './routes/admin-applications.js';
import adminPartnersRoutes from './routes/admin-partners.js';
import publicPartnersRoutes from './routes/partners.js';
import partnershipImagesRoutes from './routes/partnership-images.js';
import settingsRoutes from './routes/settings.js'; // ✅ ADDED HERE
import securityQuestionsRoutes from './routes/securityQuestions.js'; // ✅ ADDED HERE
import adminHelpRoutes from './routes/admin-help.js'; // ✅ ADDED HERE
import userHelpRoutes from './routes/user-help.js'; // ✅ ADDED HERE
import notificationsRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js'; // ✅ ADDED HERE
import reportsRoutes from './routes/reports.js'; // ✅ ADDED HERE
import advertisementRoutes from './routes/advertisements.js'; // ✅ ADDED HERE
import servicesMonetizationRoutes from './routes/services-monetization.js';
import scholarshipDocumentsRoutes from './routes/scholarship-documents.js';
import adminProfileRoutes from './routes/admin-profile.js'; // ✅ ADDED HERE
import passwordChangeRoutes from './routes/password-change.js'; // NEW PASSWORD CHANGE ROUTES

import userNotificationsApiRoutes from './routes/user-notifications.js';
import teamRoutes from './routes/team.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET','POST','PATCH','PUT','DELETE'] }
});
// Expose io to routes via app
app.set('io', io);

// Global safety nets to avoid process crash during development on transient errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    if (process.env.NODE_ENV === 'production') process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    if (process.env.NODE_ENV === 'production') process.exit(1);
});

// Trust proxy only in production (prevents permissive trust proxy in dev)
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

// Middleware
app.set('etag', 'strong');
app.use(cors());
// Clean URLs middleware: serve /about as /about.html and redirect /about.html -> /about
app.use((req, res, next) => {
    try {
        const originalPath = req.path || '/';
        // Skip API, uploads and assets with extensions
        if (
            originalPath.startsWith('/api') ||
            originalPath.startsWith('/uploads') ||
            /\.[a-z0-9]+$/i.test(originalPath)
        ) {
            // If request explicitly has .html, redirect to clean path
            if (/\.html$/i.test(originalPath)) {
                const clean = originalPath.replace(/\.html$/i, '') || '/';
                return res.redirect(301, clean + (req.url.endsWith('/') && clean !== '/' ? '/' : ''));
            }
            return next();
        }

        // Try to serve matching HTML file from public directory
        const candidate = originalPath === '/' ? 'home.html' : `${originalPath.replace(/^\//, '')}.html`;
        const fullPath = path.join(__dirname, 'public', candidate);
        if (fs.existsSync(fullPath)) {
            return res.sendFile(fullPath);
        }
        return next();
    } catch (e) {
        return next();
    }
});
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

// Session store configuration with dev fallback when DB is unavailable
const useMemorySession = String(process.env.DEV_USE_MEMORY_SESSION || '').toLowerCase() === 'true';
let sessionMiddleware;

if (useMemorySession) {
    console.warn('Using in-memory session store (DEV_USE_MEMORY_SESSION=true). Not recommended for production.');
    sessionMiddleware = session({
        secret: process.env.SESSION_SECRET || 'default_secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        }
    });
} else {
// Persistent session store (MySQL) to avoid MemoryStore in production
const MySQLStore = connectMySQL(session);

// Dedicated pool for session store with keep-alive to avoid ECONNRESET on proxies
const sessionPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Loading99.99%',
    database: process.env.DB_NAME || 'mbappe',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: process.env.DB_CONNECT_TIMEOUT ? parseInt(process.env.DB_CONNECT_TIMEOUT, 10) : 20000
});

    // Extra safety: log pool errors without crashing in development
    sessionPool.on('error', (err) => {
        console.error('Session DB pool error:', err);
    });

    let sessionStore;
    try {
        sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000,
    createDatabaseTable: true,
    disableTouch: true,
    endConnectionOnClose: false,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, sessionPool);
    } catch (e) {
        console.error('Failed to initialize MySQL session store:', e);
        if (process.env.NODE_ENV === 'production') throw e;
        console.warn('Falling back to in-memory session store for development.');
        sessionMiddleware = session({
            secret: process.env.SESSION_SECRET || 'default_secret',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            }
        });
    }

    if (!sessionMiddleware) {
        sessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
        });
    }
}

app.use(sessionMiddleware);

// API request timeout safeguard (60s) — avoid interfering with static file streams
app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) return next();
    res.setTimeout(60000, () => {
        if (!res.headersSent) {
            res.status(503).json({ error: true, message: 'Request timed out' });
        }
    });
    next();
});

// Global API rate limiter (per IP)
// const apiLimiter = rateLimit({
//     windowMs: 60 * 1000,
//     max: 300,
//     standardHeaders: true,
//     legacyHeaders: false
// });
// app.use('/api', apiLimiter);

// Basic rate limiting for heavy endpoints (tuned for higher throughput)
const heavyLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 1000, // allow more requests per IP per minute
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    keyGenerator: (req, _res) => req.ip
});

app.use('/api/admin-dashboard', heavyLimiter);
app.use('/api/admin-applications', heavyLimiter);
app.use('/api/scholarships', heavyLimiter);
app.use('/api/scholarship-documents', heavyLimiter);

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
app.use('/api/admin/services', adminServicesRoutes);

app.use('/api/payments', paymentRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribe-newsletter', newsletterRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminAccountRoutes);
app.use('/api/admin/partners', adminPartnersRoutes);
app.use('/api/partners', publicPartnersRoutes);
app.use('/api/partnership-images', partnershipImagesRoutes);
app.use('/api/admin-dashboard', adminDashboardRoutes);
app.use('/api/admin-dashboard', adminApplicationsRoutes);
app.use('/api/admin/profile', adminProfileRoutes); // ✅ ADDED HERE
app.use('/api/settings', settingsRoutes); // ✅ ADDED HERE
app.use('/api/security-questions', securityQuestionsRoutes); // ✅ ADDED HERE
app.use('/api/admin-help', adminHelpRoutes); // ✅ ADDED HERE
app.use('/api/help', userHelpRoutes); // ✅ ADDED HERE
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes); // ✅ ADDED HERE
app.use('/api/reports', reportsRoutes); // ✅ ADDED HERE
app.use('/api/advertisements', advertisementRoutes); // ✅ ADDED HERE
app.use('/api/services-monetization', servicesMonetizationRoutes);
app.use('/api/scholarship-documents', scholarshipDocumentsRoutes);
app.use('/api/password-change', passwordChangeRoutes); // NEW PASSWORD CHANGE ROUTES

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
        if (blockedPages.length === 0) return next();

        // Normalize request path, consider clean URLs and .html, skip asset-like extensions
        let p = (req.path || '/').toLowerCase();
        if (p === '/') p = '/home.html';
        const lastSeg = p.split('/').pop();
        const extMatch = lastSeg.match(/\.([a-z0-9]+)$/i);
        const ext = extMatch ? extMatch[1] : '';
        if (ext && ext !== 'html') return next(); // allow assets

        const fileName = ext === 'html' ? lastSeg : `${lastSeg}.html`; // ensure filename-like
        const baseNoExt = lastSeg.replace(/\.html$/i, '');
        const pLower = p;
        const pNoSlash = pLower.startsWith('/') ? pLower.slice(1) : pLower;
        const pNoSlashBase = pNoSlash.replace(/\.html$/i, '');

        const normalizedBlocked = blockedPages.map(x => {
            const s = String(x || '').toLowerCase();
            const noSlash = s.startsWith('/') ? s.slice(1) : s;
            const base = s.replace(/\.html$/i, '');
            const noSlashBase = noSlash.replace(/\.html$/i, '');
            return { full: s, noSlash, base, noSlashBase };
        });

        const isBlocked = normalizedBlocked.some(entry => {
            return entry.full === fileName
                || entry.full === pLower
                || entry.base === baseNoExt
                || entry.noSlash === fileName
                || entry.noSlash === pNoSlash
                || entry.noSlashBase === baseNoExt
                || entry.noSlashBase === pNoSlashBase;
        });

        if (isBlocked) {
            return res.sendFile(path.join(__dirname, 'public', 'maintenance.html'));
        }
        return next();
    } catch (e) {
        return next();
    }
});

// Serve uploads statically so profile pictures and documents are accessible
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
// Fallback to serve legacy files saved under root uploads (pre-migration)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Ensure chat uploads directory exists at runtime under public/uploads/chat
try {
    fs.mkdirSync(path.join(__dirname, 'public', 'uploads', 'chat'), { recursive: true });
} catch {}

// Serve static HTML files with caching for assets
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (/(\.css|\.js|\.png|\.jpg|\.jpeg|\.gif|\.svg|\.webp|\.woff2?)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
    }
}));

// Fallback to home.html for unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
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

  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
    code: err.code || undefined,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Socket.IO real-time chat scaffolding
io.on('connection', (socket) => {
    try {
        const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId || 'guest';
        socket.data.userId = userId;

        // Join a conversation room
        socket.on('joinConversation', (conversationId) => {
            if (!conversationId) return;
            socket.join(`conv:${conversationId}`);
            io.to(`conv:${conversationId}`).emit('presence', { userId, status: 'online', conversationId });
        });

        // Typing indicators
        socket.on('typing', ({ conversationId }) => {
            if (!conversationId) return;
            socket.to(`conv:${conversationId}`).emit('typing', { userId, conversationId });
        });
        socket.on('stopTyping', ({ conversationId }) => {
            if (!conversationId) return;
            socket.to(`conv:${conversationId}`).emit('stopTyping', { userId, conversationId });
        });

        // Read receipts
        socket.on('readConversation', ({ conversationId }) => {
            if (!conversationId) return;
            socket.to(`conv:${conversationId}`).emit('readConversation', { userId, conversationId, at: Date.now() });
        });

        // New message broadcast (optional client emit after REST success)
        socket.on('messagePosted', ({ conversationId, message }) => {
            if (!conversationId || !message) return;
            io.to(`conv:${conversationId}`).emit('message', { conversationId, message, fromUserId: userId, at: Date.now() });
        });

        // ===== Group rooms =====
        socket.on('joinGroup', (groupId) => {
            if (!groupId) return;
            socket.join(`group:${groupId}`);
            io.to(`group:${groupId}`).emit('group:presence', { userId, status: 'online', groupId });
        });

        socket.on('group:typing', ({ groupId }) => {
            if (!groupId) return;
            socket.to(`group:${groupId}`).emit('group:typing', { userId, groupId });
        });
        socket.on('group:stopTyping', ({ groupId }) => {
            if (!groupId) return;
            socket.to(`group:${groupId}`).emit('group:stopTyping', { userId, groupId });
        });

        socket.on('group:messagePosted', ({ groupId, message }) => {
            if (!groupId || !message) return;
            io.to(`group:${groupId}`).emit('group:message', { groupId, message, fromUserId: userId, at: Date.now() });
        });

        socket.on('disconnect', () => {
            // Could emit presence offline per room if tracked
        });
    } catch {}
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
