-- Add last_read_at to conversations for accurate unread calculation
ALTER TABLE conversations 
  ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP NULL DEFAULT NULL;

-- Ensure is_read exists; if not, add it for boolean unread tracking
ALTER TABLE conversations 
  ADD COLUMN IF NOT EXISTS is_read TINYINT(1) NULL DEFAULT 0;

-- Helpful index for unread queries
CREATE INDEX IF NOT EXISTS idx_conversations_last_read ON conversations (last_read_at);
CREATE INDEX IF NOT EXISTS idx_conversations_is_read ON conversations (is_read);

