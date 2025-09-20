-- =====================================================
-- AUTHENTICATION & SECURITY EXTENSIONS
-- =====================================================
-- This migration extends the existing schema with tables to support:
-- - OTP (email/SMS)
-- - TOTP-based MFA and backup codes
-- - WebAuthn security keys
-- - Social identity linking (OAuth providers)
-- - Login attempts and account lockout basics
-- - User devices/trusted devices
-- - Password history (for rotation/expiration policies)
-- - RBAC (roles/permissions) alongside existing users.role enum
-- - Privacy consents and account deletion workflow

-- Note: Follows existing conventions: id as VARCHAR(36) with UUID(),
-- timestamps with CURRENT_TIMESTAMP defaults, JSON usage where suitable,
-- and foreign keys referencing users(id) with ON DELETE CASCADE.

-- =====================================================
-- 1) OTP CODES (email/phone) FOR LOGIN/VERIFICATION/RESET
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_otp_codes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NULL,
    contact_type ENUM('email', 'phone') NOT NULL,
    contact_value VARCHAR(255) NOT NULL,
    channel ENUM('sms', 'email') NOT NULL,
    purpose ENUM('login', 'register', 'password_reset', 'email_verification', 'phone_verification', '2fa') NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    consumed_at TIMESTAMP NULL,
    attempt_count INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_contact_value (contact_value),
    INDEX idx_purpose (purpose),
    INDEX idx_expires_at (expires_at)
);

-- =====================================================
-- 2) TOTP MFA CONFIGURATION AND BACKUP CODES
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_totp (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    secret_encrypted VARCHAR(255) NOT NULL,
    issuer VARCHAR(100) DEFAULT 'Reaglex',
    label VARCHAR(255),
    is_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth_totp_backup_codes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_code (user_id, code_hash),
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- 3) WEBAUTHN / SECURITY KEYS (FIDO2/U2F)
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_webauthn_credentials (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    credential_id VARCHAR(255) NOT NULL,
    public_key TEXT NOT NULL,
    counter INT DEFAULT 0,
    transports JSON,
    aaguid VARCHAR(36),
    nickname VARCHAR(100),
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_credential_id (credential_id),
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- 4) SOCIAL IDENTITY LINKING (OAUTH PROVIDERS)
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_social_accounts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    provider ENUM('google','facebook','github','linkedin','apple','microsoft','twitter','discord','other') NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    access_token_hash VARCHAR(255),
    refresh_token_hash VARCHAR(255),
    scopes JSON,
    profile JSON,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sync_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_identity (provider, provider_user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_provider (provider)
);

-- =====================================================
-- 5) LOGIN ATTEMPTS & LOCKOUT SUPPORT
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_login_attempts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NULL,
    identifier VARCHAR(255) NOT NULL, -- email or phone used during attempt
    success BOOLEAN NOT NULL,
    failure_reason ENUM('invalid_credentials','locked','mfa_required','otp_invalid','otp_expired','unknown','blocked','rate_limited') NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    location JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_identifier (identifier),
    INDEX idx_success (success),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 6) USER DEVICES / TRUSTED DEVICES
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_devices (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    device_id VARCHAR(64) NOT NULL,
    device_name VARCHAR(255),
    device_fingerprint VARCHAR(255),
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP NULL,
    last_ip VARCHAR(45),
    is_trusted BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_device (user_id, device_id),
    INDEX idx_user_id (user_id),
    INDEX idx_last_seen (last_seen)
);

-- =====================================================
-- 7) PASSWORD HISTORY (FOR ROTATION/EXPIRATION POLICIES)
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_password_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 8) RBAC TABLES (COMPLEMENTING users.role ENUM)
-- =====================================================
CREATE TABLE IF NOT EXISTS rbac_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rbac_permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rbac_role_permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role_id VARCHAR(36) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
);

CREATE TABLE IF NOT EXISTS rbac_user_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
);

-- Seed default roles to mirror users.role enum for compatibility
INSERT INTO rbac_roles (id, name, description)
VALUES
    (UUID(), 'student', 'Default student role'),
    (UUID(), 'instructor', 'Course instructor role'),
    (UUID(), 'buyer', 'Marketplace buyer role'),
    (UUID(), 'seller', 'Marketplace seller role'),
    (UUID(), 'dealer', 'Car dealer role'),
    (UUID(), 'university', 'University provider role'),
    (UUID(), 'visa_officer', 'Visa officer role'),
    (UUID(), 'admin', 'Platform administrator role'),
    (UUID(), 'advertiser', 'Advertising account role')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- 9) PRIVACY CONSENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS privacy_consents (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    consent_type ENUM('privacy_policy','terms','marketing_emails','sms','data_processing') NOT NULL,
    policy_version VARCHAR(20) NOT NULL,
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMP NULL,
    revoked_at TIMESTAMP NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_consent_type (consent_type),
    INDEX idx_policy_version (policy_version)
);

-- =====================================================
-- 10) ACCOUNT DELETION REQUESTS
-- =====================================================
CREATE TABLE IF NOT EXISTS account_deletion_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    status ENUM('requested','in_progress','completed','cancelled') DEFAULT 'requested',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- =====================================================
-- END OF AUTHENTICATION & SECURITY EXTENSIONS
-- =====================================================


