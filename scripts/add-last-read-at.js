import db from '../config/database.js';

async function columnExists(table, column) {
  const [rows] = await db.query(
    'SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ? LIMIT 1',
    [table, column]
  );
  return rows.length > 0;
}

async function indexExists(table, index) {
  const [rows] = await db.query(
    'SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? LIMIT 1',
    [table, index]
  );
  return rows.length > 0;
}

async function run() {
  try {
    console.log('Applying schema updates for conversations.last_read_at and indexes...');

    // Add last_read_at column if missing
    if (!(await columnExists('conversations', 'last_read_at'))) {
      console.log('Adding conversations.last_read_at ...');
      await db.query('ALTER TABLE conversations ADD COLUMN last_read_at TIMESTAMP NULL DEFAULT NULL');
    } else {
      console.log('Column conversations.last_read_at already exists.');
    }

    // Ensure is_read exists for unread tracking
    if (!(await columnExists('conversations', 'is_read'))) {
      console.log('Adding conversations.is_read ...');
      await db.query('ALTER TABLE conversations ADD COLUMN is_read TINYINT(1) NULL DEFAULT 0');
    } else {
      console.log('Column conversations.is_read already exists.');
    }

    // Create helpful indexes if missing
    if (!(await indexExists('conversations', 'idx_conversations_last_read'))) {
      console.log('Creating index idx_conversations_last_read ...');
      await db.query('CREATE INDEX idx_conversations_last_read ON conversations (last_read_at)');
    } else {
      console.log('Index idx_conversations_last_read already exists.');
    }

    if (!(await indexExists('conversations', 'idx_conversations_is_read'))) {
      console.log('Creating index idx_conversations_is_read ...');
      await db.query('CREATE INDEX idx_conversations_is_read ON conversations (is_read)');
    } else {
      console.log('Index idx_conversations_is_read already exists.');
    }

    console.log('Schema updates applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to apply schema updates:', err);
    process.exit(1);
  }
}

run();


