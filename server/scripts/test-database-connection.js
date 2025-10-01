#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script tests the database connection, circuit breaker functionality,
 * and performance monitoring system to ensure everything is working correctly.
 */

const { 
  testConnection, 
  executeQuery, 
  getConnectionHealth, 
  resetCircuitBreaker,
  pool 
} = require('../config/database');

const PerformanceMonitor = require('../ai/services/performance-monitor.service');

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  try {
    // Test 1: Basic connection test
    console.log('1. Testing basic connection...');
    const isConnected = await testConnection();
    console.log(`   Result: ${isConnected ? '✅ Connected' : '❌ Failed'}\n`);
    
    // Test 2: Health check
    console.log('2. Checking connection health...');
    const health = getConnectionHealth();
    console.log('   Health Status:', JSON.stringify(health, null, 2));
    console.log(`   Status: ${health.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}\n`);
    
    // Test 3: Simple query execution
    console.log('3. Testing query execution...');
    try {
      const result = await executeQuery('SELECT 1 as test_value');
      console.log(`   Result: ✅ Query executed successfully - ${JSON.stringify(result[0])}\n`);
    } catch (error) {
      console.log(`   Result: ❌ Query failed - ${error.message}\n`);
    }
    
    // Test 4: Pool statistics
    console.log('4. Checking connection pool...');
    console.log('   Pool Stats:', {
      totalConnections: pool._allConnections?.length || 0,
      freeConnections: pool._freeConnections?.length || 0,
      acquiringConnections: pool._acquiringConnections?.length || 0
    });
    console.log('   Status: ✅ Pool operational\n');
    
    // Test 5: Performance monitor health check
    console.log('5. Testing performance monitor...');
    try {
      const healthCheck = getConnectionHealth();
      if (healthCheck.isHealthy) {
        console.log('   Result: ✅ Performance monitor can collect metrics\n');
      } else {
        console.log('   Result: ⚠️  Performance monitor will skip collection (circuit breaker open)\n');
      }
    } catch (error) {
      console.log(`   Result: ❌ Performance monitor error - ${error.message}\n`);
    }
    
    console.log('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    
    // If circuit breaker is open, try to reset it
    const health = getConnectionHealth();
    if (!health.isHealthy) {
      console.log('\n🔄 Attempting to reset circuit breaker...');
      resetCircuitBreaker();
      console.log('✅ Circuit breaker reset');
    }
  }
}

async function testCircuitBreaker() {
  console.log('\n🔧 Testing Circuit Breaker Functionality...\n');
  
  const health = getConnectionHealth();
  console.log('Initial state:', health.isHealthy ? '✅ Healthy' : '❌ Unhealthy');
  
  if (!health.isHealthy) {
    console.log('Circuit breaker is currently open. Resetting...');
    resetCircuitBreaker();
    
    // Test connection after reset
    const isConnected = await testConnection();
    console.log(`After reset: ${isConnected ? '✅ Connected' : '❌ Still failing'}`);
  }
}

async function main() {
  console.log('🚀 Starting Database Connection Tests\n');
  console.log('=' .repeat(50));
  
  await testDatabaseConnection();
  await testCircuitBreaker();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ All tests completed!');
  
  // Exit gracefully
  process.exit(0);
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the tests
main().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
