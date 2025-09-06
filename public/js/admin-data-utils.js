/**
 * Admin Data Utilities
 * Helper functions for triggering data refresh events
 */

/**
 * Trigger a data change event
 * @param {string} component - Component that changed (user, application, scholarship, etc.)
 * @param {string} action - Action performed (create, update, delete)
 * @param {Object} data - Additional data about the change
 */
function triggerDataChange(component, action, data = {}) {
    const event = new CustomEvent('adminDataChanged', {
        detail: {
            component,
            action,
            data,
            timestamp: Date.now()
        }
    });
    
    console.log(`📢 Triggering data change event: ${component} - ${action}`, data);
    window.dispatchEvent(event);
}

/**
 * Trigger refresh for specific components
 * @param {string|Array} components - Components to refresh
 * @param {Object} options - Refresh options
 */
function refreshData(components, options = {}) {
    if (window.adminDataRefresh) {
        window.adminDataRefresh.refresh(components, options);
    } else {
        console.warn('⚠️ Admin data refresh system not initialized');
    }
}

/**
 * Refresh all data across all tabs
 * @param {string|Array} components - Components to refresh
 */
function refreshAllTabs(components = 'all') {
    if (window.adminDataRefresh) {
        window.adminDataRefresh.triggerCrossTabRefresh(components);
    } else {
        console.warn('⚠️ Admin data refresh system not initialized');
    }
}

/**
 * Mark a form as an admin form for automatic refresh
 * @param {HTMLFormElement} form - Form element
 */
function markAdminForm(form) {
    if (form) {
        form.dataset.adminForm = 'true';
    }
}

/**
 * Mark an element as an admin delete button
 * @param {HTMLElement} element - Element to mark
 */
function markAdminDelete(element) {
    if (element) {
        element.dataset.adminDelete = 'true';
    }
}

/**
 * Enhanced fetch function that automatically triggers refresh after operations
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} refreshOptions - Refresh options
 * @returns {Promise} Fetch promise
 */
async function adminFetch(url, options = {}, refreshOptions = {}) {
    const method = options.method || 'GET';
    const isDataChangingOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
    
    try {
        const response = await fetch(url, options);
        
        if (response.ok && isDataChangingOperation) {
            // Determine component from URL
            const component = getComponentFromUrl(url);
            const action = getActionFromMethod(method);
            
            // Trigger refresh
            setTimeout(() => {
                triggerDataChange(component, action, { url, method });
            }, 100);
        }
        
        return response;
    } catch (error) {
        console.error('❌ Admin fetch failed:', error);
        throw error;
    }
}

/**
 * Get component name from URL
 * @param {string} url - URL to analyze
 * @returns {string} Component name
 */
function getComponentFromUrl(url) {
    const urlPath = new URL(url, window.location.origin).pathname;
    
    if (urlPath.includes('/users')) return 'user';
    if (urlPath.includes('/applications')) return 'application';
    if (urlPath.includes('/scholarships')) return 'scholarship';
    if (urlPath.includes('/services')) return 'service';
    if (urlPath.includes('/partners')) return 'partner';
    if (urlPath.includes('/notifications')) return 'notification';
    if (urlPath.includes('/reports')) return 'report';
    if (urlPath.includes('/dashboard')) return 'dashboard';
    
    return 'general';
}

/**
 * Get action from HTTP method
 * @param {string} method - HTTP method
 * @returns {string} Action name
 */
function getActionFromMethod(method) {
    const methodMap = {
        'POST': 'create',
        'PUT': 'update',
        'PATCH': 'update',
        'DELETE': 'delete'
    };
    
    return methodMap[method.toUpperCase()] || 'update';
}

/**
 * Enhanced form submission handler
 * @param {HTMLFormElement} form - Form element
 * @param {Function} submitHandler - Custom submit handler
 * @param {Object} options - Options
 */
function handleAdminFormSubmit(form, submitHandler, options = {}) {
    if (!form) return;
    
    markAdminForm(form);
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        try {
            const result = await submitHandler(event);
            
            // Trigger refresh after successful submission
            if (result !== false) {
                const component = options.component || getComponentFromUrl(form.action);
                const action = options.action || 'create';
                
                setTimeout(() => {
                    triggerDataChange(component, action, { form: form.id || form.className });
                }, 500);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Form submission failed:', error);
            throw error;
        }
    });
}

/**
 * Enhanced delete button handler
 * @param {HTMLElement} button - Delete button
 * @param {Function} deleteHandler - Custom delete handler
 * @param {Object} options - Options
 */
function handleAdminDelete(button, deleteHandler, options = {}) {
    if (!button) return;
    
    markAdminDelete(button);
    
    button.addEventListener('click', async (event) => {
        event.preventDefault();
        
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                const result = await deleteHandler(event);
                
                // Trigger refresh after successful deletion
                if (result !== false) {
                    const component = options.component || 'general';
                    const action = 'delete';
                    
                    setTimeout(() => {
                        triggerDataChange(component, action, { 
                            button: button.id || button.className,
                            itemId: button.dataset.itemId 
                        });
                    }, 500);
                }
                
                return result;
            } catch (error) {
                console.error('❌ Delete operation failed:', error);
                throw error;
            }
        }
    });
}

// Export functions for global use
window.triggerDataChange = triggerDataChange;
window.refreshData = refreshData;
window.refreshAllTabs = refreshAllTabs;
window.markAdminForm = markAdminForm;
window.markAdminDelete = markAdminDelete;
window.adminFetch = adminFetch;
window.handleAdminFormSubmit = handleAdminFormSubmit;
window.handleAdminDelete = handleAdminDelete;
