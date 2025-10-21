-- Seller Updates Migration - 2025-10-15
-- This migration adds performance indexes and seller-specific features

-- Add indexes for cars table performance optimization
CREATE INDEX idx_cars_seller_created ON cars(seller_id, created_at);
CREATE INDEX idx_cars_seller_status ON cars(seller_id, status);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_created_at ON cars(created_at);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_cars_views_count ON cars(views_count);

-- Add indexes for messaging performance optimization
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX idx_messages_conversation_sender ON messages(conversation_id, sender_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_category ON messages(category);
CREATE INDEX idx_messages_priority ON messages(priority);
CREATE INDEX idx_conversations_subject ON conversations(subject);
CREATE INDEX idx_conversation_participants_user_left ON conversation_participants(user_id, left_at);
CREATE INDEX idx_conversation_participants_conversation_user_left ON conversation_participants(conversation_id, user_id, left_at);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_conversation_read ON messages(conversation_id, is_read);

-- Add seller-specific columns if they don't exist
ALTER TABLE cars ADD COLUMN views_count INT DEFAULT 0;
ALTER TABLE cars ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

-- Add seller analytics columns
ALTER TABLE cars ADD COLUMN last_viewed_at TIMESTAMP NULL;
ALTER TABLE cars ADD COLUMN featured_until TIMESTAMP NULL;

-- Add seller inventory management columns
ALTER TABLE cars ADD COLUMN inventory_status ENUM('in_stock', 'reserved', 'sold', 'removed') DEFAULT 'in_stock';
ALTER TABLE cars ADD COLUMN reserve_expires_at TIMESTAMP NULL;
ALTER TABLE cars ADD COLUMN reserve_user_id VARCHAR(36) NULL;

-- Add foreign key for reserve user
ALTER TABLE cars ADD CONSTRAINT fk_cars_reserve_user FOREIGN KEY (reserve_user_id) REFERENCES users(id) ON DELETE SET NULL;
