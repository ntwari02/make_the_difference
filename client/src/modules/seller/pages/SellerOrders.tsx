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
  CircularProgress,
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
  Chat as ChatIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';
import { getImageUrl } from '../../../shared/utils/imageUtils';

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
  const [newStatus, setNewStatus] = useState<string>('pending');
  const [statusSaving, setStatusSaving] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('pending');
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    processing_orders: 0,
    completed_orders: 0,
    completed_payments: 0,
    total_revenue: 0,
  });
  const autoRefresh = true;
  const refreshIntervalMs = 10000; // 10s

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

  // Lightweight realtime: periodic refresh and on window focus
  useEffect(() => {
    if (!autoRefresh) return;
    let interval: any | null = null;
    const onFocus = () => { fetchOrders(); fetchStats(); };
    window.addEventListener('focus', onFocus);
    interval = setInterval(() => {
      fetchOrders();
      fetchStats();
    }, refreshIntervalMs);
    return () => {
      window.removeEventListener('focus', onFocus);
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshIntervalMs, statusFilter, paymentFilter, searchQuery, currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentFilter !== 'all') params.payment_status = paymentFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await sellerApi.orders.listMy(params);
      const list = Array.isArray((res as any)?.orders) ? (res as any).orders : (Array.isArray(res as any) ? (res as any) : []);
      setOrders(list as any);
      setTotalPages((res as any)?.pagination?.total_pages || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await sellerApi.orders.stats();
      setStats({
        total_orders: data?.total_orders || 0,
        pending_orders: data?.pending_orders || 0,
        processing_orders: data?.processing_orders || 0,
        completed_orders: data?.completed_orders || 0,
        completed_payments: data?.completed_payments || 0,
        total_revenue: data?.total_revenue || 0,
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
      setStatusSaving(true);
      await sellerApi.orders.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      setStatusDialogOpen(false);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handlePaymentChange = async (orderId: string, newPayment: string) => {
    try {
      setPaymentSaving(true);
      await sellerApi.orders.updatePayment(orderId, newPayment);
      toast.success(`Payment status updated to ${newPayment}`);
      setPaymentDialogOpen(false);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setPaymentSaving(false);
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

  const handleMessageBuyer = (order: Order) => {
    const email = order.email;
    const subject = `Order ${order.order_number}`;
    const body = `Hello ${order.first_name || ''},\n\nRegarding your order ${order.order_number}.`;
    // Navigate to seller messages with compose params
    window.location.assign(`/seller/messages?compose=${encodeURIComponent(email || '')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
              xl: 'repeat(5, minmax(0, 1fr))',
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Card sx={{ height: '100%', minHeight: 140 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Orders
                </Typography>
                <Typography variant="h4" sx={{ fontSize: 36 }}>{stats.total_orders}</Typography>
                <Typography variant="caption" color="text.secondary">
                  All time
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ height: '100%', minHeight: 140 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Pending
                </Typography>
                <Typography variant="h4" color="warning.main" sx={{ fontSize: 36 }}>
                  {stats.pending_orders}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Waiting for action
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ height: '100%', minHeight: 140 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Processing
                </Typography>
                <Typography variant="h4" color="info.main" sx={{ fontSize: 36 }}>
                  {stats.processing_orders}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  In progress
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ height: '100%', minHeight: 140 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Revenue
                </Typography>
                <Typography variant="h4" color="success.main" sx={{ fontSize: 36 }}>
                  {formatCurrency(stats.total_revenue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed payments
                </Typography>
              </CardContent>
            </Card>
          </Box>
          {/* Completed Orders card */}
          <Box>
            <Card sx={{ height: '100%', minHeight: 140 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Completed Orders
                </Typography>
                <Typography variant="h4" color="success.main" sx={{ fontSize: 36 }}>
                  {(stats as any)?.completed_orders ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Successfully delivered
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

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
              {/* Spacer to push Refresh button to the far right on wide screens */}
              <Grid item sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />
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
                        <TableCell>Item</TableCell>
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
                          {/* Item cell */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              {(() => {
                                const firstItem = order.items?.[0] || {} as any;
                                const rawImage = firstItem.item_image || firstItem.image || (Array.isArray(firstItem.images) ? firstItem.images[0] : undefined);
                                const name = firstItem.item_name || firstItem.name || 'item';
                                const imgSrc = getImageUrl(rawImage);
                                return (
                                  <Avatar
                                    src={imgSrc}
                                    alt={name}
                                    sx={{ width: 40, height: 40 }}
                                    imgProps={{ onError: (e: any) => { e.currentTarget.src = getImageUrl(undefined as any); } }}
                                  />
                                );
                              })()}
                              <Typography variant="body2" noWrap maxWidth={220}>
                                {order.items?.[0]?.item_name || order.items?.[0]?.name || '—'}
                              </Typography>
                            </Box>
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
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Message Buyer">
                                <IconButton size="small" onClick={() => handleMessageBuyer(order)}>
                                  <ChatIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Change Payment">
                                <IconButton size="small" onClick={() => { setSelectedOrder(order); setNewPaymentStatus(order.payment_status); setPaymentDialogOpen(true); }}>
                                  <PaymentIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Change Status">
                                <IconButton size="small" onClick={() => { setSelectedOrder(order); setStatusDialogOpen(true); }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => handleViewOrder(order)}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
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

        {/* Change Status Dialog */}
        <Dialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Change Order Status</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(String(e.target.value))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)} disabled={statusSaving}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!selectedOrder || statusSaving}
              onClick={() => selectedOrder && handleStatusChange(selectedOrder.id, newStatus)}
              startIcon={statusSaving ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change Payment Status Dialog */}
        <Dialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Change Payment Status</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment</InputLabel>
                <Select
                  label="Payment"
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(String(e.target.value))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)} disabled={paymentSaving}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!selectedOrder || paymentSaving}
              onClick={() => selectedOrder && handlePaymentChange(selectedOrder.id, newPaymentStatus)}
              startIcon={paymentSaving ? <CircularProgress size={16} /> : <PaymentIcon />}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerOrders;

