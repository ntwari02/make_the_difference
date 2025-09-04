// Injects shared user header and sidebar into any page that includes containers
async function includeUserHeader() {
  const container = document.getElementById('user-header-container');
  if (!container) return;
  try {
    const res = await fetch('components/user-header.html');
    if (!res.ok) throw new Error('Failed to load user header');
    container.innerHTML = await res.text();
    // Update name
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const name = user.full_name || user.fullName || 'User';
    const nameEl = document.getElementById('userHeaderName');
    if (nameEl) nameEl.textContent = name;
    // Theme toggle
    const themeBtn = document.getElementById('user-theme-toggle');
    const icon = document.getElementById('user-theme-icon');
    const apply = () => {
      const dark = localStorage.getItem('color-theme') === 'dark' || (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (dark) {
        document.documentElement.classList.add('dark');
        icon && (icon.className = 'fas fa-sun text-yellow-400');
      } else {
        document.documentElement.classList.remove('dark');
        icon && (icon.className = 'fas fa-moon text-gray-600 dark:text-gray-300');
      }
    };
    apply();
    themeBtn?.addEventListener('click', () => {
      const current = document.documentElement.classList.contains('dark');
      if (current) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
      }
      apply();
    });
    // Sidebar toggle button wiring (header button)
    const headerToggle = document.getElementById('user-sidebar-toggle');
    headerToggle?.addEventListener('click', () => {
      const sb = document.getElementById('userSidebar');
      if (!sb) return;
      sb.classList.toggle('-translate-x-full');
    });
  } catch (e) {
    console.error(e);
  }
}

async function includeUserSidebar() {
  // If page doesn't include container, auto-inject to body
  let container = document.getElementById('user-sidebar-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'user-sidebar-container';
    document.body.appendChild(container);
  }
  try {
    const res = await fetch('components/user-sidebar.html');
    if (!res.ok) throw new Error('Failed to load user sidebar');
    container.innerHTML = await res.text();
    // Close on outside click for mobile
    document.addEventListener('click', (e) => {
      const sb = document.getElementById('userSidebar');
      const toggle = document.getElementById('user-sidebar-toggle');
      if (!sb) return;
      if (window.innerWidth >= 768) return;
      const inside = e.target.closest('#userSidebar');
      const clickedToggle = e.target.closest('#user-sidebar-toggle');
      if (!inside && !clickedToggle) sb.classList.add('-translate-x-full');
    });
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  includeUserHeader();
  includeUserSidebar();
});


