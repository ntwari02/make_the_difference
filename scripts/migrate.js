import fs from 'fs';
import path from 'path';
import url from 'url';
import db from '../config/database.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureMigrationsTable() {
  await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}

async function getApplied() {
  const [rows] = await db.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map(r => r.filename));
}

async function applyMigration(filePath, filename) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = sql
    .split(/;\s*(\r?\n|$)/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  const conn = db;
  for (const stmt of statements) {
    try {
      await conn.query(stmt);
    } catch (err) {
      // Allow idempotent re-runs: ignore common duplicate/exists errors
      const ignorable = new Set([
        'ER_TABLE_EXISTS_ERROR',        // table exists
        'ER_DUP_FIELDNAME',             // column exists
        'ER_DUP_KEYNAME',               // index exists
        'ER_CANT_CREATE_TABLE',         // may occur with IF NOT EXISTS nuances
        'ER_BAD_FIELD_ERROR'            // specifically for 'Unknown column' if ALTER runs before CREATE
      ]);
      if (ignorable.has(err.code)) {
        console.warn('Skipping benign migration error:', err.code, '-', err.message);
        continue;
      }
      throw err;
    }
  }
  await db.query('INSERT INTO schema_migrations (filename) VALUES (?)', [filename]);
}

async function run() {
  const migrationsDir = path.resolve(__dirname, '..', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found. Skipping.');
    return;
  }
  await ensureMigrationsTable();
  const applied = await getApplied();
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  for (const f of files) {
    if (applied.has(f)) continue;
    const full = path.join(migrationsDir, f);
    console.log('Applying migration:', f);
    await applyMigration(full, f);
  }
  console.log('Migrations complete');
  process.exit(0);
}

run().catch(err => { console.error('Migration failed:', err); process.exit(1); });


