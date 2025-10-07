import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '../theme/ThemeProvider';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { CssBaseline, Box } from '@mui/material';

// Store and theme
import { store } from '../store';
import { queryClient } from '../services/api/queryClient';
import { ENV } from '../config/environment';

// Layout components
import AuthLayout from '../../shared/components/layout/AuthLayout';

// Auth components
import LoginPage from '../../modules/auth/pages/LoginPage';
import RegisterPage from '../../modules/auth/pages/RegisterPage';
import ForgotPasswordPage from '../../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../modules/auth/pages/ResetPasswordPage';
import SecurityQuestionsPage from '../../modules/auth/pages/SecurityQuestionsPage';

// Main pages
import LandingPage from '../../modules/landing/pages/LandingPage';

// Error page
import ErrorPage from '../../shared/components/ui/ErrorPage';
import ProtectedRoute from './ProtectedRoute';

// Dealer pages
const DealerDashboard = React.lazy(() => import('../../modules/dealer/pages/DealerDashboard'));
const DealerProfile = React.lazy(() => import('../../modules/dealer/pages/DealerProfile'));
const DealerVehicles = React.lazy(() => import('../../modules/dealer/pages/DealerVehicles'));
const AddVehicle = React.lazy(() => import('../../modules/dealer/pages/AddVehicle'));
const DealerAnalytics = React.lazy(() => import('../../modules/dealer/pages/DealerAnalytics'));
const DealerMessages = React.lazy(() => import('../../modules/dealer/pages/DealerMessages'));
const DealerReviews = React.lazy(() => import('../../modules/dealer/pages/DealerReviews'));
const DealerTeam = React.lazy(() => import('../../modules/dealer/pages/DealerTeam'));
const DealerPayments = React.lazy(() => import('../../modules/dealer/pages/DealerPayments'));
const DealerSettings = React.lazy(() => import('../../modules/dealer/pages/DealerSettings'));

// Buyer pages
const BuyerDashboard = React.lazy(() => import('../../modules/buyer/pages/BuyerDashboard'));
const BrowsePage = React.lazy(() => import('../../modules/buyer/pages/BrowsePage'));
const BuyerFavorites = React.lazy(() => import('../../modules/buyer/pages/BuyerFavorites'));
const BuyerMessages = React.lazy(() => import('../../modules/buyer/pages/BuyerMessages'));
const BuyerProfile = React.lazy(() => import('../../modules/buyer/pages/BuyerProfile'));
const BuyerSettings = React.lazy(() => import('../../modules/buyer/pages/BuyerSettings'));
const BuyerAIChat = React.lazy(() => import('../../modules/buyer/pages/BuyerAIChat'));
const BuyerPayments = React.lazy(() => import('../../modules/buyer/pages/BuyerPayments'));

// Instructor pages
const InstructorDashboard = React.lazy(() => import('../../modules/instructor/pages/InstructorDashboard'));
const InstructorCourses = React.lazy(() => import('../../modules/instructor/pages/InstructorCourses'));
const InstructorStudents = React.lazy(() => import('../../modules/instructor/pages/InstructorStudents'));
const InstructorEarnings = React.lazy(() => import('../../modules/instructor/pages/InstructorEarnings'));
const InstructorMessages = React.lazy(() => import('../../modules/instructor/pages/InstructorMessages'));
const InstructorSettings = React.lazy(() => import('../../modules/instructor/pages/InstructorSettings'));
const InstructorProfile = React.lazy(() => import('../../modules/instructor/pages/InstructorProfile'));
// University pages
const UniversityDashboard = React.lazy(() => import('../../modules/university/pages/UniversityDashboard'));
const UniversityScholarships = React.lazy(() => import('../../modules/university/pages/UniversityScholarships'));
const UniversityApplications = React.lazy(() => import('../../modules/university/pages/UniversityApplications'));
const UniversityCreateScholarship = React.lazy(() => import('../../modules/university/pages/UniversityCreateScholarship'));
const UniversityAIAssistant = React.lazy(() => import('../../modules/university/pages/UniversityAIAssistant'));
const UniversityAnalytics = React.lazy(() => import('../../modules/university/pages/UniversityAnalytics'));
const UniversitySettings = React.lazy(() => import('../../modules/university/pages/UniversitySettings'));
const UniversityProfile = React.lazy(() => import('../../modules/university/pages/UniversityProfile'));

