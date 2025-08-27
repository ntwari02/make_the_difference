// Unified Login JavaScript - Role-Based Access Control
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Unified Login System Initialized');
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Function to set theme
    function setTheme(isDark) {
        console.log(`🎨 Setting theme to: ${isDark ? 'dark' : 'light'}`);
        
        if (isDark) {
            document.documentElement.classList.add('dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('color-theme', 'light');
        }
    }
    
    // Initialize theme
    const savedTheme = localStorage.getItem('color-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        setTheme(savedTheme === 'dark');
    } else if (prefersDark) {
        setTheme(true);
    } else {
        setTheme(false);
    }
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', function() {
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        setTheme(!isCurrentlyDark);
    });

    // Password visibility toggles
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    const toggleNewPassword = document.getElementById('toggleNewPassword');
    const newPassword = document.getElementById('newPassword');
    const toggleConfirmNewPassword = document.getElementById('toggleConfirmNewPassword');
    const confirmNewPassword = document.getElementById('confirmNewPassword');

    function togglePasswordVisibility(input, button) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        const icon = button.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }

    togglePassword.addEventListener('click', () => togglePasswordVisibility(password, togglePassword));
    toggleNewPassword.addEventListener('click', () => togglePasswordVisibility(newPassword, toggleNewPassword));
    toggleConfirmNewPassword.addEventListener('click', () => togglePasswordVisibility(confirmNewPassword, toggleConfirmNewPassword));

    // Form validation
    function validateForm() {
        const email = document.getElementById('email').value.trim();
        const passwordValue = password.value;

        // Clear previous errors
        document.querySelectorAll('[id$="-error"]').forEach(el => {
            el.classList.add('hidden');
            el.textContent = '';
        });

        let isValid = true;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (passwordValue.length < 1) {
            showError('password', 'Password is required');
            isValid = false;
        }

        return isValid;
    }

    function showError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    function showAlert(message, type = 'error') {
        const alertContainer = document.getElementById('alert-container');
        const alertDiv = document.createElement('div');
        alertDiv.className = `p-4 rounded-lg mb-4 ${
            type === 'error' 
                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' 
                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
        }`;
        alertDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        alertContainer.appendChild(alertDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // Role detection and badge display
    function showRoleBadge(role, adminLevel = null) {
        const roleBadge = document.getElementById('role-badge');
        const roleText = document.getElementById('role-text');
        
        if (role === 'admin') {
            roleText.textContent = adminLevel ? `${adminLevel.replace('_', ' ').toUpperCase()}` : 'ADMIN';
            roleBadge.classList.remove('hidden');
        } else {
            roleBadge.classList.add('hidden');
        }
    }

    // Token management
    function storeUserData(token, userData) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Store additional debug info for developers
        const debugInfo = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            role: userData.role,
            isAdmin: userData.isAdmin || false,
            adminLevel: userData.adminLevel || null,
            permissions: userData.permissions || null
        };
        localStorage.setItem('debugInfo', JSON.stringify(debugInfo));
        
        console.log('🔐 Token stored successfully');
        console.log('👤 User data:', userData);
        console.log('🐛 Debug info:', debugInfo);
    }

    function clearUserData() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('debugInfo');
        console.log('🧹 User data cleared');
    }

    // Function to refresh admin profile data including profile picture
    async function refreshAdminProfile(token) {
        try {
            console.log('🔄 Refreshing admin profile data...');
            console.log('🔍 Token:', token ? 'Present' : 'Missing');
            
            const response = await fetch('/api/admin/account', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('🔍 Response status:', response.status);
            
            if (response.ok) {
                const profileData = await response.json();
                console.log('🔍 Profile data from server:', profileData);
                console.log('🔍 Profile picture field:', profileData.profile_picture);
                console.log('🔍 Profile picture path field:', profileData.profile_picture_path);
                
                // Update user data with profile information
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                console.log('🔍 Current user data:', currentUser);
                
                const updatedUser = {
                    ...currentUser,
                    profile_picture: profileData.profile_picture || profileData.profile_picture_path,
                    profile_picture_path: profileData.profile_picture_path || profileData.profile_picture
                };
                
                console.log('🔍 Updated user data:', updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                console.log('✅ Admin profile refreshed successfully');
            } else {
                const errorText = await response.text();
                console.log('⚠️ Failed to refresh admin profile:', response.status, errorText);
            }
        } catch (error) {
            console.error('❌ Error refreshing admin profile:', error);
        }
    }

    // Role-based redirection
    function redirectBasedOnRole(userData) {
        console.log('🔄 Redirecting based on role:', userData.role);
        
        if (userData.isAdmin) {
            console.log('👨‍💼 Admin detected, redirecting to admin dashboard');
            window.location.href = 'admin_dashboard.html';
        } else {
            console.log('👤 Regular user detected, redirecting to home page');
            window.location.href = 'home.html';
        }
    }

    // Unified login function
    async function performLogin(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);
            
            // First, try regular user login
            let response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            let data = await response.json();
            console.log('📡 Login response:', data);

            if (response.ok) {
                // Regular user login successful
                const userData = {
                    id: data.user.id,
                    full_name: data.user.full_name,
                    email: data.user.email,
                    role: data.user.role,
                    isAdmin: false,
                    profile_picture: data.user.profile_picture || data.user.profile_picture_path,
                    profile_picture_path: data.user.profile_picture_path || data.user.profile_picture
                };

                storeUserData(data.token, userData);
                showRoleBadge(data.user.role);
                showAlert('Login successful! Redirecting...', 'success');
                
                // Redirect after a short delay
                setTimeout(() => {
                    redirectBasedOnRole(userData);
                }, 1500);
                
                return;
            }

            // Check if this is an admin account that should use admin login
            if (data.code === 'ADMIN_ACCOUNT') {
                console.log('👨‍💼 Admin account detected, trying admin login automatically...');
                // Continue to admin login attempt
            } else {
                // Regular login failed for non-admin reason
                throw new Error(data.message || 'Login failed');
            }

            // If regular login failed, try admin login
            console.log('🔄 Trying admin login...');
            response = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            data = await response.json();
            console.log('📡 Admin login response:', data);

            if (response.ok) {
                // Admin login successful
                const userData = {
                    id: data.user.id,
                    full_name: data.user.full_name,
                    email: data.user.email,
                    role: 'admin',
                    isAdmin: true,
                    adminLevel: data.user.adminLevel,
                    permissions: data.user.permissions,
                    profile_picture: data.user.profile_picture || data.user.profile_picture_path,
                    profile_picture_path: data.user.profile_picture_path || data.user.profile_picture
                };

                // Store admin token with specific key for admin pages
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('token', data.token); // Also store as regular token for compatibility
                localStorage.setItem('user', JSON.stringify(userData));
                
                // Store additional debug info for developers
                const debugInfo = {
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    role: userData.role,
                    isAdmin: userData.isAdmin || false,
                    adminLevel: userData.adminLevel || null,
                    permissions: userData.permissions || null,
                    tokenType: 'admin'
                };
                localStorage.setItem('debugInfo', JSON.stringify(debugInfo));
                
                console.log('🔐 Admin token stored successfully');
                console.log('👤 Admin user data:', userData);
                console.log('🐛 Debug info:', debugInfo);
                
                showRoleBadge('admin', data.user.adminLevel);
                showAlert('Admin login successful! Redirecting...', 'success');
                try { localStorage.setItem('adminShowWelcome', '1'); } catch (e) {}
                
                                 // Refresh profile picture data for admin users
                 console.log('🔄 About to refresh admin profile...');
                 await refreshAdminProfile(data.token);
                 console.log('✅ Profile refresh completed');
                
                // Redirect after a short delay
                setTimeout(() => {
                    redirectBasedOnRole(userData);
                }, 1500);
                
                return;
            }

            // Both logins failed
            throw new Error(data.message || 'Login failed');

        } catch (error) {
            console.error('❌ Login error:', error);
            showAlert(error.message || 'An error occurred during login', 'error');
            
            // Add shake animation to form
            const form = document.getElementById('loginForm');
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    }

    // Form submission
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const email = document.getElementById('email').value.trim();
        const passwordValue = password.value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Show loading state
        const loginButton = document.getElementById('loginButton');
        const loginButtonText = document.getElementById('loginButtonText');
        const loginButtonIcon = document.getElementById('loginButtonIcon');
        const loadingIcon = document.getElementById('loadingIcon');

        loginButton.disabled = true;
        loginButtonText.textContent = 'Signing In...';
        loginButtonIcon.classList.add('hidden');
        loadingIcon.classList.remove('hidden');

        try {
            await performLogin(email, passwordValue);
        } finally {
            // Reset button state
            loginButton.disabled = false;
            loginButtonText.textContent = 'Sign In';
            loginButtonIcon.classList.remove('hidden');
            loadingIcon.classList.add('hidden');
        }
    });

    // Forgot password functionality
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotModal = document.getElementById('closeForgotModal');
    const getQuestionsBtn = document.getElementById('getQuestionsBtn');
    const verifyAnswersBtn = document.getElementById('verifyAnswersBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');

    let currentStep = 1;
    let resetToken = null;
    let isHelpToken = false;

    // Modal controls
    forgotPasswordBtn.addEventListener('click', () => {
        forgotPasswordModal.style.display = 'flex';
        currentStep = 1;
        showStep(1);
    });

    closeForgotModal.addEventListener('click', () => {
        forgotPasswordModal.style.display = 'none';
        resetForm();
    });

    // Close modal when clicking outside
    forgotPasswordModal.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
            resetForm();
        }
    });

    function showStep(step) {
        document.getElementById('step1').classList.toggle('hidden', step !== 1);
        document.getElementById('step2').classList.toggle('hidden', step !== 2);
        document.getElementById('step3').classList.toggle('hidden', step !== 3);
    }

    function resetForm() {
        document.getElementById('forgotEmail').value = '';
        document.getElementById('securityQuestions').innerHTML = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        currentStep = 1;
        resetToken = null;
        showStep(1);
    }

    // Auto-check for admin-issued reset when email is entered
    const forgotEmailInput = document.getElementById('forgotEmail');
    const autoResetNotice = document.getElementById('autoResetNotice');
    if (forgotEmailInput) {
        let debounceTimer = null;
        forgotEmailInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const email = forgotEmailInput.value.trim();
                if (!email) return;
                try {
                    const res = await fetch('/api/admin-help/auto-reset-token?email=' + encodeURIComponent(email));
                    const data = await res.json();
                    if (res.ok && data && data.success && data.reset_token) {
                        // Jump straight to reset step
                        if (autoResetNotice) autoResetNotice.classList.remove('hidden');
                        currentStep = 3;
                        showStep(3);
                        // Stash token for reset submission
                        resetToken = data.reset_token;
                        // Pre-fill read-only email field in step 3 if present
                        const emailField = document.getElementById('email');
                        if (emailField) emailField.value = email;
                    }
                } catch (e) {
                    // ignore
                }
            }, 500);
        });
    }

    // Get security questions
    getQuestionsBtn.addEventListener('click', async () => {
        const email = document.getElementById('forgotEmail').value.trim();
        
        if (!email) {
            showAlert('Please enter your email address', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok && data && data.success && Array.isArray(data.questions) && data.questions.length) {
                // Display security questions
                const container = document.getElementById('securityQuestions');
                container.innerHTML = '';
                
                data.questions.forEach((question) => {
                    const questionDiv = document.createElement('div');
                    questionDiv.innerHTML = `
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ${question.question}
                        </label>
                        <input 
                            type="text" 
                            data-question-id="${question.id}"
                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Your answer"
                            required
                        >
                    `;
                    container.appendChild(questionDiv);
                });

                currentStep = 2;
                showStep(2);
            } else if (response.ok && data && data.success && data.isAdmin && Array.isArray(data.questions) && data.questions.length === 0) {
                // Admin without security questions: show informational message and jump to step 3 via admin-help
                const msg = document.getElementById('forgotMsg');
                if (msg) {
                    msg.textContent = data.message || 'No security questions set for this admin. Proceed with email verification.';
                    msg.classList.remove('hidden');
                }
                // Try to get auto reset token
                try {
                    const autoRes = await fetch('/api/admin-help/auto-reset-token?email=' + encodeURIComponent(email));
                    const autoData = await autoRes.json();
                    if (autoRes.ok && autoData && autoData.success && autoData.reset_token) {
                        if (autoResetNotice) autoResetNotice.classList.remove('hidden');
                        currentStep = 3;
                        showStep(3);
                        resetToken = autoData.reset_token;
                        isHelpToken = true;
                        return;
                    }
                } catch (e) {}
                showAlert('Admin account detected. A verification email may be required.', 'success');
            } else {
                // Before showing error, check if admin accepted help and skip to reset
                try {
                    const autoRes = await fetch('/api/admin-help/auto-reset-token?email=' + encodeURIComponent(email));
                    const autoData = await autoRes.json();
                    if (autoRes.ok && autoData && autoData.success && autoData.reset_token) {
                        if (autoResetNotice) autoResetNotice.classList.remove('hidden');
                        currentStep = 3;
                        showStep(3);
                        resetToken = autoData.reset_token;
                        isHelpToken = true;
                        return;
                    }
                } catch (e) {}
                showAlert((data && data.message) || 'Error retrieving security questions', 'error');
            }
        } catch (error) {
            console.error('Error getting security questions:', error);
            showAlert('An error occurred while retrieving security questions', 'error');
        }
    });

    // Verify security answers
    verifyAnswersBtn.addEventListener('click', async () => {
        const answers = [];
        document.querySelectorAll('[data-question-id]').forEach(input => {
            answers.push({
                question_id: parseInt(input.dataset.questionId),
                answer: input.value.trim()
            });
        });

        if (answers.length === 0) {
            showAlert('Please answer all security questions', 'error');
            return;
        }

        const email = document.getElementById('forgotEmail').value.trim();

        try {
            const response = await fetch('/api/security-questions/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, answers })
            });

            const data = await response.json();

            if (response.ok && data && data.success && data.can_reset) {
                resetToken = data.reset_token;
                isHelpToken = false;
                currentStep = 3;
                showStep(3);
            } else {
                showAlert((data && data.message) || 'Incorrect answers', 'error');
                // Reveal help request box for admin assistance
                const answersError = document.getElementById('answersError');
                const helpBox = document.getElementById('helpRequestBox');
                const email = document.getElementById('forgotEmail').value.trim();
                const helpEmail = document.getElementById('helpEmail');
                if (answersError) answersError.classList.remove('hidden');
                if (helpBox) helpBox.classList.remove('hidden');
                if (helpEmail && email) helpEmail.value = email;
            }
        } catch (error) {
            console.error('Error verifying answers:', error);
            showAlert('An error occurred while verifying answers', 'error');
        }
    });

    // Send help request to admin when user can't answer questions
    const sendHelpRequestBtn = document.getElementById('sendHelpRequestBtn');
    if (sendHelpRequestBtn) {
        sendHelpRequestBtn.addEventListener('click', async () => {
            const email = document.getElementById('helpEmail').value.trim();
            const message = document.getElementById('helpMessage').value.trim();
            const statusEl = document.getElementById('helpSendStatus');
            if (!email || !message) {
                if (statusEl) {
                    statusEl.textContent = 'Please enter your email and describe your problem.';
                    statusEl.classList.remove('text-green-600');
                    statusEl.classList.add('text-red-600');
                }
                return;
            }
            try {
                // Request admin-help token and mark help requested using existing adminHelp endpoint
                const res = await fetch('/api/admin-help/send-reset-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: null, user_id: null, email })
                });
                // Even if not found, do not reveal existence. Show friendly message
                if (statusEl) {
                    statusEl.textContent = 'Help request has been sent. You will get feedback in a few minutes.';
                    statusEl.classList.remove('text-gray-600', 'dark:text-gray-300', 'text-red-600', 'dark:text-red-400');
                    statusEl.classList.add('text-green-600');
                    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } catch (e) {
                if (statusEl) {
                    statusEl.textContent = 'Could not send request. Please try again later.';
                    statusEl.classList.remove('text-green-600');
                    statusEl.classList.add('text-red-600');
                    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });
    }

    // Reset password
    resetPasswordBtn.addEventListener('click', async () => {
        const newPasswordValue = document.getElementById('newPassword').value;
        const confirmNewPasswordValue = document.getElementById('confirmNewPassword').value;

        if (newPasswordValue !== confirmNewPasswordValue) {
            showAlert('Passwords do not match', 'error');
            return;
        }

        if (newPasswordValue.length < 8) {
            showAlert('Password must be at least 8 characters long', 'error');
            return;
        }

        try {
            // Extra guard: if notice is visible, treat as help-token flow
            const noticeVisible = autoResetNotice && !autoResetNotice.classList.contains('hidden');
            if (noticeVisible) {
                isHelpToken = true;
            }

            let response, data;
            if (isHelpToken) {
                const emailVal = document.getElementById('forgotEmail').value.trim();
                response = await fetch('/api/admin-help/complete-reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: resetToken, email: emailVal, new_password: newPasswordValue })
                });
                data = await response.json();
            } else {
                response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: resetToken,
                        newPassword: newPasswordValue
                    })
                });
                data = await response.json();
            }

            if (response.ok && data && data.success !== false) {
                showAlert('Password reset successfully! You can now login with your new password.', 'success');
                forgotPasswordModal.style.display = 'none';
                resetForm();
            } else {
                showAlert(data.message || 'Error resetting password', 'error');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            showAlert('An error occurred while resetting password', 'error');
        }
    });

    // Check for existing session
    function checkExistingSession() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            try {
                const userData = JSON.parse(user);
                console.log('🔍 Found existing session:', userData);
                
                // Check if token is still valid (basic check)
                if (userData.id) {
                    showRoleBadge(userData.role, userData.adminLevel);
                    showAlert('Welcome back! Redirecting...', 'success');
                    
                    setTimeout(() => {
                        redirectBasedOnRole(userData);
                    }, 1000);
                }
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                clearUserData();
            }
        }
    }

    // Initialize session check
    checkExistingSession();

    // Developer debug functions (available in console)
    window.loginDebug = {
        showStoredData: () => {
            console.log('🔍 Stored Token:', localStorage.getItem('token'));
            console.log('👤 Stored User:', JSON.parse(localStorage.getItem('user') || 'null'));
            console.log('🐛 Debug Info:', JSON.parse(localStorage.getItem('debugInfo') || 'null'));
        },
        clearAllData: () => {
            clearUserData();
            console.log('🧹 All data cleared');
        },
        testLogin: async (email, password) => {
            console.log('🧪 Testing login with:', email);
            await performLogin(email, password);
        }
    };

    console.log('✅ Unified Login System Ready');
    console.log('💡 Debug functions available: window.loginDebug.showStoredData(), window.loginDebug.clearAllData(), window.loginDebug.testLogin(email, password)');
});
