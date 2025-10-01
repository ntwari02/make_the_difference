import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { UserRole } from '../types';
import Loading from '../../shared/components/ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermissions?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermissions = [],
  fallbackPath = '/auth/login',
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading fullScreen text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const roleDashboardMap: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      student: '/app/dashboard',
      instructor: '/app/dashboard',
      buyer: '/app/dashboard',
      seller: '/app/dashboard',
      dealer: '/app/dashboard',
      university: '/app/dashboard',
      visa_officer: '/app/dashboard',
      advertiser: '/app/dashboard',
    };

    const redirectPath = roleDashboardMap[user.role] || '/app/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Check permissions (if needed)
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every(permission => {
      // This would typically check against a permissions matrix
      // For now, we'll implement basic role-based checks
      
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

      const userPermissions = permissions[user.role] || [];
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
