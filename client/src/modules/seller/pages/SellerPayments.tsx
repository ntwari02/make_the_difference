import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Avatar,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import SellerLayout from '../components/layout/SellerLayout';

interface Payment {
  id: string;
  buyer: {
    name: string;
    avatar: string;
  };
  car: {
    make: string;
    model: string;
    year: number;
  };
  amount: number;
  fee: number;
  netAmount: number;
  method: 'credit_card' | 'bank_transfer' | 'paypal' | 'cash';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  transactionId: string;
}

const SellerPayments: React.FC = () => {
  const profile = useSelector((state: RootState) => state.seller.profile);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  useEffect(() => {
    // Mock payments data
    const mockPayments: Payment[] = [
      {
        id: '1',
        buyer: { name: 'John Smith', avatar: '' },
        car: { make: 'Toyota', model: 'Camry', year: 2020 },
        amount: 25000,
        fee: 750,
        netAmount: 24250,
        method: 'credit_card',
        status: 'completed',
        date: '2024-01-15T10:30:00Z',
        transactionId: 'TXN_001234567',
      },
      {
        id: '2',
        buyer: { name: 'Sarah Johnson', avatar: '' },
        car: { make: 'Honda', model: 'Accord', year: 2019 },
        amount: 22000,
        fee: 660,
        netAmount: 21340,
        method: 'bank_transfer',
        status: 'completed',
        date: '2024-01-14T15:45:00Z',
        transactionId: 'TXN_001234568',
      },
      {
        id: '3',
        buyer: { name: 'Mike Wilson', avatar: '' },
        car: { make: 'Ford', model: 'F-150', year: 2021 },
        amount: 35000,
        fee: 1050,
        netAmount: 33950,
        method: 'credit_card',
        status: 'pending',
        date: '2024-01-13T09:20:00Z',
        transactionId: 'TXN_001234569',
      },
    ];
    setPayments(mockPayments);
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = searchTerm === '' ||
      payment.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalEarnings = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.netAmount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.netAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return <CreditCardIcon />;
      case 'bank_transfer': return <BankIcon />;
      case 'paypal': return <PaymentIcon />;
      case 'cash': return <MoneyIcon />;
      default: return <PaymentIcon />;
    }
  };

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header + Summary row aligned to controls */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 1 }}>
            Payment History
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(4, minmax(220px, 1fr)) auto' },
            gap: 2,
            alignItems: 'stretch',
          }}>
            {/* Summary Cards (span 4) */}
            <Card><CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="success.main">${totalEarnings.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Earnings</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}><MoneyIcon /></Avatar>
              </Box>
            </CardContent></Card>
            <Card><CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="warning.main">${pendingAmount.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}><PaymentIcon /></Avatar>
              </Box>
            </CardContent></Card>
            <Card><CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="primary.main">{payments.filter(p => p.status === 'completed').length}</Typography>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}><CreditCardIcon /></Avatar>
              </Box>
            </CardContent></Card>
            <Card><CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="info.main">3%</Typography>
                  <Typography variant="body2" color="text.secondary">Platform Fee</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}><BankIcon /></Avatar>
              </Box>
            </CardContent></Card>

            {/* Controls aligned at end */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
              <TextField size="small" placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select value={filter} label="Status" onChange={(e) => setFilter(e.target.value)}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
            </Box>
          </Box>
        </Box>

        

        {/* Payments Table / Cards */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Transaction History
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Button size="small" variant={viewMode === 'table' ? 'contained' : 'outlined'} onClick={() => setViewMode('table')}>Table</Button>
              <Button size="small" variant={viewMode === 'cards' ? 'contained' : 'outlined'} onClick={() => setViewMode('cards')}>Cards</Button>
            </Box>
            {viewMode === 'table' ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction</TableCell>
                      <TableCell>Buyer</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Fee</TableCell>
                      <TableCell align="right">Net</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {payment.transactionId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {payment.buyer.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {payment.buyer.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {payment.car.year} {payment.car.make} {payment.car.model}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            ${payment.amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            -${payment.fee.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            ${payment.netAmount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getMethodIcon(payment.method)}
                            <Typography variant="body2">
                              {payment.method.replace('_', ' ').toUpperCase()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status.toUpperCase()}
                            color={getStatusColor(payment.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(payment.date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Grid container spacing={2}>
                {filteredPayments.map((p) => (
                  <Grid item xs={12} sm={6} md={4} key={p.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700}>{p.transactionId}</Typography>
                          <Chip size="small" label={p.status.toUpperCase()} color={getStatusColor(p.status) as any} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>{p.buyer.name.charAt(0)}</Avatar>
                          <Typography variant="body2">{p.buyer.name}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {p.car.year} {p.car.make} {p.car.model}
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Amount</Typography>
                            <Typography variant="body2" fontWeight={700}>${p.amount.toLocaleString()}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Net</Typography>
                            <Typography variant="body2" fontWeight={700} color="success.main">${p.netAmount.toLocaleString()}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Fee</Typography>
                            <Typography variant="body2">-${p.fee.toLocaleString()}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {getMethodIcon(p.method)}
                            <Typography variant="body2">{p.method.replace('_', ' ').toUpperCase()}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {new Date(p.date).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default SellerPayments;
