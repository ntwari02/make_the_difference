import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dashboard, TravelExplore, Assignment, AddCircle, Assessment, Settings, Person, SmartToy } from '@mui/icons-material';

const drawerWidth = 240;

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/visa/dashboard', icon: <Dashboard /> },
  { label: 'Visa Services', path: '/visa/services', icon: <TravelExplore /> },
  { label: 'Applications', path: '/visa/applications', icon: <Assignment /> },
  { label: 'Create Service', path: '/visa/services/create', icon: <AddCircle /> },
  { label: 'Analytics', path: '/visa/analytics', icon: <Assessment /> },
  { label: 'AI Assistant', path: '/visa/ai', icon: <SmartToy /> },
  { label: 'Settings', path: '/visa/settings', icon: <Settings /> },
  { label: 'Profile', path: '/visa/profile', icon: <Person /> },
];

const VisaSidebar: React.FC = () => {
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

export default VisaSidebar;


