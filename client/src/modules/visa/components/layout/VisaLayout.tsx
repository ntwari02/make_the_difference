import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import VisaSidebar from './VisaSidebar';
import VisaHeader from './VisaHeader';

interface VisaLayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 280;

const VisaLayout: React.FC<VisaLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(!isMobile);

  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden', width: '100%' }}>
      {/* Header at top spanning full width */}
      <VisaHeader onMenuClick={() => setSidebarOpen((o) => !o)} />

      {/* Sidebar */}
      <VisaSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} drawerWidth={DRAWER_WIDTH} collapsedWidth={70} />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        {/* Page Content */}
        <Box sx={{ flexGrow: 1, mt: '64px', width: '100%', maxWidth: '100%', pl: { xs: 2, md: 3 }, pr: { xs: 2, md: 3 }, py: 2 }}>
          <Container maxWidth="xl">
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default VisaLayout;


