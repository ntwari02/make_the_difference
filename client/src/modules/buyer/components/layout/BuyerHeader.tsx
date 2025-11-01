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
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeMode } from '../../../../core/theme/ThemeProvider';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../../../core/store/auth/authSlice';
import type { RootState } from '../../../../core/store';
import { getImageUrl } from '../../../../shared/utils/imageUtils';
import { buyerApi } from '../../services/buyerApi';

interface BuyerHeaderProps {
  onMenuClick: () => void;
}

const BuyerHeader: React.FC<BuyerHeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useThemeMode();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const unreadNotifications = 0;

  // Get cached profile image immediately from localStorage for instant display
  const [instantAvatarSrc, setInstantAvatarSrc] = React.useState<string | undefined>(undefined);
  
  React.useEffect(() => {
    try {
      const cache = localStorage.getItem('buyer_profile_cache');
      if (cache) {
        const p = JSON.parse(cache);
        const avatar = p?.avatar || p?.profile_image || null;
        if (avatar) {
          const src = avatar.startsWith('data:') ? avatar : getImageUrl(avatar);
          setInstantAvatarSrc(src);
        }
      }
    } catch {}
  }, []);

  // Ensure header has profile data immediately after login/navigation
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Load profile if user data doesn't have profile_image
        if (user && !user.profile_image && !user.avatar) {
          const data = await buyerApi.getProfile();
          if (!mounted) return;
          // Cache profile data for instant display
          try {
            localStorage.setItem('buyer_profile_cache', JSON.stringify(data));
            // Update instant avatar if available
            const avatar = data.avatar || (data as any).profile_image;
            if (avatar) {
              const src = avatar.startsWith('data:') ? avatar : getImageUrl(avatar);
              setInstantAvatarSrc(src);
            }
          } catch {}
        }
      } catch {}
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  // Get avatar URL from user profile with multiple fallbacks
  const avatarSrc = (() => {
    // Priority 1: Redux auth user profile_image
    if (user?.profile_image) {
      const img = user.profile_image;
      return img.startsWith('data:') ? img : getImageUrl(img);
    }
    // Priority 2: Redux auth user avatar
    if (user?.avatar) {
      const img = user.avatar;
      return img.startsWith('data:') ? img : getImageUrl(img);
    }
    // Priority 3: Instant cached image
    if (instantAvatarSrc) return instantAvatarSrc;
    // Fallback
    return undefined;
  })();
  
  // Get user initials for fallback
  const userInitial = (user?.first_name || user?.last_name || user?.email || 'B')[0].toUpperCase();
  
  // Get display name
  const displayName = user?.first_name || user?.last_name 
    ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() 
    : 'Buyer';
  
  // Get email
  const userEmail = user?.email || 'buyer@example.com';

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

  const handleLogout = async () => {
    if (window.confirm('⚠️ Are you sure you want to logout?')) {
      try { await (dispatch as any)(logoutUser()).unwrap(); } catch (_) {}
      handleMenuClose();
      window.location.assign('/');
    }
  };

  const handleNavigateToProfile = () => {
    navigate('/buyer/profile');
    handleMenuClose();
  };

  const handleNavigateToSettings = () => {
    navigate('/buyer/settings');
    handleMenuClose();
  };

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
      <Toolbar>
        <IconButton
          edge="start"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ 
            mr: 2,
            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
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
        </Box>

        <IconButton 
          onClick={() => navigate('/browse')} 
          sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary }}
        >
          <SearchIcon />
        </IconButton>

        <IconButton 
          onClick={() => navigate('/buyer/favorites')} 
          sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary }}
        >
          <Badge badgeContent={0} color="error">
            <FavoriteIcon />
          </Badge>
        </IconButton>

        <IconButton 
          onClick={toggleColorMode} 
          sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary }}
        >
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        <IconButton
          onClick={handleNotificationOpen}
          sx={{ mr: 2, color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary }}
        >
          <Badge badgeContent={unreadNotifications} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
          <Avatar 
            src={avatarSrc}
            sx={{ width: 40, height: 40 }}
            alt={displayName}
          >
            {userInitial}
          </Avatar>
        </IconButton>

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
              '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {displayName}
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
            Clear Session & Logout
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{ sx: { mt: 1.5, minWidth: 320, maxHeight: 400 } }}
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

export default BuyerHeader;


