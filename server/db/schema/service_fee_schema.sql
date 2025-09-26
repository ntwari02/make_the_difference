-- Service Fee Transactions Table
CREATE TABLE service_fee_transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    service_type ENUM('scholarship', 'visa', 'application', 'processing', 'consultation', 'document_review', 'expedited_processing') NOT NULL,
    service_id VARCHAR(36) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    fee_breakdown JSON NOT NULL,
    payment_method ENUM('stripe', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money', 'pending') DEFAULT 'pending',
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    external_transaction_id VARCHAR(255),
    payment_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_service_type (service_type),
    INDEX idx_service_id (service_id),
    INDEX idx_status (status),
    INDEX idx_payment_method (payment_method),
    INDEX idx_created_at (created_at)
);

-- Service Fee Configuration Table
CREATE TABLE service_fee_config (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    service_type ENUM('scholarship', 'visa', 'application', 'processing', 'consultation', 'document_review', 'expedited_processing') NOT NULL,
    fee_type ENUM('percentage', 'fixed', 'tiered') NOT NULL,
    base_rate DECIMAL(5,4) DEFAULT 0.0500, -- 5% default
    minimum_fee DECIMAL(10,2) DEFAULT 25.00,
    maximum_fee DECIMAL(10,2) DEFAULT 500.00,
    tier_config JSON, -- For tiered pricing
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effective_to TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_active_config (service_type, is_active, effective_from),
    INDEX idx_service_type (service_type),
    INDEX idx_is_active (is_active),
    INDEX idx_effective_from (effective_from)
);

-- Service Fee Discounts Table
CREATE TABLE service_fee_discounts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    discount_code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('percentage', 'fixed', 'free_service') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    service_types JSON, -- Array of service types this discount applies to
    minimum_amount DECIMAL(10,2) DEFAULT 0.00,
    maximum_discount DECIMAL(10,2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_to TIMESTAMP NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_discount_code (discount_code),
    INDEX idx_is_active (is_active),
    INDEX idx_valid_from (valid_from),
    INDEX idx_valid_to (valid_to)
);

-- Service Fee Discount Usage Table
CREATE TABLE service_fee_discount_usage (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    discount_id VARCHAR(36) NOT NULL,
    transaction_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (discount_id) REFERENCES service_fee_discounts(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES service_fee_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_discount_id (discount_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_used_at (used_at)
);

-- Insert default service fee configurations
INSERT INTO service_fee_config (service_type, fee_type, base_rate, minimum_fee, maximum_fee, currency) VALUES
('scholarship', 'percentage', 0.0500, 25.00, 500.00, 'USD'),
('visa', 'fixed', 0.0000, 30.00, 200.00, 'USD'),
('application', 'fixed', 0.0000, 15.00, 100.00, 'USD'),
('processing', 'fixed', 0.0000, 20.00, 150.00, 'USD'),
('consultation', 'fixed', 0.0000, 40.00, 200.00, 'USD'),
('document_review', 'fixed', 0.0000, 10.00, 100.00, 'USD'),
('expedited_processing', 'percentage', 0.3000, 50.00, 300.00, 'USD');

-- Insert sample discount codes
INSERT INTO service_fee_discounts (discount_code, discount_type, discount_value, service_types, minimum_amount, usage_limit, created_by) VALUES
('WELCOME20', 'percentage', 20.00, '["scholarship", "visa"]', 50.00, 1000, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
('FIRSTFREE', 'free_service', 0.00, '["application", "processing"]', 0.00, 500, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
('STUDENT10', 'percentage', 10.00, '["scholarship"]', 25.00, NULL, (SELECT id FROM users WHERE role = 'admin' LIMIT 1));
