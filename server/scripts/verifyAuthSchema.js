const mysql = require('mysql2/promise');

(async () => {
  const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };
  const conn = await mysql.createConnection(config);
  const queries = [
    "SHOW TABLES LIKE 'auth_%'",
    "SHOW TABLES LIKE 'rbac_%'",
    "SHOW TABLES LIKE 'privacy_consents'",
    "SHOW TABLES LIKE 'account_deletion_requests'"
  ];
  for (const q of queries) {
    const [rows] = await conn.query(q);
    console.log(`Query: ${q}`);
    console.log(rows.map(r => Object.values(r)[0]));
  }
  await conn.end();
})().catch(err => {
  console.error('Verification error:', err.message);
  process.exit(1);
});


