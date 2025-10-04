import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Button, Avatar, IconButton } from '@mui/material';
import { DirectionsCar, Person, Favorite, Settings, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SessionDebugger from '../../../../shared/components/debug/SessionDebugger';

interface BuyerLayoutProps {
  children: React.ReactNode;
}

const BuyerLayout: React.FC<BuyerLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Use the session debug approach - clear all storage
    if (window.confirm('⚠️ Are you sure you want to logout? This will clear all session data.')) {
      console.log('🚪 Logging out - clearing all storage...');
      
      // Clear all localStorage
      localStorage.clear();
      
      // Clear all sessionStorage
      sessionStorage.clear();
      
      console.log('✅ All storage cleared, redirecting to login...');
      
      // Show success message
      alert('✅ Logged out successfully! Redirecting to login...');
      
      // Redirect to login
      navigate('/auth/login');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Simple Navbar for Buyer */}
      <AppBar position="fixed" sx={{ bgcolor: '#16213e' }}>
        <Toolbar>
          <DirectionsCar sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Auto Marketplace
          </Typography>
          <Button color="inherit" onClick={() => navigate('/browse')}>
            Browse
          </Button>
          <Button color="inherit" onClick={() => navigate('/buyer/favorites')} startIcon={<Favorite />}>
            Favorites
          </Button>
          <Button color="inherit" onClick={() => navigate('/buyer/dashboard')}>
            Dashboard
          </Button>
          <IconButton color="inherit" onClick={() => navigate('/buyer/settings')}>
            <Settings />
          </IconButton>
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            title="Clear Session & Logout"
          >
            <Logout />
          </IconButton>
          <Avatar sx={{ ml: 1, bgcolor: 'primary.main', cursor: 'pointer' }} onClick={() => navigate('/buyer/profile')}>
            <Person />
          </Avatar>
        </Toolbar>
      </AppBar>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          mt: 8, // Account for fixed navbar
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
      
      {/* Session Debugger - Remove in Production */}
      {process.env.NODE_ENV === 'development' && <SessionDebugger />}
    </Box>
  );
};

export default BuyerLayout;

