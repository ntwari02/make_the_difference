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
  Dashboard as WorkspaceIcon,
  Inventory as InventoryIcon,
  DirectionsCar as CreateVehicleIcon,
  Build as SparePartsIcon,
  Insights as InsightsIcon,
  Message as MessagesIcon,
  Star as ReviewsIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Receipt as OrdersIcon,
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
  badge?: number;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { title: '🧰 Workspace', path: '/seller/dashboard', icon: <WorkspaceIcon /> },
  { title: '📦 Inventory', path: '/seller/cars', icon: <InventoryIcon /> },
  { title: '🚗 Create Vehicle', path: '/seller/cars/add', icon: <CreateVehicleIcon /> },
  { title: '🔧 Spare Parts', path: '/seller/spare-parts', icon: <SparePartsIcon /> },
  { title: '📋 Orders', path: '/seller/orders', icon: <OrdersIcon /> },
  { title: '📊 Insights', path: '/seller/analytics', icon: <InsightsIcon /> },
  { title: '💬 Messages', path: '/seller/messages', badge: 3, icon: <MessagesIcon /> },
  { title: '⭐ Reviews', path: '/seller/reviews', icon: <ReviewsIcon /> },
  { title: '👤 Profile', path: '/seller/profile', icon: <ProfileIcon /> },
  { title: '⚙️ Settings', path: '/seller/settings', icon: <SettingsIcon /> },
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2, px: 1, overflow: 'hidden' }}>
        {menuItems.map((item) => {
          const isActive = isActivePath(item.path);
          const showBadge = item.badge && item.badge > 0;
          const label = item.title.split(' ').slice(1).join(' ');

          return (
            <Tooltip
              key={item.path}
              title={!open ? label : ''}
              placement="right"
              arrow
            >
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 1.5,
                  mb: 1,
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  py: 1.5,
                  position: 'relative',
                  // Default state styling
                  color: isActive ? '#ffffff' : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : theme.palette.text.secondary),
                  bgcolor: isActive ? '#2C3E50' : 'transparent',
                  // Light blue border glow for active state
                  border: isActive ? '1px solid #3498DB' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 12px rgba(52, 152, 219, 0.3)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  // Hover styling
                  '&:hover': {
                    bgcolor: isActive ? '#34495E' : '#2C3E50',
                    color: '#ffffff !important',
                    transform: isActive ? 'scale(1.02)' : 'translateX(6px)',
                    borderColor: isActive ? '#4A90E2' : 'rgba(52, 152, 219, 0.5)',
                    boxShadow: isActive ? '0 0 16px rgba(52, 152, 219, 0.4)' : '0 4px 12px rgba(52, 152, 219, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  // Active state styling (override Material-UI default)
                  '&.Mui-selected': {
                    bgcolor: '#2C3E50 !important',
                    color: '#ffffff !important',
                    '&:hover': {
                      bgcolor: '#34495E !important',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: open ? 40 : 'auto',
                    justifyContent: open ? 'flex-start' : 'center',
                    // Icon color: light blue for active, default for inactive
                    color: isActive ? '#3498DB' : 'inherit',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiSvgIcon-root': {
                      fontSize: 20,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    // Hover effect on icon
                    '&:hover': {
                      color: '#3498DB !important',
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {/* Circular dot indicator for active state */}
                {isActive && open && (
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#3498DB',
                      boxShadow: '0 0 8px rgba(52, 152, 219, 0.8)',
                    }}
                  />
                )}
                {open && (
                  <>
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 500,
                      }}
                    />
                    {showBadge && (
                      <Box
                        sx={{
                          bgcolor: '#E74C3C',
                          color: '#ffffff',
                          borderRadius: 2,
                          px: 1.2,
                          py: 0.3,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          minWidth: '20px',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(231, 76, 60, 0.3)',
                          mr: open ? 2 : 0,
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
              overflowY: 'hidden',
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
