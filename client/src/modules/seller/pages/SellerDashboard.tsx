import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Badge,
  Tooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AttachMoney,
  People,
  Inventory,
  Star,
  Notifications,
  Settings,
  Add,
  MoreVert,
  Visibility,
  Refresh,
  Download,
  Assessment,
  CheckCircle,
  Warning,
  Error,
  Info,
  Receipt,
  Analytics,
  Support,
  Close,
  Save,
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';

// Mock data for demonstration
const mockStats = {
  totalRevenue: 125430,
  totalOrders: 1247,
  totalCustomers: 892,
  totalProducts: 156,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.7,
  productsGrowth: 5.2,
};

const mockRecentOrders = [
  {
    id: 'ORD-001',
    customer: 'John Smith',
    amount: 1250,
    status: 'completed',
    date: '2024-01-15',
    avatar: '/avatars/john.jpg',
  },
  {
    id: 'ORD-002',
    customer: 'Sarah Johnson',
    amount: 890,
    status: 'pending',
    date: '2024-01-15',
    avatar: '/avatars/sarah.jpg',
  },
  {
    id: 'ORD-003',
    customer: 'Mike Wilson',
    amount: 2100,
    status: 'processing',
    date: '2024-01-14',
    avatar: '/avatars/mike.jpg',
  },
  {
    id: 'ORD-004',
    customer: 'Emily Davis',
    amount: 675,
    status: 'completed',
    date: '2024-01-14',
    avatar: '/avatars/emily.jpg',
  },
  {
    id: 'ORD-005',
    customer: 'David Brown',
    amount: 1450,
    status: 'shipped',
    date: '2024-01-13',
    avatar: '/avatars/david.jpg',
  },
];

const mockTopProducts = [
  {
    id: 1,
    name: 'Premium Car Engine Oil',
    sales: 245,
    revenue: 12250,
    growth: 15.2,
    rating: 4.8,
    image: '/products/oil.jpg',
  },
  {
    id: 2,
    name: 'Brake Pad Set',
    sales: 189,
    revenue: 9450,
    growth: 8.7,
    rating: 4.6,
    image: '/products/brake.jpg',
  },
  {
    id: 3,
    name: 'Air Filter',
    sales: 156,
    revenue: 4680,
    growth: 12.3,
    rating: 4.7,
    image: '/products/filter.jpg',
  },
  {
    id: 4,
    name: 'Spark Plugs',
    sales: 134,
    revenue: 4020,
    growth: 6.8,
    rating: 4.5,
    image: '/products/spark.jpg',
  },
];

const mockNotifications = [
  {
    id: 1,
    title: 'New Order Received',
    message: 'Order #ORD-001 has been placed by John Smith',
    type: 'success',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: 2,
    title: 'Low Stock Alert',
    message: 'Brake Pad Set is running low (5 items left)',
    type: 'warning',
    time: '15 minutes ago',
    read: false,
  },
  {
    id: 3,
    title: 'Payment Received',
    message: 'Payment of $1,250 received for Order #ORD-001',
    type: 'info',
    time: '1 hour ago',
    read: true,
  },
  {
    id: 4,
    title: 'Customer Review',
    message: 'New 5-star review received for Premium Car Engine Oil',
    type: 'success',
    time: '2 hours ago',
    read: true,
  },
];

