// admin-partners.js - Partners Management JavaScript

class PartnersManager {
    constructor() {
        this.partners = [];
        this.filteredPartners = [];
        this.currentPage = 1;
        this.partnersPerPage = 10;
        this.currentFilters = {
            search: '',
            status: '',
            organization: ''
        };
        
        this.init();
    }

    async init() {
        await this.loadPartners();
        this.setupEventListeners();
        this.updateStats();
        this.renderPartners();
    }

    setupEventListeners() {
        // Search and filters
        document.getElementById('searchPartners').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.filterPartners();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.filterPartners();
        });

        document.getElementById('organizationFilter').addEventListener('change', (e) => {
            this.currentFilters.organization = e.target.value;
            this.filterPartners();
        });

        // Buttons
        document.getElementById('addPartnerBtn').addEventListener('click', () => {
            this.openPartnerModal();
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadPartners();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportPartners();
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderPartners();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const maxPage = Math.ceil(this.filteredPartners.length / this.partnersPerPage);
            if (this.currentPage < maxPage) {
                this.currentPage++;
                this.renderPartners();
            }
        });

        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closePartnerModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closePartnerModal();
        });

        document.getElementById('partnerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePartner();
        });

        // Drag & drop logo upload
        const drop = document.getElementById('partnerLogoDrop');
        const fileInput = document.getElementById('partnerLogoFile');
        const removeBtn = document.getElementById('partnerLogoRemove');
        if (drop && fileInput) {
            const onFiles = (files) => {
                const file = files && files[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) return alert('Please upload an image file.');
                if (file.size > 5 * 1024 * 1024) return alert('Max file size is 5MB.');
                this.previewLogo(file);
                this.uploadLogo(file);
            };
            drop.addEventListener('click', () => fileInput.click());
            drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('border-blue-400'); });
            drop.addEventListener('dragleave', () => drop.classList.remove('border-blue-400'));
            drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('border-blue-400'); onFiles(e.dataTransfer.files); });
            fileInput.addEventListener('change', (e) => onFiles(e.target.files));
            // Optional remove button no longer present to match services
        }

        // Delete modal events
        document.getElementById('cancelDelete').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.deletePartner();
        });

        // Close modals on outside click
        document.getElementById('partnerModal').addEventListener('click', (e) => {
            if (e.target.id === 'partnerModal') {
                this.closePartnerModal();
            }
        });

        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') {
                this.closeDeleteModal();
            }
        });
    }

    async loadPartners() {
        try {
            this.showLoading(true);
            
            const response = await fetch('/api/admin/partners', {
                headers: this.buildAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to load partners');
            }
            
            const data = await response.json();
            this.partners = data.partners || [];
            
            // Add status field if not present (for backward compatibility)
            this.partners.forEach(partner => {
                if (!partner.status) {
                    partner.status = 'new';
                }
            });
            
            this.filteredPartners = [...this.partners];
            this.updateOrganizationFilter();
            this.updateStats();
            this.renderPartners();
            
        } catch (error) {
            console.error('Error loading partners:', error);
            this.showError('Failed to load partners. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    filterPartners() {
        this.filteredPartners = this.partners.filter(partner => {
            const matchesSearch = !this.currentFilters.search || 
                partner.name.toLowerCase().includes(this.currentFilters.search.toLowerCase()) ||
                partner.organization?.toLowerCase().includes(this.currentFilters.search.toLowerCase()) ||
                partner.email.toLowerCase().includes(this.currentFilters.search.toLowerCase());
            
            const matchesStatus = !this.currentFilters.status || partner.status === this.currentFilters.status;
            const matchesOrganization = !this.currentFilters.organization || partner.organization === this.currentFilters.organization;
            
            return matchesSearch && matchesStatus && matchesOrganization;
        });
        
        this.currentPage = 1;
        this.renderPartners();
    }

    updateOrganizationFilter() {
        const organizations = [...new Set(this.partners.map(p => p.organization).filter(Boolean))];
        const select = document.getElementById('organizationFilter');
        
        // Keep the first option (All Organizations)
        select.innerHTML = '<option value="">All Organizations</option>';
        
        organizations.forEach(org => {
            const option = document.createElement('option');
            option.value = org;
            option.textContent = org;
            select.appendChild(option);
        });
    }

    updateStats() {
        const totalPartners = this.partners.length;
        const newRequests = this.partners.filter(p => p.status === 'new').length;
        const approvedPartners = this.partners.filter(p => p.status === 'approved').length;
        
        // Calculate monthly partners
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const monthlyPartners = this.partners.filter(p => {
            const partnerDate = new Date(p.created_at);
            return partnerDate.getMonth() === thisMonth && partnerDate.getFullYear() === thisYear;
        }).length;
        
        // Calculate growth (comparing to last month)
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        const lastMonthPartners = this.partners.filter(p => {
            const partnerDate = new Date(p.created_at);
            return partnerDate.getMonth() === lastMonth && partnerDate.getFullYear() === lastYear;
        }).length;
        
        const growth = lastMonthPartners > 0 ? 
            Math.round(((monthlyPartners - lastMonthPartners) / lastMonthPartners) * 100) : 0;
        
        document.getElementById('totalPartners').textContent = totalPartners;
        document.getElementById('newRequests').textContent = newRequests;
        document.getElementById('approvedPartners').textContent = approvedPartners;
        document.getElementById('monthlyPartners').textContent = monthlyPartners;
        
        const growthElement = document.getElementById('partnersGrowth');
        growthElement.innerHTML = `<i class="fas fa-arrow-${growth >= 0 ? 'up' : 'down'} mr-1"></i>${Math.abs(growth)}%`;
        growthElement.className = `text-sm ${growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`;
    }

    renderPartners() {
        const tbody = document.getElementById('partnersTableBody');
        const startIndex = (this.currentPage - 1) * this.partnersPerPage;
        const endIndex = startIndex + this.partnersPerPage;
        const pagePartners = this.filteredPartners.slice(startIndex, endIndex);
        
        if (pagePartners.length === 0) {
            tbody.innerHTML = '';
            this.showEmptyState(true);
            this.updatePagination();
            return;
        }
        
        this.showEmptyState(false);
        
        tbody.innerHTML = pagePartners.map(partner => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <i class="fas fa-user text-blue-600 dark:text-blue-400"></i>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">${this.escapeHtml(partner.name)}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">ID: ${partner.id}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">${this.escapeHtml(partner.organization || 'N/A')}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">${this.escapeHtml(partner.email)}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">${this.escapeHtml(partner.phone || 'N/A')}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${partner.status}">${partner.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${this.formatDate(partner.created_at)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="partner-actions">
                        <button class="btn btn-view" onclick="partnersManager.viewPartner(${partner.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-edit" onclick="partnersManager.editPartner(${partner.id})" title="Edit Partner">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-delete" onclick="partnersManager.confirmDelete(${partner.id})" title="Delete Partner">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        this.updatePagination();
    }

    updatePagination() {
        const totalResults = this.filteredPartners.length;
        const maxPage = Math.ceil(totalResults / this.partnersPerPage);
        const startResult = totalResults === 0 ? 0 : (this.currentPage - 1) * this.partnersPerPage + 1;
        const endResult = Math.min(this.currentPage * this.partnersPerPage, totalResults);
        
        document.getElementById('showingStart').textContent = startResult;
        document.getElementById('showingEnd').textContent = endResult;
        document.getElementById('totalResults').textContent = totalResults;
        
        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= maxPage;
    }

    openPartnerModal(partner = null, mode = 'edit') {
        const modal = document.getElementById('partnerModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('partnerForm');
        const saveBtn = document.getElementById('savePartnerBtn');
        
        if (partner) {
            this.populateForm(partner);
        } else {
            form.reset();
            document.getElementById('partnerId').value = '';
        }

        // Toggle view/edit modes
        const isView = mode === 'view';
        this.setFormReadOnly(isView);
        saveBtn.classList.toggle('hidden', isView);
        title.textContent = isView ? 'Partner Details' : (partner ? 'Edit Partner' : 'Add New Partner');
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closePartnerModal() {
        const modal = document.getElementById('partnerModal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    populateForm(partner) {
        document.getElementById('partnerId').value = partner.id;
        document.getElementById('partnerName').value = partner.name;
        document.getElementById('partnerEmail').value = partner.email;
        document.getElementById('partnerOrganization').value = partner.organization || '';
        document.getElementById('partnerPhone').value = partner.phone || '';
        document.getElementById('partnerMessage').value = partner.message || '';
        document.getElementById('partnerStatus').value = partner.status || 'new';
        // logo
        const url = partner.logo_url || partner.logo || '';
        const hidden = document.getElementById('partnerLogoUrl');
        if (hidden) hidden.value = url || '';
        const img = document.getElementById('partnerLogoPreview');
        const empty = document.getElementById('partnerLogoEmpty');
        const wrap = document.getElementById('partnerLogoPreviewWrap');
        if (img && empty && wrap) {
            if (url) {
                img.src = url;
                empty.classList.add('hidden');
                wrap.classList.remove('hidden');
            } else {
                img.removeAttribute('src');
                empty.classList.remove('hidden');
                wrap.classList.add('hidden');
            }
        }
    }

    setFormReadOnly(isReadOnly) {
        const controls = [
            'partnerName','partnerEmail','partnerOrganization','partnerPhone','partnerMessage','partnerStatus'
        ].map(id => document.getElementById(id));
        controls.forEach(ctrl => {
            if (!ctrl) return;
            if (ctrl.tagName === 'SELECT' || ctrl.tagName === 'TEXTAREA' || ctrl.tagName === 'INPUT') {
                ctrl.disabled = isReadOnly;
            }
        });

        // Toggle drag & drop interactivity
        const drop = document.getElementById('partnerLogoDrop');
        const fileInput = document.getElementById('partnerLogoFile');
        if (drop) drop.classList.toggle('pointer-events-none', isReadOnly);
        if (drop) drop.classList.toggle('opacity-60', isReadOnly);
        if (fileInput) fileInput.disabled = isReadOnly;
    }

    async savePartner() {
        try {
            const formData = new FormData(document.getElementById('partnerForm'));
            const partnerData = {
                name: formData.get('name'),
                email: formData.get('email'),
                organization: formData.get('organization'),
                phone: formData.get('phone'),
                message: formData.get('message'),
                status: formData.get('status'),
                logo_url: formData.get('logo_url') || null
            };
            
            const partnerId = formData.get('id');
            const url = partnerId ? `/api/admin/partners/${partnerId}` : '/api/admin/partners';
            const method = partnerId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...this.buildAuthHeaders()
                },
                body: JSON.stringify(partnerData)
            });
            
            if (!response.ok) {
                let msg = 'Failed to save partner';
                try {
                    const err = await response.json();
                    if (response.status === 409) {
                        msg = err.message || 'Email is already taken by another partner';
                        // Focus email field for quick correction
                        const emailInput = document.getElementById('partnerEmail');
                        if (emailInput) emailInput.focus();
                    } else if (err && err.message) {
                        msg = err.message;
                    }
                } catch {}
                this.showError(msg);
                return;
            }
            
            this.closePartnerModal();
            await this.loadPartners();
            this.showSuccess(partnerId ? 'Partner updated successfully!' : 'Partner added successfully!');
            
        } catch (error) {
            console.error('Error saving partner:', error);
            this.showError('Failed to save partner. Please try again.');
        }
    }

    previewLogo(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const img = document.getElementById('partnerLogoPreview');
            const empty = document.getElementById('partnerLogoEmpty');
            const wrap = document.getElementById('partnerLogoPreviewWrap');
            if (img && empty && wrap) {
                img.src = reader.result;
                empty.classList.add('hidden');
                wrap.classList.remove('hidden');
            }
        };
        reader.readAsDataURL(file);
    }

    async uploadLogo(file) {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const fd = new FormData();
            fd.append('image', file);
            let uploadedUrl = '';
            const res = await fetch('/api/admin/partners/upload-image', { method: 'POST', headers, body: fd });
            if (res.ok) {
                const json = await res.json();
                uploadedUrl = json.url || json.path || '';
            } else {
                // Keep preview only; don't send data URLs to backend
                uploadedUrl = '';
            }
            const hidden = document.getElementById('partnerLogoUrl');
            if (hidden) hidden.value = uploadedUrl;
        } catch (e) {
            console.warn('Logo upload failed, keeping inline preview only');
        }
    }

    viewPartner(partnerId) {
        const partner = this.partners.find(p => p.id === partnerId);
        if (!partner) return;
        this.openPartnerModal(partner, 'view');
    }

    editPartner(partnerId) {
        const partner = this.partners.find(p => p.id === partnerId);
        if (!partner) return;
        this.openPartnerModal(partner, 'edit');
    }

    confirmDelete(partnerId) {
        const partner = this.partners.find(p => p.id === partnerId);
        if (!partner) return;
        
        // Store the partner ID for deletion
        this.partnerToDelete = partnerId;
        
        const modal = document.getElementById('deleteModal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.partnerToDelete = null;
    }

    async deletePartner() {
        if (!this.partnerToDelete) return;
        
        try {
            const response = await fetch(`/api/admin/partners/${this.partnerToDelete}`, {
                method: 'DELETE',
                headers: this.buildAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete partner');
            }
            
            this.closeDeleteModal();
            await this.loadPartners();
            this.showSuccess('Partner deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting partner:', error);
            this.showError('Failed to delete partner. Please try again.');
        }
    }

    async exportPartners() {
        try {
            const response = await fetch('/api/admin/partners/export', {
                headers: this.buildAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to export partners');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `partners-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Error exporting partners:', error);
            this.showError('Failed to export partners. Please try again.');
        }
    }

    buildAuthHeaders() {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const tableBody = document.getElementById('partnersTableBody');
        
        if (show) {
            loadingState.classList.remove('hidden');
            tableBody.innerHTML = '';
        } else {
            loadingState.classList.add('hidden');
        }
    }

    showEmptyState(show) {
        const emptyState = document.getElementById('emptyState');
        if (show) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }

    showSuccess(message) {
        // You can implement a toast notification system here
        alert(message); // Simple alert for now
    }

    showError(message) {
        // You can implement a toast notification system here
        alert('Error: ' + message); // Simple alert for now
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize the partners manager when the page loads
let partnersManager;
document.addEventListener('DOMContentLoaded', () => {
    partnersManager = new PartnersManager();
});
