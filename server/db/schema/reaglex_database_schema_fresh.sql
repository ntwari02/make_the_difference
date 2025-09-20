-- =====================================================
-- REAGLEX PLATFORM - FRESH DATABASE SCHEMA
-- =====================================================
-- This SQL file drops existing tables and creates fresh ones

-- Drop all existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS platform_analytics;
DROP TABLE IF EXISTS user_activity_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS ad_analytics;
DROP TABLE IF EXISTS ad_placements;
DROP TABLE IF EXISTS ad_creatives;
DROP TABLE IF EXISTS ad_campaigns;
DROP TABLE IF EXISTS advertisers;
DROP TABLE IF EXISTS visa_applications;
DROP TABLE IF EXISTS visa_services;
DROP TABLE IF EXISTS scholarship_applications;
DROP TABLE IF EXISTS scholarships;
DROP TABLE IF EXISTS course_favorites;
DROP TABLE IF EXISTS course_reviews;
DROP TABLE IF EXISTS course_progress;
DROP TABLE IF EXISTS course_enrollments;
DROP TABLE IF EXISTS course_lessons;
DROP TABLE IF EXISTS course_modules;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS car_favorites;
DROP TABLE IF EXISTS car_reviews;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS dealers;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS system_settings;

-- =====================================================
-- 1. CORE USER MANAGEMENT TABLES
-- =====================================================

-- Users table (main user accounts)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    nationality VARCHAR(100),
    profile_image VARCHAR(500),
    role ENUM('student', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'admin', 'advertiser') NOT NULL DEFAULT 'student',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    preferences JSON DEFAULT ('{"language": "en", "currency": "USD", "notifications": {"email": true, "sms": true, "push": true}}'),
    address JSON,
    social_links JSON,
    bio TEXT,
    skills JSON,
    education JSON,
    work_experience JSON,
    verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_verified (is_verified),
    INDEX idx_active (is_active)
);

-- User sessions for JWT management
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- =====================================================
-- 2. E-COMMERCE MODULE TABLES
-- =====================================================

-- Dealers table
CREATE TABLE dealers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_name VARCHAR(255) NOT NULL,
    business_type ENUM('dealership', 'private_seller', 'auction_house', 'rental_company') NOT NULL,
    license_number VARCHAR(100),
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    website VARCHAR(255),
    logo VARCHAR(500),
    images JSON,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSON,
    business_hours JSON,
    services JSON,
    status ENUM('active', 'inactive', 'suspended', 'pending_verification') DEFAULT 'pending_verification',
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_business_name (business_name),
    INDEX idx_city_state (city, state),
    INDEX idx_verified (is_verified),
    INDEX idx_status (status),
    INDEX idx_user_id (user_id)
);

-- Cars table
CREATE TABLE cars (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    mileage INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    car_condition ENUM('new', 'used', 'certified') NOT NULL,
    fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng') NOT NULL,
    transmission ENUM('manual', 'automatic', 'semi-automatic') NOT NULL,
    body_type ENUM('sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van') NOT NULL,
    color VARCHAR(50) NOT NULL,
    engine_size VARCHAR(20),
    horsepower INT,
    vin VARCHAR(17) UNIQUE,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    images JSON,
    features JSON,
    status ENUM('active', 'sold', 'pending', 'draft') DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    seller_id VARCHAR(36) NOT NULL,
    dealer_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE SET NULL,
    INDEX idx_brand_model (brand, model),
    INDEX idx_price (price),
    INDEX idx_year (year),
    INDEX idx_location (location),
    INDEX idx_status (status),
    INDEX idx_seller_id (seller_id)
);

-- Car reviews
CREATE TABLE car_reviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    car_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_car_user_review (car_id, user_id),
    INDEX idx_car_id (car_id),
    INDEX idx_user_id (user_id)
);

-- Car favorites/wishlist
CREATE TABLE car_favorites (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    car_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_car_favorite (user_id, car_id),
    INDEX idx_user_id (user_id),
    INDEX idx_car_id (car_id)
);

