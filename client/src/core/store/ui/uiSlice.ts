import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// UI state interface
interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Language
  language: string;
  
  // Currency
  currency: string;
  
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Modals
  modals: {
    [key: string]: {
      open: boolean;
      data?: any;
    };
  };
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    timestamp: string;
  }>;
  
  // Loading states
  loading: {
    [key: string]: boolean;
  };
  
  // Breadcrumbs
  breadcrumbs: Array<{
    label: string;
    href?: string;
    icon?: string;
  }>;
  
  // Page title
  pageTitle: string;
  
  // Mobile menu
  mobileMenuOpen: boolean;
}

// Initial state
const initialState: UIState = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  sidebarOpen: true,
  sidebarCollapsed: false,
  modals: {},
  notifications: [],
  loading: {},
  breadcrumbs: [],
  pageTitle: 'Reaglex Platform',
  mobileMenuOpen: false,
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    
    // Language actions
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    
    // Currency actions
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    
    // Modal actions
    openModal: (state, action: PayloadAction<{ id: string; data?: any }>) => {
      state.modals[action.payload.id] = {
        open: true,
        data: action.payload.data,
      };
    },
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].open = false;
        delete state.modals[action.payload].data;
      }
    },
    closeAllModals: (state) => {
      state.modals = {};
    },
    
    // Notification actions
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message: string;
      duration?: number;
    }>) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Loading actions
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },
    clearAllLoading: (state) => {
      state.loading = {};
    },
    
    // Breadcrumb actions
    setBreadcrumbs: (state, action: PayloadAction<Array<{
      label: string;
      href?: string;
      icon?: string;
    }>>) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action: PayloadAction<{
      label: string;
      href?: string;
      icon?: string;
    }>) => {
      state.breadcrumbs.push(action.payload);
    },
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [];
    },
    
    // Page title actions
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
    
    // Mobile menu actions
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    
    // Reset UI state
    resetUI: () => initialState,
  },
});

export const {
  setTheme,
  setLanguage,
  setCurrency,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  clearLoading,
  clearAllLoading,
  setBreadcrumbs,
  addBreadcrumb,
  clearBreadcrumbs,
  setPageTitle,
  toggleMobileMenu,
  setMobileMenuOpen,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
