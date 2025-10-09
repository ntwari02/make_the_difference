// Environment configuration
export const ENV = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'),
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  
  // Backend Configuration
  USE_REAL_API: import.meta.env.VITE_USE_REAL_API === 'true' || import.meta.env.VITE_NODE_ENV === 'production',
  
  // Application Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Reaglex Platform',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  
  // Feature Flags
  FEATURES: {
    ECOMMERCE: import.meta.env.VITE_FEATURE_ECOMMERCE === 'true',
    ELEARNING: import.meta.env.VITE_FEATURE_ELEARNING === 'true',
    AI: import.meta.env.VITE_FEATURE_AI === 'true',
    SCHOLARSHIPS: import.meta.env.VITE_FEATURE_SCHOLARSHIPS === 'true',
    VISA: import.meta.env.VITE_FEATURE_VISA === 'true',
    ADVERTISING: import.meta.env.VITE_FEATURE_ADVERTISING === 'true',
    SECURITY_QUESTIONS: import.meta.env.VITE_FEATURE_SECURITY_QUESTIONS === 'true',
  },
  
  // Development
  ENABLE_REDUX_DEVTOOLS: import.meta.env.VITE_ENABLE_REDUX_DEVTOOLS === 'true',
  ENABLE_REACT_QUERY_DEVTOOLS: import.meta.env.VITE_ENABLE_REACT_QUERY_DEVTOOLS === 'true',
  MOCK_API_RESPONSES: import.meta.env.VITE_MOCK_API_RESPONSES === 'true',
  
  // Security
  ENABLE_HTTPS: import.meta.env.VITE_ENABLE_HTTPS === 'true',
  SESSION_TIMEOUT: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 1800000, // 30 minutes
  REFRESH_TOKEN_EXPIRY: Number(import.meta.env.VITE_REFRESH_TOKEN_EXPIRY) || 604800000, // 7 days
  
  // Environment checks
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  IS_TEST: import.meta.env.MODE === 'test',
};

export default ENV;
