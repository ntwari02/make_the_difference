import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Chip } from '@mui/material';
import StudentLayout from '../components/layout/StudentLayout';
import { studentApi } from '../services/studentApi';

const Payments: React.FC = () => {
  const [method, setMethod] = useState('stripe');
  const [amount, setAmount] = useState(49);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await studentApi.payments.history();
        setHistory(data?.transactions || data || []);
      } catch {
        setHistory([
          { id: 't1', type: 'course_purchase', amount: 49, currency: 'USD', status: 'completed', date: new Date().toISOString() },
          { id: 't2', type: 'subscription_purchase', amount: 19, currency: 'USD', status: 'pending', date: new Date().toISOString() },
        ]);
      }
    };
    load();
  }, []);

  const purchase = async () => {
    try {
      await studentApi.payments.purchaseCourse({ courseId: 'c1', amount, paymentMethod: method });
      alert('Purchase submitted (demo)');
    } catch (e) {
      alert('Payment failed (demo)');
    }
  };

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Payments</Typography>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Course Purchase (Demo)</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField size="small" label="Amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              <TextField size="small" select label="Method" value={method} onChange={(e) => setMethod(e.target.value)}>
                {['stripe','paypal','apple_pay','google_pay','crypto','bnpl','financing','bank_transfer','mobile_money'].map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
              <Button variant="contained" onClick={purchase}>Pay</Button>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Payment History</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              {['completed','pending','failed','refunded'].map((s) => (
                <Chip key={s} label={s} color={s === 'completed' ? 'success' : s === 'pending' ? 'warning' : s === 'failed' ? 'error' : 'default'} size="small" />
              ))}
            </Box>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.type}</TableCell>
                      <TableCell>{t.currency || 'USD'} {t.amount}</TableCell>
                      <TableCell>{t.status}</TableCell>
                      <TableCell>{new Date(t.date || t.created_at || Date.now()).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </StudentLayout>
  );
};

export default Payments;


