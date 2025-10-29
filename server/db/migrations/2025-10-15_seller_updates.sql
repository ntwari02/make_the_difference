-- Seller Messages Integration - Database Updates
-- This migration ensures proper conversation and message structure for seller messaging

-- Create conversations table if it doesn't exist
-- This table groups messages between sellers and buyers
CREATE TABLE IF NOT EXISTS conversations (
  id CHAR(36) PRIMARY KEY,
  seller_id CHAR(36) NOT NULL,
  buyer_id CHAR(36) NOT NULL,
  subject VARCHAR(255) NULL,
  last_message_at TIMESTAMP NULL,
  last_message_id CHAR(36) NULL,
  seller_archived TINYINT(1) DEFAULT 0,
  buyer_archived TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_seller_id (seller_id),
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_seller_archived (seller_id, seller_archived),
  INDEX idx_buyer_archived (buyer_id, buyer_archived),
  INDEX idx_last_message_at (last_message_at),
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_conversation (seller_id, buyer_id, subject)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

