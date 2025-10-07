import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  School as CoursesIcon,
  Group as StudentsIcon,
  AttachMoney as EarningsIcon,
  Mail as MessagesIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  LiveTv as LiveIcon,
  Event as ScheduleIcon,
  People as LearnersIcon,
  AssignmentTurnedIn as AttendanceIcon,
  WorkspacePremium as CertificatesIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';

interface InstructorSidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
  collapsedWidth: number;
  topOffset?: number;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/instructor/dashboard', icon: <DashboardIcon /> },
  { label: 'Courses', path: '/instructor/courses', icon: <CoursesIcon /> },
  { label: 'Students', path: '/instructor/students', icon: <StudentsIcon /> },
  { label: 'Earnings', path: '/instructor/earnings', icon: <EarningsIcon /> },
  { label: 'Messages', path: '/instructor/messages', icon: <MessagesIcon /> },
  { label: 'Live Classes', path: '/instructor/live', icon: <LiveIcon /> },
  { label: 'Scheduler', path: '/instructor/scheduler', icon: <ScheduleIcon /> },
  { label: 'Learners', path: '/instructor/learners', icon: <LearnersIcon /> },
  { label: 'Attendance', path: '/instructor/attendance', icon: <AttendanceIcon /> },
  { label: 'Certificates', path: '/instructor/certificates', icon: <CertificatesIcon /> },
  { label: 'AI Assistant', path: '/instructor/ai', icon: <AIIcon /> },
  { label: 'Settings', path: '/instructor/settings', icon: <SettingsIcon /> },
  { label: 'Profile', path: '/instructor/profile', icon: <ProfileIcon /> },
];

const InstructorSidebar: React.FC<InstructorSidebarProps> = ({ open, onClose, drawerWidth, collapsedWidth, topOffset = 0 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleNavigate(item.path)}
            sx={{
              px: open ? 2 : 1.5,
              justifyContent: open ? 'flex-start' : 'center',
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
            {open && <ListItemText primary={item.label} />}
          </ListItemButton>
        ))}
      </List>
      {open && (
        <>
          <Divider sx={{ mt: 'auto' }} />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">© 2025 Instructor Portal</Typography>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: theme.palette.mode === 'dark' ? '#16213e' : theme.palette.background.paper,
              borderRight: theme.palette.mode === 'dark'
                ? `1px solid rgba(255, 255, 255, 0.1)`
                : `1px solid ${theme.palette.divider}`,
              top: topOffset,
              height: `calc(100% - ${topOffset}px)`,
              overflow: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            width: open ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : collapsedWidth,
              boxSizing: 'border-box',
              bgcolor: theme.palette.mode === 'dark' ? '#16213e' : theme.palette.background.paper,
              borderRight: theme.palette.mode === 'dark'
                ? `1px solid rgba(255, 255, 255, 0.1)`
                : `1px solid ${theme.palette.divider}`,
              overflowX: 'hidden',
              overflowY: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              top: topOffset,
              height: `calc(100% - ${topOffset}px)`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default InstructorSidebar;


