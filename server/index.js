const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { testConnection } = require('./config/database');
const aiInitializer = require('./ai/services/ai-initializer.service');
const performanceMonitor = require('./ai/services/performance-monitor.service');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Allow all origins in development
app.use(cors({
  origin: true, // Allow all origins in development
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
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port} | Database: ${dbConnected ? '✅ Connected' : '❌ Failed'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();


