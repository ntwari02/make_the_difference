CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  email VARCHAR(255) NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_user_id (user_id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notification_id INT NOT NULL,
  user_id INT NULL,
  email VARCHAR(255) NULL,
  admin_id INT NULL,
  subject VARCHAR(255) NOT NULL,
  status ENUM('active','closed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_notification_id (notification_id),
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_status (status),
  CONSTRAINT fk_conversations_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  CONSTRAINT fk_conversations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_conversations_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_type ENUM('user','admin') NOT NULL,
  sender_id INT NULL,
  sender_email VARCHAR(255) NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_sender_type (sender_type),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_replies_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);


