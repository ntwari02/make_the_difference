import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dashboard, School, Assignment, AddCircle, Assessment, Settings, Person, SmartToy, Archive } from '@mui/icons-material';

const drawerWidth = 240;

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/university/dashboard', icon: <Dashboard /> },
  { label: 'Scholarships', path: '/university/scholarships', icon: <School /> },
  { label: 'Inactive Scholarships', path: '/university/scholarships?tab=inactive', icon: <Archive /> },
  { label: 'Applications', path: '/university/applications', icon: <Assignment /> },
  { label: 'Create Scholarship', path: '/university/scholarships/create', icon: <AddCircle /> },
  { label: 'Analytics', path: '/university/analytics', icon: <Assessment /> },
  { label: 'AI Assistant', path: '/university/ai', icon: <SmartToy /> },
  { label: 'Settings', path: '/university/settings', icon: <Settings /> },
  { label: 'Profile', path: '/university/profile', icon: <Person /> },
];

const UniversitySidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItemButton key={item.path} selected={location.pathname === item.path} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default UniversitySidebar;



