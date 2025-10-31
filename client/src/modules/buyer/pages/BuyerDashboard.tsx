import React from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { MoreVert as MoreIcon } from '@mui/icons-material';

const BuyerDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Mock analytics data (mirror style from dealer)
  const engagementData = [
    { month: 'Jan', views: 320, favorites: 12 },
    { month: 'Feb', views: 410, favorites: 15 },
    { month: 'Mar', views: 380, favorites: 18 },
    { month: 'Apr', views: 520, favorites: 22 },
    { month: 'May', views: 610, favorites: 26 },
    { month: 'Jun', views: 740, favorites: 30 },
  ];

  const favoritesByType = [
    { name: 'Sedan', value: 8 },
    { name: 'SUV', value: 12 },
    { name: 'Hatchback', value: 5 },
    { name: 'Pickup', value: 4 },
  ];

  const stats = [
    {
      title: 'Favorites',
      value: '12',
      icon: <FavoriteIcon />,
      color: '#06b6d4',
      action: () => navigate('/buyer/favorites'),
    },
    {
      title: 'Recently Viewed',
      value: '8',
      icon: <ViewIcon />,
      color: '#14b8a6',
      action: () => navigate('/browse'),
    },
    {
      title: 'Saved Searches',
      value: '3',
      icon: <SearchIcon />,
      color: '#10b981',
      action: () => navigate('/browse'),
    },
    {
      title: 'Market Trends',
      value: 'Hot',
      icon: <TrendingIcon />,
      color: '#22c55e',
      action: () => navigate('/browse'),
    },
  ];

  return (
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome Back! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find your perfect vehicle today
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease',
                    boxShadow: theme.shadows[8],
                  },
                  borderRadius: 1,
                  boxShadow: theme.shadows[2],
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                }}
                onClick={stat.action}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, width: 40, height: 40, boxShadow: `0 4px 10px ${stat.color}30`, '& .MuiSvgIcon-root': { fontSize: 18 } }}>
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Two-column layout: Charts left, Content right */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Left Column: Charts */}
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Engagement Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly views and favorites trends
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                </Box>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={engagementData}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="favGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3} />
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
                    <Legend wrapperStyle={{ paddingTop: '20px', color: theme.palette.text.primary }} />
                    <Bar dataKey="views" fill="url(#viewsGradient)" name="Views" radius={[8, 8, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="favorites" fill="url(#favGradient)" name="Favorites" radius={[8, 8, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Favorites by Type
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={favoritesByType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                      {favoritesByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#06b6d4", "#3b82f6", "#10b981", "#f59e0b"][index % 4]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                      labelStyle={{ color: theme.palette.text.primary }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column: Quick Actions and Coming Soon */}
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={() => navigate('/browse')}
                    sx={{
                      py: 2,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    }}
                  >
                    Browse Vehicles
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FavoriteIcon />}
                    onClick={() => navigate('/buyer/favorites')}
                    sx={{ py: 2 }}
                  >
                    My Favorites
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CarIcon />}
                    onClick={() => navigate('/browse')}
                    sx={{ py: 2 }}
                  >
                    Search by Make
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ background: `linear-gradient(135deg, #06b6d420 0%, #10b98120 100%)` }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    🚗 Full Buyer Experience Coming Soon!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    We're building an amazing vehicle browsing experience with:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                    <Chip label="Advanced Filters" color="primary" clickable onClick={() => navigate('/browse')} />
                    <Chip label="3D Vehicle Views" color="primary" clickable onClick={() => navigate('/browse')} />
                    <Chip label="Price Alerts" color="primary" clickable onClick={() => navigate('/buyer/settings')} />
                    <Chip label="Compare Vehicles" color="primary" clickable onClick={() => navigate('/browse')} />
                    <Chip label="Dealer Chat" color="primary" clickable onClick={() => navigate('/buyer/messages')} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Stay tuned for the complete marketplace experience! 🎉
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

      </Box>
  );
};

export default BuyerDashboard;

