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
  Message as MessageIcon,
  NotificationsActive as NotificationIcon,
  Payment as PaymentIcon,
  Star as ReviewIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../core/store';

interface SellerSidebarProps {
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
  { title: 'Workspace', path: '/seller/dashboard', icon: <DashboardIcon /> },
  { title: 'Inventory', path: '/seller/cars', icon: <InventoryIcon /> },
  { title: 'Create Listing', path: '/seller/cars/add', icon: <AddIcon /> },
  { title: 'Insights', path: '/seller/analytics', icon: <AnalyticsIcon /> },
  { title: 'Messages', path: '/seller/messages', icon: <MessageIcon />, badge: 3 },
  { title: 'Reviews', path: '/seller/reviews', icon: <ReviewIcon /> },
  { title: 'Payouts', path: '/seller/payments', icon: <PaymentIcon /> },
  { title: 'Profile', path: '/seller/profile', icon: <ProfileIcon /> },
  { title: 'Settings', path: '/seller/settings', icon: <SettingsIcon /> },
];

const SellerSidebar: React.FC<SellerSidebarProps> = ({
  open,
  onClose,
  drawerWidth,
  collapsedWidth,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const profile = useSelector((state: RootState) => state.seller.profile);
  const unreadNotifications = useSelector((state: RootState) => state.seller.unreadNotifications);

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
                  color: theme.palette.mode === 'dark'
                    ? (isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)')
                    : (isActive ? theme.palette.primary.main : theme.palette.text.secondary),
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : theme.palette.action.hover,
                    color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.contrastText,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.contrastText,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: theme.palette.mode === 'dark'
                      ? (isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)')
                      : (isActive ? theme.palette.primary.main : theme.palette.text.secondary),
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 500,
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
          <Divider sx={{
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : theme.palette.divider
      }} />
          <Box sx={{ p: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.5)'
                  : theme.palette.text.secondary
              }}
            >
              © 2025 Seller Portal
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
              bgcolor: theme.palette.mode === 'dark' ? '#16213e' : theme.palette.background.paper,
              borderRight: theme.palette.mode === 'dark'
                ? `1px solid rgba(255, 255, 255, 0.1)`
                : `1px solid ${theme.palette.divider}`,
              // Mobile drawer should start from top (no header offset)
              top: 0,
              height: '100%',
              zIndex: theme.zIndex.drawer,
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
              bgcolor: theme.palette.mode === 'dark' ? '#16213e' : theme.palette.background.paper,
              borderRight: theme.palette.mode === 'dark'
                ? `1px solid rgba(255, 255, 255, 0.1)`
                : `1px solid ${theme.palette.divider}`,
              // Position below fixed header (64px)
              top: '64px',
              height: 'calc(100% - 64px)',
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

export default SellerSidebar;
