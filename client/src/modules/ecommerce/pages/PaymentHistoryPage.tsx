import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CreditCard,
  CheckCircle,
  Error,
  Schedule,
  Receipt,
  Download,
  FilterList,
  Search,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/hooks/useAuth';
import PaymentApiService from '../../../core/services/api/paymentApiService';
import {
  PaymentResponse,
  PaymentStatus,
  PaymentAnalytics,
} from '../../../core/types/payment.types';

const PaymentHistoryPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');

  useEffect(() => {
    loadPayments();
    loadAnalytics();
  }, [currentPage, searchQuery, statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await PaymentApiService.getPaymentHistory(
        currentPage,
        10,
        statusFilter || undefined
      );

      // Filter by search query if provided
      let filteredPayments = response.payments;
      if (searchQuery) {
        filteredPayments = response.payments.filter(payment =>
          payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setPayments(filteredPayments);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Failed to load payment history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await PaymentApiService.getPaymentAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'failed':
      case 'cancelled':
        return 'error';
      case 'refunded':
      case 'partially_refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'pending':
      case 'processing':
        return <Schedule />;
      case 'failed':
      case 'cancelled':
        return <Error />;
      default:
        return <Payment />;
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleRetryLoad = () => {
    loadPayments();
    loadAnalytics();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Payment History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your payment transactions
          </Typography>
        </Box>

        {/* Analytics Cards */}
        {analytics && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <PaymentIcon />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold">
                      {analytics.total_payments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Payments
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <CheckCircle />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold">
                      {analytics.successful_payments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Successful
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {formatCurrency(analytics.total_amount, 'USD')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(analytics.average_payment_amount, 'USD')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Payment
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        )}

        {/* Filters and Search */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | '')}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleRetryLoad}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Payments Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                <CircularProgress size={60} />
              </Box>
            ) : payments.length > 0 ? (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Payment ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((payment) => (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {payment.id.substring(0, 12)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(payment.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(payment.amount, payment.currency)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <CreditCard fontSize="small" />
                              <Typography variant="body2">
                                {payment.payment_method.replace('_', ' ').toUpperCase()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={payment.status.toUpperCase()}
                              color={getStatusColor(payment.status)}
                              size="small"
                              icon={getStatusIcon(payment.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {payment.transaction_id?.substring(0, 16)}...
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Download Receipt">
                              <IconButton size="small">
                                <Download fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" sx={{ p: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
              </>
            ) : (
              <Box textAlign="center" py={8}>
                <PaymentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No payments found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery || statusFilter
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Your payment history will appear here once you make purchases.'
                  }
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Summary */}
        {analytics && analytics.payment_method_breakdown.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Payment Methods Used
              </Typography>

              <Grid container spacing={2}>
                {analytics.payment_method_breakdown.map((method) => (
                  <Grid item xs={12} sm={6} md={3} key={method.method}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {method.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {method.method.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        {method.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </Container>
  );
};

export default PaymentHistoryPage;
