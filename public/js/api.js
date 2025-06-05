// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Auth API
const authAPI = {
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    },

    register: async (userData) => {
        try {
            // Validate required fields before sending
            if (!userData.full_name || !userData.email || !userData.password || !userData.role) {
                throw new Error('All fields are required');
            }

            // Ensure data is properly formatted
            const formattedData = {
                full_name: userData.full_name.trim(),
                email: userData.email.trim().toLowerCase(),
                password: userData.password,
                role: userData.role
            };

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formattedData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 409) {
                    throw new Error('Email already exists');
                } else if (response.status === 400) {
                    throw new Error(data.message || 'Invalid registration data');
                } else if (response.status === 500) {
                    throw new Error('Server error. Please try again later');
                }
                throw new Error(data.message || data.error || 'Registration failed');
            }
            
            if (!data.token || !data.user) {
                throw new Error('Invalid response from server');
            }
            
            return {
                token: data.token,
                user: data.user
            };
        } catch (error) {
            console.error('Registration API error:', error);
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Unable to connect to the server. Please check your internet connection.');
            }
            throw error;
        }
    }
};

// Scholarships API
const scholarshipsAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/scholarships`);
        return response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/scholarships/${id}`);
        return response.json();
    },

    apply: async (scholarshipId, applicationData) => {
        const response = await fetch(`${API_BASE_URL}/scholarships/${scholarshipId}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(applicationData)
        });
        return response.json();
    }
};

// Partners API
const partnersAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/partners`);
        return response.json();
    },

    submitRequest: async (partnerData) => {
        const response = await fetch(`${API_BASE_URL}/partners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partnerData)
        });
        return response.json();
    },

    getTestimonials: async () => {
        const response = await fetch(`${API_BASE_URL}/partners/testimonials`);
        return response.json();
    }
};

// Services API
const servicesAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/services`);
        return response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/services/${id}`);
        return response.json();
    }
};

// Plans API
const plansAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/plans`);
        return response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/plans/${id}`);
        return response.json();
    },

    subscribe: async (planId, subscriptionData) => {
        const response = await fetch(`${API_BASE_URL}/plans/${planId}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(subscriptionData)
        });
        return response.json();
    },

    getSubscriptions: async () => {
        const response = await fetch(`${API_BASE_URL}/plans/subscriptions`, {
            headers: getAuthHeader()
        });
        return response.json();
    }
};

// Payments API
const paymentsAPI = {
    create: async (paymentData) => {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(paymentData)
        });
        return response.json();
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            headers: getAuthHeader()
        });
        return response.json();
    }
};

// Admin API
const adminAPI = {
    getDashboardStats: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
            headers: getAuthHeader()
        });
        if (!response.ok) {
            const error = new Error('Failed to fetch dashboard stats');
            error.code = response.status;
            throw error;
        }
        return response.json();
    },

    getUsers: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: getAuthHeader()
        });
        if (!response.ok) {
            const error = new Error('Failed to fetch users');
            error.code = response.status;
            throw error;
        }
        return response.json();
    },

    updateUserRole: async (userId, role) => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ role })
        });
        if (!response.ok) {
            const error = new Error('Failed to update user role');
            error.code = response.status;
            throw error;
        }
        return response.json();
    },

    updateUserStatus: async (userId, status) => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            const error = new Error('Failed to update user status');
            error.code = response.status;
            throw error;
        }
        return response.json();
    },

    getApplications: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/applications`, {
            headers: getAuthHeader()
        });
        if (!response.ok) {
            const error = new Error('Failed to fetch applications');
            error.code = response.status;
            throw error;
        }
        return response.json();
    },

    updateApplicationStatus: async (applicationId, status) => {
        const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            const error = new Error('Failed to update application status');
            error.code = response.status;
            throw error;
        }
        return response.json();
    },

    getChartStats: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/chart-stats`, {
            headers: getAuthHeader()
        });
        if (!response.ok) {
            const error = new Error('Failed to fetch chart stats');
            error.code = response.status;
            throw error;
        }
        return response.json();
    }
};

// Export all API services
window.api = {
    auth: authAPI,
    scholarships: scholarshipsAPI,
    partners: partnersAPI,
    services: servicesAPI,
    plans: plansAPI,
    payments: paymentsAPI,
    admin: adminAPI
};

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.token = localStorage.getItem('token');
    }

    // Helper method to handle API responses
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        const data = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            const errorMessage = isJson && data.message ? data.message :
                               isJson && data.error ? data.error :
                               data || 'An unexpected error occurred';
            
            switch (response.status) {
                case 401:
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login.html';
                    throw new Error('Session expired. Please login again.');
                case 403:
                    throw new Error('You do not have permission to perform this action.');
                case 404:
                    throw new Error('The requested resource was not found.');
                case 422:
                    throw new Error(errorMessage || 'Invalid data provided.');
                case 500:
                    throw new Error('Server error. Please try again later.');
                default:
                    throw new Error(errorMessage);
            }
        }

        return data;
    }

    // Helper method to prepare request headers
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        };
    }

    // Applications API endpoints
    async getApplications() {
        try {
            const response = await fetch(`${this.baseUrl}/admin/applications`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            throw this.normalizeError(error);
        }
    }

    async getApplicationDetails(id) {
        try {
            const response = await fetch(`${this.baseUrl}/admin/applications/${id}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            throw this.normalizeError(error);
        }
    }

    async deleteApplication(id) {
        try {
            const response = await fetch(`${this.baseUrl}/admin/applications/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            throw this.normalizeError(error);
        }
    }

    // Scholarships API endpoints
    async getScholarships() {
        try {
            const response = await fetch(`${this.baseUrl}/scholarships`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            throw this.normalizeError(error);
        }
    }

    // Error handling helper
    normalizeError(error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            return new Error('Unable to connect to the server. Please check your internet connection.');
        }
        if (error instanceof Error) {
            return error;
        }
        return new Error('An unexpected error occurred. Please try again.');
    }
}

// Create and export a single instance
const apiService = new ApiService(); 