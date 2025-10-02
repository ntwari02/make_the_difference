import axios from 'axios';
import { ENV } from '../../../core/config/environment';

// Base API configuration
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Admin API Service
export class AdminApiService {
  // Dashboard Overview
  static async getDashboardOverview(period = '30d') {
    try {
      const response = await apiClient.get(`/admin/dashboard/overview?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  // User Management
  static async getAllUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async createUser(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: string;
  }) {
    try {
      const response = await apiClient.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUserRole(userId: string, role: string) {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async getUserDetails(userId: string) {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  // Analytics
  static async getAnalytics(params: {
    period?: string;
    type?: string;
    userId?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/admin/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  static async getRevenueAnalytics(period = '30d') {
    try {
      const response = await apiClient.get(`/admin/analytics/revenue?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }

  static async getUserAnalytics(period = '30d') {
    try {
      const response = await apiClient.get(`/admin/analytics/users?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  // System Management
  static async getSystemStatus() {
    try {
      const response = await apiClient.get('/admin/system/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  }

  static async getSystemAlerts() {
    try {
      const response = await apiClient.get('/admin/system/alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      throw error;
    }
  }

  static async updateSystemSettings(settings: any) {
    try {
      const response = await apiClient.put('/admin/system/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  // AI Services Management
  static async getAIServicesStatus() {
    try {
      const response = await apiClient.get('/ai/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching AI services status:', error);
      throw error;
    }
  }

  static async getAIDashboard() {
    try {
      const response = await apiClient.get('/ai/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching AI dashboard:', error);
      throw error;
    }
  }

  static async updateAISettings(settings: any) {
    try {
      const response = await apiClient.put('/ai/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating AI settings:', error);
      throw error;
    }
  }

  // Payment Management
  static async getPaymentAnalytics(period = '30d') {
    try {
      const response = await apiClient.get(`/admin/payments/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      throw error;
    }
  }

  static async getTransactions(params: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    userId?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/admin/payments/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  static async refundTransaction(transactionId: string, amount?: number) {
    try {
      const response = await apiClient.post(`/admin/payments/transactions/${transactionId}/refund`, {
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error refunding transaction:', error);
      throw error;
    }
  }

  // Content Management
  static async getContentModeration() {
    try {
      const response = await apiClient.get('/admin/content/moderation');
      return response.data;
    } catch (error) {
      console.error('Error fetching content moderation:', error);
      throw error;
    }
  }

  static async moderateContent(contentId: string, action: 'approve' | 'reject' | 'flag', reason?: string) {
    try {
      const response = await apiClient.post(`/admin/content/${contentId}/moderate`, {
        action,
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error moderating content:', error);
      throw error;
    }
  }

  // Reports
  static async generateReport(type: string, params: any = {}) {
    try {
      const response = await apiClient.post('/admin/reports/generate', {
        type,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  static async downloadReport(reportId: string) {
    try {
      const response = await apiClient.get(`/admin/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }

  // Backup & Maintenance
  static async createBackup() {
    try {
      const response = await apiClient.post('/admin/system/backup');
      return response.data;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  static async getBackupStatus() {
    try {
      const response = await apiClient.get('/admin/system/backup/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching backup status:', error);
      throw error;
    }
  }

  static async performMaintenance(action: string) {
    try {
      const response = await apiClient.post('/admin/system/maintenance', { action });
      return response.data;
    } catch (error) {
      console.error('Error performing maintenance:', error);
      throw error;
    }
  }
}

// E-commerce API Service
export class EcommerceApiService {
  // Cars
  static async getAllCars(params: {
    page?: number;
    limit?: number;
    brand?: string;
    model?: string;
    year?: number;
    price_min?: number;
    price_max?: number;
    status?: string;
    seller_id?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/ecommerce/cars', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching cars:', error);
      throw error;
    }
  }

  static async getCarById(carId: string) {
    try {
      const response = await apiClient.get(`/ecommerce/cars/${carId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching car:', error);
      throw error;
    }
  }

  static async createCar(carData: any) {
    try {
      const response = await apiClient.post('/ecommerce/cars', carData);
      return response.data;
    } catch (error) {
      console.error('Error creating car:', error);
      throw error;
    }
  }

  static async updateCar(carId: string, carData: any) {
    try {
      const response = await apiClient.put(`/ecommerce/cars/${carId}`, carData);
      return response.data;
    } catch (error) {
      console.error('Error updating car:', error);
      throw error;
    }
  }

  static async deleteCar(carId: string) {
    try {
      const response = await apiClient.delete(`/ecommerce/cars/${carId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting car:', error);
      throw error;
    }
  }

  // Spare Parts
  static async getAllSpareParts(params: any = {}) {
    try {
      const response = await apiClient.get('/ecommerce/spare-parts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching spare parts:', error);
      throw error;
    }
  }

  // Payments
  static async processPayment(paymentData: any) {
    try {
      const response = await apiClient.post('/ecommerce/payments/process', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  static async getPaymentMethods() {
    try {
      const response = await apiClient.get('/ecommerce/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }
}

// E-learning API Service
export class ElearningApiService {
  // Courses
  static async getAllCourses(params: any = {}) {
    try {
      const response = await apiClient.get('/elearning/courses', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  static async getCourseById(courseId: string) {
    try {
      const response = await apiClient.get(`/elearning/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  static async createCourse(courseData: any) {
    try {
      const response = await apiClient.post('/elearning/courses', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  static async updateCourse(courseId: string, courseData: any) {
    try {
      const response = await apiClient.put(`/elearning/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  static async deleteCourse(courseId: string) {
    try {
      const response = await apiClient.delete(`/elearning/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Enrollments
  static async enrollInCourse(courseId: string) {
    try {
      const response = await apiClient.post(`/elearning/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  }

  static async getUserEnrollments() {
    try {
      const response = await apiClient.get('/elearning/enrollments');
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  }

  // Progress
  static async updateProgress(progressData: any) {
    try {
      const response = await apiClient.post('/elearning/progress', progressData);
      return response.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  static async getUserProgress(courseId?: string) {
    try {
      const url = courseId ? `/elearning/progress/${courseId}` : '/elearning/progress';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  }
}

// Scholarships API Service
export class ScholarshipApiService {
  static async getAllScholarships(params: any = {}) {
    try {
      const response = await apiClient.get('/scholarships', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      throw error;
    }
  }

  static async getScholarshipById(scholarshipId: string) {
    try {
      const response = await apiClient.get(`/scholarships/${scholarshipId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching scholarship:', error);
      throw error;
    }
  }

  static async createScholarship(scholarshipData: any) {
    try {
      const response = await apiClient.post('/scholarships', scholarshipData);
      return response.data;
    } catch (error) {
      console.error('Error creating scholarship:', error);
      throw error;
    }
  }

  static async applyForScholarship(scholarshipId: string, applicationData: any) {
    try {
      const response = await apiClient.post(`/scholarships/${scholarshipId}/apply`, applicationData);
      return response.data;
    } catch (error) {
      console.error('Error applying for scholarship:', error);
      throw error;
    }
  }

  static async getUserApplications() {
    try {
      const response = await apiClient.get('/scholarships/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }
}

// Visa Management API Service
export class VisaApiService {
  static async getAllVisaServices(params: any = {}) {
    try {
      const response = await apiClient.get('/visa/services', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching visa services:', error);
      throw error;
    }
  }

  static async createVisaApplication(applicationData: any) {
    try {
      const response = await apiClient.post('/visa/applications', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error creating visa application:', error);
      throw error;
    }
  }

  static async getUserApplications() {
    try {
      const response = await apiClient.get('/visa/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching visa applications:', error);
      throw error;
    }
  }

  static async updateApplicationStatus(applicationId: string, status: string, notes?: string) {
    try {
      const response = await apiClient.put(`/visa/applications/${applicationId}/status`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }
}

// Advertising API Service
export class AdvertisingApiService {
  static async getAllCampaigns(params: any = {}) {
    try {
      const response = await apiClient.get('/advertising/campaigns', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  static async createCampaign(campaignData: any) {
    try {
      const response = await apiClient.post('/advertising/campaigns', campaignData);
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  static async updateCampaign(campaignId: string, campaignData: any) {
    try {
      const response = await apiClient.put(`/advertising/campaigns/${campaignId}`, campaignData);
      return response.data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  static async getCampaignAnalytics(campaignId: string) {
    try {
      const response = await apiClient.get(`/advertising/campaigns/${campaignId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      throw error;
    }
  }
}

// AI Services API
export class AIServicesApi {
  // Chatbot
  static async sendMessage(message: string, context?: any) {
    try {
      const response = await apiClient.post('/ai/chatbot/message', { message, context });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async getChatSuggestions() {
    try {
      const response = await apiClient.get('/ai/chatbot/suggestions');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat suggestions:', error);
      throw error;
    }
  }

  // Dynamic Pricing
  static async getDynamicPrice(productId: string, productType: 'car' | 'course' | 'scholarship') {
    try {
      const response = await apiClient.get(`/ai/pricing/dynamic/${productType}/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dynamic price:', error);
      throw error;
    }
  }

  static async getPricingRecommendations(productType: string) {
    try {
      const response = await apiClient.get(`/ai/pricing/recommendations/${productType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing recommendations:', error);
      throw error;
    }
  }

  // Personalization
  static async getPersonalizedRecommendations(userId?: string) {
    try {
      const url = userId ? `/ai/personalization/recommendations/${userId}` : '/ai/personalization/recommendations';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      throw error;
    }
  }

  static async getUserProfile(userId?: string) {
    try {
      const url = userId ? `/ai/personalization/profile/${userId}` : '/ai/personalization/profile';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Analytics
  static async getBusinessInsights(period = '30d') {
    try {
      const response = await apiClient.get(`/ai/analytics/business-insights?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business insights:', error);
      throw error;
    }
  }

  static async getFutureTrends(period = '30d', forecastDays = 30) {
    try {
      const response = await apiClient.get(`/ai/analytics/future-trends?period=${period}&forecast_days=${forecastDays}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching future trends:', error);
      throw error;
    }
  }

  static async getUserBehaviorAnalysis(userId?: string) {
    try {
      const url = userId ? `/ai/analytics/user-behavior/${userId}` : '/ai/analytics/user-behavior';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching user behavior analysis:', error);
      throw error;
    }
  }

  static async detectAnomalies() {
    try {
      const response = await apiClient.get('/ai/analytics/anomalies');
      return response.data;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      throw error;
    }
  }
}

// Export all services
export {
  AdminApiService,
  EcommerceApiService,
  ElearningApiService,
  ScholarshipApiService,
  VisaApiService,
  AdvertisingApiService,
  AIServicesApi,
};
