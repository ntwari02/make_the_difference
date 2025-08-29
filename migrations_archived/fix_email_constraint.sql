-- Fix email constraint to allow multiple applications from same email for different scholarships
-- Remove the existing unique constraint on email_address
ALTER TABLE `scholarship_applications` DROP INDEX `email_address`;

-- Add a composite unique constraint on scholarship_id and email_address
-- This allows one application per email per scholarship, but multiple applications from same email for different scholarships
ALTER TABLE `scholarship_applications` ADD UNIQUE KEY `unique_scholarship_email` (`scholarship_id`, `email_address`);

-- Add a regular index on email_address for performance (not unique)
ALTER TABLE `scholarship_applications` ADD INDEX `idx_email_address` (`email_address`);
