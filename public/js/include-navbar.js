// js/include-navbar.js
// Updated: 2024-01-XX - Removed userNameDisplay references

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

// Helper: hide/show navbar container cleanly
function hideNavbarContainer() {
    const container = document.getElementById('navbar-container');
    if (!container) return;
    // Smooth fade support
    container.style.transition = container.style.transition || 'opacity 200ms ease';
    container.style.willChange = 'opacity';
    container.style.visibility = 'hidden';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
}

function showNavbarContainer() {
    const container = document.getElementById('navbar-container');
    if (!container) return;
    container.style.transition = container.style.transition || 'opacity 200ms ease';
    container.style.willChange = 'opacity';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.style.pointerEvents = 'auto';
}

// Wait until profile avatar is ready (image loaded or fallback initials visible), or timeout
function waitForAvatarReady(timeoutMs = 800) {
    return new Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
            const img = document.getElementById('profilePhoto');
            const fallback = document.getElementById('profilePhotoFallback');
            const imgVisible = img && !img.classList.contains('hidden');
            const fallbackVisible = fallback && !fallback.classList.contains('hidden');
            if (imgVisible || fallbackVisible || (Date.now() - start) > timeoutMs) {
                return resolve();
            }
            setTimeout(tick, 40);
        };
        tick();
    });
}

