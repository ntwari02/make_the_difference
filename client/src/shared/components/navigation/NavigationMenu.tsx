import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home,
  Dashboard,
  School,
  DirectionsCar,
  ShoppingCart,
  Quiz,
  EmojiEvents,
  AccountBalance,
  AdminPanelSettings,
  Security,
  Settings,
  Person,
  Psychology,
  TrendingUp,
  People,
  Assignment,
  Payment,
  Notifications,
  ExpandMore,
  ExpandLess,
  Public,
  Login,
  PersonAdd,
  LockReset,
  Help,
  Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/hooks/useAuth';

interface NavigationSection {
  title: string;
  icon: React.ReactNode;
  routes: NavigationRoute[];
  color: string;
}

interface NavigationRoute {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  requiresAuth?: boolean;
  requiredRole?: string;
}

const NavigationMenu: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    public: true,
    auth: false,
    app: false,
    admin: false,
  });

  const navigationSections: NavigationSection[] = [
    {
      title: 'Public Pages',
      icon: <Public />,
      color: theme.palette.primary.main,
      routes: [
        {
          path: '/',
          label: 'Home',
          icon: <Home />,
          description: 'Landing page with features and pricing',
        },
      ],
    },
    {
      title: 'Authentication',
      icon: <Security />,
      color: theme.palette.secondary.main,
      routes: [
        {
          path: '/auth/login',
          label: 'Login',
          icon: <Login />,
          description: 'Sign in to your account',
        },
        {
          path: '/auth/register',
          label: 'Register',
          icon: <PersonAdd />,
          description: 'Create a new account',
        },
        {
          path: '/auth/forgot-password',
          label: 'Forgot Password',
          icon: <LockReset />,
          description: 'Reset your password',
        },
        {
          path: '/auth/security-questions',
          label: 'Security Questions',
          icon: <Help />,
          description: 'Set up security questions',
        },
      ],
    },
    {
      title: 'Main Application',
      icon: <Dashboard />,
      color: theme.palette.success.main,
      routes: [
        {
          path: '/app/dashboard',
          label: 'Dashboard',
          icon: <Dashboard />,
          description: 'Role-based dashboard',
          requiresAuth: true,
        },
        {
          path: '/app/profile',
          label: 'Profile',
          icon: <Person />,
          description: 'User profile management',
          requiresAuth: true,
        },
        {
          path: '/app/settings',
          label: 'Settings',
          icon: <Settings />,
          description: 'Application settings',
          requiresAuth: true,
        },
        {
          path: '/app/cars',
          label: 'Car Listings',
          icon: <DirectionsCar />,
          description: 'Browse and search cars',
          requiresAuth: true,
        },
        {
          path: '/app/checkout',
          label: 'Checkout',
          icon: <ShoppingCart />,
          description: 'Complete your purchase',
          requiresAuth: true,
        },
        {
          path: '/app/courses',
          label: 'Course Catalog',
          icon: <School />,
          description: 'Browse available courses',
          requiresAuth: true,
        },
        {
          path: '/app/courses/my-courses',
          label: 'My Courses',
          icon: <Quiz />,
          description: 'Your enrolled courses',
          requiresAuth: true,
        },
      ],
    },
    {
      title: 'Admin Panel',
      icon: <AdminPanelSettings />,
      color: theme.palette.error.main,
      routes: [
        {
          path: '/admin/dashboard',
          label: 'Admin Dashboard',
          icon: <AdminPanelSettings />,
          description: 'System overview and analytics',
          requiresAuth: true,
          requiredRole: 'admin',
        },
        {
          path: '/admin/users',
          label: 'User Management',
          icon: <People />,
          description: 'Manage users and roles',
          requiresAuth: true,
          requiredRole: 'admin',
        },
        {
          path: '/admin/content',
          label: 'Content Management',
          icon: <Assignment />,
          description: 'Manage content and courses',
          requiresAuth: true,
          requiredRole: 'admin',
        },
        {
          path: '/admin/settings',
          label: 'System Settings',
          icon: <Settings />,
          description: 'Configure system settings',
          requiresAuth: true,
          requiredRole: 'admin',
        },
        {
          path: '/admin/analytics',
          label: 'Analytics',
          icon: <TrendingUp />,
          description: 'View system analytics',
          requiresAuth: true,
          requiredRole: 'admin',
        },
      ],
    },
  ];

  const handleNavigate = (route: NavigationRoute) => {
    if (route.requiresAuth && !isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    
    if (route.requiredRole && user?.role !== route.requiredRole) {
      // Show error or redirect to appropriate dashboard
      navigate('/app/dashboard');
      return;
    }
    
    navigate(route.path);
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle.toLowerCase().replace(' ', '_')]: !prev[sectionTitle.toLowerCase().replace(' ', '_')]
    }));
  };

  const isRouteAccessible = (route: NavigationRoute): boolean => {
    if (!route.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (route.requiredRole && user?.role !== route.requiredRole) return false;
    return true;
  };

  const getSectionKey = (title: string): string => {
    return title.toLowerCase().replace(' ', '_');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        🗺️ Navigation Menu
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Complete navigation links to access all pages and features in the application
      </Typography>

      <Grid container spacing={3}>
        {navigationSections.map((section, sectionIndex) => {
          const sectionKey = getSectionKey(section.title);
          const isExpanded = expandedSections[sectionKey];
          
          return (
            <Grid item xs={12} md={6} key={section.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    border: `2px solid ${section.color}20`,
                    '&:hover': {
                      border: `2px solid ${section.color}`,
                      boxShadow: theme.shadows[8],
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={2}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: `${section.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: section.color,
                          }}
                        >
                          {section.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                          {section.title}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => toggleSection(section.title)}
                        size="small"
                      >
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    <Collapse in={isExpanded}>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {section.routes.map((route, routeIndex) => {
                          const isAccessible = isRouteAccessible(route);
                          const isCurrentRoute = location.pathname === route.path;
                          
                          return (
                            <motion.div
                              key={route.path}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: routeIndex * 0.05 }}
                            >
                              <Button
                                fullWidth
                                variant={isCurrentRoute ? 'contained' : 'outlined'}
                                startIcon={route.icon}
                                onClick={() => handleNavigate(route)}
                                disabled={!isAccessible}
                                sx={{
                                  justifyContent: 'flex-start',
                                  textAlign: 'left',
                                  p: 2,
                                  mb: 1,
                                  backgroundColor: isCurrentRoute ? section.color : 'transparent',
                                  borderColor: section.color,
                                  color: isCurrentRoute ? 'white' : section.color,
                                  '&:hover': {
                                    backgroundColor: isAccessible ? `${section.color}20` : 'transparent',
                                    borderColor: section.color,
                                  },
                                  '&:disabled': {
                                    opacity: 0.5,
                                    borderColor: theme.palette.grey[300],
                                    color: theme.palette.grey[500],
                                  },
                                }}
                              >
                                <Box>
                                  <Typography variant="body1" fontWeight="bold">
                                    {route.label}
                                  </Typography>
                                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                    {route.description}
                                  </Typography>
                                </Box>
                              </Button>
                            </motion.div>
                          );
                        })}
                      </Box>
                    </Collapse>

                    <Box display="flex" gap={1} mt={2}>
                      <Chip
                        label={`${section.routes.length} routes`}
                        size="small"
                        sx={{ backgroundColor: `${section.color}20`, color: section.color }}
                      />
                      {section.title === 'Admin Panel' && (
                        <Chip
                          label="Admin only"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                      {section.title === 'Main Application' && (
                        <Chip
                          label="Auth required"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Quick Access Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card sx={{ mt: 4, backgroundColor: theme.palette.grey[50] }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🚀 Quick Access
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Most commonly used pages and features
            </Typography>
            
            <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{ backgroundColor: theme.palette.primary.main }}
              >
                Home
              </Button>
              
              <Button
                variant="contained"
                startIcon={<Dashboard />}
                onClick={() => navigate('/app/dashboard')}
                disabled={!isAuthenticated}
                sx={{ backgroundColor: theme.palette.success.main }}
              >
                Dashboard
              </Button>
              
              <Button
                variant="contained"
                startIcon={<DirectionsCar />}
                onClick={() => navigate('/app/cars')}
                disabled={!isAuthenticated}
                sx={{ backgroundColor: theme.palette.info.main }}
              >
                Browse Cars
              </Button>
              
              <Button
                variant="contained"
                startIcon={<School />}
                onClick={() => navigate('/app/courses')}
                disabled={!isAuthenticated}
                sx={{ backgroundColor: theme.palette.warning.main }}
              >
                Courses
              </Button>
              
              {user?.role === 'admin' && (
                <Button
                  variant="contained"
                  startIcon={<AdminPanelSettings />}
                  onClick={() => navigate('/admin/dashboard')}
                  sx={{ backgroundColor: theme.palette.error.main }}
                >
                  Admin Panel
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current User Info */}
      {isAuthenticated && user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card sx={{ mt: 3, backgroundColor: theme.palette.primary.main + '10' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                👤 Current User
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body1">
                  <strong>Name:</strong> {user.first_name} {user.last_name}
                </Typography>
                <Chip
                  label={user.role}
                  color="primary"
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  <strong>Email:</strong> {user.email}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Box>
  );
};

export default NavigationMenu;
