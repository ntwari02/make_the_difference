import axios from 'axios';
import type { SellerProfile, Car, SellerStats, SellerAnalytics, Notification, Activity } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('access_token');
    if (token) {
      // Some storages include quotes; strip them and any whitespace
      token = token.trim().replace(/^"+|"+$/g, '');
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Seller Profile APIs (Note: Sellers don't have a separate profile system like dealers,
// but we can use the user profile or create seller-specific profile management)
export const sellerProfileApi = {
  // Get seller profile (could be user profile or seller-specific)
  getProfile: async (): Promise<SellerProfile> => {
    const tryEndpoints = [
      '/seller/profile',
      '/auth/profile',
      '/users/me',
      '/user/profile',
    ];

    for (const endpoint of tryEndpoints) {
      try {
        const { data } = await api.get(endpoint);
        return data.data || data;
      } catch (err: any) {
        if (err?.response?.status && [401, 403, 404].includes(err.response.status)) {
          continue;
        }
      }
    }

    // Fallback to minimal profile from localStorage if API not available
    try {
      const raw = localStorage.getItem('user') || localStorage.getItem('user_data');
      const user = raw ? JSON.parse(raw) : {};
      return {
        id: user.id || 'me',
        user_id: user.id || 'me',
        business_name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Seller',
        business_type: 'individual',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as SellerProfile;
    } catch {
      throw new Error('Unable to load seller profile');
    }
  },

  // Update seller profile
  updateProfile: async (profileData: Partial<SellerProfile>): Promise<SellerProfile> => {
    // Prefer seller business profile endpoint
    const { data } = await api.put('/seller/profile', profileData);
    return data.data || data;
  },
};

// Car Management APIs (Primary seller functionality)
export const carApi = {
  // Get seller's cars
  getMyCars: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ cars: Car[]; pagination: any }> => {
    const { data } = await api.get('/cars/seller/my-cars', { params });
    return data.data || data;
  },

  // Create new car listing
  createCar: async (carData: Partial<Car>): Promise<Car> => {
    const { data } = await api.post('/cars', carData);
    return data.data || data;
  },

  // Update existing car
  updateCar: async (carId: string, carData: Partial<Car>): Promise<Car> => {
    const { data } = await api.patch(`/cars/${carId}`, carData);
    return data.data || data;
  },

  // Delete car listing
  deleteCar: async (carId: string): Promise<void> => {
    await api.delete(`/cars/${carId}`);
  },

  // Get single car details
  getCar: async (carId: string): Promise<Car> => {
    const { data } = await api.get(`/cars/${carId}`);
    return data.data || data;
  },

  // Update car status (admin function, but sellers might need it for draft/active)
  updateCarStatus: async (carId: string, status: string, reason?: string): Promise<Car> => {
    // Prefer seller-specific endpoint, fallback to admin endpoint if needed
    try {
      const { data } = await api.patch(`/cars/seller/${carId}/status`, { status });
      return data.data || data;
    } catch (err: any) {
      if (err?.response?.status && [403, 404].includes(err.response.status)) {
        const { data } = await api.patch(`/cars/${carId}/status`, { status, reason });
        return data.data || data;
      }
      throw err;
    }
  },
};

// Analytics APIs
export const analyticsApi = {
  // Get seller statistics
  getSellerStats: async (): Promise<SellerStats> => {
    try {
      const { data } = await api.get('/seller/analytics/stats');
      return data.data || data;
    } catch (err: any) {
      console.error('Error fetching seller stats:', err);
      // Graceful fallback
      return {
        inventory: {
          total_vehicles: 0,
          active_listings: 0,
          sold_vehicles: 0,
          average_price: 0,
        },
        sales: {
          total_sales: 0,
          total_revenue: 0,
          average_sale_price: 0,
        },
        performance: {
          score: 0,
          level: 'poor',
        },
        recent_sales: [],
        monthly_sales: [],
        top_models: [],
      } as SellerStats;
    }
  },

  // Get seller analytics data
  getSellerAnalytics: async (params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
    group_by?: string;
  }): Promise<SellerAnalytics> => {
    try {
      const { data } = await api.get('/seller/analytics', { params });
      return data.data || data;
    } catch (err: any) {
      console.error('Error fetching seller analytics:', err);
      // Graceful fallback
      return {
        sales_by_period: [],
        top_selling_models: [],
        channel_performance: [],
        geographic_performance: [],
        period: {
          type: params?.period || '30d',
          start_date: params?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: params?.end_date || new Date().toISOString(),
        }
      } as SellerAnalytics;
    }
  },
};

// Notification APIs
export const notificationApi = {
  // Get notifications
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    priority?: string;
    read?: boolean;
    unread_only?: boolean;
  }): Promise<{ notifications: Notification[]; pagination: any }> => {
    try {
      const { data } = await api.get('/notifications', { params });
      return data.data || data;
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      return { notifications: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string): Promise<void> => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  },

  // Mark all notifications as read
  markAllNotificationsRead: async (): Promise<void> => {
    try {
      await api.patch('/notifications/mark-all-read');
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      return data.data?.count || data.count || 0;
    } catch (err: any) {
      console.error('Error fetching unread count:', err);
      return 0;
    }
  },
};

// Activity APIs
export const activityApi = {
  // Get recent activities
  getRecentActivities: async (params?: {
    page?: number;
    limit?: number;
    entity_type?: string;
    action_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ activities: Activity[]; pagination: any }> => {
    try {
      const { data } = await api.get('/activities', { params });
      return data.data || data;
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      return { activities: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    }
  },

  // Get seller-specific activities
  getSellerActivities: async (params?: {
    page?: number;
    limit?: number;
    action_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ activities: Activity[]; pagination: any }> => {
    try {
      const { data } = await api.get('/activities/seller', { params });
      return data.data || data;
    } catch (err: any) {
      console.error('Error fetching seller activities:', err);
      return { activities: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    }
  },

  // Get activity summary
  getActivitySummary: async (period?: string): Promise<any> => {
    try {
      const { data } = await api.get('/activities/summary', { params: { period } });
      return data.data || data;
    } catch (err: any) {
      console.error('Error fetching activity summary:', err);
      return { period: period || '7d', total_activities: 0, activity_breakdown: [], active_days: 0 };
    }
  },

  // Log activity
  logActivity: async (activityData: {
    entity_type: string;
    entity_id: string;
    action_type: string;
    action_data?: any;
  }): Promise<void> => {
    try {
      await api.post('/activities/log', activityData);
    } catch (err: any) {
      console.error('Error logging activity:', err);
    }
  },
};

// Favorites APIs (for buyers, but sellers might want to see their listings' favorites)
export const favoritesApi = {
  // Get favorites for seller's cars
  getCarFavorites: async (carId: string): Promise<any[]> => {
    const { data } = await api.get(`/cars/${carId}/favorites`);
    return data.data || data;
  },
};

// Reviews APIs (sellers can respond to reviews)
export const reviewApi = {
  // Get reviews for seller's cars
  getCarReviews: async (carId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const { data } = await api.get(`/cars/${carId}/reviews`, { params });
    return data.data || data;
  },

  // Respond to review
  respondToReview: async (reviewId: string, response: string): Promise<any> => {
    const { data } = await api.post(`/cars/reviews/${reviewId}/respond`, { response });
    return data.data || data;
  },
};

// Main seller API object
export const sellerApi = {
  profile: sellerProfileApi,
  cars: carApi,
  analytics: analyticsApi,
  notifications: notificationApi,
  activities: activityApi,
  favorites: favoritesApi,
  reviews: reviewApi,
};
