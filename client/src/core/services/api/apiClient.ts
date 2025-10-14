import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ENV } from '../../config/environment';
import { getFromStorage, removeFromStorage } from '../../../shared/utils';
import { STORAGE_KEYS } from '../../config/constants';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Get token directly from localStorage (it's stored as a plain string, not JSON)
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Debug - Token attached:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ Debug - No token found for request');
    }
    
    // Enhanced debugging for problematic requests
    if (ENV.IS_DEVELOPMENT) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        hasAuth: !!config.headers?.Authorization,
        fullUrl: `${config.baseURL}${config.url}`,
        data: config.data,
        params: config.params,
        headers: config.headers
      });
      
      // Special debug for PUT requests to dealer profile
      if (config.method === 'PUT' && config.url?.includes('/dealers/profile/')) {
        console.log('🔍 PUT Request Debug:', {
          method: config.method,
          url: config.url,
          dataSize: JSON.stringify(config.data || {}).length,
          authHeader: config.headers?.Authorization?.substring(0, 30) + '...'
        });
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (ENV.IS_DEVELOPMENT) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (ENV.IS_DEVELOPMENT) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
          hasAuth: !!error.config?.headers?.Authorization
        }
      });
      
      // Special handling for network errors
      if (error.message === 'Network Error') {
        console.error('🚨 Network Error Debug:', {
          fullUrl: `${error.config?.baseURL}${error.config?.url}`,
          method: error.config?.method,
          timeout: error.config?.timeout,
          serverReachable: false // We'll test this separately
        });
      }
    }
    
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getFromStorage(STORAGE_KEYS.REFRESH_TOKEN, null) || localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${ENV.API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const payload = response.data.data || response.data;
          const { access_token, refresh_token: newRefreshToken } = payload;
          
          // Update stored tokens
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        removeFromStorage(STORAGE_KEYS.ACCESS_TOKEN);
        removeFromStorage(STORAGE_KEYS.REFRESH_TOKEN);
        removeFromStorage(STORAGE_KEYS.USER_DATA);
        
        // Redirect to login page
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      // Forbidden - User doesn't have permission
      console.error('🚫 Access forbidden');
    } else if (error.response?.status === 404) {
      // Not found
      console.error('🔍 Resource not found');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('🔥 Server error');
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.get(url, config);
  },
  
  // POST request
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post(url, data, config);
  },
  
  // PUT request
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put(url, data, config);
  },
  
  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.patch(url, data, config);
  },
  
  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete(url, config);
  },
  
  // Upload file
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default apiClient;
