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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
// removed unused icon imports (using inline SVGs for brand marks)
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/hooks/useAuth';
import { LoginCredentials } from '../../../core/types';
import Loading from '../../../shared/components/ui/Loading';
import AnimatedBackground from '../../../shared/components/ui/AnimatedBackground';
import { api } from '../../../core/services/api/apiClient';

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
  remember_me: yup.boolean().optional(),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onRegister,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { login, isLoading, error, clearAuthError } = useAuth();
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpSubmitted, setFpSubmitted] = useState(false);
  const [fpError, setFpError] = useState<string | null>(null);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpOptions, setFpOptions] = useState<Array<{ method: string; name: string; description: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema) as any,
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
    },
  });

  // Forgot password modal form
  const fpSchema = yup.object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
  });
  type FpForm = yup.InferType<typeof fpSchema>;
  const {
    register: fpRegister,
    handleSubmit: fpHandleSubmit,
    formState: { errors: fpErrors, isValid: fpIsValid },
    reset: fpReset,
    getValues: fpGetValues,
  } = useForm<FpForm>({
    resolver: yupResolver(fpSchema) as any,
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearAuthError();
    const loginData: LoginCredentials = {
      email: data.email,
      password: data.password,
      remember_me: data.remember_me ?? false,
    };
    
    try {
      console.log('Attempting login with:', { email: data.email, hasPassword: !!data.password });
      const result = await login(loginData);
      
      if (result.success) {
        console.log('Login successful!');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      // Show specific error messages
      if (error.response?.status === 403) {
        console.error('Account is disabled. Please contact support.');
      } else if (error.response?.status === 401) {
        console.error('Invalid email or password.');
      }
      // Error is already handled by useAuth hook and will be displayed in UI
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const openForgot = () => {
    setForgotOpen(true);
    setFpSubmitted(false);
    setFpError(null);
    setFpOptions([]);
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setFpSubmitted(false);
    setFpError(null);
    setFpOptions([]);
    fpReset();
  };

  const onForgotSubmit = async ({ email }: FpForm) => {
    setFpError(null);
    setFpLoading(true);
    try {
      const resp = await api.get(`/password-reset/options/${encodeURIComponent(email)}`);
      const options = resp?.data?.data?.options || [];
      setFpOptions(options);
      setFpSubmitted(true);
    } catch (e: any) {
      setFpError(e?.response?.data?.error || 'Failed to fetch reset options');
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <>
      <AnimatedBackground isDarkMode={isDarkMode} />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          padding: { xs: 2, sm: 3 },
          boxSizing: 'border-box',
        }}
      >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
      {/* Enhanced Floating Background Elements */}
      {[...Array(12)].map((_, i) => {
        const size = 40 + (i * 7) % 40;
        const opacity1 = 0.05 + (i * 0.01) % 0.1;
        const opacity2 = 0.03 + (i * 0.005) % 0.05;
        const top = (i * 7) % 100;
        const left = (i * 11) % 100;
        
        return (
          <motion.div
            key={`floating-${i}-${isDarkMode}`}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              background: isDarkMode 
                ? `linear-gradient(45deg, rgba(102, 126, 234, ${opacity1}), rgba(118, 75, 162, ${opacity2}))`
                : `linear-gradient(45deg, rgba(59, 130, 246, ${opacity1 * 0.7}), rgba(147, 51, 234, ${opacity2 * 0.7}))`,
              borderRadius: '50%',
              top: `${top}%`,
              left: `${left}%`,
              pointerEvents: 'none',
              zIndex: 0,
              filter: 'blur(1px)',
            }}
          initial={{ 
            opacity: 0, 
            scale: 0,
            rotate: 0 
          }}
          animate={{
            opacity: [0, 0.6, 0.3, 0.6, 0],
            y: [0, -30, -15, -40, 0],
            x: [0, 15, -10, 20, 0],
            scale: [0, 1.2, 0.8, 1.1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
          );
        })}
      
      {/* Additional Glowing Orbs */}
      {[...Array(6)].map((_, i) => {
        const size = 80 + (i * 15) % 40;
        const opacity = 0.02 + (i * 0.015) % 0.08;
        const top = (i * 17) % 100;
        const left = (i * 23) % 100;
        
        return (
          <motion.div
            key={`orb-${i}-${isDarkMode}`}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              background: isDarkMode 
                ? `radial-gradient(circle, rgba(102, 126, 234, ${opacity}) 0%, transparent 70%)`
                : `radial-gradient(circle, rgba(59, 130, 246, ${opacity * 0.8}) 0%, transparent 70%)`,
              borderRadius: '50%',
              top: `${top}%`,
              left: `${left}%`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          initial={{ 
            opacity: 0, 
            scale: 0 
          }}
          animate={{
            opacity: [0, 0.4, 0.2, 0.4, 0],
            scale: [0, 1.5, 0.8, 1.2, 0],
          }}
          transition={{
            duration: 12 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
        );
      })}

        <Card
          elevation={isDarkMode ? 8 : 4}
          sx={{
            width: '100%',
            maxWidth: '500px',
            height: 'auto',
            minHeight: 'auto',
            maxHeight: '95vh',
            borderRadius: 3,
            background: isDarkMode 
              ? 'linear-gradient(145deg, #374151 0%, #1f2937 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            border: isDarkMode 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.1)',
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            margin: 'auto',
            boxShadow: isDarkMode 
              ? '0 25px 50px rgba(0, 0, 0, 0.3)'
              : '0 25px 50px rgba(0, 0, 0, 0.1)',
          }}
        component={motion.div}
        initial={{ 
          scale: 0.8, 
          opacity: 0, 
          y: 50,
          rotateX: -15 
        }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          y: 0,
          rotateX: 0 
        }}
        transition={{ 
          duration: 0.8, 
          type: "spring", 
          stiffness: 80,
          damping: 15,
          delay: 0.3 
        }}
        whileHover={{ 
          scale: 1.005,
          y: -5,
          boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
          transition: { duration: 0.3 }
        }}
      >
        <CardContent 
          sx={{ 
            p: { xs: 3, sm: 4, md: 5, lg: 6, xl: 7 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {/* Theme Switcher */}
          <Box
            sx={{ position: 'absolute', top: { xs: 22, sm: 22, md: 50, lg: 50, xl: 50 }, right: 16, zIndex: 20 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
            <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} arrow>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    width: { xs: 40, sm: 45 },
                    height: { xs: 40, sm: 45 },
                    borderRadius: '50%',
                    background: 'transparent',
                    color: isDarkMode ? '#ffffff' : '#667eea',
                    boxShadow: 'none',
                    border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(102, 126, 234, 0.2)'}`,
                    '&:hover': {
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                      border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(102, 126, 234, 0.4)'}`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <motion.div
                    animate={{ rotate: isDarkMode ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {isDarkMode ? <LightMode sx={{ fontSize: { xs: 20, sm: 22 } }} /> : <DarkMode sx={{ fontSize: { xs: 20, sm: 22 } }} />}
                  </motion.div>
                </IconButton>
              </motion.div>
            </Tooltip>
            </motion.div>
          </Box>
          {/* Header */}
          <Box textAlign="center" mb={{ xs: 1, sm: 2 }}>
            <motion.div
              initial={{ 
                scale: 0, 
                rotate: -180,
                opacity: 0 
              }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                opacity: 1 
              }}
              transition={{ 
                delay: 0.5, 
                type: 'spring', 
                stiffness: 200,
                damping: 12 
              }}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.2 }
              }}
            >
              <Box
                sx={{
                  width: { xs: 50, sm: 60 },
                  height: { xs: 50, sm: 60 },
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: { xs: 1, sm: 1 },
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -2,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    zIndex: -1,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 0.3,
                  }
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <LoginIcon sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
                </motion.div>
              </Box>
            </motion.div>
            
            <motion.div
              initial={{ 
                opacity: 0, 
                y: 20,
                scale: 0.9 
              }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: 1 
              }}
              transition={{ 
                delay: 0.7, 
                duration: 0.6,
                type: "spring",
                stiffness: 100 
              }}
            >
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight="bold" 
                color={isDarkMode ? "white" : "primary"}
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                  background: isDarkMode 
                    ? 'linear-gradient(45deg, #ffffff, #e0e0e0)' 
                    : 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: isDarkMode ? '0 0 20px rgba(255,255,255,0.3)' : 'none',
                }}
              >
                Welcome Back
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ 
                opacity: 0, 
                y: 15,
                scale: 0.95 
              }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: 1 
              }}
              transition={{ 
                delay: 0.9, 
                duration: 0.5,
                type: "spring",
                stiffness: 120 
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isDarkMode ? '#d1d5db' : 'text.secondary',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }}
                mt={0.5}
              >
                Sign in to your account to continue
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
            <Stack spacing={{ xs: 2, sm: 2.5 }}>
              {/* Email Field */}
              <motion.div
                initial={{ 
                  opacity: 0, 
                  x: -50, 
                  scale: 0.8,
                  rotateY: -15 
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  rotateY: 0 
                }}
                transition={{ 
                  delay: 1.1,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 120,
                  damping: 12
                }}
                whileHover={{ 
                  scale: 1.02,
                  x: 5,
                  transition: { duration: 0.2 }
                }}
                whileFocus={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
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
                        <motion.div
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Email sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                        </motion.div>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      color: isDarkMode ? '#ffffff' : 'inherit',
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
                      },
                      '& input': {
                        color: isDarkMode ? '#ffffff' : 'inherit',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: isDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.6)',
                      fontSize: '1rem',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                      '&.MuiInputLabel-shrink': {
                        color: 'primary.main',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: isDarkMode ? '#9ca3af' : 'inherit',
                    },
                  }}
                />
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ 
                  opacity: 0, 
                  x: -50, 
                  scale: 0.8,
                  rotateY: -15 
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  rotateY: 0 
                }}
                transition={{ 
                  delay: 1.3,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 120,
                  damping: 12
                }}
                whileHover={{ 
                  scale: 1.02,
                  x: 5,
                  transition: { duration: 0.2 }
                }}
                whileFocus={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
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
                        <motion.div
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                          }}
                        >
                          <Lock sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                        </motion.div>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            size="small"
                            sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </motion.div>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      color: isDarkMode ? '#ffffff' : 'inherit',
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
                      },
                      '& input': {
                        color: isDarkMode ? '#ffffff' : 'inherit',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: isDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.6)',
                      fontSize: '1rem',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                      '&.MuiInputLabel-shrink': {
                        color: 'primary.main',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: isDarkMode ? '#9ca3af' : 'inherit',
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Checkbox {...register('remember_me')} />}
                    label="Remember me"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        color: isDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.6)',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                  <Link
                    component="button"
                    type="button"
                    onClick={openForgot}
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: isDarkMode ? '#667eea' : '#2563eb',
                      textDecoration: 'none',
                      '&:hover': {
                        color: isDarkMode ? '#8b5cf6' : '#1d4ed8',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>
              </motion.div>
              
              {/* Forgot Password Modal */}
              <Dialog open={forgotOpen} onClose={closeForgot} fullWidth maxWidth="sm">
                <DialogTitle>Forgot Password</DialogTitle>
                <DialogContent>
                  {fpError && (
                    <Alert severity="error" sx={{ mb: 2 }}>{fpError}</Alert>
                  )}
                  <Box component="form" onSubmit={fpHandleSubmit(onForgotSubmit)}>
                    <Stack spacing={2}>
                      <TextField
                        {...fpRegister('email')}
                        label="Email address"
                        fullWidth
                        error={!!fpErrors.email}
                        helperText={fpErrors.email?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button type="submit" variant="contained" disabled={!fpIsValid || fpLoading}>
                        {fpLoading ? 'Checking…' : 'Check reset options'}
                      </Button>
                    </Stack>
                  </Box>
                  {fpSubmitted && fpOptions.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="success" sx={{ mb: 2 }}>Select a reset method:</Alert>
                      <Stack spacing={1.5}>
                        {fpOptions.map((opt) => (
                          <Box key={opt.method} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight={700}>{opt.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{opt.description}</Typography>
                            <Stack direction="row" gap={1}>
                              {opt.method === 'email' && (
                                <Button
                                  variant="contained"
                                  onClick={async () => {
                                    try {
                                      const email = fpGetValues('email');
                                      await api.post('/auth/forgot-password', { email });
                                      closeForgot();
                                      alert('If an account exists, a reset email has been sent.');
                                    } catch (e: any) {
                                      alert(e?.response?.data?.error || 'Failed to send email reset link');
                                    }
                                  }}
                                >
                                  Send email reset link
                                </Button>
                              )}
                              {opt.method === 'security_questions' && (
                                <Button
                                  variant="outlined"
                                  href={`/auth/security-questions`}
                                >
                                  Answer security questions
                                </Button>
                              )}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={closeForgot}>Close</Button>
                </DialogActions>
              </Dialog>

              {/* Enhanced Login Button */}
              <motion.div
                initial={{ 
                  opacity: 0, 
                  y: 50, 
                  scale: 0.8,
                  rotateX: 15 
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  rotateX: 0 
                }}
                transition={{ 
                  delay: 1.5,
                  duration: 0.7,
                  type: "spring",
                  stiffness: 100,
                  damping: 12
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 15px 35px rgba(102, 126, 234, 0.4)",
                  transition: { duration: 0.3 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={!isValid || isLoading}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white !important',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                      color: 'white !important',
                    },
                    '& .MuiButton-root': {
                      color: 'white !important',
                    },
                    '& span': {
                      color: 'white !important',
                    },
                  }}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loading size="small" color="white" />
                    </motion.div>
                  ) : (
                    <motion.span
                      style={{ color: 'white' }}
                      animate={{ 
                        textShadow: [
                          "0 0 0px rgba(255,255,255,0)",
                          "0 0 8px rgba(255,255,255,0.4)",
                          "0 0 0px rgba(255,255,255,0)"
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Sign In
                    </motion.span>
                  )}
                </Button>
              </motion.div>

              {/* OAuth Providers */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
                  <Tooltip title="Continue with Google" arrow>
                    <IconButton
                      aria-label="Continue with Google"
                      onClick={() => window.location.href = '/api/auth/oauth/google'}
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      {/* Official Google G logo */}
                      <svg width="20" height="20" viewBox="0 0 533.5 544.3" aria-hidden="true">
                        <path fill="#EA4335" d="M533.5 278.4c0-18.6-1.6-37-4.8-54.9H272v103.9h147.4c-6.4 34.6-25.9 64-55.3 83.6v69.4h89.4c52.3-48.1 80-119.1 80-202z"/>
                        <path fill="#34A853" d="M272 544.3c72.9 0 134.2-24.1 178.9-65.4l-89.4-69.4c-24.8 16.7-56.6 26.5-89.5 26.5-68.6 0-126.7-46.3-147.4-108.5H31.5v68.5C75.9 486.2 168.6 544.3 272 544.3z"/>
                        <path fill="#4285F4" d="M124.6 327.5c-9.5-28.6-9.5-59.3 0-87.9V171H31.5c-40.5 80.9-40.5 176.5 0 257.4l93.1-100.9z"/>
                        <path fill="#FBBC05" d="M272 106.7c37.7-.6 74 13.8 101.7 40.6l75.8-75.8C403.2 24.6 340.9 0 272 0 168.6 0 75.9 58.1 31.5 171l93.1 68.6C145.3 153 203.4 106.7 272 106.7z"/>
                      </svg>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Continue with GitHub" arrow>
                    <IconButton
                      aria-label="Continue with GitHub"
                      onClick={() => window.location.href = '/api/auth/oauth/github'}
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      {/* Official GitHub mark */}
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.33-.27 2.01-.27.68 0 1.37.09 2.01.27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Continue with Facebook" arrow>
                    <IconButton
                      aria-label="Continue with Facebook"
                      onClick={() => window.location.href = '/api/auth/oauth/facebook'}
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      {/* Official Facebook f */}
                      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#1877F2" d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.092 10.125 24v-8.437H7.078V12.07h3.047V9.412c0-3 1.792-4.657 4.533-4.657 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.953.929-1.953 1.887v2.238h3.328l-.532 3.492h-2.796V24C19.612 23.092 24 18.1 24 12.073z"/>
                      </svg>
                    </IconButton>
                  </Tooltip>
                </Box>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Divider sx={{ my: { xs: 1, sm: 1.5 } }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                      fontSize: '0.875rem',
                    }}
                  >
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
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isDarkMode ? '#d1d5db' : '#6b7280',
                      fontSize: '0.875rem',
                    }}
                  >
                    Don't have an account?{' '}
                    <Link
                      component="button"
                      type="button"
                      onClick={onRegister}
                      sx={{
                        fontWeight: 600,
                        color: isDarkMode ? '#667eea' : '#2563eb',
                        textDecoration: 'none',
                        '&:hover': {
                          color: isDarkMode ? '#8b5cf6' : '#1d4ed8',
                          textDecoration: 'underline',
                        },
                      }}
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
    </Box>
    </>
  );
};

export default LoginForm;