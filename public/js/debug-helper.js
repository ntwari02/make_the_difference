// Frontend Debug Helper for Testing Forgot Password
window.debugHelper = {
    // Test forgot password with valid email
    testForgotPassword: async (email = 'test@example.com') => {
        console.log('🧪 Testing forgot password with email:', email);
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            console.log('📡 Response Status:', response.status);
            console.log('📄 Response Data:', data);
            
            if (response.ok && data.success) {
                console.log('✅ Success! Security questions retrieved:');
                data.questions.forEach((q, index) => {
                    console.log(`   ${index + 1}. ${q.question}`);
                });
            } else {
                console.log('❌ Error:', data.message);
            }
            
            return data;
        } catch (error) {
            console.error('❌ Network Error:', error);
            return null;
        }
    },

    // Test login with valid credentials
    testLogin: async (email = 'test@example.com', password = 'TestPassword123!') => {
        console.log('🧪 Testing login with credentials:', { email, password: '***' });
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            console.log('📡 Response Status:', response.status);
            console.log('📄 Response Data:', data);
            
            if (response.ok) {
                console.log('✅ Login successful!');
                console.log('🔑 Token received:', data.token ? 'Yes' : 'No');
            } else {
                console.log('❌ Login failed:', data.message);
            }
            
            return data;
        } catch (error) {
            console.error('❌ Network Error:', error);
            return null;
        }
    },

    // Test security questions verification
    testSecurityQuestions: async (email = 'test@example.com') => {
        console.log('🧪 Testing security questions verification for:', email);
        
        const answers = [
            { question_id: 1, answer: 'Fluffy' },
            { question_id: 2, answer: 'New York' },
            { question_id: 3, answer: 'Smith' }
        ];
        
        try {
            const response = await fetch('/api/security-questions/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, answers })
            });

            const data = await response.json();
            
            console.log('📡 Response Status:', response.status);
            console.log('📄 Response Data:', data);
            
            if (response.ok && data.success) {
                console.log('✅ Security questions verified successfully!');
                console.log('🔄 Can reset password:', data.can_reset);
            } else {
                console.log('❌ Verification failed:', data.message);
            }
            
            return data;
        } catch (error) {
            console.error('❌ Network Error:', error);
            return null;
        }
    },

    // Run all tests
    runAllTests: async () => {
        console.log('🚀 Running all debug tests...\n');
        
        console.log('=== Test 1: Forgot Password ===');
        await window.debugHelper.testForgotPassword();
        
        console.log('\n=== Test 2: Login ===');
        await window.debugHelper.testLogin();
        
        console.log('\n=== Test 3: Security Questions ===');
        await window.debugHelper.testSecurityQuestions();
        
        console.log('\n🎯 All tests completed!');
    },

    // Test admin forgot password
    testAdminForgotPassword: async (email = 'admin@example.com') => {
        console.log('🧪 Testing admin forgot password with email:', email);
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            console.log('📡 Response Status:', response.status);
            console.log('📄 Response Data:', data);
            
            if (response.ok && data.success) {
                console.log('✅ Success! Admin security questions retrieved:');
                console.log('👑 Is Admin:', data.isAdmin);
                data.questions.forEach((q, index) => {
                    console.log(`   ${index + 1}. ${q.question}`);
                });
            } else {
                console.log('❌ Error:', data.message);
            }
            
            return data;
        } catch (error) {
            console.error('❌ Network Error:', error);
            return null;
        }
    },

    // Test admin login
    testAdminLogin: async (email = 'admin@example.com', password = 'AdminPassword123!') => {
        console.log('🧪 Testing admin login with credentials:', { email, password: '***' });
        
        try {
            const response = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            console.log('📡 Response Status:', response.status);
            console.log('📄 Response Data:', data);
            
            if (response.ok) {
                console.log('✅ Admin login successful!');
                console.log('🔑 Token received:', data.token ? 'Yes' : 'No');
                console.log('👑 Admin Level:', data.user?.adminLevel);
            } else {
                console.log('❌ Admin login failed:', data.message);
            }
            
            return data;
        } catch (error) {
            console.error('❌ Network Error:', error);
            return null;
        }
    },

    // Test admin security questions verification
    testAdminSecurityQuestions: async (email = 'admin@example.com') => {
        console.log('🧪 Testing admin security questions verification for:', email);
        
        const answers = [
            { question_id: 1, answer: 'Max' },
            { question_id: 2, answer: 'Los Angeles' },
            { question_id: 3, answer: 'Johnson' }
        ];
        
        try {
            const response = await fetch('/api/security-questions/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, answers })
            });

            const data = await response.json();
            
            console.log('📡 Response Status:', response.status);
            console.log('📄 Response Data:', data);
            
            if (response.ok && data.success) {
                console.log('✅ Admin security questions verified successfully!');
                console.log('🔄 Can reset password:', data.can_reset);
                console.log('👑 Is Admin:', data.isAdmin);
            } else {
                console.log('❌ Admin verification failed:', data.message);
            }
            
            return data;
        } catch (error) {
            console.error('❌ Network Error:', error);
            return null;
        }
    },

    // Run all tests including admin tests
    runAllTests: async () => {
        console.log('🚀 Running all debug tests...\n');
        
        console.log('=== Test 1: Regular User Forgot Password ===');
        await window.debugHelper.testForgotPassword();
        
        console.log('\n=== Test 2: Regular User Login ===');
        await window.debugHelper.testLogin();
        
        console.log('\n=== Test 3: Regular User Security Questions ===');
        await window.debugHelper.testSecurityQuestions();
        
        console.log('\n=== Test 4: Admin Forgot Password ===');
        await window.debugHelper.testAdminForgotPassword();
        
        console.log('\n=== Test 5: Admin Login ===');
        await window.debugHelper.testAdminLogin();
        
        console.log('\n=== Test 6: Admin Security Questions ===');
        await window.debugHelper.testAdminSecurityQuestions();
        
        console.log('\n🎯 All tests completed!');
    },

    // Show test user details
    showTestUserDetails: () => {
        console.log('👤 Test User Details:');
        console.log('📧 Email: test@example.com');
        console.log('🔑 Password: TestPassword123!');
        console.log('❓ Security Questions:');
        console.log('   1. What was the name of your first pet? → Fluffy');
        console.log('   2. In which city were you born? → New York');
        console.log('   3. What was your mother\'s maiden name? → Smith');
        console.log('\n👑 Test Admin Details:');
        console.log('📧 Email: admin@example.com');
        console.log('🔑 Password: AdminPassword123!');
        console.log('❓ Security Questions:');
        console.log('   1. What was the name of your first pet? → Max');
        console.log('   2. In which city were you born? → Los Angeles');
        console.log('   3. What was your mother\'s maiden name? → Johnson');
        console.log('\n💡 Usage:');
        console.log('   - window.debugHelper.testForgotPassword()');
        console.log('   - window.debugHelper.testLogin()');
        console.log('   - window.debugHelper.testSecurityQuestions()');
        console.log('   - window.debugHelper.testAdminForgotPassword()');
        console.log('   - window.debugHelper.testAdminLogin()');
        console.log('   - window.debugHelper.testAdminSecurityQuestions()');
        console.log('   - window.debugHelper.runAllTests()');
    }
};

// Auto-run when loaded
console.log('🔧 Debug Helper loaded! Type window.debugHelper.showTestUserDetails() to see test user info.');
