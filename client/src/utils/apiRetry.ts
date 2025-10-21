import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryCondition?: (error: AxiosError) => boolean;
  onRetry?: (attempt: number, error: AxiosError) => void;
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryCondition: (error: AxiosError) => {
    // Retry on network errors, 5xx errors, and 429 (rate limit) errors
    return (
      !error.response || // Network error
      error.response.status >= 500 || // Server error
      error.response.status === 429 // Rate limit
    );
  },
  onRetry: (attempt: number, error: AxiosError) => {
    console.warn(`API retry attempt ${attempt} for ${error.config?.url}:`, error.message);
  }
};

/**
 * Calculates delay for exponential backoff with jitter
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  
  // Add jitter to prevent thundering herd (random value between 0.5 and 1.5)
  const jitter = 0.5 + Math.random();
  const delay = Math.min(exponentialDelay * jitter, maxDelay);
  
  return Math.floor(delay);
}

/**
 * Sleeps for the specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executes an API request with retry logic and exponential backoff
 */
export async function apiRequestWithRetry<T = any>(
  requestFn: () => Promise<AxiosResponse<T>>,
  config: RetryConfig = {}
): Promise<AxiosResponse<T>> {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let lastError: AxiosError;

  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const response = await requestFn();
      return response;
    } catch (error) {
      lastError = error as AxiosError;
      
      // Check if we should retry this error
      if (!finalConfig.retryCondition(lastError)) {
        throw lastError;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === finalConfig.maxRetries) {
        throw lastError;
      }
      
      // Call retry callback
      finalConfig.onRetry(attempt, lastError);
      
      // Calculate delay and wait
      const delay = calculateDelay(attempt, finalConfig.baseDelay, finalConfig.maxDelay);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Creates a retry-enabled axios instance
 */
export function createRetryAxios(config: RetryConfig = {}) {
  const axiosInstance = axios.create();
  
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );
  
  // Response interceptor with retry logic
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const retryConfig = { ...defaultRetryConfig, ...config };
      
      if (!retryConfig.retryCondition(error)) {
        return Promise.reject(error);
      }
      
      const originalRequest = error.config as AxiosRequestConfig & { _retryCount?: number };
      
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0;
      }
      
      if (originalRequest._retryCount >= retryConfig.maxRetries) {
        return Promise.reject(error);
      }
      
      originalRequest._retryCount++;
      
      // Call retry callback
      retryConfig.onRetry(originalRequest._retryCount, error);
      
      // Calculate delay and wait
      const delay = calculateDelay(originalRequest._retryCount, retryConfig.baseDelay, retryConfig.maxDelay);
      await sleep(delay);
      
      // Retry the request
      return axiosInstance(originalRequest);
    }
  );
  
  return axiosInstance;
}

/**
 * Utility function to check if an error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  return error?.response?.status === 429;
}

/**
 * Utility function to get retry-after header value
 */
export function getRetryAfterSeconds(error: any): number | null {
  const retryAfter = error?.response?.headers?.['retry-after'];
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    return isNaN(seconds) ? null : seconds;
  }
  return null;
}

/**
 * Enhanced retry config specifically for rate limit errors
 */
export const rateLimitRetryConfig: RetryConfig = {
  maxRetries: 5,
  baseDelay: 2000, // Start with 2 seconds for rate limits
  maxDelay: 30000, // Max 30 seconds
  retryCondition: (error: AxiosError) => {
    return error.response?.status === 429;
  },
  onRetry: (attempt: number, error: AxiosError) => {
    const retryAfter = getRetryAfterSeconds(error);
    const delay = retryAfter ? retryAfter * 1000 : calculateDelay(attempt, 2000, 30000);
    
    console.warn(
      `Rate limit hit. Retrying in ${Math.round(delay / 1000)}s (attempt ${attempt}/5)`
    );
  }
};

export default apiRequestWithRetry;
