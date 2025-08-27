class AdminServicesManager {
    constructor() {
        this.services = [];
        this.filtered = [];
        this.currentId = null;
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    async init() {
        this.cacheEls();
        this.bindEvents();
        await this.loadServices();
    }

    cacheEls() {
        this.listEl = document.getElementById('servicesList');
        this.totalEl = document.getElementById('svcTotal');
        this.monetizedEl = document.getElementById('svcMonetized');
        this.automatedEl = document.getElementById('svcAutomated');
        this.searchEl = document.getElementById('svcSearch');
        this.modalEl = document.getElementById('svcModal');
        this.modalTitleEl = document.getElementById('svcModalTitle');
        this.formEl = document.getElementById('svcForm');
        this.idEl = document.getElementById('svcId');
        this.nameEl = document.getElementById('svcName');
        this.descEl = document.getElementById('svcDesc');
        this.imageUrlEl = document.getElementById('svcImageUrl');
        this.pricingTypeEl = document.getElementById('svcPricingType');
        this.priceEl = document.getElementById('svcPrice');
        this.automateEl = document.getElementById('svcAutomate');
    }

    bindEvents() {
        document.getElementById('addServiceBtn').addEventListener('click', () => this.openModal());
        document.getElementById('svcCancel').addEventListener('click', () => this.closeModal());
        this.formEl.addEventListener('submit', (e) => { e.preventDefault(); this.saveService(); });
        this.searchEl.addEventListener('input', () => this.applyFilter());
        // Drag & drop for image
        const drop = document.getElementById('svcImageDrop');
        const fileInput = document.getElementById('svcImageFile');
        const urlInput = document.getElementById('svcImageUrl');
        const preview = document.getElementById('svcImagePreview');
        if (drop && fileInput && urlInput && preview) {
            drop.addEventListener('click', () => fileInput.click());
            ['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('ring-2','ring-primary-500'); }));
            ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('ring-2','ring-primary-500'); }));
            drop.addEventListener('drop', (e) => {
                const dt = e.dataTransfer; if (!dt) return;
                if (dt.files && dt.files[0]) {
                    const file = dt.files[0];
                    if (!file.type.startsWith('image/')) return;
                    const form = new FormData(); form.append('image', file);
                    fetch('/api/services/upload-image', { method: 'POST', body: form })
                        .then(r => r.json())
                        .then(res => {
                            if (res && res.success && res.url) {
                                const abs = this.abs(res.url);
                                urlInput.value = abs; preview.src = abs; preview.classList.remove('hidden');
                            }
                        });
                } else {
                    const text = dt.getData('text/uri-list') || dt.getData('text/plain');
                    if (text) { urlInput.value = text.trim(); preview.src = text.trim(); preview.classList.remove('hidden'); }
                }
            });
            fileInput.addEventListener('change', () => {
                const file = fileInput.files && fileInput.files[0];
                if (!file || !file.type.startsWith('image/')) return;
                const form = new FormData(); form.append('image', file);
                fetch('/api/services/upload-image', { method: 'POST', body: form })
                    .then(r => r.json())
                    .then(res => { if (res && res.success && res.url) { const abs = this.abs(res.url); urlInput.value = abs; preview.src = abs; preview.classList.remove('hidden'); } });
            });
            urlInput.addEventListener('input', () => {
                const val = urlInput.value.trim();
                if (!val) { preview.classList.add('hidden'); preview.removeAttribute('src'); return; }
                preview.src = val; preview.classList.remove('hidden');
            });
        }
    }

    async loadServices() {
        try {
            const res = await fetch('/api/services');
            const data = await res.json();
            this.services = Array.isArray(data) ? data : [];
            await this.loadMonetization();
            this.applyFilter();
        } catch (e) {
            this.toast('Failed to load services', 'error');
        }
    }

    async loadMonetization() {
        try {
            const res = await fetch('/api/services-monetization');
            if (!res.ok) return;
            const rows = await res.json();
            const byId = new Map(rows.map(r => [String(r.service_id), r]));
            this.services = this.services.map(s => ({
                ...s,
                monetization: byId.get(String(s.id)) || { pricing_type: 'free', price: 0, is_automated: 0 }
            }));
        } catch {}
    }

    applyFilter() {
        const q = (this.searchEl.value || '').toLowerCase();
        this.filtered = this.services.filter(s => !q || s.name.toLowerCase().includes(q) || (s.description||'').toLowerCase().includes(q));
        this.render();
    }

    render() {
        // stats
        this.totalEl.textContent = this.services.length;
        const monetizedCount = this.services.filter(s => s.monetization && s.monetization.pricing_type !== 'free').length;
        const automatedCount = this.services.filter(s => s.monetization && s.monetization.is_automated).length;
        this.monetizedEl.textContent = monetizedCount;
        this.automatedEl.textContent = automatedCount;

        if (this.filtered.length === 0) {
            this.listEl.innerHTML = '<div class="p-6 text-center text-gray-500 dark:text-gray-400">No services found</div>';
            return;
        }
        this.listEl.innerHTML = this.filtered.map(s => `
            <div class="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div class="flex items-center gap-4">
                    <img src="${s.image_url}" alt="${s.name}" class="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-700 flex-shrink-0" />
                    <div>
                        <div class="font-semibold text-gray-900 dark:text-gray-100">${s.name}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300">${s.description || ''}</div>
                        <div class="mt-1 text-sm">
                            <span class="mr-3 text-white"><i class="fas fa-coins mr-1 text-white"></i>${s.monetization?.pricing_type || 'free'}${s.monetization?.pricing_type !== 'free' ? ` - $${Number(s.monetization?.price||0).toFixed(2)}` : ''}</span>
                            <span class="text-white"><i class="fas fa-robot mr-1 text-white"></i>${s.monetization?.is_automated ? 'Automated' : 'Manual'}</span>
                        </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 self-start md:self-auto">
                      <button class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200" onclick="adminServices.edit(${s.id})" title="Edit"><i class="fas fa-edit"></i></button>
                      <button class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-blue-600 dark:text-blue-400" onclick="adminServices.openChart(${s.id}, '${s.name.replace(/'/g, "\'")}')" title="Usage chart"><i class="fas fa-chart-line"></i></button>
                      <button class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-red-600 dark:text-red-400" onclick="adminServices.remove(${s.id})" title="Delete"><i class="fas fa-trash"></i></button>
                  </div>
                </div>
                
            </div>
        `).join('');

        // No inline charts now
    }

    async initChartForService(serviceId, timeframe, inModal = false) {
        try {
            const res = await fetch(`/api/services/${serviceId}/metrics?timeframe=${encodeURIComponent(timeframe)}`);
            if (!res.ok) return;
            const data = await res.json();
            const ctx = inModal ? document.getElementById('svcChartCanvas') : document.getElementById(`svcChart-${serviceId}`);
            if (!ctx) return;
            const existing = ctx._chartInstance;
            if (existing && existing.destroy) existing.destroy();
            // eslint-disable-next-line no-undef
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Usage',
                        data: data.values,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.15)',
                        fill: true,
                        tension: 0.35,
                        pointRadius: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false } },
                        y: { grid: { color: 'rgba(156,163,175,0.2)' }, ticks: { precision: 0 } }
                    }
                }
            });
            ctx._chartInstance = chart;
        } catch {}
    }

    changeTimeframe(serviceId, tf) {
        this.initChartForService(serviceId, tf);
    }

    openChart(serviceId, name) {
        const modal = document.getElementById('svcChartModal');
        const title = document.getElementById('svcChartTitle');
        const tfSel = document.getElementById('svcChartTf');
        const closeBtn = document.getElementById('svcChartClose');
        if (!modal || !title || !tfSel) return;
        title.textContent = `${name} - Usage`;
        tfSel.value = 'daily';
        modal.classList.remove('hidden');
        this.initChartForService(serviceId, 'daily', true);
        const handler = () => { modal.classList.add('hidden'); };
        closeBtn.onclick = handler;
        modal.addEventListener('click', (e) => { if (e.target.id === 'svcChartModal') handler(); });
        tfSel.onchange = () => this.initChartForService(serviceId, tfSel.value, true);
    }

    openModal(svc = null) {
        this.currentId = svc?.id || null;
        this.modalTitleEl.textContent = this.currentId ? 'Edit Service' : 'Add Service';
        this.idEl.value = this.currentId || '';
        this.nameEl.value = svc?.name || '';
        this.descEl.value = svc?.description || '';
        this.imageUrlEl.value = svc?.image_url || '';
        this.pricingTypeEl.value = svc?.monetization?.pricing_type || 'free';
        this.priceEl.value = svc?.monetization?.price || '';
        this.automateEl.checked = !!(svc?.monetization?.is_automated);
        const saveText = document.getElementById('svcSaveText');
        const saveIcon = document.getElementById('svcSaveIcon');
        if (saveText && saveIcon) {
            saveText.textContent = this.currentId ? 'Update' : 'Create';
            saveIcon.className = this.currentId ? 'fas fa-save' : 'fas fa-plus';
        }
        this.modalEl.classList.remove('hidden');
    }

    closeModal() { this.modalEl.classList.add('hidden'); }

    async saveService() {
        try {
            const payload = {
                name: this.nameEl.value.trim(),
                description: this.descEl.value.trim(),
                image_url: this.imageUrlEl.value.trim()
            };
            if (!payload.name || !payload.description || !payload.image_url) {
                this.toast('Please fill all fields', 'error');
                return;
            }
            let id = this.currentId;
            if (id) {
                const res = await fetch(`/api/services/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!res.ok) throw new Error('Update failed');
            } else {
                const res = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!res.ok) throw new Error('Create failed');
                const d = await res.json();
                id = d.id;
            }
            // Save monetization
            const monetization = {
                service_id: id,
                pricing_type: this.pricingTypeEl.value,
                price: Number(this.priceEl.value || 0),
                is_automated: this.automateEl.checked ? 1 : 0
            };
            await fetch('/api/services-monetization', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(monetization) });

            await this.loadServices();
            this.closeModal();
            this.toast('Service saved', 'success');
        } catch (e) {
            this.toast('Failed to save service', 'error');
        }
    }

    edit(id) {
        const svc = this.services.find(s => String(s.id) === String(id));
        if (!svc) return;
        this.openModal(svc);
    }

    async configure(id) {
        const svc = this.services.find(s => String(s.id) === String(id));
        if (!svc) return;
        this.openModal(svc);
    }

    async remove(id) {
        if (!confirm('Delete this service?')) return;
        try {
            const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            await this.loadServices();
            this.toast('Service deleted', 'success');
        } catch (e) {
            this.toast('Failed to delete service', 'error');
        }
    }

    toast(message, type='info') {
        const el = document.createElement('div');
        el.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded shadow text-white ${type==='success'?'bg-green-600':type==='error'?'bg-red-600':'bg-blue-600'}`;
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(()=>{ el.remove(); }, 2500);
    }

    abs(url) {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return `${window.location.origin}${url}`;
        return `${window.location.origin}/${url}`;
    }
}

const adminServices = new AdminServicesManager();



