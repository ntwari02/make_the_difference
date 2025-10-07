import React, { ReactNode } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';
import SessionDebugger from '../../../../shared/components/debug/SessionDebugger';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../../core/store';
import { setSidebarOpen } from '../../store/sellerSlice';

interface SellerLayoutProps {
  children: ReactNode;
}

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 70;

const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();

  const sidebarOpen = useSelector((state: RootState) => state.seller.sidebarOpen);

  const handleDrawerToggle = () => {
    dispatch(setSidebarOpen(!sidebarOpen));
  };

  // Close sidebar on mobile by default
  React.useEffect(() => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  }, [isMobile, dispatch]);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        // Distinct seller workspace background feel
        bgcolor: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #0f172a 0%, #111827 60%, #0b1220 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f3f4f6 60%, #eef2ff 100%)',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Header at top spanning full width */}
      <SellerHeader onMenuClick={handleDrawerToggle} />

      {/* Sidebar */}
      <SellerSidebar
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        drawerWidth={DRAWER_WIDTH}
        collapsedWidth={COLLAPSED_DRAWER_WIDTH}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          // subtle content container styling distinct from dealer
          backdropFilter: 'saturate(120%)',
        }}
      >
        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            mt: '64px', // Header height
            width: '100%',
            maxWidth: '100%',
            // Add inner spacing so content isn't flush against the sidebar
            pl: { xs: 2, md: 3 },
            pr: { xs: 2, md: 3 },
            py: 2,
            // content card-like feel
            '& > *': {
              // ensure inner cards pop against the gradient
              boxShadow: (theme) => theme.palette.mode === 'dark' ? undefined : undefined,
            },
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Session Debugger - Remove in Production */}
      {process.env.NODE_ENV === 'development' && <SessionDebugger />}
    </Box>
  );
};

export default SellerLayout;
