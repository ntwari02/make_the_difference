import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  useTheme,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Stack,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  DirectionsCar,
  Add,
  Edit,
  Visibility,
  TrendingUp,
  MonetizationOn,
  Analytics,
  Psychology,
  ShowChart,
  Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageContainer, CardGrid } from '../../../../shared/components/layout/Containers';

// Mock data for seller dashboard
const mockSellerData = {
  overview: {
    totalListings: 25,
    activeListings: 18,
    totalViews: 12500,
    inquiries: 45,
    conversionRate: 12.5,
    averagePrice: 28500,
  },
  listings: [
    {
      id: 1,
      title: '2019 Honda Civic',
      price: 18500,
      views: 1250,
      inquiries: 8,
      status: 'active',
      image: '',
      features: ['Low Mileage', 'Certified Pre-owned', 'Warranty'],
      location: 'Los Angeles, CA',
    },
    {
      id: 2,
      title: '2020 Toyota Camry',
      price: 22500,
      views: 980,
      inquiries: 5,
      status: 'active',
      image: '',
      features: ['Hybrid', 'Backup Camera', 'Bluetooth'],
      location: 'San Francisco, CA',
    },
    {
      id: 3,
      title: '2018 BMW 3 Series',
      price: 28500,
      views: 2100,
      inquiries: 12,
      status: 'pending',
      image: '',
      features: ['Leather Seats', 'Navigation', 'Premium Audio'],
      location: 'New York, NY',
    },
  ],
  analytics: {
    views: [1200, 1350, 1100, 1450, 1300, 1600, 1400],
    inquiries: [8, 12, 6, 15, 10, 18, 14],
    conversions: [1, 2, 1, 3, 2, 4, 3],
  },
  aiInsights: [
    {
      id: 1,
      title: 'Price Optimization',
      description: 'Increase price by 5% for better profit margin',
      confidence: 85,
      impact: 'high',
      category: 'pricing',
    },
    {
      id: 2,
      title: 'Feature Highlight',
      description: 'Emphasize "Low Mileage" in listing title',
      confidence: 92,
      impact: 'medium',
      category: 'marketing',
    },
    {
      id: 3,
      title: 'Timing Suggestion',
      description: 'Post listing updates on weekends for better visibility',
      confidence: 78,
      impact: 'low',
      category: 'timing',
    },
  ],
  marketTrends: {
    averagePrice: 27500,
    priceRange: {
      min: 15000,
      max: 35000,
    },
    competitionLevel: 'Medium',
    topPerformingFeatures: ['Low Mileage', 'Certified Pre-owned', 'Warranty', 'Backup Camera'],
  },
};

