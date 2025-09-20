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

// Start server after DB check
(async () => {
  const ok = await testConnection();
  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => {
    console.log(`API listening on port ${port} (db: ${ok ? 'up' : 'down'})`);
  });
})();


