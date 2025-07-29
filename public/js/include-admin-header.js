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

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
        function updateTheme() {
            if (document.documentElement.classList.contains('dark')) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            } else {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
            
            // Update layout theme classes
            const layoutElements = document.querySelectorAll('.admin-layout, .admin-header, .admin-sidebar, .admin-main-content');
            layoutElements.forEach(element => {
                if (document.documentElement.classList.contains('dark')) {
                    element.classList.add('dark');
                } else {
                    element.classList.remove('dark');
                }
            });
        }
        
        themeToggle.addEventListener('click', function() {
            document.documentElement.classList.toggle('dark');
            updateTheme();
            localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        });
        
        // Set initial theme
        if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        updateTheme();
    } catch (err) {
        console.error('Error including admin header:', err);
    }
}

document.addEventListener('DOMContentLoaded', includeAdminHeader); 