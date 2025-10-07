import React from 'react';
import { AppBar, Toolbar, IconButton, Breadcrumbs, Link, Typography, useTheme, Box, Avatar, Menu, MenuItem, Divider, Badge, ListItemIcon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useThemeMode } from '../../../../core/theme/ThemeProvider';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { logoutUser } from '../../../../core/store/auth/authSlice';

interface StudentHeaderProps { onMenuClick: () => void }

const StudentHeader: React.FC<StudentHeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mode, toggleColorMode } = useThemeMode();

  const crumbs = location.pathname.split('/').filter(Boolean);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notifEl, setNotifEl] = React.useState<null | HTMLElement>(null);
  const unread = 2; // demo badge

  return (
    <AppBar position="fixed" elevation={0} sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: theme.palette.mode === 'dark' ? '#16213e' : '#ffffff', borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Toolbar>
        <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 2, color: theme.palette.text.primary }}><MenuIcon /></IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Breadcrumbs>
            {crumbs.map((seg, i) => {
              const path = '/' + crumbs.slice(0, i + 1).join('/');
              const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace('-', ' ');
              const last = i === crumbs.length - 1;
              return last ? (
                <Typography key={path} fontWeight={700}>{label}</Typography>
              ) : (
                <Link key={path} underline="hover" color="inherit" href={path} onClick={(e) => { e.preventDefault(); navigate(path); }}>{label}</Link>
              );
            })}
          </Breadcrumbs>
        </Box>
        <IconButton sx={{ mr: 1, color: theme.palette.text.primary }}><SearchIcon /></IconButton>
        <IconButton onClick={(e) => setNotifEl(e.currentTarget)} sx={{ mr: 1, color: theme.palette.text.primary }}>
          <Badge color="error" badgeContent={unread}><NotificationsIcon /></Badge>
        </IconButton>
        <IconButton onClick={toggleColorMode} sx={{ color: theme.palette.text.primary, mr: 1 }}>
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
          <Avatar sx={{ width: 36, height: 36 }}>S</Avatar>
        </IconButton>
      </Toolbar>
      {/* User Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { mt: 1.5, minWidth: 220 } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>Student</Typography>
          <Typography variant="caption" color="text.secondary">student@example.com</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { navigate('/student/courses'); setAnchorEl(null); }}>
          <ListItemIcon><SchoolIcon fontSize="small" /></ListItemIcon>
          My Courses
        </MenuItem>
        <MenuItem onClick={() => { navigate('/student/favorites'); setAnchorEl(null); }}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
          Favorites
        </MenuItem>
        <MenuItem onClick={() => { dispatch(logoutUser() as any); setAnchorEl(null); navigate('/auth/login'); }}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      {/* Notifications Menu */}
      <Menu anchorEl={notifEl} open={Boolean(notifEl)} onClose={() => setNotifEl(null)}
        PaperProps={{ sx: { mt: 1.5, minWidth: 320 } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>Notifications</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => setNotifEl(null)}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={600}>Assignment graded</Typography>
            <Typography variant="caption" color="text.secondary">React Quiz · 2h ago</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => setNotifEl(null)}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={600}>New certificate available</Typography>
            <Typography variant="caption" color="text.secondary">Intro JS · 1d ago</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default StudentHeader;


