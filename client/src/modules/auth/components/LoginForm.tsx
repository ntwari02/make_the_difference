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
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/hooks/useAuth';
import { LoginCredentials } from '../../../core/types';
import Loading from '../../../shared/components/ui/Loading';
import AnimatedBackground from '../../../shared/components/ui/AnimatedBackground';

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
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
  onRegister,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { login, isLoading, error, clearAuthError } = useAuth();

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

  const onSubmit = async (data: LoginFormData) => {
    clearAuthError();
    const loginData: LoginCredentials = {
      email: data.email,
      password: data.password,
      remember_me: data.remember_me ?? false,
    };
    const result = await login(loginData);
    
    if (result.success) {
      onSuccess?.();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Update CSS variables for theme switching
    const root = document.documentElement;
    if (!isDarkMode) {
      // Dark mode
      root.style.setProperty('--bg-primary', '#0f0f23');
      root.style.setProperty('--bg-secondary', '#1a1a2e');
      root.style.setProperty('--bg-tertiary', '#16213e');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#e0e0e0');
      root.style.setProperty('--text-muted', '#a0a0a0');
    } else {
      // Light mode
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8f9fa');
      root.style.setProperty('--bg-tertiary', '#e9ecef');
      root.style.setProperty('--text-primary', '#212529');
      root.style.setProperty('--text-secondary', '#495057');
      root.style.setProperty('--text-muted', '#6c757d');
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
          background: isDarkMode 
            ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)'
            : '#f5f5f5',
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
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 80 + 40,
            height: Math.random() * 80 + 40,
            background: `linear-gradient(45deg, rgba(102, 126, 234, ${Math.random() * 0.15 + 0.05}), rgba(118, 75, 162, ${Math.random() * 0.1 + 0.03}))`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
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
            delay: Math.random() * 5,
          }}
        />
      ))}
      
      {/* Additional Glowing Orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          style={{
            position: 'absolute',
            width: Math.random() * 120 + 80,
            height: Math.random() * 120 + 80,
            background: `radial-gradient(circle, rgba(102, 126, 234, ${Math.random() * 0.1 + 0.02}) 0%, transparent 70%)`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
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
            delay: Math.random() * 8,
          }}
        />
      ))}

      <Card
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: '500px',
          height: 'auto',
          minHeight: 'auto',
          maxHeight: '95vh',
          borderRadius: 3,
          background: isDarkMode 
            ? 'linear-gradient(145deg, #374151 0%, #1f2937 100%)'
            : '#ffffff',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
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
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
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
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
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
                    onClick={onForgotPassword}
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