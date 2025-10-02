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
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  Stack,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Add,
  Edit,
  Visibility,
  TrendingUp,
  MonetizationOn,
  Analytics,
  Psychology,
  Settings,
  ShowChart,
  CheckCircle,
  Info,
  Pending,
  Build,
  Business,
  Inventory,
  People,
  CreditCard,
  Star,
  Message,
  PersonAdd,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageContainer, CardGrid } from '../../../../shared/components/layout/Containers';

// Mock data for dealer dashboard
const mockDealerData = {
  overview: {
    totalInventory: 150,
    availableCars: 120,
    soldThisMonth: 25,
    pendingSales: 8,
    totalRevenue: 2500000,
    monthlyRevenue: 180000,
    averageSalePrice: 45000,
    customerSatisfaction: 4.8,
    averageDaysInInventory: 35,
    financingApprovalRate: 78,
    warrantyClaims: 12,
  },
  inventory: [
    {
      id: 1,
      make: 'BMW',
      model: 'X5',
      year: 2022,
      price: 65000,
      cost: 58000,
      mileage: 15000,
      condition: 'excellent',
      status: 'available',
      location: 'Lot A-15',
      daysInInventory: 12,
      views: 45,
      inquiries: 8,
      testDrives: 3,
      images: ['/api/placeholder/300/200'],
      features: ['Leather Seats', 'Navigation', 'Sunroof', 'Backup Camera'],
      financing: {
        monthlyPayment: 850,
        apr: 3.9,
        termMonths: 72,
        downPayment: 13000,
      },
      warranty: {
        type: 'comprehensive',
        months: 36,
        miles: 36000,
        expires: '2025-01-22',
      },
    },
    {
      id: 2,
      make: 'Tesla',
      model: 'Model 3',
      year: 2021,
      price: 45000,
      cost: 42000,
      mileage: 22000,
      condition: 'good',
      status: 'pending_sale',
      location: 'Lot B-8',
      daysInInventory: 8,
      views: 32,
      inquiries: 5,
      testDrives: 2,
      images: ['/api/placeholder/300/200'],
      features: ['Autopilot', 'Premium Audio', 'Glass Roof', 'Supercharging'],
      financing: {
        monthlyPayment: 650,
        apr: 4.2,
        termMonths: 72,
        downPayment: 9000,
      },
      warranty: {
        type: 'battery',
        months: 48,
        miles: 50000,
        expires: '2025-01-22',
      },
    },
    {
      id: 3,
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2020,
      price: 35000,
      cost: 32000,
      mileage: 28000,
      condition: 'excellent',
      status: 'sold',
      location: 'Sold',
      daysInInventory: 22,
      views: 67,
      inquiries: 12,
      testDrives: 5,
      images: ['/api/placeholder/300/200'],
      features: ['Leather Seats', 'Navigation', 'Bluetooth', 'Cruise Control'],
      financing: {
        monthlyPayment: 520,
        apr: 3.5,
        termMonths: 60,
        downPayment: 7000,
      },
      warranty: {
        type: 'powertrain',
        months: 24,
        miles: 24000,
        expires: '2024-01-22',
      },
    },
  ],
  customers: [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1-555-0123',
      status: 'active',
      totalPurchases: 2,
      totalSpent: 110000,
      lastPurchase: '2024-01-15',
      creditScore: 780,
      preferredContact: 'email',
      notes: 'Prefers luxury vehicles, interested in BMW X7',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1-555-0124',
      status: 'prospect',
      totalPurchases: 0,
      totalSpent: 0,
      lastPurchase: null,
      creditScore: 720,
      preferredContact: 'phone',
      notes: 'First-time buyer, looking for reliable sedan under $30k',
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike@example.com',
      phone: '+1-555-0125',
      status: 'active',
      totalPurchases: 1,
      totalSpent: 45000,
      lastPurchase: '2024-01-10',
      creditScore: 750,
      preferredContact: 'email',
      notes: 'Interested in electric vehicles, considering Tesla Model Y',
    },
  ],
  analytics: {
    sales: {
      daily: [2, 3, 1, 4, 2, 5, 3],
      weekly: [12, 15, 18, 22, 20, 25, 28],
      monthly: [45, 52, 58, 65, 62, 72, 78],
    },
    inventory: {
      turnover: 4.2,
      averageDaysInStock: 35,
      fastMoving: ['BMW X5', 'Tesla Model 3', 'Mercedes C-Class'],
      slowMoving: ['Audi A6', 'Lexus RX', 'Infiniti Q50'],
    },
    customers: {
      newCustomers: 15,
      returningCustomers: 8,
      customerRetention: 85,
      averageCustomerValue: 55000,
    },
  },
  aiInsights: [
    {
      id: 1,
      type: 'pricing',
      title: 'Dynamic Pricing Opportunity',
      description: 'BMW X5 could increase profit margin by 8% with strategic pricing',
      impact: 'high',
      confidence: 91,
      action: 'Apply AI pricing strategy',
      carId: 1,
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Inventory Optimization',
      description: 'Consider reducing luxury sedan inventory by 15% based on demand trends',
      impact: 'medium',
      confidence: 84,
      action: 'Adjust inventory levels',
      category: 'luxury_sedans',
    },
    {
      id: 3,
      type: 'customer',
      title: 'Customer Retention',
      description: 'John Smith is 85% likely to purchase within 30 days',
      impact: 'high',
      confidence: 88,
      action: 'Send personalized offer',
      customerId: 1,
    },
  ],
  financing: {
    totalFinanced: 1800000,
    averageLoanAmount: 35000,
    averageAPR: 4.1,
    approvalRate: 78,
    defaultRate: 2.3,
    activeLoans: 45,
    monthlyPayments: 125000,
  },
  service: {
    totalServiceRevenue: 45000,
    warrantyWork: 12000,
    customerPayWork: 33000,
    averageServiceTicket: 850,
    customerSatisfaction: 4.7,
    repeatServiceRate: 65,
  },
};

