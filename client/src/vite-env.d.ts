/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_USE_REAL_API?: string;
  readonly VITE_NODE_ENV?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_APP_ENVIRONMENT?: string;
  readonly VITE_FEATURE_ECOMMERCE?: string;
  readonly VITE_FEATURE_ELEARNING?: string;
  readonly VITE_FEATURE_AI?: string;
  readonly VITE_FEATURE_SCHOLARSHIPS?: string;
  readonly VITE_FEATURE_VISA?: string;
  readonly VITE_FEATURE_ADVERTISING?: string;
  readonly VITE_FEATURE_SECURITY_QUESTIONS?: string;
  readonly VITE_ENABLE_REDUX_DEVTOOLS?: string;
  readonly VITE_ENABLE_REACT_QUERY_DEVTOOLS?: string;
  readonly VITE_MOCK_API_RESPONSES?: string;
  readonly VITE_ENABLE_HTTPS?: string;
  readonly VITE_SESSION_TIMEOUT?: string;
  readonly VITE_REFRESH_TOKEN_EXPIRY?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  // Add more environment variables as needed
}

