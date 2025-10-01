const mysql = require('mysql2/promise');
require('dotenv').config();

// Build MySQL configuration from environment
function buildDbConfigFromEnv() {
  const { URL } = require('url');

  // Prefer public URL if provided (externally reachable). Fallback to MYSQL_URL.
  const mysqlUrl = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;

  let host;
  let port;
  let user;
  let password;
  let database;

  if (mysqlUrl) {
    try {
      const parsed = new URL(mysqlUrl);
      host = parsed.hostname;
      port = parsed.port ? parseInt(parsed.port, 10) : 3306;
      user = decodeURIComponent(parsed.username || '');
      password = decodeURIComponent(parsed.password || '');
      database = (parsed.pathname || '').replace(/^\//, '') || undefined;
    } catch (err) {
      console.warn('⚠️  Failed to parse MYSQL URL. Falling back to individual env vars:', err.message);
    }
  }

  // Fallback to individual env vars (support both DB_* and MYSQL* conventions)
  host = host || process.env.DB_HOST || process.env.MYSQLHOST || 'tramway.proxy.rlwy.net';
  port = port || parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '54880', 10);
  user = user || process.env.DB_USER || process.env.MYSQLUSER || 'root';
  password = password || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
  database = database || process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway';

  // Enable SSL for public proxies by default
  const needsSSL = /\b(proxy\.rlwy\.net|railway\.app)\b/.test(host);

  return {
    host,
    port,
    user,
    password,
    database,
    ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 20, // Increased from 10
    queueLimit: 0,
    // acquireTimeout: 30000, // Not supported in MySQL2 - removed
    idleTimeout: 600000, // Increased to 10 minutes
    charset: 'utf8mb4',
    timezone: 'Z',
    // Additional connection options for better stability
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: false,
    debug: false,
    trace: false,
    // Connection pool specific options
    multipleStatements: false,
    namedPlaceholders: true,
    // Connection-level options
    connectTimeout: 20000 // Connection timeout
  };
}

// MySQL Database Configuration
const dbConfig = buildDbConfigFromEnv();

// Create connection pool with enhanced error handling
const pool = mysql.createPool(dbConfig);

// Add connection pool event listeners for better monitoring
pool.on('connection', (connection) => {
  console.log('🔗 New database connection established as id ' + connection.threadId);
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Connection lost, pool will handle reconnection automatically');
  }
});

// Connection health check
let isHealthy = true;
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;

// Test database connection with circuit breaker
const testConnection = async () => {
  if (!isHealthy && consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    console.log('🚫 Circuit breaker open - skipping connection test');
    return false;
  }

  try {
    const connection = await pool.getConnection();
    await connection.ping(); // Test the connection with a ping
    connection.release();
    
    // Reset failure counter on successful connection
    consecutiveFailures = 0;
    isHealthy = true;
    return true;
  } catch (error) {
    consecutiveFailures++;
    isHealthy = false;
    console.error(`❌ Database connection failed (attempt ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}):`, error.message);
    
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      console.log('🚨 Circuit breaker opened - too many consecutive failures');
      scheduleCircuitBreakerReset();
    }
    
    return false;
  }
};

// Health check function
const getConnectionHealth = () => ({
  isHealthy,
  consecutiveFailures,
  maxFailures: MAX_CONSECUTIVE_FAILURES,
  poolStats: {
    totalConnections: pool._allConnections?.length || 0,
    freeConnections: pool._freeConnections?.length || 0,
    acquiringConnections: pool._acquiringConnections?.length || 0
  }
});

// Circuit breaker reset function
const resetCircuitBreaker = () => {
  consecutiveFailures = 0;
  isHealthy = true;
  console.log('🔄 Circuit breaker reset - database connection restored');
};

// Auto-reset circuit breaker after a period of time
let circuitBreakerResetTimer = null;
const CIRCUIT_BREAKER_RESET_DELAY = 5 * 60 * 1000; // 5 minutes

const scheduleCircuitBreakerReset = () => {
  if (circuitBreakerResetTimer) {
    clearTimeout(circuitBreakerResetTimer);
  }
  
  circuitBreakerResetTimer = setTimeout(() => {
    if (!isHealthy && consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      console.log('🔄 Attempting circuit breaker reset...');
      resetCircuitBreaker();
    }
  }, CIRCUIT_BREAKER_RESET_DELAY);
};

// Execute query helper with enhanced retry logic and circuit breaker
const executeQuery = async (query, params = [], retries = 3) => {
  // Check circuit breaker before attempting query
  if (!isHealthy && consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    throw new Error('Database circuit breaker is open - too many consecutive failures');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const [results] = await pool.execute(query, params);
      
      // Reset failure counter on successful query
      if (attempt > 1) {
        consecutiveFailures = 0;
        isHealthy = true;
      }
      
      return results;
    } catch (error) {
      console.error(`Database query error (attempt ${attempt}/${retries}):`, error.message);
      
      // Handle specific connection errors
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        consecutiveFailures++;
        isHealthy = false;
        console.log(`🔄 Connection lost, attempt ${attempt}/${retries}`);
      }
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry with exponential backoff and jitter
      const baseDelay = Math.pow(2, attempt) * 1000;
      const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
      const delay = baseDelay + jitter;
      
      console.log(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Execute transaction helper
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction,
  getConnectionHealth,
  resetCircuitBreaker,
  scheduleCircuitBreakerReset,
  dbConfig
};
