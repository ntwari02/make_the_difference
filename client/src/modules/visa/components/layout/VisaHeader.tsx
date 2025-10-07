import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, useTheme } from '@mui/material';
import { Notifications, DarkMode, LightMode, Logout } from '@mui/icons-material';
import { Menu, MenuItem, Badge, ListItemText, ListItemIcon } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useThemeMode } from '../../../../core/theme/ThemeProvider';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../../core/store/auth/authSlice';

const VisaHeader: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeMode();
  const isDark = mode === 'dark';
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const notifications = [
    { id: 1, text: 'Your visa application is under review', icon: <CheckCircle color="success" fontSize="small" /> },
    { id: 2, text: 'Missing: Upload bank statement', icon: <ErrorIcon color="warning" fontSize="small" /> },
  ];

  const onLogout = () => {
    dispatch(logoutUser() as any);
    window.location.assign('/auth/login');
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}`, zIndex: theme.zIndex.drawer + 1, bgcolor: theme.palette.mode === 'dark' ? '#16213e' : '#ffffff', color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Visa Portal</Typography>
        <Box>
          <IconButton onClick={toggleColorMode} sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary }} aria-label="Toggle color mode">
            {isDark ? <LightMode /> : <DarkMode />}
          </IconButton>
          <IconButton color="inherit" aria-label="Notifications" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Badge color="error" variant="dot"><Notifications /></Badge>
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
            {notifications.map((n) => (
              <MenuItem key={n.id} onClick={() => setAnchorEl(null)}>
                <ListItemIcon>{n.icon}</ListItemIcon>
                <ListItemText>{n.text}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
          <IconButton color="inherit" aria-label="Logout" onClick={onLogout}><Logout /></IconButton>
          <IconButton color="inherit" aria-label="Profile"><Avatar sx={{ width: 32, height: 32 }} /></IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default VisaHeader;


