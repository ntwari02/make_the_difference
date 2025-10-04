import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  useTheme,
  Switch,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../../core/store';
import { useThemeMode } from '../../../../core/theme/ThemeProvider';
import { clearProfile } from '../../store/dealerSlice';

interface DealerHeaderProps {
  onMenuClick: () => void;
}

const DealerHeader: React.FC<DealerHeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { mode, toggleColorMode } = useThemeMode();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const profile = useSelector((state: RootState) => state.dealer.profile);
  const unreadNotifications = useSelector((state: RootState) => state.dealer.unreadNotifications);
  const notifications = useSelector((state: RootState) => state.dealer.notifications);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    dispatch(clearProfile());
    navigate('/auth/login');
    handleMenuClose();
  };

  const handleNavigateToProfile = () => {
    navigate('/dealer/profile');
    handleMenuClose();
  };

  const handleNavigateToSettings = () => {
    navigate('/dealer/settings');
    handleMenuClose();
  };

  // Generate breadcrumbs from path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    return pathnames.map((value, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      const label = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');

      return isLast ? (
        <Typography key={path} color="text.primary" fontWeight={600}>
          {label}
        </Typography>
      ) : (
        <Link
          key={path}
          underline="hover"
          color="inherit"
          href={path}
          onClick={(e) => {
            e.preventDefault();
            navigate(path);
          }}
          sx={{ cursor: 'pointer' }}
        >
          {label}
        </Link>
      );
    });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: mode === 'dark' ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        width: '100%',
        left: 0,
        color: mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
      }}
    >
      <Toolbar>
        {/* Menu Icon */}
        <IconButton
          edge="start"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ 
            mr: 2,
            color: mode === 'dark' ? 'text.primary' : 'text.primary',
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Breadcrumbs */}
        <Box sx={{ flexGrow: 1 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
            {generateBreadcrumbs()}
          </Breadcrumbs>
        </Box>

        {/* Search Icon */}
        <IconButton 
          sx={{ 
            mr: 1,
            color: 'text.primary',
          }}
        >
          <SearchIcon />
        </IconButton>

        {/* Theme Toggle */}
        <IconButton 
          onClick={toggleColorMode} 
          sx={{ 
            mr: 1,
            color: 'text.primary',
          }}
        >
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        {/* Notifications */}
        <IconButton
          onClick={handleNotificationOpen}
          sx={{ 
            mr: 2,
            color: 'text.primary',
          }}
        >
          <Badge badgeContent={unreadNotifications} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* User Menu */}
        <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
          <Avatar
            src={profile?.logo}
            alt={profile?.business_name}
            sx={{ width: 40, height: 40 }}
          >
            {profile?.business_name?.charAt(0)}
          </Avatar>
        </IconButton>

        {/* User Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {profile?.business_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {profile?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleNavigateToProfile}>
            <ListItemIcon>
              <AccountIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleNavigateToSettings}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 320,
              maxHeight: 400,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
            </Box>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <MenuItem key={notification.id} onClick={handleNotificationClose}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" fontWeight={!notification.read ? 600 : 400}>
                    {notification.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.message}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
          {notifications.length > 0 && (
            <>
              <Divider />
              <MenuItem onClick={() => navigate('/dealer/notifications')}>
                <Typography variant="body2" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
                  View All Notifications
                </Typography>
              </MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default DealerHeader;

