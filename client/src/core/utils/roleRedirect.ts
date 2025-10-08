import { NavigateFunction } from 'react-router-dom';
import { normalizeRole, getDashboardPath, isValidRole, getUserFromStorage } from './authUtils';

export interface User {
  role: string;
  [key: string]: any;
}

/**
 * Redirect user to their appropriate dashboard based on role
 * @param user - User object with role property
 * @param navigate - React Router navigate function
 */
export const redirectToDashboard = (user: User | null, navigate: NavigateFunction): void => {
  console.log('🔀 redirectToDashboard called with user:', user);
  
  if (!user) {
    console.log('⚠️ No user provided, redirecting to home');
    navigate('/');
    return;
  }

  const role = normalizeRole(user.role);
  console.log('👤 User role detected (normalized):', role);
  console.log('🔍 Full user object:', JSON.stringify(user, null, 2));

  // Validate role
  if (!isValidRole(role)) {
    console.error('❌ Invalid role detected:', role);
    console.log('🆘 Redirecting to home');
    navigate('/');
    return;
  }

  const dashboardPath = getDashboardPath(role);
  console.log(`🎯 Redirecting ${role} to: ${dashboardPath}`);
  
  navigate(dashboardPath);
  console.log('✅ Navigation executed');
};

/**
 * Get dashboard path for a given role
 * @param role - User role
 * @returns Dashboard path for the role
 */
export const getDashboardPathForRole = (role: string): string => {
  return getDashboardPath(role);
};

