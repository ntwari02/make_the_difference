import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/hooks/useAuth';
import { RegisterCredentials, UserRole } from '../../../core/types';
import Loading from '../../../shared/components/ui/Loading';

// Validation schema
const registerSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  first_name: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  last_name: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  phone: yup
    .string()
    .matches(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  role: yup
    .string()
    .oneOf(['student', 'instructor', 'buyer', 'seller', 'dealer', 'university'], 'Please select a valid role')
    .required('Please select your role'),
  terms_accepted: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

interface RegisterFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const { register: registerUser, isLoading, error, clearAuthError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegisterCredentials & { confirm_password: string; terms_accepted: boolean }>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterCredentials & { confirm_password: string; terms_accepted: boolean }) => {
    clearAuthError();
    const { confirm_password, terms_accepted, ...registerData } = data;
    
    const result = await registerUser(registerData);
    
    if (result.success) {
      onSuccess?.();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const steps = ['Personal Information', 'Account Details', 'Role Selection'];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {/* First Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <TextField
                {...register('first_name')}
                fullWidth
                label="First Name"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </motion.div>

            {/* Last Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TextField
                {...register('last_name')}
                fullWidth
                label="Last Name"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TextField
                {...register('phone')}
                fullWidth
                label="Phone Number (Optional)"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </motion.div>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <TextField
                {...register('email')}
                fullWidth
                label="Email Address"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TextField
                {...register('password')}
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TextField
                {...register('confirm_password')}
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                error={!!errors.confirm_password}
                helperText={errors.confirm_password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </motion.div>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {/* Role Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <TextField
                {...register('role')}
                fullWidth
                select
                label="Select Your Role"
                error={!!errors.role}
                helperText={errors.role?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              >
                <MenuItem value="student">Student - Learn courses and skills</MenuItem>
                <MenuItem value="instructor">Instructor - Teach and create courses</MenuItem>
                <MenuItem value="buyer">Buyer - Purchase cars and services</MenuItem>
                <MenuItem value="seller">Seller - Sell cars and services</MenuItem>
                <MenuItem value="dealer">Dealer - Professional car dealership</MenuItem>
                <MenuItem value="university">University - Educational institution</MenuItem>
              </TextField>
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FormControlLabel
                control={<Checkbox {...register('terms_accepted')} />}
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" target="_blank">
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ 
                  alignItems: 'flex-start',
                  '& .MuiFormControlLabel-label': { 
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                  } 
                }}
              />
              {errors.terms_accepted && (
                <Typography variant="caption" color="error" sx={{ ml: 4, display: 'block' }}>
                  {errors.terms_accepted.message}
                </Typography>
              )}
            </motion.div>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        elevation={8}
        sx={{
          maxWidth: 500,
          mx: 'auto',
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <RegisterIcon sx={{ color: 'white', fontSize: 30 }} />
              </Box>
            </motion.div>
            
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Join our platform and start your journey
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error" sx={{ mb: 2 }} onClose={clearAuthError}>
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Stepper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </motion.div>

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Previous
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                  variant="contained"
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isLoading}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                  }}
                >
                  {isLoading ? (
                    <Loading size="small" color="white" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              )}
            </Box>

            {/* Divider */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            {/* Login Link */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={onLogin}
                  sx={{
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RegisterForm;
