// js/include-navbar.js

/**
 * Fetches the navbar.html content and injects it into the #navbar-container.
 * Initializes all navbar-related JavaScript functionality after injection.
 */
async function includeNavbar() {
    try {
        const response = await fetch('navbar.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.innerHTML = html;

            // --- Initialize Navbar Functionality after content is loaded ---
            const themeToggleBtn = document.getElementById('theme-toggle');
            const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
            const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
            const userMenu = document.getElementById('userMenu');
            const userMenuButton = document.getElementById('userMenuButton');
            const userMenuDropdown = document.getElementById('userMenuDropdown');
            const authButtons = document.getElementById('authButtons');
            const userNameDisplay = document.getElementById('userNameDisplay');
            const dashboardLink = document.getElementById('dashboardLink');
            const logoutButton = document.getElementById('logoutButton');
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileMenuClose = document.getElementById('mobile-menu-close');
            const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
            const mobileAuthButtons = document.getElementById('mobileAuthButtons');

            // Initialize theme
            function initializeTheme() {
                if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    if (themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
                    if (themeToggleDarkIcon) themeToggleDarkIcon.classList.add('hidden'); // Ensure dark icon is hidden
                } else {
                    document.documentElement.classList.remove('dark');
                    if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
                    if (themeToggleLightIcon) themeToggleLightIcon.classList.add('hidden'); // Ensure light icon is hidden
                }
            }

            // Toggle theme
            themeToggleBtn?.addEventListener('click', function() {
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

            // Mobile menu functionality
            function toggleMobileMenu() {
                mobileMenu.classList.toggle('show');
                document.body.classList.toggle('overflow-hidden'); // Prevent scrolling body when menu is open

                // Toggle between hamburger and close icon
                const menuIcon = mobileMenuButton.querySelector('.mobile-menu-icon');
                const closeIcon = mobileMenuButton.querySelector('.mobile-menu-close');
                menuIcon?.classList.toggle('hidden');
                closeIcon?.classList.toggle('hidden');
            }

            mobileMenuButton?.addEventListener('click', toggleMobileMenu);
            mobileMenuClose?.addEventListener('click', toggleMobileMenu);
            mobileMenuBackdrop?.addEventListener('click', toggleMobileMenu);

            // Close mobile menu when clicking a link
            document.querySelectorAll('#mobileNav a').forEach(link => {
                link.addEventListener('click', () => {
                    toggleMobileMenu();
                });
            });

            // Update mobile auth buttons
            function updateMobileAuthButtons() {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || '{}');

                    if (token && user && user.full_name) { // Ensure user.full_name exists
                    mobileAuthButtons.innerHTML = `
                        <div class="flex flex-col space-y-2">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Signed in as</span>
                            <span class="font-medium text-gray-800 dark:text-white">${user.full_name}</span>
                            <a href="${user.isAdmin ? 'admin_dashboard.html' : 'dashboard.html'}" 
                                class="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
                                Dashboard
                            </a>
                            <button id="mobileLogoutButton" 
                                class="w-full text-center text-red-600 hover:text-red-700 py-2 transition-colors">
                                Logout
                            </button>
                        </div>
                    `;

                    document.getElementById('mobileLogoutButton')?.addEventListener('click', () => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = 'login.html';
                    });
                } else {
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

            // Update auth state for desktop
            function updateAuthState() {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || '{}');

                    if (token && user && user.full_name) { // Ensure user.full_name exists
                    authButtons.classList.add('hidden');
                    userMenu.classList.remove('hidden');
                    userNameDisplay.textContent = user.full_name;

                    dashboardLink.href = user.isAdmin ? 'admin_dashboard.html' : 'dashboard.html';

                    // Highlight active page in desktop nav
                    const currentPage = window.location.pathname.split('/').pop();
                    document.querySelectorAll('#mainNav .nav-link').forEach(link => {
                        if (link.getAttribute('href') === currentPage) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                } else {
                    userMenu.classList.add('hidden');
                    authButtons.classList.remove('hidden');
                    authButtons.innerHTML = `
                        <a href="login.html" class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Login</a>
                        <a href="signup.html" class="bg-blue-500 text-white font-semibold px-6 py-2.5 rounded hover:bg-blue-600 transition-all duration-300 text-sm">Sign Up</a>
                    `;
                }
            }

            // Update both desktop and mobile auth states
            function updateAllAuthStates() {
                updateAuthState();
                updateMobileAuthButtons();
            }

            // Initialize on load and listen for storage changes
            initializeTheme();
            updateAllAuthStates();
            window.addEventListener('storage', updateAllAuthStates);

            // Toggle user menu
            userMenuButton?.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent document click from closing immediately
                userMenuDropdown.classList.toggle('hidden');
            });

            // Close user menu when clicking outside
            document.addEventListener('click', (e) => {
                if (userMenu && !userMenu.contains(e.target)) {
                    userMenuDropdown.classList.add('hidden');
                }
            });

            // Handle logout
            logoutButton?.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            });

            // Dynamic Site Name and Logo (for navbar)
            async function updateSiteNameAndLogo() {
                try {
                    const res = await fetch('/api/settings/general');
                    if (!res.ok) throw new Error('Failed to fetch site info');
                    const { siteName, siteLogoUrl } = await res.json();
                    // Navbar
                    const nameEl = document.getElementById('navbarSiteName');
                    const logoEl = document.getElementById('navbarSiteLogo');
                    if (nameEl && siteName) nameEl.textContent = siteName;
                    if (logoEl && siteLogoUrl) logoEl.src = siteLogoUrl;
                    // Titles
                    if (siteName) {
                        document.querySelectorAll('title').forEach(t => {
                            t.textContent = t.textContent.replace(/MBAPE GLOBAL|Mbappe Global|ScholarshipHub/gi, siteName);
                        });
                        // Headings and footers
                        document.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, a, span, p').forEach(el => {
                            if (el.textContent.match(/MBAPE GLOBAL|Mbappe Global|ScholarshipHub/gi)) {
                                el.textContent = el.textContent.replace(/MBAPE GLOBAL|Mbappe Global|ScholarshipHub/gi, siteName);
                            }
                        });
                    }
                } catch (err) {
                    // Optionally handle error
                }
            }
            // Call after navbar is loaded
            updateSiteNameAndLogo();

            // --- Notification Bell Logic ---
            const notificationBell = document.getElementById('notification-bell');
            const notificationBadge = document.getElementById('notification-badge');
            const notificationDropdown = document.getElementById('notification-dropdown');
            const notificationList = document.getElementById('notification-list');
            const noNotifications = document.getElementById('no-notifications');

            async function fetchNotifications() {
              const token = localStorage.getItem('token');
              if (!token) return [];
              try {
                const res = await fetch('/api/notifications', {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) return [];
                return await res.json();
              } catch (e) {
                return [];
              }
            }

            function renderNotifications(notifications) {
              notificationList.innerHTML = '';
              let unreadCount = 0;
              notifications.forEach(n => {
                const item = document.createElement('div');
                item.className = `px-4 py-2 border-b border-gray-100 dark:border-gray-700 cursor-pointer ${n.is_read ? '' : 'bg-blue-50 dark:bg-gray-700'}`;
                item.innerHTML = `<div class='font-semibold'>${n.title}</div><div class='text-sm text-gray-500 dark:text-gray-300'>${n.message}</div><div class='text-xs text-gray-400 mt-1'>${new Date(n.created_at).toLocaleString()}</div>`;
                if (!n.is_read) unreadCount++;
                item.onclick = async () => {
                  if (!n.is_read) {
                    await fetch(`/api/notifications/${n.id}/read`, {
                      method: 'PATCH',
                      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    n.is_read = true;
                    renderNotifications(notifications);
                  }
                };
                notificationList.appendChild(item);
              });
              notificationBadge.textContent = unreadCount;
              notificationBadge.classList.toggle('hidden', unreadCount === 0);
              noNotifications.style.display = notifications.length ? 'none' : 'block';
            }

            let notificationsCache = [];
            async function updateNotifications() {
              notificationsCache = await fetchNotifications();
              renderNotifications(notificationsCache);
            }

            if (notificationBell) {
              notificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle('hidden');
                if (!notificationDropdown.classList.contains('hidden')) {
                  updateNotifications();
                }
              });
              document.addEventListener('click', (e) => {
                if (!notificationDropdown.contains(e.target) && e.target !== notificationBell) {
                  notificationDropdown.classList.add('hidden');
                }
              });
              // Optionally, poll for new notifications every minute
              setInterval(updateNotifications, 60000);
              updateNotifications();
            }

        } else {
            console.error('Navbar container not found!');
        }
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}
