// Core API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/',
    REGISTER: '/',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
  // Security Questions endpoints
  SECURITY_QUESTIONS: {
    LIST: '/security-questions',
    SETUP: '/security-questions/setup',
    USER_QUESTIONS: '/security-questions/user',
    RESET: '/security-questions/reset/:email',
  },
  
  // Password Reset endpoints
  PASSWORD_RESET: {
    OPTIONS: '/password-reset/options/:email',
    INITIATE: '/password-reset/initiate',
    RESET: '/password-reset/reset',
    VERIFY: '/password-reset/verify/:token',
  },
};

// App configuration
export const APP_CONFIG = {
  NAME: 'Reaglex Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'Comprehensive eLearning and E-commerce Platform',
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de'],
  DEFAULT_LANGUAGE: 'en',
  CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD'],
  DEFAULT_CURRENCY: 'USD',
};

// Theme configuration
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#1976d2',
  SECONDARY_COLOR: '#dc004e',
  SUCCESS_COLOR: '#2e7d32',
  WARNING_COLOR: '#ed6c02',
  ERROR_COLOR: '#d32f2f',
  INFO_COLOR: '#0288d1',
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  CURRENCY: 'currency',
};

// User roles
export const USER_ROLES = {
  USER: 'user',
} as const;

// Content types
export const CONTENT_TYPES = {
  USER: 'user',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_FILES: 5,
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
};

// Validation rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
};

export default API_CONFIG;