-- =====================================================
-- 3. E-LEARNING MODULE TABLES
-- =====================================================

-- Courses table
CREATE TABLE courses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
    language VARCHAR(50) DEFAULT 'English',
    duration_hours INT NOT NULL,
    thumbnail VARCHAR(500),
    preview_video VARCHAR(500),
    syllabus JSON,
    requirements JSON,
    learning_outcomes JSON,
    tags JSON,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    student_count INT DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'pending_review', 'approved', 'rejected', 'published') DEFAULT 'draft',
    instructor_id VARCHAR(36) NOT NULL,
    completion_certificate BOOLEAN DEFAULT TRUE,
    has_live_classes BOOLEAN DEFAULT FALSE,
    live_class_schedule JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_title (title),
    INDEX idx_category_subcategory (category, subcategory),
    INDEX idx_level (level),
    INDEX idx_price (price),
    INDEX idx_rating (rating),
    INDEX idx_published (is_published),
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_status (status)
);

-- Course modules/lessons
CREATE TABLE course_modules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    duration_minutes INT,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_order (course_id, order_index)
);

-- Course lessons/content
CREATE TABLE course_lessons (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    module_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_type ENUM('video', 'text', 'quiz', 'assignment', 'live') NOT NULL,
    content_url VARCHAR(500),
    content_text TEXT,
    duration_minutes INT,
    order_index INT NOT NULL,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    INDEX idx_module_id (module_id),
    INDEX idx_order (module_id, order_index)
);

-- Course enrollments
CREATE TABLE course_enrollments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(500),
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course_user_enrollment (course_id, user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_completed (is_completed)
);

-- Course progress tracking
CREATE TABLE course_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    enrollment_id VARCHAR(36) NOT NULL,
    lesson_id VARCHAR(36) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    time_spent_minutes INT DEFAULT 0,
    last_position_seconds INT DEFAULT 0,
    
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment_lesson (enrollment_id, lesson_id),
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_lesson_id (lesson_id)
);

-- Course reviews
CREATE TABLE course_reviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course_user_review (course_id, user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_user_id (user_id)
);

-- Course favorites
CREATE TABLE course_favorites (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_course_favorite (user_id, course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id)
);

-- =====================================================
-- 4. SCHOLARSHIPS & VISA MODULE TABLES
-- =====================================================

-- Scholarships table
CREATE TABLE scholarships (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    provider_type ENUM('university', 'government', 'private_organization', 'foundation', 'corporation') NOT NULL,
    amount DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    amount_type ENUM('fixed', 'partial', 'full', 'variable') NOT NULL,
    country VARCHAR(100) NOT NULL,
    university VARCHAR(255),
    degree_level ENUM('undergraduate', 'graduate', 'phd', 'diploma', 'certificate', 'any') NOT NULL,
    field_of_study JSON,
    application_deadline DATE NOT NULL,
    start_date DATE,
    duration_months INT,
    eligibility_criteria JSON,
    required_documents JSON,
    application_process TEXT,
    website_url VARCHAR(500),
    contact_email VARCHAR(255),
    tags JSON,
    is_merit_based BOOLEAN DEFAULT FALSE,
    is_need_based BOOLEAN DEFAULT FALSE,
    is_athletic BOOLEAN DEFAULT FALSE,
    is_artistic BOOLEAN DEFAULT FALSE,
    gpa_requirement DECIMAL(3,2),
    language_requirements JSON,
    nationality_restrictions JSON,
    age_limit_min INT,
    age_limit_max INT,
    application_fee DECIMAL(10,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'expired', 'draft') DEFAULT 'active',
    provider_id VARCHAR(36) NOT NULL,
    application_count INT DEFAULT 0,
    max_applications INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_title (title),
    INDEX idx_country (country),
    INDEX idx_degree_level (degree_level),
    INDEX idx_amount (amount),
    INDEX idx_application_deadline (application_deadline),
    INDEX idx_provider_id (provider_id),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured)
);

