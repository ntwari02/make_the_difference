import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SellerProfile, Car, SellerStats, SellerAnalytics, Notification } from '../types';

interface SellerState {
  profile: SellerProfile | null;
  stats: SellerStats | null;
  cars: Car[];
  selectedCars: string[];
  analytics: SellerAnalytics | null;
  notifications: Notification[];
  unreadNotifications: number;
  loading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  viewMode: 'grid' | 'list';
}

const initialState: SellerState = {
  profile: null,
  stats: null,
  cars: [],
  selectedCars: [],
  analytics: null,
  notifications: [],
  unreadNotifications: 0,
  loading: false,
  error: null,
  sidebarOpen: true,
  viewMode: 'grid',
};

const sellerSlice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    // Profile actions
    setProfile: (state, action: PayloadAction<SellerProfile>) => {
      state.profile = action.payload;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<SellerProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearProfile: (state) => {
      state.profile = null;
    },

    // Stats actions
    setStats: (state, action: PayloadAction<SellerStats>) => {
      state.stats = action.payload;
    },

    // Car actions
    setCars: (state, action: PayloadAction<Car[]>) => {
      state.cars = action.payload;
      state.error = null;
    },
    addCar: (state, action: PayloadAction<Car>) => {
      state.cars.unshift(action.payload);
    },
    updateCar: (state, action: PayloadAction<Car>) => {
      const index = state.cars.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.cars[index] = action.payload;
      }
    },
    removeCar: (state, action: PayloadAction<string>) => {
      state.cars = state.cars.filter((c) => c.id !== action.payload);
      state.selectedCars = state.selectedCars.filter((id) => id !== action.payload);
    },

    // Selection actions
    toggleCarSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedCars.indexOf(action.payload);
      if (index === -1) {
        state.selectedCars.push(action.payload);
      } else {
        state.selectedCars.splice(index, 1);
      }
    },
    selectAllCars: (state) => {
      state.selectedCars = state.cars.map((c) => c.id);
    },
    clearSelection: (state) => {
      state.selectedCars = [];
    },

    // Analytics actions
    setAnalytics: (state, action: PayloadAction<SellerAnalytics>) => {
      state.analytics = action.payload;
    },

    // Notification actions
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadNotifications = action.payload.filter((n) => !n.read).length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadNotifications += 1;
      }
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadNotifications -= 1;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadNotifications = 0;
    },

    // UI state actions
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
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

    // Reset actions
    resetState: () => initialState,
  },
});

export const {
  setProfile,
  updateProfile,
  clearProfile,
  setStats,
  setCars,
  addCar,
  updateCar,
  removeCar,
  toggleCarSelection,
  selectAllCars,
  clearSelection,
  setAnalytics,
  setNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  setSidebarOpen,
  setViewMode,
  setLoading,
  setError,
  resetState,
} = sellerSlice.actions;

export default sellerSlice.reducer;
