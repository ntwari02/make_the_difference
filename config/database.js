import mysql from 'mysql2';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const SLOW_MS = parseInt(process.env.DB_SLOW_MS || '300', 10);

const shouldUseSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Loading99.99%',
    database: process.env.DB_NAME || 'mbappe',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: shouldUseSsl ? { rejectUnauthorized: true } : undefined,
    connectTimeout: process.env.DB_CONNECT_TIMEOUT ? parseInt(process.env.DB_CONNECT_TIMEOUT, 10) : 20000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to database');
    connection.release();
});

// Export both pool and db for consistency
const promised = pool.promise();

// Wrap query to log slow queries
const originalQuery = promised.query.bind(promised);
const logsDir = path.resolve(process.cwd(), 'logs');
const slowLogFile = path.join(logsDir, 'slow-queries.log');
try { if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true }); } catch {}

promised.query = async (...args) => {
    const start = Date.now();
    try {
        const result = await originalQuery(...args);
        const elapsed = Date.now() - start;
        if (elapsed >= SLOW_MS) {
            const sqlPreview = typeof args[0] === 'string' ? args[0].slice(0, 200) : '[non-string-sql]';
            const line = `${new Date().toISOString()} [${elapsed}ms] ${sqlPreview}\n`;
            console.warn('[SLOW-QUERY]', line.trim());
            try { fs.appendFileSync(slowLogFile, line); } catch {}
        }
        return result;
    } catch (err) {
        const elapsed = Date.now() - start;
        console.error(`[QUERY-ERROR ${elapsed}ms]`, err.message);
        throw err;
    }
};

export default promised;