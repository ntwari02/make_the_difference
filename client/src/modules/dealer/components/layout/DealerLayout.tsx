import React, { ReactNode } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import DealerSidebar from './DealerSidebar';
import DealerHeader from './DealerHeader';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../../core/store';
import { setSidebarOpen } from '../../store/dealerSlice';

interface DealerLayoutProps {
  children: ReactNode;
}

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 70;

const DealerLayout: React.FC<DealerLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  
  const sidebarOpen = useSelector((state: RootState) => state.dealer.sidebarOpen);

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
        bgcolor: 'background.default',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Sidebar */}
      <DealerSidebar
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
        }}
      >
        {/* Header */}
        <DealerHeader onMenuClick={handleDrawerToggle} />

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            mt: '64px', // Header height
            width: '100%',
            maxWidth: '100%',
            pl: 2,
            pr: 3,
            py: 2,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DealerLayout;

