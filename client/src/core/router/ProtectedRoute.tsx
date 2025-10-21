import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { UserRole } from '../types';
import Loading from '../../shared/components/ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole; // backward-compat single role
  allowedRoles?: UserRole[]; // preferred multi-role
  requiredPermissions?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  requiredPermissions = [],
  fallbackPath = '/login',
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  
  // Read only canonical keys used by the app
  const lsUser = React.useMemo(() => {
    if (user) return user;
    try {
      const canonical = localStorage.getItem('user_data');
      return canonical ? JSON.parse(canonical) : null;
    } catch {
      return null;
    }
  }, [user]);
  const hasToken = typeof localStorage !== 'undefined' && !!localStorage.getItem('access_token');

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading fullScreen text="Checking authentication..." />;
  }

  // Comprehensive authentication validation
  const hasValidToken = hasToken && localStorage.getItem('access_token') && localStorage.getItem('access_token').length > 10;
  const hasValidUserData = lsUser && lsUser.id && lsUser.email && lsUser.role && 
                           typeof lsUser.id === 'string' && 
                           typeof lsUser.email === 'string' && 
                           typeof lsUser.role === 'string';
  
  console.log('🔍 ProtectedRoute authentication check:');
  console.log('- Redux isAuthenticated:', isAuthenticated);
  console.log('- Redux isLoading:', isLoading);
  console.log('- Has valid token:', hasValidToken);
  console.log('- Has valid user data:', hasValidUserData);
  console.log('- lsUser:', lsUser);
  
  // Redirect to login if not authenticated: require ALL conditions to be true
  if (isLoading === false && (!isAuthenticated || !hasValidToken || !hasValidUserData)) {
    console.log('❌ Authentication failed, redirecting to login');
    // Clear invalid authentication data
    if (isAuthenticated && (!hasValidToken || !hasValidUserData)) {
      console.log('🧹 Clearing invalid authentication data from ProtectedRoute');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user');
      localStorage.removeItem('last_login');
    }
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirement (normalize role to avoid case/syntax mismatches)
  const rolesToCheck = allowedRoles && allowedRoles.length > 0 ? allowedRoles : (requiredRole ? [requiredRole] : []);
  const userRole = (lsUser?.role ?? '').toString().toLowerCase().trim() as UserRole;
  if (rolesToCheck.length > 0 && lsUser && !rolesToCheck.includes(userRole)) {
    // Redirect to appropriate dashboard based on user role
    const roleDashboardMap: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      student: '/student/dashboard',
      instructor: '/instructor/dashboard',
      buyer: '/buyer/dashboard',
      dealer: '/dealer/dashboard',
      seller: '/seller/dashboard',
      university: '/university/dashboard',
      visa_officer: '/visa/dashboard',
      advertiser: '/advertiser/dashboard',
    };

    const redirectPath = roleDashboardMap[userRole] || '/';
    console.log(`⚠️ User role '${lsUser.role}' (normalized: '${userRole}') not allowed. Redirecting to: ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // Check permissions (if needed)
  if (requiredPermissions.length > 0 && lsUser) {
    const hasPermission = requiredPermissions.every(permission => {
      // This would typically check against a permissions matrix
      // For now, we'll implement basic role-based checks
      
      const permissions: Record<UserRole, string[]> = {
        admin: ['*'], // Admin has all permissions
        instructor: ['courses:read', 'courses:write', 'students:read'],
        student: ['courses:read', 'profile:write'],
        buyer: ['cars:read', 'profile:write'],
        dealer: ['cars:read', 'cars:write', 'profile:write'],
        seller: ['cars:read', 'cars:write', 'profile:write'],
        university: ['courses:read', 'students:read'],
        visa_officer: ['visa:read', 'visa:write'],
        advertiser: ['ads:read', 'ads:write'],
      };

      const userPermissions = permissions[userRole] || [];
      return userPermissions.includes('*') || userPermissions.includes(permission);
    });

    if (!hasPermission) {
      // Redirect to user's own dashboard if they don't have permission
      const roleDashboardMap: Record<UserRole, string> = {
        admin: '/admin/dashboard',
        student: '/student/dashboard',
        instructor: '/instructor/dashboard',
        buyer: '/buyer/dashboard',
        dealer: '/dealer/dashboard',
        seller: '/seller/dashboard',
        university: '/university/dashboard',
        visa_officer: '/visa/dashboard',
        advertiser: '/advertiser/dashboard',
      };
      const redirectPath = roleDashboardMap[userRole] || '/';
      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and has required role/permissions
  return <>{children}</>;
};

export default ProtectedRoute;
