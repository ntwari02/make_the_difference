/**
 * Admin Data Refresh System
 * Centralized system for automatically refreshing data after POST/DELETE operations
 */

class AdminDataRefresh {
    constructor() {
        this.refreshCallbacks = new Map();
        this.refreshTimeouts = new Map();
        this.isRefreshing = false;
        this.authToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
        this.init();
    }

    init() {
        console.log('🔄 Admin Data Refresh System initialized');
        this.setupGlobalEventListeners();
        this.setupStorageListener();
    }

    /**
     * Register a refresh callback for a specific page/component
     * @param {string} key - Unique identifier for the component
     * @param {Function} callback - Function to call for refresh
     * @param {Object} options - Refresh options
     */
    register(key, callback, options = {}) {
        const config = {
            callback,
            debounceMs: options.debounceMs || 1000,
            autoRefresh: options.autoRefresh !== false,
            priority: options.priority || 'normal',
            ...options
        };

        this.refreshCallbacks.set(key, config);
        console.log(`📝 Registered refresh callback for: ${key}`);
    }

    /**
     * Unregister a refresh callback
     * @param {string} key - Unique identifier for the component
     */
    unregister(key) {
        this.refreshCallbacks.delete(key);
        if (this.refreshTimeouts.has(key)) {
            clearTimeout(this.refreshTimeouts.get(key));
            this.refreshTimeouts.delete(key);
        }
        console.log(`🗑️ Unregistered refresh callback for: ${key}`);
    }

    /**
     * Trigger refresh for specific components or all components
     * @param {string|Array} keys - Component keys to refresh, or 'all' for all components
     * @param {Object} options - Refresh options
     */
    async refresh(keys = 'all', options = {}) {
        if (this.isRefreshing && !options.force) {
            console.log('⏳ Refresh already in progress, skipping...');
            return;
        }

        this.isRefreshing = true;
        const startTime = Date.now();

        try {
            const componentsToRefresh = keys === 'all' 
                ? Array.from(this.refreshCallbacks.keys())
                : Array.isArray(keys) ? keys : [keys];

            console.log(`🔄 Refreshing components: ${componentsToRefresh.join(', ')}`);

            // Group by priority
            const priorityGroups = {
                high: [],
                normal: [],
                low: []
            };

            componentsToRefresh.forEach(key => {
                const config = this.refreshCallbacks.get(key);
                if (config && config.autoRefresh) {
                    priorityGroups[config.priority].push({ key, config });
                }
            });

            // Execute refreshes by priority
            for (const priority of ['high', 'normal', 'low']) {
                const components = priorityGroups[priority];
                if (components.length === 0) continue;

                console.log(`🔄 Refreshing ${priority} priority components:`, components.map(c => c.key));

                // Execute in parallel for same priority
                await Promise.allSettled(
                    components.map(({ key, config }) => this.executeRefresh(key, config))
                );
            }

            const duration = Date.now() - startTime;
            console.log(`✅ Refresh completed in ${duration}ms`);

        } catch (error) {
            console.error('❌ Refresh failed:', error);
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Execute refresh for a specific component
     * @param {string} key - Component key
     * @param {Object} config - Component configuration
     */
    async executeRefresh(key, config) {
        try {
            // Clear existing timeout
            if (this.refreshTimeouts.has(key)) {
                clearTimeout(this.refreshTimeouts.get(key));
            }

            // Debounce the refresh
            const timeoutId = setTimeout(async () => {
                try {
                    console.log(`🔄 Executing refresh for: ${key}`);
                    await config.callback();
                    console.log(`✅ Refresh completed for: ${key}`);
                } catch (error) {
                    console.error(`❌ Refresh failed for ${key}:`, error);
                }
            }, config.debounceMs);

            this.refreshTimeouts.set(key, timeoutId);

        } catch (error) {
            console.error(`❌ Failed to execute refresh for ${key}:`, error);
        }
    }

    /**
     * Setup global event listeners for common operations
     */
    setupGlobalEventListeners() {
        // Listen for custom refresh events
        window.addEventListener('adminDataChanged', (event) => {
            const { component, action, data } = event.detail;
            console.log(`📢 Data changed event received: ${component} - ${action}`);
            this.handleDataChange(component, action, data);
        });

        // Listen for form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.dataset.adminForm === 'true') {
                console.log('📝 Admin form submitted, scheduling refresh');
                this.scheduleRefresh('form', 2000); // Refresh after 2 seconds
            }
        });

        // Listen for delete operations
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-admin-delete]');
            if (target) {
                console.log('🗑️ Admin delete operation detected, scheduling refresh');
                this.scheduleRefresh('delete', 1000); // Refresh after 1 second
            }
        });

        // Listen for modal closes (might indicate data changes)
        document.addEventListener('click', (event) => {
            if (event.target.matches('[data-modal-close]') || 
                event.target.closest('[data-modal-close]')) {
                console.log('🚪 Modal closed, scheduling refresh');
                this.scheduleRefresh('modal', 500);
            }
        });
    }

    /**
     * Setup storage listener for cross-tab communication
     */
    setupStorageListener() {
        window.addEventListener('storage', (event) => {
            if (event.key === 'adminDataRefresh') {
                const data = JSON.parse(event.newValue || '{}');
                console.log('📡 Cross-tab refresh signal received:', data);
                this.refresh(data.components || 'all');
            }
        });
    }

    /**
     * Handle data change events
     * @param {string} component - Component that changed
     * @param {string} action - Action performed
     * @param {Object} data - Additional data
     */
    handleDataChange(component, action, data) {
        // Determine which components need refresh based on the change
        const refreshMap = {
            'user': ['users', 'dashboard', 'analytics'],
            'application': ['applications', 'dashboard', 'analytics'],
            'scholarship': ['scholarships', 'dashboard', 'analytics'],
            'service': ['services', 'dashboard'],
            'partner': ['partners', 'dashboard'],
            'notification': ['notifications', 'dashboard'],
            'report': ['reports', 'dashboard', 'analytics']
        };

        const componentsToRefresh = refreshMap[component] || ['dashboard'];
        console.log(`🔄 Data change detected, refreshing: ${componentsToRefresh.join(', ')}`);
        
        this.refresh(componentsToRefresh);
    }

    /**
     * Schedule a refresh with debouncing
     * @param {string} type - Type of operation
     * @param {number} delay - Delay in milliseconds
     */
    scheduleRefresh(type, delay = 1000) {
        const key = `scheduled_${type}_${Date.now()}`;
        
        // Clear any existing scheduled refresh
        if (this.scheduledRefreshTimeout) {
            clearTimeout(this.scheduledRefreshTimeout);
        }

        this.scheduledRefreshTimeout = setTimeout(() => {
            this.refresh('all');
        }, delay);
    }

    /**
     * Trigger refresh across all tabs
     * @param {string|Array} components - Components to refresh
     */
    triggerCrossTabRefresh(components = 'all') {
        localStorage.setItem('adminDataRefresh', JSON.stringify({
            components,
            timestamp: Date.now()
        }));
    }

    /**
     * Get refresh status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isRefreshing: this.isRefreshing,
            registeredCallbacks: this.refreshCallbacks.size,
            pendingTimeouts: this.refreshTimeouts.size
        };
    }
}

// Create global instance
window.adminDataRefresh = new AdminDataRefresh();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDataRefresh;
}
