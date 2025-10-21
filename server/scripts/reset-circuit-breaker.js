#!/usr/bin/env node

/**
 * Circuit Breaker Reset Utility
 * 
 * This script manually resets the database circuit breaker
 * when the database connection is having issues.
 * 
 * Usage: node scripts/reset-circuit-breaker.js
 */

const { manualResetCircuitBreaker, getConnectionHealth } = require('../config/database');

async function main() {
  console.log('🔄 Resetting database circuit breaker...');
  
  try {
    // Show current health status
    const health = getConnectionHealth();
    console.log('Current health status:', health);
    
    // Reset the circuit breaker
    manualResetCircuitBreaker();
    
    // Show updated health status
    const newHealth = getConnectionHealth();
    console.log('Updated health status:', newHealth);
    
    console.log('✅ Circuit breaker reset completed successfully!');
  } catch (error) {
    console.error('❌ Error resetting circuit breaker:', error.message);
    process.exit(1);
  }
}

// Run the script
main().then(() => {
  console.log('🎉 Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error.message);
  process.exit(1);
});
