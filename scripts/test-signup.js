import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testSignup() {
    console.log('🧪 Testing Signup Functionality...\n');

    const tests = [
        {
            name: 'Get Security Questions',
            method: 'GET',
            url: '/security-questions',
            expectedStatus: 200
        },
        {
            name: 'Register New User - Valid Data',
            method: 'POST',
            url: '/auth/register',
            body: {
                full_name: 'Test User Signup',
                email: 'signup-test@example.com',
                password: 'TestPassword123!',
                security_questions: [
                    { question_id: 1, answer: 'Test Pet' },
                    { question_id: 2, answer: 'Test City' },
                    { question_id: 3, answer: 'Test Maiden' }
                ]
            },
            expectedStatus: 201
        },
        {
            name: 'Register New User - Duplicate Email',
            method: 'POST',
            url: '/auth/register',
            body: {
                full_name: 'Test User Signup',
                email: 'signup-test@example.com',
                password: 'TestPassword123!',
                security_questions: [
                    { question_id: 1, answer: 'Test Pet' },
                    { question_id: 2, answer: 'Test City' },
                    { question_id: 3, answer: 'Test Maiden' }
                ]
            },
            expectedStatus: 400
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
            } else {
                console.log(`❌ FAIL - Expected: ${test.expectedStatus}, Got: ${response.status}`);
                console.log(`   Response:`, data);
            }
            
            console.log('');
        } catch (error) {
            console.log(`❌ ERROR - ${test.name}: ${error.message}\n`);
        }
    }

    console.log('🎯 Signup Testing Complete!');
}

testSignup();
