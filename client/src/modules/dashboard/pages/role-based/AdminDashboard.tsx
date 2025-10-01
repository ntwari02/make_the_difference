import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  People,
  DirectionsCar,
  School,
  Psychology,
  TrendingUp,
  MonetizationOn,
  Security,
  Settings,
  Notifications,
  Analytics,
  AdminPanelSettings,
  PersonAdd,
  Edit,
  Visibility,
  Block,
  CheckCircle,
  Warning,
  Error,
  Info,
  Refresh,
  ShowChart,
  CloudDone,
  Dashboard,
  Payment,
  AccountBalance,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageContainer, CardGrid, ResponsiveStack } from '../../../../shared/components/layout/Containers';

// Mock data based on backend analysis
const mockAdminData = {
  overview: {
    totalUsers: 15420,
    activeUsers: 12850,
    totalRevenue: 1250000,
    monthlyRevenue: 85000,
    totalCourses: 1250,
    totalCars: 3400,
    totalScholarships: 450,
    totalVisaApplications: 1200,
    systemUptime: 99.8,
    aiServicesStatus: 'operational',
    lastBackup: '2024-01-22T10:30:00Z',
  },
  users: {
    byRole: [
      { role: 'student', count: 8500, percentage: 55.1 },
      { role: 'instructor', count: 1200, percentage: 7.8 },
      { role: 'buyer', count: 2100, percentage: 13.6 },
      { role: 'seller', count: 1800, percentage: 11.7 },
      { role: 'dealer', count: 450, percentage: 2.9 },
      { role: 'university', count: 120, percentage: 0.8 },
      { role: 'visa_officer', count: 80, percentage: 0.5 },
      { role: 'advertiser', count: 200, percentage: 1.3 },
      { role: 'admin', count: 15, percentage: 0.1 },
    ],
    recent: [
      {
        id: 1,
        name: 'Alex Johnson',
        email: 'alex@example.com',
        role: 'student',
        status: 'active',
        joinDate: '2024-01-20',
        lastActive: '2 hours ago',
        avatar: '/api/placeholder/40/40',
      },
      {
        id: 2,
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        role: 'instructor',
        status: 'active',
        joinDate: '2024-01-19',
        lastActive: '1 day ago',
        avatar: '/api/placeholder/40/40',
      },
      {
        id: 3,
        name: 'Mike Chen',
        email: 'mike@example.com',
        role: 'buyer',
        status: 'pending',
        joinDate: '2024-01-22',
        lastActive: 'Never',
        avatar: '/api/placeholder/40/40',
      },
    ],
  },
  analytics: {
    revenue: {
      daily: [1200, 1500, 1800, 2100, 1900, 2200, 2500],
      monthly: [45000, 52000, 48000, 61000, 58000, 72000, 85000],
      growth: 18.5,
    },
    users: {
      daily: [45, 52, 48, 61, 58, 72, 85],
      monthly: [1200, 1350, 1280, 1450, 1380, 1620, 1850],
      growth: 12.3,
    },
    courses: {
      enrollments: [120, 150, 180, 210, 190, 220, 250],
      completions: [85, 95, 110, 125, 115, 135, 150],
      growth: 15.2,
    },
    cars: {
      listings: [25, 30, 35, 40, 38, 45, 50],
      sales: [15, 18, 22, 25, 23, 28, 32],
      growth: 8.7,
    },
  },
  ai: {
    status: {
      chatbot: { status: 'active', accuracy: 87, responseTime: '1.2s' },
      dynamicPricing: { status: 'active', accuracy: 92, responseTime: '0.8s' },
      personalization: { status: 'active', accuracy: 89, responseTime: '1.5s' },
      analytics: { status: 'active', accuracy: 94, responseTime: '2.1s' },
    },
    insights: [
      {
        id: 1,
        type: 'trend',
        title: 'Course Enrollment Surge',
        description: 'AI detected 25% increase in course enrollments this week',
        impact: 'high',
        confidence: 92,
        action: 'Consider scaling server capacity',
      },
      {
        id: 2,
        type: 'anomaly',
        title: 'Unusual Payment Pattern',
        description: 'Detected unusual payment pattern in car sales',
        impact: 'medium',
        confidence: 78,
        action: 'Review payment logs',
      },
      {
        id: 3,
        type: 'recommendation',
        title: 'Dynamic Pricing Optimization',
        description: 'AI suggests adjusting car prices for better conversion',
        impact: 'high',
        confidence: 95,
        action: 'Apply pricing recommendations',
      },
    ],
  },
  system: {
    performance: {
      cpu: 45,
      memory: 62,
      storage: 78,
      network: 89,
    },
    alerts: [
      {
        id: 1,
        type: 'warning',
        title: 'High Memory Usage',
        message: 'Server memory usage is at 85%',
        timestamp: '2024-01-22T14:30:00Z',
        resolved: false,
      },
      {
        id: 2,
        type: 'info',
        title: 'Backup Completed',
        message: 'Daily backup completed successfully',
        timestamp: '2024-01-22T10:30:00Z',
        resolved: true,
      },
      {
        id: 3,
        type: 'error',
        title: 'Payment Gateway Issue',
        message: 'Temporary issue with Stripe integration',
        timestamp: '2024-01-22T09:15:00Z',
        resolved: true,
      },
    ],
  },
  payments: {
    total: 1250000,
    monthly: 85000,
    methods: [
      { method: 'stripe', amount: 45000, percentage: 52.9 },
      { method: 'paypal', amount: 20000, percentage: 23.5 },
      { method: 'crypto', amount: 10000, percentage: 11.8 },
      { method: 'bank_transfer', amount: 10000, percentage: 11.8 },
    ],
    transactions: [
      {
        id: 1,
        user: 'Alex Johnson',
        type: 'course_purchase',
        amount: 299,
        method: 'stripe',
        status: 'completed',
        timestamp: '2024-01-22T14:30:00Z',
      },
      {
        id: 2,
        user: 'Sarah Wilson',
        type: 'car_sale',
        amount: 25000,
        method: 'paypal',
        status: 'completed',
        timestamp: '2024-01-22T13:45:00Z',
      },
      {
        id: 3,
        user: 'Mike Chen',
        type: 'scholarship_fee',
        amount: 150,
        method: 'crypto',
        status: 'pending',
        timestamp: '2024-01-22T12:20:00Z',
      },
    ],
  },
};

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const [data] = useState(mockAdminData);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isSystemDialogOpen, setIsSystemDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Animation variants
  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSystemAction = (action: string) => {
    console.log(`System action: ${action}`);
    setSnackbar({
      open: true,
      message: `System ${action} completed`,
      severity: 'success',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'pending': return theme.palette.warning.main;
      case 'inactive': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'pending': return <Warning />;
      case 'inactive': return <Error />;
      default: return <Info />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      case 'info': return <Info />;
      default: return <Notifications />;
    }
  };

  return (
    <PageContainer maxWidth="xl">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.primary.main} 100%)`,
            borderRadius: 3,
            p: 4,
            mb: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '50%',
              height: '100%',
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3,
            }}
          />
          
          <ResponsiveStack direction="row" spacing={3} alignItems="center">
            <Avatar
              sx={{
                width: 80,
                height: 80,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              <AdminPanelSettings />
            </Avatar>
            
            <Box flex={1}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Universal Admin Control Center 🛡️
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Complete system management and monitoring dashboard
              </Typography>
              
              <ResponsiveStack direction="row" spacing={2}>
                <Chip
                  icon={<People />}
                  label={`${data.overview.totalUsers.toLocaleString()} Users`}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                <Chip
                  icon={<MonetizationOn />}
                  label={`$${data.overview.totalRevenue.toLocaleString()}`}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                <Chip
                  icon={<Psychology />}
                  label="AI Operational"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </ResponsiveStack>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
                onClick={() => handleSystemAction('refresh')}
              >
                Refresh Data
              </Button>
              <Button
                variant="contained"
                startIcon={<Settings />}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
                onClick={() => setIsSystemDialogOpen(true)}
              >
                System Settings
              </Button>
            </Stack>
          </ResponsiveStack>
        </Box>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <CardGrid columns={{ xs: 2, sm: 4 }} spacing={2} sx={{ mb: 4 }}>
          {[
            {
              title: 'Total Revenue',
              value: `$${data.overview.totalRevenue.toLocaleString()}`,
              icon: <MonetizationOn />,
              color: theme.palette.success.main,
              subtitle: 'All time',
              trend: '+18.5%',
            },
            {
              title: 'Active Users',
              value: data.overview.activeUsers.toLocaleString(),
              icon: <People />,
              color: theme.palette.primary.main,
              subtitle: 'Currently online',
              trend: '+12.3%',
            },
            {
              title: 'System Uptime',
              value: `${data.overview.systemUptime}%`,
              icon: <CloudDone />,
              color: theme.palette.info.main,
              subtitle: 'Last 30 days',
              trend: '+0.2%',
            },
            {
              title: 'AI Services',
              value: '4/4 Active',
              icon: <Psychology />,
              color: theme.palette.warning.main,
              subtitle: 'All operational',
              trend: '100%',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={statsVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                  border: `1px solid ${stat.color}20`,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: `${stat.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.subtitle}
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight="bold">
                    {stat.trend}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </CardGrid>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
              <Tab label="Overview" icon={<Dashboard />} />
              <Tab label="Users" icon={<People />} />
              <Tab label="Analytics" icon={<Analytics />} />
              <Tab label="AI Services" icon={<Psychology />} />
              <Tab label="System" icon={<Settings />} />
              <Tab label="Payments" icon={<Payment />} />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 3 }}>
            {/* Overview Tab */}
            {activeTab === 0 && (
              <Box display="flex" flexWrap="wrap" gap={3}>
                {/* Platform Statistics */}
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Platform Statistics
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      { label: 'Total Courses', value: data.overview.totalCourses, icon: <School /> },
                      { label: 'Car Listings', value: data.overview.totalCars, icon: <DirectionsCar /> },
                      { label: 'Scholarships', value: data.overview.totalScholarships, icon: <AccountBalance /> },
                      { label: 'Visa Applications', value: data.overview.totalVisaApplications, icon: <Security /> },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: theme.palette.grey[50],
                            border: `1px solid ${theme.palette.grey[200]}`,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.primary.main + '20',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                              color: theme.palette.primary.main,
                            }}
                          >
                            {stat.icon}
                          </Box>
                          <Box flex={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {stat.value.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {stat.label}
                            </Typography>
                          </Box>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>

                {/* User Distribution */}
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    User Distribution
                  </Typography>
                  <Stack spacing={1}>
                    {data.users.byRole.map((role, index) => (
                      <motion.div
                        key={role.role}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: theme.palette.grey[50],
                            border: `1px solid ${theme.palette.grey[200]}`,
                          }}
                        >
                          <Box flex={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {role.count.toLocaleString()} users
                            </Typography>
                          </Box>
                          <Box sx={{ width: 100, mr: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={role.percentage}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="caption" fontWeight="bold">
                            {role.percentage}%
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </Box>
            )}

            {/* Users Tab */}
            {activeTab === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    User Management
                  </Typography>
                  <Button variant="contained" startIcon={<PersonAdd />}>
                    Add User
                  </Button>
                </Box>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Join Date</TableCell>
                        <TableCell>Last Active</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.users.recent.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(user.status)}
                              label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(user.status) + '20',
                                color: getStatusColor(user.status),
                              }}
                            />
                          </TableCell>
                          <TableCell>{user.joinDate}</TableCell>
                          <TableCell>{user.lastActive}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View">
                                <IconButton size="small" onClick={() => setSelectedUser(user)}>
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small">
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Block">
                                <IconButton size="small">
                                  <Block />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Analytics Tab */}
            {activeTab === 2 && (
              <Box display="flex" flexWrap="wrap" gap={3}>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Revenue Analytics
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShowChart sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Revenue chart will be rendered here
                    </Typography>
                  </Card>
                </Box>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    User Growth
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp sx={{ fontSize: 64, color: theme.palette.success.main }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      User growth chart will be rendered here
                    </Typography>
                  </Card>
                </Box>
              </Box>
            )}

            {/* AI Services Tab */}
            {activeTab === 3 && (
              <Box display="flex" flexWrap="wrap" gap={3}>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    AI Services Status
                  </Typography>
                  <Stack spacing={2}>
                    {Object.entries(data.ai.status).map(([service, status]: [string, any], index) => (
                      <motion.div
                        key={service}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {service.charAt(0).toUpperCase() + service.slice(1)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Accuracy: {status.accuracy}% • Response: {status.responseTime}
                              </Typography>
                            </Box>
                            <Chip
                              label={status.status}
                              color="success"
                              size="small"
                            />
                          </Box>
                        </Card>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    AI Insights
                  </Typography>
                  <Stack spacing={2}>
                    {data.ai.insights.map((insight, index) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: theme.palette.primary.main + '20',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: theme.palette.primary.main,
                              }}
                            >
                              <Psychology />
                            </Box>
                            <Box flex={1}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {insight.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {insight.description}
                              </Typography>
                              <Typography variant="caption" color="primary" fontWeight="bold">
                                Confidence: {insight.confidence}%
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </Box>
            )}

            {/* System Tab */}
            {activeTab === 4 && (
              <Box display="flex" flexWrap="wrap" gap={3}>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    System Performance
                  </Typography>
                  <Stack spacing={2}>
                    {Object.entries(data.system.performance).map(([metric, value]: [string, number], index) => (
                      <motion.div
                        key={metric}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {metric.charAt(0).toUpperCase() + metric.slice(1)}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {value}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={value}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.palette.grey[200],
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: value > 80 ? theme.palette.error.main : 
                                                value > 60 ? theme.palette.warning.main : 
                                                theme.palette.success.main,
                              },
                            }}
                          />
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    System Alerts
                  </Typography>
                  <Stack spacing={2}>
                    {data.system.alerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Alert
                          severity={alert.type as any}
                          icon={getAlertIcon(alert.type)}
                          sx={{ mb: 1 }}
                        >
                          <Typography variant="subtitle2" fontWeight="bold">
                            {alert.title}
                          </Typography>
                          <Typography variant="body2">
                            {alert.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(alert.timestamp).toLocaleString()}
                          </Typography>
                        </Alert>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </Box>
            )}

            {/* Payments Tab */}
            {activeTab === 5 && (
              <Box display="flex" flexWrap="wrap" gap={3}>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Payment Methods Distribution
                  </Typography>
                  <Stack spacing={2}>
                    {data.payments.methods.map((method, index) => (
                      <motion.div
                        key={method.method}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: theme.palette.grey[50],
                            border: `1px solid ${theme.palette.grey[200]}`,
                          }}
                        >
                          <Box flex={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {method.method.charAt(0).toUpperCase() + method.method.slice(1)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ${method.amount.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ width: 100, mr: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={method.percentage}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="caption" fontWeight="bold">
                            {method.percentage}%
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Recent Transactions
                  </Typography>
                  <Stack spacing={1}>
                    {data.payments.transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: theme.palette.grey[50],
                            border: `1px solid ${theme.palette.grey[200]}`,
                          }}
                        >
                          <Box flex={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {transaction.user}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.type} • {transaction.method}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="body2" fontWeight="bold">
                              ${transaction.amount.toLocaleString()}
                            </Typography>
                            <Chip
                              label={transaction.status}
                              size="small"
                              color={transaction.status === 'completed' ? 'success' : 'warning'}
                            />
                          </Box>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onClose={() => setIsUserDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedUser.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedUser.email}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Role: {selectedUser.role}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Status: {selectedUser.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUserDialogOpen(false)}>Close</Button>
          <Button variant="contained">Edit User</Button>
        </DialogActions>
      </Dialog>

      {/* System Settings Dialog */}
      <Dialog open={isSystemDialogOpen} onClose={() => setIsSystemDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>System Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable AI Services"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable Notifications"
            />
            <FormControlLabel
              control={<Switch />}
              label="Maintenance Mode"
            />
            <FormControl fullWidth>
              <InputLabel>Default User Role</InputLabel>
              <Select defaultValue="student">
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="instructor">Instructor</MenuItem>
                <MenuItem value="buyer">Buyer</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSystemDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>

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
    </PageContainer>
  );
};

export default AdminDashboard;