import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  CreditCard,
  Lock,
  CheckCircle,
  Error,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  PaymentMethod,
  CreditCardDetails,
  PayPalDetails,
  BankTransferDetails,
  BillingAddress,
  PaymentValidation,
} from '../../../core/types/payment.types';
import PaymentApiService from '../../../core/services/api/paymentApiService';

interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  billingAddress?: BillingAddress;
  onPaymentSubmit: (paymentDetails: any, billingAddress: BillingAddress) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  disabled?: boolean;
  loading?: boolean;
}

interface FormData {
  creditCard?: CreditCardDetails;
  paypal?: PayPalDetails;
  bankTransfer?: BankTransferDetails;
  billingAddress: BillingAddress;
  savePaymentMethod: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentMethod,
  amount,
  currency,
  billingAddress,
  onPaymentSubmit,
  onValidationChange,
  disabled = false,
  loading = false,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>({
    billingAddress: billingAddress || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
    savePaymentMethod: false,
  });

  const [validation, setValidation] = useState<PaymentValidation>({
    is_valid: false,
    errors: [],
  });

  const [showCVV, setShowCVV] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [formData, paymentMethod]);

  const validateForm = async () => {
    const errors: string[] = [];

    // Validate billing address
    if (!formData.billingAddress.first_name.trim()) {
      errors.push('First name is required');
    }
    if (!formData.billingAddress.last_name.trim()) {
      errors.push('Last name is required');
    }
    if (!formData.billingAddress.email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.billingAddress.email)) {
      errors.push('Valid email is required');
    }
    if (!formData.billingAddress.address_line_1.trim()) {
      errors.push('Address is required');
    }
    if (!formData.billingAddress.city.trim()) {
      errors.push('City is required');
    }
    if (!formData.billingAddress.state.trim()) {
      errors.push('State is required');
    }
    if (!formData.billingAddress.postal_code.trim()) {
      errors.push('Postal code is required');
    }

    // Validate payment method specific fields
    if (paymentMethod === 'credit_card') {
      const card = formData.creditCard;
      if (!card?.card_number?.trim()) {
        errors.push('Card number is required');
      } else if (!/^\d{13,19}$/.test(card.card_number.replace(/\s/g, ''))) {
        errors.push('Valid card number is required');
      }
      if (!card?.expiry_month || !card?.expiry_year) {
        errors.push('Card expiry date is required');
      }
      if (!card?.cvv?.trim()) {
        errors.push('CVV is required');
      } else if (!/^\d{3,4}$/.test(card.cvv)) {
        errors.push('Valid CVV is required');
      }
      if (!card?.cardholder_name?.trim()) {
        errors.push('Cardholder name is required');
      }
    }

    if (paymentMethod === 'paypal') {
      if (!formData.paypal?.email?.trim()) {
        errors.push('PayPal email is required');
      } else if (!/\S+@\S+\.\S+/.test(formData.paypal.email)) {
        errors.push('Valid PayPal email is required');
      }
    }

    if (paymentMethod === 'bank_transfer') {
      const bank = formData.bankTransfer;
      if (!bank?.account_holder_name?.trim()) {
        errors.push('Account holder name is required');
      }
      if (!bank?.account_number?.trim()) {
        errors.push('Account number is required');
      }
      if (!bank?.routing_number?.trim()) {
        errors.push('Routing number is required');
      }
      if (!bank?.bank_name?.trim()) {
        errors.push('Bank name is required');
      }
    }

    const isValid = errors.length === 0;
    setValidation({ is_valid: isValid, errors });

    if (onValidationChange) {
      onValidationChange(isValid, errors);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value,
      },
    }));
  };

  const handleCreditCardChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      creditCard: {
        ...prev.creditCard,
        [field]: value,
      } as CreditCardDetails,
    }));
  };

  const handlePayPalChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      paypal: {
        ...prev.paypal,
        [field]: value,
      } as PayPalDetails,
    }));
  };

  const handleBankTransferChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      bankTransfer: {
        ...prev.bankTransfer,
        [field]: value,
      } as BankTransferDetails,
    }));
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits and limit to 19 digits
    const digitsOnly = value.replace(/\D/g, '').substring(0, 19);
    // Add spaces every 4 digits
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    // Remove all non-digits and limit to 4 digits
    const digitsOnly = value.replace(/\D/g, '').substring(0, 4);
    // Add slash after month
    if (digitsOnly.length >= 2) {
      return `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2)}`;
    }
    return digitsOnly;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.is_valid || loading || disabled) {
      return;
    }

    setIsValidating(true);

    try {
      // Validate with API if available
      let paymentDetails: any = {};

      switch (paymentMethod) {
        case 'credit_card':
          paymentDetails = formData.creditCard;
          break;
        case 'paypal':
          paymentDetails = formData.paypal;
          break;
        case 'bank_transfer':
          paymentDetails = formData.bankTransfer;
          break;
      }

      // For development, we'll simulate validation
      await new Promise(resolve => setTimeout(resolve, 1000));

      onPaymentSubmit(paymentDetails, formData.billingAddress);
    } catch (error) {
      console.error('Payment validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const renderCreditCardForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Cardholder Name"
            value={formData.creditCard?.cardholder_name || ''}
            onChange={(e) => handleCreditCardChange('cardholder_name', e.target.value)}
            disabled={disabled}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Card Number"
            value={formData.creditCard?.card_number || ''}
            onChange={(e) => handleCreditCardChange('card_number', formatCardNumber(e.target.value))}
            disabled={disabled}
            variant="outlined"
            placeholder="1234 5678 9012 3456"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCard color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Expiry Date"
            value={formData.creditCard?.expiry_month && formData.creditCard?.expiry_year
              ? `${formData.creditCard.expiry_month.toString().padStart(2, '0')}/${formData.creditCard.expiry_year.toString().slice(-2)}`
              : ''}
            onChange={(e) => {
              const formatted = formatExpiry(e.target.value);
              const parts = formatted.split('/');
              if (parts.length === 2) {
                handleCreditCardChange('expiry_month', parts[0]);
                handleCreditCardChange('expiry_year', `20${parts[1]}`);
              }
            }}
            disabled={disabled}
            variant="outlined"
            placeholder="MM/YY"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="CVV"
            type={showCVV ? 'text' : 'password'}
            value={formData.creditCard?.cvv || ''}
            onChange={(e) => handleCreditCardChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
            disabled={disabled}
            variant="outlined"
            placeholder="123"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowCVV(!showCVV)}
                    edge="end"
                  >
                    {showCVV ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderPayPalForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <TextField
        fullWidth
        label="PayPal Email"
        type="email"
        value={formData.paypal?.email || ''}
        onChange={(e) => handlePayPalChange('email', e.target.value)}
        disabled={disabled}
        variant="outlined"
        placeholder="your@email.com"
      />
    </motion.div>
  );

  const renderBankTransferForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Account Holder Name"
            value={formData.bankTransfer?.account_holder_name || ''}
            onChange={(e) => handleBankTransferChange('account_holder_name', e.target.value)}
            disabled={disabled}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Bank Name"
            value={formData.bankTransfer?.bank_name || ''}
            onChange={(e) => handleBankTransferChange('bank_name', e.target.value)}
            disabled={disabled}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Account Number"
            value={formData.bankTransfer?.account_number || ''}
            onChange={(e) => handleBankTransferChange('account_number', e.target.value.replace(/\D/g, ''))}
            disabled={disabled}
            variant="outlined"
            placeholder="1234567890"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Routing Number"
            value={formData.bankTransfer?.routing_number || ''}
            onChange={(e) => handleBankTransferChange('routing_number', e.target.value.replace(/\D/g, '').substring(0, 9))}
            disabled={disabled}
            variant="outlined"
            placeholder="123456789"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Account Type</InputLabel>
            <Select
              value={formData.bankTransfer?.account_type || 'checking'}
              onChange={(e) => handleBankTransferChange('account_type', e.target.value)}
              disabled={disabled}
              label="Account Type"
            >
              <MenuItem value="checking">Checking</MenuItem>
              <MenuItem value="savings">Savings</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderPaymentMethodForm = () => {
    switch (paymentMethod) {
      case 'credit_card':
      case 'debit_card':
        return renderCreditCardForm();
      case 'paypal':
        return renderPayPalForm();
      case 'bank_transfer':
        return renderBankTransferForm();
      default:
        return renderCreditCardForm();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Billing Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.billingAddress.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                disabled={disabled}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.billingAddress.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                disabled={disabled}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.billingAddress.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={disabled}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.billingAddress.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={disabled}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={formData.billingAddress.address_line_1}
                onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                disabled={disabled}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2 (Optional)"
                value={formData.billingAddress.address_line_2}
                onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                disabled={disabled}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.billingAddress.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={disabled}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.billingAddress.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                disabled={disabled}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.billingAddress.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                disabled={disabled}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.billingAddress.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  disabled={disabled}
                  label="Country"
                >
                  <MenuItem value="US">United States</MenuItem>
                  <MenuItem value="CA">Canada</MenuItem>
                  <MenuItem value="GB">United Kingdom</MenuItem>
                  <MenuItem value="AU">Australia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Payment Details
          </Typography>

          <Box sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
            <Typography variant="body2" color="primary">
              Amount: {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
              }).format(amount)}
            </Typography>
          </Box>

          {renderPaymentMethodForm()}

          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.savePaymentMethod}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    savePaymentMethod: e.target.checked
                  }))}
                  disabled={disabled}
                />
              }
              label="Save this payment method for future purchases"
            />
          </Box>
        </CardContent>
      </Card>

      {validation.errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Please fix the following errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            {validation.errors.map((error, index) => (
              <li key={index}>
                <Typography variant="body2">{error}</Typography>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={!validation.is_valid || loading || disabled || isValidating}
        startIcon={isValidating ? <CircularProgress size={20} /> : <Lock />}
        sx={{
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          textTransform: 'none',
        }}
      >
        {isValidating ? 'Validating Payment...' : `Pay ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        }).format(amount)}`}
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          🔒 Your payment information is secure and encrypted
        </Typography>
      </Box>
    </Box>
  );
};

export default PaymentForm;
