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
  ShoppingCart,
  AttachMoney,
  People,
  Inventory,
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
import { sellerApi } from '../services/sellerApi';

// Defaults used only as fallback while loading
const fallbackStats = {
  totalRevenue: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalProducts: 0,
  revenueGrowth: 0,
  ordersGrowth: 0,
  customersGrowth: 0,
  productsGrowth: 0,
};

// Humanize relative time for notifications
const timeAgo = (date: Date) => {
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const SellerDashboard: React.FC = () => {
  const theme = useTheme();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [orderMenuAnchor, setOrderMenuAnchor] = useState<{ el: HTMLElement; orderId: string } | null>(null);
  const [stats, setStats] = useState<any>(fallbackStats);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const notifications = React.useMemo(() => {
    const items: Array<{ id: string; title: string; message: string; type: 'success' | 'warning' | 'error' | 'info'; time: string; read: boolean; }> = [];
    recentOrders.slice(0, 8).forEach((o: any) => {
      const created = new Date(o.created_at || Date.now());
      // New order
      items.push({
        id: `${o.id}-new`,
        title: 'New Order Received',
        message: `Order ${o.order_number} placed by ${o.first_name || ''} ${o.last_name || ''}`.trim(),
        type: 'success',
        time: timeAgo(created),
        read: false,
      });
      // Payment updates
      if (o.payment_status === 'completed') {
        items.push({
          id: `${o.id}-payment`,
          title: 'Payment Received',
          message: `Payment received for ${o.order_number}`,
          type: 'info',
          time: timeAgo(new Date(o.updated_at || created)),
          read: false,
        });
      }
      // Pending warning
      if (o.status === 'pending') {
        items.push({
          id: `${o.id}-pending`,
          title: 'Order Pending',
          message: `${o.order_number} is awaiting confirmation`,
          type: 'warning',
          time: timeAgo(created),
          read: false,
        });
      }
    });
    // Limit and return
    return items.slice(0, 10);
  }, [recentOrders]);

  // Additional state from collaborator's changes
  // reserved UI state (not used currently)
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const [openDialog, setOpenDialog] = useState(false);
  const refreshInterval = 30000; // 30 seconds
  
  // Auto-refresh preference (default to true).
  // We avoid using context hooks here to prevent provider ordering issues.
  const autoRefresh = true;
  
  // Auto-refresh functionality - respects user preference from settings
  useEffect(() => {
    if (!autoRefresh) {
      // User has disabled auto-refresh
      return;
    }
    
    let interval: any | null = null;
    let mounted = true;
    
    interval = setInterval(() => {
      if (mounted) {
        // Refresh live data
        void refreshData();
      }
    }, refreshInterval);
    
    return () => {
      if (interval) clearInterval(interval);
      mounted = false;
    };
  }, [refreshInterval, autoRefresh]);

  useEffect(() => {
    void refreshData();
  }, [period]);

  const refreshData = async () => {
    try {
      // Stats
      const s = await sellerApi.orders.stats();
      setStats({
        totalRevenue: s?.total_revenue ?? 0,
        totalOrders: s?.total_orders ?? 0,
        totalCustomers: s?.total_customers ?? 0, // backend may not provide; keep 0
        totalProducts: s?.total_products ?? 0,   // backend may not provide; keep 0
        revenueGrowth: 0,
        ordersGrowth: 0,
        customersGrowth: 0,
        productsGrowth: 0,
      });

      // Recent orders
      const res = await sellerApi.orders.listMy({ page: 1, limit: 10 });
      const list = (res as any)?.orders || [];
      setRecentOrders(list);
    } catch (e) {
      console.error('Failed to refresh dashboard data', e);
    } finally {
      // no-op
    }
  };

  const handleOrderMenuOpen = (event: React.MouseEvent<HTMLElement>, orderId: string) => {
    setOrderMenuAnchor({ el: event.currentTarget, orderId });
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

  // Derive chart data from recent orders
  const sellingStatsData = React.useMemo(() => {
    // Derive from recentOrders totals; fallback to zeros
    const orders = recentOrders;
    const byKey: Record<string, { sales: number; revenue: number }> = {};
    const upsert = (key: string, amt: number) => {
      byKey[key] = byKey[key] || { sales: 0, revenue: 0 };
      byKey[key].sales += 1;
      byKey[key].revenue += Number(amt || 0);
    };
    orders.forEach((o: any) => {
      const dt = new Date(o.created_at || o.date || Date.now());
      if (period === 'week') {
        const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()];
        upsert(day, o.total_amount);
      } else if (period === 'month') {
        const week = `Week ${Math.ceil((dt.getDate()) / 7)}`;
        upsert(week, o.total_amount);
      } else {
        const month = dt.toLocaleString('en', { month: 'short' });
        upsert(month, o.total_amount);
      }
    });
    const labels = period === 'week'
      ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      : period === 'month'
      ? ['Week 1','Week 2','Week 3','Week 4','Week 5']
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return labels.map(l => ({ period: l, sales: byKey[l]?.sales || 0, revenue: byKey[l]?.revenue || 0 }));
  }, [period, recentOrders]);

  const ordersStatsData = React.useMemo(() => {
    const source = sellingStatsData;
    return source.map(row => ({ category: row.period, orders: row.sales, fullValue: row.revenue / 1000 }));
  }, [sellingStatsData]);

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
            value={formatCurrency(stats.totalRevenue)}
            icon={<AttachMoney sx={{ fontSize: 20 }} />}
            color="success"
            trend={stats.revenueGrowth}
            subtitle="Last 30 days"
          />
          <StatCard
            title="Total Orders"
            value={(stats.totalOrders || 0).toLocaleString()}
            icon={<ShoppingCart sx={{ fontSize: 20 }} />}
            color="primary"
            trend={stats.ordersGrowth}
            subtitle="This month"
          />
          <StatCard
            title="Total Customers"
            value={(stats.totalCustomers || 0).toLocaleString()}
            icon={<People sx={{ fontSize: 20 }} />}
            color="info"
            trend={stats.customersGrowth}
            subtitle="Active users"
          />
          <StatCard
            title="Total Products"
            value={(stats.totalProducts || 0).toLocaleString()}
            icon={<Inventory sx={{ fontSize: 20 }} />}
            color="warning"
            trend={stats.productsGrowth}
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
                {recentOrders.map((order: any) => (
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
                      <Avatar sx={{ width: 48, height: 48 }}>{(order.first_name?.[0] || 'U')}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" fontWeight={600} noWrap>
                          {order.first_name} {order.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {order.order_number} • {new Date(order.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        {formatCurrency(order.total_amount)}
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
                <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                  <Notifications />
                </Badge>
              </Box>
              <Stack spacing={2}>
                {notifications.map((notification) => (
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
              {/* In absence of a dedicated products API on dashboard, we keep placeholders here. */}
            </Box>
          </CardContent>
        </Card>

      </Box>
    </SellerLayout>
  );
};

export default SellerDashboard;
