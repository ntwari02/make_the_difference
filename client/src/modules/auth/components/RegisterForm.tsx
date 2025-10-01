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
import { RegisterCredentials } from '../../../core/types';
import Loading from '../../../shared/components/ui/Loading';

// Simplified validation schema
const registerSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
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
    .optional(),
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
  const { register: registerUser, isLoading, error, clearAuthError } = useAuth();

  type FormData = RegisterCredentials & { confirm_password: string; terms_accepted: boolean };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema) as any,
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    clearAuthError();
    const { confirm_password, terms_accepted, ...registerData } = data;
    
    console.log('Submitting registration:', registerData);
    
    try {
      const result = await registerUser(registerData);
      
      console.log('Registration result:', result);
      
      if (result.success) {
        // Registration successful - show success message and redirect to login
        console.log('✅ Registration successful! User can now login.');
        
        // Show success message (you could add a toast notification here)
        alert('Registration successful! Please login with your credentials.');
        
        // Redirect to login page
        onLogin?.();
      }
    } catch (error) {
      console.error('Registration failed:', error);
      // Error is already handled by the authSlice
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        <Card
          elevation={24}
          sx={{
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Decorative Background Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 120,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              opacity: 0.1,
            }}
          />
          
          <CardContent sx={{ p: 5, position: 'relative', zIndex: 2 }}>
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      opacity: 0.3,
                      filter: 'blur(8px)',
                    }
                  }}
                >
                  <RegisterIcon sx={{ color: 'white', fontSize: 36 }} />
                </Box>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Typography 
                  variant="h3" 
                  component="h1" 
                  fontWeight="700" 
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                  }}
                >
                  Create Account
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#64748b',
                    fontWeight: 400,
                    fontSize: '1rem',
                  }}
                >
                  Join our platform and start your journey
                </Typography>
              </motion.div>
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

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.2)',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#667eea',
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
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.2)',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#667eea',
                      },
                    },
                  }}
                />
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
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
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.2)',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#667eea',
                      },
                    },
                  }}
                />
              </motion.div>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
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
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.2)',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#667eea',
                      },
                    },
                  }}
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
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
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.2)',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#667eea',
                      },
                    },
                  }}
                />
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
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
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.2)',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#667eea',
                      },
                    },
                  }}
                />
              </motion.div>

              {/* Role Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
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
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.2)',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(102, 126, 234, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#667eea',
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
                transition={{ delay: 0.8 }}
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

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!isValid || isLoading}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                  }}
                >
                  {isLoading ? (
                    <Loading size="small" color="white" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </motion.div>
            </Stack>

            {/* Divider */}
            <Box sx={{ position: 'relative', my: 4 }}>
              <Divider 
                sx={{ 
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  '&::before, &::after': {
                    borderColor: 'rgba(102, 126, 234, 0.2)',
                  }
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 2,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                    }}
                  >
                    or
                  </Typography>
                </Box>
              </Divider>
            </Box>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Box 
                textAlign="center"
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 3,
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#64748b',
                    fontWeight: 400,
                    mb: 1,
                  }}
                >
                  Already have an account?
                </Typography>
                <Link
                  component="button"
                  type="button"
                  onClick={onLogin}
                  sx={{
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: '#667eea',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      filter: 'brightness(1.1)',
                    },
                  }}
                >
                  Sign in here →
                </Link>
              </Box>
            </motion.div>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
    </Box>
  );
};

export default RegisterForm;