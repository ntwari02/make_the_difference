import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, MenuItem, Button, Chip, ToggleButton, ToggleButtonGroup, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import StudentLayout from '../components/layout/StudentLayout';
import { studentApi } from '../services/studentApi';

const Subscriptions: React.FC = () => {
  const [plan, setPlan] = useState<'basic' | 'pro'>('pro');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [method, setMethod] = useState('stripe');

  const activate = async () => {
    try {
      await studentApi.payments.subscribe({ subscriptionType: plan, amount: plan === 'pro' ? 19 : 9, paymentMethod: method, billingCycle: billing });
      alert('Subscription activated (demo)');
    } catch {
      alert('Subscription failed (demo)');
    }
  };

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Subscriptions</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <ToggleButtonGroup value={billing} exclusive onChange={(_, v) => v && setBilling(v)} size="small">
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="yearly">Yearly <Chip size="small" color="success" label="Save 15%" sx={{ ml: 1 }} /></ToggleButton>
          </ToggleButtonGroup>
          <TextField size="small" select label="Payment Method" value={method} onChange={(e) => setMethod(e.target.value)}>
            {['stripe','paypal','apple_pay','google_pay','crypto','bnpl','financing','bank_transfer','mobile_money'].map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {[{ key: 'basic', price: 9, title: 'Basic', features: ['Access to free courses','Community support','Limited practice'] }, { key: 'pro', price: 19, title: 'Pro', features: ['All Basic features','Unlimited practice','Certificates included','Priority support'] }].map((p: any) => {
            const active = plan === p.key;
            const price = billing === 'yearly' ? Math.round(p.price * 12 * 0.85) : p.price;
            const suffix = billing === 'yearly' ? '/yr' : '/mo';
            return (
              <Box key={p.key}>
                <Card sx={{ border: 2, borderColor: active ? 'primary.main' : 'divider', transition: 'transform .15s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight={800}>{p.title}</Typography>
                      {active && <Chip color="primary" label="Selected" />}
                    </Box>
                    <Typography variant="h3" fontWeight={900} sx={{ my: 1 }}>${price}<Typography component="span" variant="subtitle2" color="text.secondary">{suffix}</Typography></Typography>
                    <List dense>
                      {p.features.map((f: string) => (
                        <ListItem key={f} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary={f} />
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button variant={active ? 'contained' : 'outlined'} onClick={() => setPlan(p.key)}>{active ? 'Current Plan' : 'Choose Plan'}</Button>
                      {active && <Button variant="contained" onClick={activate}>Activate</Button>}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={800} gutterBottom>FAQ</Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="subtitle2">Can I cancel anytime?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Yes. Your plan remains active until the end of the billing period.</Typography>
            <Typography variant="subtitle2">Do certificates require Pro?</Typography>
            <Typography variant="body2" color="text.secondary">Certificates are included in Pro; Basic users can purchase certificates individually.</Typography>
          </CardContent>
        </Card>
      </Box>
    </StudentLayout>
  );
};

export default Subscriptions;


