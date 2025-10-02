import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  Alert,
  Snackbar,
  useTheme,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CreditCard,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MonetizationOn,
  Receipt,
  Block,
  Verified,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Mock payment data
const mockTransactions = [
  {
    id: 'TXN001',
    user: 'John Doe',
    userEmail: 'john.doe@example.com',
    type: 'course_purchase',
    description: 'Advanced React Development',
    amount: 299,
    method: 'stripe',
    status: 'completed',
    currency: 'USD',
    timestamp: '2024-01-22T14:30:00Z',
    fees: 8.97,
    netAmount: 290.03,
    refundable: true,
  },
  {
    id: 'TXN002',
    user: 'Sarah Wilson',
    userEmail: 'sarah.wilson@example.com',
    type: 'car_sale',
    description: '2023 Tesla Model S',
    amount: 89900,
    method: 'paypal',
    status: 'completed',
    currency: 'USD',
    timestamp: '2024-01-22T13:45:00Z',
    fees: 2697,
    netAmount: 87203,
    refundable: false,
  },
  {
    id: 'TXN003',
    user: 'Mike Chen',
    userEmail: 'mike.chen@example.com',
    type: 'scholarship_fee',
    description: 'Application Processing Fee',
    amount: 150,
    method: 'crypto',
    status: 'pending',
    currency: 'USD',
    timestamp: '2024-01-22T12:20:00Z',
    fees: 4.5,
    netAmount: 145.5,
    refundable: true,
  },
  {
    id: 'TXN004',
    user: 'Emily Johnson',
    userEmail: 'emily.johnson@example.com',
    type: 'subscription',
    description: 'Premium Membership',
    amount: 29.99,
    method: 'stripe',
    status: 'failed',
    currency: 'USD',
    timestamp: '2024-01-22T11:15:00Z',
    fees: 0,
    netAmount: 0,
    refundable: false,
  },
];

const mockPaymentMethods = [
  {
    method: 'stripe',
    name: 'Stripe',
    transactions: 1250,
    volume: 450000,
    fees: 13500,
    status: 'active',
    successRate: 98.5,
  },
  {
    method: 'paypal',
    name: 'PayPal',
    transactions: 850,
    volume: 320000,
    fees: 9600,
    status: 'active',
    successRate: 96.2,
  },
  {
    method: 'crypto',
    name: 'Cryptocurrency',
    transactions: 120,
    volume: 45000,
    fees: 900,
    status: 'active',
    successRate: 94.8,
  },
  {
    method: 'bank_transfer',
    name: 'Bank Transfer',
    transactions: 85,
    volume: 125000,
    fees: 425,
    status: 'active',
    successRate: 99.1,
  },
];

const PaymentManagementPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const itemsPerPage = 10;

  React.useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(txn =>
        txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(txn => txn.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(txn => txn.method === methodFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(txn => txn.type === typeFilter);
    }

    setFilteredTransactions(filtered);
    setPage(1);
  }, [transactions, searchTerm, statusFilter, methodFilter, typeFilter]);

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleRefund = (transactionId: string) => {
    setTransactions(prev => prev.map(txn =>
      txn.id === transactionId ? { ...txn, status: 'refunded' } : txn
    ));
    setSnackbar({ open: true, message: 'Refund processed successfully', severity: 'success' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'pending': return <WarningIcon />;
      case 'failed': return <ErrorIcon />;
      case 'refunded': return <Block />;
      default: return null;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'stripe':
      case 'paypal': return <CreditCard />;
      case 'crypto': return <MonetizationOn />;
      case 'bank_transfer': return <AccountBalance />;
      default: return <PaymentIcon />;
    }
  };

  const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const paymentStats = {
    totalVolume: transactions.reduce((sum, txn) => sum + (txn.status === 'completed' ? txn.amount : 0), 0),
    totalTransactions: transactions.length,
    completedTransactions: transactions.filter(txn => txn.status === 'completed').length,
    pendingTransactions: transactions.filter(txn => txn.status === 'pending').length,
    failedTransactions: transactions.filter(txn => txn.status === 'failed').length,
    totalFees: transactions.reduce((sum, txn) => sum + (txn.status === 'completed' ? txn.fees : 0), 0),
  };

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Payment Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor transactions, manage payment methods, and handle refunds
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export
            </Button>
            <Button variant="contained" startIcon={<RefreshIcon />}>
              Refresh
            </Button>
          </Stack>
        </Box>
      </motion.div>

      {/* Payment Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: 'Total Volume',
              value: `$${paymentStats.totalVolume.toLocaleString()}`,
              icon: <MonetizationOn />,
              color: theme.palette.success.main,
              growth: 18.5,
            },
            {
              title: 'Total Transactions',
              value: paymentStats.totalTransactions.toLocaleString(),
              icon: <Receipt />,
              color: theme.palette.primary.main,
              growth: 12.3,
            },
            {
              title: 'Success Rate',
              value: `${((paymentStats.completedTransactions / paymentStats.totalTransactions) * 100).toFixed(1)}%`,
              icon: <CheckCircleIcon />,
              color: theme.palette.info.main,
              growth: 2.1,
            },
            {
              title: 'Total Fees',
              value: `$${paymentStats.totalFees.toLocaleString()}`,
              icon: <AccountBalance />,
              color: theme.palette.warning.main,
              growth: -5.2,
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: `${stat.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: stat.color,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="h5" fontWeight="bold" color={stat.color}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                          {stat.growth >= 0 ? (
                            <TrendingUp color="success" fontSize="small" />
                          ) : (
                            <TrendingDown color="error" fontSize="small" />
                          )}
                          <Typography
                            variant="caption"
                            color={stat.growth >= 0 ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {stat.growth > 0 ? '+' : ''}{stat.growth}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab icon={<Receipt />} label="Transactions" />
              <Tab icon={<CreditCard />} label="Payment Methods" />
              <Tab icon={<TrendingUp />} label="Analytics" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Transactions Tab */}
            {activeTab === 0 && (
              <>
                {/* Filters */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 250 }}
                  />
                  
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                      <MenuItem value="refunded">Refunded</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Method</InputLabel>
                    <Select
                      value={methodFilter}
                      label="Method"
                      onChange={(e) => setMethodFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Methods</MenuItem>
                      <MenuItem value="stripe">Stripe</MenuItem>
                      <MenuItem value="paypal">PayPal</MenuItem>
                      <MenuItem value="crypto">Crypto</MenuItem>
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={typeFilter}
                      label="Type"
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="course_purchase">Course Purchase</MenuItem>
                      <MenuItem value="car_sale">Car Sale</MenuItem>
                      <MenuItem value="scholarship_fee">Scholarship Fee</MenuItem>
                      <MenuItem value="subscription">Subscription</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Transactions Table */}
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTransactions.map((transaction, index) => (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {transaction.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {transaction.user}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {transaction.userEmail}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {transaction.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                              {transaction.type.replace('_', ' ')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              ${transaction.amount.toLocaleString()}
                            </Typography>
                            {transaction.status === 'completed' && (
                              <Typography variant="caption" color="text.secondary">
                                Net: ${transaction.netAmount.toLocaleString()}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              {getMethodIcon(transaction.method)}
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {transaction.method.replace('_', ' ')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(transaction.status)}
                              label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              size="small"
                              color={getStatusColor(transaction.status) as any}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => handleViewTransaction(transaction)}>
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              {transaction.refundable && transaction.status === 'completed' && (
                                <Tooltip title="Process Refund">
                                  <IconButton size="small" onClick={() => handleRefund(transaction.id)}>
                                    <Block />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={Math.ceil(filteredTransactions.length / itemsPerPage)}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              </>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 1 && (
              <Grid container spacing={3}>
                {mockPaymentMethods.map((method, index) => (
                  <Grid item xs={12} md={6} key={method.method}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: `${theme.palette.primary.main}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: theme.palette.primary.main,
                              }}
                            >
                              {getMethodIcon(method.method)}
                            </Box>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {method.name}
                              </Typography>
                              <Chip
                                label={method.status}
                                size="small"
                                color="success"
                                icon={<Verified />}
                              />
                            </Box>
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Transactions
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {method.transactions.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Volume
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                ${method.volume.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Success Rate
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                {method.successRate}%
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Total Fees
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                ${method.fees.toLocaleString()}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Success Rate
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={method.successRate}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: theme.palette.grey[200],
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: theme.palette.success.main,
                                },
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Analytics Tab */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Payment Analytics
                </Typography>
                <Alert severity="info">
                  Advanced payment analytics and reporting features will be implemented here, including revenue trends, payment method performance, and fraud detection metrics.
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction Details Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedTransaction.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedTransaction.status)}
                  label={selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  size="small"
                  color={getStatusColor(selectedTransaction.status) as any}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  User
                </Typography>
                <Typography variant="body1">
                  {selectedTransaction.user}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedTransaction.userEmail}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${selectedTransaction.amount.toLocaleString()} {selectedTransaction.currency}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {selectedTransaction.description}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Method
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {getMethodIcon(selectedTransaction.method)}
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {selectedTransaction.method.replace('_', ' ')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedTransaction.timestamp).toLocaleString()}
                </Typography>
              </Grid>
              {selectedTransaction.status === 'completed' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Fees
                    </Typography>
                    <Typography variant="body1">
                      ${selectedTransaction.fees.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Net Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      ${selectedTransaction.netAmount.toLocaleString()}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          {selectedTransaction?.refundable && selectedTransaction?.status === 'completed' && (
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleRefund(selectedTransaction.id);
                setIsDialogOpen(false);
              }}
            >
              Process Refund
            </Button>
          )}
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
    </Box>
  );
};

export default PaymentManagementPage;
