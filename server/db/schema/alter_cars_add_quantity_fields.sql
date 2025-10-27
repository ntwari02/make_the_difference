-- =====================================================
-- ALTER CARS TABLE - ADD QUANTITY AND TOTAL PRICE FIELDS
-- =====================================================

-- Add quantity field (how many units of this car are available)
ALTER TABLE cars ADD COLUMN quantity INT DEFAULT 1 AFTER price;

-- Add number_of_seats field (for vehicle capacity)
ALTER TABLE cars ADD COLUMN number_of_seats INT DEFAULT 5 AFTER body_type;

-- Add total_price field (regular decimal field - will be calculated and saved by backend)
ALTER TABLE cars ADD COLUMN total_price DECIMAL(12,2) DEFAULT 0 AFTER quantity;

-- Add indexes
ALTER TABLE cars ADD INDEX idx_quantity (quantity);
ALTER TABLE cars ADD INDEX idx_total_price (total_price);
ALTER TABLE cars ADD INDEX idx_number_of_seats (number_of_seats);
