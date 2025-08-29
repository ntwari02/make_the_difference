-- Create help_requests table if missing
CREATE TABLE IF NOT EXISTS `help_requests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `message` TEXT,
  `status` ENUM('pending','active','resolved') DEFAULT 'pending',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