-- Scholarship applications
CREATE TABLE scholarship_applications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    scholarship_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    application_data JSON NOT NULL,
    documents JSON,
    status ENUM('draft', 'submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(36),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_scholarship_user_application (scholarship_id, user_id),
    INDEX idx_scholarship_id (scholarship_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Visa services table
CREATE TABLE visa_services (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    country VARCHAR(100) NOT NULL,
    visa_type ENUM('tourist', 'student', 'work', 'business', 'transit', 'family', 'refugee', 'other') NOT NULL,
    duration_days INT,
    processing_time_days INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    requirements JSON,
    required_documents JSON,
    application_process TEXT,
    fees_breakdown JSON,
    validity_period VARCHAR(100),
    entry_type ENUM('single', 'multiple', 'double') NOT NULL,
    is_urgent_processing BOOLEAN DEFAULT FALSE,
    urgent_processing_fee DECIMAL(10,2),
    is_refundable BOOLEAN DEFAULT FALSE,
    refund_policy TEXT,
    success_rate DECIMAL(5,2),
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    provider_id VARCHAR(36) NOT NULL,
    application_count INT DEFAULT 0,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_country (country),
    INDEX idx_visa_type (visa_type),
    INDEX idx_price (price),
    INDEX idx_processing_time (processing_time_days),
    INDEX idx_provider_id (provider_id),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured)
);

-- Visa applications
CREATE TABLE visa_applications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    visa_service_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    application_data JSON NOT NULL,
    documents JSON,
    status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(36),
    review_notes TEXT,
    appointment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (visa_service_id) REFERENCES visa_services(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_visa_user_application (visa_service_id, user_id),
    INDEX idx_visa_service_id (visa_service_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- =====================================================
-- 5. ADVERTISING MODULE TABLES
-- =====================================================

-- Advertisers table
CREATE TABLE advertisers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_name VARCHAR(255) NOT NULL,
    business_type ENUM('company', 'agency', 'individual', 'nonprofit') NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    business_address TEXT,
    website VARCHAR(255),
    tax_id VARCHAR(100),
    status ENUM('pending', 'approved', 'suspended', 'rejected') DEFAULT 'pending',
    credit_balance DECIMAL(10,2) DEFAULT 0.00,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_business_name (business_name),
    INDEX idx_status (status),
    INDEX idx_user_id (user_id)
);

-- Ad campaigns
CREATE TABLE ad_campaigns (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    advertiser_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    budget DECIMAL(10,2) NOT NULL,
    daily_budget DECIMAL(10,2),
    bid_type ENUM('cpc', 'cpm', 'cpa') NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    status ENUM('draft', 'active', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    target_audience JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (advertiser_id) REFERENCES advertisers(id) ON DELETE CASCADE,
    INDEX idx_advertiser_id (advertiser_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- Ad creatives
CREATE TABLE ad_creatives (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    campaign_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    ad_type ENUM('banner', 'video', 'sponsored_listing', 'popup', 'interstitial') NOT NULL,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    click_url VARCHAR(500) NOT NULL,
    dimensions VARCHAR(20),
    file_size INT,
    duration_seconds INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_ad_type (ad_type),
    INDEX idx_active (is_active)
);

-- Ad placements
CREATE TABLE ad_placements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    placement_type ENUM('homepage_banner', 'sidebar', 'search_results', 'course_video', 'car_listing', 'scholarship_page', 'popup', 'interstitial') NOT NULL,
    position VARCHAR(100),
    dimensions VARCHAR(20),
    max_file_size INT,
    allowed_ad_types JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_placement_type (placement_type),
    INDEX idx_active (is_active)
);

-- Ad impressions and clicks
CREATE TABLE ad_analytics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    creative_id VARCHAR(36) NOT NULL,
    campaign_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    placement_id VARCHAR(36),
    event_type ENUM('impression', 'click', 'conversion') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    cost DECIMAL(10,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (creative_id) REFERENCES ad_creatives(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (placement_id) REFERENCES ad_placements(id) ON DELETE SET NULL,
    INDEX idx_creative_id (creative_id),
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 6. PAYMENT & TRANSACTION TABLES
-- =====================================================

-- Payment methods
CREATE TABLE payment_methods (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type ENUM('stripe', 'paypal', 'mobile_money', 'crypto', 'bank_transfer') NOT NULL,
    provider VARCHAR(100) NOT NULL,
    account_details JSON NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_active (is_active)
);

-- Transactions
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type ENUM('course_purchase', 'car_purchase', 'scholarship_application', 'visa_application', 'ad_spend', 'refund', 'withdrawal') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_method_id VARCHAR(36),
    external_transaction_id VARCHAR(255),
    description TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 7. MESSAGING & COMMUNICATION TABLES
-- =====================================================

-- Chat conversations
CREATE TABLE conversations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    type ENUM('direct', 'group', 'support') NOT NULL,
    title VARCHAR(255),
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_last_message (last_message_at)
);

-- Conversation participants
CREATE TABLE conversation_participants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_conversation_user (conversation_id, user_id),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_user_id (user_id)
);

-- Messages
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    file_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 8. NOTIFICATIONS & ALERTS TABLES
-- =====================================================

-- Notifications
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type ENUM('email', 'sms', 'push', 'in_app') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_read (is_read),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 9. ANALYTICS & REPORTING TABLES
-- =====================================================

-- User activity logs
CREATE TABLE user_activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(36),
    metadata JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Platform analytics
CREATE TABLE platform_analytics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    dimensions JSON,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_metric_name (metric_name),
    INDEX idx_date (date),
    UNIQUE KEY unique_metric_date_dimensions (metric_name, date, dimensions(100))
);

-- =====================================================
-- 10. SYSTEM CONFIGURATION TABLES
-- =====================================================

-- System settings
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_key_name (key_name),
    INDEX idx_public (is_public)
);

-- =====================================================
-- 11. INSERT DEFAULT DATA
-- =====================================================

-- Insert default ad placements
INSERT INTO ad_placements (id, name, description, placement_type, position, dimensions, max_file_size, allowed_ad_types) VALUES
(UUID(), 'Homepage Banner', 'Top banner on homepage', 'homepage_banner', 'top', '1200x300', 500000, '["banner"]'),
(UUID(), 'Sidebar Banner', 'Right sidebar banner', 'sidebar', 'right', '300x250', 200000, '["banner"]'),
(UUID(), 'Search Results Banner', 'Banner in search results', 'search_results', 'top', '728x90', 300000, '["banner"]'),
(UUID(), 'Course Video Pre-roll', 'Video ad before course content', 'course_video', 'pre-roll', '1280x720', 10000000, '["video"]'),
(UUID(), 'Car Listing Banner', 'Banner on car listing pages', 'car_listing', 'top', '728x90', 300000, '["banner"]'),
(UUID(), 'Scholarship Page Banner', 'Banner on scholarship pages', 'scholarship_page', 'top', '728x90', 300000, '["banner"]');

-- Insert default system settings
INSERT INTO system_settings (id, key_name, value, data_type, description, is_public) VALUES
(UUID(), 'platform_name', 'Reaglex', 'string', 'Platform name', TRUE),
(UUID(), 'platform_description', 'Unified Platform for E-commerce, E-learning, and Scholarships & Visa Services', 'string', 'Platform description', TRUE),
(UUID(), 'default_currency', 'USD', 'string', 'Default currency', TRUE),
(UUID(), 'default_language', 'en', 'string', 'Default language', TRUE),
(UUID(), 'max_file_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', FALSE),
(UUID(), 'ad_revenue_share', '0.30', 'number', 'Platform revenue share from ads (30%)', FALSE),
(UUID(), 'course_revenue_share', '0.20', 'number', 'Platform revenue share from courses (20%)', FALSE),
(UUID(), 'maintenance_mode', 'false', 'boolean', 'Platform maintenance mode', TRUE);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
