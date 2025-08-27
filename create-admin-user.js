// Script to create a new admin user
// Run this in your database or use it as a reference

const bcrypt = require('bcryptjs');

// Example: Create a new admin user
const adminUser = {
    full_name: 'New Admin',
    email: 'newadmin@example.com',
    password: 'admin123', // Change this to a secure password
    role: 'admin',
    admin_level: 'admin',
    is_active: true
};

// Hash the password
const hashedPassword = bcrypt.hashSync(adminUser.password, 12);

// SQL statements to run:

// 1. Insert into users table
const insertUserSQL = `
INSERT INTO users (full_name, email, password, role, status, created_at) 
VALUES ('${adminUser.full_name}', '${adminUser.email}', '${hashedPassword}', 'admin', 'active', NOW());
`;

// 2. Get the user ID (run this after the above)
const getUserIdSQL = `SELECT id FROM users WHERE email = '${adminUser.email}';`;

// 3. Insert into admin_users table (replace USER_ID with the actual ID from step 2)
const insertAdminSQL = `
INSERT INTO admin_users (user_id, full_name, email, admin_level, permissions, is_active, created_at, updated_at) 
VALUES (USER_ID, '${adminUser.full_name}', '${adminUser.email}', '${adminUser.admin_level}', 
        '{"users": ["read", "write", "delete"], "applications": ["read", "write", "delete"], "scholarships": ["read", "write", "delete"], "settings": ["read", "write"], "analytics": ["read"], "reports": ["read", "write"], "email_templates": ["read", "write", "delete"]}', 
        1, NOW(), NOW());
`;

console.log('SQL to create admin user:');
console.log('1. Insert into users:', insertUserSQL);
console.log('2. Get user ID:', getUserIdSQL);
console.log('3. Insert into admin_users (replace USER_ID):', insertAdminSQL);
