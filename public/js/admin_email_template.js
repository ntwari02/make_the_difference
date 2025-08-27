// Admin Email Template Management JS
let editor;
let currentTemplateId = null;
let templates = {};
let users = [];
let selectedUsers = new Set();

// Development mode - bypass authentication
function checkAuth() {
    // Always return true for development
    return true;
}

function showLoadingState() {
    document.getElementById('loadingState').classList.remove('hidden');
}

function hideLoadingState() {
    document.getElementById('loadingState').classList.add('hidden');
}

function showErrorState(message) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    if (message) {
        const errorText = document.querySelector('#errorState p');
        if (errorText) {
            errorText.textContent = message;
        }
    }
}

function hideErrorState() {
    document.getElementById('errorState').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', function() {
    // Show loading state initially
    showLoadingState();
    
    // Check authentication first
    if (!checkAuth()) {
        return;
    }
    
    // Initialize CKEditor
    ClassicEditor.create(document.querySelector('#editor'), {
        toolbar: {
            items: [
                'heading', '|',
                'bold', 'italic', 'fontColor', '|',
                'numberedList', 'bulletedList', '|',
                'link', 'blockQuote', 'insertTable', '|',
                'undo', 'redo'
            ]
        },
        fontColor: {
            colors: [
                { color: '#000000', label: 'Black' },
                { color: '#ffffff', label: 'White' },
                { color: '#1f2937', label: 'Slate' },
                { color: '#3b82f6', label: 'Blue' },
                { color: '#10b981', label: 'Green' },
                { color: '#f59e0b', label: 'Amber' },
                { color: '#ef4444', label: 'Red' },
                { color: '#8b5cf6', label: 'Purple' },
                { color: '#ec4899', label: 'Pink' },
                { color: '#06b6d4', label: 'Cyan' }
            ],
            columns: 5,
            documentColors: 0
        },
        language: 'en',
        licenseKey: '',
    }).then(newEditor => {
        editor = newEditor;
        loadTemplates();
        loadUsers();
    }).catch(error => {
        hideLoadingState();
        showMessage('CKEditor initialization error', 'error');
        console.error(error);
    });

    // Button event listeners
    document.getElementById('refreshTemplatesBtn').addEventListener('click', loadTemplates);
    document.getElementById('newTemplateBtn').addEventListener('click', createNewTemplate);
    document.getElementById('saveBtn').addEventListener('click', saveTemplate);
    document.getElementById('previewBtn').addEventListener('click', updatePreview);
    document.getElementById('sendTestEmail').addEventListener('click', openTestEmailModal);
    document.getElementById('sendBulkEmail').addEventListener('click', sendBulkEmail);
    document.getElementById('cancelTestEmail').addEventListener('click', function() {
        document.getElementById('testEmailModal').classList.add('hidden');
        document.getElementById('testEmailSuccess').classList.add('hidden');
        document.getElementById('testEmailForm').reset();
    });
    document.getElementById('testEmailForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('testEmail').value;
        sendTestEmail(email);
    });
    document.getElementById('closeSendModal').addEventListener('click', function() {
        document.getElementById('sendEmailModal').classList.add('hidden');
        selectedUsers.clear();
        updateSelectedCount();
    });
    document.getElementById('selectAllUsers').addEventListener('click', selectAllUsers);
    // Role-based selectors removed since users table no longer has role
    const selectApplicantsBtn = document.getElementById('selectApplicants');
    const selectAdminsBtn = document.getElementById('selectAdmins');
    if (selectApplicantsBtn) selectApplicantsBtn.classList.add('hidden');
    if (selectAdminsBtn) selectAdminsBtn.classList.add('hidden');
    document.getElementById('clearSelection').addEventListener('click', clearSelection);
    document.getElementById('userSearch').addEventListener('input', function() {
        const searchTerm = this.value.trim();
        if (searchTerm.length > 0) {
            searchUsers(searchTerm);
        } else {
            loadUsers();
        }
    });
    // Variable insert
    document.querySelectorAll('.variable-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const variable = this.getAttribute('data-variable');
            if (editor) {
                const data = editor.getData();
                editor.setData(data + variable);
            }
        });
    });
});

// Template CRUD
async function loadTemplates() {
    try {
        console.log('Attempting to load templates...');
        const templatesData = await window.api.get('/email-templates');
        console.log('Templates loaded successfully:', templatesData);
        templates = {};
        templatesData.forEach(template => {
            templates['template-' + template.id] = template;
        });
        renderTemplateList();
        hideLoadingState();
    } catch (error) {
        hideLoadingState();
        console.error('Detailed error loading templates:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.message.includes('401') || error.message.includes('403')) {
            showErrorState('Authentication expired. Please log in again as admin.');
            return;
        }
        
        if (error.message.includes('500')) {
            showErrorState('Server error. Please check if the database is running and try again.');
            return;
        }
        
        if (error.message.includes('Failed to fetch')) {
            showErrorState('Network error. Please check if the server is running.');
            return;
        }
        
        showMessage('Error loading templates: ' + error.message, 'error');
    }
}

