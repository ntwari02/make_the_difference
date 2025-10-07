import React, { ReactNode } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import StudentSidebar from './StudentSidebar';

interface StudentLayoutProps { children: ReactNode }

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const DRAWER_WIDTH = 280;
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.default' }}>
      <StudentHeader onMenuClick={() => {}} />
      {!isMobile && (
        <StudentSidebar open onClose={() => {}} drawerWidth={DRAWER_WIDTH} collapsedWidth={70} />
      )}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Box sx={{ flexGrow: 1, mt: '64px', width: '100%', pl: { xs: 2, md: 3 }, pr: { xs: 2, md: 3 }, py: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default StudentLayout;


