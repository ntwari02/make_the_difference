import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dashboard, People, Insights, Settings, Security, Gavel, Article } from '@mui/icons-material';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
  collapsedWidth: number;
  topOffset?: number;
}

interface MenuItem { label: string; path: string; icon: React.ReactNode }

const items: MenuItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <Dashboard /> },
  { label: 'Users', path: '/admin/users', icon: <People /> },
  { label: 'Analytics', path: '/admin/analytics', icon: <Insights /> },
  { label: 'Moderation', path: '/admin/moderation', icon: <Gavel /> },
  { label: 'Audit Logs', path: '/admin/audit', icon: <Article /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings /> },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ open, onClose, drawerWidth, collapsedWidth, topOffset = 64 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List>
        {items.map((m) => (
          <ListItemButton key={m.path} selected={location.pathname === m.path} onClick={() => handleNav(m.path)} sx={{ px: open ? 2 : 1.5, justifyContent: open ? 'flex-start' : 'center' }}>
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center' }}>{m.icon}</ListItemIcon>
            {open && <ListItemText primary={m.label} />}
          </ListItemButton>
        ))}
      </List>
      {open && (
        <>
          <Divider sx={{ mt: 'auto' }} />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">© 2025 Admin Portal</Typography>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer variant="temporary" open={open} onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', bgcolor: theme.palette.mode === 'dark' ? '#16213e' : theme.palette.background.paper, borderRight: theme.palette.mode === 'dark' ? `1px solid rgba(255,255,255,0.1)` : `1px solid ${theme.palette.divider}`, top: topOffset, height: `calc(100% - ${topOffset}px)` } }}>
          {content}
        </Drawer>
      ) : (
        <Drawer variant="permanent" open={open} sx={{ width: open ? drawerWidth : collapsedWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: open ? drawerWidth : collapsedWidth, boxSizing: 'border-box', bgcolor: theme.palette.mode === 'dark' ? '#16213e' : theme.palette.background.paper, borderRight: theme.palette.mode === 'dark' ? `1px solid rgba(255,255,255,0.1)` : `1px solid ${theme.palette.divider}`, overflowX: 'hidden', overflowY: 'hidden', transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }), top: topOffset, height: `calc(100% - ${topOffset}px)` } }}>
          {content}
        </Drawer>
      )}
    </>
  );
};

export default AdminSidebar;



