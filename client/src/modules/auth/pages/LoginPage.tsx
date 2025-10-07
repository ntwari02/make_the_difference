import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../core/store';
import LoginForm from '../components/LoginForm';
import { redirectToDashboard } from '../../../core/utils/roleRedirect';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const hasRedirected = useRef(false);

  // Watch for authentication changes and redirect when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !hasRedirected.current) {
      console.log('✅ User authenticated, redirecting to dashboard for role:', user.role);
      console.log('👤 Full user object:', user);
      
      hasRedirected.current = true;
      
      // Don't use setTimeout here - immediate redirect
      redirectToDashboard(user, navigate);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSuccess = () => {
    // Success handler - get fresh data and redirect
    console.log('🎯 Login success callback triggered');
    
    // Start with Redux state if available
    if (isAuthenticated && user) {
      console.log('✅ Using Redux state for redirect:', user.role);
      hasRedirected.current = true;
      redirectToDashboard(user, navigate);
      return;
    }
    
    // Fallback to localStorage
    console.log('🔄 Falling back to localStorage check');
    setTimeout(() => {
      // Check multiple possible keys in localStorage
      const userStr = localStorage.getItem('user') || 
                     localStorage.getItem('user_data') ||
                     localStorage.getItem('userData');
      
      console.log('📦 User data from localStorage:', userStr);
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log('✅ Parsed user data:', userData);
          console.log('👤 User role:', userData.role);
          
          // Always use generic redirect by role
          hasRedirected.current = true;
          redirectToDashboard(userData, navigate);
        } catch (error) {
          console.error('❌ Error parsing user data:', error);
          console.log('🆘 Emergency redirect to home');
          navigate('/');
        }
      } else {
        console.error('❌ No user data found in localStorage');
        console.log('🆘 Emergency redirect to home');
        navigate('/');
      }
    }, 100); // Shorter timeout for faster response
  };

  const handleForgotPassword = () => {
    navigate('/auth/forgot-password');
  };

  const handleRegister = () => {
    navigate('/auth/register');
  };

  return (
    <LoginForm
      onSuccess={handleSuccess}
      onForgotPassword={handleForgotPassword}
      onRegister={handleRegister}
    />
  );
};

export default LoginPage;
