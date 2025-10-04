import axios from 'axios';
import { ENV } from '../../../core/config/environment';
import type { Vehicle, Favorite, Review, SearchFilters, BuyerProfile } from '../types';

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
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

// Public Vehicle APIs
export const vehicleApi = {
  // Get all vehicles with filters
  getVehicles: async (filters?: SearchFilters): Promise<{ vehicles: Vehicle[]; pagination: any }> => {
    const { data } = await api.get('/ecommerce/cars', { params: filters });
    return data.data || data;
  },

  // Search vehicles
  searchVehicles: async (query: string, filters?: SearchFilters): Promise<{ vehicles: Vehicle[]; pagination: any }> => {
    const { data } = await api.get('/ecommerce/cars/search', { params: { q: query, ...filters } });
    return data.data || data;
  },

  // Get vehicle by ID
  getVehicleById: async (vehicleId: string): Promise<Vehicle> => {
    const { data } = await api.get(`/ecommerce/cars/${vehicleId}`);
    return data.data || data;
  },

  // Get vehicle reviews
  getVehicleReviews: async (vehicleId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; pagination: any }> => {
    const { data } = await api.get(`/ecommerce/cars/${vehicleId}/reviews`, { params: { page, limit } });
    return data.data || data;
  },
};

// Buyer-specific APIs (require authentication)
export const buyerApi = {
  // Favorites
  addToFavorites: async (vehicleId: string): Promise<Favorite> => {
    const { data } = await api.post(`/ecommerce/cars/${vehicleId}/favorite`);
    return data.data || data;
  },

  removeFromFavorites: async (vehicleId: string): Promise<void> => {
    await api.delete(`/ecommerce/cars/${vehicleId}/favorite`);
  },

  getFavorites: async (page: number = 1, limit: number = 20): Promise<{ favorites: Favorite[]; pagination: any }> => {
    const { data } = await api.get('/ecommerce/cars/buyer/favorites', { params: { page, limit } });
    return data.data || data;
  },

  // Reviews
  createReview: async (vehicleId: string, reviewData: { rating: number; title: string; comment: string }): Promise<Review> => {
    const { data } = await api.post(`/ecommerce/cars/${vehicleId}/review`, reviewData);
    return data.data || data;
  },

  // Profile
  getProfile: async (): Promise<BuyerProfile> => {
    const { data } = await api.get('/users/profile');
    return data.data || data;
  },

  updateProfile: async (profileData: Partial<BuyerProfile>): Promise<BuyerProfile> => {
    const { data } = await api.put('/users/profile', profileData);
    return data.data || data;
  },
};

export default api;

