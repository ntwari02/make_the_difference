(function(){
	async function fetchSettings(){
		try{
			const res = await fetch('/api/settings', { headers: { 'Accept': 'application/json' }});
			if(!res.ok) return null;
			return await res.json();
		}catch(e){ return null; }
	}
	function currentPageKeys(){
		let p = window.location.pathname.toLowerCase(); // e.g., /contact.html or /contact
		if (p === '/' || p === '') p = '/home.html';
		const last = p.split('/').pop();
		const base = last.replace(/\.html$/i, '');
		return [p, last, base, `/${base}`, `${base}.html`, `/${base}.html`].map(s=>s.toLowerCase());
	}
	function shouldBlock(settings){
		if(!settings) return false;
		const mode = (settings.maintenance_mode === 'on' || settings.maintenance_mode === 1 || settings.maintenance_mode === true);
		if(!mode) return false;
		let pages = [];
		if(Array.isArray(settings.maintenance_pages)) pages = settings.maintenance_pages;
		else if (typeof settings.maintenance_pages === 'string'){
			try{ pages = JSON.parse(settings.maintenance_pages) || []; }catch{}
		}
		const normalized = pages.map(x=>String(x||'').toLowerCase());
		const keys = currentPageKeys();
		return keys.some(k=> normalized.includes(k) || normalized.includes(k.replace(/^\//,'')) || normalized.includes(k.replace(/\.html$/,'')) );
	}
	async function run(){
		// Don't guard admin or API pages
		const path = window.location.pathname;
		if(path.startsWith('/admin') || path.startsWith('/api')) return;
		const settings = await fetchSettings();
		if(shouldBlock(settings)){
			if (!/maintenance\.html$/i.test(window.location.pathname)) {
				window.location.replace('/maintenance.html');
			}
		}
	}
	document.addEventListener('DOMContentLoaded', run);
})();
