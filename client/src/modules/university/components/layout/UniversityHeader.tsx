import React from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../../core/store/auth/authSlice';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, useTheme } from '@mui/material';
import { Notifications, DarkMode, LightMode, Menu as MenuIcon, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../../../core/theme/ThemeProvider';

interface UniversityHeaderProps { onMenuClick: () => void }

const UniversityHeader: React.FC<UniversityHeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeMode();
  const dispatch = useDispatch();
  const isDark = mode === 'dark';
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" elevation={0} sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}`, zIndex: theme.zIndex.drawer + 1, bgcolor: theme.palette.mode === 'dark' ? '#16213e' : '#ffffff', color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary }}>
      <Toolbar>
        <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 2, color: theme.palette.text.primary }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          University Portal
        </Typography>
        <Box>
          <IconButton onClick={toggleColorMode} sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary }} aria-label="Toggle color mode">
            {isDark ? <LightMode /> : <DarkMode />}
          </IconButton>
          <IconButton color="inherit" aria-label="Notifications">
            <Notifications />
          </IconButton>
          <IconButton color="inherit" aria-label="Logout" onClick={() => { dispatch(logoutUser() as any); navigate('/'); }}>
            <Logout />
          </IconButton>
          <IconButton color="inherit" aria-label="Profile">
            <Avatar sx={{ width: 32, height: 32 }} />
          </IconButton>
          <IconButton color="inherit" aria-label="Logout" onClick={async () => { try { await (dispatch as any)(logoutUser()).unwrap(); } catch (_) {} window.location.assign('/'); }}>
            {/* reusing existing icons in this header file if present */}
            <span style={{ width: 0, height: 0 }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UniversityHeader;



