-- =====================================================
-- ORDERS TABLE FOR E-COMMERCE MODULE
-- =====================================================
-- Supports both car orders and spare parts orders

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id VARCHAR(36) NOT NULL,
    seller_id VARCHAR(36) NOT NULL,
    
    -- Order details
    item_type ENUM('car', 'spare_part', 'mixed') NOT NULL DEFAULT 'car',
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment info
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(255),
    payment_date TIMESTAMP NULL,
    
    -- Shipping/Delivery
    delivery_method ENUM('pickup', 'delivery', 'ship') DEFAULT 'pickup',
    delivery_address JSON,
    delivery_date TIMESTAMP NULL,
    tracking_number VARCHAR(100),
    
    -- Order status
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'completed') DEFAULT 'pending',
    
    -- Messages/Notes
    buyer_notes TEXT,
    seller_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at),
    INDEX idx_item_type (item_type)
);

-- Order items (supports multiple items per order)
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,  -- References car_id or spare_part_id
    item_type ENUM('car', 'spare_part') NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    
    -- Optional fields
    item_name VARCHAR(255),
    item_image VARCHAR(500),
    item_sku VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_item_id (item_id),
    INDEX idx_item_type (item_type)
);

-- Order status history (audit trail)
CREATE TABLE IF NOT EXISTS order_status_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(36),
    changed_by_type ENUM('buyer', 'seller', 'admin', 'system') DEFAULT 'system',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
);

