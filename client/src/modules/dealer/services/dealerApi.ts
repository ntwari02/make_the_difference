import axios from 'axios';
import type { DealerProfile, Vehicle, DashboardStats, SalesAnalytics, Notification, Activity } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Dealer Profile APIs
export const dealerApi = {
  // Get dealer profile
  getProfile: async (dealerId: string): Promise<DealerProfile> => {
    const { data } = await api.get(`/dealers/profile/${dealerId}`);
    return data.data || data;
  },

  // Create dealer profile
  createProfile: async (profileData: Partial<DealerProfile>): Promise<DealerProfile> => {
    const { data } = await api.post('/dealers', profileData);
    return data.data || data;
  },

  // Update dealer profile
  updateProfile: async (dealerId: string, profileData: Partial<DealerProfile>): Promise<DealerProfile> => {
    const { data } = await api.put(`/dealers/profile/${dealerId}`, profileData);
    return data.data || data;
  },

  // Delete dealer profile
  deleteProfile: async (dealerId: string): Promise<void> => {
    await api.delete(`/dealers/profile/${dealerId}`);
  },

  // Get dashboard stats
  getDashboardStats: async (dealerId: string): Promise<DashboardStats> => {
    const { data } = await api.get(`/dealers/profile/${dealerId}/stats`);
    return data.data || data;
  },

  // Get sales analytics
  getSalesAnalytics: async (dealerId: string, period: string = '30d'): Promise<SalesAnalytics[]> => {
    const { data } = await api.get(`/dealers/profile/${dealerId}/analytics`, {
      params: { period },
    });
    return data.data || data;
  },

  // Get dealer vehicles
  getVehicles: async (dealerId: string, filters?: any): Promise<Vehicle[]> => {
    const { data } = await api.get(`/dealers/${dealerId}/vehicles`, {
      params: filters,
    });
    return data.data || data;
  },

  // Get notifications
  getNotifications: async (): Promise<Notification[]> => {
    const { data } = await api.get('/dealers/notifications');
    return data.data || data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string): Promise<void> => {
    await api.put(`/dealers/notifications/${notificationId}/read`);
  },

  // Get activity timeline
  getActivityTimeline: async (dealerId: string, limit: number = 10): Promise<Activity[]> => {
    const { data } = await api.get(`/dealers/profile/${dealerId}/activity`, {
      params: { limit },
    });
    return data.data || data;
  },
};

// Vehicle APIs
export const vehicleApi = {
  // Get all vehicles
  getVehicles: async (filters?: any): Promise<Vehicle[]> => {
    const { data } = await api.get('/cars', { params: filters });
    return data.data || data;
  },

  // Get vehicle by ID
  getVehicleById: async (vehicleId: string): Promise<Vehicle> => {
    const { data } = await api.get(`/cars/${vehicleId}`);
    return data.data || data;
  },

  // Create vehicle
  createVehicle: async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    const { data } = await api.post('/cars', vehicleData);
    return data.data || data;
  },

  // Update vehicle
  updateVehicle: async (vehicleId: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    const { data } = await api.put(`/cars/${vehicleId}`, vehicleData);
    return data.data || data;
  },

  // Delete vehicle
  deleteVehicle: async (vehicleId: string): Promise<void> => {
    await api.delete(`/cars/${vehicleId}`);
  },

  // Bulk update vehicles
  bulkUpdateVehicles: async (vehicleIds: string[], updates: Partial<Vehicle>): Promise<void> => {
    await api.put('/cars/bulk-update', { vehicleIds, updates });
  },

  // Upload vehicle images
  uploadImages: async (vehicleId: string, images: File[]): Promise<string[]> => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const { data } = await api.post(`/cars/${vehicleId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data || data;
  },

  // Upload 3D model
  upload3DModel: async (vehicleId: string, model: File): Promise<string> => {
    const formData = new FormData();
    formData.append('model', model);

    const { data } = await api.post(`/cars/${vehicleId}/3d-model`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data || data;
  },
};

export default api;

