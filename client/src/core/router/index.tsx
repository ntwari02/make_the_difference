 
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '../theme/ThemeProvider';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { CssBaseline, Box, Typography } from '@mui/material';

// Store and theme
import { store } from '../store';
import { queryClient } from '../services/api/queryClient';
import { ENV } from '../config/environment';

// Layout components
import AuthLayout from '../../shared/components/layout/AuthLayout';
import LoginPage from '../../modules/auth/pages/LoginPage';
import RegisterPage from '../../modules/auth/pages/RegisterPage';

// Auth components
// Removed password reset/security questions pages
// Login/Register pages removed

// Main pages
import LandingPage from '../../modules/landing/pages/LandingPage';

// Error page
import ErrorPage from '../../shared/components/ui/ErrorPage';
import SmartRedirect from '../../shared/components/ui/SmartRedirect';
import ProtectedRoute from './ProtectedRoute';
import BuyerAppLayout from '../../modules/buyer/components/layout/BuyerAppLayout';

// Dealer pages
const DealerDashboard = React.lazy(() => import('../../modules/dealer/pages/DealerDashboard')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerProfile = React.lazy(() => import('../../modules/dealer/pages/DealerProfile')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerVehicles = React.lazy(() => import('../../modules/dealer/pages/DealerVehicles')) as React.LazyExoticComponent<React.ComponentType<any>>;
const AddVehicle = React.lazy(() => import('../../modules/dealer/pages/AddVehicle')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerAnalytics = React.lazy(() => import('../../modules/dealer/pages/DealerAnalytics')) as React.LazyExoticComponent<React.ComponentType<any>>;
// Visa pages
const VisaDashboard = React.lazy(() => import('../../modules/visa/pages/VisaDashboard')) as React.LazyExoticComponent<React.ComponentType<any>>;
const VisaApplications = React.lazy(() => import('../../modules/visa/pages/VisaApplications')) as React.LazyExoticComponent<React.ComponentType<any>>;
const VisaInbox = React.lazy(() => import('../../modules/visa/pages/VisaInbox')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerMessages = React.lazy(() => import('../../modules/dealer/pages/DealerMessages')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerReviews = React.lazy(() => import('../../modules/dealer/pages/DealerReviews')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerTeam = React.lazy(() => import('../../modules/dealer/pages/DealerTeam')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerPayments = React.lazy(() => import('../../modules/dealer/pages/DealerPayments')) as React.LazyExoticComponent<React.ComponentType<any>>;
const DealerSettings = React.lazy(() => import('../../modules/dealer/pages/DealerSettings')) as React.LazyExoticComponent<React.ComponentType<any>>;

// Buyer pages
const BuyerDashboard = React.lazy(() => import('../../modules/buyer/pages/BuyerDashboard')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BrowsePage = React.lazy(() => import('../../modules/buyer/pages/BrowsePage')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SparePartsBrowse = React.lazy(() => import('../../modules/buyer/pages/SparePartsBrowse')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SparePartDetails = React.lazy(() => import('../../modules/buyer/pages/SparePartDetails')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerFavorites = React.lazy(() => import('../../modules/buyer/pages/BuyerFavorites')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerMessages = React.lazy(() => import('../../modules/buyer/pages/BuyerMessages')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerProfile = React.lazy(() => import('../../modules/buyer/pages/BuyerProfile')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerSettings = React.lazy(() => import('../../modules/buyer/pages/BuyerSettings')) as React.LazyExoticComponent<React.ComponentType<any>>;

// Seller pages
const SellerDashboard = React.lazy(() => import('../../modules/seller/pages/SellerDashboard')) as React.LazyExoticComponent<React.ComponentType<any>>;
// const SellerCars = React.lazy(() => import('../../modules/seller/pages/SellerCars')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerInventory = React.lazy(() => import('../../modules/seller/pages/SellerInventory')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerAddVehicle = React.lazy(() => import('../../modules/seller/pages/SellerAddVehicle')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerCarsAdvanced = React.lazy(() => import('../../modules/seller/pages/SellerCarsAdvanced')) as React.LazyExoticComponent<React.ComponentType<any>>;
const CreateCarPage = React.lazy(() => import('../../modules/seller/pages/CreateCarPage')) as React.LazyExoticComponent<React.ComponentType<any>>;
const APITestPage = React.lazy(() => import('../../modules/seller/pages/APITestPage')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerEditCar = React.lazy(() => import('../../modules/seller/pages/SellerEditCar')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerProfile = React.lazy(() => import('../../modules/seller/pages/SellerProfile')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerAnalytics = React.lazy(() => import('../../modules/seller/pages/SellerAnalytics')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerMessages = React.lazy(() => import('../../modules/seller/pages/SellerMessages')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerReviews = React.lazy(() => import('../../modules/seller/pages/SellerReviews')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerSettings = React.lazy(() => import('../../modules/seller/pages/SellerSettings')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerSparePartsDashboard = React.lazy(() => import('../../modules/seller/pages/SellerSparePartsDashboard')) as React.LazyExoticComponent<React.ComponentType<any>>;
import SellerSparePartForm from '../../modules/seller/pages/SellerSparePartForm';
const SellerOrders = React.lazy(() => import('../../modules/seller/pages/SellerOrders')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerSparePartsAnalytics = React.lazy(() => import('../../modules/seller/pages/SellerSparePartsAnalytics')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerSparePartsBundles = React.lazy(() => import('../../modules/seller/pages/SellerSparePartsBundles')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerSparePartsPriceComparison = React.lazy(() => import('../../modules/seller/pages/SellerSparePartsPriceComparison')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerSparePartsInventory = React.lazy(() => import('../../modules/seller/pages/SellerSparePartsInventory')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerSparePartsExport = React.lazy(() => import('../../modules/seller/pages/SellerSparePartsExport')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerCarsAnalytics = React.lazy(() => import('../../modules/seller/pages/SellerCarsAnalytics')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerCarsBundles = React.lazy(() => import('../../modules/seller/pages/SellerCarsBundles')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerCarsPriceComparison = React.lazy(() => import('../../modules/seller/pages/SellerCarsPriceComparison')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerCarsInventory = React.lazy(() => import('../../modules/seller/pages/SellerCarsInventory')) as React.LazyExoticComponent<React.ComponentType<any>>;
const SellerCarsExport = React.lazy(() => import('../../modules/seller/pages/SellerCarsExport')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerAIChat = React.lazy(() => import('../../modules/buyer/pages/BuyerAIChat')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerPayments = React.lazy(() => import('../../modules/buyer/pages/BuyerPayments')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerInvoice = React.lazy(() => import('../../modules/buyer/pages/BuyerInvoice')) as React.LazyExoticComponent<React.ComponentType<any>>;
const BuyerOrders = React.lazy(() => import('../../modules/buyer/pages/BuyerOrders')) as React.LazyExoticComponent<React.ComponentType<any>>;
const Cart = React.lazy(() => import('../../modules/buyer/pages/Cart')) as React.LazyExoticComponent<React.ComponentType<any>>;
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

// Admin pages
const AdminDashboard = React.lazy(() => import('../../modules/admin/pages/AdminDashboard'));

const InstructorLiveClasses = React.lazy(() => import('../../modules/instructor/pages/InstructorLiveClasses'));
const InstructorScheduler = React.lazy(() => import('../../modules/instructor/pages/InstructorScheduler'));
const InstructorLearners = React.lazy(() => import('../../modules/instructor/pages/InstructorLearners'));
const InstructorAttendance = React.lazy(() => import('../../modules/instructor/pages/InstructorAttendance'));
const InstructorCertificates = React.lazy(() => import('../../modules/instructor/pages/InstructorCertificates'));
const InstructorAIAssistant = React.lazy(() => import('../../modules/instructor/pages/InstructorAIAssistant'));

// Debug page (temporary)
const DebugAuth = React.lazy(() => import('../../modules/auth/pages/DebugAuth')) as React.LazyExoticComponent<React.ComponentType<any>>;

// Optimized loading fallback with better UX
const Fallback: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: 2,
    }}
  >
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
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
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  // Keep remaining auth utilities under /auth
  // Removed /auth password reset routes (forgot/reset/security-questions)
  // Public browse route
  {
    path: '/browse',
    element: (
      <React.Suspense fallback={<Fallback />}>
        <BrowsePage />
      </React.Suspense>
    ),
  },
  {
    path: '/spare-parts',
    element: (
      <React.Suspense fallback={<Fallback />}>
        <SparePartsBrowse />
      </React.Suspense>
    ),
  },
  // Public spare parts details
  {
    path: '/spare-parts/:id',
    element: (
      <React.Suspense fallback={<Fallback />}>
        <SparePartDetails />
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
  // Visa officer routes (protected)
  {
    path: '/visa/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['visa_officer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <VisaDashboard />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  // Admin routes (protected)
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <React.Suspense fallback={<Fallback />}>
          <AdminDashboard />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/analytics',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <React.Suspense fallback={<Fallback />}>
          {React.createElement(React.lazy(() => import('../../modules/admin/pages/AdminAnalytics')))}
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <React.Suspense fallback={<Fallback />}>
          {React.createElement(React.lazy(() => import('../../modules/admin/pages/AdminUsers')))}
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/settings',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <React.Suspense fallback={<Fallback />}>
          {React.createElement(React.lazy(() => import('../../modules/admin/pages/AdminSettings')))}
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/moderation',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <React.Suspense fallback={<Fallback />}>
          {React.createElement(React.lazy(() => import('../../modules/admin/pages/AdminModeration')))}
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/audit',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <React.Suspense fallback={<Fallback />}>
          {React.createElement(React.lazy(() => import('../../modules/admin/pages/AdminAudit')))}
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/visa/applications',
    element: (
      <ProtectedRoute allowedRoles={['visa_officer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <VisaApplications />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/visa/inbox',
    element: (
      <ProtectedRoute allowedRoles={['visa_officer','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <VisaInbox />
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

  // Buyer routes (nested under persistent Buyer layout)
  {
    path: '/buyer',
    element: (
      <ProtectedRoute allowedRoles={['buyer','admin']}>
        <BuyerAppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <React.Suspense fallback={<Fallback />}>
            <BuyerDashboard />
          </React.Suspense>
        ),
      },
      {
        path: 'favorites',
        element: (
          <React.Suspense fallback={<Fallback />}>
            <BuyerFavorites />
          </React.Suspense>
        ),
      },
      {
        path: 'cart',
        element: (
          <React.Suspense fallback={<Fallback />}>
            <Cart />
          </React.Suspense>
        ),
      },
      {
        path: 'messages',
        element: (
          <React.Suspense fallback={<Fallback />}>
            <BuyerMessages />
          </React.Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <React.Suspense fallback={<Fallback />}>
            <BuyerProfile />
          </React.Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <React.Suspense fallback={<Fallback />}>
            <BuyerSettings />
          </React.Suspense>
        ),
      },
      {
        path: 'payments',
        element: (
          <React.Suspense fallback={<Fallback />}>
            <BuyerPayments />
          </React.Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <React.Suspense fallback={<Fallback />}>
            <BuyerOrders />
          </React.Suspense>
        ),
      },
      {
        path: 'invoice/:orderId',
        element: (
          <React.Suspense fallback={<Fallback />}>
            <BuyerInvoice />
          </React.Suspense>
        ),
      },
    ],
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
          <CreateCarPage />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/api-test',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <APITestPage />
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
  {
    path: '/seller/spare-parts',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerSparePartsDashboard />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/spare-parts/add',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <SellerSparePartForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/spare-parts/:id/edit',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <SellerSparePartForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/spare-parts/analytics',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerSparePartsAnalytics />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/spare-parts/bundles',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerSparePartsBundles />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/spare-parts/price-comparison',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerSparePartsPriceComparison />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/spare-parts/inventory',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerSparePartsInventory />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/spare-parts/export',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerSparePartsExport />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/orders',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerOrders />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },

  // Car Management Routes
  {
    path: '/seller/cars/analytics',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerCarsAnalytics />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/cars/bundles',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerCarsBundles />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/cars/price-comparison',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerCarsPriceComparison />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/cars/inventory',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerCarsInventory />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/cars/export',
    element: (
      <ProtectedRoute allowedRoles={['seller','admin']}>
        <React.Suspense fallback={<Fallback />}>
          <SellerCarsExport />
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
    element: <SmartRedirect />,
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