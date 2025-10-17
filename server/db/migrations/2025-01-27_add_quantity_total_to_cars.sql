-- Migration: Add quantity and total_price fields to cars table
-- Date: 2025-01-27
-- Description: Adds quantity and total_price fields to support bulk car listings

-- Add quantity field (default to 1 for existing records)
ALTER TABLE cars ADD COLUMN quantity INT NOT NULL DEFAULT 1;

-- Add total_price field (calculated field, default to price for existing records)
ALTER TABLE cars ADD COLUMN total_price DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Update existing records to set total_price = price * quantity
UPDATE cars SET total_price = price * quantity WHERE total_price = 0;

-- Add indexes for better query performance
CREATE INDEX idx_cars_quantity ON cars(quantity);
CREATE INDEX idx_cars_total_price ON cars(total_price);
