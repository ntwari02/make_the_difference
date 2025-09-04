class AdminServicesManager {
	constructor(){
		this.services = [];
		this.currentPage = 1;
		this.perPage = 10;
		this.filtered = [];
		this.init();
	}

	async init(){
		this.bindEvents();
		await this.loadServices();
		await this.updateStats();
	}

	bindEvents(){
		document.getElementById('addServiceBtn').addEventListener('click', ()=> this.openServiceModal());
		document.getElementById('closeServiceModal').addEventListener('click', ()=> this.closeServiceModal());
		document.getElementById('cancelServiceBtn').addEventListener('click', ()=> this.closeServiceModal());
		document.getElementById('serviceForm').addEventListener('submit', (e)=>{ e.preventDefault(); this.saveService(); });

		const drop = document.getElementById('serviceImageDrop');
		const fileInput = document.getElementById('serviceImageFile');
		if (drop && fileInput){
			const onFiles = (files)=>{
				const file = files && files[0];
				if (!file) return;
				if (!file.type.startsWith('image/')) return alert('Please upload an image.');
				if (file.size > 5 * 1024 * 1024) return alert('Max file size is 5MB.');
				this.previewImage(file);
				this.uploadImage(file);
			};
			drop.addEventListener('click', ()=> fileInput.click());
			drop.addEventListener('dragover', (e)=>{ e.preventDefault(); drop.classList.add('border-blue-400'); });
			drop.addEventListener('dragleave', ()=> drop.classList.remove('border-blue-400'));
			drop.addEventListener('drop', (e)=>{ e.preventDefault(); drop.classList.remove('border-blue-400'); onFiles(e.dataTransfer.files); });
			fileInput.addEventListener('change', (e)=> onFiles(e.target.files));
		}

		const search = document.getElementById('serviceSearch');
		if (search){
			search.addEventListener('input', ()=>{ this.currentPage = 1; this.loadServices(); });
		}

		const refresh = document.getElementById('servicesRefreshBtn');
		if (refresh){ refresh.addEventListener('click', ()=> this.loadServices()); }

		document.getElementById('svcPrevPage')?.addEventListener('click', ()=>{ if (this.currentPage>1){ this.currentPage--; this.loadServices(); }});
		document.getElementById('svcNextPage')?.addEventListener('click', ()=>{ this.currentPage++; this.loadServices(); });
	}

	buildAuthHeaders(){
		const token = localStorage.getItem('token');
		return token ? { 'Authorization': `Bearer ${token}` } : {};
	}

	async loadServices(){
		try{
			document.getElementById('loadingState').classList.remove('hidden');
			document.getElementById('emptyState').classList.add('hidden');
			const params = new URLSearchParams({
				page: String(this.currentPage),
				limit: String(this.perPage),
				search: (document.getElementById('serviceSearch')?.value || '')
			});
			const res = await fetch(`/api/admin/services?${params.toString()}`, { headers: this.buildAuthHeaders() });
			if (!res.ok) throw new Error('Failed to load services');
			const data = await res.json();
			this.services = data.services || [];
			this.filtered = this.services;
			this.renderTable();
			this.updatePaginationFromServer(data.pagination);
			await this.updateStats();
		}catch(e){
			console.error('Load services error', e);
			alert('Failed to load services');
		} finally {
			document.getElementById('loadingState').classList.add('hidden');
		}
	}

	applyFilters(){ /* no-op with server-side pagination; kept for compatibility */ }

	renderTable(){
		const tbody = document.getElementById('servicesTableBody');
		if (!this.filtered.length){
			tbody.innerHTML = '';
			document.getElementById('emptyState').classList.remove('hidden');
			return;
		}
		document.getElementById('emptyState').classList.add('hidden');
		const start = (this.currentPage-1)*this.perPage;
		const rows = this.filtered.slice(start, start+this.perPage);
		tbody.innerHTML = rows.map(s=>`
			<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
				<td class="px-6 py-4">
					<div class="font-medium">${this.escape(s.name)}</div>
					<div class="text-sm text-gray-500">ID: ${s.id}</div>
				</td>
				<td class="px-6 py-4">${this.escape(s.description||'').slice(0,120)}${(s.description||'').length>120?'...':''}</td>
				<td class="px-6 py-4"><img src="/${s.image_url}" alt="img" class="h-10 w-10 object-cover rounded" onerror="this.style.display='none'" /></td>
				<td class="px-6 py-4">
					<div class="flex gap-2">
						<button class="px-2 py-1 rounded bg-gray-700 text-white" onclick="adminServices.edit(${s.id})"><i class="fas fa-edit"></i></button>
						<button class="px-2 py-1 rounded bg-red-600 text-white" onclick="adminServices.remove(${s.id})"><i class="fas fa-trash"></i></button>
					</div>
				</td>
			</tr>
		`).join('');
	}

	updatePagination(){
		const total = this.filtered.length;
		const start = total===0?0: (this.currentPage-1)*this.perPage + 1;
		const end = Math.min(this.currentPage*this.perPage, total);
		const max = Math.ceil(Math.max(1,total)/this.perPage);
		const s = (id)=> document.getElementById(id);
		s('svcShowingStart') && (s('svcShowingStart').textContent = start);
		s('svcShowingEnd') && (s('svcShowingEnd').textContent = end);
		s('svcTotalResults') && (s('svcTotalResults').textContent = total);
		s('svcPrevPage') && (s('svcPrevPage').disabled = this.currentPage<=1);
		s('svcNextPage') && (s('svcNextPage').disabled = this.currentPage>=max);
	}

	updatePaginationFromServer(p){
		if (!p) return this.updatePagination();
		const s = (id)=> document.getElementById(id);
		const start = p.total===0?0: (p.page-1)*p.limit + 1;
		const end = Math.min(p.page*p.limit, p.total);
		s('svcShowingStart') && (s('svcShowingStart').textContent = start);
		s('svcShowingEnd') && (s('svcShowingEnd').textContent = end);
		s('svcTotalResults') && (s('svcTotalResults').textContent = p.total);
		s('svcPrevPage') && (s('svcPrevPage').disabled = p.page<=1);
		s('svcNextPage') && (s('svcNextPage').disabled = p.page>=p.pages);
	}

	async updateStats(){
		const set = (id,val)=>{ const el=document.getElementById(id); if (el) el.textContent = String(val); };
		try{
			const res = await fetch('/api/admin/services/stats', { headers: this.buildAuthHeaders() });
			if (res.ok){
				const { total, withImages, avgDescLen, monthly, growth } = await res.json();
				set('totalServices', total);
				set('monthlyServices', monthly);
				set('withImages', withImages);
				set('avgDescLen', avgDescLen);
				const growthEl = document.getElementById('servicesGrowth');
				if (growthEl){
					growthEl.innerHTML = `<i class="fas fa-arrow-${growth>=0?'up':'down'} mr-1"></i>${Math.abs(growth)}%`;
					growthEl.className = `text-sm ${growth>=0?'text-green-600 dark:text-green-400':'text-red-600 dark:text-red-400'}`;
				}
				return;
			}
		}catch(e){
			console.warn('Stats API failed, falling back to client calc');
		}
		// Fallback: compute from currently loaded services
		const total = this.services.length;
		const withImages = this.services.filter(s=> !!s.image_url).length;
		const now = new Date();
		const m = now.getMonth();
		const y = now.getFullYear();
		const monthly = this.services.filter(s=>{ const d=new Date(s.created_at||Date.now()); return d.getMonth()===m && d.getFullYear()===y; }).length;
		const lastM = m===0?11:m-1; const lastY = m===0?y-1:y;
		const prev = this.services.filter(s=>{ const d=new Date(s.created_at||Date.now()); return d.getMonth()===lastM && d.getFullYear()===lastY; }).length;
		const growth = prev>0 ? Math.round(((monthly - prev)/prev)*100) : 0;
		const avgDescLen = total>0 ? Math.round(this.services.reduce((a,s)=> a + ((s.description||'').length),0)/total) : 0;
		set('totalServices', total);
		set('monthlyServices', monthly);
		set('withImages', withImages);
		set('avgDescLen', avgDescLen);
		const growthEl = document.getElementById('servicesGrowth');
		if (growthEl){
			growthEl.innerHTML = `<i class="fas fa-arrow-${growth>=0?'up':'down'} mr-1"></i>${Math.abs(growth)}%`;
			growthEl.className = `text-sm ${growth>=0?'text-green-600 dark:text-green-400':'text-red-600 dark:text-red-400'}`;
		}
	}

	openServiceModal(service=null){
		const title = document.getElementById('serviceModalTitle');
		const form = document.getElementById('serviceForm');
		if (service){
			title.textContent = 'Edit Service';
			this.fillForm(service);
		}else{
			title.textContent = 'Add Service';
			form.reset();
			document.getElementById('serviceId').value = '';
			this.resetPreview();
		}
		document.getElementById('serviceModal').classList.remove('hidden');
		document.body.style.overflow = 'hidden';
	}
	closeServiceModal(){ document.getElementById('serviceModal').classList.add('hidden'); document.body.style.overflow='auto'; }

	fillForm(s){
		document.getElementById('serviceId').value = s.id;
		document.getElementById('serviceName').value = s.name;
		document.getElementById('serviceDescription').value = s.description;
		const url = s.image_url || '';
		document.getElementById('serviceImageUrl').value = url;
		if (url){
			const img = document.getElementById('serviceImagePreview');
			const empty = document.getElementById('serviceImageEmpty');
			const wrap = document.getElementById('serviceImagePreviewWrap');
			img.src = `/${url}`;
			empty.classList.add('hidden');
			wrap.classList.remove('hidden');
		}else{
			this.resetPreview();
		}
	}
	resetPreview(){
		const img = document.getElementById('serviceImagePreview');
		const empty = document.getElementById('serviceImageEmpty');
		const wrap = document.getElementById('serviceImagePreviewWrap');
		if (img) img.removeAttribute('src');
		empty.classList.remove('hidden');
		wrap.classList.add('hidden');
	}

	async saveService(){
		try{
			const fd = new FormData(document.getElementById('serviceForm'));
			const id = fd.get('id');
			const body = new FormData();
			body.append('name', fd.get('name'));
			body.append('description', fd.get('description'));
			const url = fd.get('image_url');
			if (url) body.append('image_url', url);
			const fileInput = document.getElementById('serviceImageFile');
			if (fileInput && fileInput.files && fileInput.files[0]){
				body.append('image', fileInput.files[0]);
			}
			const method = id ? 'PUT' : 'POST';
			const endpoint = id ? `/api/admin/services/${id}` : '/api/admin/services';
			const res = await fetch(endpoint, { method, headers: this.buildAuthHeaders(), body });
			if (!res.ok) throw new Error('Failed to save');
			this.closeServiceModal();
			await this.loadServices();
			alert(id ? 'Service updated' : 'Service created');
		}catch(e){
			console.error('Save service error', e);
			alert('Failed to save service');
		}
	}

	async edit(id){
		try{
			const res = await fetch(`/api/admin/services/${id}`, { headers: this.buildAuthHeaders() });
			if (!res.ok) throw new Error('Not found');
			const data = await res.json();
			this.openServiceModal(data.service);
		}catch(e){ alert('Failed to open service'); }
	}

	async remove(id){
		if (!confirm('Delete this service?')) return;
		try{
			const res = await fetch(`/api/admin/services/${id}`, { method:'DELETE', headers: this.buildAuthHeaders() });
			if (!res.ok) throw new Error('Delete failed');
			await this.loadServices();
			alert('Service deleted');
		}catch(e){ alert('Failed to delete'); }
	}

	previewImage(file){
		const reader = new FileReader();
		reader.onload = ()=>{
			const img = document.getElementById('serviceImagePreview');
			const empty = document.getElementById('serviceImageEmpty');
			const wrap = document.getElementById('serviceImagePreviewWrap');
			img.src = reader.result;
			empty.classList.add('hidden');
			wrap.classList.remove('hidden');
		};
		reader.readAsDataURL(file);
	}

	async uploadImage(file){
		try{
			const fd = new FormData();
			fd.append('image', file);
			const res = await fetch('/api/admin/services/upload-image', { method:'POST', headers: this.buildAuthHeaders(), body: fd });
			if (res.ok){
				const json = await res.json();
				document.getElementById('serviceImageUrl').value = json.url || '';
			}else{
				// leave preview only
			}
		}catch(_){ /* ignore */ }
	}

	escape(s){
		if (!s) return '';
		const d = document.createElement('div');
		d.textContent = s;
		return d.innerHTML;
	}
}

let adminServices;
document.addEventListener('DOMContentLoaded', ()=>{ adminServices = new AdminServicesManager(); });
