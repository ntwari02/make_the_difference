import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SmartRedirect from './shared/components/ui/SmartRedirect';

// Landing Page
import LandingPage from '../modules/landing/pages/LandingPage';

// Auth Pages
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
// Removed password reset and security question pages

// E-commerce Pages
import CarListingPage from '../modules/ecommerce/pages/CarListingPage';
import CarDetailsPage from '../modules/ecommerce/pages/CarDetailsPage';
// DealerDashboard removed
import StudentProgress from '../modules/student/pages/Progress';
import StudentMessages from '../modules/student/pages/Messages';
import StudentSettings from '../modules/student/pages/Settings';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Removed forgot/reset/security-questions routes */}

        {/* E-commerce Routes */}
        <Route path="/cars" element={<CarListingPage />} />
        <Route path="/cars/:id" element={<CarDetailsPage />} />
        
        {/* Dealer Dashboard removed */}

        {/* Student Progress (fallback router) */}
        <Route path="/student/progress" element={<StudentProgress />} />
        <Route path="/student/messages" element={<StudentMessages />} />
        <Route path="/student/settings" element={<StudentSettings />} />

        {/* Catch all - smart redirect */}
        <Route path="*" element={<SmartRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

