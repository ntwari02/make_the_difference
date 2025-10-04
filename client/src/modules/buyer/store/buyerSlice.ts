import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BuyerProfile, Vehicle, Favorite, SearchFilters, BuyerStats } from '../types';

interface BuyerState {
  profile: BuyerProfile | null;
  stats: BuyerStats | null;
  vehicles: Vehicle[];
  favorites: Favorite[];
  recentlyViewed: Vehicle[];
  searchFilters: SearchFilters;
  viewMode: 'grid' | 'list';
  loading: boolean;
  error: string | null;
}

const initialState: BuyerState = {
  profile: null,
  stats: null,
  vehicles: [],
  favorites: [],
  recentlyViewed: [],
  searchFilters: {},
  viewMode: 'grid',
  loading: false,
  error: null,
};

const buyerSlice = createSlice({
  name: 'buyer',
  initialState,
  reducers: {
    // Profile actions
    setProfile: (state, action: PayloadAction<BuyerProfile>) => {
      state.profile = action.payload;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<BuyerProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearProfile: (state) => {
      state.profile = null;
    },

    // Stats actions
    setStats: (state, action: PayloadAction<BuyerStats>) => {
      state.stats = action.payload;
    },

    // Vehicle actions
    setVehicles: (state, action: PayloadAction<Vehicle[]>) => {
      state.vehicles = action.payload;
      state.error = null;
    },
    addVehicle: (state, action: PayloadAction<Vehicle>) => {
      state.vehicles.unshift(action.payload);
    },

    // Favorites actions
    setFavorites: (state, action: PayloadAction<Favorite[]>) => {
      state.favorites = action.payload;
      state.error = null;
    },
    addFavorite: (state, action: PayloadAction<Favorite>) => {
      state.favorites.unshift(action.payload);
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter((f) => f.car_id !== action.payload);
    },

    // Recently viewed actions
    addToRecentlyViewed: (state, action: PayloadAction<Vehicle>) => {
      // Remove if already exists
      state.recentlyViewed = state.recentlyViewed.filter((v) => v.id !== action.payload.id);
      // Add to beginning
      state.recentlyViewed.unshift(action.payload);
      // Keep only last 10
      if (state.recentlyViewed.length > 10) {
        state.recentlyViewed = state.recentlyViewed.slice(0, 10);
      }
    },
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
    },

    // Search filters actions
    setSearchFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.searchFilters = action.payload;
    },
    updateSearchFilter: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    clearSearchFilters: (state) => {
      state.searchFilters = {};
    },

    // View mode actions
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },

    // Loading and error actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  clearProfile,
  setStats,
  setVehicles,
  addVehicle,
  setFavorites,
  addFavorite,
  removeFavorite,
  addToRecentlyViewed,
  clearRecentlyViewed,
  setSearchFilters,
  updateSearchFilter,
  clearSearchFilters,
  setViewMode,
  setLoading,
  setError,
  clearError,
} = buyerSlice.actions;

export default buyerSlice.reducer;

