// Secure Signup JavaScript
document.addEventListener('DOMContentLoaded', function() {
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
            console.log('   ✅ Dark theme applied');
        } else {
            document.documentElement.classList.remove('dark');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('color-theme', 'light');
            console.log('   ✅ Light theme applied');
        }
        
        // Verify the change
        const hasDarkClass = document.documentElement.classList.contains('dark');
        const storedTheme = localStorage.getItem('color-theme');
        console.log(`   📋 Verification - Dark class: ${hasDarkClass}, Stored: ${storedTheme}`);
    }
    
    // Check for saved user preference
    console.log('🎨 Initializing theme...');
    const savedTheme = localStorage.getItem('color-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    console.log(`   📋 Saved theme: ${savedTheme || 'none'}`);
    console.log(`   📋 System preference: ${prefersDark ? 'dark' : 'light'}`);
    
    if (savedTheme) {
        if (savedTheme === 'dark') {
            setTheme(true);
        } else {
            setTheme(false);
        }
    } else if (prefersDark) {
        setTheme(true);
    } else {
        setTheme(false);
    }
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', function() {
        console.log('🎨 Theme toggle clicked!');
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        console.log(`   Current state: ${isCurrentlyDark ? 'dark' : 'light'}`);
        setTheme(!isCurrentlyDark);
        console.log(`   New state: ${!isCurrentlyDark ? 'dark' : 'light'}`);
    });

    // Password visibility toggles
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    togglePassword.addEventListener('click', function () {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    toggleConfirmPassword.addEventListener('click', function () {
        const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPassword.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Password strength validation
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');
    const requirements = {
        length: document.getElementById('req-length'),
        uppercase: document.getElementById('req-uppercase'),
        lowercase: document.getElementById('req-lowercase'),
        number: document.getElementById('req-number'),
        special: document.getElementById('req-special')
    };

    function validatePassword(password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        // Update requirement indicators
        Object.keys(checks).forEach(req => {
            const element = requirements[req];
            if (checks[req]) {
                element.classList.remove('requirement-unmet');
                element.classList.add('requirement-met');
                element.querySelector('i').classList.remove('fa-circle');
                element.querySelector('i').classList.add('fa-check');
            } else {
                element.classList.remove('requirement-met');
                element.classList.add('requirement-unmet');
                element.querySelector('i').classList.remove('fa-check');
                element.querySelector('i').classList.add('fa-circle');
            }
        });

        // Calculate strength
        const metRequirements = Object.values(checks).filter(Boolean).length;

        // Update strength meter
        strengthMeter.className = 'password-strength-meter';
        if (metRequirements <= 2) {
            strengthMeter.classList.add('strength-weak');
            strengthText.textContent = 'Weak password';
        } else if (metRequirements <= 3) {
            strengthMeter.classList.add('strength-fair');
            strengthText.textContent = 'Fair password';
        } else if (metRequirements <= 4) {
            strengthMeter.classList.add('strength-good');
            strengthText.textContent = 'Good password';
        } else {
            strengthMeter.classList.add('strength-strong');
            strengthText.textContent = 'Strong password';
        }

        return metRequirements === 5;
    }

    passwordInput.addEventListener('input', function() {
        validatePassword(this.value);
    });

    // Load security questions
    async function loadSecurityQuestions() {
        try {
            const response = await fetch('/api/security-questions');
            const questions = await response.json();
            
            const container = document.getElementById('securityQuestions');
            container.innerHTML = '';
            
            // Select first 3 questions
            const selectedQuestions = questions.slice(0, 3);
            
            selectedQuestions.forEach((question, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'space-y-2';
                questionDiv.innerHTML = `
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        ${question.question}
                    </label>
                    <input 
                        type="text" 
                        name="security_answer_${index}" 
                        data-question-id="${question.id}"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                        placeholder="Your answer"
                        required
                        maxlength="100"
                    >
                `;
                container.appendChild(questionDiv);
            });
        } catch (error) {
            console.error('Error loading security questions:', error);
        }
    }

    // Form validation
    function validateForm() {
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsAccepted = document.getElementById('termsAccepted').checked;

        // Clear previous errors
        document.querySelectorAll('[id$="-error"]').forEach(el => {
            el.classList.add('hidden');
            el.textContent = '';
        });

        let isValid = true;

        // Validate full name
        if (fullName.length < 2) {
            showError('fullName', 'Full name must be at least 2 characters long');
            isValid = false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!validatePassword(password)) {
            showError('password', 'Password does not meet all requirements');
            isValid = false;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        // Validate security questions
        const securityAnswers = document.querySelectorAll('[data-question-id]');
        securityAnswers.forEach(answer => {
            if (!answer.value.trim()) {
                showError('securityQuestions', 'All security questions must be answered');
                isValid = false;
            }
        });

        // Validate terms
        if (!termsAccepted) {
            showError('terms', 'You must accept the terms and conditions');
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

    // Form submission
    document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Show loading modal
        document.getElementById('loadingModal').style.display = 'flex';

        try {
            // Collect form data
            const formData = {
                full_name: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
                security_questions: []
            };

            // Collect security questions
            const securityAnswers = document.querySelectorAll('[data-question-id]');
            securityAnswers.forEach(answer => {
                formData.security_questions.push({
                    question_id: parseInt(answer.dataset.questionId),
                    answer: answer.value.trim()
                });
            });

            // Submit registration
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            // Hide loading modal
            document.getElementById('loadingModal').style.display = 'none';

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Show success modal
                document.getElementById('successModal').style.display = 'flex';

                // Handle continue button
                document.getElementById('continueButton').addEventListener('click', function() {
                    window.location.href = 'home.html';
                });
            } else {
                showAlert(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            // Hide loading modal
            document.getElementById('loadingModal').style.display = 'none';
            showAlert('An error occurred during registration. Please try again.', 'error');
            console.error('Registration error:', error);
        }
    });

    // Load security questions on page load
    loadSecurityQuestions();

    // Initialize password validation
    validatePassword('');
});
