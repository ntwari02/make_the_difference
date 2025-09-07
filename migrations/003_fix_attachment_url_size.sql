-- Fix attachment_url column size to handle long filenames
ALTER TABLE `replies` MODIFY COLUMN `attachment_url` TEXT NULL;
