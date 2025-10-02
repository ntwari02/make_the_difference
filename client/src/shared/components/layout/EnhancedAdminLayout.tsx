import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery,
  Collapse,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Analytics,
  Settings,
  School,
  DirectionsCar,
  Psychology,
  Payment,
  Security,
  Notifications,
  AccountCircle,
  Logout,
  AdminPanelSettings,
  ExpandLess,
  ExpandMore,
  ContentPaste,
  MonetizationOn,
  TrendingUp,
  CheckCircle,
  Refresh,
  DarkMode,
  LightMode,
  AccountBalance,
  Business,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/hooks/useAuth';

const drawerWidth = 280;

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  badge?: number;
  color?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <Dashboard />,
    path: '/admin/dashboard',
    color: '#667eea',
  },
  {
    id: 'users',
    title: 'User Management',
    icon: <People />,
    children: [
      { id: 'all-users', title: 'All Users', icon: <People />, path: '/admin/users' },
      { id: 'user-roles', title: 'User Roles', icon: <AdminPanelSettings />, path: '/admin/users/roles' },
      { id: 'user-analytics', title: 'User Analytics', icon: <Analytics />, path: '/admin/users/analytics' },
    ],
  },
  {
    id: 'content',
    title: 'Content Management',
    icon: <ContentPaste />,
    children: [
      { id: 'courses', title: 'Courses', icon: <School />, path: '/admin/content/courses', badge: 12 },
      { id: 'cars', title: 'Car Listings', icon: <DirectionsCar />, path: '/admin/content/cars', badge: 5 },
      { id: 'scholarships', title: 'Scholarships', icon: <AccountBalance />, path: '/admin/content/scholarships' },
      { id: 'visa', title: 'Visa Services', icon: <Security />, path: '/admin/content/visa' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    icon: <Analytics />,
    children: [
      { id: 'revenue', title: 'Revenue Analytics', icon: <MonetizationOn />, path: '/admin/analytics/revenue' },
      { id: 'user-analytics', title: 'User Analytics', icon: <TrendingUp />, path: '/admin/analytics/users' },
      { id: 'performance', title: 'Performance', icon: <Psychology />, path: '/admin/analytics/performance' },
    ],
  },
  {
    id: 'payments',
    title: 'Payment Management',
    icon: <Payment />,
    path: '/admin/payments',
    badge: 3,
    color: '#10b981',
  },
  {
    id: 'ai-services',
    title: 'AI Services',
    icon: <Psychology />,
    children: [
      { id: 'chatbot', title: 'Chatbot', icon: <Psychology />, path: '/admin/ai/chatbot' },
      { id: 'dynamic-pricing', title: 'Dynamic Pricing', icon: <MonetizationOn />, path: '/admin/ai/pricing' },
      { id: 'personalization', title: 'Personalization', icon: <TrendingUp />, path: '/admin/ai/personalization' },
    ],
  },
  {
    id: 'system',
    title: 'System Settings',
    icon: <Settings />,
    children: [
      { id: 'general', title: 'General Settings', icon: <Settings />, path: '/admin/system/general' },
      { id: 'security', title: 'Security', icon: <Security />, path: '/admin/system/security' },
      { id: 'integrations', title: 'Integrations', icon: <Business />, path: '/admin/system/integrations' },
    ],
  },
];

const EnhancedAdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications] = useState([
    { id: 1, type: 'warning', message: 'High server load detected', time: '2 min ago' },
    { id: 2, type: 'success', message: 'Backup completed successfully', time: '1 hour ago' },
    { id: 3, type: 'error', message: 'Payment gateway timeout', time: '3 hours ago' },
  ]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as any });

  useEffect(() => {
    const currentPath = location.pathname;
    menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => child.path === currentPath);
        if (hasActiveChild && !expandedItems.includes(item.id)) {
          setExpandedItems(prev => [...prev, item.id]);
        }
      }
    });
  }, [location.pathname, expandedItems]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
    handleMenuClose();
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
      if (isMobile) {
        setMobileOpen(false);
      }
    } else if (item.children) {
      setExpandedItems(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    }
  };

  const isActiveItem = (item: MenuItem) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.children) {
      return item.children.some(child => child.path === location.pathname);
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isActive = isActiveItem(item);
    const isExpanded = expandedItems.includes(item.id);

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.1 }}
      >
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              pl: 2 + level * 2,
              pr: 2,
              py: 1,
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              backgroundColor: isActive ? `${item.color || theme.palette.primary.main}15` : 'transparent',
              borderLeft: isActive ? `3px solid ${item.color || theme.palette.primary.main}` : '3px solid transparent',
              '&:hover': {
                backgroundColor: `${item.color || theme.palette.primary.main}10`,
                transform: 'translateX(4px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive ? (item.color || theme.palette.primary.main) : theme.palette.text.secondary,
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? (item.color || theme.palette.primary.main) : theme.palette.text.primary,
                  fontSize: '0.9rem',
                },
              }}
            />
            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  backgroundColor: theme.palette.error.main,
                  color: 'white',
                }}
              />
            )}
            {item.children && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {item.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </motion.div>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <AdminPanelSettings fontSize="large" />
          </Avatar>
        </motion.div>
        <Typography variant="h6" fontWeight="bold">
          Admin Portal
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Universal Management System
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        <List>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* System Status */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}05 100%)`,
              border: `1px solid ${theme.palette.success.main}20`,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CheckCircle color="success" fontSize="small" />
              <Typography variant="caption" fontWeight="bold">
                System Status
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              All services operational
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip label="99.9%" size="small" color="success" />
              <Chip label="AI Active" size="small" color="primary" />
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find(item => 
              item.path === location.pathname || 
              item.children?.some(child => child.path === location.pathname)
            )?.title || 'Admin Dashboard'}
          </Typography>

          {/* Action Buttons */}
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={() => {
                  setSnackbar({ open: true, message: 'Data refreshed successfully', severity: 'success' });
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>

            <Tooltip title="Toggle Theme">
              <IconButton onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton>
                <Badge badgeContent={notifications.length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account">
              <IconButton onClick={handleMenuClick}>
                <Avatar
                  sx={{ width: 32, height: 32 }}
                  src={user?.avatar}
                >
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: theme.palette.grey[50],
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
          <Chip label="Admin" size="small" color="primary" sx={{ mt: 1 }} />
        </Box>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          Profile Settings
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          Preferences
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedAdminLayout;
