-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    permission_id INT PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT,
    permission_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT,
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
('admin', 'Full system administrator with all permissions'),
('manager', 'Scholarship manager with limited administrative access'),
('user', 'Regular user with basic access')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert default permissions
INSERT INTO permissions (permission_name, description, category) VALUES
-- User Management Permissions
('view_users', 'Can view user list and details', 'user_management'),
('create_users', 'Can create new users', 'user_management'),
('edit_users', 'Can edit user information', 'user_management'),
('delete_users', 'Can delete users', 'user_management'),
('manage_roles', 'Can assign and manage user roles', 'user_management'),

-- Scholarship Management Permissions
('view_scholarships', 'Can view scholarship list and details', 'scholarship_management'),
('create_scholarships', 'Can create new scholarships', 'scholarship_management'),
('edit_scholarships', 'Can edit scholarship information', 'scholarship_management'),
('delete_scholarships', 'Can delete scholarships', 'scholarship_management'),
('review_applications', 'Can review scholarship applications', 'scholarship_management'),
('approve_applications', 'Can approve/reject scholarship applications', 'scholarship_management'),

-- System Settings Permissions
('view_settings', 'Can view system settings', 'system_settings'),
('edit_settings', 'Can modify system settings', 'system_settings'),
('manage_backup', 'Can manage system backup and restore', 'system_settings'),
('view_logs', 'Can view system logs', 'system_settings')
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    category = VALUES(category);

-- Assign all permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'admin'),
    permission_id
FROM permissions
ON DUPLICATE KEY UPDATE role_id = role_id;

-- Assign basic permissions to manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'manager'),
    permission_id
FROM permissions
WHERE permission_name IN (
    'view_users',
    'view_scholarships',
    'create_scholarships',
    'edit_scholarships',
    'review_applications',
    'approve_applications',
    'view_settings'
)
ON DUPLICATE KEY UPDATE role_id = role_id;

-- Assign minimal permissions to user role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'user'),
    permission_id
FROM permissions
WHERE permission_name IN (
    'view_scholarships'
)
ON DUPLICATE KEY UPDATE role_id = role_id; 