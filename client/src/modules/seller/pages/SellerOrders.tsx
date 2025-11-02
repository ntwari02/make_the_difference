import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  GridLegacy as Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';
import { api as coreApi } from '../../../core/services/api/apiClient';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  item_type: 'car' | 'spare_part' | 'mixed';
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  delivery_method: 'pickup' | 'delivery' | 'ship';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  invoice_status?: 'pending' | 'sent';
  items: any[];
  item_count?: number;
  total_quantity?: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  completed_orders: number;
  completed_payments: number;
  total_revenue: number;
}

interface InvoiceItem {
  id: string;
  item_id: string;
  item_type: 'car' | 'spare_part';
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image?: string | null;
}

interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  order_number: string;
  order_id: string;
  buyer: {
    name: string;
    email: string;
    phone: string;
    address: any;
  };
  seller: {
    business_name: string;
    email: string;
    phone: string;
    address: any;
    tax_id: string;
    registration_number: string;
  };
  order_date: string;
  payment_date: string | null;
  payment_method: string;
  payment_status: string;
  delivery_method: string;
  delivery_address: any;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  buyer_notes?: string | null;
  seller_notes?: string | null;
  status: string;
}

const SellerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats>({
    total_orders: 0,
    pending_orders: 0,
    processing_orders: 0,
    completed_orders: 0,
    completed_payments: 0,
    total_revenue: 0,
  });

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Send invoice state
  const [sendingInvoice, setSendingInvoice] = useState<string | null>(null);

  // Invoice view dialog state
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, paymentFilter, searchQuery, currentPage]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

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
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      if (error?.response?.status === 404) {
        setOrders([]);
        setTotalPages(1);
      } else {
        toast.error('Failed to fetch orders');
      }
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

  const handleViewOrder = async (orderId: string) => {
    setInvoiceDialogOpen(true);
    setInvoiceLoading(true);
    setInvoice(null);
    try {
      const response = await coreApi.get(`/orders/${orderId}/invoice`);
      const invoiceData = (response as any).data?.data || (response as any).data;
      setInvoice(invoiceData);
    } catch (err: any) {
      console.error('Error fetching invoice:', err);
      toast.error('Failed to load invoice');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.payment_status);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      if (newStatus !== selectedOrder.status) {
        await sellerApi.orders.updateStatus(selectedOrder.id, newStatus);
      }
      if (newPaymentStatus !== selectedOrder.payment_status) {
        await sellerApi.orders.updatePayment(selectedOrder.id, newPaymentStatus);
      }
      toast.success('Order updated successfully');
      setEditDialogOpen(false);
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(error?.response?.data?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleSendInvoice = async (orderId: string) => {
    setSendingInvoice(orderId);
    try {
      await sellerApi.orders.sendInvoice(orderId);
      toast.success('Invoice sent to buyer successfully');
      fetchOrders();
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast.error(error?.response?.data?.message || 'Failed to send invoice');
    } finally {
      setSendingInvoice(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoice) {
      toast.error('Invoice data not available');
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDFModule: any = await import('jspdf');
      const jsPDF = jsPDFModule.default || jsPDFModule;

      const invoiceElement = document.querySelector('[data-invoice-content]') as HTMLElement;
      if (!invoiceElement) {
        toast.error('Invoice content not found');
        return;
      }

      toast.loading('Generating PDF...');

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `invoice_${invoice.invoice_number || invoice.order_number || 'unknown'}.pdf`;
      pdf.save(filename);
      
      toast.dismiss();
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF. Please try printing instead.');
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'success';
      case 'processing':
      case 'confirmed':
      case 'shipped':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SellerLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Orders Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all your orders
            </Typography>
          </Box>
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
          {/* Total Orders */}
          <Card sx={{ height: '100%', minHeight: 140 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Orders
              </Typography>
              <Typography variant="h4" sx={{ fontSize: 36 }}>
                {stats.total_orders}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All time
              </Typography>
            </CardContent>
          </Card>

          {/* Pending Orders */}
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

          {/* Processing Orders */}
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

          {/* Completed Orders */}
          <Card sx={{ height: '100%', minHeight: 140 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Completed Orders
              </Typography>
              <Typography variant="h4" color="success.main" sx={{ fontSize: 36 }}>
                {stats.completed_orders || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Successfully delivered
              </Typography>
            </CardContent>
          </Card>

          {/* Total Revenue */}
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

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
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
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
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
                    <MenuItem value="refunded">Refunded</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Orders Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No orders found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You haven\'t received any orders yet'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Order Number</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Invoice</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {order.order_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(order.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.item_type === 'car' ? 'Car' : order.item_type === 'spare_part' ? 'Spare Part' : 'Mixed'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.total_quantity || order.item_count || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(order.total_amount, order.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          size="small"
                          color={getStatusColor(order.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          size="small"
                          color={getPaymentStatusColor(order.payment_status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={order.invoice_status === 'sent' ? 'Sent' : 'Pending'}
                            size="small"
                            color={order.invoice_status === 'sent' ? 'success' : 'warning'}
                            variant="outlined"
                          />
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="View Invoice">
                              <IconButton
                                size="small"
                                onClick={() => handleViewOrder(order.id)}
                                color="primary"
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Order">
                              <IconButton
                                size="small"
                                onClick={() => handleEditOrder(order)}
                                color="secondary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {order.invoice_status === 'pending' && (
                              <Tooltip title={sendingInvoice === order.id ? 'Sending...' : 'Send Invoice'}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleSendInvoice(order.id)}
                                  disabled={sendingInvoice === order.id}
                                  color="info"
                                >
                                  {sendingInvoice === order.id ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <SendIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Edit Order Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Order Status</InputLabel>
                <Select
                  label="Order Status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  label="Payment Status"
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
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
            <Button onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Invoice View Dialog */}
        <Dialog 
          open={invoiceDialogOpen} 
          onClose={() => setInvoiceDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{ sx: { maxHeight: '90vh' } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Invoice</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Print">
                  <IconButton size="small" onClick={handlePrint}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download PDF">
                  <IconButton size="small" onClick={handleDownloadPDF} disabled={!invoice}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {invoiceLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : invoice ? (
              <Box data-invoice-content>
                <Card sx={{ boxShadow: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    {/* Invoice Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box
                          component="img"
                          src="/logo.jpg"
                          alt="Reaglex Logo"
                          sx={{
                            height: 60,
                            width: 60,
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                        <Box>
                          <Typography variant="h4" fontWeight={700} gutterBottom>
                            Reaglex
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="text.secondary" gutterBottom>
                            INVOICE
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Invoice #: {invoice.invoice_number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Order #: {invoice.order_number}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Date: {formatDate(invoice.invoice_date)}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Seller & Buyer Info */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                          From (Seller)
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {invoice.seller.business_name}
                        </Typography>
                        {invoice.seller.email && (
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            {invoice.seller.email}
                          </Typography>
                        )}
                        {invoice.seller.phone && (
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            {invoice.seller.phone}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                          To (Buyer)
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {invoice.buyer.name}
                        </Typography>
                        {invoice.buyer.email && (
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            {invoice.buyer.email}
                          </Typography>
                        )}
                        {invoice.buyer.phone && (
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            {invoice.buyer.phone}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>

                    {/* Order Details */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        Order Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            Payment Method:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {invoice.payment_method}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            Payment Status:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            Delivery Method:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {invoice.delivery_method.charAt(0).toUpperCase() + invoice.delivery_method.slice(1)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            Order Status:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Items Table */}
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Qty</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {invoice.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {item.image && (
                                    <Box
                                      component="img"
                                      src={getImageUrl(item.image)}
                                      alt={item.name}
                                      sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                  )}
                                  <Typography variant="body2" fontWeight={600}>
                                    {item.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{item.sku}</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">{item.quantity}</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {formatCurrency(item.unit_price, invoice.currency)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={600}>
                                  {formatCurrency(item.total_price, invoice.currency)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Totals */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Box sx={{ minWidth: 250 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Subtotal:</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(invoice.subtotal, invoice.currency)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Tax ({invoice.tax_rate}%):</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(invoice.tax_amount, invoice.currency)}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6" fontWeight={700}>
                            Total:
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="primary.main">
                            {formatCurrency(invoice.total, invoice.currency)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Alert severity="error">Failed to load invoice</Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInvoiceDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerOrders;
