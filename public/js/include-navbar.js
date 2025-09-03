// js/include-navbar.js

/**
 * Robust navbar inclusion system with proper error handling and timing management
 * This ensures the dashboard link and all navbar functionality works correctly
 */

// Global state management
let navbarState = {
    isLoaded: false,
    isInitialized: false,
    elements: {},
    retryCount: 0,
    maxRetries: 3
};

// Main navbar inclusion function
async function includeNavbar() {
    try {
        console.log('🚀 Starting navbar inclusion...');
        
        // Fetch navbar HTML
        const response = await fetch('navbar.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        const navbarContainer = document.getElementById('navbar-container');
        
        if (!navbarContainer) {
            throw new Error('Navbar container not found!');
        }
        
        // Inject HTML
            navbarContainer.innerHTML = html;
        navbarState.isLoaded = true;
        console.log('✅ Navbar HTML injected successfully');
        
        // Wait for DOM to be ready, then initialize
        await waitForDOMReady();
        await initializeNavbar();
        
    } catch (error) {
        console.error('❌ Error loading navbar:', error);
        handleNavbarError(error);
    }
}

// Wait for DOM elements to be available
async function waitForDOMReady() {
    return new Promise((resolve) => {
        const checkElements = () => {
            const requiredElements = [
                'theme-toggle', 'userMenu', 'userMenuButton', 'userMenuDropdown',
                'authButtons', 'userNameDisplay', 'adminDashboardBtn', 'logoutButton'
            ];
            
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length === 0) {
                console.log('✅ All required DOM elements found');
                resolve();
            } else {
                console.log('⏳ Waiting for elements:', missingElements);
                setTimeout(checkElements, 100);
            }
        };
        
        checkElements();
    });
}

// Initialize all navbar functionality
async function initializeNavbar() {
    try {
        console.log('🔧 Initializing navbar functionality...');
        
        // Get all required elements
        const elements = {
            themeToggleBtn: document.getElementById('theme-toggle'),
            themeToggleDarkIcon: document.getElementById('theme-toggle-dark-icon'),
            themeToggleLightIcon: document.getElementById('theme-toggle-light-icon'),
            userMenu: document.getElementById('userMenu'),
            userMenuButton: document.getElementById('userMenuButton'),
            userMenuDropdown: document.getElementById('userMenuDropdown'),
            authButtons: document.getElementById('authButtons'),
            userNameDisplay: document.getElementById('userNameDisplay'),
            adminDashboardBtn: document.getElementById('adminDashboardBtn'),
            logoutButton: document.getElementById('logoutButton'),
            mobileMenuButton: document.getElementById('mobile-menu-button'),
            mobileMenu: document.getElementById('mobile-menu'),
            mobileMenuClose: document.getElementById('mobile-menu-close'),
            mobileMenuBackdrop: document.getElementById('mobile-menu-backdrop'),
            mobileAuthButtons: document.getElementById('mobileAuthButtons')
        };
        
        // Store elements globally
        navbarState.elements = elements;
        
        // Validate critical elements
        if (!elements.adminDashboardBtn) {
            console.log('⚠️ Admin dashboard button not found - this is normal for non-admin users');
        } else {
            console.log('🔍 Admin dashboard button found:', elements.adminDashboardBtn);
            console.log('🔍 Button classes:', elements.adminDashboardBtn.className);
            console.log('🔍 Button hidden:', elements.adminDashboardBtn.classList.contains('hidden'));
        }
        
        // Initialize all systems
        initializeTheme(elements);
        initializeUserMenu(elements);
        initializeMobileMenu(elements);
        initializeAuthSystem(elements);
        
        // Set up event listeners
        setupEventListeners(elements);
        
        // Initial auth state update
        await updateAuthState(elements);
        
        navbarState.isInitialized = true;
        console.log('✅ Navbar initialization complete!');
        
        // Add debugging functions to window
        addDebugFunctions(elements);
        
    } catch (error) {
        console.error('❌ Error initializing navbar:', error);
        throw error;
    }
}

