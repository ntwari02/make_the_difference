// js/include-admin-sidebar.js

async function includeAdminSidebar() {
    try {
        const container = document.getElementById('admin-sidebar-container');
        if (!container) return;
        
        const response = await fetch('components/admin-sidebar.html');
        if (!response.ok) throw new Error('Failed to load admin sidebar');
        const html = await response.text();
        container.innerHTML = html;

        // Initialize sidebar functionality
        initializeSidebar();
        
    } catch (err) {
        console.error('Error including admin sidebar:', err);
    }
}

function initializeSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const mainContent = document.querySelector('.admin-main-content');
    const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const mobileBackdrop = document.getElementById('mobileBackdrop');

    if (!sidebar || !mainContent) return;

    // Initialize sidebar state
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('collapsed');
    }

    // Desktop sidebar toggle
    if (sidebarCollapseBtn) {
        sidebarCollapseBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('collapsed');
            
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });
    }

    // Mobile sidebar toggle
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            if (mobileBackdrop) {
                mobileBackdrop.classList.toggle('show');
            }
        });
    }

    // Mobile backdrop click
    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            mobileBackdrop.classList.remove('show');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !mobileSidebarToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
                if (mobileBackdrop) {
                    mobileBackdrop.classList.remove('show');
                }
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
            if (mobileBackdrop) {
                mobileBackdrop.classList.remove('show');
            }
        }
    });

    // Apply dark mode classes
    function updateThemeClasses() {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            sidebar.classList.add('dark');
        } else {
            sidebar.classList.remove('dark');
        }
    }

    // Initial theme setup
    updateThemeClasses();

    // Listen for theme changes
    const observer = new MutationObserver(updateThemeClasses);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });
}

document.addEventListener('DOMContentLoaded', includeAdminSidebar);