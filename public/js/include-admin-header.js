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

        // Development mode - bypass authentication
        const user = {
            full_name: 'Development Admin',
            role: 'admin',
            isAdmin: true
        };
        document.getElementById('adminName').textContent = user.full_name || 'Admin';

        // Initialize profile avatar
        initializeProfileControls();

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });

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
    const photo = stored.profile_picture || '';

    nameEl && (nameEl.textContent = fullName);
    emailEl && (emailEl.textContent = email);

    const setAvatar = (url) => {
        if (url) {
            if (avatar) { avatar.src = url; avatar.classList.remove('hidden'); }
            if (fallback) fallback.classList.add('hidden');
            if (modalAvatar) { modalAvatar.src = url; modalAvatar.classList.remove('hidden'); }
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
            // Reuse account endpoint for upload only, with minimal fields
            fd.append('fullName', fullName);
            fd.append('email', email);
            const res = await fetch('/api/admin/account', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
            const data = await res.json();
            const newPhoto = data.profile_picture;
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

document.addEventListener('DOMContentLoaded', includeAdminHeader); 