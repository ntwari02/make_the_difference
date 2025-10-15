import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
// Removed: Dialog-related imports and icons for password reset flows
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { RootState } from '../../../core/store';
import { loginUser, setLoading } from '../../../core/store/auth/authSlice';
import { Box, Paper, Typography, TextField, InputAdornment, IconButton, Button, Stack, FormControlLabel, Checkbox } from '@mui/material';
import { Email as EmailIcon, Visibility, VisibilityOff, Lock as LockIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { oauthLogin } from '../../../core/store/auth/authSlice';
import { redirectToDashboard } from '../../../core/utils/roleRedirect';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, error } = useSelector((s: RootState) => s.auth);
  const nextRef = React.useRef<string | null>(null);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [touched, setTouched] = React.useState<{ email?: boolean; password?: boolean }>({});
  const [retryAttempt, setRetryAttempt] = React.useState(0);
  // Removed inline forgot-password modal and flows

  const emailError = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email' : '';
  const passwordError = password && password.length < 8 ? 'Minimum 8 characters' : '';
  const isValid = !!email && !emailError && !!password && !passwordError;

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      try {
        if (ev.data && ev.data.type === 'oauth_success' && ev.data.data) {
          dispatch(oauthLogin(ev.data.data));
        }
      } catch (_) {}
    }
    
    function onRetryAttempt(ev: CustomEvent) {
      setRetryAttempt(ev.detail.attempt);
    }
    
    window.addEventListener('message', onMessage);
    window.addEventListener('loginRetryAttempt', onRetryAttempt as EventListener);
    
    const params = new URLSearchParams(window.location.search);
    // Capture optional post-login redirect target
    if (!nextRef.current) {
      const next = params.get('next');
      const done = params.get('done');
      if (next) {
        const decoded = decodeURIComponent(next);
        // If we've already completed security questions (done flag), drop next to avoid looping back
        if (done === 'security-questions' && decoded === '/auth/security-questions/setup') {
          params.delete('next');
          const url = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
          window.history.replaceState({}, '', url);
        } else {
          nextRef.current = next;
        }
      }
    }
    const token = params.get('token');
    if (token) {
      fetch('/api/auth/magic/consume', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
        .then(() => {
          // After consume, backend issues tokens via http-only cookies or response; our interceptor will pick up
          // We still rely on redirectToDashboard after isAuthenticated flips
        })
        .finally(() => {
          params.delete('token');
          const url = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
          window.history.replaceState({}, '', url);
        });
    }
    if (isAuthenticated && user) {
      const target = nextRef.current;
      if (target) {
        // Clean the URL to avoid reusing next after navigation
        const p = new URLSearchParams(window.location.search);
        p.delete('next');
        const url = `${window.location.pathname}?${p.toString()}`.replace(/\?$/, '');
        if (window.location.search.includes('next=')) {
          window.history.replaceState({}, '', url);
        }
        nextRef.current = null;
        navigate(target);
      } else {
        redirectToDashboard(user, navigate);
      }
    }
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('loginRetryAttempt', onRetryAttempt as EventListener);
    };
  }, [isAuthenticated, user, navigate, dispatch]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
      // Show immediate loading state
      dispatch(setLoading(true));
      setRetryAttempt(0);
    
    const payload: any = { email, password, remember_me: remember };
    
    // Dispatch login with optimistic UI
    dispatch(loginUser(payload));
  };


  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'linear-gradient(135deg, #0f172a 0%, #111827 50%, #0b1220 100%)' }}>
      <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 40% at 50% 0%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(40% 30% at 80% 20%, rgba(99,102,241,0.12), transparent 60%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Paper elevation={0} sx={{ width: '100%', maxWidth: 440, p: 4, borderRadius: 3, backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.06)', position: 'relative' }}>
        <Stack spacing={3} alignItems="stretch">
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 3, display: 'grid', placeItems: 'center', mx: 'auto', mb: 1.5, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff', fontSize: 26, boxShadow: '0 10px 30px rgba(59,130,246,0.35)' }}>↪</Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>Sign in with email</Typography>
            <Typography variant="body2" color="text.secondary">Make a new doc to bring your words, data, and teams together. For free</Typography>
          </Box>

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2.25}
              component={motion.div}
              initial="hidden"
              animate="show"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                <Box sx={{ transition: 'transform .2s ease, box-shadow .2s ease', '&:focus-within': { transform: 'translateY(-1px)', boxShadow: '0 8px 22px rgba(59,130,246,0.18)' } }}>
                  <TextField value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(v => ({ ...v, email: true }))} type="email" label="Email" error={!!emailError && touched.email} helperText={touched.email ? emailError : ' '} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment>) }} />
                </Box>
              </motion.div>
              <motion.div variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                <Box sx={{ transition: 'transform .2s ease, box-shadow .2s ease', '&:focus-within': { transform: 'translateY(-1px)', boxShadow: '0 8px 22px rgba(16,185,129,0.15)' } }}>
                  <TextField value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched(v => ({ ...v, password: true }))} type={showPassword ? 'text' : 'password'} label="Password" error={!!passwordError && touched.password} helperText={touched.password ? passwordError : ' '} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(v => !v)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                </Box>
              </motion.div>
              <Stack direction="row" alignItems="center" justifyContent="space-between" component={motion.div} variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                <FormControlLabel control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />} label="Remember me" />
              </Stack>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                <Button type="submit" variant="contained" disabled={isLoading || !isValid} fullWidth sx={{ bgcolor: isValid ? '#0b1220' : '#334155', color: '#fff', py: 1.25, textTransform: 'none', fontWeight: 800, letterSpacing: 0.2, borderRadius: 999, boxShadow: '0 8px 20px rgba(0,0,0,0.25)', transition: 'transform 120ms ease', '&:active': { transform: 'translateY(1px)' }, '&:hover': { bgcolor: '#0f172a' }, '&.Mui-disabled': { color: '#fff !important' } }}>
                  {isLoading ? (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {retryAttempt > 0 ? 'Retrying' : 'Signing in'}
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                      >
                        .
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                      >
                        .
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                      >
                        .
                      </motion.span>
                    </motion.span>
                  ) : 'Get Started'}
                </Button>
              </motion.div>
              {error && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                  {error.includes('taking longer than expected') && (
                    <Typography variant="caption" color="text.secondary">
                      🔄 Automatically retrying... Please wait
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          </Box>

          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="caption">Or sign in with</Typography>
            <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 1.25 }}>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outlined" size="small" onClick={async () => {
                try {
                  const resp = await fetch('/api/auth/oauth/google/url');
                  const data = await resp.json();
                  if (data.url) window.open(data.url, 'oauth_google', 'width=480,height=640');
                } catch (_) {}
              }}>Google</Button>
              </motion.div>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outlined" size="small" onClick={async () => {
                try {
                  const resp = await fetch('/api/auth/oauth/facebook/url');
                  const data = await resp.json();
                  if (data.url) window.open(data.url, 'oauth_facebook', 'width=480,height=640');
                } catch (_) {}
              }}>Facebook</Button>
              </motion.div>
            </Stack>
            <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 1.25 }}>
              <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
              <Button variant="text" size="small" onClick={async () => {
                if (!email || emailError) return;
                const resp = await fetch('/api/auth/magic/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
                if (resp.ok) toast.success('Magic link sent to your email');
              }}>Send magic link</Button>
              </motion.div>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Don&apos;t have an account? <motion.span whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}><Button component={Link} to="/register">Sign up</Button></motion.span>
          </Typography>
        </Stack>
      </Paper>
      </motion.div>

      {/* Removed inline Forgot Password Modal */}
    </Box>
  );
};

export default LoginPage;