const InstructorLiveClasses = React.lazy(() => import('../../modules/instructor/pages/InstructorLiveClasses'));
const InstructorScheduler = React.lazy(() => import('../../modules/instructor/pages/InstructorScheduler'));
const InstructorLearners = React.lazy(() => import('../../modules/instructor/pages/InstructorLearners'));
const InstructorAttendance = React.lazy(() => import('../../modules/instructor/pages/InstructorAttendance'));
const InstructorCertificates = React.lazy(() => import('../../modules/instructor/pages/InstructorCertificates'));
const InstructorAIAssistant = React.lazy(() => import('../../modules/instructor/pages/InstructorAIAssistant'));

// Debug page (temporary)
const DebugAuth = React.lazy(() => import('../../modules/auth/pages/DebugAuth'));

const Fallback: React.FC = () => (
  <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: '#64748b' }}>Loading…</div>
);

// Create router
const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  
  // Auth routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password/:token',
        element: <ResetPasswordPage />,
      },
      {
        path: 'security-questions',
        element: <SecurityQuestionsPage />,
      },
    ],
  },
  // Public browse route
  {
    path: '/browse',
    element: (
      <React.Suspense fallback={<Fallback />}>
        <BrowsePage />
      </React.Suspense>
    ),
  },
  // Dealer routes (protected)
  {
    path: '/dealer',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <DealerDashboard />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dealer/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <DealerDashboard />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dealer/profile',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <DealerProfile />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dealer/vehicles',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <DealerVehicles />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dealer/vehicles/add',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <AddVehicle />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dealer/analytics',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <DealerAnalytics />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dealer/messages',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <DealerMessages />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dealer/reviews',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <DealerReviews />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dealer/team',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <DealerTeam />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dealer/payments',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <DealerPayments />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dealer/settings',
    element: (
      <ProtectedRoute allowedRoles={['dealer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <DealerSettings />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },

  // Buyer routes
  {
    path: '/buyer/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['buyer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <BuyerDashboard />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },

  // Instructor routes
  {
    path: '/instructor/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorDashboard />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/courses',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorCourses />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/students',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorStudents />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/earnings',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorEarnings />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/messages',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorMessages />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/settings',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorSettings />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/profile',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorProfile />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/live',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorLiveClasses />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/scheduler',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorScheduler />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/learners',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorLearners />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/attendance',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorAttendance />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/certificates',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorCertificates />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor/ai',
    element: (
      <ProtectedRoute allowedRoles={['instructor','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <InstructorAIAssistant />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },

  // University routes
  {
    path: '/university/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['university','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <UniversityDashboard />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/university/scholarships',
    element: (
      <ProtectedRoute allowedRoles={['university','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <UniversityScholarships />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/university/scholarships/create',
    element: (
      <ProtectedRoute allowedRoles={['university','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <UniversityCreateScholarship />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/university/applications',
    element: (
      <ProtectedRoute allowedRoles={['university','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <UniversityApplications />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/university/ai',
    element: (
      <ProtectedRoute allowedRoles={['university','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <UniversityAIAssistant />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/university/analytics',
    element: (
      <ProtectedRoute allowedRoles={['university','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <UniversityAnalytics />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/university/settings',
    element: (
      <ProtectedRoute allowedRoles={['university','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <UniversitySettings />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/university/profile',
    element: (
      <ProtectedRoute allowedRoles={['university','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <UniversityProfile />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/favorites',
    element: (
      <ProtectedRoute allowedRoles={['buyer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <BuyerFavorites />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/messages',
    element: (
      <ProtectedRoute allowedRoles={['buyer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <BuyerMessages />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/profile',
    element: (
      <ProtectedRoute allowedRoles={['buyer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <BuyerProfile />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/settings',
    element: (
      <ProtectedRoute allowedRoles={['buyer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <BuyerSettings />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/ai-chat',
    element: (
      <ProtectedRoute allowedRoles={['buyer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <BuyerAIChat />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/payments',
    element: (
      <ProtectedRoute allowedRoles={['buyer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <BuyerPayments />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },

  // Debug route (temporary - remove in production)
  {
    path: '/debug/auth',
    element: (
      <React.Suspense fallback={<Fallback />}>
        <DebugAuth />
      </React.Suspense>
    ),
  },
  
  // Catch all route
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

// Main App component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CssBaseline />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <RouterProvider router={router} />
          </Box>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          {ENV.ENABLE_REACT_QUERY_DEVTOOLS && ENV.IS_DEVELOPMENT && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;