const { pool } = require('../config/database');

// Compatibility layer for legacy imports expecting ../db/connection
// Exposes execute/query methods matching mysql2/promise signature usage in codebase
module.exports = {
  execute: async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return [rows];
  },
  query: async (sql, params = []) => {
    const [rows] = await pool.query(sql, params);
    return [rows];
  }
};


