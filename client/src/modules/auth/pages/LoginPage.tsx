import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { RootState } from '../../../core/store';
import { loginUser } from '../../../core/store/auth/authSlice';
import { redirectToDashboard } from '../../../core/utils/roleRedirect';
import {
  Box, Paper, Typography, TextField, InputAdornment, IconButton, Button, Stack, FormControlLabel, Checkbox,
} from '@mui/material';
import { Email as EmailIcon, Visibility, VisibilityOff, Lock as LockIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import Recaptcha from '../components/Recaptcha';
import { oauthLogin } from '../../../core/store/auth/authSlice';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, error } = useSelector((s: RootState) => s.auth);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [touched, setTouched] = React.useState<{ email?: boolean; password?: boolean }>({});
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null);

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
    window.addEventListener('message', onMessage);
    const params = new URLSearchParams(window.location.search);
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
      redirectToDashboard(user, navigate);
    }
    return () => window.removeEventListener('message', onMessage);
  }, [isAuthenticated, user, navigate, dispatch]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const payload: any = { email, password, remember_me: remember };
    if (recaptchaToken) payload.recaptcha_token = recaptchaToken;
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
          <Recaptcha onToken={setRecaptchaToken} />
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
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <Button component={Link} to="/auth/forgot-password" size="small">Forgot password?</Button>
                </motion.div>
              </Stack>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                <Button type="submit" variant="contained" disabled={isLoading || !isValid} fullWidth sx={{ bgcolor: isValid ? '#0b1220' : '#334155', color: '#fff', py: 1.25, textTransform: 'none', fontWeight: 800, letterSpacing: 0.2, borderRadius: 999, boxShadow: '0 8px 20px rgba(0,0,0,0.25)', transition: 'transform 120ms ease', '&:active': { transform: 'translateY(1px)' }, '&:hover': { bgcolor: '#0f172a' }, '&.Mui-disabled': { color: '#fff !important' } }}>{isLoading ? 'Signing in...' : 'Get Started'}</Button>
              </motion.div>
              {/* Placeholder: set recaptcha token from widget */}
              <input type="hidden" value={recaptchaToken || ''} readOnly />
              {error && <Typography variant="body2" color="error">{error}</Typography>}
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
    </Box>
  );
};

export default LoginPage;

