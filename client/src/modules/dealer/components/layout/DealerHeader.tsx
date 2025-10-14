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
  useMediaQuery,
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
import { logoutUser } from '../../../../core/store/auth/authSlice';

interface DealerHeaderProps {
  onMenuClick: () => void;
}

const DealerHeader: React.FC<DealerHeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { mode, toggleColorMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const profile = useSelector((state: RootState) => state.dealer.profile);
  const unreadNotifications = useSelector((state: RootState) => state.dealer.unreadNotifications);
  const notifications = useSelector((state: RootState) => state.dealer.notifications);

  // Debug logging
  console.log('DealerHeader Debug:', {
    profile: profile?.business_name || 'No profile',
    notifications: notifications.length,
    unreadNotifications,
    mode,
    isMobile
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    console.log('👤 User menu clicked');
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    console.log('🔔 Notifications clicked');
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    if (window.confirm('⚠️ Are you sure you want to logout?')) {
      try { await (dispatch as any)(logoutUser()).unwrap(); } catch (_) {}
      dispatch(clearProfile());
      handleMenuClose();
      window.location.assign('/');
    }
  };

  const handleNavigateToProfile = () => {
    navigate('/dealer/profile');
    handleMenuClose();
  };

  const handleNavigateToSettings = () => {
    navigate('/dealer/settings');
    handleMenuClose();
  };

  const handleSearchClick = () => {
    console.log('🔍 Search clicked');
    // TODO: Implement search functionality
  };

  const handleThemeToggle = () => {
    console.log('🎨 Theme toggle clicked');
    toggleColorMode();
  };

  // Generate breadcrumbs from path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    return pathnames.map((value, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      const label = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');

      return isLast ? (
        <Typography 
          key={path} 
          color={theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary} 
          fontWeight={700} 
          fontSize="1rem"
        >
          {label}
        </Typography>
      ) : (
        <Link
          key={path}
          underline="hover"
          color={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : theme.palette.text.secondary}
          href={path}
          onClick={(e) => {
            e.preventDefault();
            navigate(path);
          }}
          sx={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}
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
        bgcolor: theme.palette.mode === 'dark' ? '#16213e' : '#ffffff',
        backdropFilter: 'blur(20px)',
        borderBottom: theme.palette.mode === 'dark' 
          ? `1px solid rgba(255, 255, 255, 0.1)` 
          : `1px solid ${theme.palette.divider}`,
        width: '100%',
        left: 0,
        color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ minHeight: isMobile ? '56px' : '64px' }}>
        {/* Menu Icon */}
        <IconButton
          edge="start"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ 
            mr: isMobile ? 1 : 2,
            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Breadcrumbs - Hide on mobile, show only current page */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {isMobile ? (
            <Typography 
              variant="h6" 
              noWrap
              sx={{ 
                color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {location.pathname.split('/').pop()?.charAt(0).toUpperCase() + 
               location.pathname.split('/').pop()?.slice(1).replace('-', ' ') || 'Dashboard'}
            </Typography>
          ) : (
            <Breadcrumbs 
              aria-label="breadcrumb" 
              sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : theme.palette.text.secondary 
              }}
            >
              {generateBreadcrumbs()}
            </Breadcrumbs>
          )}
        </Box>

        {/* Right side icons - Hide some on mobile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1 }}>
          {/* Search Icon - Hide on mobile */}
          {!isMobile && (
            <IconButton 
              onClick={handleSearchClick}
              sx={{ 
                color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
              }}
            >
              <SearchIcon />
            </IconButton>
          )}

          {/* Theme Toggle - Hide on mobile */}
          {!isMobile && (
            <IconButton 
              onClick={handleThemeToggle}
              sx={{ 
                color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
              }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          )}

          {/* Notifications */}
          <IconButton
            onClick={handleNotificationOpen}
            sx={{ 
              mr: isMobile ? 0.5 : 1,
              color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
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
              sx={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}
            >
              {profile?.business_name?.charAt(0)}
            </Avatar>
          </IconButton>
        </Box>

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
            Clear Session & Logout
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

