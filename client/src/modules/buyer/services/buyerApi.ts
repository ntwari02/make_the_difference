import { api as coreApi } from '../../../core/services/api/apiClient';
import type { Vehicle, Favorite, Review, SearchFilters, BuyerProfile } from '../types';
const api = coreApi;

// Public Vehicle APIs
export const vehicleApi = {
  // Get all vehicles with filters
  getVehicles: async (filters?: SearchFilters): Promise<{ vehicles: Vehicle[]; pagination: any }> => {
    const { data } = await api.get('/cars', { params: filters });
    return data.data || data;
  },

  // Search vehicles
  searchVehicles: async (query: string, filters?: SearchFilters): Promise<{ vehicles: Vehicle[]; pagination: any }> => {
    const { data } = await api.get('/cars/search', { params: { q: query, ...filters } });
    return data.data || data;
  },

  // Get vehicle by ID
  getVehicleById: async (vehicleId: string): Promise<Vehicle> => {
    const { data } = await api.get(`/cars/${vehicleId}`);
    return data.data || data;
  },

  // Get vehicle reviews
  getVehicleReviews: async (vehicleId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; pagination: any }> => {
    const { data } = await api.get(`/cars/${vehicleId}/reviews`, { params: { page, limit } });
    return data.data || data;
  },
};

// Buyer-specific APIs (require authentication)
export const buyerApi = {
  // Orders
  orders: {
    create: async (payload: any) => {
      // Use shared core API client so Authorization header is guaranteed
      const { data } = await coreApi.post('/orders', payload);
      return (data as any).data || data;
    },
  },
  // Favorites
  addToFavorites: async (vehicleId: string): Promise<Favorite> => {
    const { data } = await api.post(`/cars/${vehicleId}/favorite`);
    return data.data || data;
  },

  removeFromFavorites: async (vehicleId: string): Promise<void> => {
    await api.delete(`/cars/${vehicleId}/favorite`);
  },

  getFavorites: async (page: number = 1, limit: number = 20): Promise<{ favorites: Favorite[]; pagination: any }> => {
    const { data } = await api.get('/cars/buyer/favorites', { params: { page, limit } });
    return data.data || data;
  },

  // Reviews
  createReview: async (vehicleId: string, reviewData: { rating: number; title: string; comment: string }): Promise<Review> => {
    const { data } = await api.post(`/cars/${vehicleId}/review`, reviewData);
    return data.data || data;
  },

  // Profile
  getProfile: async (): Promise<BuyerProfile> => {
    const { data } = await api.get('/user/profile');
    const raw = data.data || data;
    return mapServerToBuyerProfile(raw);
  },

  updateProfile: async (profileData: Partial<BuyerProfile>): Promise<BuyerProfile> => {
    const payload = mapBuyerProfileToServer(profileData);
    const { data } = await api.put('/user/profile', payload);
    const raw = data.data || data;
    return mapServerToBuyerProfile(raw);
  },
};

export default api;

// Mapping helpers
function mapServerToBuyerProfile(u: any): BuyerProfile {
  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    phone: u.phone,
    avatar: u.profile_image,
    bio: u.bio,
    address: u.address,
    preferences: u.preferences || undefined,
    created_at: u.created_at,
    updated_at: u.updated_at,
  } as BuyerProfile;
}

function mapBuyerProfileToServer(p: Partial<BuyerProfile>): any {
  const out: any = {};
  if (p.firstName !== undefined) out.first_name = p.firstName;
  if (p.lastName !== undefined) out.last_name = p.lastName;
  if (p.email !== undefined) out.email = p.email; // note: backend may ignore email updates
  if (p.phone !== undefined) out.phone = p.phone;
  if (p.avatar !== undefined) out.profile_image = p.avatar;
  if (p.bio !== undefined) out.bio = p.bio;
  if (p.address !== undefined) out.address = p.address;
  if (p.preferences !== undefined) out.preferences = p.preferences;
  // created_at/updated_at are server-managed
  return out;
}

