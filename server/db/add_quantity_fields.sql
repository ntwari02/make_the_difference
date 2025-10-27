-- Simple SQL to add quantity and total price fields to cars table

ALTER TABLE cars ADD COLUMN quantity INT DEFAULT 1;
ALTER TABLE cars ADD COLUMN total_price DECIMAL(12,2) DEFAULT 0;
ALTER TABLE cars ADD COLUMN number_of_seats INT DEFAULT 5;

-- Add indexes
ALTER TABLE cars ADD INDEX idx_quantity (quantity);
ALTER TABLE cars ADD INDEX idx_total_price (total_price);
ALTER TABLE cars ADD INDEX idx_number_of_seats (number_of_seats);

