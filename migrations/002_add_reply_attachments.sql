-- Add attachment columns to replies table (idempotent via migration runner ignoring ER_DUP_FIELDNAME)
ALTER TABLE `replies` ADD COLUMN `attachment_url` TEXT NULL AFTER `message`;
ALTER TABLE `replies` ADD COLUMN `attachment_type` VARCHAR(255) NULL AFTER `attachment_url`;
ALTER TABLE `replies` ADD COLUMN `attachment_size` INT NULL AFTER `attachment_type`;

