import fs from 'fs';
import path from 'path';
import pool from './config/database.js';

async function run() {
  try {
    const sqlPath = path.resolve('./migrations/create_team_members.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const conn = await pool.getConnection();
    try {
      for (const statement of sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean)) {
        await conn.query(statement);
        console.log('Executed:', statement.slice(0, 80));
      }
      console.log('Team members migration completed.');
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

run();