// Initialize theme system
function initializeTheme(elements) {
    const { themeToggleBtn, themeToggleDarkIcon, themeToggleLightIcon } = elements;
    
    if (!themeToggleBtn) return;
    
    // Set initial theme
    if (localStorage.getItem('color-theme') === 'dark' || 
        (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    if (themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
        if (themeToggleDarkIcon) themeToggleDarkIcon.classList.add('hidden');
                } else {
                    document.documentElement.classList.remove('dark');
                    if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
        if (themeToggleLightIcon) themeToggleLightIcon.classList.add('hidden');
            }

    // Theme toggle handler
    themeToggleBtn.addEventListener('click', () => {
                themeToggleDarkIcon?.classList.toggle('hidden');
                themeToggleLightIcon?.classList.toggle('hidden');

                if (localStorage.getItem('color-theme')) {
                    if (localStorage.getItem('color-theme') === 'light') {
                        document.documentElement.classList.add('dark');
                        localStorage.setItem('color-theme', 'dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                        localStorage.setItem('color-theme', 'light');
                    }
                } else {
                    if (document.documentElement.classList.contains('dark')) {
                        document.documentElement.classList.remove('dark');
                        localStorage.setItem('color-theme', 'light');
                    } else {
                        document.documentElement.classList.add('dark');
                        localStorage.setItem('color-theme', 'dark');
                    }
                }
            });
}

// Initialize user menu system
function initializeUserMenu(elements) {
    const { userMenuButton, userMenuDropdown, userMenu } = elements;
    
    if (!userMenuButton || !userMenuDropdown) return;
    
    // Toggle dropdown
    userMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenuDropdown.classList.toggle('hidden');
        console.log('🔄 User menu toggled, hidden:', userMenuDropdown.classList.contains('hidden'));
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (userMenu && !userMenu.contains(e.target)) {
            userMenuDropdown.classList.add('hidden');
        }
    });
}

// Initialize mobile menu system
function initializeMobileMenu(elements) {
    const { mobileMenuButton, mobileMenu, mobileMenuClose, mobileMenuBackdrop } = elements;
    
    if (!mobileMenuButton || !mobileMenu) return;
    
            function toggleMobileMenu() {
                mobileMenu.classList.toggle('show');
        document.body.classList.toggle('overflow-hidden');

        // Toggle icons
                const menuIcon = mobileMenuButton.querySelector('.mobile-menu-icon');
                const closeIcon = mobileMenuButton.querySelector('.mobile-menu-close');
        if (menuIcon && closeIcon) {
            menuIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        }
    }
    
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
            mobileMenuClose?.addEventListener('click', toggleMobileMenu);
            mobileMenuBackdrop?.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking links
    const mobileNav = document.querySelector('#mobileNav');
    if (mobileNav) {
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', toggleMobileMenu);
        });
    }
}

// Initialize authentication system
function initializeAuthSystem(elements) {
    const { logoutButton } = elements;
    
    // Logout handler
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'logout.html';
        });
    }
}

// Set up all event listeners
function setupEventListeners(elements) {
    // Listen for storage changes (login/logout)
    window.addEventListener('storage', () => {
        console.log('🔄 Storage change detected, updating auth state...');
        updateAuthState(elements);
    });
    
    // Listen for custom events
    window.addEventListener('userLogin', () => {
        console.log('🔄 User login event detected, updating auth state...');
        updateAuthState(elements);
    });
    
    window.addEventListener('userLogout', () => {
        console.log('🔄 User logout event detected, updating auth state...');
        updateAuthState(elements);
    });
}

