import React, { useState } from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as PendingIcon,
  CheckCircle as PaidIcon,
  CreditCard as CardIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as BankIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DealerLayout from '../components/layout/DealerLayout';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'subscription' | 'commission';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
  paymentMethod: string;
  invoiceId?: string;
  vehicleId?: string;
  vehicleName?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryDate?: string;
  isDefault: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const DealerPayments: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [addPaymentMethodOpen, setAddPaymentMethodOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Mock data
  const revenueData = [
    { month: 'Jan', revenue: 45000, commission: 2250 },
    { month: 'Feb', revenue: 58000, commission: 2900 },
    { month: 'Mar', revenue: 52000, commission: 2600 },
    { month: 'Apr', revenue: 73000, commission: 3650 },
    { month: 'May', revenue: 68000, commission: 3400 },
    { month: 'Jun', revenue: 85000, commission: 4250 },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'payment',
      amount: 45000,
      status: 'completed',
      date: '2024-10-01',
      description: 'Vehicle sale - 2023 Tesla Model 3',
      paymentMethod: 'Bank Transfer',
      invoiceId: 'INV-2024-001',
      vehicleId: '1',
      vehicleName: '2023 Tesla Model 3',
    },
    {
      id: '2',
      type: 'commission',
      amount: -2250,
      status: 'completed',
      date: '2024-10-01',
      description: 'Platform commission (5%)',
      paymentMethod: 'Auto-deduct',
      invoiceId: 'INV-2024-001',
    },
    {
      id: '3',
      type: 'payment',
      amount: 72000,
      status: 'completed',
      date: '2024-09-28',
      description: 'Vehicle sale - 2024 BMW X5',
      paymentMethod: 'Credit Card',
      invoiceId: 'INV-2024-002',
      vehicleId: '2',
      vehicleName: '2024 BMW X5',
    },
    {
      id: '4',
      type: 'commission',
      amount: -3600,
      status: 'completed',
      date: '2024-09-28',
      description: 'Platform commission (5%)',
      paymentMethod: 'Auto-deduct',
      invoiceId: 'INV-2024-002',
    },
    {
      id: '5',
      type: 'payment',
      amount: 28500,
      status: 'pending',
      date: '2024-10-04',
      description: 'Vehicle sale - 2022 Toyota Camry',
      paymentMethod: 'Bank Transfer',
      invoiceId: 'INV-2024-003',
      vehicleId: '3',
      vehicleName: '2022 Toyota Camry',
    },
    {
      id: '6',
      type: 'refund',
      amount: -5000,
      status: 'completed',
      date: '2024-09-25',
      description: 'Refund - Deposit return',
      paymentMethod: 'Bank Transfer',
      invoiceId: 'INV-2024-004',
    },
    {
      id: '7',
      type: 'subscription',
      amount: -99,
      status: 'completed',
      date: '2024-10-01',
      description: 'Monthly subscription - Premium Plan',
      paymentMethod: 'Credit Card',
    },
  ];

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryDate: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'bank',
      last4: '6789',
      isDefault: false,
    },
  ];

  const [transactions] = useState(mockTransactions);
  const [paymentMethods] = useState(mockPaymentMethods);

  // Calculate statistics
  const totalRevenue = transactions
    .filter((t) => t.type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const completedTransactions = transactions.filter((t) => t.status === 'completed').length;

  const monthlyCommission = Math.abs(
    transactions
      .filter((t) => t.type === 'commission' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  // Filter transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.invoiceId?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'success';
      case 'refund':
        return 'error';
      case 'commission':
        return 'warning';
      case 'subscription':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleExport = () => {
    toast.success('Exporting financial report...');
  };

  return (
    <DealerLayout>
      <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Payments & Billing
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your financial transactions and payment methods
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            Export Report
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#06b6d4', width: 56, height: 56 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      ${totalRevenue.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      <Typography variant="caption" color="success.main" fontWeight={600}>
                        +12.5%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#14b8a6', width: 56, height: 56 }}>
                    <PendingIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pending
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      ${pendingAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Processing
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#10b981', width: 56, height: 56 }}>
                    <PaidIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Completed
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {completedTransactions}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Transactions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#fbbf24', width: 56, height: 56 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Commission
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      ${monthlyCommission.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Revenue Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Revenue Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Revenue and commission trends over time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fill: 'rgba(255,255,255,0.6)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fill: 'rgba(255,255,255,0.6)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  name="Revenue ($)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="commission"
                  stroke="#fbbf24"
                  fillOpacity={1}
                  fill="url(#commissionGradient)"
                  name="Commission ($)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Card>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Transactions" />
            <Tab label="Payment Methods" />
            <Tab label="Invoices" />
          </Tabs>

          {/* Transactions Tab */}
          <TabPanel value={tabValue} index={0}>
            <CardContent>
              {/* Toolbar */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Transactions Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                          <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No transactions found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{formatDate(transaction.date)}</Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {transaction.description}
                            </Typography>
                            {transaction.invoiceId && (
                              <Typography variant="caption" color="text.secondary">
                                {transaction.invoiceId}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              size="small"
                              color={getTypeColor(transaction.type) as any}
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">{transaction.paymentMethod}</Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                            >
                              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              size="small"
                              color={getStatusColor(transaction.status) as any}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setMenuAnchorEl(e.currentTarget);
                                setSelectedTransaction(transaction);
                              }}
                            >
                              <MoreIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </TabPanel>

          {/* Payment Methods Tab */}
          <TabPanel value={tabValue} index={1}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Saved Payment Methods
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setAddPaymentMethodOpen(true)}
                >
                  Add Payment Method
                </Button>
              </Box>

              <Grid container spacing={2}>
                {paymentMethods.map((method) => (
                  <Grid item xs={12} sm={6} key={method.id}>
                    <Paper
                      sx={{
                        p: 3,
                        border: `2px solid ${method.isDefault ? theme.palette.primary.main : theme.palette.divider}`,
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: method.type === 'card' ? 'primary.main' : 'info.main' }}>
                            {method.type === 'card' ? <CardIcon /> : <BankIcon />}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {method.type === 'card' ? method.brand : 'Bank Account'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              •••• {method.last4}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton size="small">
                          <MoreIcon />
                        </IconButton>
                      </Box>

                      {method.expiryDate && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Expires: {method.expiryDate}
                        </Typography>
                      )}

                      {method.isDefault && (
                        <Chip label="Default" size="small" color="primary" />
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Invoices Tab */}
          <TabPanel value={tabValue} index={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Invoices
              </Typography>
              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions
                      .filter((t) => t.invoiceId)
                      .slice(0, 10)
                      .map((transaction) => (
                        <TableRow key={transaction.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {transaction.invoiceId}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              ${Math.abs(transaction.amount).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              size="small"
                              color={getStatusColor(transaction.status) as any}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" startIcon={<ViewIcon />}>
                              View
                            </Button>
                            <IconButton size="small">
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </TabPanel>
        </Card>

        {/* Transaction Actions Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              toast.success('Viewing transaction details');
              setMenuAnchorEl(null);
            }}
          >
            <ViewIcon sx={{ mr: 1 }} fontSize="small" />
            View Details
          </MenuItem>
          <MenuItem
            onClick={() => {
              toast.success('Downloading invoice');
              setMenuAnchorEl(null);
            }}
          >
            <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
            Download Invoice
          </MenuItem>
        </Menu>

        {/* Add Payment Method Dialog */}
        <Dialog open={addPaymentMethodOpen} onClose={() => setAddPaymentMethodOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel>Payment Type</InputLabel>
              <Select label="Payment Type" defaultValue="card">
                <MenuItem value="card">Credit/Debit Card</MenuItem>
                <MenuItem value="bank">Bank Account</MenuItem>
              </Select>
            </FormControl>

            <TextField fullWidth label="Card Number" sx={{ mb: 2 }} />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField fullWidth label="Expiry Date" placeholder="MM/YY" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="CVV" />
              </Grid>
            </Grid>
            <TextField fullWidth label="Cardholder Name" sx={{ mb: 2 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddPaymentMethodOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                toast.success('Payment method added successfully!');
                setAddPaymentMethodOpen(false);
              }}
            >
              Add Payment Method
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DealerLayout>
  );
};

export default DealerPayments;

