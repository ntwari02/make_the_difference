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

        // Auth check
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!token || user.role !== 'admin') {
            window.location.href = 'login.html';
        }
        document.getElementById('adminName').textContent = user.full_name || 'Admin';

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