// Main navbar inclusion function
async function includeNavbar() {
    try {
        console.log('🚀 Starting navbar inclusion...');
        
        // Check if navbar container exists
        const navbarContainer = document.getElementById('navbar-container');
        if (!navbarContainer) {
            console.log('⚠️ Navbar container not found, skipping navbar inclusion');
            return;
        }
        // Hide navbar until fully initialized
        hideNavbarContainer();
        
        // Fetch navbar HTML (absolute path + cache-buster to avoid stale SW/CDN)
        const response = await fetch('/navbar.html?v=2', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // Inject HTML
        navbarContainer.innerHTML = html;
        navbarState.isLoaded = true;
        console.log('✅ Navbar HTML injected successfully');
        
        // Wait for DOM to be ready, then initialize
        await waitForDOMReady();
        await initializeNavbar();
        // Wait for avatar/admin to resolve, then reveal
        await waitForAvatarReady();
        showNavbarContainer();
        
    } catch (error) {
        console.error('❌ Error loading navbar:', error);
        handleNavbarError(error);
    }
}

// Wait for DOM elements to be available
async function waitForDOMReady() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait time
        
        const checkElements = () => {
            attempts++;
            const requiredElements = [
                'theme-toggle', 'userMenu', 'profilePhotoButton',
                'authButtons'
            ];
            
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length === 0) {
                console.log('✅ All required DOM elements found');
                resolve();
            } else if (attempts >= maxAttempts) {
                console.log('⚠️ Timeout waiting for elements, proceeding anyway:', missingElements);
                resolve();
            } else {
                console.log('⏳ Waiting for elements:', missingElements, `(attempt ${attempts}/${maxAttempts})`);
                // Debug: Check if userNameDisplay is being looked for
                if (missingElements.includes('userNameDisplay')) {
                    console.error('❌ ERROR: userNameDisplay should not be in required elements! This indicates a caching issue.');
                }
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
            userMenuButton: document.getElementById('profilePhotoButton'),
            authButtons: document.getElementById('authButtons'),
            adminDashboardBtn: document.getElementById('adminDashboardBtn'),
            mobileMenuButton: document.getElementById('mobile-menu-button'),
            mobileMenu: document.getElementById('mobile-menu'),
            mobileMenuClose: document.getElementById('mobile-menu-close'),
            mobileMenuBackdrop: document.getElementById('mobile-menu-backdrop'),
            mobileAuthButtons: document.getElementById('mobileAuthButtons'),
            notificationBell: document.getElementById('notification-bell'),
            notificationDropdown: document.getElementById('notification-dropdown'),
            notificationList: document.getElementById('notification-list'),
            notificationBadge: document.getElementById('notification-badge'),
            noNotifications: document.getElementById('no-notifications')
        };
        
        // Log missing elements for debugging
        const missingElements = Object.entries(elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);
        
        if (missingElements.length > 0) {
            console.log('⚠️ Some elements not found:', missingElements);
        }
        
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
        initializeNotifications(elements);
        initializeProfileModal();
        
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

// Initialize user profile photo system
function initializeUserMenu(elements) {
    const { userMenuButton, userMenu } = elements;
    
    if (!userMenuButton) return;
    
    // Handle profile photo click
    userMenuButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Open profile modal
        openProfileModal();
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
    // Logout is now handled in the profile modal
    // No direct logout button in navbar anymore
}

// Profile modal functions
function openProfileModal() {
    const modal = document.getElementById('profileModal');
    if (!modal) return;
    
    // Load user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fullName = user.full_name || user.fullName || 'User';
    const email = user.email || 'user@example.com';
    const profilePicture =
        user.profile_picture ||
        user.profile_picture_path ||
        user.profile_picture_url ||
        user.avatar ||
        user.avatar_url ||
        '';
    const role = user.isAdmin ? 'Admin' : 'User';
    const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';
    
    // Update modal content
    const nameEl = document.getElementById('profileModalName');
    const emailEl = document.getElementById('profileModalEmail');
    const avatarEl = document.getElementById('profileModalAvatar');
    const fallbackEl = document.getElementById('profileModalFallback');
    const roleEl = document.getElementById('profileModalRole');
    const fullNameEl = document.getElementById('profileModalFullName');
    const emailDetailEl = document.getElementById('profileModalEmailDetail');
    const roleDetailEl = document.getElementById('profileModalRoleDetail');
    const joinDateEl = document.getElementById('profileModalJoinDate');
    
    if (nameEl) nameEl.textContent = fullName;
    if (emailEl) emailEl.textContent = email;
    if (roleEl) roleEl.textContent = role;
    if (fullNameEl) fullNameEl.textContent = fullName;
    if (emailDetailEl) emailDetailEl.textContent = email;
    if (roleDetailEl) roleDetailEl.textContent = role;
    if (joinDateEl) joinDateEl.textContent = joinDate;
    
    // Handle profile picture
    if (profilePicture) {
        const src = profilePicture.startsWith('http') 
            ? profilePicture 
            : (profilePicture.startsWith('/') ? profilePicture : '/' + profilePicture);
        if (avatarEl) {
            avatarEl.onerror = () => {
                if (fallbackEl) fallbackEl.classList.remove('hidden');
                avatarEl.classList.add('hidden');
            };
            avatarEl.src = src;
            avatarEl.classList.remove('hidden');
        }
        if (fallbackEl) fallbackEl.classList.add('hidden');
    } else {
        // Show initials
        const initials = fullName.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        if (fallbackEl) {
            fallbackEl.textContent = initials || 'U';
            fallbackEl.classList.remove('hidden');
        }
        if (avatarEl) avatarEl.classList.add('hidden');
    }
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Update profile photo in navbar
function updateProfilePhoto(user) {
    const profilePhoto = document.getElementById('profilePhoto');
    const profilePhotoFallback = document.getElementById('profilePhotoFallback');
    
    if (!profilePhoto || !profilePhotoFallback) return;
    
    const profilePicture =
        user.profile_picture ||
        user.profile_picture_path ||
        user.profile_picture_url ||
        user.avatar ||
        user.avatar_url ||
        '';
    const fullName = user.full_name || user.fullName || 'User';
    
    if (profilePicture) {
        const src = profilePicture.startsWith('http') 
            ? profilePicture 
            : (profilePicture.startsWith('/') ? profilePicture : '/' + profilePicture);

        // Keep initials visible until the image is fully loaded to avoid flicker
        const initials = fullName.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        profilePhotoFallback.textContent = initials || 'U';
        profilePhotoFallback.classList.remove('hidden');
        profilePhoto.classList.add('hidden');

        // If the same src is already applied and visible, don't re-load
        if (profilePhoto.dataset.currentSrc === src && !profilePhoto.classList.contains('hidden')) {
            return;
        }

        const preloader = new Image();
        preloader.onload = () => {
            profilePhoto.src = src;
            profilePhoto.dataset.currentSrc = src;
            profilePhoto.classList.remove('hidden');
            profilePhotoFallback.classList.add('hidden');
        };
        preloader.onerror = () => {
            profilePhoto.classList.add('hidden');
            profilePhotoFallback.classList.remove('hidden');
        };
        preloader.src = src;
    } else {
        // Show initials
        const initials = fullName.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        profilePhotoFallback.textContent = initials || 'U';
        profilePhotoFallback.classList.remove('hidden');
        profilePhoto.classList.add('hidden');
    }
}

// Initialize profile modal
function initializeProfileModal() {
    const modal = document.getElementById('profileModal');
    const closeBtn = document.getElementById('closeProfileModal');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    
    if (!modal) return;
    
    // Close button handler
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProfileModal);
    }
    
    // Edit profile button
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            closeProfileModal();
            openEditProfileModal();
        });
    }
    
    // Change password button
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            closeProfileModal();
            openChangePasswordModal();
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            closeProfileModal();
            window.location.href = 'logout.html';
        });
    }
    
    // Change photo button
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', () => {
            closeProfileModal();
            openPhotoUploadModal();
        });
    }
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProfileModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeProfileModal();
        }
    });
    
    // Initialize other modals
    initializeEditProfileModal();
    initializeChangePasswordModal();
    initializePhotoUploadModal();
}

