// Script to check existing admin users
// Run these SQL queries in your database

console.log('Check existing admin users:');

// 1. Check all users with admin role
const checkAdminUsersSQL = `
SELECT id, full_name, email, role, status, created_at 
FROM users 
WHERE role = 'admin' 
ORDER BY id;
`;

// 2. Check admin_users table
const checkAdminUsersTableSQL = `
SELECT au.id, au.user_id, au.full_name, au.email, au.admin_level, au.is_active, au.created_at,
       u.role as user_role, u.status as user_status
FROM admin_users au
JOIN users u ON au.user_id = u.id
WHERE au.is_active = TRUE
ORDER BY au.id;
`;

// 3. Check for any inactive admin users
const checkInactiveAdminSQL = `
SELECT au.id, au.user_id, au.full_name, au.email, au.admin_level, au.is_active, au.created_at,
       u.role as user_role, u.status as user_status
FROM admin_users au
JOIN users u ON au.user_id = u.id
WHERE au.is_active = FALSE OR u.status = 'inactive'
ORDER BY au.id;
`;

console.log('1. All users with admin role:');
console.log(checkAdminUsersSQL);
console.log('\n2. Active admin users:');
console.log(checkAdminUsersTableSQL);
console.log('\n3. Inactive admin users:');
console.log(checkInactiveAdminSQL);
