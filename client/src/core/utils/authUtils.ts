/**
 * Authentication utilities for consistent role handling
 */

export interface User {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

/**
 * Normalize role name to handle backend variations
 * @param role - Raw role from backend
 * @returns Normalized role name
 */
export const normalizeRole = (role: string | null | undefined): string => {
  if (!role) return '';
  
  const normalized = String(role).toLowerCase().trim();
  
  // Handle backend role variations
  if (normalized === 'visa') return 'visa_officer';
  if (normalized === 'provider') return 'visa_officer';
  
  return normalized;
};

/**
 * Get dashboard path for a given role
 * @param role - User role (normalized)
 * @returns Dashboard path for the role
 */
export const getDashboardPath = (role: string): string => {
  const normalizedRole = normalizeRole(role);
  
  const dashboardPaths: Record<string, string> = {
    admin: '/admin/dashboard',
    student: '/student/dashboard',
    instructor: '/instructor/dashboard',
    buyer: '/buyer/dashboard',
    dealer: '/dealer/dashboard',
    university: '/university/dashboard',
    visa_officer: '/visa/dashboard',
    advertiser: '/advertiser/dashboard',
  };

  return dashboardPaths[normalizedRole] || '/';
};

/**
 * Validate if a role is valid
 * @param role - Role to validate
 * @returns True if role is valid
 */
export const isValidRole = (role: string): boolean => {
  const validRoles = [
    'admin', 'student', 'instructor', 'buyer', 'dealer', 
    'university', 'visa_officer', 'advertiser'
  ];
  
  return validRoles.includes(normalizeRole(role));
};

/**
 * Get user data from localStorage with consistent key
 * @returns User data or null
 */
export const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem('user_data');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    
    // Validate user structure
    if (!user || !user.id || !user.email || !user.role) {
      console.warn('Invalid user data in localStorage');
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

/**
 * Clear all authentication data from storage
 */
export const clearAuthStorage = (): void => {
  // Clear all possible auth keys
  const authKeys = [
    'user_data', 'user', 'userData',
    'access_token', 'refresh_token',
    'last_login'
  ];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Also clear everything as fallback
  localStorage.clear();
  sessionStorage.clear();
};
