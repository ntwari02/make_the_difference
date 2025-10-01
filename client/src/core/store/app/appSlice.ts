import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// App state interface
interface AppState {
  // App initialization
  initialized: boolean;
  
  // App version
  version: string;
  
  // Feature flags
  features: {
    ecommerce: boolean;
    elearning: boolean;
    ai: boolean;
    scholarships: boolean;
    visa: boolean;
    advertising: boolean;
    securityQuestions: boolean;
  };
  
  // App settings
  settings: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  
  // Statistics
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalCars: number;
    totalRevenue: number;
    lastUpdated: string | null;
  };
  
  // System status
  systemStatus: {
    api: 'online' | 'offline' | 'maintenance';
    database: 'online' | 'offline' | 'maintenance';
    storage: 'online' | 'offline' | 'maintenance';
    lastChecked: string | null;
  };
  
  // Cache
  cache: {
    [key: string]: {
      data: any;
      timestamp: number;
      ttl: number;
    };
  };
}

// Initial state
const initialState: AppState = {
  initialized: false,
  version: '1.0.0',
  features: {
    ecommerce: true,
    elearning: true,
    ai: true,
    scholarships: true,
    visa: true,
    advertising: true,
    securityQuestions: true,
  },
  settings: {
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
  stats: {
    totalUsers: 0,
    totalCourses: 0,
    totalCars: 0,
    totalRevenue: 0,
    lastUpdated: null,
  },
  systemStatus: {
    api: 'online',
    database: 'online',
    storage: 'online',
    lastChecked: null,
  },
  cache: {},
};

// App slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Initialization
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
    
    // Version
    setVersion: (state, action: PayloadAction<string>) => {
      state.version = action.payload;
    },
    
    // Feature flags
    setFeatures: (state, action: PayloadAction<Partial<AppState['features']>>) => {
      state.features = { ...state.features, ...action.payload };
    },
    toggleFeature: (state, action: PayloadAction<keyof AppState['features']>) => {
      state.features[action.payload] = !state.features[action.payload];
    },
    
    // Settings
    setSettings: (state, action: PayloadAction<Partial<AppState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setMaintenanceMode: (state, action: PayloadAction<boolean>) => {
      state.settings.maintenanceMode = action.payload;
    },
    setRegistrationEnabled: (state, action: PayloadAction<boolean>) => {
      state.settings.registrationEnabled = action.payload;
    },
    
    // Statistics
    setStats: (state, action: PayloadAction<Partial<AppState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
      state.stats.lastUpdated = new Date().toISOString();
    },
    updateStats: (state, action: PayloadAction<{
      totalUsers?: number;
      totalCourses?: number;
      totalCars?: number;
      totalRevenue?: number;
    }>) => {
      if (action.payload.totalUsers !== undefined) {
        state.stats.totalUsers = action.payload.totalUsers;
      }
      if (action.payload.totalCourses !== undefined) {
        state.stats.totalCourses = action.payload.totalCourses;
      }
      if (action.payload.totalCars !== undefined) {
        state.stats.totalCars = action.payload.totalCars;
      }
      if (action.payload.totalRevenue !== undefined) {
        state.stats.totalRevenue = action.payload.totalRevenue;
      }
      state.stats.lastUpdated = new Date().toISOString();
    },
    
    // System status
    setSystemStatus: (state, action: PayloadAction<Partial<AppState['systemStatus']>>) => {
      state.systemStatus = { ...state.systemStatus, ...action.payload };
      state.systemStatus.lastChecked = new Date().toISOString();
    },
    checkSystemStatus: (state) => {
      state.systemStatus.lastChecked = new Date().toISOString();
    },
    
    // Cache
    setCache: (state, action: PayloadAction<{
      key: string;
      data: any;
      ttl?: number;
    }>) => {
      const ttl = action.payload.ttl || 300000; // 5 minutes default
      state.cache[action.payload.key] = {
        data: action.payload.data,
        timestamp: Date.now(),
        ttl,
      };
    },
    getCache: (state, action: PayloadAction<string>) => {
      const cached = state.cache[action.payload];
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
      // Remove expired cache
      delete state.cache[action.payload];
      return null;
    },
    clearCache: (state, action?: PayloadAction<string>) => {
      if (action?.payload) {
        delete state.cache[action.payload];
      } else {
        state.cache = {};
      }
    },
    clearExpiredCache: (state) => {
      const now = Date.now();
      Object.keys(state.cache).forEach(key => {
        const cached = state.cache[key];
        if (now - cached.timestamp >= cached.ttl) {
          delete state.cache[key];
        }
      });
    },
    
    // Reset app state
    resetApp: () => initialState,
  },
});

export const {
  setInitialized,
  setVersion,
  setFeatures,
  toggleFeature,
  setSettings,
  setMaintenanceMode,
  setRegistrationEnabled,
  setStats,
  updateStats,
  setSystemStatus,
  checkSystemStatus,
  setCache,
  getCache,
  clearCache,
  clearExpiredCache,
  resetApp,
} = appSlice.actions;

export default appSlice.reducer;
