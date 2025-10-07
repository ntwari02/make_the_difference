import React, { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, CircularProgress, Chip, Avatar, IconButton,
  TextField, InputAdornment, ToggleButtonGroup, ToggleButton, Menu, MenuItem, Divider,
  ListItemIcon, ListItemText, Tooltip, LinearProgress, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, Rating, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, useTheme, alpha, List, ListItem, ListItemAvatar
} from '@mui/material';
import {
  Search as SearchIcon, FilterList as FilterIcon, Download as DownloadIcon, MoreVert as MoreIcon,
  AttachMoney as MoneyIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon,
  AccountBalance as BankIcon, CreditCard as CardIcon, Receipt as ReceiptIcon,
  Assessment as AnalyticsIcon, Visibility as ViewIcon, GetApp as ExportIcon,
  Schedule as ScheduleIcon, CheckCircle as CompletedIcon, Pending as PendingIcon,
  Cancel as CancelledIcon, Star as StarIcon, Group as StudentsIcon,
  School as CourseIcon, CalendarToday as CalendarIcon, MonetizationOn as RevenueIcon,
  Payment as PaymentIcon, AccountBalanceWallet as WalletIcon, Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis,
  Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorEarnings: React.FC = () => {
  const theme = useTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'transactions' | 'analytics'>('overview');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Mock data for enhanced UI
  const earningsData = [
    { month: 'Jan', earnings: 4200, students: 45, courses: 3 },
    { month: 'Feb', earnings: 5800, students: 62, courses: 4 },
    { month: 'Mar', earnings: 7200, students: 78, courses: 5 },
    { month: 'Apr', earnings: 8900, students: 95, courses: 6 },
    { month: 'May', earnings: 11200, students: 118, courses: 7 },
    { month: 'Jun', earnings: 13400, students: 142, courses: 8 },
  ];

  const courseEarnings = [
    { name: 'React Development', value: 15600, color: '#1976d2' },
    { name: 'JavaScript Patterns', value: 11200, color: '#10b981' },
    { name: 'Node.js Backend', value: 8900, color: '#f59e0b' },
    { name: 'Python Data Science', value: 28400, color: '#ef4444' },
  ];

  const mockTransactions = [
    {
      id: '1',
      type: 'course_sale',
      description: 'Complete React Development Course',
      amount: 299.99,
      status: 'completed',
      date: '2024-01-20',
      student: 'Alice Johnson',
      course: 'React Development',
      commission: 89.99,
      platformFee: 30.00,
      netAmount: 269.99
    },
    {
      id: '2',
      type: 'course_sale',
      description: 'Advanced JavaScript Patterns',
      amount: 199.99,
      status: 'pending',
      date: '2024-01-19',
      student: 'Bob Smith',
      course: 'JavaScript Patterns',
      commission: 59.99,
      platformFee: 20.00,
      netAmount: 179.99
    },
    {
      id: '3',
      type: 'course_sale',
      description: 'Node.js Backend Development',
      amount: 399.99,
      status: 'completed',
      date: '2024-01-18',
      student: 'Carol Davis',
      course: 'Node.js Backend',
      commission: 119.99,
      platformFee: 40.00,
      netAmount: 359.99
    },
    {
      id: '4',
      type: 'refund',
      description: 'Python Data Science Fundamentals',
      amount: -199.99,
      status: 'cancelled',
      date: '2024-01-17',
      student: 'David Wilson',
      course: 'Python Data Science',
      commission: -59.99,
      platformFee: -20.00,
      netAmount: -179.99
    },
    {
      id: '5',
      type: 'course_sale',
      description: 'Complete React Development Course',
      amount: 299.99,
      status: 'completed',
      date: '2024-01-16',
      student: 'Emma Brown',
      course: 'React Development',
      commission: 89.99,
      platformFee: 30.00,
      netAmount: 269.99
    }
  ];

  const filteredTransactions = useMemo(() => {
    let filtered = mockTransactions.filter(transaction =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.course.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm, statusFilter]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, transaction: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'cancelled':
        return <CancelledIcon color="error" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course_sale':
        return <CourseIcon color="primary" />;
      case 'refund':
        return <CancelledIcon color="error" />;
      case 'bonus':
        return <StarIcon color="warning" />;
      default:
        return <ReceiptIcon color="action" />;
    }
  };

  const TransactionCard: React.FC<{ transaction: any }> = ({ transaction }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getTypeIcon(transaction.type)}
            <Typography variant="h6" fontWeight={600}>{transaction.description}</Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, transaction)}
          >
            <MoreIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>Transaction Details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StudentsIcon fontSize="small" color="action" />
              <Typography variant="body2">{transaction.student}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2">{transaction.date}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip 
            icon={getStatusIcon(transaction.status)} 
            label={transaction.status} 
            size="small" 
            color={getStatusColor(transaction.status) as any}
          />
          <Chip size="small" label={transaction.course} variant="outlined" />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Gross Amount</Typography>
            <Typography variant="h6" fontWeight={600} color={transaction.amount > 0 ? 'success.main' : 'error.main'}>
              ${Math.abs(transaction.amount).toFixed(2)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Net Amount</Typography>
            <Typography variant="h6" fontWeight={600} color={transaction.netAmount > 0 ? 'success.main' : 'error.main'}>
              ${Math.abs(transaction.netAmount).toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<ReceiptIcon />}
            sx={{ flexGrow: 1 }}
          >
            Receipt
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<ViewIcon />}
            onClick={() => setDetailsOpen(true)}
          >
            Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const TransactionTable: React.FC = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell>Student</TableCell>
            <TableCell>Course</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredTransactions.map((transaction) => (
            <TableRow key={transaction.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTypeIcon(transaction.type)}
                  <Typography variant="body2">{transaction.description}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{transaction.student}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{transaction.course}</Typography>
              </TableCell>
              <TableCell>
                <Typography 
                  variant="body2" 
                  fontWeight={600}
                  color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                >
                  ${Math.abs(transaction.amount).toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  icon={getStatusIcon(transaction.status)} 
                  label={transaction.status} 
                  size="small" 
                  color={getStatusColor(transaction.status) as any}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{transaction.date}</Typography>
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, transaction)}>
                  <MoreIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <InstructorLayout>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Earnings & Analytics</Typography>
            <Typography variant="body2" color="text.secondary">
              Track your revenue, manage payouts, and analyze performance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<ExportIcon />}
              sx={{ px: 3 }}
            >
              Export Data
            </Button>
            <Button 
              variant="contained" 
              startIcon={<PaymentIcon />}
              sx={{ px: 3 }}
            >
              Request Payout
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">This Month</Typography>
                  <Typography variant="h4" fontWeight={800}>$8,430</Typography>
                  <Chip size="small" color="success" label="+12%" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 44, height: 44 }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Pending Payout</Typography>
                  <Typography variant="h4" fontWeight={800}>$2,140</Typography>
                  <Chip size="small" color="warning" label="Processing" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 44, height: 44 }}>
                  <PendingIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Total Earnings</Typography>
                  <Typography variant="h4" fontWeight={800}>$42,380</Typography>
                  <Chip size="small" color="primary" label="All time" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Avg per Course</Typography>
                  <Typography variant="h4" fontWeight={800}>$1,247</Typography>
                  <Chip size="small" color="info" label="Per sale" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 44, height: 44 }}>
                  <CourseIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Filters and Controls */}
        <Card sx={{ borderRadius: 1, mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
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
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <ToggleButtonGroup
                  value={statusFilter}
                  exclusive
                  onChange={(_, value) => value && setStatusFilter(value)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="completed">Completed</ToggleButton>
                  <ToggleButton value="pending">Pending</ToggleButton>
                  <ToggleButton value="cancelled">Cancelled</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={12} md={3}>
                <ToggleButtonGroup
                  value={timeFilter}
                  exclusive
                  onChange={(_, value) => value && setTimeFilter(value)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="7d">7d</ToggleButton>
                  <ToggleButton value="30d">30d</ToggleButton>
                  <ToggleButton value="90d">90d</ToggleButton>
                  <ToggleButton value="ytd">YTD</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={12} md={2}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, value) => value && setViewMode(value)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="overview">Overview</ToggleButton>
                  <ToggleButton value="transactions">Transactions</ToggleButton>
                  <ToggleButton value="analytics">Analytics</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content */}
      {viewMode === 'overview' ? (
        <Box sx={{ display: 'grid', gap: 3 }}>
          {/* Charts Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
            <Card sx={{ borderRadius: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Earnings Trend</Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Earnings']} />
                      <Area type="monotone" dataKey="earnings" stroke="#1976d2" fill="#1976d2" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Earnings by Course</Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={courseEarnings} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                        {courseEarnings.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Earnings']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Recent Transactions */}
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Transactions</Typography>
                <Button size="small" onClick={() => setViewMode('transactions')}>View All</Button>
              </Box>
              <List>
                {mockTransactions.slice(0, 5).map((transaction) => (
                  <ListItem key={transaction.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: transaction.amount > 0 ? 'success.main' : 'error.main' }}>
                        {getTypeIcon(transaction.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={transaction.description}
                      secondary={`${transaction.student} • ${transaction.date}`}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={600}
                        color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                      >
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </Typography>
                      <Chip 
                        icon={getStatusIcon(transaction.status)} 
                        label={transaction.status} 
                        size="small" 
                        color={getStatusColor(transaction.status) as any}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      ) : viewMode === 'transactions' ? (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
          {filteredTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Earnings Analytics</Typography>
                  <Box sx={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={earningsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="earnings" fill="#1976d2" name="Earnings" />
                        <Bar dataKey="students" fill="#10b981" name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
                      <Typography variant="h4" fontWeight={800}>12.5%</Typography>
                      <LinearProgress variant="determinate" value={75} sx={{ mt: 1 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Avg Course Price</Typography>
                      <Typography variant="h4" fontWeight={800}>$247</Typography>
                      <LinearProgress variant="determinate" value={60} sx={{ mt: 1 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Student Retention</Typography>
                      <Typography variant="h4" fontWeight={800}>89%</Typography>
                      <LinearProgress variant="determinate" value={89} sx={{ mt: 1 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Transaction Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 200 } }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Download Receipt</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><ExportIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export Data</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon><CancelledIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Dispute Transaction</ListItemText>
        </MenuItem>
      </Menu>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Detailed transaction information and breakdown will be displayed here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </InstructorLayout>
  );
};

export default InstructorEarnings;


