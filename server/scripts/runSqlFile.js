const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

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

  let sql = fs.readFileSync(sqlPath, 'utf8');

  // Handle MySQL client-only DELIMITER directives for triggers by converting to standard semicolons
  // Remove CR for consistency
  sql = sql.replace(/\r/g, '');
  // Remove any DELIMITER lines
  sql = sql.replace(/^DELIMITER\s+.+$/gm, '');
  // Replace trailing // used to end trigger bodies with ;
  sql = sql.replace(/\n\s*\/\/\s*\n/g, '\n;\n');

  // Replace IF NOT EXISTS syntax for older MySQL variants if needed (no-op here)

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


