import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Notifications, DarkMode, LightMode, Logout } from '@mui/icons-material';
import { useThemeMode } from '../../../../core/theme/ThemeProvider';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../../../core/store/auth/authSlice';

interface VisaHeaderProps {
  onMenuClick: () => void;
}

const VisaHeader: React.FC<VisaHeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeMode();
  const isDark = mode === 'dark';
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" elevation={0} sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}`, zIndex: theme.zIndex.drawer + 1, bgcolor: theme.palette.mode === 'dark' ? '#16213e' : '#ffffff', color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary }}>
      <Toolbar>
        <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 2, color: theme.palette.text.primary }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Visa Officer Portal</Typography>
        <Box>
          <IconButton onClick={toggleColorMode} sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary }} aria-label="Toggle color mode">
            {isDark ? <LightMode /> : <DarkMode />}
          </IconButton>
          <IconButton color="inherit" aria-label="Notifications">
            <Notifications />
          </IconButton>
          <IconButton color="inherit" aria-label="Logout" onClick={() => { dispatch(logoutUser() as any); navigate('/auth/login'); }}>
            <Logout />
          </IconButton>
          <IconButton color="inherit" aria-label="Profile">
            <Avatar sx={{ width: 32, height: 32 }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default VisaHeader;


