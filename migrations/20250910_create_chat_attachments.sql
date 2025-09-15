-- Persistent chat attachments with foreign keys
-- Stores metadata and optional pointer to BLOB row when ATTACHMENTS_STORAGE=db

CREATE TABLE IF NOT EXISTS chat_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  reply_id INT NULL,
  uploader_user_id INT NULL,
  uploader_email VARCHAR(255) NULL,
  filename VARCHAR(255) NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  storage ENUM('disk','db') NOT NULL DEFAULT 'disk',
  attachments_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_attachments_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_chat_attachments_reply
    FOREIGN KEY (reply_id) REFERENCES replies(id)
    ON DELETE SET NULL,
  KEY idx_chat_attachments_conversation (conversation_id),
  KEY idx_chat_attachments_reply (reply_id),
  KEY idx_chat_attachments_filename (filename)
);

-- Optional FK to attachments (BLOB table) if present
ALTER TABLE chat_attachments
  ADD CONSTRAINT fk_chat_attachments_attachments
  FOREIGN KEY (attachments_id) REFERENCES attachments(id)
  ON DELETE SET NULL;

-- Backfill existing replies that have attachment_url
INSERT INTO chat_attachments (conversation_id, reply_id, uploader_user_id, uploader_email, filename, mimetype, size, storage, attachments_id)
SELECT r.conversation_id, r.id, r.sender_id, r.sender_email, r.attachment_url, COALESCE(r.attachment_type,''), COALESCE(r.attachment_size,0),
       CASE LOWER(COALESCE(@ATT_MODE:=(SELECT LOWER(COALESCE(value,'disk')) FROM (SELECT 'disk' AS value) t), 'disk')) WHEN 'db' THEN 'db' ELSE 'disk' END,
       NULL
FROM replies r
WHERE r.attachment_url IS NOT NULL AND r.attachment_url <> ''
ON DUPLICATE KEY UPDATE filename = VALUES(filename);


