const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config();

const { testConnection } = require('./config/database');
const aiInitializer = require('./ai/services/ai-initializer.service');
const performanceMonitor = require('./ai/services/performance-monitor.service');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
const frontendUrl = (process.env.FRONTEND_URL || '').trim();
const renderExternalUrl = (process.env.RENDER_EXTERNAL_URL || '').trim();
const additionalOrigins = [frontendUrl, renderExternalUrl].filter(Boolean);
const allowedOrigins = [...new Set([...corsOrigins, ...additionalOrigins])];

// Development CORS configuration - more permissive for local development
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // If no specific origins are configured, allow all origins
    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }
    
    // Helper: check wildcard and exact matches
    const isAllowedByList = (testOrigin) => {
      for (const entry of allowedOrigins) {
        if (!entry) continue;
        // Exact match
        if (entry === testOrigin) return true;
        // Wildcard: *.example.com -> allows subdomains
        if (entry.startsWith('*.')) {
          const suffix = entry.slice(1); // remove leading '*'
          if (testOrigin.endsWith(suffix)) return true;
        }
      }
      return false;
    };

    if (isAllowedByList(origin)) {
      return callback(null, true);
    }
    
    // In development, allow localhost on any port
    if (isDevelopment && (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:'))) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

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
app.use('/api/scholarships', require('./routes/scholarship.routes'));
app.use('/api/visa', require('./routes/visa.routes'));
app.use('/api/visa-officer', require('./routes/visa-officer.routes'));
app.use('/api/service-fees', require('./routes/service-fee.routes'));
app.use('/api/competitive', require('./routes/competitive-features.routes'));
app.use('/api/advertising', require('./routes/advertising.routes'));
app.use('/api/dealers', require('./routes/dealer.routes'));
app.use('/api/moderators', require('./routes/moderator.routes'));
app.use('/api/ai', require('./ai/routes/ai.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/security-questions', require('./routes/securityQuestions.routes'));
app.use('/api/password-reset', require('./routes/passwordReset.routes'));

// Serve built client (single-service deployment)
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// SPA fallback: send index.html for all non-API routes that don't exist as static files
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) return next();

  // If this looks like a static asset request (has an extension or is under /assets/),
  // don't return index.html when the file is missing — return 404 instead so the
  // browser doesn't receive HTML where it expects CSS/JS (which causes MIME errors).
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
  };
};

// Start server after DB check
(async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    // Initialize AI ecosystem silently
    try {
      await aiInitializer.initializeAllServices();
      await performanceMonitor.startMonitoring();
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


