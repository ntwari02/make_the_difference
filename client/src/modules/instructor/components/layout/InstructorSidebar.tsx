import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
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

const drawerWidth = 240;

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

const InstructorSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default InstructorSidebar;


