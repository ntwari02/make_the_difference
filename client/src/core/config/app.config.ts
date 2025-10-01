// App-wide configuration
export const APP_CONFIG = {
  // Application metadata
  NAME: 'Reaglex Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'Comprehensive eLearning and E-commerce Platform',
  
  // Environment
  ENVIRONMENT: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Feature flags
  FEATURES: {
    ECOMMERCE: true,
    ELEARNING: true,
    AI_FEATURES: true,
    SCHOLARSHIPS: true,
    VISA_MANAGEMENT: true,
    ADVERTISING: true,
    SECURITY_QUESTIONS: true,
    NOTIFICATIONS: true,
    ANALYTICS: true,
    MULTI_LANGUAGE: true,
    MULTI_CURRENCY: true,
  },
  
  // Supported languages
  SUPPORTED_LANGUAGES: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ],
  DEFAULT_LANGUAGE: 'en',
  
  // Supported currencies
  SUPPORTED_CURRENCIES: [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  ],
  DEFAULT_CURRENCY: 'USD',
  
  // Timezone
  DEFAULT_TIMEZONE: 'UTC',
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },
  
  // Cache settings
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    LONG_TTL: 30 * 60 * 1000,   // 30 minutes
    SHORT_TTL: 60 * 1000,       // 1 minute
  },
  
  // Request settings
  REQUEST: {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },
  
  // File upload settings
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    MAX_FILES_PER_UPLOAD: 5,
  },
  
  // Security settings
  SECURITY: {
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIREMENTS: {
      MIN_LENGTH: 8,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SYMBOLS: true,
    },
  },
  
  // UI settings
  UI: {
    SIDEBAR_WIDTH: 280,
    HEADER_HEIGHT: 64,
    FOOTER_HEIGHT: 80,
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
    DESKTOP_BREAKPOINT: 1200,
  },
  
  // Animation settings
  ANIMATION: {
    DURATION_SHORT: 200,
    DURATION_MEDIUM: 300,
    DURATION_LONG: 500,
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Error handling
  ERROR_HANDLING: {
    SHOW_ERROR_BOUNDARY: true,
    LOG_ERRORS_TO_CONSOLE: true,
    SEND_ERRORS_TO_SERVER: true,
    MAX_ERROR_MESSAGES: 5,
  },
  
  // Performance settings
  PERFORMANCE: {
    ENABLE_LAZY_LOADING: true,
    ENABLE_VIRTUAL_SCROLLING: true,
    ENABLE_MEMOIZATION: true,
    DEBOUNCE_DELAY: 300,
  },
  
  // Analytics settings
  ANALYTICS: {
    ENABLE_GOOGLE_ANALYTICS: false,
    ENABLE_MIXPANEL: false,
    ENABLE_HOTJAR: false,
    TRACK_USER_INTERACTIONS: true,
    TRACK_PAGE_VIEWS: true,
  },
  
  // Development settings
  DEVELOPMENT: {
    ENABLE_REDUX_DEVTOOLS: true,
    ENABLE_REACT_QUERY_DEVTOOLS: true,
    ENABLE_LOGGING: true,
    MOCK_API_RESPONSES: false,
  },
};

export default APP_CONFIG;
