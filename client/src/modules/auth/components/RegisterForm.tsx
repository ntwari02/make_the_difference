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
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  PersonAdd as RegisterIcon,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../../core/hooks/useAuth';
import { RegisterCredentials } from '../../../core/types';
import Loading from '../../../shared/components/ui/Loading';
import AnimatedBackground from '../../../shared/components/ui/AnimatedBackground';

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
    .matches(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .nullable()
    .optional(),
  role: yup
    .string()
    .oneOf(['student', 'instructor', 'buyer', 'dealer', 'university'], 'Please select a valid role')
    .nullable()
    .optional(),
  terms_accepted: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

// Form data type inferred from schema
type RegisterFormData = yup.InferType<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess: _onSuccess,
  onLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { register: registerUser, isLoading, error, clearAuthError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as any,
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirm_password: '',
      first_name: '',
      last_name: '',
      phone: undefined,
      role: undefined,
      terms_accepted: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearAuthError();
    const { confirm_password, terms_accepted, ...registerData } = data;
    
    console.log('Submitting registration:', registerData);
    
    // Transform the data to match RegisterCredentials interface
    const transformedData: RegisterCredentials = {
      email: registerData.email,
      password: registerData.password,
      first_name: registerData.first_name,
      last_name: registerData.last_name,
      phone: registerData.phone ?? undefined,
      role: registerData.role ?? undefined,
    };
    
    try {
      const result = await registerUser(transformedData);
      
      console.log('Registration result:', result);
      
      if (result.success) {
        // Registration successful - show success message and redirect to login
        console.log('✅ Registration successful! User can now login.');
        
        // Show success message (you could add a toast notification here)
        alert('Registration successful! Please login with your credentials.');
        
        // Redirect to login page
        onLogin?.();
        // Call the _onSuccess callback if provided
        _onSuccess?.();
      }
    } catch (error) {
      console.error('Registration failed:', error);
      // Error is already handled by useAuth hook
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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

  const steps = ['Personal Information', 'Account Details', 'Role Selection'];

  const renderStepContent = (step: number) => {
    switch (step) {
        case 0:
          return (
             <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ mt: { xs: 1, sm: 2 } }}>
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
                      <Person sx={{ color: isDarkMode ? '#9ca3af' : 'action.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    color: isDarkMode ? '#ffffff' : 'inherit',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
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
                      <Person sx={{ color: isDarkMode ? '#9ca3af' : 'action.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    color: isDarkMode ? '#ffffff' : 'inherit',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
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
                      <Phone sx={{ color: isDarkMode ? '#9ca3af' : 'action.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    color: isDarkMode ? '#ffffff' : 'inherit',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
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
          </Stack>
        );

        case 1:
          return (
             <Stack spacing={{ xs: 1.5, sm: 2 }}>
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
                      <Email sx={{ color: isDarkMode ? '#9ca3af' : 'action.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    color: isDarkMode ? '#ffffff' : 'inherit',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
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
                      <Lock sx={{ color: isDarkMode ? '#9ca3af' : 'action.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                        sx={{ color: isDarkMode ? '#9ca3af' : 'inherit' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    color: isDarkMode ? '#ffffff' : 'inherit',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
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
                      <Lock sx={{ color: isDarkMode ? '#9ca3af' : 'action.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                        size="small"
                        sx={{ color: isDarkMode ? '#9ca3af' : 'inherit' }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    color: isDarkMode ? '#ffffff' : 'inherit',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
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
          </Stack>
        );

        case 2:
          return (
             <Stack spacing={{ xs: 1.5, sm: 2 }}>
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
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    color: isDarkMode ? '#ffffff' : 'inherit',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
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
                  '& .MuiSelect-select': {
                    color: isDarkMode ? '#ffffff' : 'inherit',
                  },
                }}
              >
                <MenuItem value="student">Student - Learn courses and skills</MenuItem>
                <MenuItem value="instructor">Instructor - Teach and create courses</MenuItem>
                <MenuItem value="buyer">Buyer - Purchase cars and services</MenuItem>
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
                  <Typography 
                    variant="body2"
                    sx={{ color: isDarkMode ? '#d1d5db' : 'inherit' }}
                  >
                    I agree to the{' '}
                    <Link 
                      href="/terms" 
                      target="_blank"
                      sx={{ 
                        color: isDarkMode ? '#60a5fa' : 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link 
                      href="/privacy" 
                      target="_blank"
                      sx={{ 
                        color: isDarkMode ? '#60a5fa' : 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
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
                <Typography 
                  variant="caption" 
                  color="error" 
                  sx={{ 
                    ml: 4, 
                    display: 'block',
                    color: isDarkMode ? '#f87171' : 'error.main'
                  }}
                >
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
          maxWidth: '550px',
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
             maxWidth: '550px',
             height: 'auto',
             minHeight: 'auto',
             maxHeight: '95vh',
             borderRadius: 3,
             background: isDarkMode 
               ? 'linear-gradient(145deg, #374151 0%, #1f2937 100%)'
               : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
             border: '1px solid rgba(0, 0, 0, 0.05)',
             position: 'relative',
             zIndex: 10,
             display: 'flex',
             flexDirection: 'column',
             margin: 'auto',
             backdropFilter: 'blur(10px)',
             boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
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
                    {isDarkMode ? <LightMode sx={{ fontSize: { xs: 20, sm: 24 } }} /> : <DarkMode sx={{ fontSize: { xs: 20, sm: 24 } }} />}
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
                   <RegisterIcon sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
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
                 Create Account
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

          {/* Enhanced Stepper */}
          <motion.div
            initial={{ 
              opacity: 0, 
              y: 30,
              scale: 0.9 
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1 
            }}
            transition={{ 
              delay: 1.1, 
              duration: 0.6,
              type: "spring",
              stiffness: 100 
            }}
          >
             <Stepper activeStep={activeStep} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <motion.div
                    initial={{ 
                      scale: 0, 
                      rotate: -90,
                      opacity: 0 
                    }}
                    animate={{ 
                      scale: 1, 
                      rotate: 0,
                      opacity: 1 
                    }}
                    transition={{ 
                      delay: 1.3 + index * 0.15,
                      type: "spring",
                      stiffness: 200,
                      damping: 12
                    }}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          transition: 'all 0.3s ease',
                          color: isDarkMode ? '#d1d5db' : 'inherit',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        },
                        '& .MuiStepLabel-label.Mui-active': {
                          fontWeight: 'bold',
                          color: 'primary.main',
                        },
                        '& .MuiStepLabel-label.Mui-completed': {
                          color: 'success.main',
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </motion.div>
                </Step>
              ))}
            </Stepper>
          </motion.div>

          {/* Registration Form */}
          <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
             <Box sx={{ overflow: 'auto', mb: 1, pt: { xs: 1, sm: 1 } }}>
               {renderStepContent(activeStep)}
             </Box>

            {/* Enhanced Navigation Buttons */}
            <Box display="flex" justifyContent="space-between" mt={{ xs: 1, sm: 2, md: 2 }}>
              <motion.div
                initial={{ 
                  opacity: 0, 
                  x: -30,
                  scale: 0.8 
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: 1 
                }}
                transition={{ 
                  delay: 1.5, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 120 
                }}
                whileHover={{ 
                  scale: 1.05,
                  x: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
              >
                <Button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  Previous
                </Button>
              </motion.div>

              {activeStep < steps.length - 1 ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                      },
                    }}
                    component={motion.div}
                    animate={{
                      background: [
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      ]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Next
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ 
                    opacity: 0, 
                    x: 30,
                    scale: 0.8,
                    y: 20 
                  }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: 1,
                    y: 0 
                  }}
                  transition={{ 
                    delay: 1.7, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 120 
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -3,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    transition: { duration: 0.1 }
                  }}
                >
                  <motion.div
                    animate={{
                      background: [
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
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
                        Create Account
                      </motion.span>
                    )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </Box>

            {/* Divider */}
             <Divider sx={{ my: { xs: 1, sm: 1.5 } }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isDarkMode ? '#9ca3af' : 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                or
              </Typography>
            </Divider>

            {/* Login Link */}
            <Box textAlign="center">
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isDarkMode ? '#d1d5db' : 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Already have an account?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={onLogin}
                  sx={{
                    textDecoration: 'none',
                    fontWeight: 600,
                    color: isDarkMode ? '#60a5fa' : 'primary.main',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
    </Box>
    </>
  );
};

export default RegisterForm;