const DealerDashboard: React.FC = () => {
  const theme = useTheme();
  const [data] = useState(mockDealerData);
  const [activeTab, setActiveTab] = useState(0);
  const [isCarDialogOpen, setIsCarDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
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
      case 'available': return theme.palette.success.main;
      case 'pending_sale': return theme.palette.warning.main;
      case 'sold': return theme.palette.info.main;
      case 'service': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle />;
      case 'pending_sale': return <Pending />;
      case 'sold': return <CheckCircle />;
      case 'service': return <Build />;
      default: return <Info />;
    }
  };

  const getCustomerStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'prospect': return theme.palette.warning.main;
      case 'inactive': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const speedDialActions = [
    {
      icon: <Add />,
      name: 'Add Vehicle',
      action: () => setIsCarDialogOpen(true),
    },
    {
      icon: <PersonAdd />,
      name: 'Add Customer',
      action: () => setIsCustomerDialogOpen(true),
    },
    {
      icon: <Analytics />,
      name: 'View Analytics',
      action: () => setActiveTab(3),
    },
    {
      icon: <Psychology />,
      name: 'AI Insights',
      action: () => setIsAIDialogOpen(true),
    },
  ];

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
            background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 100%)`,
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
              <Business />
            </Avatar>
            
            <Box flex={1}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Dealer Management Hub 🏢
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Complete inventory management and customer relationship platform
              </Typography>
              
              <Box display="flex" gap={2}>
                <Chip
                  icon={<Inventory />}
                  label={`${data.overview.totalInventory} Vehicles`}
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
                  label="AI Active"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
                onClick={() => setIsCarDialogOpen(true)}
              >
                Add Vehicle
              </Button>
              <Button
                variant="contained"
                startIcon={<Psychology />}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
                onClick={() => setIsAIDialogOpen(true)}
              >
                AI Insights
              </Button>
            </Stack>
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
              title: 'Total Revenue',
              value: `$${data.overview.totalRevenue.toLocaleString()}`,
              icon: <MonetizationOn />,
              color: theme.palette.success.main,
              subtitle: 'All time',
              trend: '+15.2%',
            },
            {
              title: 'Available Inventory',
              value: data.overview.availableCars.toString(),
              icon: <Inventory />,
              color: theme.palette.primary.main,
              subtitle: 'Ready to sell',
              trend: '+5.8%',
            },
            {
              title: 'Customer Satisfaction',
              value: `${data.overview.customerSatisfaction}/5`,
              icon: <Star />,
              color: theme.palette.warning.main,
              subtitle: 'Average rating',
              trend: '+0.3',
            },
            {
              title: 'AI Optimizations',
              value: '23 Applied',
              icon: <Psychology />,
              color: theme.palette.info.main,
              subtitle: 'This month',
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
              <Tab label="Inventory" icon={<Inventory />} />
              <Tab label="Customers" icon={<People />} />
              <Tab label="Financing" icon={<CreditCard />} />
              <Tab label="Analytics" icon={<Analytics />} />
              <Tab label="AI Insights" icon={<Psychology />} />
              <Tab label="Settings" icon={<Settings />} />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 3 }}>
            {/* Inventory Tab */}
            {activeTab === 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Vehicle Inventory
                  </Typography>
                  <Button variant="contained" startIcon={<Add />}>
                    Add Vehicle
                  </Button>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={3}>
                  {data.inventory.map((car, index) => (
                    <Box flex="1" minWidth="300px" key={car.id}>
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                        whileHover="hover"
                      >
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: theme.shadows[8],
                            },
                          }}
                        >
                          <Box
                            sx={{
                              height: 200,
                              backgroundImage: `url(${car.images[0]})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              position: 'relative',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                display: 'flex',
                                gap: 1,
                              }}
                            >
                              <Chip
                                icon={getStatusIcon(car.status)}
                                label={car.status.replace('_', ' ').charAt(0).toUpperCase() + car.status.replace('_', ' ').slice(1)}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(car.status) + '20',
                                  color: getStatusColor(car.status),
                                }}
                              />
                            </Box>
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8,
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="caption">
                                {car.views} views • {car.inquiries} inquiries
                              </Typography>
                            </Box>
                          </Box>

                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {car.year} {car.make} {car.model}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                              <Typography variant="h5" fontWeight="bold" color="primary">
                                ${car.price.toLocaleString()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Cost: ${car.cost.toLocaleString()}
                              </Typography>
                            </Box>

                            <Stack direction="row" spacing={1} mb={2}>
                              <Chip label={`${car.mileage.toLocaleString()} mi`} size="small" variant="outlined" />
                              <Chip label={car.condition} size="small" variant="outlined" />
                              <Chip label={car.location} size="small" variant="outlined" />
                            </Stack>

                            <Typography variant="body2" color="text.secondary" mb={2}>
                              {car.daysInInventory} days in inventory • {car.testDrives} test drives
                            </Typography>

                            {/* Financing Info */}
                            <Box
                              sx={{
                                backgroundColor: theme.palette.info.main + '10',
                                borderRadius: 1,
                                p: 2,
                                mb: 2,
                              }}
                            >
                              <Typography variant="subtitle2" fontWeight="bold" color="info.main" gutterBottom>
                                💳 Financing Available
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ${car.financing.monthlyPayment}/month • {car.financing.apr}% APR
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Down: ${car.financing.downPayment.toLocaleString()} • Term: {car.financing.termMonths} months
                              </Typography>
                            </Box>

                            <Box display="flex" gap={1}>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => setIsCarDialogOpen(true)}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Edit />}
                                color="primary"
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Psychology />}
                                color="secondary"
                                onClick={() => handleAIRecommendation(car)}
                              >
                                AI
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

            {/* Customers Tab */}
            {activeTab === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Customer Management
                  </Typography>
                  <Button variant="contained" startIcon={<PersonAdd />}>
                    Add Customer
                  </Button>
                </Box>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Purchases</TableCell>
                        <TableCell>Total Spent</TableCell>
                        <TableCell>Credit Score</TableCell>
                        <TableCell>Last Purchase</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.customers.map((customer, index) => (
                        <motion.tr
                          key={customer.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ width: 40, height: 40 }}>
                                {customer.name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {customer.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {customer.email}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {customer.phone}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                              size="small"
                              sx={{
                                backgroundColor: getCustomerStatusColor(customer.status) + '20',
                                color: getCustomerStatusColor(customer.status),
                              }}
                            />
                          </TableCell>
                          <TableCell>{customer.totalPurchases}</TableCell>
                          <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {customer.creditScore}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {customer.lastPurchase ? customer.lastPurchase : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View">
                                <IconButton size="small" onClick={() => setIsCustomerDialogOpen(true)}>
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small">
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Contact">
                                <IconButton size="small">
                                  <Message />
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

            {/* Financing Tab */}
            {activeTab === 2 && (
              <Box display="flex" flexWrap="wrap" gap={3}>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Financing Overview
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Total Financed</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${data.financing.totalFinanced.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Average Loan Amount</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${data.financing.averageLoanAmount.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Average APR</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {data.financing.averageAPR}%
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Approval Rate</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {data.financing.approvalRate}%
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Default Rate</Typography>
                        <Typography variant="body2" fontWeight="bold" color="error.main">
                          {data.financing.defaultRate}%
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Active Loans
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Active loans chart will be rendered here
                    </Typography>
                  </Card>
                </Box>
              </Box>
            )}

            {/* Analytics Tab */}
            {activeTab === 3 && (
              <Box display="flex" flexWrap="wrap" gap={3}>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Sales Analytics
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShowChart sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Sales chart will be rendered here
                    </Typography>
                  </Card>
                </Box>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Inventory Turnover
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp sx={{ fontSize: 64, color: theme.palette.success.main }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Turnover chart will be rendered here
                    </Typography>
                  </Card>
                </Box>
              </Box>
            )}

            {/* AI Insights Tab */}
            {activeTab === 4 && (
              <Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    AI-Powered Insights
                  </Typography>
                  <Stack spacing={2}>
                    {data.aiInsights.map((insight, index) => (
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

            {/* Settings Tab */}
            {activeTab === 5 && (
              <Box display="flex" flexWrap="wrap" gap={3}>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Inventory Settings
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Auto-apply AI pricing recommendations"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enable dynamic pricing"
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="Auto-reorder low inventory"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Email notifications for inquiries"
                      />
                    </Stack>
                  </Card>
                </Box>
                <Box flex="1" minWidth="300px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Customer Settings
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enable customer AI insights"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Auto-follow up with prospects"
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="Enable competitor monitoring"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enable customer satisfaction tracking"
                      />
                    </Stack>
                  </Card>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Dealer actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>

      {/* Vehicle Details Dialog */}
      <Dialog open={isCarDialogOpen} onClose={() => setIsCarDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Vehicle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Make" fullWidth />
            <TextField label="Model" fullWidth />
            <TextField label="Year" type="number" fullWidth />
            <TextField label="Price" type="number" fullWidth />
            <TextField label="Cost" type="number" fullWidth />
            <TextField label="Mileage" type="number" fullWidth />
            <TextField label="Location" fullWidth />
            <TextField label="Description" multiline rows={4} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCarDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Add Vehicle</Button>
        </DialogActions>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={isCustomerDialogOpen} onClose={() => setIsCustomerDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Full Name" fullWidth />
            <TextField label="Email" type="email" fullWidth />
            <TextField label="Phone" fullWidth />
            <TextField label="Credit Score" type="number" fullWidth />
            <TextField label="Notes" multiline rows={4} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCustomerDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Add Customer</Button>
        </DialogActions>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={isAIDialogOpen} onClose={() => setIsAIDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI-Powered Insights</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {data.aiInsights.map((insight) => (
              <Card key={insight.id} sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {insight.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {insight.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="primary">
                    Confidence: {insight.confidence}%
                  </Typography>
                  <Button size="small" variant="contained">
                    Apply Recommendation
                  </Button>
                </Box>
              </Card>
            ))}
          </Stack>
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
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default DealerDashboard;