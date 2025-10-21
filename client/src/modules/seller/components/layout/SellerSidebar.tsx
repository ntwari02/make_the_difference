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
// Removed Material icons to use emoji-only labels
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
}

const menuItems: MenuItem[] = [
  { title: '🧰 Workspace', path: '/seller/dashboard' },
  { title: '📦 Inventory', path: '/seller/cars' },
  { title: '🚗 Create Vehicle', path: '/seller/cars/add' },
  { title: '🔧 Spare Parts', path: '/seller/spare-parts' },
  { title: '📊 Insights', path: '/seller/analytics' },
  { title: '💬 Messages', path: '/seller/messages', badge: 3 },
  { title: '⭐ Reviews', path: '/seller/reviews' },
  { title: '💸 Payouts', path: '/seller/payments' },
  { title: '👤 Profile', path: '/seller/profile' },
  { title: '⚙️ Settings', path: '/seller/settings' },
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
          const emoji = item.title.split(' ')[0] || '';

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
                  },
                }}
              >
                {!open && (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      mr: 'auto',
                      fontSize: 18,
                    }}
                    aria-hidden
                  >
                    {emoji}
                  </Box>
                )}
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
