const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config({ debug: false, override: false });

const { testConnection } = require('./config/database');
const aiInitializer = require('./ai/services/ai-initializer.service');
const performanceMonitor = require('./ai/services/performance-monitor.service');

const app = express();

// Morgan logging middleware
app.use(morgan('combined', {
  skip: function (req, res) { 
    // Skip logging for static assets and health checks
    return req.url.includes('/assets/') || req.url === '/health';
  }
}));

// Custom morgan token for authentication debugging
morgan.token('auth', function (req, res) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    // Show first 20 chars of token for debugging
    return token.substring(0, 20) + '...';
  }
  return 'no-token';
});

morgan.token('user-role', function (req, res) {
  return req.user ? req.user.role : 'no-user';
});

// Detailed logging for API routes
app.use('/api', morgan(':method :url :status :response-time ms - :auth - :user-role'));

// Error logging middleware for 403 errors
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode === 403) {
      console.log('🚫 403 FORBIDDEN ERROR:');
      console.log('  URL:', req.url);
      console.log('  Method:', req.method);
      console.log('  Headers:', req.headers);
      console.log('  User:', req.user);
      console.log('  Body:', req.body);
      console.log('  Response:', data);
      console.log('  ======================================');
    }
    originalSend.call(this, data);
  };
  next();
});

// CORS configuration
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
const frontendUrl = (process.env.FRONTEND_URL || '').trim();
const renderExternalUrl = (process.env.RENDER_EXTERNAL_URL || '').trim();
const additionalOrigins = [frontendUrl, renderExternalUrl].filter(Boolean);
const allowedOrigins = [...new Set([...corsOrigins, ...additionalOrigins])];

// Development CORS configuration - more permissive for local development
const isDevelopment = process.env.NODE_ENV !== 'production';

