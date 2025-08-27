import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const filePath = path.join(__dirname, 'migrations', 'add_performance_indexes.sql');
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);
  const conn = await pool.getConnection();
  try {
    for (const stmt of statements) {
      try {
        // Replace IF NOT EXISTS/DROP IF EXISTS for MySQL < 8 fallback
        const normalized = stmt
          .replace(/CREATE INDEX IF NOT EXISTS/gi, 'CREATE INDEX')
          .replace(/DROP INDEX IF EXISTS\s+`?(\w+)`?\s+ON\s+`?(\w+)`?/i, 'DROP INDEX `$1` ON `$2`');
        await conn.query(normalized);
        console.log('Executed:', stmt.slice(0, 100) + (stmt.length > 100 ? '...' : ''));
      } catch (e) {
        // Ignore duplicate/index missing errors for idempotency
        const msg = String(e && e.message || '').toLowerCase();
        if (msg.includes('duplicate key') || msg.includes('already exists') || msg.includes('check that column/key exists') || msg.includes('doesn\'t exist')) {
          console.log('Skipped (benign):', stmt.slice(0, 100));
          continue;
        }
        console.error('Failed:', stmt, '\nError:', e.message);
        throw e;
      }
    }
    console.log('Performance indexes migration completed.');
  } finally {
    conn.release();
  }
  process.exit(0);
}

run().catch(err => { console.error('Migration failed:', err); process.exit(1); });


