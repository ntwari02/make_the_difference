import fs from 'fs';
import path from 'path';
import url from 'url';
import pool from '../config/database.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration(filePath) {
  try {
    const abs = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
    const sql = fs.readFileSync(abs, 'utf8');
    // Naive split on ; handling; skip empty statements
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length);
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    console.log(`✅ Migration applied: ${filePath}`);
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration failed:', e.message || e);
    process.exit(1);
  }
}

const arg = process.argv[2] || 'migrations/001_groups.sql';
runMigration(arg);