// Initialize notifications (bell + dropdown)
function initializeNotifications(elements) {
    const { notificationBell, notificationDropdown, notificationBadge } = elements;
    if (!notificationBell) {
        console.error('[Notifications] notificationBell element not found');
        return;
    }
    if (!notificationDropdown) {
        console.warn('[Notifications] notificationDropdown not found (navigation mode will still work)');
    }

    // Initial diagnostics
    try {
        const rect = notificationBell.getBoundingClientRect();
        console.log('[Notifications] Bell ready', {
            exists: !!notificationBell,
            classes: notificationBell.className,
            rect: { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) },
            computedDisplay: window.getComputedStyle(notificationBell).display,
            computedVisibility: window.getComputedStyle(notificationBell).visibility,
            computedPointerEvents: window.getComputedStyle(notificationBell).pointerEvents
        });
    } catch (e) {
        console.log('[Notifications] Unable to measure bell:', e?.message || e);
    }

    // Common handler for activating the bell (click/touch)
    let bellNavigated = false;
    async function onBellActivate(e) {
        console.log('[Notifications] Bell click detected', {
            target: e.target && (e.target.id || e.target.tagName),
            time: new Date().toISOString()
        });
        try {
            e.preventDefault();
        } catch {}
        
        // Add loading state to bell
        const originalContent = notificationBell.innerHTML;
        notificationBell.innerHTML = `
            <svg class="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        `;
        notificationBell.disabled = true;

        // Fire-and-forget preload with timeout; do not block navigation (better on mobile)
        const token = localStorage.getItem('token');
        const preload = (async () => {
            try {
                if (token) {
                    const controller = new AbortController();
                    const t = setTimeout(() => controller.abort(), 1500);
                    const response = await fetch('/api/notifications', {
                        headers: { 'Authorization': `Bearer ${token}` },
                        signal: controller.signal
                    });
                    clearTimeout(t);
                    if (response.ok) {
                        const notifications = await response.json();
                        sessionStorage.setItem('notifications_cache', JSON.stringify(notifications));
                        sessionStorage.setItem('notifications_timestamp', Date.now().toString());
                    }
                }
            } catch {}
        })();

        // Navigate immediately (improves reliability on small/touch devices)
        if (!bellNavigated) {
            bellNavigated = true;
            const dest = 'notifications.html';
            console.log('[Notifications] Navigating to', dest);
            window.location.href = dest;
        }

        // Restore original state if navigation fails (e.g., SPA env)
        setTimeout(() => {
            try {
                notificationBell.innerHTML = originalContent;
                notificationBell.disabled = false;
            } catch {}
        }, 1200);
    }

    // Navigate to notifications page on click/touch with preloading
    notificationBell.addEventListener('click', onBellActivate, { passive: true });
    notificationBell.addEventListener('touchend', onBellActivate, { passive: true });

    // Expose a small debugger
    window.debugNotificationBell = function() {
        if (!notificationBell) return console.log('[Notifications] Bell not found');
        const rect = notificationBell.getBoundingClientRect();
        console.log('[Notifications] Debug bell', {
            classes: notificationBell.className,
            hiddenClass: notificationBell.classList.contains('hidden'),
            style: {
                display: notificationBell.style.display,
                visibility: notificationBell.style.visibility
            },
            computed: {
                display: window.getComputedStyle(notificationBell).display,
                visibility: window.getComputedStyle(notificationBell).visibility,
                pointerEvents: window.getComputedStyle(notificationBell).pointerEvents,
                zIndex: window.getComputedStyle(notificationBell).zIndex
            },
            rect
        });
    };

    // Unread badge updater - Enhanced to show notifications + chat messages
    async function updateNotificationBadge() {
        try {
            if (!notificationBadge) return;
            const token = localStorage.getItem('token');
            if (!token) {
                notificationBadge.classList.add('hidden');
                return;
            }

            // Try unified endpoint first (notifications + chat messages)
            let count = 0;
            let breakdown = null;
            try {
                const res = await fetch('/api/notifications/unified-count', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    count = Number(data.totalCount || 0);
                    breakdown = data.breakdown;
                    console.log('[Notifications] Unified count:', count, breakdown);
                } else {
                    throw new Error('Unified endpoint not OK');
                }
            } catch {
                // Fallback to user-notifications endpoint
                try {
                    const res = await fetch('/api/user-notifications/unread-count', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        count = Number(data.unreadCount || 0);
                    } else {
                        throw new Error('User notifications endpoint not OK');
                    }
                } catch {
                    // Final fallback to legacy endpoint
                    const res2 = await fetch('/api/notifications/count', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res2.ok) {
                        const data2 = await res2.json();
                        count = Number((data2.count !== undefined ? data2.count : data2.unreadCount) || 0);
                    }
                }
            }

            // Update badge display
            if (count > 0) {
                notificationBadge.textContent = count > 99 ? '99+' : String(count);
                notificationBadge.classList.remove('hidden');
                
                // Add tooltip with breakdown if available
                if (breakdown) {
                    const tooltip = `${breakdown.notifications} notifications, ${breakdown.conversations} conversations`;
                    notificationBadge.title = tooltip;
                }
                
                // Add pulsing animation to bell icon when there are new messages
                if (notificationBell) {
                    notificationBell.classList.add('animate-pulse');
                    // Remove animation after 3 seconds
                    setTimeout(() => {
                        notificationBell.classList.remove('animate-pulse');
                    }, 3000);
                }
            } else {
                notificationBadge.classList.add('hidden');
                notificationBadge.title = '';
                
                // Remove any pulsing animation when no messages
                if (notificationBell) {
                    notificationBell.classList.remove('animate-pulse');
                }
            }
        } catch (err) {
            console.warn('[Notifications] Failed to update badge:', err?.message || err);
        }
    }

    // Initial badge update and more frequent refresh for real-time updates
    updateNotificationBadge();
    setInterval(updateNotificationBadge, 15000); // Update every 15 seconds instead of 60
    
    // Listen for storage changes (login/logout)
    window.addEventListener('storage', (e) => {
        if (e.key === 'token' || e.key === 'user') updateNotificationBadge();
    });
    
    // Listen for custom events for immediate updates
    window.addEventListener('messageRead', () => {
        console.log('[Notifications] Message read event received, updating badge');
        updateNotificationBadge();
    });
    
    window.addEventListener('newMessage', () => {
        console.log('[Notifications] New message event received, updating badge');
        updateNotificationBadge();
    });
    
    // Make updateNotificationBadge globally available
    window.updateNotificationBadge = updateNotificationBadge;
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
        const { authButtons, userMenu, adminDashboardBtn, mobileAuthButtons } = elements;
        
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

            // Immediately render current (cached) avatar to avoid flicker while fetching
            updateProfilePhoto(user);

            // Fetch fresh profile to avoid stale avatar on refresh/logout
            try {
                const res = await fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' });
                if (res.ok) {
                    const prof = await res.json();
                    const profUser = (prof && (prof.user || prof)) || {};
                    const freshUser = { ...user, ...profUser };
                    localStorage.setItem('user', JSON.stringify(freshUser));
                    updateProfilePhoto(freshUser);
                } else {
                    // Fallback: if token exists but profile fails (e.g., wrong base path), keep showing initials
                    console.warn('[Navbar] Profile fetch failed on this origin', res.status, res.statusText);
                    updateProfilePhoto(user);
                }
            } catch {
                updateProfilePhoto(user);
            }
            
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
    
    // Only retry if navbar container exists
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        console.log('⚠️ No navbar container found, skipping error handling');
        return;
    }
    
    if (navbarState.retryCount < navbarState.maxRetries) {
        navbarState.retryCount++;
        console.log(`🔄 Retrying navbar load (${navbarState.retryCount}/${navbarState.maxRetries})...`);
        
        setTimeout(() => {
            includeNavbar();
        }, 1000 * navbarState.retryCount);
    } else {
        console.error('❌ Max retries reached, navbar failed to load');
        
        // Show fallback navbar
        navbarContainer.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>Error:</strong> Failed to load navigation bar. Please refresh the page.
            </div>
        `;
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

// ==================== PROFILE MODAL FUNCTIONS ====================

// Edit Profile Modal Functions
function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;
    
    // Load current user data
    loadUserProfileData();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function initializeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const closeBtn = document.getElementById('closeEditProfileModal');
    const cancelBtn = document.getElementById('cancelEditProfile');
    const form = document.getElementById('editProfileForm');
    
    if (!modal) return;
    
    // Close button handlers
    if (closeBtn) closeBtn.addEventListener('click', closeEditProfileModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeEditProfileModal);
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleEditProfileSubmit);
    }
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeEditProfileModal();
        }
    });
}

async function loadUserProfileData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const user = data.user;
            
            // Populate form fields
            document.getElementById('editFullName').value = user.full_name || '';
            document.getElementById('editEmail').value = user.email || '';
            document.getElementById('editPhone').value = user.phone || '';
            document.getElementById('editBio').value = user.bio || '';
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

async function handleEditProfileSubmit(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('saveProfileBtn');
    const saveText = document.getElementById('saveProfileText');
    const saveLoading = document.getElementById('saveProfileLoading');
    
    // Show loading state
    saveBtn.disabled = true;
    saveText.classList.add('hidden');
    saveLoading.classList.remove('hidden');
    
    try {
        const formData = {
            full_name: document.getElementById('editFullName').value.trim(),
            email: document.getElementById('editEmail').value.trim(),
            phone: document.getElementById('editPhone').value.trim(),
            bio: document.getElementById('editBio').value.trim()
        };
        
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Update localStorage with new user data
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...currentUser, ...result.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Update profile modal display
            updateProfileModalDisplay(updatedUser);
            
            // Close modal
            closeEditProfileModal();
            
            // Show success message
            showAlert('Profile updated successfully!', 'success');
        } else {
            throw new Error(result.error || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showAlert(error.message || 'Failed to update profile', 'error');
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveText.classList.remove('hidden');
        saveLoading.classList.add('hidden');
    }
}

// Change Password Modal Functions
function openChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (!modal) return;
    
    // Clear form
    document.getElementById('changePasswordForm').reset();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function initializeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    const closeBtn = document.getElementById('closeChangePasswordModal');
    const cancelBtn = document.getElementById('cancelChangePassword');
    const form = document.getElementById('changePasswordForm');
    
    if (!modal) return;
    
    // Close button handlers
    if (closeBtn) closeBtn.addEventListener('click', closeChangePasswordModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeChangePasswordModal);
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleChangePasswordSubmit);
    }
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeChangePasswordModal();
        }
    });
}

async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('savePasswordBtn');
    const saveText = document.getElementById('savePasswordText');
    const saveLoading = document.getElementById('savePasswordLoading');
    
    // Show loading state
    saveBtn.disabled = true;
    saveText.classList.add('hidden');
    saveLoading.classList.remove('hidden');
    
    try {
        const formData = {
            currentPassword: document.getElementById('currentPassword').value,
            newPassword: newPassword
        };
        
        const token = localStorage.getItem('token');
        const response = await fetch('/api/password-change/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Close modal
            closeChangePasswordModal();
            
            // Show success message
            showAlert('Password changed successfully!', 'success');
        } else {
            throw new Error(result.error || 'Failed to change password');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showAlert(error.message || 'Failed to change password', 'error');
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveText.classList.remove('hidden');
        saveLoading.classList.add('hidden');
    }
}

// Photo Upload Modal Functions
function openPhotoUploadModal() {
    const modal = document.getElementById('photoUploadModal');
    if (!modal) return;
    
    // Load current photo
    loadCurrentPhoto();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePhotoUploadModal() {
    const modal = document.getElementById('photoUploadModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function initializePhotoUploadModal() {
    const modal = document.getElementById('photoUploadModal');
    const closeBtn = document.getElementById('closePhotoUploadModal');
    const cancelBtn = document.getElementById('cancelPhotoUpload');
    const selectBtn = document.getElementById('selectPhotoBtn');
    const removeBtn = document.getElementById('removePhotoBtn');
    const saveBtn = document.getElementById('savePhotoBtn');
    const fileInput = document.getElementById('photoFileInput');
    const previewImg = document.getElementById('photoPreview');
    const previewFallback = document.getElementById('photoPreviewFallback');
    
    if (!modal) return;
    
    // Close button handlers
    if (closeBtn) closeBtn.addEventListener('click', closePhotoUploadModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closePhotoUploadModal);
    
    // Select photo button
    if (selectBtn && fileInput) {
        selectBtn.addEventListener('click', () => fileInput.click());
    }

    // Make the preview area tappable to open the picker (mobile-friendly)
    if (fileInput && (previewImg || previewFallback)) {
        const openPicker = () => fileInput.click();
        previewImg?.addEventListener('click', openPicker, { passive: true });
        previewFallback?.addEventListener('click', openPicker, { passive: true });
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', handlePhotoSelect);
    }
    
    // Remove photo button
    if (removeBtn) {
        removeBtn.addEventListener('click', handleRemovePhoto);
    }
    
    // Save photo button
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSavePhoto);
    }
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePhotoUploadModal();
        }
    });
}

async function loadCurrentPhoto() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const user = (data && (data.user || data)) || {};
            
            const previewImg = document.getElementById('photoPreview');
            const previewFallback = document.getElementById('photoPreviewFallback');
            
            const picture =
                user.profile_picture ||
                user.profile_picture_path ||
                user.profile_picture_url ||
                user.avatar ||
                user.avatar_url ||
                user.image_path ||
                '';
            
            if (picture && previewImg) {
                const src = picture.startsWith('http') ? picture : (picture.startsWith('/') ? picture : '/' + picture);
                previewImg.onerror = () => {
                    previewImg.classList.add('hidden');
                    previewFallback?.classList.remove('hidden');
                };
                previewImg.src = src;
                previewImg.classList.remove('hidden');
                previewFallback?.classList.add('hidden');
            } else {
                if (previewImg) previewImg.classList.add('hidden');
                if (previewFallback) previewFallback.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error loading current photo:', error);
    }
}

function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showAlert('Please select an image file', 'error');
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('File size must be less than 5MB', 'error');
        return;
    }
    
    // Preview image using object URL (more reliable on mobile)
    try {
        const previewImg = document.getElementById('photoPreview');
        const previewFallback = document.getElementById('photoPreviewFallback');
        if (previewImg) {
            // Revoke any previous object URL to avoid memory leaks
            if (previewImg.dataset.objurl) {
                try { URL.revokeObjectURL(previewImg.dataset.objurl); } catch {}
                previewImg.dataset.objurl = '';
            }
            const objUrl = URL.createObjectURL(file);
            previewImg.src = objUrl;
            previewImg.dataset.objurl = objUrl;
            previewImg.onload = () => {
                try { URL.revokeObjectURL(objUrl); } catch {}
                previewImg.dataset.objurl = '';
            };
            previewImg.classList.remove('hidden');
        }
        if (previewFallback) previewFallback.classList.add('hidden');
    } catch {
        // Fallback to FileReader if object URL fails
        const reader = new FileReader();
        reader.onload = (ev) => {
            const previewImg2 = document.getElementById('photoPreview');
            const previewFallback2 = document.getElementById('photoPreviewFallback');
            if (previewImg2) {
                previewImg2.src = ev.target.result;
                previewImg2.classList.remove('hidden');
            }
            if (previewFallback2) previewFallback2.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

async function handleRemovePhoto() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/remove-photo', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Update preview
            const previewImg = document.getElementById('photoPreview');
            const previewFallback = document.getElementById('photoPreviewFallback');
            
            previewImg.classList.add('hidden');
            previewFallback.classList.remove('hidden');
            
            // Update main profile photo
            updateProfilePhoto({ profile_picture: '' });
            
            showAlert('Profile photo removed successfully!', 'success');
        } else {
            throw new Error(result.error || 'Failed to remove photo');
        }
    } catch (error) {
        console.error('Error removing photo:', error);
        showAlert(error.message || 'Failed to remove photo', 'error');
    }
}

async function handleSavePhoto() {
    const fileInput = document.getElementById('photoFileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('Please select a photo first', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('savePhotoBtn');
    const saveText = document.getElementById('savePhotoText');
    const saveLoading = document.getElementById('savePhotoLoading');
    
    // Show loading state
    saveBtn.disabled = true;
    saveText.classList.add('hidden');
    saveLoading.classList.remove('hidden');
    
    try {
        const formData = new FormData();
        formData.append('photo', file);
        
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/profile/photo', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        // Safely parse JSON only when content-type is JSON
        const contentType = response.headers.get('content-type') || '';
        let result;
        if (contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Unexpected response (${response.status}): ${text.slice(0, 120)}...`);
        }

        if (response.ok && result && result.success !== false) {
            // Extract new path from various possible keys
            const newPath = (result && (
                result.profile_picture ||
                result.profile_picture_path ||
                result.profile_picture_url ||
                result.avatar ||
                result.avatar_url ||
                result.image_path ||
                (result.user && (result.user.profile_picture || result.user.profile_picture_path || result.user.profile_picture_url || result.user.avatar || result.user.avatar_url || result.user.image_path))
            )) || '';
            const cacheBusted = newPath ? `${newPath}${newPath.includes('?') ? '&' : '?'}t=${Date.now()}` : '';
            const freshUser = result.user || {};
            if (freshUser && Object.keys(freshUser).length) {
                localStorage.setItem('user', JSON.stringify(freshUser));
            } else if (newPath) {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...currentUser, profile_picture: newPath };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            updateProfilePhoto({ profile_picture: cacheBusted, full_name: (freshUser.full_name || JSON.parse(localStorage.getItem('user')||'{}').full_name) });
            
            // Confirm persistence by fetching latest profile
            try {
                const verifyRes = await fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' });
                if (verifyRes.ok) {
                    const verifyData = await verifyRes.json();
                    const verifiedUser = (verifyData && (verifyData.user || verifyData)) || null;
                    if (verifiedUser) {
                        localStorage.setItem('user', JSON.stringify(verifiedUser));
                        updateProfilePhoto(verifiedUser);
                    }
                }
            } catch {}
            
            // Close modal
            closePhotoUploadModal();
            
            showAlert('Profile photo updated successfully!', 'success');
        } else {
            throw new Error((result && (result.error || result.message)) || 'Failed to upload photo');
        }
    } catch (error) {
        console.error('Error uploading photo:', error);
        showAlert(error.message || 'Failed to upload photo', 'error');
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveText.classList.remove('hidden');
        saveLoading.classList.add('hidden');
    }
}

