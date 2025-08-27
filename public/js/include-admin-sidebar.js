// js/include-admin-sidebar.js

async function includeAdminSidebar() {
    try {
        const container = document.getElementById('admin-sidebar-container');
        if (!container) return;
        
        const response = await fetch('components/admin-sidebar.html');
        if (!response.ok) throw new Error('Failed to load admin sidebar');
        const sidebarHtml = await response.text();
        
        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sidebarHtml;
        
        // Extract the sidebar content
        const sidebarContent = tempDiv.querySelector('#admin-sidebar');
        
        if (sidebarContent) {
            container.appendChild(sidebarContent);
            
            // Initialize sidebar functionality
            initializeSidebar();

            // Mark active link
            try { markActiveSidebarLink(); } catch {}
        }
    } catch (error) {
        console.error('Error loading admin sidebar:', error);
    }
}

function initializeSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const mainContent = document.querySelector('.admin-main-content');
    const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const mobileBackdrop = document.getElementById('mobileBackdrop');
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');

    if (!sidebar) return;

    // Check if device is mobile/tablet
    const isMobileDevice = window.innerWidth <= 1024;
    
    // Initialize sidebar state based on device type
    let isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // On mobile devices (≤1024px), default to collapsed (icons-only)
    if (isMobileDevice && !localStorage.getItem('sidebarCollapsed')) {
        isCollapsed = true;
        localStorage.setItem('sidebarCollapsed', 'true');
    }
    
    if (isCollapsed && mainContent) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('collapsed');
    }

    // Desktop sidebar toggle
    if (sidebarCollapseBtn) {
        sidebarCollapseBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            if (mainContent) {
                mainContent.classList.toggle('collapsed');
            }
            
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

    // Mobile sidebar toggle (for expanded view on mobile)
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            if (mobileBackdrop) {
                mobileBackdrop.classList.toggle('show');
            }
        });
    }

    // Mobile navigation toggle (for showing/hiding sidebar on mobile)
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            
            // Update button icon
            const icon = mobileNavToggle.querySelector('i');
            const text = mobileNavToggle.querySelector('span');
            
            if (sidebar.classList.contains('expanded')) {
                if (icon) icon.className = 'fas fa-times w-5 text-center';
                if (text) text.textContent = 'Close';
                localStorage.setItem('mobileSidebarExpanded', 'true');
            } else {
                if (icon) icon.className = 'fas fa-bars w-5 text-center';
                if (text) text.textContent = 'Menu';
                localStorage.setItem('mobileSidebarExpanded', 'false');
            }
        });
        
        // Restore mobile sidebar state on page load
        const wasExpanded = localStorage.getItem('mobileSidebarExpanded') === 'true';
        if (wasExpanded && window.innerWidth <= 768) {
            sidebar.classList.add('expanded');
            const icon = mobileNavToggle.querySelector('i');
            const text = mobileNavToggle.querySelector('span');
            if (icon) icon.className = 'fas fa-times w-5 text-center';
            if (text) text.textContent = 'Close';
        }
    }

    // Mobile backdrop click
    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            mobileBackdrop.classList.remove('show');
        });
    }

    // Close sidebar when clicking outside on mobile (only for expanded view)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(e.target) && !(mobileSidebarToggle && mobileSidebarToggle.contains(e.target))) {
                sidebar.classList.remove('mobile-open');
                if (mobileBackdrop) {
                    mobileBackdrop.classList.remove('show');
                }
            }
        }
    });

    // Update help badge count
    updateHelpBadge();
    // Poll periodically to keep badge fresh
    setInterval(updateHelpBadge, 30000);

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

    // Responsive behavior
    window.addEventListener('resize', () => {
        const newIsMobile = window.innerWidth <= 1024;
        
        if (!newIsMobile && window.innerWidth > 1024) {
            // Only auto-expand if user hasn't manually set a preference
            if (!localStorage.getItem('sidebarCollapsed')) {
                sidebar.classList.remove('collapsed');
                if (mainContent) {
                    mainContent.classList.remove('collapsed');
                }
            }
        }
        
        // Close mobile sidebar expanded view when switching to desktop
        if (window.innerWidth > 1023) {
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

function markActiveSidebarLink() {
    const sidebar = document.getElementById('admin-sidebar');
    if (!sidebar) return;
    const links = Array.from(sidebar.querySelectorAll('a[href$=".html"]'));
    const pageAttr = (document.body && document.body.getAttribute('data-page')) || '';
    const hrefFromAttr = pageAttr ? `admin_${pageAttr}.html` : '';
    const path = window.location.pathname.split('/').pop();

    let matched = null;
    if (hrefFromAttr) {
        matched = links.find(a => a.getAttribute('href').endsWith(hrefFromAttr));
    }
    if (!matched && path) {
        matched = links.find(a => a.getAttribute('href').endsWith(path));
    }
    if (matched) {
        links.forEach(a => a.classList.remove('active'));
        matched.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', includeAdminSidebar);