// Register CORS before body parsers so preflight OPTIONS requests are handled by CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // If no specific origins are configured, allow all origins
    if (allowedOrigins.length === 0) return callback(null, true);

    // Helper: check wildcard and exact matches
    const isAllowedByList = (testOrigin) => {
      for (const entry of allowedOrigins) {
        if (!entry) continue;
        if (entry === testOrigin) return true;
        if (entry.startsWith('*.')) {
          const suffix = entry.slice(1); // remove leading '*'
          if (testOrigin.endsWith(suffix)) return true;
        }
      }
      return false;
    };

    if (isAllowedByList(origin)) return callback(null, true);

    // In development, allow localhost on any port
    if (isDevelopment && (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:'))) {
      return callback(null, true);
    }

    // Deny: log for debugging and return false (don't throw an error)
    console.warn(`⛔ CORS denied for origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
    return callback(null, false);
  },
  credentials: true
}));

// Middleware
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false, // keep simple defaults; tighten per frontend as needed
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const maxReqs = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100);

// Enhanced rate limiting with different limits for authenticated users
app.use(rateLimit({
  windowMs,
  max: (req) => {
    // Higher limits for authenticated users
    if (req.user && req.user.id) {
      // Sellers and admins get higher limits for dashboard operations
      if (req.user.role === 'seller' || req.user.role === 'admin') {
        return maxReqs * 3; // 3x limit for sellers/admins
      }
      // Regular authenticated users get 2x limit
      return maxReqs * 2;
    }
    // Unauthenticated users get standard limit
    return maxReqs;
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IPv6-safe key generator using helper from express-rate-limit
  keyGenerator: (req) => {
    const ipKey = (rateLimit.ipKeyGenerator ? rateLimit.ipKeyGenerator(req) : req.ip);
    if (req.user && req.user.id) {
      return `${ipKey}-${req.user.id}`;
    }
    return ipKey;
  },
  // Do not rate limit CORS preflight or critical auth endpoints
  skip: (req) => {
    const p = (req.path || '').toLowerCase();
    if (req.method === 'OPTIONS') return true;
    // Exempt login/logout/refresh/register to prevent UX issues during auth flows
    if (p === '/api/auth/login' || p === '/api/auth/logout' || p === '/api/auth/refresh' || p === '/api/auth/register') return true;
    return false;
  },
  // Custom message for rate limit exceeded
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    }
  },
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    const retryAfter = Math.ceil(windowMs / 1000);
    res.set('Retry-After', retryAfter.toString());
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.',
        retryAfter: retryAfter
      }
    });
  }
}));

// Request logging (Morgan)
try {
  const morgan = require('morgan');
  const format = process.env.MORGAN_FORMAT || (isDevelopment ? 'dev' : 'combined');
  app.use(morgan(format));
} catch (e) {
  console.warn('Morgan not installed; skipping HTTP request logging');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/orgs', require('./elearning/routes/org.routes'));
app.use('/api/elearning', require('./elearning/routes/elearning.routes'));
app.use('/api/quiz', require('./elearning/routes/quiz.routes'));
app.use('/api/online-classes', require('./elearning/routes/online-classes.routes'));
app.use('/api/certificates', require('./elearning/routes/certificate.routes'));
app.use('/api/elearning-payments', require('./elearning/routes/elearning-payment.routes'));
app.use('/api/cars', require('./ecommerce/routes/cars.routes'));
app.use('/api/recommendations', require('./ecommerce/routes/recommendations.routes'));
app.use('/api/search', require('./ecommerce/routes/advanced-search.routes'));
app.use('/api/payments', require('./ecommerce/routes/payment.routes'));
app.use('/api/enhanced-payments', require('./ecommerce/routes/enhanced-payment.routes'));
app.use('/api/spare-parts', require('./ecommerce/routes/spare-parts.routes'));
app.use('/api/spare-parts-working', require('./ecommerce/routes/spare-parts-working.routes'));
app.use('/api/spare-parts-analytics', require('./ecommerce/routes/spare-parts-analytics.routes'));
app.use('/api/spare-parts-recommendations', require('./ecommerce/routes/spare-parts-recommendations.routes'));
app.use('/api/spare-parts-notifications', require('./ecommerce/routes/spare-parts-notifications.routes'));
app.use('/api/orders', require('./ecommerce/routes/orders.routes'));
app.use('/api/scholarships', require('./routes/scholarship.routes'));
app.use('/api/visa', require('./routes/visa.routes'));
app.use('/api/visa-officer', require('./routes/visa-officer.routes'));
app.use('/api/service-fees', require('./routes/service-fee.routes'));
app.use('/api/competitive', require('./routes/competitive-features.routes'));
// Notifications path aliases for frontend compatibility
app.use('/api/notifications', (req, res, next) => {
  // Delegate to competitive routes by adjusting URL
  req.url = '/notifications' + (req.url || '');
  return require('./routes/competitive-features.routes')(req, res, next);
});
app.use('/api/advertising', require('./routes/advertising.routes'));
app.use('/api/dealers', require('./routes/dealer.routes'));
app.use('/api/seller', require('./routes/seller.routes'));
app.use('/api/moderators', require('./routes/moderator.routes'));  
app.use('/api/ai', require('./ai/routes/ai.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/admin/database', require('./routes/admin-database'));
app.use('/api/user', require('./routes/user.routes'));
// Removed password reset and security-questions routes

// Static serving for uploaded images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// Serve uploads under /uploads for direct image access
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800');
  }
}));

// Centralized error handler (must be after routes)
// Ensure we don't leak internals (SQL, stack traces)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = status < 500 ? (err.message || 'Request failed') : 'Unexpected error occurred';
  if (process.env.LOG_LEVEL !== 'silent') {
    console.error('Error:', { status, code, message: err.message, stack: err.stack });
  }
  res.status(status).json({ error: { code, message } });
});

// Serve built client (single-service deployment)
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// SPA fallback: send index.html for all non-API routes that don't exist as static files (Express 5 compatible)
app.get(/^\/(?!api\/).*/, (req, res, next) => {

  const looksLikeAsset = req.path.startsWith('/assets/') || path.extname(req.path) !== '';
  const filePath = path.join(staticDir, req.path);

  if (looksLikeAsset) {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // File doesn't exist — respond 404 rather than serving index.html
        return res.status(404).send('Not found');
      }
      // File exists, serve it normally
      return res.sendFile(filePath);
    });
    return;
  }

  // Non-asset SPA route: if file exists serve it, otherwise return index.html
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, serve index.html for SPA routing
      res.sendFile(path.join(staticDir, 'index.html'));
    } else {
      // File exists, serve it normally
      res.sendFile(filePath);
    }
  });
});

// Port availability check
const checkPort = (port) => {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
};

// Auto-cleanup function to kill conflicting processes
const autoCleanup = async (port) => {
  const { exec } = require('child_process');
  
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (stdout.trim()) {
        console.log(`🧹 Found conflicting processes on port ${port}. Cleaning up...`);
        
        // Extract process IDs and kill them
        const lines = stdout.trim().split('\n');
        const pids = new Set();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            pids.add(parts[4]);
          }
        });
        
        let killedCount = 0;
        pids.forEach(pid => {
          exec(`taskkill /PID ${pid} /F`, (killError) => {
            if (!killError) {
              killedCount++;
              console.log(`✅ Killed process ${pid}`);
            }
          });
        });
        
        // Wait a moment for processes to be killed
        setTimeout(() => {
          console.log(`🧹 Cleanup complete. Killed ${killedCount} processes.`);
          resolve();
        }, 2000);
      } else {
        resolve();
      }
    });
  });
};

// Graceful shutdown handler
const gracefulShutdown = (server) => {
  return (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.log('⚠️  Forcing server close');
      process.exit(1);
    }, 10000);
    // Clear deferred monitor timer if present
    if (module.exports._monitorRetryTimer) {
      clearInterval(module.exports._monitorRetryTimer);
      module.exports._monitorRetryTimer = null;
    }
  };
};

// Start server after DB check
(function(){
  // Timer for deferred performance monitor startup when DB is down
  // Scoped outside of the async IIFE to allow graceful shutdown cleanup
  module.exports = { _monitorRetryTimer: null };
})();
(async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    // Initialize AI ecosystem silently
    try {
      await aiInitializer.initializeAllServices();
      // Start performance monitoring ONLY if DB is connected to avoid ECONNRESET spam
      if (dbConnected) {
        await performanceMonitor.startMonitoring();
      } else {
        console.warn('⚠️  Skipping performance monitoring: database is not connected');
        // Schedule periodic re-checks to start monitoring once DB recovers
        const retryMs = Number(process.env.MONITOR_RETRY_MS || 30000);
        const tryStart = async () => {
          try {
            const ok = await testConnection();
            if (ok) {
              await performanceMonitor.startMonitoring();
              clearInterval(module.exports._monitorRetryTimer);
              module.exports._monitorRetryTimer = null;
              console.log('✅ Performance monitoring started after DB recovery');
            } else {
              console.log('⏳ Waiting for database to recover before starting performance monitor...');
            }
          } catch (e) {
            // Keep waiting silently to avoid log spam
          }
        };
        module.exports._monitorRetryTimer = setInterval(tryStart, retryMs);
      }
    } catch (aiError) {
      console.error('⚠️  AI initialization failed:', aiError.message);
    }
    
    // Start server
    const port = Number(process.env.PORT || 3001);
    
    // Auto-cleanup conflicting processes
    await autoCleanup(port);
    
    // Check if port is available after cleanup
    const isPortAvailable = await checkPort(port);
    if (!isPortAvailable) {
      console.error(`❌ Port ${port} is still in use after cleanup. Please try again or use a different port.`);
      console.log(`💡 You can also run: kill-server.bat`);
      process.exit(1);
    }
    
    const server = app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port} | Database: ${dbConnected ? '✅ Connected' : '❌ Failed'}`);
      console.log(`🌐 Server running at: http://localhost:${port}`);
      console.log(`💡 Press Ctrl+C to stop the server`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', gracefulShutdown(server));
    process.on('SIGINT', gracefulShutdown(server));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();


