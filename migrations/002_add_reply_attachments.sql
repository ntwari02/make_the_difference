-- Add attachment columns to replies table (safe version)
-- Check and add missing columns only
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'railway' 
   AND TABLE_NAME = 'replies' 
   AND COLUMN_NAME = 'attachment_url') = 0,
  'ALTER TABLE `replies` ADD COLUMN `attachment_url` TEXT NULL AFTER `message`',
  'ALTER TABLE `replies` MODIFY COLUMN `attachment_url` TEXT NULL'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'railway' 
   AND TABLE_NAME = 'replies' 
   AND COLUMN_NAME = 'attachment_type') = 0,
  'ALTER TABLE `replies` ADD COLUMN `attachment_type` VARCHAR(255) NULL AFTER `attachment_url`',
  'SELECT "attachment_type column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'railway' 
   AND TABLE_NAME = 'replies' 
   AND COLUMN_NAME = 'attachment_size') = 0,
  'ALTER TABLE `replies` ADD COLUMN `attachment_size` INT NULL AFTER `attachment_type`',
  'SELECT "attachment_size column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


