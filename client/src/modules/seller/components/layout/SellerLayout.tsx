import React, { ReactNode } from 'react';
import { Box, useTheme, useMediaQuery, Typography } from '@mui/material';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';
import SessionDebugger from '../../../../shared/components/debug/SessionDebugger';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../../core/store';
import { setSidebarOpen } from '../../store/sellerSlice';

interface SellerLayoutProps {
  children?: ReactNode;
}

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 70;

const SellerLayout: React.FC<SellerLayoutProps> = (props) => {
  console.log('SellerLayout props:', props);
  const { children } = props || {};
  console.log('SellerLayout children:', children);
  
  // Check if we're in a React context
  if (typeof React.useContext === 'undefined') {
    console.error('React context is not available');
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          React Context Error
        </Typography>
        <Typography variant="body2" color="text.secondary">
          React context is not available
        </Typography>
      </Box>
    );
  }
  
  try {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const dispatch = useDispatch();
    const sidebarOpen = useSelector((state: RootState) => state.seller.sidebarOpen);

    // Debug logging
    console.log('SellerLayout rendered with children:', children);

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
        flexDirection: 'column',
        minHeight: '100vh',
        // Distinct seller workspace background feel
        bgcolor: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #0f172a 0%, #111827 60%, #0b1220 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f3f4f6 60%, #eef2ff 100%)',
        overflow: { xs: 'auto', md: 'hidden' },
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Header at top spanning full width */}
      <SellerHeader onMenuClick={handleDrawerToggle} />

      {/* Main Content Area */}
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          position: 'relative',
          minHeight: 0, // Allow flex shrinking
        }}
      >
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
            minHeight: '100%',
            width: '100%',
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            // subtle content container styling distinct from dealer
            backdropFilter: 'saturate(120%)',
            overflow: 'auto', // Allow scrolling on mobile
          }}
        >
          {/* Page Content */}
          <Box
            sx={{
              flexGrow: 1,
              width: '100%',
              maxWidth: '100%',
              // Add inner spacing so content isn't flush against the sidebar
              pl: { xs: 1, sm: 2, md: 3 },
              pr: { xs: 1, sm: 2, md: 3 },
              py: { xs: 1, sm: 2 },
              // content card-like feel
              '& > *': {
                // ensure inner cards pop against the gradient
                boxShadow: (theme) => theme.palette.mode === 'dark' ? undefined : undefined,
              },
            }}
          >
            {children || (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No content to display
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Session Debugger - Remove in Production */}
      {process.env.NODE_ENV === 'development' && <SessionDebugger />}
    </Box>
  );
  } catch (error) {
    console.error('SellerLayout error:', error);
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Layout Error
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      </Box>
    );
  }
};

export default SellerLayout;
