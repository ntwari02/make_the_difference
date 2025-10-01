import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar,
  Favorite,
  Search,
  LocationOn,
  Star,
  Psychology,
  TrendingUp,
  Compare,
  Share,
  Bookmark,
  Visibility,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageContainer, CardGrid } from '../../../../shared/components/layout/Containers';
import { CarViewerModal } from '../../../../shared/components/3d/CarViewer3D';

// Mock data for buyer dashboard
const mockBuyerData = {
  profile: {
    name: 'Alex Johnson',
    avatar: '/api/placeholder/80/80',
    budget: 25000,
    preferences: {
      fuelType: 'hybrid',
      bodyType: 'suv',
      transmission: 'automatic',
      maxMileage: 50000,
    },
    savedCars: 12,
    viewedCars: 45,
    inquiries: 8,
  },
  recommendations: [
    {
      id: 1,
      title: '2022 Toyota RAV4 Hybrid',
      price: 28500,
      originalPrice: 32000,
      mileage: 25000,
      location: 'San Francisco, CA',
      images: ['/api/placeholder/400/300'],
      features: ['AWD', 'Hybrid', 'Backup Camera', 'Bluetooth'],
      rating: 4.8,
      reviews: 156,
      dealer: 'Toyota of SF',
      dealerRating: 4.9,
      isAIRecommended: true,
      reason: 'Matches your hybrid SUV preference',
      fuelEfficiency: 35,
      year: 2022,
      color: 'Silver',
      condition: 'Certified',
      financing: 'Available',
      warranty: '2 years',
    },
    {
      id: 2,
      title: '2021 Honda CR-V Hybrid',
      price: 26500,
      originalPrice: 29000,
      mileage: 32000,
      location: 'Oakland, CA',
      images: ['/api/placeholder/400/300'],
      features: ['AWD', 'Hybrid', 'Lane Assist', 'Apple CarPlay'],
      rating: 4.7,
      reviews: 203,
      dealer: 'Honda Bay Area',
      dealerRating: 4.8,
      isAIRecommended: true,
      reason: 'Great value within your budget',
      fuelEfficiency: 38,
      year: 2021,
      color: 'White',
      condition: 'Used',
      financing: 'Available',
      warranty: '1 year',
    },
    {
      id: 3,
      title: '2023 Subaru Outback',
      price: 31000,
      originalPrice: 35000,
      mileage: 15000,
      location: 'San Jose, CA',
      images: ['/api/placeholder/400/300'],
      features: ['AWD', 'EyeSight', 'Roof Rails', 'Heated Seats'],
      rating: 4.9,
      reviews: 89,
      dealer: 'Subaru Silicon Valley',
      dealerRating: 4.9,
      isAIRecommended: false,
      reason: 'Popular choice in your area',
      fuelEfficiency: 28,
      year: 2023,
      color: 'Blue',
      condition: 'Certified',
      financing: 'Available',
      warranty: '3 years',
    },
  ],
  savedCars: [
    {
      id: 4,
      title: '2020 Tesla Model Y',
      price: 42000,
      mileage: 18000,
      location: 'Palo Alto, CA',
      images: ['/api/placeholder/400/300'],
      rating: 4.9,
      savedDate: '2024-01-15',
      priceChange: -2000,
    },
    {
      id: 5,
      title: '2021 BMW X3',
      price: 38000,
      mileage: 22000,
      location: 'Mountain View, CA',
      images: ['/api/placeholder/400/300'],
      rating: 4.6,
      savedDate: '2024-01-10',
      priceChange: 500,
    },
  ],
  recentSearches: [
    {
      id: 1,
      query: 'Hybrid SUVs under $30k',
      results: 24,
      date: '2024-01-20',
    },
    {
      id: 2,
      query: 'Toyota RAV4 2022',
      results: 8,
      date: '2024-01-19',
    },
    {
      id: 3,
      query: 'Certified cars San Francisco',
      results: 156,
      date: '2024-01-18',
    },
  ],
  marketInsights: {
    averagePrice: 28500,
    priceTrend: 'down',
    priceChangePercent: -2.5,
    inventoryLevel: 'high',
    bestDeals: 12,
    priceAlerts: 3,
  },
};

