// js/include-admin-sidebar.js

async function includeAdminSidebar() {
    try {
        let container = document.getElementById('admin-sidebar-container');
        // If page forgot to add the container, create and mount it so the sidebar works everywhere
        if (!container) {
            container = document.createElement('div');
            container.id = 'admin-sidebar-container';
            // Try to insert before main content if present, otherwise prepend to body
            const main = document.querySelector('.admin-main-content') || document.body.firstElementChild;
            if (main && main.parentElement) {
                main.parentElement.insertBefore(container, main);
            } else {
                document.body.insertBefore(container, document.body.firstChild);
            }
        }
        
        const response = await fetch('components/admin-sidebar.html');
        if (!response.ok) throw new Error('Failed to load admin sidebar');
        const sidebarHtml = await response.text();
        
        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sidebarHtml;
        
        // Extract the sidebar content
        const sidebarContent = tempDiv.querySelector('#admin-sidebar');
        
        if (sidebarContent) {
            // Avoid duplicate mounts
            if (!container.querySelector('#admin-sidebar')) {
                container.appendChild(sidebarContent);
            }
            
            // Initialize sidebar functionality
            initializeSidebar();

            // Hard ensure visibility on small widths
            try {
                const sb = document.getElementById('admin-sidebar');
                const enforce = () => {
                    if (!sb) return;
                    if (window.innerWidth <= 1024) {
                        sb.style.display = 'block';
                        sb.style.left = '0';
                        sb.style.transform = 'none';
                        sb.style.visibility = 'visible';
                        sb.style.opacity = '1';
                    } else {
                        // clear inline styles on large screens
                        sb.style.display = '';
                        sb.style.left = '';
                        sb.style.transform = '';
                        sb.style.visibility = '';
                        sb.style.opacity = '';
                    }
                };
                enforce();
                window.addEventListener('resize', enforce);
            } catch {}

            // Provide a universal mobile menu (FAB) so admins on phones can always open nav
            try { ensureMobileFabMenu(); } catch {}

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

document.addEventListener('DOMContentLoaded', () => {
    includeAdminSidebar();
    // Ensure FAB exists even if sidebar fetch fails
    try { ensureMobileFabMenu(); } catch {}
});

// Floating action button that opens a compact sidebar modal for phones
function ensureMobileFabMenu() {
    if (document.getElementById('admin-fab-menu')) return;
    const fab = document.createElement('button');
    fab.id = 'admin-fab-menu';
    fab.className = 'fixed bottom-4 right-4 z-[1001] w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center';
    fab.setAttribute('aria-label', 'Open admin menu');
    fab.innerHTML = '<i class="fas fa-bars"></i>';

    const overlay = document.createElement('div');
    overlay.id = 'admin-fab-overlay';
    overlay.className = 'fixed inset-0 bg-black/40 hidden z-[1000]';

    const modal = document.createElement('div');
    modal.id = 'admin-fab-modal';
    modal.className = 'fixed bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hidden z-[1002] max-h-[70vh] overflow-y-auto';

    // Build a compact list from existing sidebar links
    const sb = document.getElementById('admin-sidebar');
    let links = [];
    if (sb) links = Array.from(sb.querySelectorAll('a[href$=".html"]')).map(a => ({ href: a.getAttribute('href'), text: (a.textContent||'').trim(), icon: a.querySelector('i')?.className || 'fas fa-angle-right' }));
    if (!links.length) {
        links = [
            { href: 'admin_dashboard.html', text: 'Dashboard', icon: 'fas fa-tachometer-alt' },
            { href: 'admin_users.html', text: 'Users', icon: 'fas fa-users' },
            { href: 'admin_rolesPermissions.html', text: 'Roles', icon: 'fas fa-user-shield' },
            { href: 'admin_scholarship.html', text: 'Scholarships', icon: 'fas fa-graduation-cap' },
            { href: 'admin_applications.html', text: 'Applications', icon: 'fas fa-file-alt' },
            { href: 'admin_partners.html', text: 'Partners', icon: 'fas fa-handshake' },
            { href: 'admin_services.html', text: 'Services', icon: 'fas fa-briefcase' },
            { href: 'admin_email_template.html', text: 'Email Templates', icon: 'fas fa-envelope' },
            { href: 'admin_help.html', text: 'Help', icon: 'fas fa-question' }
        ];
    }
    modal.innerHTML = `
      <div class="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span class="font-semibold">Admin Menu</span>
        <button id="admin-fab-close" class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-times"></i></button>
      </div>
      <div class="p-2">
        ${links.map(l => `<a href="${l.href}" class="flex items-center gap-3 p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="${l.icon} w-5 text-center"></i>
            <span>${l.text}</span>
        </a>`).join('')}
      </div>`;

    document.body.appendChild(fab);
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    const open = () => { overlay.classList.remove('hidden'); modal.classList.remove('hidden'); };
    const close = () => { overlay.classList.add('hidden'); modal.classList.add('hidden'); };
    fab.addEventListener('click', open);
    overlay.addEventListener('click', close);
    modal.addEventListener('click', (e)=>{ if(e.target && e.target.id==='admin-fab-close') close(); });
}