import React, { useState } from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  DirectionsCar as CarIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  LocalOffer as TagIcon,
  ShowChart as ChartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DealerLayout from '../components/layout/DealerLayout';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const DealerAnalytics: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [timePeriod, setTimePeriod] = useState('30d');
  const [tabValue, setTabValue] = useState(0);

  // Mock analytics data
  const revenueData = [
    { month: 'Jan', revenue: 145000, sales: 12, target: 150000 },
    { month: 'Feb', revenue: 198000, sales: 19, target: 180000 },
    { month: 'Mar', revenue: 175000, sales: 15, target: 185000 },
    { month: 'Apr', revenue: 290000, sales: 25, target: 200000 },
    { month: 'May', revenue: 265000, sales: 22, target: 220000 },
    { month: 'Jun', revenue: 350000, sales: 30, target: 250000 },
  ];

  const dailyViewsData = [
    { day: 'Mon', views: 420, clicks: 89, inquiries: 12 },
    { day: 'Tue', views: 580, clicks: 124, inquiries: 18 },
    { day: 'Wed', views: 650, clicks: 145, inquiries: 21 },
    { day: 'Thu', views: 490, clicks: 98, inquiries: 15 },
    { day: 'Fri', views: 720, clicks: 167, inquiries: 24 },
    { day: 'Sat', views: 850, clicks: 201, inquiries: 29 },
    { day: 'Sun', views: 670, clicks: 134, inquiries: 19 },
  ];

  const vehicleTypeData = [
    { name: 'Sedan', value: 35, count: 18 },
    { name: 'SUV', value: 30, count: 15 },
    { name: 'Hatchback', value: 15, count: 8 },
    { name: 'Coupe', value: 10, count: 5 },
    { name: 'Pickup', value: 10, count: 5 },
  ];

  const performanceData = [
    { category: 'Response Time', value: 85 },
    { category: 'Customer Satisfaction', value: 92 },
    { category: 'Listing Quality', value: 88 },
    { category: 'Price Competitiveness', value: 78 },
    { category: 'Delivery Speed', value: 90 },
  ];

  const topVehiclesData = [
    {
      id: 1,
      name: '2023 Tesla Model 3',
      views: 1234,
      inquiries: 45,
      saves: 89,
      conversionRate: 3.6,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=100',
    },
    {
      id: 2,
      name: '2024 BMW X5',
      views: 892,
      inquiries: 38,
      saves: 67,
      conversionRate: 4.3,
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=100',
    },
    {
      id: 3,
      name: '2022 Toyota Camry',
      views: 456,
      inquiries: 22,
      saves: 34,
      conversionRate: 4.8,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=100',
    },
    {
      id: 4,
      name: '2021 Mercedes C-Class',
      views: 234,
      inquiries: 15,
      saves: 28,
      conversionRate: 6.4,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=100',
    },
  ];

  const COLORS = ['#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16'];
  
  // Gradient color generator for bars (cyan to green)
  const getBarColor = (index: number, total: number) => {
    const ratio = index / (total - 1);
    // Interpolate between cyan (#06b6d4) and green (#22c55e)
    return ratio < 0.5 ? '#06b6d4' : ratio < 0.75 ? '#14b8a6' : '#10b981';
  };

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: '$1,423,000',
      change: '+36.4%',
      trend: 'up',
      icon: <MoneyIcon />,
      color: '#06b6d4',
      subtitle: 'vs last period',
    },
    {
      title: 'Total Sales',
      value: '123',
      change: '+18.2%',
      trend: 'up',
      icon: <CarIcon />,
      color: '#14b8a6',
      subtitle: 'vehicles sold',
    },
    {
      title: 'Total Views',
      value: '15,420',
      change: '+24.5%',
      trend: 'up',
      icon: <ViewIcon />,
      color: '#10b981',
      subtitle: 'this month',
    },
    {
      title: 'Conversion Rate',
      value: '4.2%',
      change: '-0.8%',
      trend: 'down',
      icon: <ChartIcon />,
      color: '#f87171',
      subtitle: 'views to inquiries',
    },
    {
      title: 'Avg. Sale Price',
      value: '$11,569',
      change: '+5.3%',
      trend: 'up',
      icon: <TagIcon />,
      color: '#22c55e',
      subtitle: 'per vehicle',
    },
    {
      title: 'Active Listings',
      value: '38',
      change: '+3',
      trend: 'up',
      icon: <StarIcon />,
      color: '#84cc16',
      subtitle: 'currently active',
    },
  ];

  const handleExport = () => {
    // In production, generate and download CSV/PDF report
    const csvContent = `Period: ${timePeriod}\nTotal Revenue: $1,423,000\nTotal Sales: 123\nTotal Views: 15,420`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timePeriod}.csv`;
    a.click();
  };

  return (
    <DealerLayout>
      <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Analytics & Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your performance and make data-driven decisions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={timePeriod}
                label="Time Period"
                onChange={(e) => setTimePeriod(e.target.value)}
              >
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
                <MenuItem value="1y">Last Year</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {kpiCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${card.color}20`,
                        color: card.color,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {card.icon}
                    </Avatar>
                    <Chip
                      icon={card.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={card.change}
                      size="small"
                      color={card.trend === 'up' ? 'success' : 'error'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab label="Overview" />
            <Tab label="Sales" />
            <Tab label="Traffic" />
            <Tab label="Vehicles" />
            <Tab label="Performance" />
          </Tabs>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Revenue Chart */}
                <Grid item xs={12} lg={8}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Revenue & Sales Trends
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Monthly revenue and sales performance over time
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={revenueData}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="50%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="rgba(255,255,255,0.4)"
                        tick={{ fill: 'rgba(255,255,255,0.6)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.4)"
                        tick={{ fill: 'rgba(255,255,255,0.6)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }} />
                      <Bar dataKey="revenue" name="Revenue ($)" radius={[4, 4, 0, 0]}>
                        {revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(index, revenueData.length)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>

                {/* Vehicle Type Distribution */}
                <Grid item xs={12} lg={4}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Vehicle Distribution
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Sales by vehicle type
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={vehicleTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {vehicleTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>

                {/* Daily Views */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Weekly Traffic Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Views, clicks, and inquiries by day of the week
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyViewsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        stroke="rgba(255,255,255,0.4)"
                        tick={{ fill: 'rgba(255,255,255,0.6)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.4)"
                        tick={{ fill: 'rgba(255,255,255,0.6)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }} />
                      <Line type="monotone" dataKey="views" stroke="#06b6d4" strokeWidth={3} name="Views" dot={{ fill: '#06b6d4', r: 4 }} />
                      <Line type="monotone" dataKey="clicks" stroke="#14b8a6" strokeWidth={3} name="Clicks" dot={{ fill: '#14b8a6', r: 4 }} />
                      <Line type="monotone" dataKey="inquiries" stroke="#10b981" strokeWidth={3} name="Inquiries" dot={{ fill: '#10b981', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Sales Tab */}
          <TabPanel value={tabValue} index={1}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Sales Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="rgba(255,255,255,0.4)"
                        tick={{ fill: 'rgba(255,255,255,0.6)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.4)"
                        tick={{ fill: 'rgba(255,255,255,0.6)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }} />
                      <Bar dataKey="sales" name="Sales Count" radius={[4, 4, 0, 0]}>
                        {revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(index, revenueData.length)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Top Performing Vehicles
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Vehicle</TableCell>
                          <TableCell align="right">Views</TableCell>
                          <TableCell align="right">Inquiries</TableCell>
                          <TableCell align="right">Saves</TableCell>
                          <TableCell align="right">Conversion</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topVehiclesData.map((vehicle) => (
                          <TableRow key={vehicle.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar src={vehicle.image} variant="rounded" />
                                <Typography variant="body2" fontWeight={500}>
                                  {vehicle.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {vehicle.views.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip label={vehicle.inquiries} size="small" color="primary" />
                            </TableCell>
                            <TableCell align="right">
                              <Chip label={vehicle.saves} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={vehicle.conversionRate > 4 ? 'success.main' : 'text.secondary'}
                              >
                                {vehicle.conversionRate}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Traffic Tab */}
          <TabPanel value={tabValue} index={2}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Traffic Sources & Engagement
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dailyViewsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        stroke="rgba(255,255,255,0.4)"
                        tick={{ fill: 'rgba(255,255,255,0.6)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.4)"
                        tick={{ fill: 'rgba(255,255,255,0.6)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }} />
                      <Bar dataKey="views" fill="#06b6d4" name="Total Views" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="clicks" fill="#14b8a6" name="Clicks" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inquiries" fill="#10b981" name="Inquiries" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Avg. Time on Page
                      </Typography>
                      <Typography variant="h3" fontWeight={700} color="primary">
                        2m 34s
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        +12% vs last period
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Bounce Rate
                      </Typography>
                      <Typography variant="h3" fontWeight={700} color="warning.main">
                        32.5%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        -5% vs last period
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Pages per Session
                      </Typography>
                      <Typography variant="h3" fontWeight={700} color="success.main">
                        4.2
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        +0.8 vs last period
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Vehicles Tab */}
          <TabPanel value={tabValue} index={3}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Inventory Analysis
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={vehicleTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {vehicleTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                    Inventory Breakdown
                  </Typography>
                  <Grid container spacing={2}>
                    {vehicleTypeData.map((type, index) => (
                      <Grid item xs={12} sm={6} md={4} key={type.name}>
                        <Paper
                          sx={{
                            p: 2,
                            background: `linear-gradient(135deg, ${COLORS[index]}15 0%, ${COLORS[index]}05 100%)`,
                            border: `1px solid ${COLORS[index]}30`,
                            borderRadius: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {type.name}
                            </Typography>
                            <Chip 
                              label={`${type.value}%`} 
                              size="small" 
                              sx={{ 
                                bgcolor: COLORS[index], 
                                color: 'white',
                                fontWeight: 600,
                              }} 
                            />
                          </Box>
                          <Typography variant="h4" fontWeight={700} gutterBottom>
                            {type.count}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={type.value}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: COLORS[index],
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Performance Tab */}
          <TabPanel value={tabValue} index={4}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Performance Metrics
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={performanceData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: 'rgba(255,255,255,0.5)' }}
                        stroke="rgba(255,255,255,0.2)"
                      />
                      <Radar
                        name="Performance"
                        dataKey="value"
                        stroke="#06b6d4"
                        fill="#06b6d4"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                    Performance Breakdown
                  </Typography>
                  <Grid container spacing={2}>
                    {performanceData.map((item, index) => (
                      <Grid item xs={12} key={item.category}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {item.category}
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="primary">
                              {item.value}%
                            </Typography>
                          </Box>
                            <LinearProgress
                              variant="determinate"
                              value={item.value}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  background: 'linear-gradient(90deg, #06b6d4 0%, #14b8a6 50%, #10b981 100%)',
                                },
                              }}
                            />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mt: 4, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="success.dark" gutterBottom>
                      🎉 Excellent Performance!
                    </Typography>
                    <Typography variant="body2" color="success.dark">
                      You're performing above average in all categories. Keep up the great work!
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>
        </Card>
      </Box>
    </DealerLayout>
  );
};

export default DealerAnalytics;

