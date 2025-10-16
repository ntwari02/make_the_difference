import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
 
import SessionDebugger from '../../../../shared/components/debug/SessionDebugger';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';

interface BuyerLayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 70;

const BuyerLayout: React.FC<BuyerLayoutProps> = ({ children }) => {
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  

  // Local UI state for sidebar open/close (initialize closed to avoid mobile backdrop on first paint)
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden', width: '100%' }}>
      {/* Sidebar */}
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} drawerWidth={DRAWER_WIDTH} collapsedWidth={COLLAPSED_DRAWER_WIDTH} />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        {/* Header */}
        <BuyerHeader onMenuClick={() => setSidebarOpen((o) => !o)} />

        {/* Page Content */}
        <Box sx={{ flexGrow: 1, mt: '64px', width: '100%', maxWidth: '100%', pl: 2, pr: 3, py: 2 }}>
          <Container maxWidth="xl">
            {children}
          </Container>
        </Box>
      </Box>

      {/* Session Debugger - Remove in Production */}
      {process.env.NODE_ENV === 'development' && <SessionDebugger />}
    </Box>
  );
};

export default BuyerLayout;

