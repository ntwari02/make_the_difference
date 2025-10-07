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
const DealerDashboard = React.lazy(() => import('../../modules/dealer/pages/DealerDashboard')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerProfile = React.lazy(() => import('../../modules/dealer/pages/DealerProfile')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerVehicles = React.lazy(() => import('../../modules/dealer/pages/DealerVehicles')) as React.LazyExoticComponent<React.ComponentType<any>>;
const AddVehicle = React.lazy(() => import('../../modules/dealer/pages/AddVehicle')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerAnalytics = React.lazy(() => import('../../modules/dealer/pages/DealerAnalytics')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerMessages = React.lazy(() => import('../../modules/dealer/pages/DealerMessages')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerReviews = React.lazy(() => import('../../modules/dealer/pages/DealerReviews')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerTeam = React.lazy(() => import('../../modules/dealer/pages/DealerTeam')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerPayments = React.lazy(() => import('../../modules/dealer/pages/DealerPayments')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerSettings = React.lazy(() => import('../../modules/dealer/pages/DealerSettings')) as React.LazyExoticComponent<React.ComponentType<any>>;

// Buyer pages
const BuyerDashboard = React.lazy(() => import('../../modules/buyer/pages/BuyerDashboard')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BrowsePage = React.lazy(() => import('../../modules/buyer/pages/BrowsePage')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerFavorites = React.lazy(() => import('../../modules/buyer/pages/BuyerFavorites')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerMessages = React.lazy(() => import('../../modules/buyer/pages/BuyerMessages')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerProfile = React.lazy(() => import('../../modules/buyer/pages/BuyerProfile')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerSettings = React.lazy(() => import('../../modules/buyer/pages/BuyerSettings')) as React.LazyExoticComponent<React.ComponentType<any>>;

// Seller pages
const SellerDashboard = React.lazy(() => import('../../modules/seller/pages/SellerDashboard')) as React.LazyExoticComponent<React.ComponentType<any>>;
// const SellerCars = React.lazy(() => import('../../modules/seller/pages/SellerCars')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerInventory = React.lazy(() => import('../../modules/seller/pages/SellerInventory')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerAddCar = React.lazy(() => import('../../modules/seller/pages/SellerAddCar')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerEditCar = React.lazy(() => import('../../modules/seller/pages/SellerEditCar')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerProfile = React.lazy(() => import('../../modules/seller/pages/SellerProfile')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerAnalytics = React.lazy(() => import('../../modules/seller/pages/SellerAnalytics')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerMessages = React.lazy(() => import('../../modules/seller/pages/SellerMessages')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerReviews = React.lazy(() => import('../../modules/seller/pages/SellerReviews')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerPayments = React.lazy(() => import('../../modules/seller/pages/SellerPayments')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerSettings = React.lazy(() => import('../../modules/seller/pages/SellerSettings')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerAIChat = React.lazy(() => import('../../modules/buyer/pages/BuyerAIChat')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerPayments = React.lazy(() => import('../../modules/buyer/pages/BuyerPayments')) as React.LazyExoticComponent<React.ComponentType<any>>;
const CarDetails = React.lazy(() => import('../../modules/buyer/pages/CarDetails')) as React.LazyExoticComponent<React.ComponentType<any>>;
// Student pages (static imports to avoid dynamic import issues during dev)
import StudentDashboard from '../../modules/student/pages/StudentDashboard';
import StudentMyCourses from '../../modules/student/pages/MyCourses';
import StudentFavorites from '../../modules/student/pages/Favorites';
import StudentCourseDetail from '../../modules/student/pages/CourseDetail';
import LessonViewer from '../../modules/student/pages/LessonViewer';
import StudentLiveClasses from '../../modules/student/pages/LiveClasses';
import StudentPayments from '../../modules/student/pages/Payments';
import StudentCertificates from '../../modules/student/pages/Certificates';
import StudentSubscriptions from '../../modules/student/pages/Subscriptions';
import CertificateDetail from '../../modules/student/pages/CertificateDetail';
import LiveClassDetail from '../../modules/student/pages/LiveClassDetail';
import StudentProgress from '../../modules/student/pages/Progress';
import StudentMessages from '../../modules/student/pages/Messages';
import StudentSettings from '../../modules/student/pages/Settings';

// Debug page (temporary)
const DebugAuth = React.lazy(() => import('../../modules/auth/pages/DebugAuth')) as React.LazyExoticComponent<React.ComponentType<any>>;

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
  {
    path: '/student/live-classes/:id',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <LiveClassDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/certificates/:id',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <CertificateDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/progress',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <StudentProgress />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/messages',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <StudentMessages />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/settings',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <StudentSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/subscriptions',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <StudentSubscriptions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/live-classes',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <StudentLiveClasses />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/payments',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <StudentPayments />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/certificates',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <StudentCertificates />
      </ProtectedRoute>
    ),
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
  // Public car details
  {
    path: '/cars/:id',
    element: (
      <React.Suspense fallback={<Fallback />}>
        <CarDetails />
      </React.Suspense>
    ),
  },
  // Student routes
  {
    path: '/student/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/courses',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <StudentMyCourses />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/favorites',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <StudentFavorites />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/courses/:id',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <StudentCourseDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/courses/:id/lessons/:lessonId',
    element: (
      <ProtectedRoute allowedRoles={['student','admin','instructor']}>
        <LessonViewer />
      </ProtectedRoute>
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

  // Seller routes
  {
    path: '/seller/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerDashboard />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/cars',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerInventory />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/cars/add',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerAddCar />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/cars/:id/edit',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerEditCar />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/analytics',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerAnalytics />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/messages',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerMessages />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/reviews',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerReviews />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/payments',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerPayments />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/profile',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerProfile />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/settings',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerSettings />
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