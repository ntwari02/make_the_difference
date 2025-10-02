import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Avatar,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  Payment as PayPalIcon,
  Smartphone,
  Delete,
  Edit,
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  PaymentMethod,
  PaymentMethodResponse,
  BillingAddress
} from '../../../core/types/payment.types';

interface PaymentMethodSelectorProps {
  selectedMethod?: PaymentMethod;
  savedMethods?: PaymentMethodResponse[];
  onMethodSelect: (method: PaymentMethod) => void;
  onManageMethod?: (methodId: string, action: 'edit' | 'delete') => void;
  showSavedMethods?: boolean;
  disabled?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  savedMethods = [],
  onMethodSelect,
  onManageMethod,
  showSavedMethods = true,
  disabled = false,
}) => {
  const theme = useTheme();
  const [internalSelectedMethod, setInternalSelectedMethod] = useState<PaymentMethod>(
    selectedMethod || 'credit_card'
  );

  useEffect(() => {
    if (selectedMethod) {
      setInternalSelectedMethod(selectedMethod);
    }
  }, [selectedMethod]);

  const handleMethodChange = (method: PaymentMethod) => {
    setInternalSelectedMethod(method);
    onMethodSelect(method);
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard />;
      case 'paypal':
        return <PayPalIcon />;
      case 'apple_pay':
      case 'google_pay':
        return <Smartphone />;
      case 'bank_transfer':
        return <AccountBalance />;
      default:
        return <CreditCard />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      case 'paypal':
        return 'PayPal';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return 'Credit Card';
    }
  };

  const getPaymentMethodColor = (method: PaymentMethod) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return theme.palette.primary.main;
      case 'paypal':
        return '#0070ba';
      case 'apple_pay':
        return '#000000';
      case 'google_pay':
        return '#5cb85c';
      case 'bank_transfer':
        return theme.palette.secondary.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const renderPaymentMethodOption = (method: PaymentMethod) => {
    const isSelected = internalSelectedMethod === method;
    const color = getPaymentMethodColor(method);

    return (
      <motion.div
        key={method}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          sx={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: `2px solid ${isSelected ? color : alpha(theme.palette.divider, 0.3)}`,
            backgroundColor: isSelected ? alpha(color, 0.05) : 'background.paper',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              borderColor: disabled ? alpha(theme.palette.divider, 0.3) : color,
              boxShadow: disabled ? 'none' : `0 4px 12px ${alpha(color, 0.15)}`,
            },
          }}
          onClick={() => !disabled && handleMethodChange(method)}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  bgcolor: alpha(color, 0.1),
                  color: color,
                  width: 48,
                  height: 48,
                }}
              >
                {getPaymentMethodIcon(method)}
              </Avatar>

              <Box flexGrow={1}>
                <Typography variant="h6" fontWeight="bold">
                  {getPaymentMethodLabel(method)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {method === 'credit_card' && 'Pay securely with your credit card'}
                  {method === 'debit_card' && 'Pay with your debit card'}
                  {method === 'paypal' && 'Pay with your PayPal account'}
                  {method === 'apple_pay' && 'Pay with Touch ID or Face ID'}
                  {method === 'google_pay' && 'Pay with your Google account'}
                  {method === 'bank_transfer' && 'Direct bank transfer'}
                </Typography>
              </Box>

              <Radio
                checked={isSelected}
                value={method}
                sx={{
                  color: alpha(color, 0.5),
                  '&.Mui-checked': {
                    color: color,
                  },
                }}
                disabled={disabled}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderSavedPaymentMethod = (method: PaymentMethodResponse) => {
    const isSelected = internalSelectedMethod === method.type;
    const color = getPaymentMethodColor(method.type);

    return (
      <motion.div
        key={method.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card
          sx={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: `2px solid ${isSelected ? color : alpha(theme.palette.divider, 0.3)}`,
            backgroundColor: isSelected ? alpha(color, 0.05) : 'background.paper',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.3s ease-in-out',
            position: 'relative',
          }}
          onClick={() => !disabled && handleMethodChange(method.type)}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  bgcolor: alpha(color, 0.1),
                  color: color,
                  width: 48,
                  height: 48,
                }}
              >
                {getPaymentMethodIcon(method.type)}
              </Avatar>

              <Box flexGrow={1}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Typography variant="h6" fontWeight="bold">
                    {getPaymentMethodLabel(method.type)}
                  </Typography>
                  {method.is_default && (
                    <Chip
                      label="Default"
                      size="small"
                      color="primary"
                      sx={{ height: 20 }}
                    />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {method.type === 'credit_card' && method.card_brand && (
                    <>
                      {method.card_brand.charAt(0).toUpperCase() + method.card_brand.slice(1)} ending in {method.card_last_four}
                    </>
                  )}
                  {method.type === 'paypal' && (
                    <>PayPal account</>
                  )}
                  {method.type === 'bank_transfer' && (
                    <>Bank account ending in {method.card_last_four || '****'}
                  </>
                  )}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {method.billing_details.first_name} {method.billing_details.last_name} • {method.billing_details.city}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Radio
                  checked={isSelected}
                  value={method.type}
                  sx={{
                    color: alpha(color, 0.5),
                    '&.Mui-checked': {
                      color: color,
                    },
                  }}
                  disabled={disabled}
                />

                {onManageMethod && (
                  <Box display="flex" gap={0.5}>
                    <Tooltip title="Edit payment method">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onManageMethod(method.id, 'edit');
                        }}
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete payment method">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onManageMethod(method.id, 'delete');
                        }}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Choose Payment Method
      </Typography>

      <Box sx={{ mb: 3 }}>
        {showSavedMethods && savedMethods.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Saved Payment Methods
            </Typography>
            <Box display="flex" flexDirection="column" gap={2} sx={{ mb: 3 }}>
              {savedMethods.map(renderSavedPaymentMethod)}
            </Box>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Other Payment Methods
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {renderPaymentMethodOption('credit_card')}
          {renderPaymentMethodOption('debit_card')}
          {renderPaymentMethodOption('paypal')}
          {renderPaymentMethodOption('apple_pay')}
          {renderPaymentMethodOption('google_pay')}
          {renderPaymentMethodOption('bank_transfer')}
        </Box>
      </Box>

      {internalSelectedMethod && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(getPaymentMethodColor(internalSelectedMethod), 0.05),
              border: `1px solid ${alpha(getPaymentMethodColor(internalSelectedMethod), 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle sx={{ color: getPaymentMethodColor(internalSelectedMethod) }} />
              <Typography variant="body2" fontWeight="medium">
                Selected: {getPaymentMethodLabel(internalSelectedMethod)}
              </Typography>
            </Box>
          </Box>
        </motion.div>
      )}
    </Box>
  );
};

export default PaymentMethodSelector;
