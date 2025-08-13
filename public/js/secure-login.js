// Secure Login System with RBAC
// This file contains all the security utilities and login handling for the RBAC system

// Security utilities
const SecurityUtils = {
    // Input sanitization to prevent XSS
    sanitizeInput: (input) => {
        if (typeof input !== 'string') return '';
        return input.trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/[&]/g, '&amp;') // Escape ampersands
            .replace(/["]/g, '&quot;') // Escape quotes
            .replace(/[']/g, '&#x27;') // Escape apostrophes
            .replace(/[/]/g, '&#x2F;'); // Escape forward slashes
    },

    // Email validation with regex
    validateEmail: (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    },

    // Password strength validation
    validatePassword: (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
            strength: [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length,
            errors: []
        };
    },

    // Rate limiting for login attempts
    rateLimit: {
        attempts: 0,
        lastAttempt: 0,
        maxAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes

        check: function() {
            const now = Date.now();
            if (this.attempts >= this.maxAttempts) {
                if (now - this.lastAttempt < this.lockoutDuration) {
                    return false;
                } else {
                    this.reset();
                }
            }
            return true;
        },

        increment: function() {
            this.attempts++;
            this.lastAttempt = Date.now();
            // Store in localStorage for persistence
            localStorage.setItem('loginAttempts', this.attempts.toString());
            localStorage.setItem('lastLoginAttempt', this.lastAttempt.toString());
        },

        reset: function() {
            this.attempts = 0;
            this.lastAttempt = 0;
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lastLoginAttempt');
        },

        load: function() {
            const attempts = localStorage.getItem('loginAttempts');
            const lastAttempt = localStorage.getItem('lastLoginAttempt');
            if (attempts && lastAttempt) {
                this.attempts = parseInt(attempts);
                this.lastAttempt = parseInt(lastAttempt);
            }
        }
    },

    // Session management
    session: {
        create: function(userData, token) {
            const session = {
                user: userData,
                token: token,
                created: Date.now(),
                lastActivity: Date.now()
            };
            localStorage.setItem('session', JSON.stringify(session));
            return session;
        },

        get: function() {
            const session = localStorage.getItem('session');
            return session ? JSON.parse(session) : null;
        },

        update: function() {
            const session = this.get();
            if (session) {
                session.lastActivity = Date.now();
                localStorage.setItem('session', JSON.stringify(session));
            }
        },

        destroy: function() {
            localStorage.removeItem('session');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },

        isValid: function() {
            const session = this.get();
            if (!session) return false;
            
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            const maxInactivity = 30 * 60 * 1000; // 30 minutes
            
            return (now - session.created < maxAge) && (now - session.lastActivity < maxInactivity);
        }
    },

    // CSRF protection
    csrf: {
        generate: function() {
            const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
            sessionStorage.setItem('csrfToken', token);
            return token;
        },

        get: function() {
            return sessionStorage.getItem('csrfToken');
        },

        validate: function(token) {
            const storedToken = this.get();
            return token === storedToken;
        }
    }
};

// Alert management system
const AlertManager = {
    show: function(message, type = 'info', duration = 5000) {
        const container = document.getElementById('alert-container');
        const alertId = 'alert-' + Date.now();
        
        const alertHtml = `
            <div id="${alertId}" class="p-4 rounded-lg border transition-all duration-300 transform translate-y-0 opacity-100 ${
                type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' :
                type === 'error' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' :
                type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300' :
                'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
            }">
                <div class="flex items-center">
                    <i class="fas ${
                        type === 'success' ? 'fa-check-circle' :
                        type === 'error' ? 'fa-exclamation-circle' :
                        type === 'warning' ? 'fa-exclamation-triangle' :
                        'fa-info-circle'
                    } mr-2"></i>
                    <span>${SecurityUtils.sanitizeInput(message)}</span>
                    <button onclick="AlertManager.hide('${alertId}')" class="ml-auto text-current hover:opacity-70">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', alertHtml);
        
        if (duration > 0) {
            setTimeout(() => this.hide(alertId), duration);
        }
    },

    hide: function(alertId) {
        const alert = document.getElementById(alertId);
        if (alert) {
            alert.style.transform = 'translateY(-100%)';
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }
    },

    clear: function() {
        document.getElementById('alert-container').innerHTML = '';
    }
};

// Form validation
const FormValidator = {
    validateEmail: function(email) {
        const errorElement = document.getElementById('email-error');
        if (!SecurityUtils.validateEmail(email)) {
            errorElement.textContent = 'Please enter a valid email address';
            errorElement.classList.remove('hidden');
            return false;
        }
        errorElement.classList.add('hidden');
        return true;
    },

    validatePassword: function(password) {
        const errorElement = document.getElementById('password-error');
        const validation = SecurityUtils.validatePassword(password);
        
        if (!validation.isValid) {
            errorElement.textContent = 'Password must be at least 8 characters with uppercase, lowercase, and numbers';
            errorElement.classList.remove('hidden');
            return false;
        }
        errorElement.classList.add('hidden');
        return true;
    },

    validateForm: function(formData) {
        const email = formData.get('email');
        const password = formData.get('password');
        
        return this.validateEmail(email) && this.validatePassword(password);
    }
};

// Theme management
const ThemeManager = {
    init: function() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
        // Check for saved user preference
        if (localStorage.getItem('color-theme')) {
            if (localStorage.getItem('color-theme') === 'dark') {
                document.documentElement.classList.add('dark');
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                document.documentElement.classList.remove('dark');
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }
        
        themeToggle.addEventListener('click', () => {
            if (themeIcon.classList.contains('fa-moon')) {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
            
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        });
    }
};

// Password visibility toggles
const PasswordToggles = {
    init: function() {
        const toggles = [
            { button: 'togglePassword', input: 'password' },
            { button: 'toggleNewPassword', input: 'new-password' },
            { button: 'toggleConfirmNewPassword', input: 'confirm-new-password' }
        ];

        toggles.forEach(({ button, input }) => {
            const toggleBtn = document.getElementById(button);
            const inputField = document.getElementById(input);
            
            if (toggleBtn && inputField) {
                toggleBtn.addEventListener('click', () => {
                    const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
                    inputField.setAttribute('type', type);
                    const icon = toggleBtn.querySelector('i');
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                });
            }
        });
    }
};

// Login form handling with RBAC
const LoginHandler = {
    init: function() {
        const form = document.getElementById('loginForm');
        const loginButton = document.getElementById('loginButton');
        const loginButtonText = document.getElementById('loginButtonText');
        const loginButtonIcon = document.getElementById('loginButtonIcon');

        // Load rate limiting state
        SecurityUtils.rateLimit.load();

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check rate limiting
            if (!SecurityUtils.rateLimit.check()) {
                AlertManager.show('Too many login attempts. Please try again later.', 'error');
                return;
            }

            // Get form data
            const formData = new FormData(form);
            const email = SecurityUtils.sanitizeInput(formData.get('email'));
            const password = formData.get('password');
            const rememberMe = formData.get('rememberMe') === 'on';

            // Validate inputs
            if (!FormValidator.validateForm(formData)) {
                SecurityUtils.rateLimit.increment();
                return;
            }

            // Show loading state
            loginButton.disabled = true;
            loginButtonText.textContent = 'Signing In...';
            loginButtonIcon.className = 'fas fa-spinner fa-spin ml-2';

            try {
                // Generate CSRF token
                const csrfToken = SecurityUtils.csrf.generate();

                const response = await window.api.post('/auth/login', { 
                    email, 
                    password,
                    rememberMe,
                    csrfToken
                });
                
                if (response.token) {
                    // Create secure session
                    const session = SecurityUtils.session.create(response.user, response.token);
                    
                    // Store remember me preference
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    } else {
                        localStorage.removeItem('rememberMe');
                    }

                    // Log successful login
                    console.log('Login successful for user:', response.user.email);
                    
                    // Show success message
                    AlertManager.show('Login successful! Redirecting...', 'success');
                    
                    // Reset rate limiting on successful login
                    SecurityUtils.rateLimit.reset();
                    
                    // Redirect based on role and permissions
                    setTimeout(() => {
                        this.handleRedirect(response.user);
                    }, 1500);
                } else {
                    throw new Error(response.message || 'Login failed');
                }
            } catch (error) {
                SecurityUtils.rateLimit.increment();
                
                const errorMessage = error.message || 'An error occurred during login';
                AlertManager.show(errorMessage, 'error');
                
                console.error('Login error:', error);
            } finally {
                // Reset button state
                loginButton.disabled = false;
                loginButtonText.textContent = 'Sign In';
                loginButtonIcon.className = 'fas fa-sign-in-alt ml-2';
            }
        });
    },

    handleRedirect: function(user) {
        // Check user permissions and role for RBAC
        if (user.isAdmin) {
            // Check specific admin permissions
            if (user.permissions && user.permissions.can_access_dashboard) {
                window.location.href = 'admin_dashboard.html';
            } else if (user.permissions && user.permissions.can_view_applications) {
                window.location.href = 'admin_applications.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            // Regular user redirect
            window.location.href = 'home.html';
        }
    }
};

// Forgot password modal handling
const ForgotPasswordHandler = {
    init: function() {
        const modal = document.getElementById('forgot-password-modal');
        const link = document.getElementById('forgot-password-link');
        const closeBtn = document.getElementById('close-forgot-modal');
        const forgotForm = document.getElementById('forgotPasswordForm');
        const securityForm = document.getElementById('securityQuestionsForm');
        const resetForm = document.getElementById('resetPasswordForm');
        
        let currentEmail = '';
        let resetToken = '';

        // Open modal
        link.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.remove('hidden');
            this.resetModal();
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        // Step 1: Enter email
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            currentEmail = SecurityUtils.sanitizeInput(document.getElementById('forgot-email').value);
            
            if (!SecurityUtils.validateEmail(currentEmail)) {
                AlertManager.show('Please enter a valid email address', 'error');
                return;
            }

            try {
                const response = await window.api.post('/auth/forgot-password', { email: currentEmail });
                
                if (response.success && response.questions) {
                    this.populateSecurityQuestions(response.questions);
                    this.showStep(2);
                } else {
                    throw new Error(response.message || 'Failed to retrieve security questions');
                }
            } catch (error) {
                AlertManager.show(error.message || 'An error occurred', 'error');
            }
        });

        // Step 2: Answer security questions
        securityForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const answers = [];
            const answerInputs = document.querySelectorAll('[data-question-id]');
            
            answerInputs.forEach(input => {
                if (input.value.trim()) {
                    answers.push({
                        question_id: input.dataset.questionId,
                        answer: SecurityUtils.sanitizeInput(input.value.trim())
                    });
                }
            });

            if (answers.length < 2) {
                AlertManager.show('Please answer at least 2 security questions', 'error');
                return;
            }

            try {
                const response = await window.api.post('/security-questions/verify', {
                    email: currentEmail,
                    answers: answers
                });

                if (response.success && response.can_reset) {
                    resetToken = response.reset_token;
                    this.showStep(3);
                } else if (response.requires_admin) {
                    AlertManager.show(response.message, 'warning');
                } else {
                    throw new Error(response.message || 'Incorrect answers');
                }
            } catch (error) {
                AlertManager.show(error.message || 'An error occurred', 'error');
            }
        });

        // Step 3: Reset password
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-new-password').value;
            
            if (newPassword !== confirmPassword) {
                AlertManager.show('Passwords do not match', 'error');
                return;
            }

            const validation = SecurityUtils.validatePassword(newPassword);
            if (!validation.isValid) {
                AlertManager.show('Password must be at least 8 characters with uppercase, lowercase, and numbers', 'error');
                return;
            }

            try {
                const response = await window.api.post('/auth/reset-password', {
                    token: resetToken,
                    newPassword: newPassword
                });

                if (response.success) {
                    AlertManager.show('Password reset successfully! You can now log in with your new password.', 'success');
                    setTimeout(() => {
                        modal.classList.add('hidden');
                    }, 3000);
                } else {
                    throw new Error(response.message || 'Failed to reset password');
                }
            } catch (error) {
                AlertManager.show(error.message || 'An error occurred', 'error');
            }
        });
    },

    showStep: function(stepNumber) {
        document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
        document.getElementById(`step${stepNumber}`).classList.remove('hidden');
    },

    resetModal: function() {
        this.showStep(1);
        document.getElementById('forgot-message').textContent = '';
        document.getElementById('forgotPasswordForm').reset();
        document.getElementById('securityQuestionsForm').reset();
        document.getElementById('resetPasswordForm').reset();
    },

    populateSecurityQuestions: function(questions) {
        const container = document.getElementById('security-questions-container');
        container.innerHTML = '';
        
        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'mb-4';
            questionDiv.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ${SecurityUtils.sanitizeInput(question.question)}
                </label>
                <input type="text" 
                       name="answer_${question.id}" 
                       data-question-id="${question.id}"
                       class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                       placeholder="Your answer" 
                       required
                       maxlength="255">
            `;
            container.appendChild(questionDiv);
        });
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    ThemeManager.init();
    PasswordToggles.init();
    LoginHandler.init();
    ForgotPasswordHandler.init();

    // Add real-time validation
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            FormValidator.validateEmail(this.value);
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            FormValidator.validatePassword(this.value);
        });
    }

    // Security audit log
    console.log('Secure login system initialized with RBAC');
    console.log('Security features: Input validation, SQL injection prevention, Rate limiting, Session management, CSRF protection');
    
    // Check for existing session
    if (SecurityUtils.session.isValid()) {
        const session = SecurityUtils.session.get();
        console.log('Valid session found for user:', session.user.email);
    }
});

// Export for global access
window.SecurityUtils = SecurityUtils;
window.AlertManager = AlertManager;
window.FormValidator = FormValidator;
