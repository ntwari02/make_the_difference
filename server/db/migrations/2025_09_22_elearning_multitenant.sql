-- Multi-tenant support for E-learning

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo VARCHAR(500),
  settings JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
);

-- Organization members
CREATE TABLE IF NOT EXISTS organization_users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  organization_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  role ENUM('org_admin','instructor','learner') NOT NULL DEFAULT 'learner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_org_user (organization_id, user_id),
  INDEX idx_org (organization_id),
  INDEX idx_user (user_id),
  INDEX idx_role (role)
);

-- Link courses to organization (nullable for global courses)
ALTER TABLE courses ADD COLUMN organization_id VARCHAR(36) NULL;
CREATE INDEX idx_org_id ON courses (organization_id);
ALTER TABLE courses ADD CONSTRAINT fk_courses_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;


