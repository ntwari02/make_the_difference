import db from '../config/database.js';

async function ensureColumns() {
	try {
		await db.query('ALTER TABLE conversations ADD COLUMN last_read_at TIMESTAMP NULL DEFAULT NULL');
		console.log('Added last_read_at');
	} catch (e) {
		if (e.code === 'ER_DUP_FIELDNAME') {
			console.log('last_read_at already exists');
		} else {
			console.warn('Could not add last_read_at:', e.message);
		}
	}
	try {
		await db.query('ALTER TABLE conversations ADD COLUMN is_read TINYINT(1) NULL DEFAULT 0');
		console.log('Added is_read');
	} catch (e) {
		if (e.code === 'ER_DUP_FIELDNAME') {
			console.log('is_read already exists');
		} else {
			console.warn('Could not add is_read:', e.message);
		}
	}
	try {
		await db.query('CREATE INDEX idx_conversations_last_read ON conversations (last_read_at)');
		console.log('Created idx_conversations_last_read');
	} catch (e) {
		if (e.code === 'ER_DUP_KEYNAME') {
			console.log('idx_conversations_last_read already exists');
		} else {
			console.warn('Could not create idx_conversations_last_read:', e.message);
		}
	}
	try {
		await db.query('CREATE INDEX idx_conversations_is_read ON conversations (is_read)');
		console.log('Created idx_conversations_is_read');
	} catch (e) {
		if (e.code === 'ER_DUP_KEYNAME') {
			console.log('idx_conversations_is_read already exists');
		} else {
			console.warn('Could not create idx_conversations_is_read:', e.message);
		}
	}
	process.exit(0);
}

ensureColumns().catch(err => { console.error('Failed to ensure columns:', err); process.exit(1); });
