-- Spare Parts Database Schema
-- Advanced competitive features for automotive spare parts marketplace

-- Categories table for spare parts
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
    FOREIGN KEY (parent_id) REFERENCES spare_parts_categories(id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id),
    INDEX idx_active (is_active)
);

-- Brands table for spare parts manufacturers
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

-- Main spare parts table
CREATE TABLE IF NOT EXISTS spare_parts (
    id VARCHAR(36) PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category_id VARCHAR(36) NOT NULL,
    brand_id VARCHAR(36) NOT NULL,
    part_number VARCHAR(100),
    oem_number VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    cost_price DECIMAL(10,2),
    msrp DECIMAL(10,2), -- Manufacturer Suggested Retail Price
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_expires_at TIMESTAMP NULL,
    weight DECIMAL(8,2), -- in kg
    dimensions JSON, -- {length, width, height, unit}
    images JSON, -- Array of image URLs
    specifications JSON, -- Technical specifications
    features JSON, -- Key features array
    warranty_period INT, -- in months
    warranty_type ENUM('manufacturer', 'seller', 'extended') DEFAULT 'manufacturer',
    `condition` ENUM('new', 'refurbished', 'used', 'remanufactured') DEFAULT 'new',
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    max_stock_level INT DEFAULT 1000,
    is_digital BOOLEAN DEFAULT FALSE, -- For digital products like software
    is_installable BOOLEAN DEFAULT TRUE,
    installation_difficulty ENUM('easy', 'medium', 'hard', 'professional') DEFAULT 'medium',
    estimated_installation_time INT, -- in minutes
    installation_cost DECIMAL(8,2),
    shipping_weight DECIMAL(8,2),
    shipping_dimensions JSON,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    status ENUM('active', 'inactive', 'discontinued', 'pending') DEFAULT 'pending',
    seller_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES spare_parts_categories(id),
    FOREIGN KEY (brand_id) REFERENCES spare_parts_brands(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    INDEX idx_sku (sku),
    INDEX idx_category (category_id),
    INDEX idx_brand (brand_id),
    INDEX idx_seller (seller_id),
    INDEX idx_price (price),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured),
    INDEX idx_rating (rating),
    INDEX idx_stock (stock_quantity),
    INDEX idx_created (created_at),
    FULLTEXT idx_search (name, description, part_number, oem_number)
);

-- Vehicle compatibility table
CREATE TABLE IF NOT EXISTS spare_parts_vehicle_compatibility (
    id VARCHAR(36) PRIMARY KEY,
    spare_part_id VARCHAR(36) NOT NULL,
    vehicle_make VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_year_from INT NOT NULL,
    vehicle_year_to INT NOT NULL,
    engine_type VARCHAR(100),
    engine_size VARCHAR(50),
    fuel_type ENUM('gasoline', 'diesel', 'hybrid', 'electric', 'lpg', 'cng') NULL,
    transmission_type ENUM('manual', 'automatic', 'cvt', 'semi_automatic') NULL,
    body_type VARCHAR(50),
    trim_level VARCHAR(100),
    notes TEXT,
    compatibility_confidence DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
    INDEX idx_part (spare_part_id),
    INDEX idx_vehicle (vehicle_make, vehicle_model),
    INDEX idx_year (vehicle_year_from, vehicle_year_to),
    INDEX idx_engine (engine_type, engine_size),
    INDEX idx_compatibility (compatibility_confidence)
);

-- Inventory management table
CREATE TABLE IF NOT EXISTS spare_parts_inventory (
    id VARCHAR(36) PRIMARY KEY,
    spare_part_id VARCHAR(36) NOT NULL,
    warehouse_id VARCHAR(36) NOT NULL,
    quantity_available INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    quantity_on_order INT NOT NULL DEFAULT 0,
    reorder_point INT NOT NULL DEFAULT 5,
    reorder_quantity INT NOT NULL DEFAULT 10,
    last_restocked_at TIMESTAMP NULL,
    last_sold_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_part_warehouse (spare_part_id, warehouse_id),
    INDEX idx_part (spare_part_id),
    INDEX idx_warehouse (warehouse_id),
    INDEX idx_available (quantity_available),
    INDEX idx_reorder (reorder_point)
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    phone VARCHAR(20),
    email VARCHAR(100),
    manager_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (city, state, country),
    INDEX idx_active (is_active)
);

-- Price comparison table for competitive pricing
CREATE TABLE IF NOT EXISTS spare_parts_price_comparison (
    id VARCHAR(36) PRIMARY KEY,
    spare_part_id VARCHAR(36) NOT NULL,
    competitor_name VARCHAR(100) NOT NULL,
    competitor_url VARCHAR(500),
    competitor_price DECIMAL(10,2) NOT NULL,
    competitor_currency VARCHAR(3) DEFAULT 'USD',
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL,
    availability_status ENUM('in_stock', 'out_of_stock', 'limited', 'unknown') DEFAULT 'unknown',
    last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
    INDEX idx_part (spare_part_id),
    INDEX idx_competitor (competitor_name),
    INDEX idx_price (competitor_price),
    INDEX idx_checked (last_checked_at)
);

-- Spare parts bundles/packages
CREATE TABLE IF NOT EXISTS spare_parts_bundles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    bundle_type ENUM('maintenance_kit', 'upgrade_package', 'repair_kit', 'custom') DEFAULT 'custom',
    total_price DECIMAL(10,2) NOT NULL,
    bundle_discount DECIMAL(5,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    target_vehicle_make VARCHAR(50),
    target_vehicle_model VARCHAR(100),
    target_vehicle_year_from INT,
    target_vehicle_year_to INT,
    installation_included BOOLEAN DEFAULT FALSE,
    installation_cost DECIMAL(8,2),
    warranty_period INT, -- in months
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    seller_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    INDEX idx_seller (seller_id),
    INDEX idx_type (bundle_type),
    INDEX idx_vehicle (target_vehicle_make, target_vehicle_model),
    INDEX idx_status (status)
);

