import React, { useState, useEffect } from 'react';
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
  CircularProgress,
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
import { useSelector } from 'react-redux';
import { buyerApi } from '../services/buyerApi';
import { api } from '../../../core/services/api/apiClient';
import type { RootState } from '../../../core/store';
import toast from 'react-hot-toast';

// Define type-specific colors for the PieChart segments
// Using colors that match the design
const TYPE_COLORS: { [key: string]: string } = {
  'Sedan': '#03a9f4',      // Light blue
  'Pickup': '#ed6c02',     // Orange
  'Hatchback': '#2e7d32', // Green
  'SUV': '#2196f3',       // Blue
  'No Data': '#9e9e9e',   // Gray for no data
};

const BuyerDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    favorites: 0,
    recentlyViewed: 0,
    savedSearches: 0,
    marketTrends: 'Hot',
  });
  const [loading, setLoading] = useState(true);
  const [engagementData, setEngagementData] = useState([
    { month: 'Jan', views: 0, favorites: 0 },
    { month: 'Feb', views: 0, favorites: 0 },
    { month: 'Mar', views: 0, favorites: 0 },
    { month: 'Apr', views: 0, favorites: 0 },
    { month: 'May', views: 0, favorites: 0 },
    { month: 'Jun', views: 0, favorites: 0 },
  ]);
  const [favoritesByType, setFavoritesByType] = useState([
    { name: 'Sedan', value: 0 },
    { name: 'SUV', value: 0 },
    { name: 'Hatchback', value: 0 },
    { name: 'Pickup', value: 0 },
  ]);
  
  const recentlyViewed = useSelector((state: RootState) => 
    state.buyer?.recentlyViewed || []
  );

  // Fetch real data for dashboard cards
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch favorites count and calculate monthly data
        try {
          const favoritesResponse = await buyerApi.getFavorites(1, 100);
          const favoritesList = Array.isArray(favoritesResponse) 
            ? favoritesResponse 
            : (favoritesResponse?.favorites || favoritesResponse?.data || []);
          // Try to get total from pagination, otherwise use array length
          const favoritesCount = favoritesResponse?.pagination?.total || 
                                (Array.isArray(favoritesList) ? favoritesList.length : 0);
          setStats(prev => ({ ...prev, favorites: favoritesCount }));
          
          // Calculate monthly favorites data
          const now = new Date();
          const currentMonth = now.getMonth();
          
          // Get last 6 months with proper month abbreviations
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthlyData: { [key: string]: { views: number; favorites: number } } = {};
          
          // Initialize last 6 months
          for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            monthlyData[months[monthIndex]] = { views: 0, favorites: 0 };
          }
          
          const typeCounts: { [key: string]: number } = {
            'Sedan': 0,
            'SUV': 0,
            'Hatchback': 0,
            'Pickup': 0,
          };
          
          // Process favorites to calculate monthly and type data
          if (Array.isArray(favoritesList)) {
            favoritesList.forEach((fav: any) => {
              // Group by month based on created_at or favorite date
              const favDate = new Date(fav.created_at || fav.createdAt || fav.timestamp || now);
              const favMonthIndex = favDate.getMonth();
              const favMonthAbbr = months[favMonthIndex];
              
              // Check if this month is in our last 6 months
              if (monthlyData.hasOwnProperty(favMonthAbbr)) {
                monthlyData[favMonthAbbr].favorites++;
              }
              
              // Count by vehicle type - favorites API returns car data directly
              const vehicleType = fav.body_type || fav.vehicle_type || fav.type || fav.category || '';
              if (vehicleType) {
                // Normalize the type name (handle various formats)
                let typeKey = vehicleType;
                // Capitalize first letter
                typeKey = typeKey.charAt(0).toUpperCase() + typeKey.slice(1).toLowerCase();
                // Handle common variations
                if (typeKey === 'Suv' || typeKey === 'S.U.V.') typeKey = 'SUV';
                if (typeKey === 'Pickup' || typeKey === 'Pick-up' || typeKey === 'Pick up') typeKey = 'Pickup';
                if (typeKey === 'Hatchback' || typeKey === 'Hatch-back') typeKey = 'Hatchback';
                if (typeKey === 'Sedan') typeKey = 'Sedan';
                
                // Only count if it's one of our known types
                if (typeCounts.hasOwnProperty(typeKey)) {
                  typeCounts[typeKey]++;
                }
              }
            });
          }
          
          // Get view history from localStorage
          const viewHistory = JSON.parse(localStorage.getItem('buyer:carViews') || '[]');
          
          // Also use recently viewed as a fallback for views if no history exists
          const recentlyViewedList = recentlyViewed || [];
          
          // Process view history
          if (Array.isArray(viewHistory) && viewHistory.length > 0) {
            viewHistory.forEach((view: any) => {
              const viewDate = new Date(view.timestamp || view.date || now);
              const viewMonthIndex = viewDate.getMonth();
              const viewMonthAbbr = months[viewMonthIndex];
              
              if (monthlyData.hasOwnProperty(viewMonthAbbr)) {
                monthlyData[viewMonthAbbr].views++;
              }
            });
          } else if (recentlyViewedList.length > 0) {
            // Use recently viewed as a proxy for views (distribute across recent months)
            recentlyViewedList.forEach((vehicle: any, index: number) => {
              // Distribute views across recent months (simpler approach)
              const monthIndex = (currentMonth - (index % 6)) % 12;
              const monthAbbr = months[monthIndex];
              if (monthlyData.hasOwnProperty(monthAbbr)) {
                monthlyData[monthAbbr].views++;
              }
            });
          }
          
          // Get the last 6 months in order
          const lastSixMonths: string[] = [];
          for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            lastSixMonths.push(months[monthIndex]);
          }
          
          // Update engagement data with real values
          const newEngagementData = lastSixMonths.map(month => ({
            month,
            views: monthlyData[month]?.views || 0,
            favorites: monthlyData[month]?.favorites || 0,
          }));
          
          setEngagementData(newEngagementData);
          
          // Update favorites by type - only include types with value > 0
          const filteredFavoritesByType = [
            { name: 'Sedan', value: typeCounts['Sedan'] },
            { name: 'SUV', value: typeCounts['SUV'] },
            { name: 'Hatchback', value: typeCounts['Hatchback'] },
            { name: 'Pickup', value: typeCounts['Pickup'] },
          ].filter(item => item.value > 0); // Only show types that have favorites
          
          setFavoritesByType(filteredFavoritesByType.length > 0 ? filteredFavoritesByType : [
            { name: 'No Data', value: 0 }
          ]);
        } catch (error: any) {
          console.error('Failed to fetch favorites:', error);
          // Keep default 0 on error
        }
        
        // Get recently viewed count from Redux state
        const recentlyViewedCount = recentlyViewed.length;
        setStats(prev => ({ ...prev, recentlyViewed: recentlyViewedCount }));
        
        // Fetch saved searches count
        try {
          const savedSearchesResponse = await api.get('/advanced-search/saved');
          const savedSearchesData = savedSearchesResponse?.data?.data || savedSearchesResponse?.data;
          const savedSearchesList = savedSearchesData?.saved_searches || savedSearchesData || [];
          const savedSearchesCount = savedSearchesData?.count || savedSearchesList.length;
          setStats(prev => ({ ...prev, savedSearches: savedSearchesCount }));
        } catch (error: any) {
          console.error('Failed to fetch saved searches:', error);
          // Keep default 0 on error
        }
        
        // Fetch market trends (determine if market is "Hot" based on recent listings)
        try {
          const carsResponse = await api.get('/cars', { 
            params: { 
              limit: 1,
              sort: 'created_at',
              order: 'desc'
            } 
          });
          const carsData = carsResponse?.data?.data || carsResponse?.data;
          const recentCars = carsData?.cars || carsData || [];
          
          // Simple logic: if there are recent listings (within last 7 days), market is "Hot"
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const hasRecentListings = recentCars.some((car: any) => {
            const carDate = new Date(car.created_at || car.createdAt || 0);
            return carDate > sevenDaysAgo;
          });
          
          setStats(prev => ({ 
            ...prev, 
            marketTrends: hasRecentListings ? 'Hot' : 'Normal' 
          }));
        } catch (error: any) {
          console.error('Failed to fetch market trends:', error);
          // Keep default "Hot" on error
        }
        
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [recentlyViewed.length]);
  
  const statsCards = [
    {
      title: 'Favorites',
      value: loading ? '...' : String(stats.favorites),
      icon: <FavoriteIcon />,
      color: '#06b6d4',
      action: () => navigate('/buyer/favorites'),
    },
    {
      title: 'Recently Viewed',
      value: loading ? '...' : String(stats.recentlyViewed),
      icon: <ViewIcon />,
      color: '#14b8a6',
      action: () => navigate('/browse'),
    },
    {
      title: 'Saved Searches',
      value: loading ? '...' : String(stats.savedSearches),
      icon: <SearchIcon />,
      color: '#10b981',
      action: () => navigate('/browse'),
    },
    {
      title: 'Market Trends',
      value: loading ? '...' : stats.marketTrends,
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
          {statsCards.map((stat, index) => (
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
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px',
                        boxShadow: theme.palette.mode === 'dark' 
                          ? '0 4px 12px rgba(0,0,0,0.5)' 
                          : '0 4px 12px rgba(0,0,0,0.15)',
                        color: theme.palette.mode === 'dark' ? '#000' : '#000',
                        fontWeight: 600,
                      }}
                      labelStyle={{ 
                        color: theme.palette.mode === 'dark' ? '#000' : '#000',
                        fontWeight: 600,
                        fontSize: '14px',
                      }}
                      itemStyle={{ 
                        color: theme.palette.mode === 'dark' ? '#000' : '#000',
                        fontWeight: 600,
                      }}
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
                  {favoritesByType.length > 0 && favoritesByType[0].value > 0 ? (
                  <PieChart>
                      <Pie 
                        data={favoritesByType} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={40} 
                        outerRadius={70}
                        paddingAngle={5}
                      >
                      {favoritesByType.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={TYPE_COLORS[entry.name] || TYPE_COLORS['No Data']}
                          />
                      ))}
                    </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: '8px',
                          boxShadow: theme.palette.mode === 'dark' 
                            ? '0 4px 12px rgba(0,0,0,0.5)' 
                            : '0 4px 12px rgba(0,0,0,0.15)',
                          color: theme.palette.mode === 'dark' ? '#000' : '#000',
                          fontWeight: 600,
                        }}
                        labelStyle={{ 
                          color: theme.palette.mode === 'dark' ? '#000' : '#000',
                          fontWeight: 600,
                          fontSize: '14px',
                        }}
                        itemStyle={{ 
                          color: theme.palette.mode === 'dark' ? '#000' : '#000',
                          fontWeight: 600,
                        }}
                        formatter={(value: number, name: string) => [value, name]}
                      />
                      <Legend 
                        layout="horizontal" 
                        align="center" 
                        verticalAlign="bottom"
                        wrapperStyle={{ paddingTop: '10px' }}
                        iconType="circle"
                        formatter={(value: string) => value}
                    />
                  </PieChart>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">
                        No favorites data available
                      </Typography>
                    </Box>
                  )}
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

