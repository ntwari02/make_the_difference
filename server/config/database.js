const mysql = require('mysql2/promise');
require('dotenv').config();

// Build MySQL configuration from environment
function buildDbConfigFromEnv() {
  const { URL } = require('url');

  // Prefer DATABASE_URL if provided, then public URL, then legacy MYSQL_URL
  const mysqlUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;

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
  host = host || process.env.DB_HOST || process.env.MYSQLHOST;
  port = port || parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10);
  user = user || process.env.DB_USER || process.env.MYSQLUSER;
  password = password || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;
  database = database || process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE;

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
    // MySQL performance optimizations
    multipleStatements: false,
    // Increase sort buffer size to prevent "Out of sort memory" errors
    initSql: [
      'SET SESSION sort_buffer_size = 8388608', // 8MB
      'SET SESSION read_rnd_buffer_size = 4194304', // 4MB
      'SET SESSION join_buffer_size = 4194304', // 4MB
      'SET SESSION tmp_table_size = 67108864', // 64MB
      'SET SESSION max_heap_table_size = 67108864' // 64MB
    ],
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
    connectTimeout: 10000 // Connection timeout (10 seconds)
  };
}

// MySQL Database Configuration
const dbConfig = buildDbConfigFromEnv();

// Create connection pool with enhanced error handling
const pool = mysql.createPool(dbConfig);

// Add connection pool event listeners for better monitoring
pool.on('connection', (connection) => {
  const debugMode = process.env.DB_DEBUG === 'true';
  if (debugMode) {
    console.log('🔗 New database connection established as id ' + connection.threadId);
  }
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

// Manual circuit breaker reset function for immediate recovery
const manualResetCircuitBreaker = () => {
  console.log('🔄 Manual circuit breaker reset requested');
  resetCircuitBreaker();
  
  // Also try to recreate the connection pool if needed
  if (pool._allConnections && pool._allConnections.length === 0) {
    console.log('🔄 Recreating connection pool...');
    // Note: In production, you might want to be more careful about this
    // For now, we'll just reset the circuit breaker
  }
};

// Auto-reset circuit breaker after a period of time
let circuitBreakerResetTimer = null;
const CIRCUIT_BREAKER_RESET_DELAY = 30 * 1000; // 30 seconds for faster recovery

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

// Execute query helper with enhanced retry logic, circuit breaker, and parameter validation
const executeQuery = async (query, params = [], retries = 3) => {
  // Check circuit breaker before attempting query
  if (!isHealthy && consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    throw new Error('Database circuit breaker is open - too many consecutive failures');
  }

  // PARAMETER VALIDATION AND SANITIZATION
  const debugMode = process.env.DB_DEBUG === 'true';
  
  if (debugMode) {
    console.log('=== DATABASE EXECUTE QUERY DEBUG ===');
    console.log('Query:', query);
    console.log('Original params:', params);
  }
  
  // Count placeholders in query
  const placeholderCount = (query.match(/\?/g) || []).length;
  
  if (debugMode) {
    console.log('Placeholder count:', placeholderCount);
    console.log('Parameter count:', params.length);
  }
  
  // Sanitize parameters
  // Important: Preserve NULLs for JSON and nullable columns. Do NOT convert to empty strings
  const sanitizedParams = params.map((param, index) => {
    if (param === null || param === undefined) {
      if (debugMode) console.warn(`Parameter ${index} is null/undefined, preserving as NULL`);
      return null;
    }
    if (typeof param === 'string' && (param === 'undefined' || param === 'null')) {
      if (debugMode) console.warn(`Parameter ${index} is string "undefined"/"null", converting to NULL`);
      return null;
    }
    return param;
  });
  
  // Validate parameter count
  if (sanitizedParams.length !== placeholderCount) {
    console.error('PARAMETER MISMATCH IN executeQuery!');
    console.error('Expected:', placeholderCount, 'Actual:', sanitizedParams.length);
    
    // Try to fix the mismatch
    if (sanitizedParams.length < placeholderCount) {
      if (debugMode) console.log('Adding missing parameters...');
      while (sanitizedParams.length < placeholderCount) {
        sanitizedParams.push(null);
      }
    } else if (sanitizedParams.length > placeholderCount) {
      if (debugMode) console.log('Removing excess parameters...');
      sanitizedParams.splice(placeholderCount);
    }
  }
  
  if (debugMode) {
    console.log('Sanitized params:', sanitizedParams);
    console.log('=====================================');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (debugMode) {
        console.log(`Database execution attempt ${attempt}/${retries}`);
      }
      const [results] = await pool.execute(query, sanitizedParams);
      
      // Reset failure counter on successful query
      if (attempt > 1) {
        consecutiveFailures = 0;
        isHealthy = true;
      }
      
      if (debugMode) {
        console.log(`✅ Database query executed successfully on attempt ${attempt}`);
      }
      return results;
    } catch (error) {
      console.error(`❌ Database query error (attempt ${attempt}/${retries}):`, error.message);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      
      // Don't retry on JSON validation errors - they won't fix themselves
      // Throw immediately so the caller can handle it
      if (error.code === 'ER_INVALID_JSON_TEXT' || error.errno === 3140) {
        console.error('❌ JSON validation error detected - not retrying (will be handled by caller)');
        throw error; // Throw immediately, don't retry
      }
      
      // Handle specific MySQL parameter errors
      if (error.code === 'ER_WRONG_ARGUMENTS' || error.errno === 1210) {
        console.error('MySQL parameter mismatch error detected!');
        console.error('Query:', query);
        console.error('Parameters:', sanitizedParams);
        
        // Try with empty parameters as last resort
        if (attempt === retries) {
          console.log('Last attempt: trying with empty parameters...');
          try {
            const [results] = await pool.execute(query, []);
            console.log('✅ Query executed with empty parameters');
            return results;
          } catch (emptyError) {
            console.error('Even empty parameters failed:', emptyError.message);
          }
        }
      }
      
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
  manualResetCircuitBreaker,
  scheduleCircuitBreakerReset,
  dbConfig
};
