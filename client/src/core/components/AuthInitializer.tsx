import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../store/auth/authSlice';

/**
 * AuthInitializer component that runs comprehensive authentication validation
 * on app startup to prevent stale authentication data from causing issues
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('🚀 AuthInitializer: Starting comprehensive authentication validation...');
    
    const validateAndCleanAuth = () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userData = localStorage.getItem('user_data');
      const legacyUser = localStorage.getItem('user');
      
      console.log('🔍 AuthInitializer validation:');
      console.log('- Access token exists:', !!accessToken);
      console.log('- Refresh token exists:', !!refreshToken);
      console.log('- User data exists:', !!userData);
      console.log('- Legacy user exists:', !!legacyUser);
      
      let shouldClearAuth = false;
      let reason = '';
      
      // Check if we have tokens but no user data
      if ((accessToken || refreshToken) && !userData && !legacyUser) {
        shouldClearAuth = true;
        reason = 'tokens without user data';
      }
      
      // Check if we have user data but no tokens
      if ((userData || legacyUser) && !accessToken) {
        shouldClearAuth = true;
        reason = 'user data without tokens';
      }
      
      // Validate user data structure if it exists
      if (userData || legacyUser) {
        try {
          const user = userData ? JSON.parse(userData) : JSON.parse(legacyUser);
          
          if (!user.id || !user.email || !user.role ||
              typeof user.id !== 'string' ||
              typeof user.email !== 'string' ||
              typeof user.role !== 'string') {
            shouldClearAuth = true;
            reason = 'invalid user data structure';
          }
        } catch (error) {
          shouldClearAuth = true;
          reason = 'corrupted user data';
        }
      }
      
      // Validate token format
      if (accessToken && (typeof accessToken !== 'string' || accessToken.length < 10)) {
        shouldClearAuth = true;
        reason = 'malformed access token';
      }
      
      if (shouldClearAuth) {
        console.log(`🧹 AuthInitializer: Clearing authentication data - ${reason}`);
        
        // Clear ALL authentication-related data aggressively
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear Redux auth state
        dispatch(clearAuth());
        
        console.log('✅ AuthInitializer: All authentication data cleared successfully');
      } else {
        console.log('✅ AuthInitializer: Authentication data validation passed');
      }
    };
    
    // Run validation immediately
    validateAndCleanAuth();
    
    // Also run validation when storage changes (in case of multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && ['access_token', 'refresh_token', 'user_data', 'user'].includes(e.key)) {
        console.log('🔄 AuthInitializer: Storage change detected, re-validating...');
        validateAndCleanAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);

  // This component renders its children after validation
  return <>{children}</>;
};

export default AuthInitializer;
