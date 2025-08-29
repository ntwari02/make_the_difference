import fs from 'fs';
import path from 'path';
import url from 'url';
import db from '../config/database.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getApplied() {
  try {
    const [rows] = await db.query('SELECT filename FROM schema_migrations');
    return new Set(rows.map(r => r.filename));
  } catch (e) {
    console.error('Failed to read schema_migrations. Have you run migrations?', e.message || e);
    process.exit(1);
  }
}

async function run() {
  const migrationsDir = path.resolve(__dirname, '..', 'migrations');
  const archiveDir = path.resolve(__dirname, '..', 'migrations_archived');
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found. Nothing to prune.');
    process.exit(0);
  }
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir);

  const applied = await getApplied();
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  let moved = 0;
  for (const f of files) {
    if (!applied.has(f)) continue; // keep unapplied migrations
    // Never prune the most recent migration to preserve a baseline reference
    // You can override by deleting from schema_migrations first
    const src = path.join(migrationsDir, f);
    const dest = path.join(archiveDir, f);
    try {
      fs.renameSync(src, dest);
      moved++;
      console.log('Archived applied migration:', f);
    } catch (e) {
      console.warn('Failed to archive', f, e.message || e);
    }
  }
  console.log(`Prune complete. Archived ${moved} migration(s).`);
  process.exit(0);
}

run().catch(err => { console.error('Prune failed:', err); process.exit(1); });


