import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../../modules/auth/services/authApi';
import { 
  LoginCredentials, 
  RegisterCredentials, 
  User, 
  AuthResponse 
} from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user') || localStorage.getItem('user_data');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        // Invalid user data in localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // IMPORTANT: Clear ALL old session data before logging in
      // This prevents old user data from interfering with new login
      console.log('🧹 Clearing old session data...');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_data');
      sessionStorage.clear(); // Clear session storage too
      
      const response: any = await authApi.login(credentials);
      
      // Backend returns tokens and user directly, not wrapped in 'data'
      const { access_token, refresh_token, user } = response;

      // Store tokens and user in localStorage (keys used across app and interceptors)
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user_data', JSON.stringify(user));
      
      // Debug: Verify storage
      console.log('🔍 Auth Debug - Stored data:');
      console.log('- Token stored:', !!localStorage.getItem('access_token'));
      console.log('- User stored:', localStorage.getItem('user'));
      console.log('- User role:', user.role);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, data: { user, access_token, refresh_token, expires_in: 0 }, message: 'Login successful' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Login failed. Please try again.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (credentials: RegisterCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response: any = await authApi.register(credentials);
      
      // Backend returns user directly: { id, email, role, is_verified }
      // For registration, we don't get tokens automatically - user needs to login
      const user = response;

      setAuthState({
        user,
        isAuthenticated: false, // Not authenticated yet, need to login
        isLoading: false,
        error: null,
      });

      return { success: true, data: { user }, message: 'Registration successful. Please login.' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Clear auth error
  const clearAuthError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    try {
      const user = await authApi.getProfile();
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState(prev => ({ ...prev, user }));
      return user;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(userData);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({ ...prev, user: updatedUser }));
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile.';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    register,
    logout,
    clearAuthError,
    refreshProfile,
    updateProfile,
  };
};

export default useAuth;
