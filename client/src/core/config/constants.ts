// Application constants
export const APP_CONSTANTS = {
  // Application metadata
  APP_NAME: 'Reaglex Platform',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Comprehensive eLearning and E-commerce Platform',
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'),
  API_TIMEOUT: 10000,
  
  // Storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME: 'theme',
    LANGUAGE: 'language',
    CURRENCY: 'currency',
    CART: 'cart',
    WISHLIST: 'wishlist',
    RECENT_SEARCHES: 'recent_searches',
  },
  
  // User roles
  USER_ROLES: {
    ADMIN: 'admin',
    STUDENT: 'student',
    INSTRUCTOR: 'instructor',
    BUYER: 'buyer',
    DEALER: 'dealer',
    UNIVERSITY: 'university',
    VISA_OFFICER: 'visa_officer',
    ADVERTISER: 'advertiser',
  },
  
  // Content types
  CONTENT_TYPES: {
    CAR: 'car',
    COURSE: 'course',
    REVIEW: 'review',
    MESSAGE: 'message',
    USER: 'user',
    CERTIFICATE: 'certificate',
    QUIZ: 'quiz',
    LESSON: 'lesson',
    MODULE: 'module',
  },
  
  // Notification types
  NOTIFICATION_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
  },
  
  // Course statuses
  COURSE_STATUSES: {
    DRAFT: 'draft',
    PENDING_REVIEW: 'pending_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PUBLISHED: 'published',
  },
  
  // Car conditions
  CAR_CONDITIONS: {
    NEW: 'new',
    USED: 'used',
    CERTIFIED_PRE_OWNED: 'certified_pre_owned',
  },
  
  // Fuel types
  FUEL_TYPES: {
    PETROL: 'petrol',
    DIESEL: 'diesel',
    ELECTRIC: 'electric',
    HYBRID: 'hybrid',
    LPG: 'lpg',
    CNG: 'cng',
  },
  
  // Transmission types
  TRANSMISSION_TYPES: {
    MANUAL: 'manual',
    AUTOMATIC: 'automatic',
    SEMI_AUTOMATIC: 'semi_automatic',
    CVT: 'cvt',
  },
  
  // Body types
  BODY_TYPES: {
    SEDAN: 'sedan',
    SUV: 'suv',
    HATCHBACK: 'hatchback',
    COUPE: 'coupe',
    CONVERTIBLE: 'convertible',
    WAGON: 'wagon',
    PICKUP: 'pickup',
    VAN: 'van',
    TRUCK: 'truck',
  },
  
  // Payment methods
  PAYMENT_METHODS: {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    PAYPAL: 'paypal',
    BANK_TRANSFER: 'bank_transfer',
    CASH: 'cash',
    CRYPTOCURRENCY: 'cryptocurrency',
  },
  
  // Order statuses
  ORDER_STATUSES: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  },
  
  // Quiz types
  QUIZ_TYPES: {
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    FILL_IN_BLANK: 'fill_in_blank',
    ESSAY: 'essay',
    MATCHING: 'matching',
  },
  
  // Lesson content types
  LESSON_CONTENT_TYPES: {
    VIDEO: 'video',
    TEXT: 'text',
    QUIZ: 'quiz',
    ASSIGNMENT: 'assignment',
    LIVE: 'live',
    AUDIO: 'audio',
    PDF: 'pdf',
    IMAGE: 'image',
  },
  
  // Certificate types
  CERTIFICATE_TYPES: {
    COMPLETION: 'completion',
    ACHIEVEMENT: 'achievement',
    PROFICIENCY: 'proficiency',
    PARTICIPATION: 'participation',
  },
  
  // Scholarship statuses
  SCHOLARSHIP_STATUSES: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    CLOSED: 'closed',
    SUSPENDED: 'suspended',
  },
  
  // Application statuses
  APPLICATION_STATUSES: {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    WAITLISTED: 'waitlisted',
  },
  
  // Visa types
  VISA_TYPES: {
    TOURIST: 'tourist',
    STUDENT: 'student',
    WORK: 'work',
    BUSINESS: 'business',
    FAMILY: 'family',
    TRANSIT: 'transit',
  },
  
  // Visa statuses
  VISA_STATUSES: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
  },
  
  // File upload limits
  FILE_LIMITS: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES: 5,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
    ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },
  
  // Date formats
  DATE_FORMATS: {
    DISPLAY: 'MMM dd, yyyy',
    DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
    API: 'yyyy-MM-dd',
    API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
    TIME_ONLY: 'HH:mm',
    DATE_ONLY: 'MMM dd',
  },
  
  // Validation rules
  VALIDATION_RULES: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 1000,
    TITLE_MAX_LENGTH: 200,
  },
  
  // Time intervals
  TIME_INTERVALS: {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
    YEAR: 365 * 24 * 60 * 60 * 1000,
  },
  
  // Cache TTL (Time To Live)
  CACHE_TTL: {
    SHORT: 60 * 1000,      // 1 minute
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 30 * 60 * 1000,  // 30 minutes
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    SAVED: 'Changes saved successfully.',
    CREATED: 'Created successfully.',
    UPDATED: 'Updated successfully.',
    DELETED: 'Deleted successfully.',
    UPLOADED: 'File uploaded successfully.',
    SENT: 'Message sent successfully.',
  },
  
  // Loading states
  LOADING_STATES: {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
  },
  
  // Breakpoints
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
    LARGE_DESKTOP: 1536,
  },
  
  // Animation durations
  ANIMATION_DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    NOTIFICATION: 1080,
  },
};

// Direct exports for commonly used constants
export const STORAGE_KEYS = APP_CONSTANTS.STORAGE_KEYS;
export const USER_ROLES = APP_CONSTANTS.USER_ROLES;
export const CONTENT_TYPES = APP_CONSTANTS.CONTENT_TYPES;

export default APP_CONSTANTS;
