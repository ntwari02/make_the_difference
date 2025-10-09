import React from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps { children: React.ReactNode }

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 70;

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(!isMobile);

  React.useEffect(() => { setSidebarOpen(!isMobile); }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden', width: '100%', flexDirection: 'column' }}>
      <AdminHeader onMenuClick={() => setSidebarOpen((o) => !o)} />
      <Box sx={{ display: 'flex', flex: 1, width: '100%', mt: '64px' }}>
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} drawerWidth={DRAWER_WIDTH} collapsedWidth={COLLAPSED_DRAWER_WIDTH} topOffset={64} />
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', width: '100%' }}>
          <Box sx={{ flexGrow: 1, width: '100%', maxWidth: '100%', pl: 3, pr: 3, py: 2 }}>
            <Container maxWidth={false} disableGutters>
              {children}
            </Container>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;