// Utility Functions
function updateProfileModalDisplay(user) {
    // Update profile modal content
    const nameEl = document.getElementById('profileModalName');
    const emailEl = document.getElementById('profileModalEmail');
    const avatarEl = document.getElementById('profileModalAvatar');
    const fallbackEl = document.getElementById('profileModalFallback');
    const roleEl = document.getElementById('profileModalRole');
    const fullNameEl = document.getElementById('profileModalFullName');
    const emailDetailEl = document.getElementById('profileModalEmailDetail');
    const roleDetailEl = document.getElementById('profileModalRoleDetail');
    const joinDateEl = document.getElementById('profileModalJoinDate');
    
    if (nameEl) nameEl.textContent = user.full_name || 'User';
    if (emailEl) emailEl.textContent = user.email || 'user@example.com';
    if (roleEl) roleEl.textContent = user.isAdmin ? 'Admin' : 'User';
    if (fullNameEl) fullNameEl.textContent = user.full_name || '-';
    if (emailDetailEl) emailDetailEl.textContent = user.email || '-';
    if (roleDetailEl) roleDetailEl.textContent = user.isAdmin ? 'Admin' : 'User';
    if (joinDateEl) joinDateEl.textContent = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';
    
    // Handle profile picture
    const modalPicture =
        user.profile_picture ||
        user.profile_picture_path ||
        user.profile_picture_url ||
        user.avatar ||
        user.avatar_url ||
        '';
    if (modalPicture) {
        const src = modalPicture.startsWith('http')
            ? modalPicture
            : (modalPicture.startsWith('/') ? modalPicture : '/' + modalPicture);
        if (avatarEl) {
            avatarEl.onerror = () => {
                if (fallbackEl) fallbackEl.classList.remove('hidden');
                avatarEl.classList.add('hidden');
            };
            avatarEl.src = src;
            avatarEl.classList.remove('hidden');
        }
        if (fallbackEl) fallbackEl.classList.add('hidden');
    } else {
        // Show initials
        const initials = (user.full_name || 'User').trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        if (fallbackEl) {
            fallbackEl.textContent = initials || 'U';
            fallbackEl.classList.remove('hidden');
        }
        if (avatarEl) avatarEl.classList.add('hidden');
    }
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    alert.textContent = message;
    
    // Add to page
    document.body.appendChild(alert);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

// Export for potential external use
window.includeNavbar = includeNavbar;
