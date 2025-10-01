import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  refreshToken, 
  updateUserProfile,
  clearError 
} from '../store/auth/authSlice';
import { 
  LoginCredentials, 
  RegisterCredentials, 
  User, 
  UserRole,
  SecurityQuestionAnswer 
} from '../types';
import { useCallback } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  // Register function
  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      await dispatch(registerUser(credentials)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  // Refresh token function
  const refreshAuthToken = useCallback(async () => {
    try {
      await dispatch(refreshToken()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  // Update user profile
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      await dispatch(updateUserProfile(userData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  // Clear error
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Permission checking functions
  const hasRole = useCallback((role: UserRole): boolean => {
    return auth.user?.role === role;
  }, [auth.user]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return auth.user ? roles.includes(auth.user.role) : false;
  }, [auth.user]);

  const hasPermission = useCallback((resource: string, action: string): boolean => {
    if (!auth.user) return false;
    
    const permissions: Record<UserRole, string[]> = {
      admin: ['*'], // Admin has all permissions
      instructor: ['courses:read', 'courses:write', 'students:read'],
      student: ['courses:read', 'profile:write'],
      buyer: ['cars:read', 'profile:write'],
      seller: ['cars:read', 'cars:write', 'profile:write'],
      dealer: ['cars:read', 'cars:write', 'profile:write'],
      university: ['courses:read', 'students:read'],
      visa_officer: ['visa:read', 'visa:write'],
      advertiser: ['ads:read', 'ads:write'],
    };

    const userPermissions = permissions[auth.user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(`${resource}:${action}`);
  }, [auth.user]);

  // Computed properties
  const isAdmin = hasRole('admin');
  const isStudent = hasRole('student');
  const isInstructor = hasRole('instructor');
  const isSeller = hasRole('seller');
  const isBuyer = hasRole('buyer');
  
  const fullName = auth.user ? `${auth.user.first_name} ${auth.user.last_name}` : '';
  const initials = auth.user ? `${auth.user.first_name.charAt(0)}${auth.user.last_name.charAt(0)}`.toUpperCase() : '';

  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    lastLogin: auth.lastLogin,
    
    // Actions
    login,
    register,
    logout,
    refreshAuthToken,
    updateProfile,
    clearAuthError,
    
    // Permission checking
    hasRole,
    hasAnyRole,
    hasPermission,
    
    // Computed properties
    isAdmin,
    isStudent,
    isInstructor,
    isSeller,
    isBuyer,
    fullName,
    initials,
  };
};

export default useAuth;