function renderTemplateList() {
    const list = document.getElementById('templateList');
    list.innerHTML = '';
    Object.keys(templates).forEach(templateId => {
        const t = templates[templateId];
        const div = document.createElement('div');
        div.className = 'template-item p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border border-blue-200 dark:border-blue-800 mb-2';
        div.setAttribute('data-template', templateId);
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium text-black">${t.name}</span>
                <span class="text-xs bg-blue-100 px-2 py-1 rounded text-black">${t.category || 'System'}</span>
            </div>
            <p class="text-sm text-black mt-1 truncate">${t.subject || ''}</p>
            <div class="flex gap-1 mt-2">
                <button class="send-template-btn px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"><i class="fas fa-paper-plane mr-1"></i>Send</button>
                <button class="edit-template-btn px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"><i class="fas fa-edit mr-1"></i>Edit</button>
                <button class="delete-template-btn px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"><i class="fas fa-trash mr-1"></i>Delete</button>
            </div>
        `;
        // Click to select
        div.addEventListener('click', function(e) {
            if (!e.target.classList.contains('send-template-btn') && !e.target.classList.contains('edit-template-btn') && !e.target.classList.contains('delete-template-btn')) {
                selectTemplate(templateId);
            }
        });
        // Edit
        div.querySelector('.edit-template-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            selectTemplate(templateId);
        });
        // Send
        div.querySelector('.send-template-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            openSendModal(templateId);
        });
        // Delete
        div.querySelector('.delete-template-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            deleteTemplate(templateId);
        });
        list.appendChild(div);
    });
}

function selectTemplate(templateId) {
    currentTemplateId = templateId;
    const t = templates[templateId];
    document.getElementById('templateName').value = t.name || '';
    document.getElementById('templateCategory').value = t.category || 'System';
    document.getElementById('emailSubject').value = t.subject || '';
    if (editor) editor.setData(t.content || '');
}

function createNewTemplate() {
    currentTemplateId = null;
    document.getElementById('templateName').value = '';
    document.getElementById('templateCategory').value = 'Custom';
    document.getElementById('emailSubject').value = '';
    if (editor) editor.setData('');
}

async function saveTemplate() {
    const name = document.getElementById('templateName').value;
    const category = document.getElementById('templateCategory').value;
    const subject = document.getElementById('emailSubject').value;
    const content = editor ? editor.getData() : '';
    if (!name.trim() || !subject.trim() || !content.trim()) {
        showMessage('All fields are required!', 'error');
        return;
    }
    try {
        let response;
        if (currentTemplateId) {
            const id = currentTemplateId.replace('template-', '');
            response = await window.api.put(`/email-templates/${id}`, { name, category, subject, content, is_active: true });
        } else {
            response = await window.api.post('/email-templates', { name, category, subject, content, is_active: true });
        }
        showMessage('Template saved successfully!', 'success');
        loadTemplates();
    } catch (error) {
        if (error.message.includes('401') || error.message.includes('403')) {
            showErrorState('Authentication expired. Please log in again as admin.');
            return;
        }
        showMessage('Error saving template', 'error');
        console.error(error);
    }
}

async function deleteTemplate(templateId) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
        const id = templateId.replace('template-', '');
        await window.api.delete(`/email-templates/${id}`);
        showMessage('Template deleted!', 'success');
        loadTemplates();
        createNewTemplate();
    } catch (error) {
        if (error.message.includes('401') || error.message.includes('403')) {
            showErrorState('Authentication expired. Please log in again as admin.');
            return;
        }
        showMessage('Error deleting template', 'error');
        console.error(error);
    }
}

// User selection
async function loadUsers() {
    try {
        users = await window.api.get('/users/all');
        populateUserList();
    } catch (error) {
        if (error.message.includes('401') || error.message.includes('403')) {
            showErrorState('Authentication expired. Please log in again as admin.');
            return;
        }
        showMessage('Error loading users', 'error');
        console.error(error);
    }
}

function populateUserList() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer';
        div.innerHTML = `
            <div class="flex items-center space-x-3">
                <input type="checkbox" class="user-checkbox" data-user-id="${user.id}" ${user.status === 'inactive' ? 'disabled' : ''}>
                <div>
                    <div class="font-medium text-gray-800 dark:text-white">${user.full_name}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">${user.email}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 capitalize">${user.status}</div>
                </div>
            </div>
        `;
        const checkbox = div.querySelector('.user-checkbox');
        checkbox.addEventListener('change', function() {
            if (this.checked) selectedUsers.add(user.id);
            else selectedUsers.delete(user.id);
            updateSelectedCount();
        });
        userList.appendChild(div);
    });
    updateUserList();
}

function updateUserList() {
    document.querySelectorAll('.user-checkbox').forEach(checkbox => {
        checkbox.checked = selectedUsers.has(parseInt(checkbox.getAttribute('data-user-id')));
    });
}

function updateSelectedCount() {
    document.getElementById('selectedCount').textContent = selectedUsers.size;
}

async function selectAllUsers() {
    try {
        const activeUsers = await window.api.get('/users/all?status=active');
        selectedUsers.clear();
        activeUsers.forEach(user => selectedUsers.add(user.id));
        updateSelectedCount();
        updateUserList();
    } catch (error) {
        if (error.message.includes('401') || error.message.includes('403')) {
            showErrorState('Authentication expired. Please log in again as admin.');
            return;
        }
        showMessage('Error selecting all users', 'error');
        console.error(error);
    }
}

// selectUsersByRole removed; roles are not used on users table anymore

function clearSelection() {
    selectedUsers.clear();
    updateSelectedCount();
    updateUserList();
}

async function searchUsers(searchTerm) {
    try {
        users = await window.api.get(`/users/all?search=${encodeURIComponent(searchTerm)}`);
        populateUserList();
    } catch (error) {
        if (error.message.includes('401') || error.message.includes('403')) {
            showErrorState('Authentication expired. Please log in again as admin.');
            return;
        }
        showMessage('Error searching users', 'error');
        console.error(error);
    }
}

// Email sending
function openSendModal(templateId) {
    selectTemplate(templateId);
    document.getElementById('previewSubject').textContent = document.getElementById('emailSubject').value;
    document.getElementById('previewContent').innerHTML = editor ? editor.getData() : '';
    document.getElementById('sendEmailModal').classList.remove('hidden');
    selectedUsers.clear();
    updateSelectedCount();
    updateUserList();
}

function openTestEmailModal() {
    document.getElementById('testEmailModal').classList.remove('hidden');
}

async function sendTestEmail(email) {
    try {
        await window.api.post('/email-templates/test-send', {
            recipient_email: email,
            template_id: currentTemplateId ? currentTemplateId.replace('template-', '') : null,
            custom_content: editor ? editor.getData() : '',
            custom_subject: document.getElementById('emailSubject').value
        });
        document.getElementById('testEmailSuccess').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('testEmailModal').classList.add('hidden');
            document.getElementById('testEmailSuccess').classList.add('hidden');
            document.getElementById('testEmailForm').reset();
        }, 2000);
        showMessage('Test email sent successfully!', 'success');
    } catch (error) {
        if (error.message.includes('401') || error.message.includes('403')) {
            showErrorState('Authentication expired. Please log in again as admin.');
            return;
        }
        showMessage('Error sending test email', 'error');
        console.error(error);
    }
}

async function sendBulkEmail() {
    if (selectedUsers.size === 0) {
        showMessage('Please select at least one user to send emails to.', 'error');
        return;
    }
    try {
        await window.api.post('/email-templates/send-bulk', {
            template_id: currentTemplateId ? currentTemplateId.replace('template-', '') : null,
            user_ids: Array.from(selectedUsers),
            custom_subject: document.getElementById('emailSubject').value,
            custom_content: editor ? editor.getData() : ''
        });
        showMessage('Successfully sent emails to selected users!', 'success');
        document.getElementById('sendEmailModal').classList.add('hidden');
        selectedUsers.clear();
        updateSelectedCount();
    } catch (error) {
        if (error.message.includes('401') || error.message.includes('403')) {
            showErrorState('Authentication expired. Please log in again as admin.');
            return;
        }
        showMessage('Error sending emails', 'error');
        console.error(error);
    }
}

// Preview
function updatePreview() {
    document.getElementById('previewSubject').textContent = document.getElementById('emailSubject').value;
    document.getElementById('previewContent').innerHTML = editor ? editor.getData() : '';
}

// Message display
function showMessage(message, type) {
    const container = document.getElementById('messageContainer');
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    if (type === 'success') {
        document.getElementById('successText').textContent = message;
        successMsg.classList.remove('hidden');
        errorMsg.classList.add('hidden');
    } else {
        document.getElementById('errorText').textContent = message;
        errorMsg.classList.remove('hidden');
        successMsg.classList.add('hidden');
    }
    container.classList.remove('hidden');
    setTimeout(() => {
        container.classList.add('hidden');
    }, 3000);
}