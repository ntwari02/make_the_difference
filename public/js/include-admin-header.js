// js/include-admin-header.js

async function includeAdminHeader() {
    try {
        const container = document.getElementById('admin-header-container');
        if (!container) return;
        const response = await fetch('components/admin-header.html');
        if (!response.ok) throw new Error('Failed to load admin header');
        const html = await response.text();
        container.innerHTML = html;

        // Set page title
        const pageTitle = container.getAttribute('data-page-title') || document.title || 'Admin';
        const titleElem = document.getElementById('admin-page-title');
        if (titleElem) titleElem.textContent = pageTitle;

        // Use stored/remote user for header display
        (async () => {
            try {
                const token = localStorage.getItem('token');
                let user = JSON.parse(localStorage.getItem('user') || '{}');
                if (token) {
                    const res = await fetch('/api/admin/account', { headers: { 'Authorization': `Bearer ${token}` } });
                    if (res.ok) {
                        const profile = await res.json();
                        user = { ...user, ...profile };
                        if (profile.profile_picture_path && !profile.profile_picture) {
                            user.profile_picture = profile.profile_picture_path;
                        }
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                }
                const nameTarget = document.getElementById('adminName');
                if (nameTarget) nameTarget.textContent = user.full_name || 'Admin';
            } catch {}
        })();

        // Initialize profile avatar
        initializeProfileControls();

        // Logout with confirmation
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (!confirm('Are you sure you want to log out?')) return;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });

        // Mobile admin menu
        initializeMobileAdminMenu();

        // Enhanced Theme Management
        initializeThemeSystem();
        
    } catch (err) {
        console.error('Error including admin header:', err);
    }
}

function initializeProfileControls() {
    const profileBtn = document.getElementById('profileBtn');
    const avatar = document.getElementById('profileAvatar');
    const fallback = document.getElementById('profileFallback');
    const modal = document.getElementById('profileModal');
    const modalAvatar = document.getElementById('profileModalAvatar');
    const modalFallback = document.getElementById('profileModalFallback');
    const nameEl = document.getElementById('profileModalName');
    const emailEl = document.getElementById('profileModalEmail');
    const form = document.getElementById('profileAvatarForm');
    const input = document.getElementById('profileAvatarInput');

    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const fullName = stored.full_name || 'User';
    const email = stored.email || '';
    const photo = stored.profile_picture || stored.profile_picture_path || '';

    nameEl && (nameEl.textContent = fullName);
    emailEl && (emailEl.textContent = email);

    const setAvatar = (url) => {
        if (url) {
            const src = (url.startsWith('http') || url.startsWith('/')) ? url : `/${url}`;
            if (avatar) { avatar.src = src; avatar.classList.remove('hidden'); }
            if (fallback) fallback.classList.add('hidden');
            if (modalAvatar) { modalAvatar.src = src; modalAvatar.classList.remove('hidden'); }
            if (modalFallback) modalFallback.classList.add('hidden');
        } else {
            const initials = (fullName || 'U').trim().split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
            if (fallback) fallback.textContent = initials || 'U';
            if (modalFallback) modalFallback.textContent = initials || 'U';
            if (avatar) avatar.classList.add('hidden');
            if (modalAvatar) modalAvatar.classList.add('hidden');
            if (fallback) fallback.classList.remove('hidden');
            if (modalFallback) modalFallback.classList.remove('hidden');
        }
    };
    setAvatar(photo);

    if (profileBtn) profileBtn.addEventListener('click', () => {
        modal && modal.classList.remove('hidden');
    });

    if (form) form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!input || !input.files || !input.files[0]) return;
        try {
            const token = localStorage.getItem('token');
            const fd = new FormData();
            fd.append('profilePicture', input.files[0]);
            // Use dedicated profile-picture endpoint
            const res = await fetch('/api/admin/account/profile-picture', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
            const data = await res.json();
            const newPhoto = data.profile_picture || data.profile_picture_path;
            if (newPhoto) {
                const u = JSON.parse(localStorage.getItem('user') || '{}');
                u.profile_picture = newPhoto;
                localStorage.setItem('user', JSON.stringify(u));
                setAvatar(newPhoto);
            }
            modal && modal.classList.add('hidden');
        } catch (err) {
            console.error('Profile upload failed', err);
        }
    });
}

