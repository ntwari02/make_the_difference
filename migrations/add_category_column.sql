-- Add category column to existing advertisements table
USE mbappe;

-- Add category column if it doesn't exist
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general';

-- Add index for category if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_category ON advertisements(category);

-- Update existing records with default category
UPDATE advertisements SET category = 'general' WHERE category IS NULL;

-- Update sample data with specific categories
UPDATE advertisements SET category = 'scholarship' WHERE title LIKE '%Scholarship%';
UPDATE advertisements SET category = 'education' WHERE title LIKE '%Guide%';
UPDATE advertisements SET category = 'testimonials' WHERE title LIKE '%Success Stories%';
