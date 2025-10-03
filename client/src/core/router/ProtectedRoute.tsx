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
  fallbackPath = '/auth/login',
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);

  // Fallback to localStorage if Redux store hasn't been hydrated
  const lsUser = React.useMemo(() => {
    if (user) return user;
    try {
      const raw = localStorage.getItem('user') || localStorage.getItem('user_data');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
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

  // Check role requirement
  const rolesToCheck = allowedRoles && allowedRoles.length > 0 ? allowedRoles : (requiredRole ? [requiredRole] : []);
  if (rolesToCheck.length > 0 && lsUser && !rolesToCheck.includes(lsUser.role as UserRole)) {
    // Redirect to appropriate dashboard based on user role
    const roleDashboardMap: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      student: '/app/dashboard',
      instructor: '/app/dashboard',
      buyer: '/app/dashboard',
      dealer: '/app/dashboard',
      university: '/app/dashboard',
      visa_officer: '/app/dashboard',
      advertiser: '/app/dashboard',
    };

    const redirectPath = roleDashboardMap[lsUser.role as UserRole] || '/app/dashboard';
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

      const userPermissions = permissions[lsUser.role as UserRole] || [];
      return userPermissions.includes('*') || userPermissions.includes(permission);
    });

    if (!hasPermission) {
      return <Navigate to="/app/dashboard" replace />;
    }
  }

  // User is authenticated and has required role/permissions
  return <>{children}</>;
};

export default ProtectedRoute;
