import React, { useState, useEffect } from 'react';
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
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DirectionsCar as BrowseIcon,
  Favorite as FavoriteIcon,
  Message as MessageIcon,
  SmartToy as AIIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Build as SparePartsIcon,
  Receipt as InvoiceIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { buyerMessagesApi } from '../../services/messagesApi';

interface BuyerSidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
  collapsedWidth: number;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactElement;
  badge?: number | null; // null means dynamic badge
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/buyer/dashboard', icon: <DashboardIcon /> },
  { title: 'Browse', path: '/browse', icon: <BrowseIcon /> },
  { title: 'Spare Parts', path: '/spare-parts', icon: <SparePartsIcon /> },
  { title: 'Favorites', path: '/buyer/favorites', icon: <FavoriteIcon /> },
  { title: 'Messages', path: '/buyer/messages', icon: <MessageIcon />, badge: null },
  { title: 'Orders', path: '/buyer/orders', icon: <InvoiceIcon /> },
  { title: 'Profile', path: '/buyer/profile', icon: <ProfileIcon /> },
  { title: 'Settings', path: '/buyer/settings', icon: <SettingsIcon /> },
];

const BuyerSidebar: React.FC<BuyerSidebarProps> = ({
  open,
  onClose,
  drawerWidth,
  collapsedWidth,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const result = await buyerMessagesApi.getConversations({
          page: 1,
          limit: 100, // Fetch enough to get accurate count
        });
        const conversations = result.conversations || [];
        const totalUnread = conversations.reduce((sum: number, conv: any) => {
          return sum + (conv.unreadCount || 0);
        }, 0);
        setUnreadMessagesCount(totalUnread);
      } catch (error) {
        console.error('Failed to fetch unread messages count:', error);
        setUnreadMessagesCount(0);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActivePath = (path: string) => location.pathname === path;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* No brand header — match seller sidebar */}
      <Divider sx={{ borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.divider }} />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2, px: 1, overflow: 'hidden' }}>
        {menuItems.map((item) => {
          const isActive = isActivePath(item.path);
          // Use dynamic badge for Messages, static badge for others
          const badgeCount = item.badge === null ? unreadMessagesCount : (item.badge || 0);
          const showBadge = badgeCount > 0;
          const label = item.title;

          return (
            <Tooltip key={item.path} title={!open ? label : ''} placement="right" arrow>
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
                  color: isActive ? '#ffffff' : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : theme.palette.text.secondary),
                  bgcolor: isActive ? '#2C3E50' : 'transparent',
                  border: isActive ? '1px solid #3498DB' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 12px rgba(52, 152, 219, 0.3)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: isActive ? '#34495E' : '#2C3E50',
                    color: '#ffffff !important',
                    transform: isActive ? 'scale(1.02)' : 'translateX(6px)',
                    borderColor: isActive ? '#4A90E2' : 'rgba(52, 152, 219, 0.5)',
                    boxShadow: isActive ? '0 0 16px rgba(52, 152, 219, 0.4)' : '0 4px 12px rgba(52, 152, 219, 0.2)',
                  },
                  '&.Mui-selected': {
                    bgcolor: '#2C3E50 !important',
                    color: '#ffffff !important',
                    '&:hover': { bgcolor: '#34495E !important' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: open ? 40 : 'auto',
                    justifyContent: open ? 'flex-start' : 'center',
                    color: isActive ? '#3498DB' : 'inherit',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiSvgIcon-root': { fontSize: 20, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
                    '&:hover': { color: '#3498DB !important' },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
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
                      primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }}
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
                        {badgeCount}
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
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.divider,
          }} />
          <Box sx={{ p: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : theme.palette.text.secondary }}
            >
              © 2025 Buyer Portal
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
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

export default BuyerSidebar;


