import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack,
  Avatar,
  Divider,
  Alert,
  LinearProgress,
  Menu,
  Pagination,
  Tooltip,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';

interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  item_type: 'car' | 'spare_part' | 'mixed';
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  delivery_method: 'pickup' | 'delivery' | 'ship';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  items: any[];
  item_count?: number;
  created_at: string;
  updated_at: string;
}

const SellerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    processing_orders: 0,
    completed_payments: 0,
    total_revenue: 0,
  });

  // Mock data for demonstration (replace with API calls)
  const mockOrders: Order[] = [
    {
      id: '1',
      order_number: 'ORD-1700000000-1234',
      buyer_id: 'buyer1',
      seller_id: 'seller1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      item_type: 'car',
      total_amount: 28500,
      currency: 'USD',
      payment_status: 'completed',
      payment_method: 'Bank Transfer',
      delivery_method: 'pickup',
      status: 'confirmed',
      items: [{ id: '1', name: '2020 Honda Civic', quantity: 1, total_price: 28500 }],
      item_count: 1,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      order_number: 'ORD-1700001000-5678',
      buyer_id: 'buyer2',
      seller_id: 'seller1',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      item_type: 'spare_part',
      total_amount: 450,
      currency: 'USD',
      payment_status: 'processing',
      payment_method: 'Credit Card',
      delivery_method: 'delivery',
      status: 'processing',
      items: [{ id: '1', name: 'Brake Pads Set', quantity: 2, total_price: 450 }],
      item_count: 1,
      created_at: '2024-01-16T14:20:00Z',
      updated_at: '2024-01-16T14:20:00Z',
    },
  ];

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [statusFilter, paymentFilter, searchQuery, currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      setTimeout(() => {
        let filteredOrders = mockOrders;

        if (statusFilter !== 'all') {
          filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }
        if (paymentFilter !== 'all') {
          filteredOrders = filteredOrders.filter(order => order.payment_status === paymentFilter);
        }
        if (searchQuery) {
          filteredOrders = filteredOrders.filter(order =>
            order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setOrders(filteredOrders);
        setTotalPages(1);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats - replace with actual API
      setStats({
        total_orders: 24,
        pending_orders: 3,
        processing_orders: 5,
        completed_payments: 16,
        total_revenue: 125000,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Mock API call - replace with actual API
      toast.success(`Order status updated to ${newStatus}`);
      setStatusDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'processing': return 'primary';
      case 'shipped': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'refunded': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SellerLayout>
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon /> Orders Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track all your orders
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md sx={{ minWidth: 0 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Orders
                </Typography>
                <Typography variant="h4">{stats.total_orders}</Typography>
                <Typography variant="caption" color="text.secondary">
                  All time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md sx={{ minWidth: 0 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Pending
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.pending_orders}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Waiting for action
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md sx={{ minWidth: 0 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Processing
                </Typography>
                <Typography variant="h4" color="info.main">
                  {stats.processing_orders}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  In progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md sx={{ minWidth: 0 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Revenue
                </Typography>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(stats.total_revenue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed payments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment</InputLabel>
                  <Select
                    value={paymentFilter}
                    label="Payment"
                    onChange={(e) => setPaymentFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Payments</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchOrders}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ p: 3 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  Loading orders...
                </Typography>
              </Box>
            ) : orders.length === 0 ? (
              <Alert severity="info">No orders found matching your criteria.</Alert>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Order #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {order.order_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {order.first_name?.[0] || 'C'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {order.first_name} {order.last_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {order.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{order.item_count || 0} items</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.item_type}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(order.total_amount, order.currency)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={getStatusColor(order.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.payment_status}
                              color={getPaymentColor(order.payment_status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">{formatDate(order.created_at)}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => handleViewOrder(order)}>
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* View Order Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {selectedOrder.order_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Customer
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedOrder.first_name} {selectedOrder.last_name}
                    </Typography>
                    <Typography variant="body2">{selectedOrder.email}</Typography>
                    <Typography variant="body2">{selectedOrder.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Order Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(selectedOrder.created_at)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      label={selectedOrder.status}
                      color={getStatusColor(selectedOrder.status) as any}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      label={selectedOrder.payment_status}
                      color={getPaymentColor(selectedOrder.payment_status) as any}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Order Items
                    </Typography>
                    {selectedOrder.items?.map((item, index) => (
                      <Box key={index} sx={{ py: 1 }}>
                        <Typography variant="body2">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Qty: {item.quantity} × {formatCurrency(item.total_price / item.quantity, selectedOrder.currency)}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6">
                        {formatCurrency(selectedOrder.total_amount, selectedOrder.currency)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button variant="contained" startIcon={<PrintIcon />}>
              Print
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerOrders;