const SellerDashboard: React.FC = () => {
  const theme = useTheme();
  const [data] = useState(mockSellerData);
  const [activeTab, setActiveTab] = useState(0);
  const [isListingDialogOpen, setIsListingDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAIRecommendation = (recommendation: any) => {
    console.log('Applying AI recommendation:', recommendation);
    setSnackbar({
      open: true,
      message: `AI recommendation applied: ${recommendation.title}`,
      severity: 'success',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'sold':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <PageContainer maxWidth="xl">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          sx={{
            mb: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
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
                <DirectionsCar />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Seller Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  Manage your car listings and maximize sales
                </Typography>
                
                <Box display="flex" gap={2}>
                  <Chip
                    icon={<DirectionsCar />}
                    label={`${data.overview.totalListings} Listings`}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  />
                  <Chip
                    icon={<MonetizationOn />}
                    label={`$${data.overview.averagePrice.toLocaleString()} Avg Price`}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  />
                  <Chip
                    icon={<Analytics />}
                    label={`${data.overview.conversionRate}% Conversion`}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setIsListingDialogOpen(true)}
              >
                Add Listing
              </Button>
              <Button
                variant="outlined"
                startIcon={<Analytics />}
                sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
              >
                View Analytics
              </Button>
              <Button
                variant="outlined"
                startIcon={<Psychology />}
                sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
                onClick={() => setIsAIDialogOpen(true)}
              >
                AI Insights
              </Button>
            </Stack>
          </CardContent>
        </Card>
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
              title: 'Total Views',
              value: data.overview.totalViews.toLocaleString(),
              icon: <Visibility />,
              color: theme.palette.primary.main,
              change: '+15%',
            },
            {
              title: 'Inquiries',
              value: data.overview.inquiries.toString(),
              icon: <Info />,
              color: theme.palette.info.main,
              change: '+8%',
            },
            {
              title: 'Conversion Rate',
              value: `${data.overview.conversionRate}%`,
              icon: <TrendingUp />,
              color: theme.palette.success.main,
              change: '+2.1%',
            },
            {
              title: 'Average Price',
              value: `$${data.overview.averagePrice.toLocaleString()}`,
              icon: <MonetizationOn />,
              color: theme.palette.warning.main,
              change: '+5%',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={statsVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{ p: 3, textAlign: 'center' }}>
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
                  }}
                >
                  <Box sx={{ color: stat.color, fontSize: '1.5rem' }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="caption" color="success.main">
                  {stat.change} from last month
                </Typography>
              </Card>
            </motion.div>
          ))}
        </CardGrid>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 3,
                pt: 2,
              }}
            >
              <Tab label="Listings" />
              <Tab label="Analytics" />
              <Tab label="AI Insights" />
              <Tab label="Market Trends" />
              <Tab label="Settings" />
            </Tabs>

            <CardContent sx={{ p: 3 }}>
              {/* Listings Tab */}
              {activeTab === 0 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Your Car Listings
                    </Typography>
                    <Button variant="contained" startIcon={<Add />}>
                      Add New Listing
                    </Button>
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={3}>
                    {data.listings.map((listing, index) => (
                      <Box flex="1" minWidth="300px" key={listing.id}>
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
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: theme.shadows[8],
                              },
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Typography variant="h6" fontWeight="bold">
                                  {listing.title}
                                </Typography>
                                <Chip
                                  label={listing.status}
                                  color={getStatusColor(listing.status) as any}
                                  size="small"
                                />
                              </Box>

                              <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                                ${listing.price.toLocaleString()}
                              </Typography>

                              <Box display="flex" gap={1} mb={2}>
                                {listing.features.slice(0, 2).map((feature, idx) => (
                                  <Chip
                                    key={idx}
                                    label={feature}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                  />
                                ))}
                              </Box>

                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Visibility sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                                  <Typography variant="body2">{listing.views}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Info sx={{ fontSize: 16, color: theme.palette.info.main }} />
                                  <Typography variant="body2">{listing.inquiries}</Typography>
                                </Box>
                              </Box>

                              <Box display="flex" gap={1}>
                                <Button
                                  size="small"
                                  startIcon={<Visibility />}
                                  onClick={() => setIsListingDialogOpen(true)}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<Edit />}
                                  variant="outlined"
                                >
                                  Edit
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Analytics Tab */}
              {activeTab === 1 && (
                <Box display="flex" flexWrap="wrap" gap={3}>
                  <Box flex="1" minWidth="300px">
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Views Analytics
                    </Typography>
                    <Card sx={{ p: 2 }}>
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShowChart sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Views chart will be rendered here
                      </Typography>
                    </Card>
                  </Box>
                  <Box flex="1" minWidth="300px">
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Conversion Analytics
                    </Typography>
                    <Card sx={{ p: 2 }}>
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp sx={{ fontSize: 64, color: theme.palette.success.main }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Conversion chart will be rendered here
                      </Typography>
                    </Card>
                  </Box>
                </Box>
              )}

              {/* AI Insights Tab */}
              {activeTab === 2 && (
                <Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      AI-Powered Insights
                    </Typography>
                    <Stack spacing={2}>
                      {data.aiInsights.map((insight, index) => (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Box>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                  {insight.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {insight.description}
                                </Typography>
                              </Box>
                              <Box textAlign="right">
                                <Chip
                                  label={`${insight.confidence}% confidence`}
                                  color="primary"
                                  size="small"
                                  sx={{ mb: 1 }}
                                />
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {insight.impact} impact
                                </Typography>
                              </Box>
                            </Box>
                            <Box display="flex" justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleAIRecommendation(insight)}
                              >
                                Apply
                              </Button>
                            </Box>
                          </Card>
                        </motion.div>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              )}

              {/* Market Trends Tab */}
              {activeTab === 3 && (
                <Box display="flex" flexWrap="wrap" gap={3}>
                  <Box flex="1" minWidth="300px">
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Market Overview
                    </Typography>
                    <Card sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Average Price</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            ${data.marketTrends.averagePrice.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Price Range</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            ${data.marketTrends.priceRange.min.toLocaleString()} - ${data.marketTrends.priceRange.max.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Competition</Typography>
                          <Chip label={data.marketTrends.competitionLevel} color="warning" size="small" />
                        </Box>
                      </Stack>
                    </Card>
                  </Box>
                  <Box flex="1" minWidth="300px">
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Top Performing Features
                    </Typography>
                    <Card sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        {data.marketTrends.topPerformingFeatures.map((feature, index) => (
                          <Box key={feature} display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">{index + 1}.</Typography>
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Card>
                  </Box>
                </Box>
              )}

              {/* Settings Tab */}
              {activeTab === 4 && (
                <Box display="flex" flexWrap="wrap" gap={3}>
                  <Box flex="1" minWidth="300px">
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Listing Settings
                    </Typography>
                    <Card sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Auto-renew listings"
                        />
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Email notifications for inquiries"
                        />
                        <FormControlLabel
                          control={<Switch />}
                          label="Show contact information"
                        />
                      </Stack>
                    </Card>
                  </Box>
                  <Box flex="1" minWidth="300px">
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      AI Settings
                    </Typography>
                    <Card sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Enable AI price suggestions"
                        />
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Auto-optimize listing titles"
                        />
                        <FormControlLabel
                          control={<Switch />}
                          label="Enable keyword optimization"
                        />
                      </Stack>
                    </Card>
                  </Box>
                </Box>
              )}
            </CardContent>
          </CardContent>
        </Card>
      </motion.div>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="SpeedDial"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="Add Listing"
          onClick={() => setIsListingDialogOpen(true)}
        />
        <SpeedDialAction
          icon={<Analytics />}
          tooltipTitle="Analytics"
          onClick={() => setActiveTab(1)}
        />
        <SpeedDialAction
          icon={<Psychology />}
          tooltipTitle="AI Insights"
          onClick={() => setIsAIDialogOpen(true)}
        />
      </SpeedDial>

      {/* Dialogs */}
      <Dialog open={isListingDialogOpen} onClose={() => setIsListingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Listing</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Car Title"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsListingDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setIsListingDialogOpen(false)}>
            Add Listing
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isAIDialogOpen} onClose={() => setIsAIDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Insights</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            AI-powered recommendations to optimize your listings and increase sales.
          </Typography>
          <Box sx={{ mt: 2 }}>
            {data.aiInsights.map((insight) => (
              <Card key={insight.id} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {insight.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {insight.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Chip label={`${insight.confidence}% confidence`} color="primary" size="small" />
                  <Button size="small" variant="contained">
                    Apply
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAIDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default SellerDashboard;