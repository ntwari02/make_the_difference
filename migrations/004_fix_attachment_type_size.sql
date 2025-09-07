-- Fix attachment_type column size to handle MIME types
ALTER TABLE `replies` MODIFY COLUMN `attachment_type` VARCHAR(255) NULL;