// Update authentication state and dashboard visibility
async function updateAuthState(elements) {
    try {
        const { authButtons, userMenu, userNameDisplay, adminDashboardBtn, mobileAuthButtons } = elements;
        
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || '{}');

        console.log('🔍 Auth State Update:', { 
            token: !!token, 
            user: user.full_name || 'Unknown', 
            isAdmin: user.isAdmin,
            adminType: typeof user.isAdmin
        });
        
        if (token && user && user.full_name) {
            // User is logged in
            console.log('✅ User is logged in:', user.full_name);
            
            // Show user menu, hide auth buttons
            if (authButtons) authButtons.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
            if (userNameDisplay) userNameDisplay.textContent = user.full_name;
            
            // Handle admin dashboard button visibility
            await handleAdminDashboardVisibility(adminDashboardBtn, user);
            
            // Log final admin dashboard button visibility state
            const isAdmin = user.isAdmin === true || user.isAdmin === 1 || user.isAdmin === '1' || user.isAdmin === 'true';
            console.log(`🎯 FINAL RESULT: Admin dashboard button is ${isAdmin ? 'VISIBLE' : 'HIDDEN'} for user ${user.full_name}`);
            
            // Update mobile auth buttons
            updateMobileAuthButtons(mobileAuthButtons, user);
            
        } else {
            // User is not logged in
            console.log('❌ No user logged in');
            
            if (userMenu) userMenu.classList.add('hidden');
            if (authButtons) {
                authButtons.classList.remove('hidden');
                authButtons.innerHTML = `
                    <a href="login.html" class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Login</a>
                    <a href="signup.html" class="bg-blue-500 text-white font-semibold px-6 py-2.5 rounded hover:bg-blue-600 transition-all duration-300 text-sm">Sign Up</a>
                `;
            }
            
            // Hide admin dashboard button for logged out users
            if (adminDashboardBtn) {
                adminDashboardBtn.classList.add('hidden');
                adminDashboardBtn.style.opacity = '0';
                adminDashboardBtn.style.pointerEvents = 'none';
                console.log('🚫 Admin dashboard button hidden for logged out user');
            }
            
            // Update mobile auth buttons
            if (mobileAuthButtons) {
                    mobileAuthButtons.innerHTML = `
                        <div class="flex flex-col space-y-2">
                            <a href="login.html" class="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
                                Login
                            </a>
                            <a href="signup.html" class="block w-full text-center border border-blue-500 text-blue-500 py-2 rounded hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                                Sign Up
                            </a>
                        </div>
                    `;
                }
            }

    } catch (error) {
        console.error('❌ Error updating auth state:', error);
    }
}

// Handle admin dashboard button visibility
async function handleAdminDashboardVisibility(adminDashboardBtn, user) {
    if (!adminDashboardBtn) {
        console.log('❌ Admin dashboard button element not found');
        return;
    }
    
    console.log('🔍 Processing admin dashboard button visibility for user:', user);
    console.log('🔍 User isAdmin value:', user.isAdmin);
    console.log('🔍 User isAdmin type:', typeof user.isAdmin);
    console.log('🔍 Admin dashboard button current state:', {
        hidden: adminDashboardBtn.classList.contains('hidden'),
        display: adminDashboardBtn.style.display,
        visibility: adminDashboardBtn.style.visibility
    });
    
    // Check if user is admin (multiple ways to check)
    const isAdmin = user.isAdmin === true || user.isAdmin === 1 || user.isAdmin === '1' || user.isAdmin === 'true';
    
    console.log('🔍 Final admin determination:', isAdmin);
    
    if (isAdmin) {
        console.log('✅ Admin user detected - showing admin dashboard button');
        
        // Remove hidden class
        adminDashboardBtn.classList.remove('hidden');
        
        // Force remove any remaining hidden styles
        adminDashboardBtn.style.opacity = '1';
        adminDashboardBtn.style.pointerEvents = 'auto';
        
        console.log('✅ Admin dashboard button should now be visible');
        console.log('🔍 Admin dashboard button final state:', {
            hidden: adminDashboardBtn.classList.contains('hidden'),
            opacity: adminDashboardBtn.style.opacity
        });
        
    } else {
        console.log('❌ Regular user - hiding admin dashboard button');
        console.log('🚫 Admin dashboard button will NOT be visible for this user');
        
        if (adminDashboardBtn) {
            adminDashboardBtn.classList.add('hidden');
            adminDashboardBtn.style.opacity = '0';
            adminDashboardBtn.style.pointerEvents = 'none';
            console.log('✅ Admin dashboard button hidden successfully');
        }
    }
}

