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

    // Check if device is mobile/tablet
    const isMobileDevice = window.innerWidth <= 1024;
    
    // Initialize sidebar state based on device type
    let isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // On mobile devices (≤1024px), default to collapsed (icons-only)
    if (isMobileDevice && !localStorage.getItem('sidebarCollapsed')) {
        isCollapsed = true;
        localStorage.setItem('sidebarCollapsed', 'true');
    }
    
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
            
            // Update collapse button icon
            const icon = sidebarCollapseBtn.querySelector('i');
            if (icon) {
                if (isCollapsed) {
                    icon.className = 'fas fa-chevron-right text-xl';
                } else {
                    icon.className = 'fas fa-bars text-xl';
                }
            }
        });
        
        // Set initial button icon
        const icon = sidebarCollapseBtn.querySelector('i');
        if (icon && isCollapsed) {
            icon.className = 'fas fa-chevron-right text-xl';
        }
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

        // Update help badge count
        updateHelpBadge();
    }

    // Function to update help badge count
    async function updateHelpBadge() {
        try {
            const response = await fetch('/api/admin-help/stats');
            if (response.ok) {
                const data = await response.json();
                const badge = document.getElementById('help-badge');
                if (badge && data.success) {
                    const activeRequests = data.stats.active_requests || 0;
                    if (activeRequests > 0) {
                        badge.textContent = activeRequests;
                        badge.classList.remove('hidden');
                    } else {
                        badge.classList.add('hidden');
                    }
                }
            }
        } catch (error) {
            console.error('Error updating help badge:', error);
        }
    }

    // Update badge every 30 seconds
    setInterval(updateHelpBadge, 30000);

    // Handle window resize
    window.addEventListener('resize', () => {
        const newIsMobile = window.innerWidth <= 1024;
        
        // If switching to mobile view and no preference is set, default to collapsed
        if (newIsMobile && !localStorage.getItem('sidebarCollapsed')) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('collapsed');
            localStorage.setItem('sidebarCollapsed', 'true');
        }
        
        // If switching to desktop view and was in mobile collapsed state, expand
        if (!newIsMobile && window.innerWidth > 1024) {
            // Only auto-expand if user hasn't manually set a preference
            if (!localStorage.getItem('sidebarCollapsed')) {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('collapsed');
            }
        }
        
        // Close mobile sidebar when switching to desktop
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
            if (mobileBackdrop) {
                mobileBackdrop.classList.remove('show');
            }
        }
    });

    // Enhanced theme synchronization
    function syncThemeWithSidebar() {
        const isDark = document.documentElement.classList.contains('dark');
        const savedTheme = localStorage.getItem('admin-theme');
        const currentTheme = savedTheme || (isDark ? 'dark' : 'light');
        
        // Apply theme to sidebar and related elements
        const sidebarElements = document.querySelectorAll('.admin-sidebar, .sidebar-item-text, .mobile-sidebar-toggle');
        sidebarElements.forEach(element => {
            if (currentTheme === 'dark') {
                element.classList.add('dark');
            } else {
                element.classList.remove('dark');
            }
        });
        
        // Update mobile toggle button theme
        if (mobileSidebarToggle) {
            if (currentTheme === 'dark') {
                mobileSidebarToggle.classList.add('dark');
                mobileSidebarToggle.style.backgroundColor = '#1f2937';
                mobileSidebarToggle.style.color = '#f9fafb';
            } else {
                mobileSidebarToggle.classList.remove('dark');
                mobileSidebarToggle.style.backgroundColor = '#3b82f6';
                mobileSidebarToggle.style.color = 'white';
            }
        }
    }

    // Initial theme setup
    syncThemeWithSidebar();

    // Listen for theme changes from header
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                syncThemeWithSidebar();
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Also listen for storage changes (in case theme is changed in another tab)
    window.addEventListener('storage', (e) => {
        if (e.key === 'admin-theme') {
            syncThemeWithSidebar();
        }
    });

    // Add hover effects for sidebar items (only on desktop)
    const sidebarItems = sidebar.querySelectorAll('a');
    sidebarItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Only add slide effect on desktop and when not collapsed
            if (window.innerWidth > 1024 && !sidebar.classList.contains('collapsed')) {
                item.style.transform = 'translateX(4px)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });

    // Add tooltip functionality for collapsed state
    if (sidebar.classList.contains('collapsed')) {
        sidebarItems.forEach(item => {
            const title = item.getAttribute('title');
            if (title) {
                item.addEventListener('mouseenter', () => {
                    // Tooltip is handled by CSS
                });
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', includeAdminSidebar);