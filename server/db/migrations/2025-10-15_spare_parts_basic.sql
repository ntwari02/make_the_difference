-- Basic spare parts tables and sample data
-- Create categories table
CREATE TABLE IF NOT EXISTS spare_parts_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id VARCHAR(36) NULL,
    image_url VARCHAR(500),
    icon VARCHAR(100),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent_id (parent_id),
    INDEX idx_active (is_active)
);

-- Create brands table
CREATE TABLE IF NOT EXISTS spare_parts_brands (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    logo_url VARCHAR(500),
    website VARCHAR(200),
    country VARCHAR(100),
    is_oem BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_oem (is_oem),
    INDEX idx_active (is_active)
);

-- Insert sample categories
INSERT IGNORE INTO spare_parts_categories (id, name, description, parent_id, icon) VALUES
('cat-001', 'Engine Parts', 'Engine components and accessories', NULL, 'engine'),
('cat-002', 'Brake System', 'Brake pads, rotors, calipers, and related components', NULL, 'brake'),
('cat-003', 'Suspension', 'Shocks, struts, springs, and suspension components', NULL, 'suspension'),
('cat-004', 'Electrical', 'Batteries, alternators, starters, and electrical components', NULL, 'electrical'),
('cat-005', 'Body Parts', 'Bumpers, mirrors, lights, and exterior body components', NULL, 'body'),
('cat-006', 'Interior', 'Seats, dashboards, and interior components', NULL, 'interior'),
('cat-007', 'Filters', 'Oil, air, fuel, and cabin air filters', NULL, 'filter'),
('cat-008', 'Fluids', 'Oil, coolant, brake fluid, and other automotive fluids', NULL, 'fluid');

-- Insert sample brands
INSERT IGNORE INTO spare_parts_brands (id, name, description, country, is_oem) VALUES
('brand-001', 'Bosch', 'German automotive parts manufacturer', 'Germany', FALSE),
('brand-002', 'Continental', 'German automotive supplier', 'Germany', FALSE),
('brand-003', 'Denso', 'Japanese automotive components manufacturer', 'Japan', FALSE),
('brand-004', 'Mann-Filter', 'German filter manufacturer', 'Germany', FALSE),
('brand-005', 'Brembo', 'Italian brake system manufacturer', 'Italy', FALSE),
('brand-006', 'Bilstein', 'German suspension manufacturer', 'Germany', FALSE),
('brand-007', 'Valeo', 'French automotive supplier', 'France', FALSE),
('brand-008', 'ZF', 'German automotive technology company', 'Germany', FALSE),
('brand-009', 'Delphi', 'American automotive parts manufacturer', 'USA', FALSE),
('brand-010', 'Magneti Marelli', 'Italian automotive components manufacturer', 'Italy', FALSE);
