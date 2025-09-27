const { pool } = require('../config/database');

// Export the pool as 'db' to match the expected import in services
module.exports = pool;
