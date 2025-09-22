const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { testConnection } = require('./config/database');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
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
  const ok = await testConnection();
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
    console.log(`✅ API listening on port ${port} (db: ${ok ? 'up' : 'down'})`);
    console.log(`🌐 Server running at: http://localhost:${port}`);
    console.log(`💡 Press Ctrl+C to stop the server`);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', gracefulShutdown(server));
  process.on('SIGINT', gracefulShutdown(server));
})();


