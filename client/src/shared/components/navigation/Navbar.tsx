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
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../../core/theme/ThemeProvider';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useThemeMode();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  // Mock data - replace with actual state management
  const userName = 'Buyer User';
  const userEmail = 'buyer@example.com';
  const unreadNotifications = 0;

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
    navigate('/auth/login');
    handleMenuClose();
  };

  const handleNavigateToProfile = () => {
    navigate('/buyer/profile');
    handleMenuClose();
  };

  const handleNavigateToSettings = () => {
    navigate('/buyer/settings');
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: mode === 'dark' ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
      }}
    >
      <Toolbar>
        {/* Logo/Brand */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 0,
            fontWeight: 700,
            mr: 4,
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          onClick={() => navigate('/buyer/dashboard')}
        >
          CarMarket
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/browse')}
            sx={{ color: 'text.primary' }}
          >
            Browse Cars
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/buyer/favorites')}
            sx={{ color: 'text.primary' }}
          >
            Favorites
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/buyer/saved-searches')}
            sx={{ color: 'text.primary' }}
          >
            Saved Searches
          </Button>
        </Box>

        {/* Search Icon */}
        <IconButton
          onClick={() => navigate('/browse')}
          sx={{
            mr: 1,
            color: 'text.primary',
          }}
        >
          <SearchIcon />
        </IconButton>

        {/* Favorites Icon */}
        <IconButton
          onClick={() => navigate('/buyer/favorites')}
          sx={{
            mr: 1,
            color: 'text.primary',
          }}
        >
          <Badge badgeContent={0} color="primary">
            <FavoriteIcon />
          </Badge>
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
            sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
          >
            {userName.charAt(0)}
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
              {userName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userEmail}
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
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

