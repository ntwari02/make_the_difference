-- Add status column to partners table
ALTER TABLE `partners` ADD COLUMN `status` ENUM('new', 'approved', 'rejected') DEFAULT 'new' AFTER `message`;
