import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Landing Page
import LandingPage from '../modules/landing/pages/LandingPage';

// Auth Pages
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import ForgotPasswordPage from '../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../modules/auth/pages/ResetPasswordPage';
import SecurityQuestionsPage from '../modules/auth/pages/SecurityQuestionsPage';

// E-commerce Pages
import CarListingPage from '../modules/ecommerce/pages/CarListingPage';
import CarDetailsPage from '../modules/ecommerce/pages/CarDetailsPage';
import DealerDashboard from '../modules/ecommerce/pages/DealerDashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/security-questions" element={<SecurityQuestionsPage />} />

        {/* E-commerce Routes */}
        <Route path="/cars" element={<CarListingPage />} />
        <Route path="/cars/:id" element={<CarDetailsPage />} />
        
        {/* Dealer Dashboard */}
        <Route path="/dealer/dashboard" element={<DealerDashboard />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

