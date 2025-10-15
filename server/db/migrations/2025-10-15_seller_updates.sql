-- Normalize existing values to UI labels first (prevents enum duplicate errors)
ALTER TABLE sellers
  MODIFY COLUMN business_type VARCHAR(50) NULL;

-- Map legacy/lowercase to UI labels
UPDATE sellers SET business_type = 'Dealership'          WHERE business_type IN ('dealership','dealer');
UPDATE sellers SET business_type = 'Independent Seller'  WHERE business_type IN ('individual','independent','private','Independent seller','independent seller');
UPDATE sellers SET business_type = 'Auto Broker'         WHERE business_type IN ('broker','car broker','auto broker');
UPDATE sellers SET business_type = 'Car Rental'          WHERE business_type IN ('car rental','rental');
UPDATE sellers SET business_type = 'Fleet Management'    WHERE business_type IN ('fleet management','fleet');
UPDATE sellers SET business_type = 'Parts Dealer'        WHERE business_type IN ('parts dealer','parts');
UPDATE sellers SET business_type = 'Service Center'      WHERE business_type IN ('service center','service');

-- Fallback any unknowns/nulls to a default UI label
UPDATE sellers
SET business_type = 'Independent Seller'
WHERE business_type IS NULL
   OR business_type NOT IN (
     'Independent Seller','Dealership','Auto Broker','Car Rental',
     'Fleet Management','Parts Dealer','Service Center'
   );

-- Recreate the enum with ONLY the UI labels (no lowercase duplicates)
ALTER TABLE sellers
  MODIFY COLUMN business_type ENUM(
    'Independent Seller','Dealership','Auto Broker','Car Rental',
    'Fleet Management','Parts Dealer','Service Center'
  ) DEFAULT 'Independent Seller';