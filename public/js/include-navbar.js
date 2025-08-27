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
            const profileLink = document.getElementById('profileLink');
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
                        if (!confirm('Are you sure you want to log out?')) return;
                        window.location.href = '/logout.html';
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

                     // Update profile picture in navbar
                     updateNavbarProfilePicture(user);

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

             // Function to update profile picture in navbar
             function updateNavbarProfilePicture(user) {
                 const profilePicture = user.profile_picture || user.profile_picture_path;
                 const userAvatar = document.querySelector('#userMenuButton img[alt="User avatar"]');
                 const userAvatarIcon = document.querySelector('#userMenuButton i.fa-user');
                 
                 if (profilePicture) {
                     // Show profile picture
                     if (userAvatar) {
                         userAvatar.src = profilePicture.startsWith('http') ? profilePicture : `/${profilePicture}`;
                         userAvatar.classList.remove('hidden');
                     }
                     if (userAvatarIcon) {
                         userAvatarIcon.classList.add('hidden');
                     }
                 } else {
                     // Show default icon
                     if (userAvatar) {
                         userAvatar.classList.add('hidden');
                     }
                     if (userAvatarIcon) {
                         userAvatarIcon.classList.remove('hidden');
                     }
                 }
             }

            // Update both desktop and mobile auth states
            function updateAllAuthStates() {
                updateAuthState();
                updateMobileAuthButtons();
                // Attempt to refresh user profile from server after login to ensure avatar path is present
                refreshUserProfileIfPossible();
            }

            // Initialize on load and listen for storage changes
            initializeTheme();
            updateAllAuthStates();
            window.addEventListener('storage', updateAllAuthStates);

                         async function refreshUserProfileIfPossible() {
                 try {
                     const token = localStorage.getItem('token');
                     if (!token) return;
                     
                     const user = JSON.parse(localStorage.getItem('user') || '{}');
                     
                     console.log('🔄 Refreshing user profile...');
                     console.log('🔍 Current user data:', user);
                     
                     let profile;
                     
                     if (user.isAdmin) {
                         // Admin users - fetch from admin account endpoint
                         const res = await fetch('/api/admin/account', { headers: { 'Authorization': `Bearer ${token}` } });
                         if (!res.ok) {
                             console.log('❌ Failed to fetch admin profile:', res.status);
                             return;
                         }
                         profile = await res.json();
                     } else {
                         // Regular users - fetch from user profile endpoint
                         const res = await fetch('/api/users/profile', { headers: { 'Authorization': `Bearer ${token}` } });
                         if (!res.ok) {
                             console.log('❌ Failed to fetch user profile:', res.status);
                             return;
                         }
                         profile = await res.json();
                     }
                     
                     console.log('🔍 Profile data from server:', profile);
                     
                     const normalized = { ...profile };
                     if (profile.profile_picture_path && !profile.profile_picture) normalized.profile_picture = profile.profile_picture_path;
                     
                     // Merge with existing user data instead of replacing
                     const updatedUser = { ...user, ...normalized };
                     console.log('🔍 Updated user data:', updatedUser);
                     localStorage.setItem('user', JSON.stringify(updatedUser));
                     
                     // Update visible name
                     const userNameDisplay = document.getElementById('userNameDisplay');
                     if (userNameDisplay) userNameDisplay.textContent = (updatedUser.full_name || updatedUser.fullName || 'User');
                     
                     // Update profile picture in navbar
                     updateNavbarProfilePicture(updatedUser);
                     
                     console.log('✅ Profile refresh completed');
                 } catch (error) {
                     console.error('❌ Profile refresh error:', error);
                 }
             }

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

            // Handle logout (redirect to logout page)
            logoutButton?.addEventListener('click', (e) => {
                e.preventDefault();
                if (!confirm('Are you sure you want to log out?')) return;
                window.location.href = '/logout.html';
            });

            // Handle profile link
            profileLink?.addEventListener('click', (e) => {
                e.preventDefault();
                openProfileModal();
            });

            // Inject profile modal once
            ensureProfileModal();

            function ensureProfileModal() {
                if (document.getElementById('profileModal')) return;
                const modal = document.createElement('div');
                modal.id = 'profileModal';
                modal.className = 'fixed inset-0 bg-black/50 hidden z-[2000]';
                modal.innerHTML = `
                <div class="min-h-screen flex items-center justify-center p-4">
                  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">My Profile</h3>
                      <button id="profileModalClose" class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="p-6">
                      <div id="pmToast" class="hidden mb-4 px-3 py-2 rounded text-white text-sm"></div>
                      <div class="flex items-center gap-6">
                        <div class="relative">
                          <div id="pmAvatarHolder" class="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                            <i id="pmDefaultIcon" class="fa-solid fa-user text-3xl text-gray-400"></i>
                            <img id="pmAvatarImg" alt="avatar" class="hidden h-full w-full object-cover">
                          </div>
                        </div>
                        <div class="flex-1">
                          <div class="text-sm text-gray-600 dark:text-gray-300 mb-3">Supported: JPG, PNG, GIF (max 10MB)</div>
                          <div class="flex flex-wrap gap-3">
                            <label for="pmFile" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer"><i class="fa-solid fa-upload"></i><span>Upload</span></label>
                            <input id="pmFile" type="file" accept="image/*" class="hidden">
                            <button id="pmDelete" class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"><i class="fa-solid fa-trash"></i><span>Delete</span></button>
                          </div>
                        </div>
                      </div>
                      <div class="mt-6 grid grid-cols-1 gap-4">
                        <div>
                          <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Full name</label>
                          <input id="pmFullNameInput" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                          <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Email</label>
                          <input id="pmEmailInput" type="email" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        </div>
                        <div class="flex justify-end">
                          <button id="pmSaveProfile" class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"><i class="fa-solid fa-floppy-disk"></i><span>Save profile</span></button>
                        </div>
                      </div>

                      <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">Change Password</h4>
                        <div class="grid grid-cols-1 gap-4">
                          <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Current password</label>
                            <input id="pmCurrentPwd" type="password" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          </div>
                          <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">New password</label>
                            <div class="relative">
                              <input id="pmNewPwd" type="password" class="w-full px-3 py-2 pr-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                              <button type="button" id="pmTogglePwd" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"><i class="fa-regular fa-eye"></i></button>
                            </div>
                          </div>
                          <div class="flex justify-end">
                            <button id="pmChangePwd" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"><i class="fa-solid fa-key"></i><span>Change password</span></button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                      <button id="pmOk" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">OK</button>
                    </div>
                  </div>
                </div>`;
                document.body.appendChild(modal);

                // Wire close handlers
                modal.addEventListener('click', (e) => { if (e.target.id === 'profileModal') modal.classList.add('hidden'); });
                modal.querySelector('#profileModalClose')?.addEventListener('click', () => modal.classList.add('hidden'));
                modal.querySelector('#pmOk')?.addEventListener('click', () => modal.classList.add('hidden'));
            }

            function applyAvatarToModal(url) {
                const img = document.getElementById('pmAvatarImg');
                const icon = document.getElementById('pmDefaultIcon');
                if (url) {
                    const src = (url.startsWith('http') || url.startsWith('/')) ? url : `/${url}`;
                    img.src = src; img.classList.remove('hidden'); icon.classList.add('hidden');
                } else {
                    img.classList.add('hidden'); img.removeAttribute('src'); icon.classList.remove('hidden');
                }
            }

            function openProfileModal() {
                const modal = document.getElementById('profileModal');
                if (!modal) return;
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const nameInput = modal.querySelector('#pmFullNameInput');
                const emailInput = modal.querySelector('#pmEmailInput');
                if (nameInput) nameInput.value = user.full_name || user.fullName || '';
                if (emailInput) emailInput.value = user.email || '';
                applyAvatarToModal(user.profile_picture || user.profile_picture_path || '');
                modal.classList.remove('hidden');
            }

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
            ensureNotificationModal();

            async function fetchNotifications() {
              const token = localStorage.getItem('token');
              if (!token) return [];
              try {
                const res = await fetch('/api/user-notifications', {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) return [];
                const data = await res.json();
                // Expecting { success, notifications }
                if (Array.isArray(data)) return data; // backward fallback
                if (data && data.success && Array.isArray(data.notifications)) return data.notifications;
                return [];
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
                const preview = (n.message || '').slice(0, 120) + ((n.message || '').length > 120 ? '…' : '');
                item.innerHTML = `
                  <div class='flex items-start justify-between gap-3'>
                    <div class='flex-1'>
                      <div class='font-semibold'>${n.title || 'Notification'}</div>
                      <div class='text-sm text-gray-500 dark:text-gray-300 mt-0.5'>${preview}</div>
                      <div class='text-xs text-gray-400 mt-1'>${new Date(n.created_at).toLocaleString()}</div>
                    </div>
                    <button class='open-notif px-2 py-1 text-blue-600 hover:underline text-sm'>Open</button>
                  </div>`;
                if (!n.is_read) unreadCount++;
                const openHandler = async () => {
                  try { await openNotificationModal(n); } catch (e) { showNotificationModal(n); }
                  if (!n.is_read) {
                    await markNotificationRead(n.id);
                    n.is_read = true;
                    renderNotifications(notifications);
                  }
                };
                item.querySelector('.open-notif').onclick = async (e) => {
                  e.stopPropagation();
                  await openHandler();
                };
                item.addEventListener('click', openHandler);
                notificationList.appendChild(item);
              });
              notificationBadge.textContent = unreadCount;
              notificationBadge.classList.toggle('hidden', unreadCount === 0);
              noNotifications.style.display = notifications.length ? 'none' : 'block';
            }

            async function markNotificationRead(id){
              try{
                await fetch(`/api/user-notifications/${id}/read`, {
                  method: 'PUT',
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
              }catch{}
            }

            function ensureNotificationModal(){
              if (document.getElementById('notifModal')) return;
              const modal = document.createElement('div');
              modal.id = 'notifModal';
              modal.className = 'fixed inset-0 bg-black/50 hidden z-[2100]';
              modal.innerHTML = `
                <div class="min-h-screen flex items-center justify-center p-4">
                  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 id="nmTitle" class="text-lg font-semibold text-gray-900 dark:text-white">Notification</h3>
                      <button id="nmClose" class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="p-5 space-y-4">
                      <div id="nmTime" class="text-xs text-gray-500"></div>
                      <div id="nmMessage" class="text-gray-700 dark:text-gray-200 whitespace-pre-line"></div>
                      <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Reply to admin</label>
                        <textarea id="nmReply" rows="3" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Write your message..."></textarea>
                        <div class="flex justify-end mt-2">
                          <button id="nmSend" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"><i class="fa-solid fa-paper-plane"></i><span>Send</span></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>`;
              document.body.appendChild(modal);
              modal.addEventListener('click', (e)=>{ if(e.target.id==='notifModal') modal.classList.add('hidden'); });
              modal.querySelector('#nmClose')?.addEventListener('click', ()=> modal.classList.add('hidden'));
            }

            async function openNotificationModal(n){
              const modal = document.getElementById('notifModal');
              if (!modal) return;
              modal.classList.remove('hidden');
              const title = modal.querySelector('#nmTitle');
              const time = modal.querySelector('#nmTime');
              const message = modal.querySelector('#nmMessage');
              const sendBtn = modal.querySelector('#nmSend');
              const replyInput = modal.querySelector('#nmReply');
              if (title) title.textContent = n.title || 'Notification';
              if (time) time.textContent = new Date(n.created_at).toLocaleString();
              if (message) message.textContent = n.message || '';
              if (replyInput) replyInput.value = '';
              sendBtn.onclick = async () => {
                const text = (replyInput.value || '').trim();
                if (!text) { toast('Enter your message'); return; }
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch('/api/notifications/create-from-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title: `Re: ${n.title || 'Notification'}`, message: text })
                  });
                  const data = await res.json().catch(()=>({}));
                  if (!res.ok) throw new Error(data.message || 'Failed to send');
                  toast('Message sent to admin', 'success');
                  modal.classList.add('hidden');
                } catch (e) {
                  toast(e.message || 'Failed to send');
                }
              };
            }

            function toast(msg, type){
              const t = document.createElement('div');
              t.className = `fixed top-4 right-4 z-[2200] px-3 py-2 rounded text-white ${type==='success'?'bg-green-600':'bg-red-600'}`;
              t.textContent = msg; document.body.appendChild(t);
              setTimeout(()=> t.remove(), 2000);
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
