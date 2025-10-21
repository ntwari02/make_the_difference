const express = require('express');
const router = express.Router();
const { manualResetCircuitBreaker, getConnectionHealth } = require('../config/database');

/**
 * GET /admin/database/health
 * Get database connection health status
 */
router.get('/health', async (req, res) => {
  try {
    const health = getConnectionHealth();
    return res.json({
      success: true,
      data: health
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /admin/database/reset-circuit-breaker
 * Manually reset the database circuit breaker
 */
router.post('/reset-circuit-breaker', async (req, res) => {
  try {
    console.log('🔄 Manual circuit breaker reset requested via API');
    
    // Show current health status
    const beforeHealth = getConnectionHealth();
    console.log('Health before reset:', beforeHealth);
    
    // Reset the circuit breaker
    manualResetCircuitBreaker();
    
    // Show updated health status
    const afterHealth = getConnectionHealth();
    console.log('Health after reset:', afterHealth);
    
    return res.json({
      success: true,
      message: 'Circuit breaker reset successfully',
      data: {
        before: beforeHealth,
        after: afterHealth
      }
    });
  } catch (error) {
    console.error('❌ Error resetting circuit breaker:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