const BuyerDashboard: React.FC = () => {
  const theme = useTheme();
  const [data] = useState(mockBuyerData);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.02, y: -5 },
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  const handle3DView = (car: any) => {
    setSelectedCar(car);
    setIs3DViewerOpen(true);
  };

  const handleClose3DViewer = () => {
    setIs3DViewerOpen(false);
    setSelectedCar(null);
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
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
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
          
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              {data.profile.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            
            <Box flex={1}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back, {data.profile.name}! 🚗
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Ready to find your perfect car?
              </Typography>
              
              <Box display="flex" gap={2}>
                <Chip
                  icon={<DirectionsCar />}
                  label={`$${data.profile.budget.toLocaleString()} Budget`}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                <Chip
                  icon={<Bookmark />}
                  label={`${data.profile.savedCars} Saved`}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                <Chip
                  icon={<Psychology />}
                  label="AI Powered"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<Search />}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              Search Cars
            </Button>
                        </Box>
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
              title: 'Market Average',
              value: `$${data.marketInsights.averagePrice.toLocaleString()}`,
              icon: <TrendingUp />,
              color: data.marketInsights.priceTrend === 'down' ? theme.palette.success.main : theme.palette.error.main,
              subtitle: `${data.marketInsights.priceChangePercent}% this month`,
            },
            {
              title: 'Saved Cars',
              value: data.profile.savedCars,
              icon: <Bookmark />,
              color: theme.palette.primary.main,
              subtitle: 'In your list',
            },
            {
              title: 'Price Alerts',
              value: data.marketInsights.priceAlerts,
              icon: <Schedule />,
              color: theme.palette.warning.main,
              subtitle: 'Active alerts',
            },
            {
              title: 'Best Deals',
              value: data.marketInsights.bestDeals,
              icon: <CheckCircle />,
              color: theme.palette.success.main,
              subtitle: 'Near you',
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
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </CardGrid>
      </motion.div>

      {/* AI Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Psychology sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                AI-Powered Recommendations
              </Typography>
              <Chip
                label="Personalized for you"
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>

              <Box display="flex" flexWrap="wrap" gap={3}>
              {data.recommendations.map((car, index) => (
                <Box flex="1" minWidth="300px">
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        border: car.isAIRecommended ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                        borderColor: car.isAIRecommended ? theme.palette.primary.main : theme.palette.divider,
                      }}
                    >
                      {/* AI Recommendation Badge */}
                      {car.isAIRecommended && (
                        <Chip
                          label="AI Recommended"
                          color="primary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 2,
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                          }}
                        />
                      )}

                      {/* Car Image */}
                      <Box
                        sx={{
                          height: 200,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <DirectionsCar sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                        
                        {/* Price Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold">
                            ${car.price.toLocaleString()}
                          </Typography>
                          {car.originalPrice > car.price && (
                            <Typography variant="caption" sx={{ textDecoration: 'line-through' }}>
                              ${car.originalPrice.toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {car.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {car.location}
                        </Typography>

                        {/* Car Specs */}
                        <Box display="flex" gap={1} mb={2}>
                          <Chip
                            label={`${car.mileage.toLocaleString()} mi`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={car.year}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={car.condition}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>

                        {/* AI Reason */}
                        {car.isAIRecommended && (
                          <Box
                            sx={{
                              backgroundColor: theme.palette.primary.main + '10',
                              borderRadius: 1,
                              p: 1,
                              mb: 2,
                            }}
                          >
                            <Typography variant="caption" color="primary" fontWeight="bold">
                              💡 {car.reason}
                            </Typography>
                          </Box>
                        )}

                        {/* Rating and Dealer */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Star sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                            <Typography variant="body2">{car.rating}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({car.reviews})
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {car.dealer}
                          </Typography>
                        </Box>

                        {/* Action Buttons */}
                        <Box display="flex" gap={1}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Visibility />}
                            sx={{ flex: 1 }}
                          >
                            View Details
                          </Button>
                          <IconButton 
                            size="small"
                            onClick={() => handle3DView(car)}
                            sx={{ 
                              backgroundColor: theme.palette.primary.main + '20',
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: theme.palette.primary.main + '30',
                              }
                            }}
                          >
                            <DirectionsCar />
                          </IconButton>
                          <IconButton size="small">
                            <Favorite />
                          </IconButton>
                          <IconButton size="small">
                            <Compare />
                          </IconButton>
                          <IconButton size="small">
                            <Share />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Box>
              ))}
              </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Saved Cars and Recent Searches */}
              <Box display="flex" flexWrap="wrap" gap={3}>
        {/* Saved Cars */}
        <Box flex="1" minWidth="300px">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Bookmark sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Saved Cars
                  </Typography>
                </Box>

                {data.savedCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        backgroundColor: theme.palette.grey[50],
                        border: `1px solid ${theme.palette.grey[200]}`,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.palette.grey[100],
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 60,
                          borderRadius: 1,
                          backgroundColor: theme.palette.grey[200],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}
                      >
                        <DirectionsCar sx={{ color: theme.palette.primary.main }} />
                      </Box>
                      
                      <Box flex={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {car.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {car.mileage.toLocaleString()} mi • {car.location}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            ${car.price.toLocaleString()}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color={car.priceChange < 0 ? 'success.main' : 'error.main'}
                          >
                            {car.priceChange > 0 ? '+' : ''}${car.priceChange}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <IconButton size="small">
                        <Favorite sx={{ color: theme.palette.error.main }} />
                      </IconButton>
                    </Box>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
              </Box>

        {/* Recent Searches */}
        <Box flex="1" minWidth="300px">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Search sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Recent Searches
                  </Typography>
                </Box>

                {data.recentSearches.map((search, index) => (
                  <motion.div
                    key={search.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        backgroundColor: theme.palette.grey[50],
                        border: `1px solid ${theme.palette.grey[200]}`,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.palette.grey[100],
                        },
                      }}
                    >
                      <Search sx={{ color: theme.palette.primary.main, mr: 2 }} />
                      
                      <Box flex={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {search.query}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {search.results} results • {search.date}
                        </Typography>
                      </Box>
                      
                      <Button size="small" variant="outlined">
                        Search Again
                      </Button>
                    </Box>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
              </Box>
              </Box>

      {/* 3D Car Viewer Modal */}
      <CarViewerModal
        open={is3DViewerOpen}
        onClose={handleClose3DViewer}
        car={selectedCar}
      />
    </PageContainer>
  );
};

export default BuyerDashboard;
