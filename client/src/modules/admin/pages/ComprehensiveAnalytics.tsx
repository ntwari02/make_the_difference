import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  useTheme,
  LinearProgress,
  Chip,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  People,
  School,
  DirectionsCar,
  Analytics as AnalyticsIcon,
  ShowChart,
  PieChart,
  BarChart,
  Timeline,
  Download,
  Refresh,
  DateRange,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ComprehensiveAnalytics: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');

  // Mock analytics data
  const revenueData = {
    total: 1250000,
    growth: 18.5,
    monthly: 85000,
    daily: 2800,
    bySource: [
      { source: 'Courses', amount: 650000, percentage: 52 },
      { source: 'Car Sales', amount: 450000, percentage: 36 },
      { source: 'Scholarships', amount: 100000, percentage: 8 },
      { source: 'Other', amount: 50000, percentage: 4 },
    ],
    trends: [
      { month: 'Jan', revenue: 45000, users: 1200 },
      { month: 'Feb', revenue: 52000, users: 1350 },
      { month: 'Mar', revenue: 48000, users: 1280 },
      { month: 'Apr', revenue: 61000, users: 1450 },
      { month: 'May', revenue: 58000, users: 1380 },
      { month: 'Jun', revenue: 72000, users: 1620 },
      { month: 'Jul', revenue: 85000, users: 1850 },
    ],
  };

  const userAnalytics = {
    total: 15420,
    active: 12850,
    growth: 12.3,
    newUsers: 450,
    retention: 78.5,
    byRole: [
      { role: 'Students', count: 8500, percentage: 55.1, growth: 15.2 },
      { role: 'Instructors', count: 1200, percentage: 7.8, growth: 8.7 },
      { role: 'Buyers', count: 2100, percentage: 13.6, growth: 22.1 },
      { role: 'Sellers', count: 1800, percentage: 11.7, growth: 18.9 },
      { role: 'Others', count: 1820, percentage: 11.8, growth: 5.4 },
    ],
    engagement: [
      { metric: 'Daily Active Users', value: 3200, change: 8.5 },
      { metric: 'Session Duration', value: '12m 34s', change: 15.2 },
      { metric: 'Page Views', value: 45600, change: -2.1 },
      { metric: 'Bounce Rate', value: '32.1%', change: -5.8 },
    ],
  };

  const contentAnalytics = {
    courses: {
      total: 1250,
      published: 1100,
      enrollments: 25600,
      completion: 68.5,
      topPerforming: [
        { title: 'Advanced React Development', enrollments: 1250, rating: 4.8, revenue: 374000 },
        { title: 'Digital Marketing Mastery', enrollments: 850, rating: 4.6, revenue: 169150 },
        { title: 'Data Science Fundamentals', enrollments: 650, rating: 4.9, revenue: 259350 },
      ],
    },
    cars: {
      total: 3400,
      active: 2850,
      views: 125000,
      sales: 450,
      topCategories: [
        { category: 'SUV', listings: 850, sales: 125, avgPrice: 45000 },
        { category: 'Sedan', listings: 650, sales: 98, avgPrice: 28000 },
        { category: 'Electric', listings: 420, sales: 85, avgPrice: 65000 },
      ],
    },
    scholarships: {
      total: 450,
      active: 380,
      applications: 12500,
      awarded: 1250,
      totalAmount: 15750000,
    },
  };

  const performanceMetrics = {
    system: {
      uptime: 99.8,
      responseTime: 245,
      errorRate: 0.02,
      throughput: 1250,
    },
    ai: {
      chatbotAccuracy: 87,
      pricingAccuracy: 92,
      personalizationScore: 89,
      recommendationCTR: 15.6,
    },
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp color="success" fontSize="small" />
    ) : (
      <TrendingDown color="error" fontSize="small" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? theme.palette.success.main : theme.palette.error.main;
  };

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Analytics & Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive insights and performance metrics
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="1y">Last year</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<Download />}>
              Export
            </Button>
            <Button variant="contained" startIcon={<Refresh />}>
              Refresh
            </Button>
          </Stack>
        </Box>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: 'Total Revenue',
              value: `$${revenueData.total.toLocaleString()}`,
              growth: revenueData.growth,
              icon: <MonetizationOn />,
              color: theme.palette.success.main,
            },
            {
              title: 'Active Users',
              value: userAnalytics.active.toLocaleString(),
              growth: userAnalytics.growth,
              icon: <People />,
              color: theme.palette.primary.main,
            },
            {
              title: 'Course Enrollments',
              value: contentAnalytics.courses.enrollments.toLocaleString(),
              growth: 15.2,
              icon: <School />,
              color: theme.palette.info.main,
            },
            {
              title: 'Car Sales',
              value: contentAnalytics.cars.sales.toLocaleString(),
              growth: 8.7,
              icon: <DirectionsCar />,
              color: theme.palette.warning.main,
            },
          ].map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={metric.title}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: `${metric.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: metric.color,
                        }}
                      >
                        {metric.icon}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="h5" fontWeight="bold" color={metric.color}>
                          {metric.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {metric.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                          {getGrowthIcon(metric.growth)}
                          <Typography
                            variant="caption"
                            color={getGrowthColor(metric.growth)}
                            fontWeight="bold"
                          >
                            {metric.growth > 0 ? '+' : ''}{metric.growth}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Main Analytics Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab icon={<MonetizationOn />} label="Revenue" />
              <Tab icon={<People />} label="Users" />
              <Tab icon={<AnalyticsIcon />} label="Content" />
              <Tab icon={<ShowChart />} label="Performance" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Revenue Analytics */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Revenue by Source
                  </Typography>
                  <Stack spacing={2}>
                    {revenueData.bySource.map((source, index) => (
                      <motion.div
                        key={source.source}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" fontWeight="bold">
                              {source.source}
                            </Typography>
                            <Typography variant="body2">
                              ${source.amount.toLocaleString()} ({source.percentage}%)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={source.percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.palette.grey[200],
                            }}
                          />
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Monthly Trends
                  </Typography>
                  <Card sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Timeline sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Revenue trend chart visualization
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* User Analytics */}
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    User Distribution by Role
                  </Typography>
                  <Stack spacing={2}>
                    {userAnalytics.byRole.map((role, index) => (
                      <motion.div
                        key={role.role}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" fontWeight="bold">
                              {role.role}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {role.count.toLocaleString()}
                              </Typography>
                              <Chip
                                label={`+${role.growth}%`}
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={role.percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.palette.grey[200],
                            }}
                          />
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Engagement Metrics
                  </Typography>
                  <Stack spacing={2}>
                    {userAnalytics.engagement.map((metric, index) => (
                      <motion.div
                        key={metric.metric}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              {metric.metric}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="h6" fontWeight="bold">
                                {metric.value}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                {getGrowthIcon(metric.change)}
                                <Typography
                                  variant="caption"
                                  color={getGrowthColor(metric.change)}
                                  fontWeight="bold"
                                >
                                  {metric.change > 0 ? '+' : ''}{metric.change}%
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      </motion.div>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            )}

            {/* Content Analytics */}
            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Top Performing Courses
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Course</TableCell>
                          <TableCell>Enrollments</TableCell>
                          <TableCell>Rating</TableCell>
                          <TableCell>Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contentAnalytics.courses.topPerforming.map((course, index) => (
                          <motion.tr
                            key={course.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {course.title}
                              </Typography>
                            </TableCell>
                            <TableCell>{course.enrollments.toLocaleString()}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Typography variant="body2">{course.rating}</Typography>
                                <Typography variant="body2">⭐</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>${course.revenue.toLocaleString()}</TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Car Categories Performance
                  </Typography>
                  <Stack spacing={2}>
                    {contentAnalytics.cars.topCategories.map((category, index) => (
                      <motion.div
                        key={category.category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card sx={{ p: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            {category.category}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">
                                Listings
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {category.listings}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">
                                Sales
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {category.sales}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">
                                Avg Price
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                ${category.avgPrice.toLocaleString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Card>
                      </motion.div>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Scholarship Statistics
                  </Typography>
                  <Card sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Total Applications
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                          {contentAnalytics.scholarships.applications.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Awards Given
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                          {contentAnalytics.scholarships.awarded.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Total Amount Awarded
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="warning.main">
                          ${contentAnalytics.scholarships.totalAmount.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Performance Analytics */}
            {activeTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    System Performance
                  </Typography>
                  <Stack spacing={2}>
                    {Object.entries(performanceMetrics.system).map(([metric, value], index) => (
                      <motion.div
                        key={metric}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {metric.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {typeof value === 'number' ? 
                                (metric === 'uptime' ? `${value}%` : 
                                 metric === 'responseTime' ? `${value}ms` :
                                 metric === 'errorRate' ? `${value}%` : value) 
                                : value}
                            </Typography>
                          </Box>
                        </Card>
                      </motion.div>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    AI Performance
                  </Typography>
                  <Stack spacing={2}>
                    {Object.entries(performanceMetrics.ai).map(([metric, value], index) => (
                      <motion.div
                        key={metric}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {metric.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="secondary">
                              {typeof value === 'number' ? `${value}%` : value}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={typeof value === 'number' ? value : 0}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: theme.palette.grey[200],
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: theme.palette.secondary.main,
                              },
                            }}
                          />
                        </Card>
                      </motion.div>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ComprehensiveAnalytics;
