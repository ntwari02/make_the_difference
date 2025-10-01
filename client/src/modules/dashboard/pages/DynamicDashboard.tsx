import React from 'react';
import { useAuth } from '../../../core/hooks/useAuth';
import { Box, Typography, CircularProgress } from '@mui/material';

// Import role-based dashboards
import StudentDashboard from './role-based/StudentDashboard';
import InstructorDashboard from './role-based/InstructorDashboard';
import BuyerDashboard from './role-based/BuyerDashboard';
import SellerDashboard from './role-based/SellerDashboard';
import DealerDashboard from './role-based/DealerDashboard';
import UniversityDashboard from './role-based/UniversityDashboard';
import VisaOfficerDashboard from './role-based/VisaOfficerDashboard';
import AdvertiserDashboard from './role-based/AdvertiserDashboard';
import AdminDashboard from './role-based/AdminDashboard';

const DynamicDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading your personalized dashboard...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={2}
      >
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Please log in to access your dashboard
        </Typography>
      </Box>
    );
  }

  // Route to appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      
      case 'instructor':
        return <InstructorDashboard />;
      
      case 'buyer':
        return <BuyerDashboard />;
      
      case 'seller':
        return <SellerDashboard />;
      
      case 'dealer':
        return <DealerDashboard />;
      
      case 'university':
        return <UniversityDashboard />;
      
      case 'visa_officer':
        return <VisaOfficerDashboard />;
      
      case 'advertiser':
        return <AdvertiserDashboard />;
      
      case 'admin':
        return <AdminDashboard />;
      
      default:
        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="50vh"
            gap={2}
          >
            <Typography variant="h4" color="error">
              Unknown Role
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Your role "{user.role}" is not recognized
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please contact support for assistance
            </Typography>
          </Box>
        );
    }
  };

  return renderDashboard();
};

export default DynamicDashboard;
