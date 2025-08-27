class AdminAdvertisementManager {
    constructor() {
        this.advertisements = [];
        this.currentAd = null;
        this.imageCropper = null;
        this.init();
    }

    async init() {
        this.loadAdvertisements();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add new advertisement button
        document.getElementById('add-ad-btn').addEventListener('click', () => {
            this.showModal();
        });

        // Form submission
        document.getElementById('ad-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAdvertisement();
        });

        // Modal close buttons
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideModal();
        });

        // Confirmation modal
        document.getElementById('confirm-cancel').addEventListener('click', () => {
            this.hideConfirmModal();
        });

        document.getElementById('confirm-action').addEventListener('click', () => {
            this.executeConfirmedAction();
        });

        // Close modal on outside click
        document.getElementById('ad-modal').addEventListener('click', (e) => {
            if (e.target.id === 'ad-modal') {
                this.hideModal();
            }
        });

        document.getElementById('confirm-modal').addEventListener('click', (e) => {
            if (e.target.id === 'confirm-modal') {
                this.hideConfirmModal();
            }
        });

        // Drag & Drop for Image
        this.initializeDropzone({
            dropzoneId: 'image-dropzone',
            fileInputId: 'image_file_input',
            urlInputId: 'image_url',
            previewId: 'image-preview',
            type: 'image'
        });
        // Drag & Drop for Video
        this.initializeDropzone({
            dropzoneId: 'video-dropzone',
            fileInputId: 'video_file_input',
            urlInputId: 'video_url',
            previewId: 'video-preview',
            type: 'video'
        });
    }

    initializeDropzone({ dropzoneId, fileInputId, urlInputId, previewId, type }) {
        const dropzone = document.getElementById(dropzoneId);
        const fileInput = document.getElementById(fileInputId);
        const urlInput = document.getElementById(urlInputId);
        const preview = document.getElementById(previewId);
        if (!dropzone || !fileInput || !urlInput || !preview) return;

        const highlight = (on) => {
            dropzone.classList.toggle('ring-2', on);
            dropzone.classList.toggle('ring-primary-500', on);
            dropzone.classList.toggle('bg-gray-50', on);
        };

        // Click to open file
        dropzone.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', () => {
            const file = fileInput.files && fileInput.files[0];
            if (!file) return;
            if (type === 'image' && !file.type.startsWith('image/')) return;
            if (type === 'video' && !file.type.startsWith('video/')) return;
            // For images: upload to server and set returned URL
            if (type === 'image') {
                const form = new FormData();
                form.append('image', file);
                fetch('/api/advertisements/upload-image', { method: 'POST', body: form })
                    .then(r => r.json())
                    .then(result => {
                        if (result && result.success && result.url) {
                            const abs = this.toAbsoluteUrl(result.url);
                            urlInput.value = abs;
                            this.updatePreview(preview, abs, 'image');
                        } else {
                            this.showNotification('Failed to upload image', 'error');
                        }
                    })
                    .catch(() => this.showNotification('Failed to upload image', 'error'));
                return;
            }
            // For videos: upload to server and use returned URL
            const vform = new FormData();
            vform.append('video', file);
            fetch('/api/advertisements/upload-video', { method: 'POST', body: vform })
                .then(r => r.json())
                .then(result => {
                    if (result && result.success && result.url) {
                        const abs = this.toAbsoluteUrl(result.url);
                        urlInput.value = abs;
                        this.updatePreview(preview, abs, 'video');
                    } else {
                        this.showNotification('Failed to upload video', 'error');
                    }
                })
                .catch(() => this.showNotification('Failed to upload video', 'error'));
        });

        // Drag and drop events
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                highlight(true);
            });
        });
        ;['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                highlight(false);
            });
        });
        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            if (!dt) return;
            // If a file is dropped
            if (dt.files && dt.files.length > 0) {
                const file = dt.files[0];
                if (type === 'image' && !file.type.startsWith('image/')) return;
                if (type === 'video' && !file.type.startsWith('video/')) return;
                if (type === 'image') {
                    const form = new FormData();
                    form.append('image', file);
                    fetch('/api/advertisements/upload-image', { method: 'POST', body: form })
                        .then(r => r.json())
                        .then(result => {
                            if (result && result.success && result.url) {
                                const abs = this.toAbsoluteUrl(result.url);
                                urlInput.value = abs;
                                this.updatePreview(preview, abs, 'image');
                            } else {
                                this.showNotification('Failed to upload image', 'error');
                            }
                        })
                        .catch(() => this.showNotification('Failed to upload image', 'error'));
                } else {
                    const vform = new FormData();
                    vform.append('video', file);
                    fetch('/api/advertisements/upload-video', { method: 'POST', body: vform })
                        .then(r => r.json())
                        .then(result => {
                            if (result && result.success && result.url) {
                                const abs = this.toAbsoluteUrl(result.url);
                                urlInput.value = abs;
                                this.updatePreview(preview, abs, 'video');
                            } else {
                                this.showNotification('Failed to upload video', 'error');
                            }
                        })
                        .catch(() => this.showNotification('Failed to upload video', 'error'));
                }
                return;
            }
            // If a URL/text is dropped
            const text = dt.getData('text/uri-list') || dt.getData('text/plain');
            if (text) {
                urlInput.value = text.trim();
                this.updatePreview(preview, text.trim(), type);
            }
        });

        // Update preview on manual URL input
        urlInput.addEventListener('input', () => {
            const value = urlInput.value.trim();
            if (!value) {
                preview.classList.add('hidden');
                if (type === 'video') preview.removeAttribute('src');
                if (type === 'image') preview.removeAttribute('src');
                return;
            }
            this.updatePreview(preview, value, type);
        });
    }

    updatePreview(previewEl, src, type) {
        if (type === 'image') {
            previewEl.src = src;
            previewEl.classList.remove('hidden');
            // Show crop UI
            const cropActions = document.getElementById('image-crop-actions');
            const startBtn = document.getElementById('start-crop-btn');
            const applyBtn = document.getElementById('apply-crop-btn');
            const cancelBtn = document.getElementById('cancel-crop-btn');
            if (cropActions && startBtn && applyBtn && cancelBtn) {
                cropActions.classList.remove('hidden');
                // Remove old listeners by cloning (prevents stacking)
                const startClone = startBtn.cloneNode(true);
                const applyClone = applyBtn.cloneNode(true);
                const cancelClone = cancelBtn.cloneNode(true);
                startBtn.parentNode.replaceChild(startClone, startBtn);
                applyBtn.parentNode.replaceChild(applyClone, applyBtn);
                cancelBtn.parentNode.replaceChild(cancelClone, cancelBtn);

                startClone.addEventListener('click', () => this.startImageCrop());
                applyClone.addEventListener('click', () => this.applyImageCrop());
                cancelClone.addEventListener('click', () => this.cancelImageCrop());
            }
        } else if (type === 'video') {
            previewEl.src = src;
            previewEl.classList.remove('hidden');
        }
    }

    startImageCrop() {
        const img = document.getElementById('image-preview');
        if (!img) return;
        // Destroy existing cropper
        if (this.imageCropper && this.imageCropper.destroy) {
            this.imageCropper.destroy();
            this.imageCropper = null;
        }
        // Initialize Cropper.js
        // eslint-disable-next-line no-undef
        this.imageCropper = new Cropper(img, {
            viewMode: 1,
            dragMode: 'move',
            autoCrop: true,
            autoCropArea: 1,
            responsive: true,
            background: false,
            movable: true,
            zoomable: true,
            scalable: true,
            rotatable: false
        });
    }

    applyImageCrop() {
        if (!this.imageCropper) return;
        const canvas = this.imageCropper.getCroppedCanvas({
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        // Upload the cropped image to server to get a short URL
        fetch('/api/advertisements/upload-image', {
            method: 'POST',
            body: this.dataUrlToFormData(dataUrl)
        }).then(res => res.json()).then(result => {
            if (result && result.success && result.url) {
                const preview = document.getElementById('image-preview');
                const urlInput = document.getElementById('image_url');
                const abs = this.toAbsoluteUrl(result.url);
                if (preview) preview.src = abs;
                if (urlInput) urlInput.value = abs;
            } else {
                this.showNotification('Failed to upload cropped image', 'error');
            }
        }).catch(() => {
            this.showNotification('Failed to upload cropped image', 'error');
        }).finally(() => {
            if (this.imageCropper) { this.imageCropper.destroy(); this.imageCropper = null; }
        });
    }

    cancelImageCrop() {
        if (!this.imageCropper) return;
        this.imageCropper.destroy();
        this.imageCropper = null;
    }

    dataUrlToFormData(dataUrl) {
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        const file = new File([u8arr], 'cropped.png', { type: mime });
        const form = new FormData();
        form.append('image', file);
        return form;
    }

    toAbsoluteUrl(url) {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/')) return `${window.location.origin}${url}`;
        return `${window.location.origin}/${url}`;
    }

    async loadAdvertisements() {
        try {
            const response = await fetch('/api/advertisements');
            const data = await response.json();
            
            if (data.success) {
                this.advertisements = data.advertisements;
                this.renderAdvertisements();
            } else {
                this.showNotification('Error loading advertisements', 'error');
            }
        } catch (error) {
            console.error('Error loading advertisements:', error);
            this.showNotification('Error loading advertisements', 'error');
        }
    }

    renderAdvertisements() {
        const container = document.getElementById('advertisements-list');
        
        if (this.advertisements.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                    <i class="fas fa-ad text-4xl mb-4"></i>
                    <p>No advertisements found</p>
                    <p class="text-sm">Click "Add New Advertisement" to create one</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.advertisements.map(ad => {
            const safeImageUrl = ad.image_url && !String(ad.image_url).startsWith('blob:') ? ad.image_url : '';
            return `
            <div class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${ad.title}</h3>
                            <span class="px-2 py-1 text-xs rounded-full ${ad.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}">
                                ${ad.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        
                        <p class="text-gray-600 dark:text-gray-400 mb-3">${ad.description || 'No description'}</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div>
                                <strong>Start:</strong> ${new Date(ad.start_date).toLocaleDateString()}
                            </div>
                            <div>
                                <strong>End:</strong> ${new Date(ad.end_date).toLocaleDateString()}
                            </div>
                            <div>
                                <strong>Created:</strong> ${new Date(ad.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        
                        ${safeImageUrl ? `
                            <div class="mt-3">
                                <img src="${safeImageUrl}" alt="${ad.title}" class="w-32 h-20 object-cover rounded" onerror="this.classList.add('hidden')">
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="flex flex-col gap-2 ml-4">
                        <button onclick="adminAdManager.editAdvertisement(${ad.id})" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminAdManager.toggleAdvertisement(${ad.id})" class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300">
                            <i class="fas fa-toggle-${ad.is_active ? 'on' : 'off'}"></i>
                        </button>
                        <button onclick="adminAdManager.deleteAdvertisement(${ad.id})" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;}).join('');
    }

    showModal(ad = null) {
        this.currentAd = ad;
        const modal = document.getElementById('ad-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('ad-form');
        
        if (ad) {
            title.textContent = 'Edit Advertisement';
            this.populateForm(ad);
        } else {
            title.textContent = 'Add New Advertisement';
            form.reset();
            document.getElementById('ad-id').value = '';
            const weightEl = document.getElementById('weight'); if (weightEl) weightEl.value = 1;
        }
        
        // Sync previews with current values
        const imageUrl = document.getElementById('image_url').value.trim();
        const videoUrl = document.getElementById('video_url').value.trim();
        const imgPrev = document.getElementById('image-preview');
        const vidPrev = document.getElementById('video-preview');
        if (imageUrl) { this.updatePreview(imgPrev, imageUrl, 'image'); } else { imgPrev.classList.add('hidden'); }
        if (videoUrl) { this.updatePreview(vidPrev, videoUrl, 'video'); } else { vidPrev.classList.add('hidden'); }

        modal.classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('ad-modal').classList.add('hidden');
        this.currentAd = null;
        // Reset previews
        const imgPrev = document.getElementById('image-preview');
        const vidPrev = document.getElementById('video-preview');
        if (imgPrev) { imgPrev.classList.add('hidden'); imgPrev.removeAttribute('src'); }
        if (vidPrev) { vidPrev.classList.add('hidden'); vidPrev.removeAttribute('src'); }
        if (this.imageCropper) { this.imageCropper.destroy(); this.imageCropper = null; }
    }

    populateForm(ad) {
        document.getElementById('ad-id').value = ad.id;
        document.getElementById('title').value = ad.title;
        document.getElementById('description').value = ad.description || '';
        document.getElementById('image_url').value = ad.image_url || '';
        document.getElementById('video_url').value = ad.video_url || '';
        document.getElementById('link_url').value = ad.link_url || '';
        document.getElementById('start_date').value = ad.start_date.slice(0, 16);
        document.getElementById('end_date').value = ad.end_date.slice(0, 16);
        document.getElementById('is_active').checked = ad.is_active;
        const weightEl = document.getElementById('weight'); if (weightEl) weightEl.value = Number(ad.weight ?? 1);
    }

    async saveAdvertisement() {
        const formData = new FormData(document.getElementById('ad-form'));
        const adData = {
            title: formData.get('title'),
            description: formData.get('description'),
            image_url: formData.get('image_url'),
            video_url: formData.get('video_url'),
            link_url: formData.get('link_url'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            is_active: formData.get('is_active') ? 1 : 0,
            weight: Number(formData.get('weight') || '1')
        };

        const adId = formData.get('id');
        const url = adId ? `/api/advertisements/${adId}` : '/api/advertisements';
        const method = adId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(adData)
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                this.showNotification(adId ? 'Advertisement updated successfully' : 'Advertisement created successfully', 'success');
                // Optimistic update to avoid full reload
                if (adId) {
                    const idx = this.advertisements.findIndex(a => String(a.id) === String(adId));
                    if (idx !== -1) {
                        this.advertisements[idx] = { ...this.advertisements[idx], ...adData, id: Number(adId) };
                    }
                } else {
                    const newAd = { id: data.id, created_at: new Date().toISOString(), ...adData };
                    this.advertisements.unshift(newAd);
                }
                this.renderAdvertisements();
                this.hideModal();
            } else {
                this.showNotification(data.message || 'Error saving advertisement', 'error');
            }
        } catch (error) {
            console.error('Error saving advertisement:', error);
            this.showNotification('Error saving advertisement', 'error');
        }
    }

    async toggleAdvertisement(id) {
        try {
            const response = await fetch(`/api/advertisements/${id}/toggle`, {
                method: 'PATCH'
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                this.showNotification('Advertisement status toggled successfully', 'success');
                const idx = this.advertisements.findIndex(a => String(a.id) === String(id));
                if (idx !== -1) {
                    this.advertisements[idx] = { ...this.advertisements[idx], is_active: this.advertisements[idx].is_active ? 0 : 1 };
                    this.renderAdvertisements();
                }
            } else {
                this.showNotification(data.message || 'Error toggling advertisement', 'error');
            }
        } catch (error) {
            console.error('Error toggling advertisement:', error);
            this.showNotification('Error toggling advertisement', 'error');
        }
    }

    deleteAdvertisement(id) {
        this.showConfirmModal(
            'Are you sure you want to delete this advertisement? This action cannot be undone.',
            () => this.executeDelete(id)
        );
    }

    async executeDelete(id) {
        try {
            const response = await fetch(`/api/advertisements/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                this.showNotification('Advertisement deleted successfully', 'success');
                this.advertisements = this.advertisements.filter(a => String(a.id) !== String(id));
                this.renderAdvertisements();
            } else {
                this.showNotification(data.message || 'Error deleting advertisement', 'error');
            }
        } catch (error) {
            console.error('Error deleting advertisement:', error);
            this.showNotification('Error deleting advertisement', 'error');
        }
    }

    editAdvertisement(id) {
        const ad = this.advertisements.find(a => a.id === id);
        if (ad) {
            this.showModal(ad);
        }
    }

    showConfirmModal(message, action) {
        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-action').onclick = action;
        document.getElementById('confirm-modal').classList.remove('hidden');
    }

    hideConfirmModal() {
        document.getElementById('confirm-modal').classList.add('hidden');
    }

    executeConfirmedAction() {
        const action = document.getElementById('confirm-action').onclick;
        if (action) {
            action();
        }
        this.hideConfirmModal();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the admin advertisement manager
let adminAdManager;
document.addEventListener('DOMContentLoaded', () => {
    adminAdManager = new AdminAdvertisementManager();
});
