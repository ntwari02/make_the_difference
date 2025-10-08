import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { UserRole } from '../types';
import Loading from '../../shared/components/ui/Loading';
import { normalizeRole, getDashboardPath, getUserFromStorage } from '../utils/authUtils';

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
  fallbackPath = '/auth/login',
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);

  // Fallback to localStorage if Redux store hasn't been hydrated
  const lsUser = React.useMemo(() => {
    if (user) return user;
    return getUserFromStorage();
  }, [user]);
  const hasToken = typeof localStorage !== 'undefined' && !!localStorage.getItem('access_token');

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading fullScreen text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if ((!isAuthenticated || !lsUser) && !hasToken) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirement (normalize role to avoid case/syntax mismatches)
  const rolesToCheck = allowedRoles && allowedRoles.length > 0 ? allowedRoles : (requiredRole ? [requiredRole] : []);
  const userRole = normalizeRole(lsUser?.role ?? '') as UserRole;
  
  if (rolesToCheck.length > 0 && lsUser && !rolesToCheck.includes(userRole)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = getDashboardPath(userRole);
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
        university: ['courses:read', 'students:read'],
        visa_officer: ['visa:read', 'visa:write'],
        advertiser: ['ads:read', 'ads:write'],
      };

      const userPermissions = permissions[userRole] || [];
      return userPermissions.includes('*') || userPermissions.includes(permission);
    });

    if (!hasPermission) {
      // Redirect to user's own dashboard if they don't have permission
      const redirectPath = getDashboardPath(userRole);
      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and has required role/permissions
  return <>{children}</>;
};

export default ProtectedRoute;
