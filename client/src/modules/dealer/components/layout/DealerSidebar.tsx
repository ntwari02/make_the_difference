import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DirectionsCar as CarIcon,
  AddCircleOutline as AddIcon,
  BarChart as AnalyticsIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Group as TeamIcon,
  Message as MessageIcon,
  NotificationsActive as NotificationIcon,
  Payment as PaymentIcon,
  Star as ReviewIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../core/store';

interface DealerSidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
  collapsedWidth: number;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactElement;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/dealer/dashboard', icon: <DashboardIcon /> },
  { title: 'Vehicles', path: '/dealer/vehicles', icon: <CarIcon /> },
  { title: 'Add Vehicle', path: '/dealer/vehicles/add', icon: <AddIcon /> },
  { title: 'Analytics', path: '/dealer/analytics', icon: <AnalyticsIcon /> },
  { title: 'Messages', path: '/dealer/messages', icon: <MessageIcon />, badge: 5 },
  { title: 'Reviews', path: '/dealer/reviews', icon: <ReviewIcon /> },
  { title: 'Team', path: '/dealer/team', icon: <TeamIcon /> },
  { title: 'Payments', path: '/dealer/payments', icon: <PaymentIcon /> },
  { title: 'Profile', path: '/dealer/profile', icon: <ProfileIcon /> },
  { title: 'Settings', path: '/dealer/settings', icon: <SettingsIcon /> },
];

const DealerSidebar: React.FC<DealerSidebarProps> = ({
  open,
  onClose,
  drawerWidth,
  collapsedWidth,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const profile = useSelector((state: RootState) => state.dealer.profile);
  const unreadNotifications = useSelector((state: RootState) => state.dealer.unreadNotifications);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Brand */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minHeight: 64,
        }}
      >
        {open ? (
          <>
            <Avatar
              src={profile?.logo}
              alt={profile?.business_name}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
              }}
            >
              {profile?.business_name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                {profile?.business_name || 'Dealer Portal'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                }}
              >
                {profile?.is_verified ? '✓ Verified' : 'Pending Verification'}
              </Typography>
            </Box>
          </>
        ) : (
          <Avatar
            src={profile?.logo}
            alt={profile?.business_name}
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
            }}
          >
            {profile?.business_name?.charAt(0)}
          </Avatar>
        )}
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2, px: 1 }}>
        {menuItems.map((item) => {
          const isActive = isActivePath(item.path);
          const showBadge = item.badge && item.badge > 0;

          return (
            <Tooltip
              key={item.path}
              title={!open ? item.title : ''}
              placement="right"
              arrow
            >
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                    {showBadge && (
                      <Box
                        sx={{
                          bgcolor: 'error.main',
                          color: 'error.contrastText',
                          borderRadius: '12px',
                          px: 1,
                          py: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          minWidth: '20px',
                          textAlign: 'center',
                        }}
                      >
                        {item.badge}
                      </Box>
                    )}
                  </>
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* Footer */}
      {open && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              © 2025 Dealer Portal
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      {isMobile ? (
        // Mobile drawer
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        // Desktop drawer
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            width: open ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : collapsedWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default DealerSidebar;

