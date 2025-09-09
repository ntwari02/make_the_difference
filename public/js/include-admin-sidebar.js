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

            // Wire up sidebar toggle button with retry mechanism
            const wireUpSidebarToggle = () => {
                const adminSidebarToggle = document.getElementById('admin-sidebar-toggle');
                if (adminSidebarToggle) {
                    // Remove any existing event listeners to avoid duplicates
                    const newToggle = adminSidebarToggle.cloneNode(true);
                    adminSidebarToggle.parentNode.replaceChild(newToggle, adminSidebarToggle);
                    
                    newToggle.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Sidebar toggle clicked!'); // Debug log
                        const sidebar = document.getElementById('admin-sidebar');
                        if (sidebar) {
                            const isHidden = sidebar.classList.contains('-translate-x-full');
                            console.log('Sidebar hidden:', isHidden); // Debug log
                            sidebar.classList.toggle('-translate-x-full');
                            console.log('Sidebar classes after toggle:', sidebar.className); // Debug log
                        } else {
                            console.error('Sidebar element not found!');
                        }
                    });
                    console.log('Sidebar toggle wired up successfully!'); // Debug log
                    return true;
                }
                return false;
            };

            // Try to wire up immediately, then retry if needed
            if (!wireUpSidebarToggle()) {
                // If toggle button doesn't exist yet, retry after a short delay
                setTimeout(() => {
                    if (!wireUpSidebarToggle()) {
                        // Final retry after longer delay
                        setTimeout(wireUpSidebarToggle, 500);
                    }
                }, 100);
            }

            // Close sidebar on outside click for mobile (like user dashboard)
            document.addEventListener('click', (e) => {
                if (window.innerWidth >= 768) return; // Only for mobile/tablet
                const sidebar = document.getElementById('admin-sidebar');
                const insideSidebar = e.target.closest('#admin-sidebar');
                const clickedToggle = e.target.closest('#admin-sidebar-toggle');
                if (sidebar && !insideSidebar && !clickedToggle) {
                    sidebar.classList.add('-translate-x-full');
                }
            });

            // Mark active link
            try { markActiveSidebarLink(); } catch {}
        }
    } catch (error) {
        console.error('Error loading admin sidebar:', error);
    }
}

function initializeSidebar() {
    const sidebar = document.getElementById('admin-sidebar');

    if (!sidebar) return;

    // Update help badge count
    updateHelpBadge();
    // Poll periodically to keep badge fresh (only if user is authenticated)
    setInterval(() => {
        const authToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (authToken) {
            updateHelpBadge();
        }
    }, 30000);

    // Function to update help badge count
    async function updateHelpBadge() {
        try {
            // Get auth token from localStorage
            const authToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
            
            if (!authToken) {
                console.log('No auth token found, skipping help badge update');
                return;
            }

            // Use a short-timeout, failure-silent fetch to avoid console errors when API is unreachable
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            let response;
            try {
                response = await fetch('/api/admin-help/stats', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
                });
            } catch (e) {
                // Network/timeout error: hide badge quietly and exit
                clearTimeout(timeoutId);
                const badge = document.getElementById('help-badge');
                if (badge) { badge.classList.add('hidden'); }
                return;
            } finally {
                clearTimeout(timeoutId);
            }
            
            if (response.ok) {
                const data = await response.json();
                const badge = document.getElementById('help-badge');
                if (badge && data.success) {
                    // Count unresolved: pending + active (not resolved)
                    const pending = Number(data.stats.pending_requests || 0);
                    const active = Number(data.stats.active_requests || 0);
                    const unresolved = (Number.isFinite(pending) ? pending : 0) + (Number.isFinite(active) ? active : 0);
                    if (unresolved > 0) {
                        badge.textContent = unresolved;
                        badge.classList.remove('hidden');
                    } else {
                        badge.classList.add('hidden');
                    }
                }
            } else if (response.status === 401) {
                console.log('Unauthorized access to help stats, skipping badge update');
                // Hide the badge if unauthorized
                const badge = document.getElementById('help-badge');
                if (badge) {
                    badge.classList.add('hidden');
                }
            } else {
                // On non-OK responses, hide badge without logging console errors
                const badge = document.getElementById('help-badge');
                if (badge) {
                    badge.classList.add('hidden');
                }
            }
        } catch (error) {
            // Suppress noisy console errors; hide the badge and continue
            const badge = document.getElementById('help-badge');
            if (badge) {
                badge.classList.add('hidden');
            }
        }
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
    

    

});

