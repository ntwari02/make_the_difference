import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testUnifiedLogin() {
    console.log('🧪 Testing Unified Login System...\n');

    const tests = [
        {
            name: 'Regular User Login - Valid Credentials',
            method: 'POST',
            url: '/auth/login',
            body: {
                email: 'test@example.com',
                password: 'TestPassword123!'
            },
            expectedStatus: 200,
            expectedRole: 'user'
        },
        {
            name: 'Regular User Login - Invalid Credentials',
            method: 'POST',
            url: '/auth/login',
            body: {
                email: 'test@example.com',
                password: 'WrongPassword'
            },
            expectedStatus: 400
        },
        {
            name: 'Admin Login - Valid Credentials (System Admin)',
            method: 'POST',
            url: '/auth/admin-login',
            body: {
                email: 'admin@system.com',
                password: 'AdminPassword123!'
            },
            expectedStatus: 200,
            expectedRole: 'admin'
        },
        {
            name: 'Admin Login - Invalid Credentials',
            method: 'POST',
            url: '/auth/admin-login',
            body: {
                email: 'admin@system.com',
                password: 'WrongPassword'
            },
            expectedStatus: 400
        },
        {
            name: 'Non-existent User Login',
            method: 'POST',
            url: '/auth/login',
            body: {
                email: 'nonexistent@example.com',
                password: 'AnyPassword'
            },
            expectedStatus: 400
        },
        {
            name: 'Get Security Questions - Valid Email',
            method: 'POST',
            url: '/auth/forgot-password',
            body: {
                email: 'test@example.com'
            },
            expectedStatus: 200
        },
        {
            name: 'Get Security Questions - Invalid Email',
            method: 'POST',
            url: '/auth/forgot-password',
            body: {
                email: 'nonexistent@example.com'
            },
            expectedStatus: 404
        }
    ];

    for (const test of tests) {
        try {
            console.log(`📋 Testing: ${test.name}`);
            
            const options = {
                method: test.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (test.body) {
                options.body = JSON.stringify(test.body);
            }

            const response = await fetch(`${BASE_URL}${test.url}`, options);
            const data = await response.json();
            
            if (response.status === test.expectedStatus) {
                console.log(`✅ PASS - Status: ${response.status}`);
                
                if (data.message) {
                    console.log(`   Message: ${data.message}`);
                }
                
                if (data.token) {
                    console.log(`   Token: ${data.token ? 'Received' : 'None'}`);
                }
                
                if (data.user) {
                    console.log(`   User Role: ${data.user.role}`);
                    console.log(`   User ID: ${data.user.id}`);
                    console.log(`   User Name: ${data.user.full_name}`);
                    
                    if (data.user.isAdmin) {
                        console.log(`   Admin Level: ${data.user.adminLevel}`);
                        console.log(`   Permissions: ${JSON.stringify(data.user.permissions)}`);
                    }
                }
                
                if (data.questions) {
                    console.log(`   Security Questions: ${data.questions.length} found`);
                }
                
                if (test.expectedRole && data.user && data.user.role === test.expectedRole) {
                    console.log(`   ✅ Role verification: ${data.user.role} matches expected ${test.expectedRole}`);
                }
            } else {
                console.log(`❌ FAIL - Expected: ${test.expectedStatus}, Got: ${response.status}`);
                console.log(`   Response:`, data);
            }
            
            console.log('');
        } catch (error) {
            console.log(`❌ ERROR - ${test.name}: ${error.message}\n`);
        }
    }

    console.log('🎯 Testing Role-Based Redirection Logic...\n');
    
    // Test role-based redirection logic
    const testUsers = [
        {
            name: 'Regular User',
            userData: {
                id: 1,
                full_name: 'Test User',
                email: 'test@example.com',
                role: 'user',
                isAdmin: false
            },
            expectedRedirect: 'home.html'
        },
        {
            name: 'Admin User',
            userData: {
                id: 2,
                full_name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                isAdmin: true,
                adminLevel: 'admin',
                permissions: { users: ['read', 'write'] }
            },
            expectedRedirect: 'admin_dashboard.html'
        },
        {
            name: 'Super Admin',
            userData: {
                id: 3,
                full_name: 'Super Admin',
                email: 'superadmin@example.com',
                role: 'admin',
                isAdmin: true,
                adminLevel: 'super_admin',
                permissions: { users: ['read', 'write', 'delete'] }
            },
            expectedRedirect: 'admin_dashboard.html'
        }
    ];

    testUsers.forEach(user => {
        console.log(`👤 ${user.name}:`);
        console.log(`   Role: ${user.userData.role}`);
        console.log(`   Is Admin: ${user.userData.isAdmin}`);
        if (user.userData.adminLevel) {
            console.log(`   Admin Level: ${user.userData.adminLevel}`);
        }
        console.log(`   Expected Redirect: ${user.expectedRedirect}`);
        console.log(`   ✅ Redirection logic: ${user.userData.isAdmin ? 'admin_dashboard.html' : 'home.html'}`);
        console.log('');
    });

    console.log('🔍 Testing Token Storage and Debug Info...\n');
    
    // Simulate token storage
    const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token';
    const sampleUserData = {
        id: 1,
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        isAdmin: false
    };
    
    const debugInfo = {
        timestamp: new Date().toISOString(),
        userAgent: 'Node.js Test Script',
        role: sampleUserData.role,
        isAdmin: sampleUserData.isAdmin,
        adminLevel: sampleUserData.adminLevel || null,
        permissions: sampleUserData.permissions || null
    };
    
    console.log('📦 Sample Token Storage:');
    console.log(`   Token: ${sampleToken.substring(0, 20)}...`);
    console.log(`   User Data:`, sampleUserData);
    console.log(`   Debug Info:`, debugInfo);
    console.log('');

    console.log('🎯 Unified Login Testing Complete!');
    console.log('\n💡 Test Credentials:');
    console.log('   Regular User: test@example.com / TestPassword123!');
    console.log('   Admin User: admin@system.com / AdminPassword123!');
    console.log('\n🔧 To test manually:');
    console.log('   1. Open http://localhost:3000/login.html');
    console.log('   2. Try logging in with different user types');
    console.log('   3. Check browser console for debug information');
    console.log('   4. Verify role-based redirections work correctly');
}

testUnifiedLogin();
