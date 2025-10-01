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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/hooks/useAuth';
import { LoginCredentials } from '../../../core/types';
import Loading from '../../../shared/components/ui/Loading';

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  remember_me: yup.boolean(),
});

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
  onRegister,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearAuthError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginCredentials) => {
    clearAuthError();
    const result = await login(data);
    
    if (result.success) {
      onSuccess?.();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card
        elevation={8}
        className="rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-2xl"
      >
        <CardContent className="p-8">
          {/* Header */}
          <Box className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Box className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <LoginIcon className="text-white text-3xl" />
              </Box>
            </motion.div>
            
            <Typography 
              variant="h4" 
              component="h1" 
              className="font-bold text-gray-800 mb-2"
            >
              Welcome Back
            </Typography>
            <Typography 
              variant="body2" 
              className="text-gray-600"
            >
              Sign in to your account to continue
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                severity="error" 
                className="mb-4 rounded-lg"
                onClose={clearAuthError}
              >
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Email Field */}
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
                        <Email className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  className="rounded-xl"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                />
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
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
                        <Lock className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          size="small"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  className="rounded-xl"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                />
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Box className="flex justify-between items-center">
                  <FormControlLabel
                    control={<Checkbox {...register('remember_me')} />}
                    label="Remember me"
                    className="text-sm"
                  />
                  <Link
                    component="button"
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </Box>
              </motion.div>

              {/* Login Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={!isValid || isLoading}
                  className="py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? (
                    <Loading size="small" color="white" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Divider className="my-4">
                  <Typography variant="body2" className="text-gray-500">
                    or
                  </Typography>
                </Divider>
              </motion.div>

              {/* Register Link */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Box className="text-center">
                  <Typography variant="body2" className="text-gray-600">
                    Don't have an account?{' '}
                    <Link
                      component="button"
                      type="button"
                      onClick={onRegister}
                      className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      Sign up here
                    </Link>
                  </Typography>
                </Box>
              </motion.div>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LoginForm;