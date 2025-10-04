import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DealerProfile, Vehicle, DashboardStats, Notification } from '../types';

interface DealerState {
  profile: DealerProfile | null;
  stats: DashboardStats | null;
  vehicles: Vehicle[];
  selectedVehicles: string[];
  notifications: Notification[];
  unreadNotifications: number;
  loading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  viewMode: 'grid' | 'list';
}

const initialState: DealerState = {
  profile: null,
  stats: null,
  vehicles: [],
  selectedVehicles: [],
  notifications: [],
  unreadNotifications: 0,
  loading: false,
  error: null,
  sidebarOpen: true,
  viewMode: 'grid',
};

const dealerSlice = createSlice({
  name: 'dealer',
  initialState,
  reducers: {
    // Profile actions
    setProfile: (state, action: PayloadAction<DealerProfile>) => {
      state.profile = action.payload;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<DealerProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearProfile: (state) => {
      state.profile = null;
    },

    // Stats actions
    setStats: (state, action: PayloadAction<DashboardStats>) => {
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
    updateVehicle: (state, action: PayloadAction<Vehicle>) => {
      const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) {
        state.vehicles[index] = action.payload;
      }
    },
    removeVehicle: (state, action: PayloadAction<string>) => {
      state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
      state.selectedVehicles = state.selectedVehicles.filter((id) => id !== action.payload);
    },

    // Selection actions
    toggleVehicleSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedVehicles.indexOf(action.payload);
      if (index === -1) {
        state.selectedVehicles.push(action.payload);
      } else {
        state.selectedVehicles.splice(index, 1);
      }
    },
    selectAllVehicles: (state) => {
      state.selectedVehicles = state.vehicles.map((v) => v.id);
    },
    clearSelection: (state) => {
      state.selectedVehicles = [];
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
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadNotifications = 0;
    },

    // UI actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
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
  updateVehicle,
  removeVehicle,
  toggleVehicleSelection,
  selectAllVehicles,
  clearSelection,
  setNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  toggleSidebar,
  setSidebarOpen,
  setViewMode,
  setLoading,
  setError,
  clearError,
} = dealerSlice.actions;

export default dealerSlice.reducer;

