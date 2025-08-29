-- Add category column to existing advertisements table (idempotent via migration runner)

-- First, ensure the category column exists
ALTER TABLE advertisements ADD COLUMN category VARCHAR(100) DEFAULT 'general';

-- Wait a moment to ensure the column is fully created
-- (This helps with some MySQL versions that need time to commit DDL)

-- Now add index (runner ignores ER_DUP_KEYNAME if it already exists)
CREATE INDEX idx_category ON advertisements(category);

-- Update existing records and sample data (only after column exists)
UPDATE advertisements SET category = 'general' WHERE category IS NULL;
UPDATE advertisements SET category = 'scholarship' WHERE title LIKE '%Scholarship%';
UPDATE advertisements SET category = 'education' WHERE title LIKE '%Guide%';
UPDATE advertisements SET category = 'testimonials' WHERE title LIKE '%Success Stories%';
