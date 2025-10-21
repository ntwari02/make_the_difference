import React from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { RootState } from '../../../core/store';
import { registerUser, clearAuth } from '../../../core/store/auth/authSlice';
import { redirectToDashboard } from '../../../core/utils/roleRedirect';
import {
  Box, Paper, Typography, TextField, InputAdornment, IconButton, Button, Stack, MenuItem, Alert
} from '@mui/material';
import { Email as EmailIcon, Visibility, VisibilityOff, Lock as LockIcon, Person as PersonIcon, WorkspacePremium as RoleIcon, Phone as PhoneIcon } from '@mui/icons-material';

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useSelector((s: RootState) => s.auth);

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState('student');
  const [touched, setTouched] = React.useState<{ email?: boolean; password?: boolean; confirm?: boolean; first?: boolean; last?: boolean; role?: boolean; phone?: boolean }>({});
  const [phone, setPhone] = React.useState('');
  const [step, setStep] = React.useState<1 | 2>(1);

  // Clear any stale auth data on mount and handle successful registration
  React.useEffect(() => {
    // First, aggressively clear any stale authentication data
    console.log('🧹 RegisterPage: Clearing any stale authentication data on mount');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user');
    localStorage.removeItem('last_login');
    sessionStorage.clear();
    dispatch(clearAuth());
    
    // Only redirect if user is truly authenticated (after successful registration)
    if (isAuthenticated && user) {
      console.log('✅ Registration successful, redirecting to dashboard');
      redirectToDashboard(user, navigate);
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  const emailError = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email' : '';
  const passwordErrors: string[] = [];
  if (password && password.length < 8) passwordErrors.push('8+ chars');
  if (password && !/[A-Z]/.test(password)) passwordErrors.push('1 uppercase');
  if (password && !/[0-9]/.test(password)) passwordErrors.push('1 number');
  const passwordError = passwordErrors.join(', ');
  const confirmError = confirmPassword && confirmPassword !== password ? 'Passwords do not match' : '';
  const firstError = firstName === '' && touched.first ? 'First name required' : '';
  const lastError = lastName === '' && touched.last ? 'Last name required' : '';
  const roleError = role === '' && touched.role ? 'Role required' : '';
  // Phone is optional, but validate format if provided
  const phoneRegex = /^[\+]?\d[\d]{0,15}$/;
  const phoneError = phone && !phoneRegex.test(phone) ? 'Enter a valid phone' : '';
  const step1Valid = !!firstName && !!lastName && !!email && !emailError && !!password && !passwordError && !!confirmPassword && !confirmError;
  const step2Valid = !!role && !phoneError;
  const isValid = step1Valid && step2Valid;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!step1Valid) return;
      setStep(2);
      return;
    }
    if (!isValid) return;
    
    const payload: any = { email, password, first_name: firstName, last_name: lastName, phone, role };
    
    const action = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(action)) {
      // Redirect to login page with success message
      navigate('/login?registered=true');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'linear-gradient(135deg, #0f172a 0%, #111827 50%, #0b1220 100%)' }}>
      <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 40% at 50% 0%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(40% 30% at 80% 20%, rgba(99,102,241,0.12), transparent 60%)' }} />
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 520, p: 4, borderRadius: 3, backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.06)', position: 'relative' }}>
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 3, display: 'grid', placeItems: 'center', mx: 'auto', mb: 1.5, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff', fontSize: 26, boxShadow: '0 10px 30px rgba(59,130,246,0.35)' }}>＋</Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>Create your account</Typography>
            <Typography variant="body2" color="text.secondary">Join to bring your words, data, and teams together. For free</Typography>
          </Box>

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2.25}>
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box sx={{ transition: 'transform .2s ease, box-shadow .2s ease', '&:focus-within': { transform: 'translateY(-1px)', boxShadow: '0 8px 22px rgba(99,102,241,0.18)' } }}>
                      <TextField value={firstName} onChange={(e) => setFirstName(e.target.value)} onBlur={() => setTouched(v => ({ ...v, first: true }))} label="First name" error={!!firstError} helperText={firstError || ' '} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment>) }} />
                    </Box>
                    <Box sx={{ transition: 'transform .2s ease, box-shadow .2s ease', '&:focus-within': { transform: 'translateY(-1px)', boxShadow: '0 8px 22px rgba(99,102,241,0.18)' } }}>
                      <TextField value={lastName} onChange={(e) => setLastName(e.target.value)} onBlur={() => setTouched(v => ({ ...v, last: true }))} label="Last name" error={!!lastError} helperText={lastError || ' '} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment>) }} />
                    </Box>
                  </Stack>
                  <Box sx={{ transition: 'transform .2s ease, box-shadow .2s ease', '&:focus-within': { transform: 'translateY(-1px)', boxShadow: '0 8px 22px rgba(99,102,241,0.18)' } }}>
                    <TextField value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(v => ({ ...v, email: true }))} type="email" label="Email" error={!!emailError && touched.email} helperText={touched.email ? emailError : ' '} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment>) }} />
                  </Box>
                  <Box sx={{ transition: 'transform .2s ease, box-shadow .2s ease', '&:focus-within': { transform: 'translateY(-1px)', boxShadow: '0 8px 22px rgba(16,185,129,0.15)' } }}>
                    <TextField value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched(v => ({ ...v, password: true }))} type={showPassword ? 'text' : 'password'} label="Password" error={!!passwordError && touched.password} helperText={touched.password ? `Password must have: ${passwordError}` : ' '} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(v => !v)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                  </Box>
                  <Box sx={{ transition: 'transform .2s ease, box-shadow .2s ease', '&:focus-within': { transform: 'translateY(-1px)', boxShadow: '0 8px 22px rgba(16,185,129,0.15)' } }}>
                    <TextField value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onBlur={() => setTouched(v => ({ ...v, confirm: true }))} type={showPassword ? 'text' : 'password'} label="Confirm password" error={!!confirmError && touched.confirm} helperText={touched.confirm ? confirmError : ' '} fullWidth />
                  </Box>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button type="submit" variant="contained" disabled={isLoading || !step1Valid} sx={{ bgcolor: step1Valid ? '#0b1220' : '#334155', color: '#fff', px: 4, py: 1.25, textTransform: 'none', fontWeight: 800, borderRadius: 2, '&.Mui-disabled': { color: '#fff !important' } }}>Next</Button>
                    </motion.div>
                  </Stack>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
                  <TextField select value={role} onChange={(e) => setRole(e.target.value)} onBlur={() => setTouched(v => ({ ...v, role: true }))} label="Role" error={!!roleError} helperText={roleError || ' '} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><RoleIcon fontSize="small" /></InputAdornment>) }}>
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="instructor">Instructor</MenuItem>
                    <MenuItem value="buyer">Buyer</MenuItem>
                    <MenuItem value="dealer">Dealer</MenuItem>
                    <MenuItem value="seller">Seller</MenuItem>
                    <MenuItem value="university">University</MenuItem>
                    <MenuItem value="visa_officer">Visa Officer</MenuItem>
                  </TextField>
                  <TextField value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => setTouched(v => ({ ...v, phone: true }))} label="Phone (optional)" error={!!phoneError && touched.phone} helperText={touched.phone ? (phoneError || ' ') : ' '} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment>) }} />
                  <Stack direction="row" spacing={2} justifyContent="space-between">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button type="button" variant="outlined" onClick={() => setStep(1)} sx={{ px: 4, py: 1, borderRadius: 2 }}>Back</Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button type="submit" variant="contained" disabled={isLoading || !isValid} sx={{ bgcolor: isValid ? '#0b1220' : '#334155', color: '#fff', px: 4, py: 1.25, textTransform: 'none', fontWeight: 800, borderRadius: 2, '&:hover': { bgcolor: '#0f172a' }, '&.Mui-disabled': { color: '#fff !important' } }}>{isLoading ? 'Creating...' : 'Create account'}</Button>
                    </motion.div>
                  </Stack>
                </motion.div>
              )}

              {error && <Typography variant="body2" color="error">{error}</Typography>}
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account? <Button component={Link} to="/login">Sign in</Button>
          </Typography>
        </Stack>
      </Paper>
      </motion.div>
    </Box>
  );
};

export default RegisterPage;