const SellerDashboard: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const refreshInterval = 30000; // 30 seconds
  
  // Quick Add Dialog form state
  const [quickAddForm, setQuickAddForm] = useState({
    productName: '',
    unitPrice: '',
    quantity: '',
    category: '',
    description: '',
    isActive: true
  });

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate data refresh
      console.log('Refreshing dashboard data...');
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    // Reset form when dialog closes
    setQuickAddForm({
      productName: '',
      unitPrice: '',
      quantity: '',
      category: '',
      description: '',
      isActive: true
    });
  };

  const handleQuickAddInputChange = (field: string, value: any) => {
    setQuickAddForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalPrice = () => {
    const unitPrice = parseFloat(quickAddForm.unitPrice) || 0;
    const quantity = parseInt(quickAddForm.quantity) || 0;
    return unitPrice * quantity;
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!quickAddForm.productName.trim()) {
      errors.productName = 'Product name is required';
    }
    
    const unitPrice = parseFloat(quickAddForm.unitPrice);
    if (!quickAddForm.unitPrice || unitPrice <= 0) {
      errors.unitPrice = 'Unit price must be greater than 0';
    }
    
    const quantity = parseInt(quickAddForm.quantity);
    if (!quickAddForm.quantity || quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    
    return errors;
  };

  const handleSaveProduct = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // Handle validation errors - you could show them in the UI
      console.log('Validation errors:', errors);
      return;
    }
    
    const totalPrice = calculateTotalPrice();
    console.log('Saving product:', {
      ...quickAddForm,
      totalPrice,
      unitPrice: parseFloat(quickAddForm.unitPrice),
      quantity: parseInt(quickAddForm.quantity)
    });
    
    // Here you would typically call an API to save the product
    handleDialogClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 20, color: 'warning.main' }} />;
      case 'error':
        return <Error sx={{ fontSize: 20, color: 'error.main' }} />;
      default:
        return <Info sx={{ fontSize: 20, color: 'info.main' }} />;
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    trend?: number;
    subtitle?: string;
  }> = ({ title, value, icon, color, trend, subtitle }) => (
    <Card sx={{ 
      height: '100%',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ 
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}>
            {icon}
          </Box>
        </Box>
        
        {trend !== undefined && (
          <Typography variant="h6" fontWeight={600} color={trend > 0 ? 'success.main' : 'error.main'} gutterBottom>
            {trend > 0 ? '+' : ''}{trend}%
          </Typography>
        )}
        
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {value}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    onClick: () => void;
  }> = ({ icon, label, color, onClick }) => (
    <Button
      variant="outlined"
      startIcon={icon}
      onClick={onClick}
      sx={{
        height: 60,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          backgroundColor: `${color}.main`,
          color: 'white',
          '& .MuiSvgIcon-root': {
            color: 'white'
          }
        }
      }}
    >
      {label}
    </Button>
  );

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Dashboard Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back! Here's what's happening with your business today.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={() => window.location.reload()}
                sx={{
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'rotate(180deg)'
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleDialogOpen}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
            >
              Quick Add
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <Download sx={{ mr: 1 }} />
                Export Data
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Settings sx={{ mr: 1 }} />
                Settings
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3, 
          mb: 4 
        }}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(mockStats.totalRevenue)}
            icon={<AttachMoney sx={{ fontSize: 20 }} />}
            color="success"
            trend={mockStats.revenueGrowth}
            subtitle="Last 30 days"
          />
          <StatCard
            title="Total Orders"
            value={mockStats.totalOrders.toLocaleString()}
            icon={<ShoppingCart sx={{ fontSize: 20 }} />}
            color="primary"
            trend={mockStats.ordersGrowth}
            subtitle="This month"
          />
          <StatCard
            title="Total Customers"
            value={mockStats.totalCustomers.toLocaleString()}
            icon={<People sx={{ fontSize: 20 }} />}
            color="info"
            trend={mockStats.customersGrowth}
            subtitle="Active users"
          />
          <StatCard
            title="Total Products"
            value={mockStats.totalProducts.toLocaleString()}
            icon={<Inventory sx={{ fontSize: 20 }} />}
            color="warning"
            trend={mockStats.productsGrowth}
            subtitle="In catalog"
          />
        </Box>

        {/* Quick Actions */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Quick Actions
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2 
            }}>
              <QuickActionButton
                icon={<Add sx={{ fontSize: 18 }} />}
                label="Add Product"
                color="primary"
                onClick={() => console.log('Add Product')}
              />
              <QuickActionButton
                icon={<Receipt sx={{ fontSize: 18 }} />}
                label="View Orders"
                color="success"
                onClick={() => console.log('View Orders')}
              />
              <QuickActionButton
                icon={<Analytics sx={{ fontSize: 18 }} />}
                label="Analytics"
                color="info"
                onClick={() => console.log('Analytics')}
              />
              <QuickActionButton
                icon={<Support sx={{ fontSize: 18 }} />}
                label="Support"
                color="warning"
                onClick={() => console.log('Support')}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3, 
          mb: 4 
        }}>
          {/* Recent Orders */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Orders
                </Typography>
                <Button size="small" variant="outlined" startIcon={<Visibility />}>
                  View All
                </Button>
              </Box>
              <List>
                {mockRecentOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar src={order.avatar} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" fontWeight={600}>
                              {order.customer}
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatCurrency(order.amount)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {order.id} • {order.date}
                            </Typography>
                            <Chip
                              label={order.status}
                              size="small"
                              color={getStatusColor(order.status) as any}
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < mockRecentOrders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Notifications
                </Typography>
                <Badge badgeContent={2} color="error">
                  <Notifications />
                </Badge>
              </Box>
              <Stack spacing={2}>
                {mockNotifications.map((notification) => (
                  <Alert
                    key={notification.id}
                    severity={notification.type as any}
                    icon={getNotificationIcon(notification.type)}
                    sx={{
                      borderRadius: 2,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                        {notification.time}
                      </Typography>
                    </Box>
                  </Alert>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Top Products */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Top Selling Products
              </Typography>
              <Button size="small" variant="outlined" startIcon={<Assessment />}>
                View Analytics
              </Button>
            </Box>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2 
            }}>
              {mockTopProducts.map((product) => (
                <Card key={product.id} sx={{ 
                  borderRadius: 2,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={product.image}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={600} noWrap>
                          {product.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="caption">
                            {product.rating}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sales: {product.sales}
                      </Typography>
                      <Chip
                        label={formatPercentage(product.growth)}
                        size="small"
                        color={product.growth > 0 ? 'success' : 'error'}
                        icon={product.growth > 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
                      />
                    </Box>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {formatCurrency(product.revenue)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
            }
          }}
          onClick={handleDialogOpen}
        >
          <Add />
        </Fab>

        {/* Quick Add Dialog */}
        <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Quick Add
              <IconButton onClick={handleDialogClose}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                variant="outlined"
                placeholder="Enter product name"
                value={quickAddForm.productName}
                onChange={(e) => handleQuickAddInputChange('productName', e.target.value)}
                required
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Unit Price (USD)"
                  variant="outlined"
                  type="number"
                  placeholder="Enter unit price"
                  value={quickAddForm.unitPrice}
                  onChange={(e) => handleQuickAddInputChange('unitPrice', e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Quantity"
                  variant="outlined"
                  type="number"
                  placeholder="Enter quantity"
                  value={quickAddForm.quantity}
                  onChange={(e) => handleQuickAddInputChange('quantity', e.target.value)}
                  inputProps={{ min: 1 }}
                  required
                />
              </Box>
              
              <TextField
                fullWidth
                label="Total Price (USD)"
                variant="outlined"
                value={formatCurrency(calculateTotalPrice())}
                InputProps={{ readOnly: true }}
                helperText="Calculated automatically: Unit Price × Quantity"
                sx={{ 
                  '& .MuiInputBase-input': { 
                    fontWeight: 600,
                    color: 'primary.main'
                  }
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select 
                  label="Category"
                  value={quickAddForm.category}
                  onChange={(e) => handleQuickAddInputChange('category', e.target.value)}
                >
                  <MenuItem value="engine">Engine Parts</MenuItem>
                  <MenuItem value="brake">Brake System</MenuItem>
                  <MenuItem value="electrical">Electrical</MenuItem>
                  <MenuItem value="suspension">Suspension</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={3}
                placeholder="Enter product description"
                value={quickAddForm.description}
                onChange={(e) => handleQuickAddInputChange('description', e.target.value)}
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={quickAddForm.isActive}
                    onChange={(e) => handleQuickAddInputChange('isActive', e.target.checked)}
                  />
                }
                label="Make product active immediately"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleDialogClose} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSaveProduct} variant="contained" startIcon={<Save />}>
              Save Product
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerDashboard;
