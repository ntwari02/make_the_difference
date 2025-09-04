// API entry point for Scholarship Management System
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './supabase-database.js';
import cloudinaryService from './cloudinary-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for rate limiting behind Render proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(hpp());
app.use(compression());

// Rate limiting (tuned for higher throughput with proxy-aware IPs)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute windows
  max: 3000, // allow up to 1000 requests per IP per minute
  standardHeaders: true, // send rate limit info in the RateLimit-* headers
  legacyHeaders: false, // disable the X-RateLimit-* headers
  message: 'Too many requests from this IP, please try again later.',
  keyGenerator: (req, _res) => req.ip
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-heroku-app.herokuapp.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'mbappe-global-scholarship-2024-secure-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    const cloudinaryHealth = await cloudinaryService.healthCheck();
    
    res.json({ 
      status: 'OK', 
      message: 'Scholarship Management System API is running successfully',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbHealth,
        cloudinary: cloudinaryHealth
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Database initialization endpoint
app.post('/api/init-database', async (req, res) => {
  try {
    await db.initializeTables();
    res.json({
      success: true,
      message: 'Database tables initialized successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// File upload endpoint
app.post('/api/upload', async (req, res) => {
  try {
    // This is a simplified upload - in production you'd use multer for file handling
    const { fileData, fileType, fileName } = req.body;
    
    if (!fileData || !fileType || !fileName) {
      return res.status(400).json({
        success: false,
        error: 'Missing file data, type, or name'
      });
    }

    let result;
    if (fileType.startsWith('image/')) {
      result = await cloudinaryService.uploadImage(fileData);
    } else if (fileType.startsWith('video/')) {
      result = await cloudinaryService.uploadVideo(fileData);
    } else {
      result = await cloudinaryService.uploadDocument(fileData);
    }

    if (result.success) {
      res.json({
        success: true,
        file: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Scholarship endpoints
app.get('/api/scholarships', async (req, res) => {
  try {
    const scholarships = await db.query('SELECT * FROM scholarships WHERE status = "active" ORDER BY created_at DESC');
    res.json({
      success: true,
      scholarships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/scholarships', async (req, res) => {
  try {
    const { title, description, amount, deadline, requirements } = req.body;
    
    const result = await db.query(
      'INSERT INTO scholarships (title, description, amount, deadline, requirements) VALUES (?, ?, ?, ?, ?)',
      [title, description, amount, deadline, requirements]
    );

    res.json({
      success: true,
      message: 'Scholarship created successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// User endpoints
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // In production, hash the password with bcrypt
    const passwordHash = password; // Simplified for demo
    
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, role || 'user']
    );

    res.json({
      success: true,
      message: 'User registered successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Root route with enhanced dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Scholarship Management System</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="/css/styles.css">
    </head>
    <body>
      <div class="container mx-auto p-8">
        <h1 class="text-4xl font-bold text-center mb-8">🎓 Scholarship Management System</h1>
        <div class="text-center">
          <p class="text-xl mb-4">Successfully deployed on Heroku! 🚀</p>
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p><strong>Status:</strong> Running</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>Platform:</strong> Heroku</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <h3 class="font-bold">API Health</h3>
              <a href="/api/health" class="text-blue-600 hover:underline">Check Status</a>
            </div>
            <div class="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded">
              <h3 class="font-bold">Database</h3>
              <button onclick="initDatabase()" class="text-purple-600 hover:underline">Initialize</button>
            </div>
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <h3 class="font-bold">File Storage</h3>
              <span class="text-green-600">Cloudinary Ready</span>
            </div>
          </div>
          
          <div class="text-center">
            <p class="text-lg mb-4">🚀 Your system is ready for production!</p>
            <div class="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
              <p><strong>Next Steps:</strong></p>
              <p>1. Set up PlanetScale database</p>
              <p>2. Configure Cloudinary storage</p>
              <p>3. Add environment variables</p>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        async function initDatabase() {
          try {
            const response = await fetch('/api/init-database', { method: 'POST' });
            const result = await response.json();
            if (result.success) {
              alert('Database initialized successfully!');
            } else {
              alert('Database initialization failed: ' + result.error);
            }
          } catch (error) {
            alert('Error: ' + error.message);
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export for Vercel
export default app;
