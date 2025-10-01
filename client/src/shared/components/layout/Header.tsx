import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Settings,
  Logout,
  Brightness4,
  Brightness7,
  Search,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
  showSidebarToggle: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onSidebarToggle, 
  sidebarOpen, 
  showSidebarToggle 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout, fullName, initials } = useAuth();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    handleMenuClose();
  };

  const handleProfileClick = () => {
    navigate('/app/profile');
    handleMenuClose();
  };

  const handleSettingsClick = () => {
    navigate('/app/settings');
    handleMenuClose();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // TODO: Implement theme switching logic
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(18, 18, 18, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Left Section */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Sidebar Toggle */}
          {showSidebarToggle && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onSidebarToggle}
              sx={{
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
              onClick={() => navigate('/')}
            >
              Reaglex
            </Typography>
          </motion.div>
        </Box>

        {/* Center Section - Search (Desktop) */}
        {!isMobile && (
          <Box
            sx={{
              flex: 1,
              maxWidth: 400,
              mx: 4,
            }}
          >
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&:focus-within': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                  }}
                >
                  <Search 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      mr: 1,
                      fontSize: 20,
                    }} 
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      flex: 1,
                    }}
                  >
                    Search courses, cars, or anything...
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Box>
        )}

        {/* Right Section */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Dark Mode Toggle */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              onClick={toggleDarkMode}
              sx={{
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          {isAuthenticated && (
            <Tooltip title="Notifications">
              <IconButton
                onClick={handleNotificationMenuOpen}
                sx={{
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* User Profile */}
          {isAuthenticated && user ? (
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                  }}
                >
                  {initials || user.email?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconButton
                onClick={() => navigate('/auth/login')}
                sx={{
                  color: theme.palette.primary.main,
                  border: `1px solid ${theme.palette.primary.main}`,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                  },
                }}
              >
                <AccountCircle sx={{ mr: 1 }} />
                <Typography variant="body2" fontWeight="medium">
                  Sign In
                </Typography>
              </IconButton>
            </motion.div>
          )}
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {fullName || user?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfileClick}>
          <AccountCircle sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleSettingsClick}>
          <Settings sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <Logout sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            maxHeight: 400,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        <Divider />
        <MenuItem>
          <Typography variant="body2">
            Welcome to Reaglex! Complete your profile.
          </Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">
            New course available: "Advanced React"
          </Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">
            Your car listing has 5 new views.
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
