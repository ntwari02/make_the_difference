const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node scripts/runSqlFile.js <path-to-sql>');
    process.exit(1);
  }
  const sqlPath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    await connection.query(sql);
    console.log('Executed SQL:', fileArg);
  } finally {
    await connection.end();
  }
}

run().catch((err) => {
  console.error('Migration error:', err.message);
  process.exit(1);
});


