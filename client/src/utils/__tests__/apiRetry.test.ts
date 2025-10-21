import { apiRequestWithRetry, isRateLimitError, getRetryAfterSeconds } from './apiRetry';
import axios from 'axios';

// Mock axios for testing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Retry Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isRateLimitError', () => {
    it('should identify rate limit errors correctly', () => {
      const rateLimitError = {
        response: { status: 429 }
      };
      const otherError = {
        response: { status: 500 }
      };
      const networkError = {};

      expect(isRateLimitError(rateLimitError)).toBe(true);
      expect(isRateLimitError(otherError)).toBe(false);
      expect(isRateLimitError(networkError)).toBe(false);
    });
  });

  describe('getRetryAfterSeconds', () => {
    it('should extract retry-after header correctly', () => {
      const errorWithRetryAfter = {
        response: {
          headers: { 'retry-after': '60' }
        }
      };
      const errorWithoutRetryAfter = {
        response: { headers: {} }
      };

      expect(getRetryAfterSeconds(errorWithRetryAfter)).toBe(60);
      expect(getRetryAfterSeconds(errorWithoutRetryAfter)).toBe(null);
    });
  });

  describe('apiRequestWithRetry', () => {
    it('should retry on rate limit errors', async () => {
      const mockRequest = jest.fn()
        .mockRejectedValueOnce({
          response: { status: 429, headers: { 'retry-after': '1' } }
        })
        .mockResolvedValueOnce({ data: 'success' });

      const result = await apiRequestWithRetry(mockRequest, {
        maxRetries: 2,
        baseDelay: 10, // Short delay for testing
        retryCondition: (error) => error.response?.status === 429
      });

      expect(result.data).toBe('success');
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockRequest = jest.fn()
        .mockRejectedValueOnce({
          response: { status: 400 }
        });

      await expect(apiRequestWithRetry(mockRequest, {
        maxRetries: 2,
        retryCondition: (error) => error.response?.status === 429
      })).rejects.toMatchObject({
        response: { status: 400 }
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should respect max retries', async () => {
      const mockRequest = jest.fn()
        .mockRejectedValue({
          response: { status: 429 }
        });

      await expect(apiRequestWithRetry(mockRequest, {
        maxRetries: 2,
        baseDelay: 10,
        retryCondition: (error) => error.response?.status === 429
      })).rejects.toMatchObject({
        response: { status: 429 }
      });

      expect(mockRequest).toHaveBeenCalledTimes(2);
    });
  });
});
