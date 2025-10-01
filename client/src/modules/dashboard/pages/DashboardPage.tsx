import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import {
  School,
  DirectionsCar,
  Psychology,
  TrendingUp,
  People,
  Assignment,
  Notifications,
  Settings,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center">
          Please log in to access your dashboard
        </Typography>
      </Container>
    );
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: '#f44336',
      student: '#2196f3',
      instructor: '#4caf50',
      buyer: '#ff9800',
      seller: '#9c27b0',
      dealer: '#607d8b',
      university: '#795548',
    };
    return colors[role] || '#666';
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, React.ReactNode> = {
      admin: <Settings />,
      student: <School />,
      instructor: <Assignment />,
      buyer: <DirectionsCar />,
      seller: <DirectionsCar />,
      dealer: <DirectionsCar />,
      university: <School />,
    };
    return icons[role] || <People />;
  };

  const quickActions = [
    {
      title: 'My Courses',
      description: 'View and manage your courses',
      icon: <School />,
      color: '#2196f3',
      onClick: () => navigate('/app/courses'),
      visible: ['student', 'instructor', 'admin'].includes(user.role),
    },
    {
      title: 'Car Marketplace',
      description: 'Browse and buy cars',
      icon: <DirectionsCar />,
      color: '#4caf50',
      onClick: () => navigate('/app/cars'),
      visible: ['buyer', 'seller', 'dealer', 'admin'].includes(user.role),
    },
    {
      title: 'AI Assistant',
      description: 'Get personalized recommendations',
      icon: <Psychology />,
      color: '#9c27b0',
      onClick: () => navigate('/app/ai'),
      visible: true,
    },
    {
      title: 'Analytics',
      description: 'View your performance metrics',
      icon: <TrendingUp />,
      color: '#ff9800',
      onClick: () => navigate('/app/analytics'),
      visible: ['instructor', 'seller', 'dealer', 'admin'].includes(user.role),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: 'rgba(255, 255, 255, 0.2)',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                  }}
                >
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    Welcome back, {user.first_name}!
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                    {user.email}
                  </Typography>
                  <Chip
                    icon={getRoleIcon(user.role)}
                    label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    sx={{
                      background: getRoleColor(user.role),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              </Box>
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography variant="h5" component="h2" fontWeight="bold" mb={3}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions
              .filter(action => action.visible)
              .map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        },
                      }}
                      onClick={action.onClick}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: `${action.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            color: action.color,
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Typography variant="h6" component="h3" fontWeight="bold" mb={1}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
          </Grid>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Typography variant="h5" component="h2" fontWeight="bold" mb={3} mt={6}>
            Recent Activity
          </Typography>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Notifications color="primary" />
                <Typography variant="body1">
                  Welcome to Reaglex! Your account has been successfully created.
                </Typography>
                <Chip label="New" size="small" color="primary" />
              </Box>
              <Divider />
              <Box display="flex" alignItems="center" gap={2}>
                <School color="secondary" />
                <Typography variant="body1">
                  Complete your profile to get personalized recommendations.
                </Typography>
                <Chip label="Action Required" size="small" color="warning" />
              </Box>
              <Divider />
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp color="success" />
                <Typography variant="body1">
                  Explore our features and start your journey with Reaglex.
                </Typography>
                <Chip label="Info" size="small" color="info" />
              </Box>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default DashboardPage;