// Update mobile auth buttons
function updateMobileAuthButtons(mobileAuthButtons, user) {
    if (!mobileAuthButtons) return;
    
    console.log('📱 Mobile auth buttons updated for user:', user.full_name);
    
    mobileAuthButtons.innerHTML = `
        <div class="flex flex-col space-y-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Signed in as</span>
            <span class="font-medium text-gray-800 dark:text-white">${user.full_name || 'User'}</span>
            <a href="help-center.html" 
                class="block w-full text-center border border-blue-500 text-blue-500 py-2 rounded hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                Help Center
            </a>
            <button id="mobileLogoutButton" 
                class="block w-full text-center text-red-600 hover:text-red-700 py-2 transition-colors">
                Logout
            </button>
        </div>
    `;
    
    // Add mobile logout handler
    document.getElementById('mobileLogoutButton')?.addEventListener('click', () => {
        window.location.href = 'logout.html';
    });
}

// Add debugging functions to window
function addDebugFunctions(elements) {
    // Force show admin dashboard button for testing
    window.forceShowDashboard = function() {
        const { adminDashboardBtn } = elements;
        if (adminDashboardBtn) {
            adminDashboardBtn.classList.remove('hidden');
            adminDashboardBtn.style.opacity = '1';
            adminDashboardBtn.style.pointerEvents = 'auto';
            console.log('🚨 Admin dashboard button FORCED visible!');
        } else {
            console.log('❌ Admin dashboard button element not found!');
        }
    };
    
        // Check and show admin dashboard button based on admin status
    window.checkAndShowDashboard = function() {
        const { adminDashboardBtn } = elements;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        console.log('🔍 Current user data:', user);
        console.log('🔍 Is admin?', user.isAdmin);
        console.log('🔍 Admin dashboard button element:', adminDashboardBtn);
        
        if (user.isAdmin === true || user.isAdmin === 1 || user.isAdmin === '1' || user.isAdmin === 'true') {
            console.log('✅ User is admin - showing admin dashboard button');
            if (adminDashboardBtn) {
                adminDashboardBtn.classList.remove('hidden');
                adminDashboardBtn.style.opacity = '1';
                adminDashboardBtn.style.pointerEvents = 'auto';
                console.log('✅ Admin dashboard button should now be visible');
            }
        } else {
            console.log('❌ User is NOT admin - hiding admin dashboard button');
            if (adminDashboardBtn) {
                adminDashboardBtn.classList.add('hidden');
                adminDashboardBtn.style.opacity = '0';
                adminDashboardBtn.style.pointerEvents = 'none';
            }
        }
    };
    
    // Test admin dashboard button visibility
    window.testDashboardVisibility = function() {
        const { adminDashboardBtn } = elements;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        console.log('🧪 Testing Admin Dashboard Button Visibility');
        console.log('Current user:', user);
        console.log('User isAdmin:', user.isAdmin);
        console.log('User isAdmin type:', typeof user.isAdmin);
        
        console.log('📊 Admin Dashboard Button Status:');
        if (adminDashboardBtn) {
            console.log('  - Element exists: ✅');
            console.log('  - Classes:', adminDashboardBtn.className);
            console.log('  - Hidden class:', adminDashboardBtn.classList.contains('hidden'));
            console.log('  - Opacity style:', adminDashboardBtn.style.opacity);
            console.log('  - Pointer events:', adminDashboardBtn.style.pointerEvents);
        } else {
            console.log('  - Element exists: ❌');
        }
        
        // Test force visibility
        if (adminDashboardBtn) {
            adminDashboardBtn.classList.remove('hidden');
            adminDashboardBtn.style.opacity = '1';
            adminDashboardBtn.style.pointerEvents = 'auto';
            console.log('✅ Admin dashboard button forced visible for testing');
        }
    };
    
    // Test admin status function
    window.testAdminStatus = function() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const adminDashboardBtn = document.getElementById('adminDashboardBtn');
        
        console.log('🧪 TESTING ADMIN STATUS');
        console.log('Current user:', user);
        console.log('User isAdmin:', user.isAdmin);
        console.log('User isAdmin type:', typeof user.isAdmin);
        console.log('Admin dashboard button:', adminDashboardBtn);
        
        if (adminDashboardBtn) {
            console.log('Button classes:', adminDashboardBtn.className);
            console.log('Button hidden:', adminDashboardBtn.classList.contains('hidden'));
            console.log('Button display:', adminDashboardBtn.style.display);
            console.log('Button opacity:', adminDashboardBtn.style.opacity);
        }
        
        // Test the admin detection logic
        const isAdmin = user.isAdmin === true || user.isAdmin === 1 || user.isAdmin === '1' || user.isAdmin === 'true';
        console.log('Final admin determination:', isAdmin);
        
        if (isAdmin) {
            alert('✅ You are ADMIN! Dashboard button should be visible.');
            // Force show the button
            if (adminDashboardBtn) {
                adminDashboardBtn.classList.remove('hidden');
                adminDashboardBtn.style.opacity = '1';
                adminDashboardBtn.style.pointerEvents = 'auto';
                console.log('✅ Dashboard button force shown!');
            }
        } else {
            alert('❌ You are NOT admin. Dashboard button will be hidden.');
            // Force hide the button
            if (adminDashboardBtn) {
                adminDashboardBtn.classList.add('hidden');
                adminDashboardBtn.style.opacity = '0';
                adminDashboardBtn.style.pointerEvents = 'none';
                console.log('✅ Dashboard button force hidden!');
            }
        }
    };
    
    // Get navbar state
    window.getNavbarState = function() {
        return navbarState;
    };

    // Simple debug function to check current state
    window.debugDashboardButton = function() {
        const adminDashboardBtn = document.getElementById('adminDashboardBtn');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        console.log('🔍 DEBUG: Dashboard Button State');
        console.log('Button element:', adminDashboardBtn);
        console.log('Button exists:', !!adminDashboardBtn);
        if (adminDashboardBtn) {
            console.log('Button classes:', adminDashboardBtn.className);
            console.log('Button hidden:', adminDashboardBtn.classList.contains('hidden'));
            console.log('Button style.display:', adminDashboardBtn.style.display);
            console.log('Button style.opacity:', adminDashboardBtn.style.opacity);
        }
        console.log('Current user:', user);
        console.log('User isAdmin:', user.isAdmin);
        console.log('User isAdmin type:', typeof user.isAdmin);
    };
    
    console.log('🔧 Debug functions added to window object');
}

