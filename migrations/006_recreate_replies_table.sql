-- Recreate replies table with proper column sizes for attachments
CREATE TABLE IF NOT EXISTS `replies` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_type ENUM('user', 'admin') NOT NULL,
  sender_id INT NULL,
  sender_email VARCHAR(255) NULL,
  sender_name VARCHAR(255) NULL,
  message TEXT NULL,
  attachment_url TEXT NULL,
  attachment_type VARCHAR(255) NULL,
  attachment_size INT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_replies_conversation (conversation_id),
  INDEX idx_replies_sender (sender_id),
  INDEX idx_replies_created (created_at)
);