function initializeThemeSystem() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
    // Theme state management
    const themeState = {
        current: 'light',
        setTheme(theme) {
            this.current = theme;
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('admin-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('admin-theme', 'light');
            }
            this.updateUI();
            this.applyThemeToComponents();
        },
        
        toggle() {
            const newTheme = this.current === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        },
        
        updateUI() {
            if (!themeIcon) return;
            
            if (this.current === 'dark') {
                themeIcon.className = 'fas fa-sun text-yellow-400';
                themeIcon.title = 'Switch to Light Mode';
            } else {
                themeIcon.className = 'fas fa-moon text-gray-600';
                themeIcon.title = 'Switch to Dark Mode';
            }
        },
        
        applyThemeToComponents() {
            // Apply theme to all admin components
            const adminElements = document.querySelectorAll('.admin-layout, .admin-header, .admin-sidebar, .admin-main-content, .admin-card');
            adminElements.forEach(element => {
                if (this.current === 'dark') {
                    element.classList.add('dark');
                } else {
                    element.classList.remove('dark');
                }
            });
            
            // Update body class for global theme
            if (this.current === 'dark') {
                document.body.classList.add('dark-mode');
                document.body.classList.remove('light-mode');
            } else {
                document.body.classList.add('light-mode');
                document.body.classList.remove('dark-mode');
            }
        },
        
        initialize() {
            // Check for saved theme preference or default to system preference
            const savedTheme = localStorage.getItem('admin-theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme) {
                this.setTheme(savedTheme);
            } else {
                this.setTheme(systemPrefersDark ? 'dark' : 'light');
            }
            
            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('admin-theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    };
    
    // Initialize theme system
    themeState.initialize();
    
    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            themeToggle.classList.add('scale-95');
            setTimeout(() => themeToggle.classList.remove('scale-95'), 150);
            themeState.toggle();
        });
    }
    
    // Add smooth transitions for theme changes
    const style = document.createElement('style');
    style.textContent = `
        * {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        .theme-toggle-transition {
            transition: transform 0.15s ease;
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
    includeAdminHeader();
    // Global fallback to ensure a FAB menu exists on all admin pages
    setTimeout(() => {
        if (typeof ensureMobileFabMenu === 'function') {
            try { ensureMobileFabMenu(); } catch {}
        } else {
            // Minimal non-duplicating fallback
            if (!document.getElementById('admin-fab-menu')) {
                const fab = document.createElement('button');
                fab.id = 'admin-fab-menu';
                fab.className = 'fixed bottom-4 right-4 z-[1001] w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center';
                fab.setAttribute('aria-label','Open admin menu');
                fab.innerHTML = '<i class="fas fa-bars"></i>';
                const overlay = document.createElement('div');
                overlay.id = 'admin-fab-overlay';
                overlay.className = 'fixed inset-0 bg-black/40 hidden z-[1000]';
                const modal = document.createElement('div');
                modal.id = 'admin-fab-modal';
                modal.className = 'fixed bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hidden z-[1002] max-h-[70vh] overflow-y-auto';
                const links = [
                    ['admin_dashboard.html','Dashboard','fas fa-tachometer-alt'],
                    ['admin_users.html','Users','fas fa-users'],
                    ['admin_rolesPermissions.html','Roles','fas fa-user-shield'],
                    ['admin_scholarship.html','Scholarships','fas fa-graduation-cap'],
                    ['admin_applications.html','Applications','fas fa-file-alt'],
                    ['admin_partners.html','Partners','fas fa-handshake'],
                    ['admin_services.html','Services','fas fa-briefcase'],
                    ['admin_email_template.html','Email Templates','fas fa-envelope'],
                    ['admin_help.html','Help','fas fa-question']
                ];
                modal.innerHTML = `
                  <div class="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span class="font-semibold">Admin Menu</span>
                    <button id="admin-fab-close" class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-times"></i></button>
                  </div>
                  <div class="p-2">
                    ${links.map(l => `<a href="${l[0]}" class="flex items-center gap-3 p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><i class="${l[2]} w-5 text-center"></i><span>${l[1]}</span></a>`).join('')}
                  </div>`;
                document.body.appendChild(fab);
                document.body.appendChild(overlay);
                document.body.appendChild(modal);
                const open = () => { overlay.classList.remove('hidden'); modal.classList.remove('hidden'); };
                const close = () => { overlay.classList.add('hidden'); modal.classList.add('hidden'); };
                fab.addEventListener('click', open); overlay.addEventListener('click', close);
                modal.addEventListener('click', (e)=>{ if(e.target && e.target.id==='admin-fab-close') close(); });
            }
        }
    }, 0);
});

// --- Mobile Admin Menu (hamburger opens modal with all sidebar navs) ---
function initializeMobileAdminMenu() {
    let container = document.getElementById('mobileMenuContainer');
    if (!container) {
        // Preferred spot: right actions row before theme/profile/logout on small screens
        const rightActions = document.getElementById('admin-right-actions');
        if (rightActions) {
            container = document.createElement('div');
            rightActions.insertBefore(container, rightActions.firstChild);
        } else {
            // Fallback: before title
            const title = document.getElementById('admin-page-title');
            if (title && title.parentElement) {
                container = document.createElement('div');
                title.parentElement.insertBefore(container, title);
            }
        }
    }
    if (!container) return;

    // Create hamburger button
    const btn = document.createElement('button');
    btn.id = 'adminMobileMenuBtn';
    btn.className = 'inline-flex lg:hidden items-center justify-center p-2 mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none';
    btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = '<i class="fas fa-bars text-xl text-gray-700 dark:text-gray-200"></i>';
    container.appendChild(btn);

    // Build modal
    const overlay = document.createElement('div');
    overlay.id = 'adminMenuOverlay';
    overlay.className = 'fixed inset-0 bg-black/40 hidden z-40';

    const modalWrap = document.createElement('div');
    modalWrap.id = 'adminMenuModal';
    modalWrap.className = 'fixed inset-0 hidden z-50 flex items-center justify-center p-4';
    const modal = document.createElement('div');
    modal.className = 'w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700';

    const links = [
        { href: 'admin_dashboard.html', label: 'Dashboard', icon: 'fa-gauge' },
        { href: 'admin_applications.html', label: 'Applications', icon: 'fa-file-lines' },
        { href: 'admin_scholarship.html', label: 'Scholarships', icon: 'fa-graduation-cap' },
        { href: 'admin_users.html', label: 'Users', icon: 'fa-users' },
        { href: 'admin_partners.html', label: 'Partners', icon: 'fa-handshake' },
        { href: 'admin_rolesPermissions.html', label: 'Roles & Team', icon: 'fa-user-shield' },
        { href: 'admin_services.html', label: 'Services', icon: 'fa-briefcase' }
    ];

    modal.innerHTML = `
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <span class="font-semibold text-gray-800 dark:text-white">Admin Navigation</span>
            <button id="adminMenuClose" class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-2 max-h-[70vh] overflow-y-auto">
            ${links.map(l => `
                <a href="${l.href}" class="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fas ${l.icon} w-5 text-gray-500 dark:text-gray-300"></i>
                    <span>${l.label}</span>
                </a>
            `).join('')}
        </div>
    `;

    modalWrap.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.appendChild(modalWrap);

    const open = () => { overlay.classList.remove('hidden'); modalWrap.classList.remove('hidden'); };
    const close = () => { overlay.classList.add('hidden'); modalWrap.classList.add('hidden'); };

    btn.addEventListener('click', open);
    overlay.addEventListener('click', close);
    const closeBind = () => { const el = document.getElementById('adminMenuClose'); if (el) el.addEventListener('click', close); };
    closeBind();
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });
}