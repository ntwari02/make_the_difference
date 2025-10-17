-- Migration: Add number_of_seats field to cars table
-- Date: 2025-01-27
-- Description: Adds number_of_seats field to store seating capacity of vehicles

-- Add number_of_seats field (default to 5 for existing records)
ALTER TABLE cars ADD COLUMN number_of_seats INT NOT NULL DEFAULT 5;

-- Add index for better query performance
CREATE INDEX idx_cars_number_of_seats ON cars(number_of_seats);

-- Add check constraint to ensure number_of_seats is positive
ALTER TABLE cars ADD CONSTRAINT chk_cars_number_of_seats_positive CHECK (number_of_seats > 0);