-- Bundle items table
CREATE TABLE IF NOT EXISTS spare_parts_bundle_items (
    id VARCHAR(36) PRIMARY KEY,
    bundle_id VARCHAR(36) NOT NULL,
    spare_part_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bundle_id) REFERENCES spare_parts_bundles(id) ON DELETE CASCADE,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id),
    UNIQUE KEY unique_bundle_part (bundle_id, spare_part_id),
    INDEX idx_bundle (bundle_id),
    INDEX idx_part (spare_part_id)
);

-- Installation services table
CREATE TABLE IF NOT EXISTS spare_parts_installation_services (
    id VARCHAR(36) PRIMARY KEY,
    spare_part_id VARCHAR(36) NOT NULL,
    service_provider_id VARCHAR(36) NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    service_description TEXT,
    base_price DECIMAL(8,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    estimated_duration INT NOT NULL, -- in minutes
    difficulty_level ENUM('easy', 'medium', 'hard', 'professional') NOT NULL,
    required_tools JSON, -- Array of required tools
    warranty_period INT, -- in months
    service_area_radius INT, -- in km
    is_mobile_service BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
    FOREIGN KEY (service_provider_id) REFERENCES users(id),
    INDEX idx_part (spare_part_id),
    INDEX idx_provider (service_provider_id),
    INDEX idx_active (is_active),
    INDEX idx_price (base_price)
);

-- Reviews and ratings for spare parts
CREATE TABLE IF NOT EXISTS spare_parts_reviews (
    id VARCHAR(36) PRIMARY KEY,
    spare_part_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NULL, -- Link to order for verified purchase
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    review_text TEXT,
    pros TEXT,
    cons TEXT,
    installation_rating INT CHECK (installation_rating >= 1 AND installation_rating <= 5),
    value_for_money_rating INT CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
    durability_rating INT CHECK (durability_rating >= 1 AND durability_rating <= 5),
    images JSON, -- Array of review images
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_helpful_count INT DEFAULT 0,
    is_not_helpful_count INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    INDEX idx_part (spare_part_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating),
    INDEX idx_status (status),
    INDEX idx_verified (is_verified_purchase),
    INDEX idx_created (created_at)
);

-- Wishlist for spare parts
CREATE TABLE IF NOT EXISTS spare_parts_wishlist (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    spare_part_id VARCHAR(36) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_part (user_id, spare_part_id),
    INDEX idx_user (user_id),
    INDEX idx_part (spare_part_id)
);

-- Price alerts for spare parts
CREATE TABLE IF NOT EXISTS spare_parts_price_alerts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    spare_part_id VARCHAR(36) NOT NULL,
    target_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    alert_type ENUM('price_drop', 'stock_available', 'both') DEFAULT 'price_drop',
    is_active BOOLEAN DEFAULT TRUE,
    last_alert_sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_part (spare_part_id),
    INDEX idx_active (is_active),
    INDEX idx_target_price (target_price)
);

-- Analytics and tracking
CREATE TABLE IF NOT EXISTS spare_parts_analytics (
    id VARCHAR(36) PRIMARY KEY,
    spare_part_id VARCHAR(36) NOT NULL,
    event_type ENUM('view', 'add_to_cart', 'purchase', 'review', 'share') NOT NULL,
    user_id VARCHAR(36) NULL,
    session_id VARCHAR(100),
    referrer_url VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    device_type ENUM('desktop', 'mobile', 'tablet') DEFAULT 'desktop',
    browser VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_part (spare_part_id),
    INDEX idx_event (event_type),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at),
    INDEX idx_country (country)
);

-- Insert sample data
INSERT INTO spare_parts_categories (id, name, description, parent_id, icon) VALUES
(UUID(), 'Engine Parts', 'Engine components and accessories', NULL, 'engine'),
(UUID(), 'Brake System', 'Brake pads, rotors, calipers, and related components', NULL, 'brake'),
(UUID(), 'Suspension', 'Shocks, struts, springs, and suspension components', NULL, 'suspension'),
(UUID(), 'Electrical', 'Batteries, alternators, starters, and electrical components', NULL, 'electrical'),
(UUID(), 'Body Parts', 'Bumpers, mirrors, lights, and exterior body components', NULL, 'body'),
(UUID(), 'Interior', 'Seats, dashboards, and interior components', NULL, 'interior'),
(UUID(), 'Filters', 'Oil, air, fuel, and cabin air filters', NULL, 'filter'),
(UUID(), 'Fluids', 'Oil, coolant, brake fluid, and other automotive fluids', NULL, 'fluid');

INSERT INTO spare_parts_brands (id, name, description, country, is_oem) VALUES
(UUID(), 'Bosch', 'German automotive parts manufacturer', 'Germany', FALSE),
(UUID(), 'Continental', 'German automotive supplier', 'Germany', FALSE),
(UUID(), 'Denso', 'Japanese automotive components manufacturer', 'Japan', FALSE),
(UUID(), 'Mann-Filter', 'German filter manufacturer', 'Germany', FALSE),
(UUID(), 'Brembo', 'Italian brake system manufacturer', 'Italy', FALSE),
(UUID(), 'Bilstein', 'German suspension manufacturer', 'Germany', FALSE),
(UUID(), 'Valeo', 'French automotive supplier', 'France', FALSE),
(UUID(), 'ZF', 'German automotive technology company', 'Germany', FALSE);
