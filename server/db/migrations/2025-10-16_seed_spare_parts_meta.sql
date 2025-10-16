-- Seed spare parts categories and brands if missing

-- Categories
INSERT INTO spare_parts_categories (id, name, description)
SELECT UUID(), 'Engine Parts', 'Engine components and accessories'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_categories WHERE name = 'Engine Parts');

INSERT INTO spare_parts_categories (id, name, description)
SELECT UUID(), 'Brake System', 'Brake pads, rotors, calipers, and related components'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_categories WHERE name = 'Brake System');

INSERT INTO spare_parts_categories (id, name, description)
SELECT UUID(), 'Suspension', 'Shocks, struts, springs, and suspension components'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_categories WHERE name = 'Suspension');

INSERT INTO spare_parts_categories (id, name, description)
SELECT UUID(), 'Electrical', 'Alternators, starters, batteries, wiring'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_categories WHERE name = 'Electrical');

INSERT INTO spare_parts_categories (id, name, description)
SELECT UUID(), 'Cooling System', 'Radiators, water pumps, thermostats'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_categories WHERE name = 'Cooling System');

INSERT INTO spare_parts_categories (id, name, description)
SELECT UUID(), 'Exhaust', 'Mufflers, catalytic converters, pipes'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_categories WHERE name = 'Exhaust');

INSERT INTO spare_parts_categories (id, name, description)
SELECT UUID(), 'Filters', 'Oil, air, fuel, cabin filters'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_categories WHERE name = 'Filters');

INSERT INTO spare_parts_categories (id, name, description)
SELECT UUID(), 'Body & Interior', 'Body parts, trims, interior accessories'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_categories WHERE name = 'Body & Interior');

-- Brands
INSERT INTO spare_parts_brands (id, name, description)
SELECT UUID(), 'Bosch', 'German automotive parts manufacturer'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_brands WHERE name = 'Bosch');

INSERT INTO spare_parts_brands (id, name, description)
SELECT UUID(), 'Continental', 'German automotive supplier'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_brands WHERE name = 'Continental');

INSERT INTO spare_parts_brands (id, name, description)
SELECT UUID(), 'Denso', 'Japanese automotive components manufacturer'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_brands WHERE name = 'Denso');

INSERT INTO spare_parts_brands (id, name, description)
SELECT UUID(), 'NGK', 'Ignition and sensors'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_brands WHERE name = 'NGK');

INSERT INTO spare_parts_brands (id, name, description)
SELECT UUID(), 'Delphi', 'Fuel systems and electronics'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_brands WHERE name = 'Delphi');

INSERT INTO spare_parts_brands (id, name, description)
SELECT UUID(), 'ACDelco', 'GM genuine parts'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_brands WHERE name = 'ACDelco');

INSERT INTO spare_parts_brands (id, name, description)
SELECT UUID(), 'Brembo', 'High-performance braking systems'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_brands WHERE name = 'Brembo');

INSERT INTO spare_parts_brands (id, name, description)
SELECT UUID(), 'Magneti Marelli', 'Electronics and lighting'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_brands WHERE name = 'Magneti Marelli');

INSERT INTO spare_parts_brands (id, name, description)
SELECT UUID(), 'Valeo', 'Thermal systems and lighting'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_brands WHERE name = 'Valeo');

INSERT INTO spare_parts_brands (id, name, description)
SELECT UUID(), 'Mann-Filter', 'Filters'
WHERE NOT EXISTS (SELECT 1 FROM spare_parts_brands WHERE name = 'Mann-Filter');


