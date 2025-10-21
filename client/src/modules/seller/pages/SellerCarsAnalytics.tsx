import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  DirectionsCar as CarIcon,
  AttachMoney as MoneyIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Message as MessageIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import SellerLayout from '../components/layout/SellerLayout';
import type { RootState } from '../../../../core/store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`car-analytics-tabpanel-${index}`}
      aria-labelledby={`car-analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SellerCarsAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('6m');

  // Mock data - replace with real API calls
  const [analyticsData, setAnalyticsData] = useState({
    totalCars: 24,
    totalViews: 1250,
    totalFavorites: 89,
    totalMessages: 45,
    avgPrice: 28500,
    conversionRate: 3.2
  });

  const [salesTrends, setSalesTrends] = useState([
    { month: '2025-05', cars: 3, views: 180, favorites: 12 },
    { month: '2025-06', cars: 5, views: 220, favorites: 18 },
    { month: '2025-07', cars: 4, views: 195, favorites: 15 },
    { month: '2025-08', cars: 6, views: 280, favorites: 22 },
    { month: '2025-09', cars: 4, views: 210, favorites: 16 },
    { month: '2025-10', cars: 2, views: 165, favorites: 6 }
  ]);

  const [brandAnalysis, setBrandAnalysis] = useState([
    { name: 'Toyota', value: 8, color: '#8884d8' },
    { name: 'Honda', value: 6, color: '#82ca9d' },
    { name: 'Ford', value: 4, color: '#ffc658' },
    { name: 'BMW', value: 3, color: '#ff7300' },
    { name: 'Mercedes', value: 2, color: '#00ff00' },
    { name: 'Audi', value: 1, color: '#ff00ff' }
  ]);

  const [topCars, setTopCars] = useState([
    {
      id: 1,
      title: '2020 Toyota Camry',
      price: 25000,
      views: 145,
      favorites: 12,
      messages: 8,
      status: 'active'
    },
    {
      id: 2,
      title: '2019 Honda Accord',
      price: 22000,
      views: 132,
      favorites: 10,
      messages: 6,
      status: 'active'
    },
    {
      id: 3,
      title: '2021 BMW 3 Series',
      price: 35000,
      views: 98,
      favorites: 15,
      messages: 12,
      status: 'active'
    }
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={color}>
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {change > 0 ? (
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
              ) : (
                <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
              )}
              <Typography 
                variant="body2" 
                color={change > 0 ? 'success.main' : 'error.main'}
                fontWeight={600}
              >
                {change > 0 ? '+' : ''}{change}%
              </Typography>
            </Box>
          </Box>
          <Box sx={{ color: color, opacity: 0.8 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssessmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={600}>
              Car Analytics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={handleTimeRangeChange}
              >
                <MenuItem value="1m">Last Month</MenuItem>
                <MenuItem value="3m">Last 3 Months</MenuItem>
                <MenuItem value="6m">Last 6 Months</MenuItem>
                <MenuItem value="1y">Last Year</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAnalyticsData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
            >
              Export
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 3 }} />}

        <Alert severity="info" sx={{ mb: 3 }}>
          Track your car listings performance, views, favorites, and sales analytics to optimize your inventory.
        </Alert>

        {/* Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={2}>
            <MetricCard
              title="Total Cars"
              value={analyticsData.totalCars}
              change={12}
              icon={<CarIcon sx={{ fontSize: 32 }} />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <MetricCard
              title="Total Views"
              value={analyticsData.totalViews.toLocaleString()}
              change={8}
              icon={<VisibilityIcon sx={{ fontSize: 32 }} />}
              color="info.main"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <MetricCard
              title="Favorites"
              value={analyticsData.totalFavorites}
              change={15}
              icon={<FavoriteIcon sx={{ fontSize: 32 }} />}
              color="error.main"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <MetricCard
              title="Messages"
              value={analyticsData.totalMessages}
              change={-5}
              icon={<MessageIcon sx={{ fontSize: 32 }} />}
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <MetricCard
              title="Avg Price"
              value={`$${analyticsData.avgPrice.toLocaleString()}`}
              change={3}
              icon={<MoneyIcon sx={{ fontSize: 32 }} />}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <MetricCard
              title="Conversion"
              value={`${analyticsData.conversionRate}%`}
              change={2}
              icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
              color="secondary.main"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="car analytics tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon />
                    <span>Sales Trends</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChartIcon />
                    <span>Top Cars</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PieChartIcon />
                    <span>Brand Analysis</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryIcon />
                    <span>Inventory Insights</span>
                  </Box>
                } 
              />
            </Tabs>
          </Box>

          {/* Sales Trends Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="cars" fill="#8884d8" name="Cars Listed" />
                  <Bar dataKey="views" fill="#82ca9d" name="Views" />
                  <Bar dataKey="favorites" fill="#ffc658" name="Favorites" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>

          {/* Top Cars Tab */}
          <TabPanel value={activeTab} index={1}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Car</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell align="right">Favorites</TableCell>
                    <TableCell align="right">Messages</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {car.title}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={600}>
                          ${car.price.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {car.views}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {car.favorites}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {car.messages}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={car.status} 
                          color={car.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Brand Analysis Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brandAnalysis}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {brandAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>

          {/* Inventory Insights Tab */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                      Price Range Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Under $20k</Typography>
                        <Typography variant="body2" fontWeight={600}>4 cars</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">$20k - $30k</Typography>
                        <Typography variant="body2" fontWeight={600}>12 cars</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">$30k - $50k</Typography>
                        <Typography variant="body2" fontWeight={600}>6 cars</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Over $50k</Typography>
                        <Typography variant="body2" fontWeight={600}>2 cars</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                      Performance Insights
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Alert severity="success">
                        <Typography variant="subtitle2" fontWeight={600}>
                          High Performers
                        </Typography>
                        <Typography variant="body2">
                          Toyota Camry and Honda Accord are your top performers with highest views and favorites.
                        </Typography>
                      </Alert>
                      <Alert severity="warning">
                        <Typography variant="subtitle2" fontWeight={600}>
                          Optimization Needed
                        </Typography>
                        <Typography variant="body2">
                          Consider updating photos and descriptions for cars with low engagement.
                        </Typography>
                      </Alert>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default SellerCarsAnalytics;
