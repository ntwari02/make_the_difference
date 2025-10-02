import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  LinearProgress,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Button,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  CreditCard,
  Schedule,
  Payment,
  Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentStatus, PaymentResponse } from '../../../core/types/payment.types';

interface PaymentProcessingProps {
  paymentId: string;
  onPaymentComplete: (payment: PaymentResponse) => void;
  onPaymentFailed: (error: string) => void;
  onRetry?: () => void;
  autoCheck?: boolean;
  checkInterval?: number;
}

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration?: number;
}

const PaymentProcessing: React.FC<PaymentProcessingProps> = ({
  paymentId,
  onPaymentComplete,
  onPaymentFailed,
  onRetry,
  autoCheck = true,
  checkInterval = 2000,
}) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const processingSteps: ProcessingStep[] = [
    {
      id: 'validating',
      label: 'Validating payment details',
      status: 'pending',
      duration: 1500,
    },
    {
      id: 'processing',
      label: 'Processing payment',
      status: 'pending',
      duration: 3000,
    },
    {
      id: 'confirming',
      label: 'Confirming transaction',
      status: 'pending',
      duration: 2000,
    },
    {
      id: 'completing',
      label: 'Completing payment',
      status: 'pending',
      duration: 1000,
    },
  ];

  useEffect(() => {
    if (autoCheck && paymentStatus === 'pending') {
      startProcessing();
    }
  }, [autoCheck, paymentStatus]);

  const startProcessing = async () => {
    setPaymentStatus('processing');
    setError(null);

    // Simulate processing steps
    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);

      // Update step status
      processingSteps[i].status = 'processing';

      // Wait for step duration
      await new Promise(resolve =>
        setTimeout(resolve, processingSteps[i].duration || 2000)
      );

      processingSteps[i].status = 'completed';
    }

    // Simulate payment completion
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        setPaymentStatus('completed');
        const mockPayment: PaymentResponse = {
          id: paymentId,
          status: 'completed',
          amount: 100,
          currency: 'USD',
          payment_method: 'credit_card',
          transaction_id: `txn_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        onPaymentComplete(mockPayment);
      } else {
        setPaymentStatus('failed');
        setError('Payment was declined by the bank. Please try a different payment method.');
        onPaymentFailed('Payment declined');
      }
    }, 1000);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setCurrentStep(0);
    setPaymentStatus('pending');
    setError(null);
    processingSteps.forEach(step => {
      step.status = 'pending';
    });
    if (onRetry) {
      onRetry();
    } else {
      startProcessing();
    }
  };

  const getStepIcon = (step: ProcessingStep, index: number) => {
    if (index < currentStep) {
      return <CheckCircle sx={{ color: theme.palette.success.main }} />;
    } else if (index === currentStep && paymentStatus === 'processing') {
      return <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />;
    } else if (paymentStatus === 'failed' && index === currentStep) {
      return <Error sx={{ color: theme.palette.error.main }} />;
    } else {
      return <Schedule sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const getProgressPercentage = () => {
    if (paymentStatus === 'completed') return 100;
    if (paymentStatus === 'failed') return 0;
    return (currentStep / processingSteps.length) * 100;
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: paymentStatus === 'completed'
                  ? alpha(theme.palette.success.main, 0.1)
                  : paymentStatus === 'failed'
                  ? alpha(theme.palette.error.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.1),
                mx: 'auto',
                mb: 2,
              }}
            >
              {paymentStatus === 'completed' ? (
                <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main }} />
              ) : paymentStatus === 'failed' ? (
                <Error sx={{ fontSize: 40, color: theme.palette.error.main }} />
              ) : (
                <Payment sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              )}
            </Avatar>
          </motion.div>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {paymentStatus === 'completed' && 'Payment Successful!'}
            {paymentStatus === 'failed' && 'Payment Failed'}
            {paymentStatus === 'processing' && 'Processing Payment...'}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {paymentStatus === 'completed' && 'Your payment has been processed successfully.'}
            {paymentStatus === 'failed' && 'We encountered an issue processing your payment.'}
            {paymentStatus === 'processing' && 'Please wait while we process your payment securely.'}
          </Typography>
        </Box>

        {paymentStatus === 'processing' && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={getProgressPercentage()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
              {processingSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    {getStepIcon(step, index)}
                    <Typography
                      variant="body2"
                      sx={{
                        color: index <= currentStep ? 'text.primary' : 'text.secondary',
                        fontWeight: index === currentStep ? 'medium' : 'normal',
                      }}
                    >
                      {step.label}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        )}

        {paymentStatus === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Box textAlign="center">
              <Chip
                label="Payment ID: MOCK123456"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                A confirmation email has been sent to your email address.
              </Typography>
            </Box>
          </motion.div>
        )}

        {paymentStatus === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>

              {retryCount < 3 && (
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={handleRetry}
                  sx={{ mr: 2 }}
                >
                  Try Again
                </Button>
              )}

              <Button variant="outlined">
                Use Different Payment Method
              </Button>
            </Box>
          </motion.div>
        )}

        {paymentStatus === 'pending' && (
          <Box textAlign="center">
            <Button
              variant="contained"
              size="large"
              onClick={startProcessing}
              startIcon={<Payment />}
            >
              Start Payment Processing
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentProcessing;
