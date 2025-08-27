import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Testing API Endpoints...\n');

    const tests = [
        {
            name: 'Forgot Password - Valid Email',
            method: 'POST',
            url: '/auth/forgot-password',
            body: { email: 'test@example.com' },
            expectedStatus: 200
        },
        {
            name: 'Forgot Password - Invalid Email',
            method: 'POST',
            url: '/auth/forgot-password',
            body: { email: 'nonexistent@example.com' },
            expectedStatus: 404
        },
        {
            name: 'Forgot Password - Missing Email',
            method: 'POST',
            url: '/auth/forgot-password',
            body: {},
            expectedStatus: 400
        },
        {
            name: 'Login - Valid Credentials',
            method: 'POST',
            url: '/auth/login',
            body: { email: 'test@example.com', password: 'TestPassword123!' },
            expectedStatus: 200
        },
        {
            name: 'Login - Invalid Credentials',
            method: 'POST',
            url: '/auth/login',
            body: { email: 'test@example.com', password: 'wrongpassword' },
            expectedStatus: 400
        },
        {
            name: 'Admin Forgot Password - Valid Email',
            method: 'POST',
            url: '/auth/forgot-password',
            body: { email: 'admin@example.com' },
            expectedStatus: 200
        },
        {
            name: 'Admin Login - Valid Credentials',
            method: 'POST',
            url: '/auth/admin-login',
            body: { email: 'admin@example.com', password: 'AdminPassword123!' },
            expectedStatus: 200
        },
        {
            name: 'Admin Login - Invalid Credentials',
            method: 'POST',
            url: '/auth/admin-login',
            body: { email: 'admin@example.com', password: 'wrongpassword' },
            expectedStatus: 400
        }
    ];

    for (const test of tests) {
        try {
            console.log(`📋 Testing: ${test.name}`);
            
            const response = await fetch(`${BASE_URL}${test.url}`, {
                method: test.method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(test.body)
            });

            const data = await response.json();
            
            if (response.status === test.expectedStatus) {
                console.log(`✅ PASS - Status: ${response.status}`);
                if (data.success !== undefined) {
                    console.log(`   Success: ${data.success}`);
                }
                if (data.message) {
                    console.log(`   Message: ${data.message}`);
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

    console.log('🎯 API Testing Complete!');
}

testAPI();
