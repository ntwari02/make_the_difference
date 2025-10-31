import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, Button, TextField, Divider, Chip, List, ListItem, ListItemText } from '@mui/material';

const BuyerPayments: React.FC = () => {
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiry, setExpiry] = React.useState('');
  const [cvc, setCvc] = React.useState('');

  const invoices = [
    { id: 'inv-1001', description: 'Premium Subscription', amount: 29.99, date: '2025-10-01', status: 'paid' },
    { id: 'inv-1002', description: 'Vehicle Report', amount: 9.99, date: '2025-09-20', status: 'paid' },
  ];

  return (
      <Box>
        <Box sx={{ mb: 3, p: 3, borderRadius: 2, background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h4" fontWeight={800}>Payments</Typography>
          <Typography variant="body2" color="text.secondary">Manage your payment methods and view billing history</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Payment Method</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="CVC" value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained">Save Card</Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Billing History</Typography>
                <List>
                  {invoices.map((inv) => (
                    <ListItem key={inv.id} divider>
                      <ListItemText primary={inv.description} secondary={`${inv.date} — $${inv.amount.toFixed(2)}`} />
                      <Chip label={inv.status} color={inv.status === 'paid' ? 'success' : 'default'} />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 1.5 }} />
                <Button variant="outlined">Download All Invoices</Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
  );
};

export default BuyerPayments;


