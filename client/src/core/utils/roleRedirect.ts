import { NavigateFunction } from 'react-router-dom';

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
  console.log('🎯 Navigation function:', typeof navigate);
  
  if (!user) {
    console.log('⚠️ No user provided, redirecting to home');
    navigate('/');
    return;
  }

  let role = String(user.role ?? '').toLowerCase().trim();
  // Normalize common aliases from backend
  if (role === 'visa') role = 'visa_officer';
  if (role === 'provider') role = 'visa_officer';
  console.log('👤 User role detected (normalized):', role);
  console.log('🔍 Full user object:', JSON.stringify(user, null, 2));
  console.log('📍 Current URL:', window.location.href);

  // Validate role first
  const validRoles = ['admin', 'student', 'instructor', 'buyer', 'dealer', 'university', 'visa_officer', 'advertiser'];
  
  if (!validRoles.includes(role)) {
    console.error('❌ Invalid role detected:', role);
    console.log('🆘 Redirecting to home');
    navigate('/');
    return;
  }

  switch (role) {
    case 'dealer':
      console.log('🏢 DEALER ROLE DETECTED - redirecting to dealer dashboard');
      console.log('🎯 Target URL: /dealer/dashboard');
      navigate('/dealer/dashboard');
      console.log('✅ Navigation executed');
      break;
    case 'buyer':
      console.log('🛒 BUYER ROLE DETECTED - redirecting to buyer dashboard');
      console.log('🎯 Target URL: /buyer/dashboard');
      navigate('/buyer/dashboard');
      console.log('✅ Navigation executed');
      break;
    case 'admin':
      console.log('👨‍💼 ADMIN ROLE DETECTED - redirecting to admin dashboard');
      console.log('🎯 Target URL: /admin/dashboard');
      navigate('/admin/dashboard');
      console.log('✅ Navigation executed');
      break;
    case 'student':
      console.log('📚 STUDENT ROLE DETECTED - redirecting to student dashboard');
      console.log('🎯 Target URL: /student/dashboard');
      navigate('/student/dashboard');
      console.log('✅ Navigation executed');
      break;
    case 'instructor':
      console.log('👨‍🏫 INSTRUCTOR ROLE DETECTED - redirecting to instructor dashboard');
      console.log('🎯 Target URL: /instructor/dashboard');
      navigate('/instructor/dashboard');
      console.log('✅ Navigation executed');
      break;
    case 'university':
      console.log('🏛️ UNIVERSITY ROLE DETECTED - redirecting to university dashboard');
      console.log('🎯 Target URL: /university/dashboard');
      navigate('/university/dashboard');
      console.log('✅ Navigation executed');
      break;
    case 'visa_officer':
      console.log('🛂 VISA OFFICER ROLE DETECTED - redirecting to visa dashboard');
      console.log('🎯 Target URL: /visa/dashboard');
      navigate('/visa/dashboard');
      console.log('✅ Navigation executed');
      break;
    case 'advertiser':
      console.log('📢 ADVERTISER ROLE DETECTED - redirecting to advertiser dashboard');
      console.log('🎯 Target URL: /advertiser/dashboard');
      navigate('/advertiser/dashboard');
      console.log('✅ Navigation executed');
      break;
    default:
      console.log('⚠️ Fallback case - redirecting to home');
      console.log('🎯 Target URL: /');
      navigate('/');
      console.log('✅ Navigation executed');
      break;
  }
};

/**
 * Get dashboard path for a given role
 * @param role - User role
 * @returns Dashboard path for the role
 */
export const getDashboardPath = (role: string): string => {
  const dashboardPaths: Record<string, string> = {
    dealer: '/dealer/dashboard',
    buyer: '/buyer/dashboard',
    admin: '/admin/dashboard',
    student: '/student/dashboard',
    instructor: '/instructor/dashboard',
    university: '/university/dashboard',
    visa_officer: '/visa/dashboard',
    advertiser: '/advertiser/dashboard',
  };

  return dashboardPaths[role] || '/';
};

