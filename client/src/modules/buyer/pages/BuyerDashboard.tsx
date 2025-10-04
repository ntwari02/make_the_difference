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
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BuyerLayout from '../components/layout/BuyerLayout';
import SessionDebugger from '../../../shared/components/debug/SessionDebugger';

const BuyerDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

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
    <BuyerLayout>
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
                }}
                onClick={stat.action}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, width: 56, height: 56 }}>
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={4}>
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
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FavoriteIcon />}
                  onClick={() => navigate('/buyer/favorites')}
                  sx={{ py: 2 }}
                >
                  My Favorites
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CarIcon />}
                  onClick={() => navigate('/browse')}
                  sx={{ py: 2 }}
                >
                  Search by Make
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Coming Soon Banner */}
        <Card sx={{ mt: 3, background: `linear-gradient(135deg, #06b6d420 0%, #10b98120 100%)` }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                🚗 Full Buyer Experience Coming Soon!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                We're building an amazing vehicle browsing experience with:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
                <Chip label="Advanced Filters" color="primary" />
                <Chip label="3D Vehicle Views" color="primary" />
                <Chip label="Price Alerts" color="primary" />
                <Chip label="Compare Vehicles" color="primary" />
                <Chip label="Dealer Chat" color="primary" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Stay tuned for the complete marketplace experience! 🎉
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Debug Tool - Remove in Production */}
      {process.env.NODE_ENV === 'development' && <SessionDebugger />}
    </BuyerLayout>
  );
};

export default BuyerDashboard;

