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
                if (nameTarget) nameTarget.textContent = user.full_name || user.fullName || 'Admin';
            } catch {}
        })();

        // Initialize profile/avatar basic controls (avatar preview and upload form support)
        initializeProfileControls();

        // Wire profile modal and password section behaviors so they work when injected via innerHTML
        wireProfileModal();

        // Logout with confirmation
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => { window.location.href = 'logout.html'; });

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

    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const fullName = stored.full_name || stored.fullName || 'User';
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
}

function wireProfileModal(){
    const modal = document.getElementById('profileModal');
    const profileBtn = document.getElementById('profileBtn');
    const openPasswordSection = document.getElementById('openPasswordSection');
    const passwordSection = document.getElementById('passwordSection');
    const cancelPassword = document.getElementById('cancelPassword');

    const setText = (id, val) => { const el=document.getElementById(id); if(el) el.textContent = val; };
    const setValue = (id,val) => { const el=document.getElementById(id); if(el) el.value = val||''; };
    const getUser = () => { try { return JSON.parse(localStorage.getItem('user')||'{}'); } catch { return {}; } };

    async function authFetch(url, opts){
            const token = localStorage.getItem('token');
        const headers = (opts && opts.headers) || {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(url, { ...(opts||{}), headers });
    }

    async function loadAccount(){
        try{
            const res = await authFetch('/api/admin/account');
            if(!res.ok) return;
            const data = await res.json();
            const name = data.full_name || getUser().fullName || 'User';
            const email = data.email || getUser().email || 'email@example.com';
            setText('profileModalName', name);
            setText('profileModalEmail', email);
            setValue('pfFullName', name);
            setValue('pfEmail', email);
            setValue('pfPhone', data.phone || '');
            setValue('pfPosition', data.position || '');
            setValue('pfBio', data.bio || '');
            setValue('pfTimezone', data.timezone || 'UTC');
            setValue('pfLanguage', data.language || 'en');
        }catch(e){ /* ignore */ }
    }

    profileBtn && profileBtn.addEventListener('click', async ()=>{ await loadAccount(); });

    // Toggle inline password section
    if (openPasswordSection && passwordSection){
        openPasswordSection.addEventListener('click', (e)=>{
            e.preventDefault();
            const c = document.getElementById('pwCurrent');
            const n = document.getElementById('pwNew');
            const r = document.getElementById('pwConfirm');
            passwordSection.classList.remove('hidden');
            if (c) { c.value=''; n.value=''; r.value=''; c.focus(); }
        });
    }
    if (cancelPassword && passwordSection){
        cancelPassword.addEventListener('click', (e)=>{ e.preventDefault(); passwordSection.classList.add('hidden'); });
    }

    // Avatar upload (from injected DOM)
    const avatarInput = document.getElementById('profileAvatarInput');
    const avatarName = document.getElementById('profileAvatarName');
    const modalAvatar = document.getElementById('profileModalAvatar');
    const modalFallback = document.getElementById('profileModalFallback');
    const showAvatar = (src)=>{
        if (src){ modalAvatar.src = src; modalAvatar.classList.remove('hidden'); modalFallback.classList.add('hidden'); }
        else { modalAvatar.classList.add('hidden'); modalFallback.classList.remove('hidden'); }
    };
    if (avatarInput){
        avatarInput.addEventListener('change', async ()=>{
            const f = avatarInput.files && avatarInput.files[0];
            if (avatarName) avatarName.textContent = f ? f.name : '';
            if (f){
                try{
                    const fd = new FormData();
                    fd.append('profilePicture', f);
                    const res = await authFetch('/api/admin/account/profile-picture', { method:'POST', body: fd });
                    if(res.ok){ const data = await res.json(); const src = data.profile_picture ? ('/' + String(data.profile_picture).replace(/^\/+/, '')) : ''; showAvatar(src); }
                }catch(e){}
            }
        });
    }

    // Save profile
    const saveBtn = document.getElementById('profileSaveBtn');
    if (saveBtn){
        saveBtn.addEventListener('click', async ()=>{
            try{
                const payload = {
                    fullName: document.getElementById('pfFullName').value || '',
                    email: document.getElementById('pfEmail').value || '',
                    phone: document.getElementById('pfPhone')?.value || '',
                    position: document.getElementById('pfPosition')?.value || '',
                    bio: document.getElementById('pfBio')?.value || '',
                    timezone: document.getElementById('pfTimezone')?.value || 'UTC',
                    language: document.getElementById('pfLanguage')?.value || 'en'
                };
                const res = await authFetch('/api/admin/account', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
                if(!res.ok) throw new Error('Failed to save');
                const data = await res.json();
                const user = getUser();
                const cached = { ...(user||{}), fullName: data.full_name || payload.fullName, email: data.email || payload.email };
                localStorage.setItem('user', JSON.stringify(cached));
                alert('Profile saved');
            }catch(e){ alert(e.message || 'Failed to save'); }
        });
    }

    // Change password submit
    const pwdBtn = document.getElementById('passwordSaveBtn');
    if (pwdBtn){
        pwdBtn.addEventListener('click', async ()=>{
            try{
                const current = document.getElementById('pwCurrent').value || '';
                const next = document.getElementById('pwNew').value || '';
                const confirm = document.getElementById('pwConfirm').value || '';
                if(!current || !next || next!==confirm) throw new Error('Check passwords');
                const res = await authFetch('/api/auth/change-password', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ currentPassword: current, newPassword: next }) });
                if(!res.ok) throw new Error('Failed to change password');
                alert('Password updated');
                passwordSection && passwordSection.classList.add('hidden');
            }catch(e){ alert(e.message || 'Failed to change password'); }
        });
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

document.addEventListener('DOMContentLoaded', () => {
    includeAdminHeader();
});

