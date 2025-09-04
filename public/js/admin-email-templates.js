class AdminEmailTemplates {
	constructor(){
		this.items = [];
		this.filtered = [];
		this.page = 1;
		this.perPage = 10;
		this.bind();
		this.load();
	}

	headers(){ const t=localStorage.getItem('token'); return t? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }; }

	bind(){
		document.getElementById('addTemplateBtn').addEventListener('click', ()=> this.openModal());
		document.getElementById('tmplClose').addEventListener('click', ()=> this.closeModal());
		document.getElementById('tmplCancel').addEventListener('click', ()=> this.closeModal());
		document.getElementById('tmplForm').addEventListener('submit', (e)=>{ e.preventDefault(); this.save(); });
		document.getElementById('tmplRefreshBtn').addEventListener('click', ()=> this.load());
		const s = document.getElementById('tmplSearch'); s.addEventListener('input', ()=>{ this.applyFilters(); });
		const c = document.getElementById('tmplCategory'); c.addEventListener('change', ()=>{ this.applyFilters(); });
		document.getElementById('tmplPrev').addEventListener('click', ()=>{ if (this.page>1){ this.page--; this.render(); this.updatePager(); }});
		document.getElementById('tmplNext').addEventListener('click', ()=>{ const m=Math.ceil(this.filtered.length/this.perPage); if (this.page<m){ this.page++; this.render(); this.updatePager(); }});
		// Test send
		document.getElementById('testClose').addEventListener('click', ()=> this.closeTest());
		document.getElementById('testCancel').addEventListener('click', ()=> this.closeTest());
		document.getElementById('testForm').addEventListener('submit', (e)=>{ e.preventDefault(); this.sendTest(); });
		const sendAll = document.getElementById('sendAllUsers'); if (sendAll) sendAll.addEventListener('change', (e)=> this.toggleRecipients(e.target.checked));
		const searchBtn = document.getElementById('userSearchBtn'); if (searchBtn) searchBtn.addEventListener('click', ()=> this.searchUsers());
	}

	async load(){
		try{
			document.getElementById('tmplLoading').classList.remove('hidden');
			const res = await fetch('/api/email-templates', { headers: this.headers() });
			if (!res.ok) throw new Error('Failed to load templates');
			this.items = await res.json();
			this.populateCategories();
			this.applyFilters();
		} catch(e){
			alert('Failed to load templates');
		} finally {
			document.getElementById('tmplLoading').classList.add('hidden');
		}
	}

	populateCategories(){
		try{
			const sel = document.getElementById('tmplCategory');
			const current = sel.value;
			const cats = Array.from(new Set(this.items.map(t=> String(t.category||'custom')))).filter(Boolean).sort();
			sel.innerHTML = '<option value="">All Categories</option>' + cats.map(c=> `<option value="${this.escape(c)}">${this.escape(c)}</option>`).join('');
			if (cats.includes(current)) sel.value = current; else sel.value='';
		}catch(_){/* ignore */}
	}

	applyFilters(){
		const q = (document.getElementById('tmplSearch').value||'').toLowerCase();
		const cat = document.getElementById('tmplCategory').value;
		this.filtered = this.items.filter(t=>{
			const matchesQ = !q || (t.name||'').toLowerCase().includes(q) || (t.subject||'').toLowerCase().includes(q);
			const matchesC = !cat || (t.category||'')===cat;
			return matchesQ && matchesC;
		});
		this.page = 1;
		this.render();
		this.updatePager();
	}

	render(){
		const tbody = document.getElementById('tmplTableBody');
		if (!this.filtered.length){
			tbody.innerHTML = '';
			document.getElementById('tmplEmpty').classList.remove('hidden');
			return;
		}
		document.getElementById('tmplEmpty').classList.add('hidden');
		const start = (this.page-1)*this.perPage;
		const rows = this.filtered.slice(start, start+this.perPage);
		tbody.innerHTML = rows.map(t=>`
			<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
				<td class="px-6 py-4"><div class="font-medium">${this.escape(t.name)}</div><div class="text-xs text-gray-500">ID: ${t.id}</div></td>
				<td class="px-6 py-4">${this.escape(t.subject||'')}</td>
				<td class="px-6 py-4">${this.escape(t.category||'custom')}</td>
				<td class="px-6 py-4">${t.is_active?'<span class="text-green-600">Yes</span>':'<span class="text-gray-400">No</span>'}</td>
				<td class="px-6 py-4">
					<div class="flex gap-2">
						<button class="px-2 py-1 rounded bg-gray-700 text-white" onclick="adminEmailTpl.edit(${t.id})"><i class="fas fa-edit"></i></button>
						<button class="px-2 py-1 rounded bg-red-600 text-white" onclick="adminEmailTpl.remove(${t.id})"><i class="fas fa-trash"></i></button>
						<button class="px-2 py-1 rounded bg-blue-600 text-white" onclick="adminEmailTpl.openTest(${t.id})"><i class="fas fa-paper-plane"></i></button>
					</div>
				</td>
			</tr>
		`).join('');
	}

	updatePager(){
		const total = this.filtered.length;
		const start = total===0?0:(this.page-1)*this.perPage+1;
		const end = Math.min(this.page*this.perPage, total);
		document.getElementById('tmplShowingStart').textContent = start;
		document.getElementById('tmplShowingEnd').textContent = end;
		document.getElementById('tmplTotal').textContent = total;
		document.getElementById('tmplPrev').disabled = this.page<=1;
		document.getElementById('tmplNext').disabled = this.page>=Math.ceil(Math.max(1,total)/this.perPage);
	}

	openModal(t=null){
		const title = document.getElementById('tmplModalTitle');
		const f = document.getElementById('tmplForm');
		if (t){
			title.textContent = 'Edit Template';
			document.getElementById('tmplId').value = t.id;
			document.getElementById('tmplName').value = t.name||'';
			document.getElementById('tmplSubject').value = t.subject||'';
			document.getElementById('tmplContent').value = t.content||'';
			document.getElementById('tmplCategoryInput').value = t.category||'';
			document.getElementById('tmplActive').checked = !!t.is_active;
		}else{
			title.textContent = 'Add Template';
			f.reset();
			document.getElementById('tmplId').value = '';
			document.getElementById('tmplActive').checked = true;
		}
		document.getElementById('tmplModal').classList.remove('hidden');
		document.body.style.overflow = 'hidden';
	}
	closeModal(){ document.getElementById('tmplModal').classList.add('hidden'); document.body.style.overflow = 'auto'; }

	async save(){
		try{
			const f = new FormData(document.getElementById('tmplForm'));
			const id = f.get('id');
			const payload = {
				name: f.get('name'),
				subject: f.get('subject'),
				content: f.get('content'),
				category: f.get('category') || 'custom',
				is_active: document.getElementById('tmplActive').checked
			};
			const method = id? 'PUT':'POST';
			const url = id? `/api/email-templates/${id}`:'/api/email-templates';
			const res = await fetch(url, { method, headers: this.headers(), body: JSON.stringify(payload) });
			if (!res.ok) throw new Error('Failed to save template');
			this.closeModal();
			await this.load();
			alert(id? 'Template updated':'Template created');
		}catch(e){ alert(e.message||'Failed to save'); }
	}

	async edit(id){
		try{
			const res = await fetch(`/api/email-templates/${id}`, { headers: this.headers() });
			if (!res.ok) throw new Error('Not found');
			const t = await res.json();
			this.openModal(t);
		}catch(_){ alert('Failed to open'); }
	}

	async remove(id){
		if (!confirm('Delete this template?')) return;
		try{
			const res = await fetch(`/api/email-templates/${id}`, { method:'DELETE', headers: this.headers() });
			if (!res.ok) throw new Error('Delete failed');
			await this.load();
			alert('Template deleted');
		}catch(_){ alert('Failed to delete'); }
	}

	openTest(id){
		this.testTemplateId = id || null;
		document.getElementById('testModal').classList.remove('hidden');
		document.body.style.overflow = 'hidden';
		this.toggleRecipients(false);
		// Prefill from template
		const setVal = (id, val) => { const el=document.getElementById(id); if (el!=null) el.value = val||''; };
		if (id){
			fetch(`/api/email-templates/${id}`, { headers: this.headers() })
				.then(r => r.ok ? r.json() : null)
				.then(t => { if (!t) return; setVal('testType', t.category || t.name || 'custom'); setVal('testSubject', t.subject || ''); setVal('testContent', t.content || ''); })
				.catch(()=>{});
		} else {
			setVal('testType',''); setVal('testSubject',''); setVal('testContent','');
		}
	}
	closeTest(){ document.getElementById('testModal').classList.add('hidden'); document.body.style.overflow = 'auto'; }

	async sendTest(){
		try{
			const sendAll = document.getElementById('sendAllUsers').checked;
			const recipient = document.getElementById('testRecipient').value;
			const selectedIds = Array.from(document.querySelectorAll('#userSelected [data-id]')).map(el=> Number(el.getAttribute('data-id')));
			const type = document.getElementById('testType').value;
			const subject = document.getElementById('testSubject').value;
			const content = document.getElementById('testContent').value;
			const vars_common = {
				scholarship: document.getElementById('varScholarship')?.value || undefined,
				amount: document.getElementById('varAmount')?.value || undefined,
				deadline: document.getElementById('varDeadline')?.value || undefined,
				url: document.getElementById('varUrl')?.value || undefined,
				support_email: document.getElementById('varSupportEmail')?.value || undefined,
				location: document.getElementById('varLocation')?.value || undefined,
				custom1: document.getElementById('varCustom1')?.value || undefined,
				custom2: document.getElementById('varCustom2')?.value || undefined,
				names_list: (document.getElementById('varNames')?.value || '').split(',').map(s=> s.trim()).filter(Boolean)
			};
			if (!sendAll && (!recipient || !recipient.includes('@'))){
				alert('Please enter a valid recipient email');
				document.getElementById('testRecipient').focus();
				return;
			}
			let res;
			if (sendAll || selectedIds.length){
				const payload = this.testTemplateId ? { template_id: this.testTemplateId, user_ids: selectedIds, vars_common } : { custom_subject: subject, custom_content: content, user_ids: selectedIds, vars_common };
				res = await fetch('/api/email-templates/send-bulk', { method:'POST', headers: this.headers(), body: JSON.stringify(payload) });
			} else {
				const payload = this.testTemplateId ? { recipient_email: recipient, template_id: this.testTemplateId } : { recipient_email: recipient, template_type: type||'custom', custom_subject: subject, custom_content: content };
				res = await fetch('/api/email-templates/test-send', { method:'POST', headers: this.headers(), body: JSON.stringify(payload) });
			}
			if (!res.ok) throw new Error('Failed to send test email');
			this.closeTest();
			alert('Email request queued');
		}catch(e){ alert(e.message||'Failed to send'); }
	}

	toggleRecipients(sendAll){
		const single = document.getElementById('singleRecipientWrap');
		const selWrap = document.getElementById('userSelectWrap');
		if (sendAll){
			single.classList.add('hidden');
			selWrap.classList.remove('hidden');
			this.searchUsers();
		} else {
			single.classList.remove('hidden');
			selWrap.classList.add('hidden');
		}
	}

	async searchUsers(){
		try{
			const q = document.getElementById('userSearch').value||'';
			const params = new URLSearchParams({ search:q });
			const headers = this.headers(); delete headers['Content-Type'];
			const res = await fetch(`/api/users/all?${params.toString()}`, { headers });
			if (!res.ok) throw new Error('Failed to search users');
			const users = await res.json();
			const list = document.getElementById('userResults');
			list.innerHTML = users.map(u=>`
				<div class="p-2 flex items-center justify-between">
					<div>
						<div class="font-medium text-sm">${this.escape(u.full_name||'-')}</div>
						<div class="text-xs text-gray-500">${this.escape(u.email)}</div>
					</div>
					<button type="button" class="px-2 py-1 text-xs bg-blue-600 text-white rounded" data-pick="${u.id}" data-name="${this.escape(u.full_name||'-')}" data-email="${this.escape(u.email)}">Add</button>
				</div>
			`).join('');
			list.querySelectorAll('[data-pick]').forEach(btn=>{
				btn.addEventListener('click', ()=> this.addSelected(Number(btn.getAttribute('data-pick')), btn.getAttribute('data-name'), btn.getAttribute('data-email')));
			});
		}catch(_){ alert('Failed to search users'); }
	}

	addSelected(id, name, email){
		const wrap = document.getElementById('userSelected');
		if (Array.from(wrap.children).some(el=> Number(el.getAttribute('data-id'))===id)) return;
		const chip = document.createElement('div');
		chip.setAttribute('data-id', String(id));
		chip.className = 'flex items-center gap-2 px-2 py-1 rounded border';
		chip.innerHTML = `<span class="text-sm">${this.escape(name)} <span class=\"text-xs text-gray-500\">(${this.escape(email)})</span></span><button type=\"button\" class=\"text-red-600\" title=\"Remove\">×</button>`;
		chip.querySelector('button').addEventListener('click', ()=> chip.remove());
		wrap.appendChild(chip);
	}

	escape(s){ const d=document.createElement('div'); d.textContent = s||''; return d.innerHTML; }
}

let adminEmailTpl;
document.addEventListener('DOMContentLoaded', ()=>{ adminEmailTpl = new AdminEmailTemplates(); });
