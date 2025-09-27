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
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000, // 60 seconds - valid for connection pool
    idleTimeout: 300000 // 5 minutes
  };
}

// MySQL Database Configuration
const dbConfig = buildDbConfigFromEnv();

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query helper with retry logic
const executeQuery = async (query, params = [], retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const [results] = await pool.execute(query, params);
      return results;
    } catch (error) {
      console.error(`Database query error (attempt ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying in ${delay}ms...`);
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
  executeTransaction
};
