-- Add unread status to conversations table
-- This migration adds an is_read field to track whether admin has read the conversation

ALTER TABLE conversations 
ADD COLUMN is_read TINYINT(1) DEFAULT 0 COMMENT '0 = unread, 1 = read by admin';

-- Set all existing conversations as read initially
UPDATE conversations SET is_read = 1 WHERE is_read IS NULL;

-- Add index for better performance on unread queries
CREATE INDEX idx_conversations_is_read ON conversations(is_read);

-- Add index for admin_id and is_read combination
CREATE INDEX idx_conversations_admin_read ON conversations(admin_id, is_read);
