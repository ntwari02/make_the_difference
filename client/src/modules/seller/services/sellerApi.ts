import axios from 'axios';
import type { SellerProfile, Car, SellerStats, SellerAnalytics, Notification, Activity } from '../types';
import { sparePartsApi } from './sparePartsApi';
import { api as sharedApi } from '../../../core/services/api/apiClient';

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

  // Upload profile photos
  uploadPhotos: async (_profileId: string, formData: FormData): Promise<{ images: string[] }> => {
    // Backend uses authenticated user id; no path param
    const { data } = await api.post(`/seller/profile/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data || data;
  },

  // Delete profile photo
  deletePhoto: async (profileId: string, photoId: string): Promise<void> => {
    await api.delete(`/seller/profile/${profileId}/photos/${photoId}`);
  },
};

// Seller Settings APIs
export const sellerSettingsApi = {
  getSettings: async (): Promise<any> => {
    const { data } = await api.get('/seller/settings');
    return data.data || data;
  },
  updateSettings: async (payload: Partial<{ notifications: any; privacy: any; preferences: any }>): Promise<any> => {
    const { data } = await api.put('/seller/settings', payload);
    return data.data || data;
  },
  deleteAccount: async (): Promise<void> => {
    await api.delete('/seller/account');
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

  // Generic cars list with query params (e.g., seller_id)
  getCars: async (params?: any): Promise<{ cars: Car[]; pagination?: any } | Car[]> => {
    const { data } = await api.get('/cars', { params });
    // Normalize common shapes
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any).cars)) return data as any;
    if (Array.isArray((data as any).data?.cars)) return (data as any).data;
    if (Array.isArray((data as any).data)) return (data as any).data;
    return (data.data || data) as any;
  },

  // Alternate seller path if backend exposes a nested resource
  getSellerCars: async (sellerId: string, params?: any): Promise<{ cars: Car[]; pagination?: any } | Car[]> => {
    const { data } = await api.get(`/sellers/${sellerId}/cars`, { params });
    return data.data || data;
  },

  // Create new car listing with file uploads
  createCarWithFiles: async (formData: FormData): Promise<Car> => {
    const { data } = await api.post('/cars', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
    const { data } = await api.patch(`/cars/${carId}/status`, { status, reason });
    return data.data || data;
  },
};

// Analytics APIs
export const analyticsApi = {
  // Get seller statistics
  getSellerStats: async (): Promise<SellerStats> => {
    // Prefer seller-specific endpoints; gracefully fallback to older/admin-style endpoints if necessary
    const tryEndpoints = [
      '/seller/analytics/stats',
      '/seller/stats',
      '/cars/seller/analytics/stats',
      '/cars/seller/analytics',
    ];

    for (const endpoint of tryEndpoints) {
      try {
        const { data } = await api.get(endpoint);
        return data.data || data;
      } catch (err: any) {
        // On 403/404, continue trying other endpoints
        if (err?.response?.status && [403, 404].includes(err.response.status)) {
          continue;
        }
      }
    }
    // Graceful default when no analytics endpoints exist
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
      recent_sales: [],
      monthly_sales: [],
    } as SellerStats;
  },

  // Get seller analytics data
  getSellerAnalytics: async (params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<SellerAnalytics> => {
    const tryEndpoints = [
      '/seller/analytics',
      '/cars/seller/analytics',
    ];

    for (const endpoint of tryEndpoints) {
      try {
        const { data } = await api.get(endpoint, { params });
        console.log('Analytics API raw response:', JSON.stringify(data, null, 2));
        const extracted = data.data || data;
        console.log('Analytics API extracted data:', JSON.stringify(extracted, null, 2));
        console.log('Sales by period:', extracted.sales_by_period);
        console.log('Sales by channel:', extracted.sales_by_channel);
        console.log('Conversion rate:', extracted.conversion_rate);
        return extracted;
      } catch (err: any) {
        console.error(`Analytics endpoint ${endpoint} failed:`, err);
        if (err?.response?.status && [403, 404].includes(err.response.status)) {
          continue;
        }
      }
    }
    // Graceful default
    return {
      sales_by_period: [],
      top_selling_models: [],
    } as SellerAnalytics;
  },
};

// Notification APIs
export const notificationApi = {
  // Get notifications
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ notifications: Notification[]; pagination: any }> => {
    const { data } = await api.get('/notifications', { params });
    return data.data || data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllNotificationsRead: async (): Promise<void> => {
    await api.patch('/notifications/mark-all-read');
  },
};

// Activity APIs
export const activityApi = {
  // Get recent activities
  getRecentActivities: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ activities: Activity[]; pagination: any }> => {
    const { data } = await api.get('/activities', { params });
    return data.data || data;
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

  // Get all seller reviews (all reviews for all seller's cars)
  getSellerReviews: async (params?: {
    page?: number;
    limit?: number;
    rating?: number | 'all';
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'helpful' | 'rating';
  }): Promise<any> => {
    const { data } = await api.get('/seller/reviews', { params });
    return data.data || data;
  },

  // Reply to a review
  replyToReview: async (reviewId: string, reply: string): Promise<any> => {
    const { data } = await api.post(`/seller/reviews/${reviewId}/reply`, { reply });
    return data.data || data;
  },
};

// Orders APIs
export const ordersApi = {
  listMy: async (params?: { page?: number; limit?: number; status?: string; payment_status?: string; search?: string; }): Promise<{ orders: any[]; pagination: any }> => {
    const { data } = await api.get('/orders/seller/me', { params });
    const payload = (data as any).data || data;
    if (Array.isArray(payload)) return { orders: payload, pagination: {} } as any;
    if (Array.isArray(payload?.orders)) return payload;
    return { orders: payload?.data || [], pagination: payload?.pagination || {} } as any;
  },
  updateStatus: async (orderId: string, status: string, notes?: string): Promise<any> => {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status, notes });
    return (data as any).data || data;
  },
  updatePayment: async (orderId: string, payment_status: string, transaction_id?: string, payment_date?: string): Promise<any> => {
    const { data } = await api.patch(`/orders/${orderId}/payment`, { payment_status, transaction_id, payment_date });
    return (data as any).data || data;
  },
  sendInvoice: async (orderId: string): Promise<any> => {
    const { data } = await api.patch(`/orders/${orderId}/invoice/send`);
    return (data as any).data || data;
  },
  stats: async (): Promise<any> => {
    const { data } = await api.get('/orders/seller/me/stats');
    return (data as any).data || data;
  },
};

// Messages APIs
export const messagesApi = {
  // Start a new conversation (best-effort; backend may not implement yet)
  startConversation: async (payload: { to: string; subject?: string; content: string }): Promise<any> => {
    try {
      const { data } = await api.post('/seller/messages', payload);
      return (data as any).data || data;
    } catch (e) {
      // Graceful fallback when endpoint not available
      return { id: 'temp', ...payload } as any;
    }
  },
  // Get conversations list (inbox, sent, archived)
  getConversations: async (params?: {
    page?: number;
    limit?: number;
    folder?: 'inbox' | 'sent' | 'archived';
    search?: string;
    category?: 'inquiry' | 'offer' | 'complaint' | 'support' | 'all';
  }): Promise<any> => {
    const { data } = await api.get('/seller/messages', { params });
    return data.data || data;
  },

  // Get messages in a conversation (thread)
  getConversationMessages: async (conversationId: string): Promise<any> => {
    const { data } = await api.get(`/seller/messages/${conversationId}`);
    return data.data || data;
  },

  // Send a message (reply)
  sendMessage: async (conversationId: string, payload: {
    content: string;
    messageType?: string;
    fileUrl?: string;
    category?: string;
    priority?: string;
    parentMessageId?: string;
  }): Promise<any> => {
    const { data } = await api.post(`/seller/messages/${conversationId}`, payload);
    return data.data || data;
  },
  
  // Upload message attachments
  uploadAttachments: async (conversationId: string, files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    const { data } = await sharedApi.upload(`/seller/messages/${conversationId}/attachments`, formData);
    return data.data?.urls || data.data?.files?.map((f: any) => f.url) || [];
  },

  // Mark messages as read
  markAsRead: async (conversationId: string, messageIds?: string[]): Promise<void> => {
    await api.patch(`/seller/messages/${conversationId}/read`, { messageIds });
  },

  // Archive/unarchive conversation
  archiveConversation: async (conversationId: string, archived: boolean = true): Promise<void> => {
    await api.patch(`/seller/messages/${conversationId}/archive`, { archived });
  },

  // Permanently remove conversation for this seller (leave/delete)
  deleteConversation: async (conversationId: string): Promise<void> => {
    await api.delete(`/seller/messages/${conversationId}`);
  },

  // Delete messages (bulk) - avoid conversation delete fallback
  deleteMessages: async (conversationId: string, messageIds: string[]): Promise<void> => {
    // Preferred bulk action endpoint
    try {
      await api.post(`/seller/messages/${conversationId}/messages/delete`, { messageIds });
      return;
    } catch (err: any) {
      if (err?.response?.status !== 404 && err?.response?.status !== 405) throw err;
    }
    // Alternative bulk endpoint naming
    try {
      await api.post(`/seller/messages/${conversationId}/messages/bulk-delete`, { messageIds });
      return;
    } catch (err: any) {
      if (err?.response?.status !== 404 && err?.response?.status !== 405) throw err;
    }
    // If no safe endpoint exists, surface an error instead of deleting the whole conversation
    throw new Error('Bulk message delete endpoint not available');
  },
  // Delete a single message (no conversation delete fallback)
  deleteSingleMessage: async (conversationId: string, messageId: string): Promise<void> => {
    // Try explicit nested resource first
    try {
      await api.delete(`/seller/messages/${conversationId}/messages/${messageId}`);
      return;
    } catch (err: any) {
      // If endpoint not found, try an action route
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        try {
          await api.post(`/seller/messages/${conversationId}/messages/delete`, { messageIds: [messageId] });
          return;
        } catch (_) {
          // fall through to legacy
        }
      }
    }
    // Do not fallback to deleting the entire conversation
    throw new Error('Single message delete endpoint not available');
  },
};

// Main seller API object
export const sellerApi = {
  profile: sellerProfileApi,
  settings: sellerSettingsApi,
  cars: carApi,
  analytics: analyticsApi,
  orders: ordersApi,
  notifications: notificationApi,
  activities: activityApi,
  favorites: favoritesApi,
  reviews: reviewApi,
  spareParts: sparePartsApi,
  messages: messagesApi,
  // Alias for reviews (to match frontend usage)
  review: reviewApi,
};
