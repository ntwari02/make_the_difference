import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Collapse,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  School,
  DirectionsCar,
  Psychology,
  TrendingUp,
  Assignment,
  Payment,
  Security,
  ExpandLess,
  ExpandMore,
  ShoppingCart,
  Quiz,
  EmojiEvents,
  AccountBalance,
  AdminPanelSettings,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  onClose: () => void;
  isMobile: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  roles?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAnyRole } = useAuth();
  
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      path: '/app/dashboard',
      roles: ['admin', 'student', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'advertiser'],
    },
    {
      id: 'elearning',
      label: 'E-Learning',
      icon: <School />,
      children: [
        {
          id: 'courses',
          label: 'Courses',
          icon: <Assignment />,
          path: '/app/courses',
          roles: ['admin', 'student', 'instructor', 'university'],
        },
        {
          id: 'quizzes',
          label: 'Quizzes',
          icon: <Quiz />,
          path: '/app/quizzes',
          roles: ['admin', 'student', 'instructor', 'university'],
        },
        {
          id: 'certificates',
          label: 'Certificates',
          icon: <EmojiEvents />,
          path: '/app/certificates',
          roles: ['admin', 'student', 'instructor', 'university'],
        },
      ],
      roles: ['admin', 'student', 'instructor', 'university'],
    },
    {
      id: 'ecommerce',
      label: 'E-Commerce',
      icon: <DirectionsCar />,
      children: [
        {
          id: 'cars',
          label: 'Cars',
          icon: <DirectionsCar />,
          path: '/app/cars',
          roles: ['admin', 'buyer', 'seller', 'dealer'],
        },
        {
          id: 'spare-parts',
          label: 'Spare Parts',
          icon: <ShoppingCart />,
          path: '/app/spare-parts',
          roles: ['admin', 'buyer', 'seller', 'dealer'],
        },
        {
          id: 'payments',
          label: 'Payments',
          icon: <Payment />,
          path: '/app/payments',
          roles: ['admin', 'buyer', 'seller', 'dealer'],
        },
      ],
      roles: ['admin', 'buyer', 'seller', 'dealer'],
    },
    {
      id: 'ai',
      label: 'AI Features',
      icon: <Psychology />,
      path: '/app/ai',
      roles: ['admin', 'student', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'advertiser'],
    },
    {
      id: 'scholarships',
      label: 'Scholarships',
      icon: <AccountBalance />,
      path: '/app/scholarships',
      roles: ['admin', 'student', 'university'],
    },
    {
      id: 'visa',
      label: 'Visa Management',
      icon: <Security />,
      path: '/app/visa',
      roles: ['admin', 'visa_officer'],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <TrendingUp />,
      path: '/app/analytics',
      roles: ['admin', 'instructor', 'seller', 'dealer', 'advertiser'],
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: <AdminPanelSettings />,
      path: '/app/admin',
      roles: ['admin'],
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      // Toggle expanded state
      setExpandedItems(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.path) {
      navigate(item.path);
      if (isMobile) {
        onClose();
      }
    }
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.path && location.pathname === item.path) {
      return true;
    }
    if (item.children) {
      return item.children.some(child => 
        child.path && location.pathname.startsWith(child.path)
      );
    }
    return false;
  };

  const canAccessItem = (item: MenuItem): boolean => {
    if (!item.roles) return true;
    return hasAnyRole(item.roles as any);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    if (!canAccessItem(item)) return null;

    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              pl: 2 + level * 2,
              py: 1,
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              backgroundColor: isActive 
                ? theme.palette.primary.main 
                : 'transparent',
              color: isActive 
                ? theme.palette.primary.contrastText 
                : theme.palette.text.primary,
              '&:hover': {
                backgroundColor: isActive 
                  ? theme.palette.primary.dark 
                  : theme.palette.action.hover,
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive 
                  ? theme.palette.primary.contrastText 
                  : theme.palette.text.secondary,
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: isActive ? 'bold' : 'normal',
                fontSize: '0.875rem',
              }}
            />
            {hasChildren && (
              <IconButton
                size="small"
                sx={{
                  color: isActive 
                    ? theme.palette.primary.contrastText 
                    : theme.palette.text.secondary,
                }}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </ListItemButton>
        </ListItem>

        {/* Render children */}
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{
              py: 0.5,
            }}
          >
            <Box
              component="img"
              src="/logo.jpg"
              alt="Reaglex Logo"
              sx={{
                width: 48,
                height: 48,
                objectFit: 'cover',
                borderRadius: '50%',
                border: `2px solid ${theme.palette.primary.main}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                  borderColor: theme.palette.primary.light,
                },
              }}
            />
          </Box>
        </motion.div>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="caption" color="text.secondary" textAlign="center">
          © 2024 Reaglex Platform
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={true}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          border: 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
