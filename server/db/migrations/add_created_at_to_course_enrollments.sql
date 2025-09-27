-- Migration: Add created_at and updated_at columns to course_enrollments table
-- Date: 2024-12-19
-- Description: Fix missing created_at and updated_at columns in course_enrollments table

-- Add created_at column
ALTER TABLE course_enrollments 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column
ALTER TABLE course_enrollments 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing records to have proper timestamps
UPDATE course_enrollments 
SET created_at = enrollment_date 
WHERE created_at IS NULL;

-- Add indexes for the new columns
CREATE INDEX idx_course_enrollments_created_at ON course_enrollments(created_at);
CREATE INDEX idx_course_enrollments_updated_at ON course_enrollments(updated_at);
