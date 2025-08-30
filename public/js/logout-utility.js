/**
 * Unified Logout Utility
 * Ensures consistent logout behavior across the application
 */

class LogoutUtility {
    /**
     * Perform logout with proper cleanup and redirect
     * @param {boolean} showConfirmation - Whether to show confirmation dialog
     * @param {string} redirectUrl - URL to redirect to after logout (defaults to login.html)
     */
    static logout(showConfirmation = true, redirectUrl = 'login.html') {
        // Show confirmation if requested
        if (showConfirmation) {
            if (!confirm('Are you sure you want to log out?')) {
                return;
            }
        }

        try {
            // Clear all authentication data
            this.clearAuthData();
            
            // Clear any session data
            this.clearSessionData();
            
            // Clear any cached data
            this.clearCachedData();
            
            // Redirect to login page
            this.redirectToLogin(redirectUrl);
            
        } catch (error) {
            console.error('Error during logout:', error);
            // Fallback: just redirect
            this.redirectToLogin(redirectUrl);
        }
    }

    /**
     * Clear all authentication-related data
     */
    static clearAuthData() {
        // Remove token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        
        // Remove any other auth-related items
        const authKeys = [
            'accessToken',
            'refreshToken',
            'authUser',
            'userProfile',
            'permissions',
            'role'
        ];
        
        authKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    }

    /**
     * Clear session storage data
     */
    static clearSessionData() {
        // Clear session storage
        sessionStorage.clear();
        
        // Clear specific items that might be in localStorage but are session-like
        const sessionKeys = [
            'adShownThisSession',
            'lastAdTime',
            'currentSession',
            'tempData'
        ];
        
        sessionKeys.forEach(key => {
            localStorage.removeItem(key);
        });
    }

    /**
     * Clear cached data
     */
    static clearCachedData() {
        // Clear any cached API responses
        if (window.caches) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        
        // Clear any service worker registrations
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    registration.unregister();
                });
            });
        }
    }

    /**
     * Redirect to login page
     * @param {string} redirectUrl - URL to redirect to
     */
    static redirectToLogin(redirectUrl = 'login.html') {
        // Ensure we're going to a valid login page
        if (!redirectUrl.includes('login')) {
            redirectUrl = 'login.html';
        }
        
        // Add a small delay to ensure cleanup is complete
        setTimeout(() => {
            // Force redirect to login page
            window.location.href = redirectUrl;
            
            // Fallback: if redirect doesn't work, try replace
            setTimeout(() => {
                if (window.location.pathname !== '/' + redirectUrl) {
                    window.location.replace(redirectUrl);
                }
            }, 100);
        }, 50);
    }

    /**
     * Force logout without confirmation (for security purposes)
     */
    static forceLogout() {
        this.logout(false, 'login.html');
    }

    /**
     * Logout and redirect to specific page
     * @param {string} redirectUrl - URL to redirect to
     */
    static logoutAndRedirect(redirectUrl) {
        this.logout(true, redirectUrl);
    }

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    static isLoggedIn() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!(token && user);
    }

    /**
     * Get current user data
     * @returns {object|null}
     */
    static getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Get current auth token
     * @returns {string|null}
     */
    static getCurrentToken() {
        return localStorage.getItem('token');
    }
}

// Make it available globally
window.LogoutUtility = LogoutUtility;

// Auto-logout if token is invalid
window.addEventListener('storage', (e) => {
    if (e.key === 'token' && !e.newValue) {
        // Token was removed, redirect to login
        LogoutUtility.redirectToLogin();
    }
});

// Check for invalid token on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = LogoutUtility.getCurrentToken();
    const user = LogoutUtility.getCurrentUser();
    
    // If we have a token but no user, or vice versa, logout
    if ((token && !user) || (!token && user)) {
        console.warn('Inconsistent auth state detected, logging out');
        LogoutUtility.forceLogout();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LogoutUtility;
}
