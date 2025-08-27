class AdminPartnersManager {
    constructor() {
        this.partners = [];
        this.filtered = [];
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    async init() {
        this.cacheEls();
        this.bindEvents();
        await this.loadPartners();
    }

    cacheEls() {
        this.listEl = document.getElementById('partnersList');
        this.totalEl = document.getElementById('ptTotal');
        this.pendingEl = document.getElementById('ptPending');
        this.approvedEl = document.getElementById('ptApproved');
        this.searchEl = document.getElementById('ptSearch');
        this.modalEl = document.getElementById('ptModal');
        this.titleEl = document.getElementById('ptModalTitle');
        this.idEl = document.getElementById('ptId');
        this.nameEl = document.getElementById('ptName');
        this.emailEl = document.getElementById('ptEmail');
        this.orgEl = document.getElementById('ptOrg');
        this.phoneEl = document.getElementById('ptPhone');
        this.msgEl = document.getElementById('ptMessage');
        this.statusEl = document.getElementById('ptStatus');
        this.typeEl = document.getElementById('ptType');
        this.saveText = document.getElementById('ptSaveText');
        this.saveIcon = document.getElementById('ptSaveIcon');
        this.fileEl = document.getElementById('ptImageFile');
        this.previewEl = document.getElementById('ptImagePreview');
    }

    bindEvents() {
        document.getElementById('ptAddBtn').addEventListener('click', () => this.openModal());
        document.getElementById('ptCancel').addEventListener('click', () => this.closeModal());
        document.getElementById('ptForm').addEventListener('submit', (e) => { e.preventDefault(); this.save(); });
        this.searchEl.addEventListener('input', () => this.applyFilter());
    }

    async loadPartners() {
        try {
            const res = await fetch('/api/partners');
            const data = await res.json();
            this.partners = Array.isArray(data) ? data : [];
            this.applyFilter();
        } catch { this.toast('Failed to load partners', 'error'); }
    }

    applyFilter() {
        const q = (this.searchEl.value || '').toLowerCase();
        this.filtered = this.partners.filter(p => !q || (p.name||'').toLowerCase().includes(q) || (p.organization||'').toLowerCase().includes(q));
        this.render();
    }

    render() {
        this.totalEl.textContent = this.partners.length;
        this.pendingEl.textContent = this.partners.filter(p => (p.status||'pending') === 'pending').length;
        this.approvedEl.textContent = this.partners.filter(p => (p.status||'pending') === 'approved').length;
        if (this.filtered.length === 0) { this.listEl.innerHTML = '<div class="p-6 text-center text-gray-500">No partners found</div>'; return; }
        this.listEl.innerHTML = this.filtered.map(p => `
            <div class="p-4 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-lg">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div class="min-w-0 flex items-start gap-3">
                        ${p.profile_picture ? `<img src="${this.normalizePath(p.profile_picture)}" class="w-10 h-10 rounded object-cover border" onerror="this.style.display='none'">` : `<div class='w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400'><i class='fas fa-user'></i></div>`}
                    <div class="min-w-0">
                        <div class="font-semibold text-gray-900 truncate">${p.name || 'Unnamed'}</div>
                        <div class="text-sm text-gray-600 truncate">${p.organization || ''}</div>
                        <div class="text-xs text-gray-500 truncate">${p.email || ''}${p.phone ? ' • '+p.phone : ''}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="text-xs font-semibold" style="color: ${this.statusColor(p.status)}">${(p.status||'pending')}</span>
                        <button class="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white shadow" onclick="adminPartners.edit(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white shadow" onclick="adminPartners.remove(${p.id})" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openModal(p=null) {
        this.titleEl.textContent = p ? 'Edit Partner' : 'Add Partner';
        this.saveText.textContent = p ? 'Update' : 'Create';
        this.saveIcon.className = p ? 'fas fa-save' : 'fas fa-plus';
        this.idEl.value = p?.id || '';
        this.nameEl.value = p?.name || '';
        this.emailEl.value = p?.email || '';
        this.orgEl.value = p?.organization || '';
        this.phoneEl.value = p?.phone || '';
        this.msgEl.value = p?.message || '';
        this.statusEl.value = p?.status || 'pending';
        if (this.typeEl) this.typeEl.value = (p?.partner_type || 'individual');
        // Show existing profile picture preview if available
        if (this.previewEl) {
            const src = (p && p.profile_picture) ? this.normalizePath(p.profile_picture) : '';
            if (src) { this.previewEl.src = src; this.previewEl.classList.remove('hidden'); }
            else { this.previewEl.classList.add('hidden'); this.previewEl.removeAttribute('src'); }
        }
        this.modalEl.classList.remove('hidden');
        // If editing, allow uploading selected file as profile picture for this partner
        const useAsProfileBtnId = 'ptUseAsProfileBtn';
        let btn = document.getElementById(useAsProfileBtnId);
        if (!btn) {
            btn = document.createElement('button');
            btn.id = useAsProfileBtnId;
            btn.className = 'mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded';
            btn.innerHTML = '<i class="fas fa-user-check"></i> Use selected image as profile picture';
            const target = document.getElementById('ptImageFile');
            target && target.parentElement && target.parentElement.appendChild(btn);
        }
        btn.onclick = async () => {
            const partnerId = this.idEl.value;
            if (!partnerId) { this.toast('Save partner first, then set profile picture.', 'error'); return; }
            try {
                const file = document.getElementById('ptImageFile').files[0];
                if (!file) { this.toast('Select an image first', 'error'); return; }
                if (!file.type.startsWith('image/')) { this.toast('Please select an image file', 'error'); return; }
                const token = localStorage.getItem('token');
                const fd = new FormData(); fd.append('image', file);
                const res = await fetch(`/api/partners/${partnerId}/profile-picture`, { method:'POST', headers: token?{ 'Authorization': `Bearer ${token}` }: {}, body: fd });
                const j = await res.json().catch(()=>({}));
                if (!res.ok || j.success === false) throw new Error(j.message || 'Upload failed');
                this.toast('Profile picture updated', 'success');
                await this.loadPartners();
            } catch (e) { this.toast(e.message || 'Failed to update profile picture', 'error'); }
        };
    }
    closeModal(){ this.modalEl.classList.add('hidden'); }

    async save() {
        try {
            const payload = {
                name: this.nameEl.value.trim(),
                email: this.emailEl.value.trim(),
                organization: this.orgEl.value.trim(),
                phone: this.phoneEl.value.trim(),
                message: this.msgEl.value.trim(),
                status: this.statusEl.value,
                partnerType: this.typeEl ? this.typeEl.value : undefined
            };
            const id = this.idEl.value;
            let partnerId = id;
            if (id) {
                const res = await fetch(`/api/partners/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
                if (!res.ok) throw new Error('Update failed');
            } else {
                const res = await fetch('/api/partners', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
                const data = await res.json().catch(()=>({}));
                if (!res.ok) throw new Error(data.message || 'Create failed');
                partnerId = String(data.id || '');
                this.idEl.value = partnerId;
            }

            // If an image is selected, upload as profile picture automatically
            const file = this.fileEl && this.fileEl.files && this.fileEl.files[0];
            if (partnerId && file && file.type && file.type.startsWith('image/')) {
                await this.uploadProfile(partnerId, file);
            }
            await this.loadPartners();
            this.closeModal();
            this.toast('Saved', 'success');
        } catch { this.toast('Failed to save', 'error'); }
    }

    edit(id) {
        const p = this.partners.find(x => String(x.id) === String(id));
        if (!p) return; this.openModal(p);
    }

    async remove(id) {
        if (!confirm('Delete this partner?')) return;
        try {
            const res = await fetch(`/api/partners/${id}`, { method:'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            await this.loadPartners();
            this.toast('Deleted', 'success');
        } catch { this.toast('Failed to delete', 'error'); }
    }

    toast(message, type='info'){
        const el = document.createElement('div');
        el.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded shadow text-white ${type==='success'?'bg-green-600':type==='error'?'bg-red-600':'bg-blue-600'}`;
        el.textContent = message; document.body.appendChild(el); setTimeout(()=> el.remove(), 2500);
    }

    statusColor(status){
        const s = String(status || 'pending').trim().toLowerCase();
        if (s === 'approved') return '#16a34a'; // green-600
        if (s === 'rejected') return '#dc2626'; // red-600
        return '#ca8a04'; // yellow-600
    }

    normalizePath(p){
        if (!p) return '';
        let s = String(p).replace(/\\\\/g,'/');
        if (!s.startsWith('/')) s = '/' + s;
        return s;
    }

    async uploadProfile(partnerId, file){
        try{
            const token = localStorage.getItem('token');
            const fd = new FormData(); fd.append('image', file);
            const res = await fetch(`/api/partners/${partnerId}/profile-picture`, { method:'POST', headers: token?{ 'Authorization': `Bearer ${token}` }: {}, body: fd });
            const j = await res.json().catch(()=>({}));
            if (!res.ok || j.success === false) throw new Error(j.message || 'Upload failed');
            if (this.previewEl) { this.previewEl.src = this.normalizePath(j.profile_picture); this.previewEl.classList.remove('hidden'); }
        } catch (e) {
            this.toast(e.message || 'Failed to upload profile picture', 'error');
        }
    }
}

const adminPartners = new AdminPartnersManager();


