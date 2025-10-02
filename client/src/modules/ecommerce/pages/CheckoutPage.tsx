import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  CreditCard,
  CheckCircle,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PaymentMethodSelector from '../../../shared/components/payment/PaymentMethodSelector';
import PaymentForm from '../../../shared/components/payment/PaymentForm';
import PaymentProcessing from '../../../shared/components/payment/PaymentProcessing';
import PaymentConfirmation from '../../../shared/components/payment/PaymentConfirmation';
import {
  PaymentMethod,
  PaymentResponse,
  BillingAddress,
} from '../../../core/types/payment.types';

const CheckoutPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line_1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  // Mock cart data - in a real app, this would come from Redux/Context
  const [cartItems] = useState([
    {
      id: '1',
      name: 'Brake Pad Set - Toyota Camry',
      quantity: 1,
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    },
    {
      id: '2',
      name: 'Engine Oil Filter',
      quantity: 2,
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    },
  ]);

  const steps = ['Review Order', 'Payment', 'Confirmation'];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentSubmit = async (paymentDetails: any, address: BillingAddress) => {
    setBillingAddress(address);

    // Simulate payment processing
    const mockPaymentResponse: PaymentResponse = {
      id: `pi_${Date.now()}`,
      status: 'completed',
      amount: total,
      currency: 'USD',
      payment_method: selectedPaymentMethod,
      transaction_id: `txn_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setPaymentResponse(mockPaymentResponse);
    setActiveStep(2); // Move to confirmation step
  };

  const handlePaymentComplete = (payment: PaymentResponse) => {
    setPaymentResponse(payment);
    setActiveStep(2);
  };

  const handlePaymentFailed = (error: string) => {
    console.error('Payment failed:', error);
    // Handle payment failure - could show error message or retry options
  };

  const handleContinueShopping = () => {
    navigate('/app/cars');
  };

  const handleViewOrders = () => {
    navigate('/app/orders');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Order Summary
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {cartItems.map((item) => (
                  <Card key={item.id} sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3} sm={2}>
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.name}
                            sx={{
                              width: '100%',
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                            }}
                          />
                        </Grid>
                        <Grid item xs={9} sm={6}>
                          <Typography variant="h6" fontWeight="medium">
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="h6" fontWeight="bold" textAlign="right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Order Total
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2">Shipping:</Typography>
                        <Typography variant="body2">
                          {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2">Tax:</Typography>
                        <Typography variant="body2">${tax.toFixed(2)}</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6" fontWeight="bold">Total:</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          ${total.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onMethodSelect={handlePaymentMethodSelect}
              showSavedMethods={false}
            />

            <Box sx={{ mt: 4 }}>
              <PaymentForm
                paymentMethod={selectedPaymentMethod}
                amount={total}
                currency="USD"
                billingAddress={billingAddress}
                onPaymentSubmit={handlePaymentSubmit}
              />
            </Box>
          </Box>
        );

      case 2:
        return paymentResponse ? (
          <PaymentConfirmation
            payment={paymentResponse}
            orderDetails={{
              orderId: `ORD_${Date.now()}`,
              items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
              totalAmount: total,
            }}
            billingAddress={billingAddress}
            onContinueShopping={handleContinueShopping}
            onViewOrders={handleViewOrders}
          />
        ) : (
          <PaymentProcessing
            paymentId={`pi_${Date.now()}`}
            onPaymentComplete={handlePaymentComplete}
            onPaymentFailed={handlePaymentFailed}
          />
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Payment form will handle the transition to step 2
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Checkout
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete your purchase securely
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent(activeStep)}
            </motion.div>
          </AnimatePresence>

          {activeStep < 2 && (
            <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>

              {activeStep === 0 && (
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={handleNext}
                  size="large"
                >
                  Continue to Payment
                </Button>
              )}
            </Box>
          )}
        </Paper>

        {activeStep === 1 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              🔒 Your payment information is encrypted and secure. We never store your card details.
            </Typography>
          </Alert>
        )}
      </motion.div>
    </Container>
  );
};

export default CheckoutPage;