// Handle navbar loading errors
function handleNavbarError(error) {
    console.error('❌ Navbar loading failed:', error);
    
    if (navbarState.retryCount < navbarState.maxRetries) {
        navbarState.retryCount++;
        console.log(`🔄 Retrying navbar load (${navbarState.retryCount}/${navbarState.maxRetries})...`);
        
        setTimeout(() => {
            includeNavbar();
        }, 1000 * navbarState.retryCount);
    } else {
        console.error('❌ Max retries reached, navbar failed to load');
        
        // Show fallback navbar
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> Failed to load navigation bar. Please refresh the page.
                </div>
            `;
        }
    }
}

// Force hide admin dashboard button immediately
function forceHideAdminDashboardButton() {
    console.log('🚫 FORCE HIDING ADMIN DASHBOARD BUTTON IMMEDIATELY');
    
    // Hide admin dashboard button
    const adminDashboardBtn = document.getElementById('adminDashboardBtn');
    
    if (adminDashboardBtn) {
        adminDashboardBtn.classList.add('hidden');
        adminDashboardBtn.style.opacity = '0';
        adminDashboardBtn.style.pointerEvents = 'none';
        console.log('✅ Admin dashboard button force hidden');
    } else {
        console.log('❌ Admin dashboard button element not found');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        forceHideAdminDashboardButton();
        includeNavbar();
    });
} else {
    forceHideAdminDashboardButton();
    includeNavbar();
}

// Export for potential external use
window.includeNavbar = includeNavbar;
