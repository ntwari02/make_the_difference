import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Download,
  Email,
  Print,
  Share,
  Home,
  ShoppingBag,
  Receipt,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PaymentResponse, BillingAddress } from '../../../core/types/payment.types';

interface PaymentConfirmationProps {
  payment: PaymentResponse;
  orderDetails?: {
    orderId: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
  };
  billingAddress: BillingAddress;
  onContinueShopping: () => void;
  onViewOrders: () => void;
  onDownloadReceipt?: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  payment,
  orderDetails,
  billingAddress,
  onContinueShopping,
  onViewOrders,
  onDownloadReceipt,
}) => {
  const theme = useTheme();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main }} />
              </Avatar>
            </motion.div>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Payment Successful!
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Thank you for your payment. Your transaction has been completed successfully.
            </Typography>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <CheckCircle sx={{ color: theme.palette.success.main }} />
              <Typography variant="body2" fontWeight="medium" color="success.main">
                Order Confirmed
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Payment Details
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Payment ID
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {payment.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Transaction ID
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {payment.transaction_id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Amount
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(payment.amount, payment.currency)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Method
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {payment.payment_method.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(payment.created_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={payment.status.toUpperCase()}
                        color="success"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>

            {orderDetails && (
              <Card sx={{ mt: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Order Summary
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    {orderDetails.items.map((item) => (
                      <Box
                        key={item.id}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ py: 1 }}
                      >
                        <Box>
                          <Typography variant="body1">{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(item.price * item.quantity, 'USD')}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">
                      Total
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {formatCurrency(orderDetails.totalAmount, 'USD')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Billing Address
                </Typography>

                <Typography variant="body2">
                  {billingAddress.first_name} {billingAddress.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {billingAddress.address_line_1}
                </Typography>
                {billingAddress.address_line_2 && (
                  <Typography variant="body2" color="text.secondary">
                    {billingAddress.address_line_2}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {billingAddress.city}, {billingAddress.state} {billingAddress.postal_code}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {billingAddress.country}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {billingAddress.email}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  What's Next?
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Email sx={{ color: theme.palette.primary.main }} />
                    <Typography variant="body2">
                      Confirmation email sent to {billingAddress.email}
                    </Typography>
                  </Box>

                  {orderDetails && (
                    <Box display="flex" alignItems="center" gap={2}>
                      <Receipt sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="body2">
                        Order will be processed within 1-2 business days
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center" gap={2}>
                    <CheckCircle sx={{ color: theme.palette.success.main }} />
                    <Typography variant="body2">
                      Payment secured and confirmed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Actions
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  {onDownloadReceipt && (
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={onDownloadReceipt}
                      fullWidth
                    >
                      Download Receipt
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<Print />}
                    onClick={() => window.print()}
                    fullWidth
                  >
                    Print Receipt
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Payment Confirmation',
                          text: `Payment of ${formatCurrency(payment.amount, payment.currency)} confirmed`,
                          url: window.location.href,
                        });
                      }
                    }}
                    fullWidth
                  >
                    Share
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box
          display="flex"
          justifyContent="center"
          gap={2}
          sx={{ mt: 4 }}
        >
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={onContinueShopping}
            size="large"
          >
            Continue Shopping
          </Button>

          {orderDetails && (
            <Button
              variant="contained"
              startIcon={<ShoppingBag />}
              onClick={onViewOrders}
              size="large"
            >
              View My Orders
            </Button>
          )}
        </Box>
      </motion.div>
    </Box>
  );
};

export default PaymentConfirmation;
