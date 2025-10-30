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
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Badge,
  FormControl,
  InputLabel,
  Select,
  useTheme,
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
  Visibility,
  Assessment,
  CheckCircle,
  Warning,
  Error,
  Info,
  MoreVert,
  Edit,
  Print,
  Cancel,
  Person,
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';
import { ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Legend } from 'recharts';

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
  const theme = useTheme();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [orderMenuAnchor, setOrderMenuAnchor] = useState<{ el: HTMLElement; orderId: string } | null>(null);
  
  // Additional state from collaborator's changes
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const refreshInterval = 30000; // 30 seconds
  
  // Auto-refresh preference (default to true).
  // We avoid using context hooks here to prevent provider ordering issues.
  const autoRefresh = true;
  
  // Quick Add Dialog form state
  const [quickAddForm, setQuickAddForm] = useState({
    productName: '',
    unitPrice: '',
    quantity: '',
    category: '',
    description: '',
    isActive: true
  });

  // Auto-refresh functionality - respects user preference from settings
  useEffect(() => {
    if (!autoRefresh) {
      // User has disabled auto-refresh
      return;
    }
    
    let interval: NodeJS.Timeout | null = null;
    let mounted = true;
    
    interval = setInterval(() => {
      if (mounted) {
        // Simulate data refresh
        console.log('Refreshing dashboard data...');
      }
    }, refreshInterval);
    
    return () => {
      if (interval) clearInterval(interval);
      mounted = false;
    };
  }, [refreshInterval, autoRefresh]);

  const handleOrderMenuOpen = (event: React.MouseEvent<HTMLElement>, orderId: string) => {
    setOrderMenuAnchor({ el: event.currentTarget, orderId });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleOrderMenuClose = () => {
    setOrderMenuAnchor(null);
  };

  const handleOrderAction = (action: string, orderId: string) => {
    handleOrderMenuClose();
    // Handle different actions
    switch (action) {
      case 'view':
        console.log('View order:', orderId);
        // Navigate to order details
        break;
      case 'edit':
        console.log('Edit order:', orderId);
        // Navigate to order edit page
        break;
      case 'complete':
        console.log('Complete order:', orderId);
        // Update order status to completed
        break;
      case 'cancel':
        console.log('Cancel order:', orderId);
        // Cancel the order
        break;
      case 'print':
        console.log('Print invoice:', orderId);
        // Print invoice
        break;
      case 'customer':
        console.log('View customer:', orderId);
        // View customer profile
        break;
      default:
        break;
    }
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

  // Generate selling statistics data based on period filter (for Bar Chart)
  const sellingStatsData = React.useMemo(() => {
    if (period === 'week') {
      // Last 7 days
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day) => ({
        period: day,
        sales: Math.floor(Math.random() * 20) + 10,
        revenue: Math.floor(Math.random() * 15000) + 5000,
      }));
    } else if (period === 'month') {
      // Last 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map((month) => ({
        period: month,
        sales: Math.floor(Math.random() * 30) + 15,
        revenue: Math.floor(Math.random() * 25000) + 10000,
      }));
    } else {
      // Last 5 years
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 5 }, (_, idx) => ({
        period: String(currentYear - 4 + idx),
        sales: Math.floor(Math.random() * 200) + 100,
        revenue: Math.floor(Math.random() * 200000) + 100000,
      }));
    }
  }, [period]);

  // Generate orders statistics data for radar chart based on period
  const ordersStatsData = React.useMemo(() => {
    if (period === 'week') {
      // Orders by day of week
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        category: day,
        orders: Math.floor(Math.random() * 50) + 20,
        fullValue: Math.floor(Math.random() * 100) + 50,
      }));
    } else if (period === 'month') {
      // Orders by week of month
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week) => ({
        category: week,
        orders: Math.floor(Math.random() * 100) + 50,
        fullValue: Math.floor(Math.random() * 200) + 100,
      }));
    } else {
      // Orders by quarter
      return ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => ({
        category: quarter,
        orders: Math.floor(Math.random() * 500) + 200,
        fullValue: Math.floor(Math.random() * 1000) + 500,
      }));
    }
  }, [period]);

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
        </Box>

        {/* Period Filter */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Period</InputLabel>
            <Select 
              label="Period" 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as any)}
            >
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </Select>
          </FormControl>
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

        {/* Charts Section - Bar Chart and Radar Chart */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3, 
          mb: 4 
        }}>
          {/* Selling Statistics - Bar Chart */}
          <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? '#111827' : 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Selling Statistics - {period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'Yearly'} View
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sellingStatsData} margin={{ top: 10, right: 20, left: 0, bottom: period === 'week' ? 40 : 20 }}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : undefined }} 
                    tickLine={false} 
                    axisLine={false}
                    angle={period === 'week' ? -45 : 0}
                    textAnchor={period === 'week' ? 'end' : 'middle'}
                    height={period === 'week' ? 60 : 30}
                  />
                  <YAxis tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : undefined }} tickLine={false} axisLine={false} />
                  <ReTooltip 
                    formatter={(v: any, n: any) => [
                      n === 'revenue' ? `$${Number(v).toLocaleString()}` : v, 
                      n === 'revenue' ? 'Revenue' : 'Sales'
                    ]} 
                  />
                  <Legend wrapperStyle={{ paddingTop: 8 }} />
                  <Bar dataKey="sales" fill="url(#viewsGradient)" radius={[4, 4, 0, 0]} name="Sales" />
                  <Bar dataKey="revenue" fill="url(#favGradient)" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders Statistics - Radar Chart */}
          <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? '#111827' : 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Orders Statistics - {period === 'week' ? 'Daily' : period === 'month' ? 'Weekly' : 'Quarterly'} View
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={ordersStatsData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <PolarGrid stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : undefined }}
                    fontSize={12}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 'dataMax + 20']} 
                    tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : undefined }}
                  />
                  <ReTooltip 
                    formatter={(value: any, name: any) => [
                      name === 'orders' ? `${value} orders` : value,
                      name === 'orders' ? 'Orders' : 'Full Value'
                    ]}
                    contentStyle={{
                      backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#fff',
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Radar 
                    name="Orders" 
                    dataKey="orders" 
                    stroke="#22d3ee" 
                    fill="#22d3ee" 
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Radar 
                    name="Full Value" 
                    dataKey="fullValue" 
                    stroke="#fbbf24" 
                    fill="#fbbf24" 
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: 16 }}
                    iconType="circle"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Main Content Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3, 
          mb: 4 
        }}>
          {/* Recent Orders */}
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Orders
                </Typography>
                <Button size="small" variant="outlined" startIcon={<Visibility />}>
                  View All
                </Button>
              </Box>
              <Stack spacing={2}>
                {mockRecentOrders.map((order) => (
                  <Box
                    key={order.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      border: '1px solid',
                      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Avatar src={order.avatar} sx={{ width: 48, height: 48 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" fontWeight={600} noWrap>
                          {order.customer}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {order.id} • {order.date}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        {formatCurrency(order.amount)}
                      </Typography>
                      <Chip
                        label={order.status}
                        size="small"
                        color={getStatusColor(order.status) as any}
                        sx={{ textTransform: 'capitalize', minWidth: 90, justifyContent: 'center' }}
                      />
                      <IconButton 
                        size="small" 
                        sx={{ ml: 0.5 }}
                        onClick={(e) => handleOrderMenuOpen(e, order.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Menu
                anchorEl={orderMenuAnchor?.el || null}
                open={Boolean(orderMenuAnchor)}
                onClose={handleOrderMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                MenuListProps={{ dense: true }}
                slotProps={{ 
                  paper: { 
                    sx: { 
                      minWidth: 200, 
                      mt: 0.5,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    } 
                  } 
                }}
              >
                <MenuItem onClick={() => orderMenuAnchor && handleOrderAction('view', orderMenuAnchor.orderId)}>
                  <ListItemIcon>
                    <Visibility fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>View Details</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => orderMenuAnchor && handleOrderAction('edit', orderMenuAnchor.orderId)}>
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit Order</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => orderMenuAnchor && handleOrderAction('customer', orderMenuAnchor.orderId)}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>View Customer</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => orderMenuAnchor && handleOrderAction('complete', orderMenuAnchor.orderId)}>
                  <ListItemIcon>
                    <CheckCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mark as Complete</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => orderMenuAnchor && handleOrderAction('cancel', orderMenuAnchor.orderId)}>
                  <ListItemIcon>
                    <Cancel fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Cancel Order</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => orderMenuAnchor && handleOrderAction('print', orderMenuAnchor.orderId)}>
                  <ListItemIcon>
                    <Print fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Print Invoice</ListItemText>
                </MenuItem>
              </Menu>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card sx={{ borderRadius: 1 }}>
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
        <Card sx={{ borderRadius: 1 }}>
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

      </Box>
    </SellerLayout>
  );
};

export default SellerDashboard;
