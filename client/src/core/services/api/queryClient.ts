import { QueryClient } from '@tanstack/react-query';
import { ENV } from '../../config/environment';

// Create query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - how long data stays in cache
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry failed requests
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Query keys factory
export const queryKeys = {
  // Auth queries
  auth: {
    user: ['auth', 'user'] as const,
    permissions: ['auth', 'permissions'] as const,
    sessions: ['auth', 'sessions'] as const,
  },
  
  // User queries
  users: {
    all: ['users'] as const,
    list: (params: any) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    activity: (id: string) => ['users', 'activity', id] as const,
  },
  
  // Admin queries
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    stats: (period: string) => ['admin', 'stats', period] as const,
    auditLogs: (params: any) => ['admin', 'audit-logs', params] as const,
    flaggedContent: ['admin', 'flagged-content'] as const,
    featureFlags: ['admin', 'feature-flags'] as const,
    systemSettings: ['admin', 'system-settings'] as const,
  },
  
  // E-commerce queries
  ecommerce: {
    cars: {
      all: ['cars'] as const,
      list: (params: any) => ['cars', 'list', params] as const,
      detail: (id: string) => ['cars', 'detail', id] as const,
      search: (query: string) => ['cars', 'search', query] as const,
    },
    payments: {
      history: ['payments', 'history'] as const,
      methods: ['payments', 'methods'] as const,
    },
  },
  
  // E-learning queries
  elearning: {
    courses: {
      all: ['courses'] as const,
      list: (params: any) => ['courses', 'list', params] as const,
      detail: (id: string) => ['courses', 'detail', id] as const,
      myCourses: ['courses', 'my-courses'] as const,
    },
    modules: {
      list: (courseId: string) => ['modules', 'list', courseId] as const,
      detail: (id: string) => ['modules', 'detail', id] as const,
    },
    lessons: {
      list: (moduleId: string) => ['lessons', 'list', moduleId] as const,
      detail: (id: string) => ['lessons', 'detail', id] as const,
    },
    quizzes: {
      list: (courseId: string) => ['quizzes', 'list', courseId] as const,
      detail: (id: string) => ['quizzes', 'detail', id] as const,
    },
    certificates: {
      all: ['certificates'] as const,
      myCertificates: ['certificates', 'my-certificates'] as const,
    },
    onlineClasses: {
      all: ['online-classes'] as const,
      list: (params: any) => ['online-classes', 'list', params] as const,
      detail: (id: string) => ['online-classes', 'detail', id] as const,
    },
  },
  
  // AI queries
  ai: {
    chatbot: {
      messages: ['ai', 'chatbot', 'messages'] as const,
      suggestions: ['ai', 'chatbot', 'suggestions'] as const,
    },
    analytics: {
      insights: ['ai', 'analytics', 'insights'] as const,
      trends: ['ai', 'analytics', 'trends'] as const,
    },
    personalization: {
      recommendations: ['ai', 'personalization', 'recommendations'] as const,
      profile: ['ai', 'personalization', 'profile'] as const,
    },
    pricing: {
      dynamic: ['ai', 'pricing', 'dynamic'] as const,
      recommendations: ['ai', 'pricing', 'recommendations'] as const,
    },
  },
  
  // Scholarships queries
  scholarships: {
    all: ['scholarships'] as const,
    list: (params: any) => ['scholarships', 'list', params] as const,
    detail: (id: string) => ['scholarships', 'detail', id] as const,
    applications: ['scholarships', 'applications'] as const,
    matching: (userId: string) => ['scholarships', 'matching', userId] as const,
  },
  
  // Visa queries
  visa: {
    applications: ['visa', 'applications'] as const,
    status: (id: string) => ['visa', 'status', id] as const,
  },
  
  // Security questions queries
  securityQuestions: {
    all: ['security-questions'] as const,
    categories: ['security-questions', 'categories'] as const,
    userQuestions: ['security-questions', 'user-questions'] as const,
  },
  
  // Password reset queries
  passwordReset: {
    options: (email: string) => ['password-reset', 'options', email] as const,
  },
};

export default queryClient;
