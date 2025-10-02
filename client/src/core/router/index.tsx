import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '../theme/ThemeProvider';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { CssBaseline } from '@mui/material';

// Store and theme
import { store } from '../store';
import { queryClient } from '../services/api/queryClient';
import { ENV } from '../config/environment';

// Layout components
import AuthLayout from '../../shared/components/layout/AuthLayout';
import AppLayout from '../../shared/components/layout/AppLayout';
import EnhancedAdminLayout from '../../shared/components/layout/EnhancedAdminLayout';

// Auth components
import LoginPage from '../../modules/auth/pages/LoginPage';
import RegisterPage from '../../modules/auth/pages/RegisterPage';
import ForgotPasswordPage from '../../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../modules/auth/pages/ResetPasswordPage';
import SecurityQuestionsPage from '../../modules/auth/pages/SecurityQuestionsPage';

// Main pages
import LandingPage from '../../modules/landing/pages/LandingPage';
import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
import ProfilePage from '../../modules/profile/pages/ProfilePage';
import SettingsPage from '../../modules/settings/pages/SettingsPage';

// Admin pages
import AdminDashboardPage from '../../modules/admin/pages/AdminDashboardPage';
import UserManagementPage from '../../modules/admin/pages/UserManagementPage';
import ContentManagementPage from '../../modules/admin/pages/ContentManagementPage';
import SystemSettingsPage from '../../modules/admin/pages/SystemSettingsPage';
import AnalyticsPage from '../../modules/admin/pages/AnalyticsPage';

// E-commerce pages
import CarListingPage from '../../modules/ecommerce/pages/CarListingPage';
import CarDetailsPage from '../../modules/ecommerce/pages/CarDetailsPage';
import CheckoutPage from '../../modules/ecommerce/pages/CheckoutPage';

// E-learning pages
import CourseCatalogPage from '../../modules/elearning/pages/CourseCatalogPage';
import CourseDetailsPage from '../../modules/elearning/pages/CourseDetailsPage';
import MyCoursesPage from '../../modules/elearning/pages/MyCoursesPage';

// Protected route component
import ProtectedRoute from './ProtectedRoute';

// Navigation component
import NavigationMenu from '../../shared/components/navigation/NavigationMenu';

// Error page
import ErrorPage from '../../shared/components/ui/ErrorPage';

// Create router
const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/navigation',
    element: <NavigationMenu />,
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
  
  // Main app routes (protected)
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'navigation',
        element: <NavigationMenu />,
      },
      
      // E-commerce routes
      {
        path: 'cars',
        children: [
          {
            index: true,
            element: <CarListingPage />,
          },
          {
            path: ':id',
            element: <CarDetailsPage />,
          },
        ],
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      
      // E-learning routes
      {
        path: 'courses',
        children: [
          {
            index: true,
            element: <CourseCatalogPage />,
          },
          {
            path: 'my-courses',
            element: <MyCoursesPage />,
          },
          {
            path: ':id',
            element: <CourseDetailsPage />,
          },
        ],
      },
    ],
  },
  
  // Admin routes (protected with admin role)
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <EnhancedAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      // User Management Routes
      {
        path: 'users',
        children: [
          {
            index: true,
            element: <UserManagementPage />,
          },
          {
            path: 'roles',
            element: <UserManagementPage />,
          },
          {
            path: 'analytics',
            element: <UserManagementPage />,
          },
        ],
      },
      // Content Management Routes
      {
        path: 'content',
        children: [
          {
            index: true,
            element: <ContentManagementPage />,
          },
          {
            path: 'courses',
            element: <ContentManagementPage />,
          },
          {
            path: 'cars',
            element: <ContentManagementPage />,
          },
          {
            path: 'scholarships',
            element: <ContentManagementPage />,
          },
          {
            path: 'visa',
            element: <ContentManagementPage />,
          },
        ],
      },
      // Analytics Routes
      {
        path: 'analytics',
        children: [
          {
            index: true,
            element: <AnalyticsPage />,
          },
          {
            path: 'revenue',
            element: <AnalyticsPage />,
          },
          {
            path: 'users',
            element: <AnalyticsPage />,
          },
          {
            path: 'performance',
            element: <AnalyticsPage />,
          },
        ],
      },
      // Payment Management
      {
        path: 'payments',
        element: <AnalyticsPage />,
      },
      // AI Services Routes
      {
        path: 'ai',
        children: [
          {
            path: 'chatbot',
            element: <SystemSettingsPage />,
          },
          {
            path: 'pricing',
            element: <SystemSettingsPage />,
          },
          {
            path: 'personalization',
            element: <SystemSettingsPage />,
          },
        ],
      },
      // System Settings Routes
      {
        path: 'system',
        children: [
          {
            index: true,
            element: <SystemSettingsPage />,
          },
          {
            path: 'general',
            element: <SystemSettingsPage />,
          },
          {
            path: 'security',
            element: <SystemSettingsPage />,
          },
          {
            path: 'integrations',
            element: <SystemSettingsPage />,
          },
        ],
      },
    ],
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
          <RouterProvider router={router} />
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
