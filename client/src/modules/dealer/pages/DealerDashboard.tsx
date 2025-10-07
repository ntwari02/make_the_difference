import React, { useEffect, useState } from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  useTheme,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as SalesIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import SessionDebugger from '../../../shared/components/debug/SessionDebugger';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../core/store';
import { setStats } from '../store/dealerSlice';
import DealerLayout from '../components/layout/DealerLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const DealerDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(true);
  const stats = useSelector((state: RootState) => state.dealer.stats);
  const profile = useSelector((state: RootState) => state.dealer.profile);

  // Mock data for charts
  const salesData = [
    { month: 'Jan', sales: 12, revenue: 145000 },
    { month: 'Feb', sales: 19, revenue: 198000 },
    { month: 'Mar', sales: 15, revenue: 175000 },
    { month: 'Apr', sales: 25, revenue: 290000 },
    { month: 'May', sales: 22, revenue: 265000 },
    { month: 'Jun', sales: 30, revenue: 350000 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // For now, use mock data
        // In production, fetch from API
        const mockStats = {
          total_listings: 45,
          active_listings: 38,
          sold_cars: 123,
          pending_listings: 5,
          draft_listings: 2,
          total_views: 15420,
          total_favorites: 342,
          total_inquiries: 89,
          total_revenue: 1423000,
          this_month_sales: 30,
          last_month_sales: 22,
          growth_percentage: 36.4,
        };

        dispatch(setStats(mockStats));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  // Stat cards configuration
  const statCards = [
    {
      title: 'Total Listings',
      value: stats?.total_listings || 0,
      icon: <CarIcon />,
      color: '#667eea',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Active Vehicles',
      value: stats?.active_listings || 0,
      icon: <ViewIcon />,
      color: '#4ade80',
      change: '+8%',
      trend: 'up',
    },
    {
      title: 'Total Sales',
      value: stats?.sold_cars || 0,
      icon: <SalesIcon />,
      color: '#fbbf24',
      change: '+36%',
      trend: 'up',
    },
    {
      title: 'Total Favorites',
      value: stats?.total_favorites || 0,
      icon: <FavoriteIcon />,
      color: '#f87171',
      change: '-2%',
      trend: 'down',
    },
  ];

  // Recent activity mock data
  const recentActivity = [
    { id: 1, type: 'sale', title: '2023 Toyota Camry sold', time: '2 hours ago', avatar: '🚗' },
    { id: 2, type: 'inquiry', title: 'New inquiry on BMW X5', time: '5 hours ago', avatar: '💬' },
    { id: 3, type: 'listing', title: 'Added 2024 Mercedes C-Class', time: '1 day ago', avatar: '➕' },
    { id: 4, type: 'view', title: 'Honda Civic reached 100 views', time: '2 days ago', avatar: '👁️' },
  ];

  if (loading) {
    return (
      <DealerLayout>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      </DealerLayout>
    );
  }

  return (
    <DealerLayout>
      <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Welcome back, {profile?.business_name || 'Dealer'}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your dealership today
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/dealer/vehicles/add')}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
            >
              Add Vehicle
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'visible',
                  borderRadius: 3,
                  boxShadow: 2,
                  border: (t) => `1px solid ${t.palette.divider}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease',
                    boxShadow: (t) => t.shadows[8],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {card.title}
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {card.value}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {card.trend === 'up' ? (
                          <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                        ) : (
                          <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            color: card.trend === 'up' ? 'success.main' : 'error.main',
                            fontWeight: 600,
                          }}
                        >
                          {card.change}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                          vs last month
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: `${card.color}20`,
                        color: card.color,
                        width: 56,
                        height: 56,
                        boxShadow: `0 6px 16px ${card.color}40`,
                      }}
                    >
                      {card.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Sales Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Sales Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly sales and revenue trends
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#667eea" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#667eea" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#764ba2" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#764ba2" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="month" 
                      stroke={theme.palette.text.secondary}
                      tick={{ fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.divider }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      stroke={theme.palette.text.secondary}
                      tick={{ fill: theme.palette.text.secondary }}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke={theme.palette.text.secondary}
                      tick={{ fill: theme.palette.text.secondary }}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                      labelStyle={{ color: theme.palette.text.primary }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        color: theme.palette.text.primary 
                      }}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="sales" 
                      fill="url(#salesGradient)" 
                      name="Sales"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="revenue" 
                      fill="url(#revenueGradient)" 
                      name="Revenue ($)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Gauge */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Performance Score
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Close ratio
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#667eea" />
                          <stop offset="50%" stopColor="#764ba2" />
                          <stop offset="100%" stopColor="#f093fb" />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={[
                          { name: 'completed', value: 75 },
                          { name: 'remaining', value: 25 }
                        ]}
                        cx="50%"
                        cy="50%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius="70%"
                        outerRadius="90%"
                        paddingAngle={0}
                        dataKey="value"
                      >
                        <Cell fill="url(#gaugeGradient)" />
                        <Cell fill={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Animated Needle */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '50%',
                      left: '50%',
                      width: '2px',
                      height: '35%',
                      bgcolor: 'error.main',
                      transformOrigin: 'bottom center',
                      transform: 'translateX(-50%) rotate(45deg)',
                      animation: 'needleSwing 2s ease-out',
                      '@keyframes needleSwing': {
                        '0%': {
                          transform: 'translateX(-50%) rotate(-90deg)',
                        },
                        '100%': {
                          transform: 'translateX(-50%) rotate(45deg)',
                        },
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        bottom: -6,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'error.main',
                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '4px solid transparent',
                        borderRight: '4px solid transparent',
                        borderBottom: '8px solid',
                        borderBottomColor: 'error.main',
                      },
                    }}
                  />
                  
                  <Box sx={{ position: 'absolute', textAlign: 'center', bottom: '30%' }}>
                    <Typography variant="h2" fontWeight={700} sx={{ color: 'primary.main' }}>
                      75%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', px: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      0%
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      100%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity & Quick Actions */}
        <Grid container spacing={2}>
          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            {activity.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.title}
                          secondary={activity.time}
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
                <Button fullWidth sx={{ mt: 2 }}>
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/dealer/vehicles/add')}
                      sx={{ py: 2 }}
                    >
                      Add Vehicle
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate('/dealer/vehicles')}
                      sx={{ py: 2 }}
                    >
                      View Inventory
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<SalesIcon />}
                      onClick={() => navigate('/dealer/analytics')}
                      sx={{ py: 2 }}
                    >
                      Analytics
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CarIcon />}
                      onClick={() => navigate('/dealer/profile')}
                      sx={{ py: 2 }}
                    >
                      My Profile
                    </Button>
                  </Grid>
                </Grid>

                {/* Performance Badge */}
                <Box 
                  sx={{ 
                    mt: 3, 
                    p: 2, 
                    bgcolor: '#16213e', 
                    borderRadius: 1,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    maxWidth: '80%',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: '#ffffff' }}>
                    Dealer Performance
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip label="⭐ Top Seller" color="primary" size="small" />
                    <Chip label="✓ Verified" color="success" size="small" />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    You're in the top 10% of dealers this month!
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Debug Tool - Remove in Production */}
      {process.env.NODE_ENV === 'development' && <SessionDebugger />}
    </DealerLayout>
  );
};

export default DealerDashboard;

