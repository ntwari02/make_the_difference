

-- Add parent_message_id column to messages table for reply functionality
-- This allows messages to reference other messages they are replying to

-- Check if column exists first (MySQL doesn't support IF NOT EXISTS in ALTER TABLE)
-- Run this query to check: SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
--   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'parent_message_id';

-- If column doesn't exist (returns 0), run the following:
ALTER TABLE messages 
ADD COLUMN parent_message_id VARCHAR(36) NULL;

-- Optional: Add foreign key constraint
-- ALTER TABLE messages 
-- ADD CONSTRAINT fk_messages_parent_message 
-- FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL;