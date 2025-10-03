import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, IconButton, Tabs, Tab, TextField, InputAdornment, Tooltip, Chip, Stack, Button, FormControl, InputLabel, Select, MenuItem, FormHelperText, FormControlLabel, Switch } from '@mui/material';
import { DarkMode, LightMode, Chat, Refresh, Search, Edit, Delete, Logout } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { dealerAPI } from '../../../services/dealer.api';
import { ResponsiveLine } from '@nivo/line';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader
} from '@chatscope/chat-ui-kit-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/hooks/useAuth';
 

const DealerDashboard: React.FC = () => {

  const [isDark, setIsDark] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [invPagination, setInvPagination] = useState<any>({ page: 1, limit: 12, total: 0 });
  const [invSearch, setInvSearch] = useState<string>('');
  const [showCreateProfile, setShowCreateProfile] = useState<boolean>(false);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [servicesList, setServicesList] = useState<string[]>([]);
  const daysOfWeek = ['mon','tue','wed','thu','fri','sat','sun'];
  const [hoursState, setHoursState] = useState<Record<string, { open: boolean; from: string; to: string }>>({
    mon: { open: false, from: '09:00', to: '17:00' },
    tue: { open: false, from: '09:00', to: '17:00' },
    wed: { open: false, from: '09:00', to: '17:00' },
    thu: { open: false, from: '09:00', to: '17:00' },
    fri: { open: false, from: '09:00', to: '17:00' },
    sat: { open: false, from: '10:00', to: '14:00' },
    sun: { open: false, from: '00:00', to: '00:00' }
  });
  const [profileData, setProfileData] = useState<any>({
    business_name: '',
    business_type: 'dealership',
    license_number: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    images_input: '', // comma-separated URLs
    services_input: '', // comma-separated services
    business_hours_input: '' // JSON object string
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const businessTypes = ['dealership', 'private_seller', 'auction_house', 'rental_company'];

  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {};
    if (profileData.license_number && String(profileData.license_number).trim().length > 100) {
      errors.license_number = 'License number must be less than 100 characters';
    }
    if (!profileData.business_name || profileData.business_name.trim().length < 2) {
      errors.business_name = 'Business name must be at least 2 characters';
    }
    if (!businessTypes.includes(profileData.business_type)) {
      errors.business_type = 'Select a valid business type';
    }
    if (!profileData.address || profileData.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters';
    }
    if (!profileData.city || profileData.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters';
    }
    if (!profileData.state || profileData.state.trim().length < 2) {
      errors.state = 'State must be at least 2 characters';
    }
    if (!profileData.country || profileData.country.trim().length < 2) {
      errors.country = 'Country must be at least 2 characters';
    }
    if (profileData.postal_code && String(profileData.postal_code).trim().length < 3) {
      errors.postal_code = 'Postal code must be between 3 and 20 characters';
    }
    if (profileData.postal_code && String(profileData.postal_code).trim().length > 20) {
      errors.postal_code = 'Postal code must be between 3 and 20 characters';
    }
    if (!profileData.phone || String(profileData.phone).replace(/\D/g, '').length < 10) {
      errors.phone = 'Phone must be at least 10 digits';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData.email || !emailRegex.test(profileData.email)) {
      errors.email = 'Enter a valid email address';
    }
    // URL validations (optional)
    const isUrl = (v: string) => {
      try { new URL(v); return true; } catch { return false; }
    };
    if (profileData.website && !isUrl(profileData.website)) {
      errors.website = 'Website must be a valid URL';
    }
    if (profileData.logo && !isUrl(profileData.logo)) {
      errors.logo = 'Logo must be a valid URL';
    }
    // Images input (optional, comma-separated URLs)
    if (profileData.images_input) {
      const imgs = String(profileData.images_input).split(',').map((s: string) => s.trim()).filter(Boolean);
      const bad = imgs.find((u: string) => !isUrl(u));
      if (bad) errors.images_input = 'All image URLs must be valid (comma-separated)';
    }
    // Business hours input (optional JSON)
    if (profileData.business_hours_input) {
      try {
        const parsed = JSON.parse(profileData.business_hours_input);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          errors.business_hours_input = 'Business hours must be a JSON object';
        }
      } catch {
        errors.business_hours_input = 'Business hours must be a valid JSON object';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Sync lists from inputs when toggling form/profile
  useEffect(() => {
    const imgs = profileData.images_input ? String(profileData.images_input).split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const svcs = profileData.services_input ? String(profileData.services_input).split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    setImagesList(imgs);
    setServicesList(svcs);
    // parse business hours if present
    try {
      if (profileData.business_hours_input) {
        const parsed = JSON.parse(profileData.business_hours_input);
        const next: any = { ...hoursState };
        daysOfWeek.forEach(d => {
          const val = parsed?.[d];
          if (typeof val === 'string' && val.includes('-')) {
            const [from, to] = val.split('-');
            next[d] = { open: true, from, to };
          } else {
            next[d] = { ...next[d], open: false };
          }
        });
        setHoursState(next);
      }
    } catch {}
  }, [showCreateProfile, myProfile]);

  // Helpers for date-time based UI → serialize to HH:mm strings in JSON
  const syncHoursToInputFromState = (next: Record<string, { open: boolean; from: string; to: string }>) => {
    const obj: Record<string, string> = {};
    daysOfWeek.forEach((d) => {
      if (next[d]?.open) {
        const from = (next[d].from || '').includes('T') ? (next[d].from || '').split('T')[1]?.slice(0,5) : (next[d].from || '');
        const to = (next[d].to || '').includes('T') ? (next[d].to || '').split('T')[1]?.slice(0,5) : (next[d].to || '');
        if (from && to) obj[d] = `${from}-${to}`;
      }
    });
    setProfileData((prev: any) => ({ ...prev, business_hours_input: JSON.stringify(obj) }));
  };

  const formatDTForInput = (timeHHmm?: string) => {
    const now = new Date();
    const yyyy = String(now.getFullYear()).padStart(4, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const time = (timeHHmm && /^\d{2}:\d{2}$/.test(timeHHmm)) ? timeHHmm : '09:00';
    return `${yyyy}-${mm}-${dd}T${time}`;
  };

  // background effect moved globally


  
  // Chat state
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'me' | 'client'; time: string }>>([
    { id: 'm1', text: 'Hi! Welcome to your dealer chat. How can we help?', sender: 'client', time: new Date().toISOString() }
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const userStr = localStorage.getItem('user') || localStorage.getItem('user_data');
    const token = localStorage.getItem('access_token');
    
    console.log('🔍 Dashboard Debug - Storage check:');
    console.log('- localStorage.user:', localStorage.getItem('user'));
    console.log('- localStorage.user_data:', localStorage.getItem('user_data'));
    console.log('- localStorage.access_token exists:', !!localStorage.getItem('access_token'));
    console.log('- Final userStr:', userStr);
    console.log('- Final token exists:', !!token);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('🔍 Debug - Parsed user:', user);
        console.log('🔍 Debug - User role:', user.role);
        console.log('🔍 Debug - User ID:', user.id);
        setDealerId(user.id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    if (!token) {
      console.warn('No access token found, redirecting to login');
      navigate('/auth/login');
    }
  }, [navigate]);

  const toggleTheme = () => setIsDark(v => !v);

  const loadData = async () => {
    if (!dealerId) return;
    
    // Check token before making API calls
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No token available for API calls');
      navigate('/auth/login');
      return;
    }
    
    setLoading(true);
    try {
      const myProfileRes = await dealerAPI.getMyProfile().catch((err) => {
        console.error('Profile fetch error:', err.response?.status, err.response?.data);
        if (err.response?.status === 404) {
          console.log('✅ No dealer profile found, showing create dialog');
          setShowCreateProfile(true);
          return null;
        }
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn('Auth error on profile fetch, redirecting to login');
          logout();
          navigate('/auth/login');
          return null;
        }
        throw err;
      });
      
      if (myProfileRes) {
        setMyProfile(myProfileRes);
        const resolvedDealerId = myProfileRes.id || dealerId;
        const s = await dealerAPI.getDealerStats(String(resolvedDealerId)).catch(() => ({ inventory: {}, sales: {} }));
        const a = await dealerAPI.getDealerAnalytics(String(resolvedDealerId)).catch(() => []);
        setStats(s);
        setAnalytics(a);
        const inv = await dealerAPI.getDealerInventory(String(resolvedDealerId), 1, invPagination.limit, invSearch ? { search: invSearch } : {}).catch(() => ({ inventory: [], pagination: {} }));
        setInventory(inv.inventory || []);
        setInvPagination((p: any) => ({ ...p, page: 1, total: inv.pagination?.total || 0 }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [dealerId]);

  const themeIcon = isDark ? <LightMode /> : <DarkMode />;
  const chartData = useMemo(() => {
    const clean = Array.isArray(analytics) ? analytics.filter(r => r && r.period && r.total_revenue != null) : [];
    const points = clean.map((row: any) => ({ x: String(row.period), y: Number(row.total_revenue || 0) }));
    return [
      { id: 'Revenue', color: isDark ? '#60a5fa' : '#2563eb', data: points.length ? points.reverse() : [{ x: 'N/A', y: 0 }] }
    ];
  }, [analytics, isDark]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newMsg = { id: `${Date.now()}`, text, sender: 'me' as const, time: new Date().toISOString() };
    setMessages((prev) => [...prev, newMsg]);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `${Date.now()}-r`, text: 'Got it. We will get back shortly!', sender: 'client', time: new Date().toISOString() }]);
    }, 600);
  };

  const loadInventoryPage = async (page: number) => {
    if (!dealerId) return;
    setLoading(true);
    try {
      const myProfile = await dealerAPI.getMyProfile().catch(() => null);
      const resolvedDealerId = myProfile?.id || dealerId;
      const inv = await dealerAPI.getDealerInventory(String(resolvedDealerId), page, invPagination.limit, invSearch ? { search: invSearch } : {});
      setInventory(inv.inventory || []);
      setInvPagination((p: any) => ({ ...p, page, total: inv.pagination?.total || 0 }));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!profileData.business_name.trim()) {
      alert('Business name is required');
      return;
    }
    if (!validateProfile()) {
      return;
    }
    
    // Debug current auth state
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user') || localStorage.getItem('user_data');
    console.log('🔍 Create Profile Debug:');
    console.log('- Token exists:', !!token);
    console.log('- Token preview:', token?.substring(0, 50) + '...');
    console.log('- User data:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('- User role:', user.role);
        console.log('- User ID:', user.id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    setLoading(true);
    setSubmitError('');
    try {
      console.log('🚀 Calling createProfile API...');
      const payload = {
        business_name: String(profileData.business_name || '').trim(),
        business_type: profileData.business_type,
        description: profileData.description ? String(profileData.description).trim() : undefined,
        address: String(profileData.address || '').trim(),
        city: String(profileData.city || '').trim(),
        state: String(profileData.state || '').trim(),
        country: String(profileData.country || '').trim(),
        postal_code: profileData.postal_code ? String(profileData.postal_code).trim() : null,
        phone: String(profileData.phone || '').trim(),
        email: String(profileData.email || '').trim().toLowerCase(),
        website: profileData.website ? String(profileData.website).trim() : null,
        // Ensure optional fields are NOT undefined (DB driver forbids undefined in binds)
        license_number: profileData.license_number && String(profileData.license_number).trim().length > 0 ? String(profileData.license_number).trim() : null,
        logo: profileData.logo ? String(profileData.logo).trim() : null,
        images: profileData.images_input ? String(profileData.images_input).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        business_hours: profileData.business_hours_input ? JSON.parse(profileData.business_hours_input) : {},
        services: profileData.services_input ? String(profileData.services_input).split(',').map((s: string) => s.trim()).filter(Boolean) : []
      } as any;
      const result = await dealerAPI.createProfile(payload);
      console.log('✅ Profile created successfully:', result);
      setShowCreateProfile(false);
      await loadData(); // Reload data after profile creation
    } catch (error: any) {
      console.error('Create profile error details:', error.response);
      if (error.response?.status === 403 || error.response?.status === 401) {
        // Check if it's a role issue vs token issue
        if (error.response?.data?.message?.includes('insufficient role')) {
          alert('Your account role is not set to "dealer". Please contact support or update your role.');
        } else {
          alert('Your session has expired. Please login again.');
          await logout();
          navigate('/auth/login');
        }
        return;
      }
      // Map backend validation errors to form
      const backendErrors = error.response?.data?.errors as Array<{ path?: string, msg?: string, param?: string }>;
      if (Array.isArray(backendErrors)) {
        const mapped: Record<string, string> = {};
        backendErrors.forEach(e => {
          const key = (e.param || (Array.isArray(e.path) ? e.path[0] : e.path)) as string;
          if (key) mapped[key] = e.msg || 'Invalid value';
        });
        setFormErrors(mapped);
        if (backendErrors[0]?.msg) setSubmitError(backendErrors[0].msg);
      }
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create profile';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', p: 1.6, minHeight: '100vh', background: isDark ? '#0f172a' : '#f5f7fb', overflow: 'hidden' }}>
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, opacity: isDark ? 0.25 : 0.18, pointerEvents: 'none' }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color={isDark ? '#fff' : '#111'} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Dealer Dashboard
        </Typography>
        <Box>
          <IconButton onClick={loadData} sx={{ mr: 1, color: isDark ? '#e5e7eb' : 'inherit' }} aria-label="refresh">
            <Refresh />
          </IconButton>
          <IconButton onClick={toggleTheme} aria-label="toggle-theme" sx={{ color: isDark ? '#e5e7eb' : 'inherit' }}>
            {themeIcon}
          </IconButton>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Logout />}
            sx={{ ml: 1 }}
            onClick={async () => {
              try {
                await logout();
              } finally {
                navigate('/auth/login');
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} sx={{ mb: 1.6, transform: 'scale(0.95)', transformOrigin: 'left top' }} component={motion.div} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Tab label="Profile" />
        <Tab label="Overview" />
        <Tab label="Analytics" />
        <Tab label="Inventory" />
        <Tab icon={<Chat />} iconPosition="start" label="Chat" />
      </Tabs>

      {!showCreateProfile && activeTab === 0 && (
        <Paper sx={{ p: 1.6, background: isDark ? '#1f2937' : '#fff', maxWidth: { xs: '100%', md: '80%' }, mx: 'auto', color: isDark ? '#e5e7eb' : 'inherit', '& .MuiTypography-root': { color: isDark ? '#e5e7eb' : 'inherit' }, '& .MuiInputBase-input': { color: isDark ? '#e5e7eb' : 'inherit' }, '& .MuiInputLabel-root': { color: isDark ? '#cbd5e1' : 'inherit' }, '& .MuiFormHelperText-root': { color: isDark ? '#94a3b8' : 'inherit' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(148,163,184,0.25)' : undefined }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(148,163,184,0.45)' : undefined }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#60a5fa' : undefined } }} component={motion.div} initial={{ opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Typography variant="h6" mb={2}>Dealer Profile</Typography>
          <Stack spacing={2} component={motion.div} initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>
            <TextField
              fullWidth
              required
              label="Business Name"
              value={profileData.business_name}
              onChange={(e) => setProfileData({ ...profileData, business_name: e.target.value })}
            />
            <FormControl fullWidth required>
              <InputLabel id="business-type-edit">Business Type</InputLabel>
              <Select
                labelId="business-type-edit"
                label="Business Type"
                value={profileData.business_type}
                onChange={(e) => setProfileData({ ...profileData, business_type: e.target.value })}
              >
                {businessTypes.map(bt => (
                  <MenuItem key={bt} value={bt}>{bt.replace('_',' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth label="License Number" value={profileData.license_number} onChange={(e) => setProfileData({ ...profileData, license_number: e.target.value })} />
            <TextField fullWidth label="Description" multiline rows={3} value={profileData.description} onChange={(e) => setProfileData({ ...profileData, description: e.target.value })} />
            <TextField fullWidth required label="Phone" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
            <TextField fullWidth required label="Email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
            <TextField fullWidth required label="Address" value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField required label="City" value={profileData.city} onChange={(e) => setProfileData({ ...profileData, city: e.target.value })} />
              <TextField required label="State" value={profileData.state} onChange={(e) => setProfileData({ ...profileData, state: e.target.value })} />
              <TextField required label="Country" value={profileData.country} onChange={(e) => setProfileData({ ...profileData, country: e.target.value })} />
            </Box>
            <TextField fullWidth label="Postal Code" value={profileData.postal_code} onChange={(e) => setProfileData({ ...profileData, postal_code: e.target.value })} />
            <TextField fullWidth label="Website" value={profileData.website} onChange={(e) => setProfileData({ ...profileData, website: e.target.value })} />
            <TextField fullWidth label="Logo URL" value={profileData.logo} onChange={(e) => setProfileData({ ...profileData, logo: e.target.value })} />
            <TextField fullWidth label="Images (comma-separated)" value={profileData.images_input} onChange={(e) => setProfileData({ ...profileData, images_input: e.target.value })} />
            <TextField fullWidth label="Services (comma-separated)" value={profileData.services_input} onChange={(e) => setProfileData({ ...profileData, services_input: e.target.value })} />
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Business Hours</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1 }}>
                {daysOfWeek.map((d) => (
                  <Box key={d} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={<Switch size="small" checked={!!hoursState[d]?.open} onChange={(_e, checked) => {
                        const next = { ...hoursState, [d]: { ...hoursState[d], open: checked } } as any;
                        if (checked) {
                          const defaultFrom = hoursState[d]?.from || '09:00';
                          const defaultTo = hoursState[d]?.to || '17:00';
                          next[d].from = formatDTForInput(defaultFrom);
                          next[d].to = formatDTForInput(defaultTo);
                        }
                        setHoursState(next);
                        syncHoursToInputFromState(next);
                      }} />}
                      label={d.toUpperCase()}
                    />
                    <TextField size="small" type="datetime-local" value={formatDTForInput(hoursState[d]?.from)} disabled={!hoursState[d]?.open} onChange={(e) => {
                      const next = { ...hoursState, [d]: { ...hoursState[d], from: e.target.value, open: true } } as any;
                      setHoursState(next);
                      syncHoursToInputFromState(next);
                    }} />
                    <TextField size="small" type="datetime-local" value={formatDTForInput(hoursState[d]?.to)} disabled={!hoursState[d]?.open} onChange={(e) => {
                      const next = { ...hoursState, [d]: { ...hoursState[d], to: e.target.value, open: true } } as any;
                      setHoursState(next);
                      syncHoursToInputFromState(next);
                    }} />
                  </Box>
                ))}
              </Box>
              {formErrors.business_hours_input && (
                <FormHelperText error>{formErrors.business_hours_input}</FormHelperText>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!myProfile && (
                <Button variant="contained" onClick={handleCreateProfile} disabled={loading}>
                  {loading ? 'Saving...' : 'Create Profile'}
                </Button>
              )}
              {myProfile && (
                <Button
                  variant="contained"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const updatePayload = {
                        business_name: String(profileData.business_name || '').trim(),
                        business_type: profileData.business_type,
                        license_number: profileData.license_number ? String(profileData.license_number).trim() : null,
                        description: profileData.description ? String(profileData.description).trim() : null,
                        address: String(profileData.address || '').trim(),
                        city: String(profileData.city || '').trim(),
                        state: String(profileData.state || '').trim(),
                        country: String(profileData.country || '').trim(),
                        postal_code: profileData.postal_code ? String(profileData.postal_code).trim() : null,
                        phone: String(profileData.phone || '').trim(),
                        email: String(profileData.email || '').trim().toLowerCase(),
                        website: profileData.website ? String(profileData.website).trim() : null,
                        logo: profileData.logo ? String(profileData.logo).trim() : null,
                        images: imagesList.length ? imagesList : (profileData.images_input ? String(profileData.images_input).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                        business_hours: profileData.business_hours_input ? JSON.parse(profileData.business_hours_input) : {},
                        services: servicesList.length ? servicesList : (profileData.services_input ? String(profileData.services_input).split(',').map((s: string) => s.trim()).filter(Boolean) : [])
                      } as any;
                      await dealerAPI.updateProfile(String(myProfile.id || myProfile.dealer_id || ''), updatePayload);
                      await loadData();
                    } catch (e) {
                      console.error('Update profile failed:', e);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? 'Saving...' : 'Update Profile'}
                </Button>
              )}
            </Box>
          </Stack>
        </Paper>
      )}

      {showCreateProfile && activeTab === 0 && (
        <Paper sx={{ p: 1.6, background: isDark ? '#1f2937' : '#fff', maxWidth: { xs: '100%', md: '80%' }, mx: 'auto', color: isDark ? '#e5e7eb' : 'inherit', '& .MuiTypography-root': { color: isDark ? '#e5e7eb' : 'inherit' }, '& .MuiInputBase-input': { color: isDark ? '#e5e7eb' : 'inherit' }, '& .MuiInputLabel-root': { color: isDark ? '#cbd5e1' : 'inherit' }, '& .MuiFormHelperText-root': { color: isDark ? '#94a3b8' : 'inherit' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(148,163,184,0.25)' : undefined }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(148,163,184,0.45)' : undefined }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#60a5fa' : undefined } }} component={motion.div} initial={{ opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Typography variant="h6" mb={2}>Create Dealer Profile</Typography>
          {submitError && (
            <Typography color="error" sx={{ mb: 1 }}>
              {submitError}
            </Typography>
          )}
          <Stack spacing={2} component={motion.div} initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>
            <TextField
              fullWidth
              required
              label="Business Name"
              placeholder="e.g., Example Motors Ltd"
              value={profileData.business_name}
              onChange={(e) => { setProfileData({ ...profileData, business_name: e.target.value }); setFormErrors({ ...formErrors, business_name: '' }); }}
              error={!!formErrors.business_name}
              helperText={formErrors.business_name || '2–255 characters'}
            />

            <FormControl fullWidth required error={!!formErrors.business_type}>
              <InputLabel id="business-type-label">Business Type</InputLabel>
              <Select
                labelId="business-type-label"
                label="Business Type"
                value={profileData.business_type}
                onChange={(e) => { setProfileData({ ...profileData, business_type: e.target.value }); setFormErrors({ ...formErrors, business_type: '' }); }}
              >
                {businessTypes.map(bt => (
                  <MenuItem key={bt} value={bt}>{bt.replace('_',' ')}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{formErrors.business_type || 'Select one: dealership, private_seller, auction_house, rental_company'}</FormHelperText>
            </FormControl>

            <TextField
              fullWidth
              label="Description"
              placeholder="Briefly describe your dealership (optional)"
              multiline
              rows={3}
              value={profileData.description}
              onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
            />

            <TextField
              fullWidth
              required
              label="Phone"
              placeholder="e.g., +250787057751"
              value={profileData.phone}
              onChange={(e) => { setProfileData({ ...profileData, phone: e.target.value }); setFormErrors({ ...formErrors, phone: '' }); }}
              error={!!formErrors.phone}
              helperText={formErrors.phone || '10–20 digits'}
            />

            <TextField
              fullWidth
              label="License Number (optional)"
              placeholder="e.g., DL-123456"
              value={profileData.license_number}
              onChange={(e) => { setProfileData({ ...profileData, license_number: e.target.value }); setFormErrors({ ...formErrors, license_number: '' }); }}
              error={!!formErrors.license_number}
              helperText={formErrors.license_number || 'Up to 100 characters; leave empty if not applicable'}
            />

            <TextField
              fullWidth
              required
              label="Email"
              placeholder="e.g., team@example.com"
              value={profileData.email}
              onChange={(e) => { setProfileData({ ...profileData, email: e.target.value }); setFormErrors({ ...formErrors, email: '' }); }}
              error={!!formErrors.email}
              helperText={formErrors.email || 'Valid email address'}
            />

            <TextField
              fullWidth
              required
              label="Address"
              placeholder="e.g., KN 4 Road, Kicukiro"
              value={profileData.address}
              onChange={(e) => { setProfileData({ ...profileData, address: e.target.value }); setFormErrors({ ...formErrors, address: '' }); }}
              error={!!formErrors.address}
              helperText={formErrors.address || 'At least 5 characters'}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                label="City"
                placeholder="e.g., Kigali"
                value={profileData.city}
                onChange={(e) => { setProfileData({ ...profileData, city: e.target.value }); setFormErrors({ ...formErrors, city: '' }); }}
                error={!!formErrors.city}
                helperText={formErrors.city || 'At least 2 characters'}
              />
              <TextField
                required
                label="State"
                placeholder="e.g., Kicukiro"
                value={profileData.state}
                onChange={(e) => { setProfileData({ ...profileData, state: e.target.value }); setFormErrors({ ...formErrors, state: '' }); }}
                error={!!formErrors.state}
                helperText={formErrors.state || 'At least 2 characters'}
              />
              <TextField
                required
                label="Country"
                placeholder="e.g., Rwanda"
                value={profileData.country}
                onChange={(e) => { setProfileData({ ...profileData, country: e.target.value }); setFormErrors({ ...formErrors, country: '' }); }}
                error={!!formErrors.country}
                helperText={formErrors.country || 'At least 2 characters'}
              />
            </Box>

            <TextField
              fullWidth
              label="Postal Code (optional)"
              placeholder="e.g., 250"
              value={profileData.postal_code}
              onChange={(e) => { setProfileData({ ...profileData, postal_code: e.target.value }); setFormErrors({ ...formErrors, postal_code: '' }); }}
              error={!!formErrors.postal_code}
              helperText={formErrors.postal_code || '3–20 characters'}
            />

            <TextField
              fullWidth
              label="Website (optional)"
              placeholder="https://example.com"
              value={profileData.website}
              onChange={(e) => { setProfileData({ ...profileData, website: e.target.value }); setFormErrors({ ...formErrors, website: '' }); }}
              error={!!formErrors.website}
              helperText={formErrors.website || ''}
            />

            <TextField
              fullWidth
              label="Logo URL (optional)"
              placeholder="https://cdn.example.com/logo.png"
              value={profileData.logo}
              onChange={(e) => { setProfileData({ ...profileData, logo: e.target.value }); setFormErrors({ ...formErrors, logo: '' }); }}
              error={!!formErrors.logo}
              helperText={formErrors.logo || ''}
            />

            <TextField
              fullWidth
              label="Images (optional)"
              placeholder="Comma-separated image URLs"
              value={profileData.images_input}
              onChange={(e) => { setProfileData({ ...profileData, images_input: e.target.value }); setFormErrors({ ...formErrors, images_input: '' }); }}
              error={!!formErrors.images_input}
              helperText={formErrors.images_input || ''}
            />

            <TextField
              fullWidth
              label="Services (optional)"
              placeholder="Comma-separated list, e.g., financing, trade-in"
              value={profileData.services_input}
              onChange={(e) => setProfileData({ ...profileData, services_input: e.target.value })}
            />

            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Business Hours</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1 }}>
                {daysOfWeek.map((d) => (
                  <Box key={d} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={<Switch size="small" checked={!!hoursState[d]?.open} onChange={(_e, checked) => {
                        const next = { ...hoursState, [d]: { ...hoursState[d], open: checked } } as any;
                        if (checked) {
                          const defaultFrom = hoursState[d]?.from || '09:00';
                          const defaultTo = hoursState[d]?.to || '17:00';
                          next[d].from = formatDTForInput(defaultFrom);
                          next[d].to = formatDTForInput(defaultTo);
                        }
                        setHoursState(next);
                        syncHoursToInputFromState(next);
                      }} />}
                      label={d.toUpperCase()}
                    />
                    <TextField size="small" type="datetime-local" value={formatDTForInput(hoursState[d]?.from)} disabled={!hoursState[d]?.open} onChange={(e) => {
                      const next = { ...hoursState, [d]: { ...hoursState[d], from: e.target.value, open: true } } as any;
                      setHoursState(next);
                      syncHoursToInputFromState(next);
                    }} />
                    <TextField size="small" type="datetime-local" value={formatDTForInput(hoursState[d]?.to)} disabled={!hoursState[d]?.open} onChange={(e) => {
                      const next = { ...hoursState, [d]: { ...hoursState[d], to: e.target.value, open: true } } as any;
                      setHoursState(next);
                      syncHoursToInputFromState(next);
                    }} />
                  </Box>
                ))}
              </Box>
              {formErrors.business_hours_input && (
                <FormHelperText error>{formErrors.business_hours_input}</FormHelperText>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCreateProfile();
                }} 
                variant="contained" 
                disabled={loading}
                type="button"
              >
                {loading ? 'Creating...' : 'Create Profile'}
              </Button>
              <Button onClick={() => setShowCreateProfile(false)} disabled={loading}>Cancel</Button>
            </Box>
          </Stack>
        </Paper>
      )}

      {!showCreateProfile && activeTab === 1 && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}>
          {[{
            title: 'Total Vehicles', value: stats?.inventory?.total_vehicles
          },{
            title: 'Active Listings', value: stats?.inventory?.active_listings
          },{
            title: 'Sold Vehicles', value: stats?.inventory?.sold_vehicles
          },{
            title: 'Total Revenue', value: stats?.sales?.total_revenue
          }].map((kpi, idx) => (
            <Box key={idx}>
              <Paper component={motion.div} whileHover={{ y: -4 }} sx={{ p: 2, background: isDark ? '#111827' : '#fff' }}>
                <Typography color={isDark ? '#cbd5e1' : '#64748b'} variant="caption">{String(kpi.title)}</Typography>
                <Typography color={isDark ? '#fff' : '#0f172a'} variant="h5" fontWeight={700}>
                  {loading ? '…' : String(kpi.value ?? 0)}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      )}

      {!showCreateProfile && activeTab === 2 && (
        <Paper sx={{ mt: 1.6, p: 1.6, background: isDark ? '#111827' : '#fff', color: isDark ? '#e5e7eb' : 'inherit', '& .MuiTypography-root': { color: isDark ? '#e5e7eb' : 'inherit' } }} component={motion.div} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <Typography variant="subtitle1" color={isDark ? '#cbd5e1' : '#475569'} mb={1}>Revenue Trend</Typography>
          <Box sx={{ height: 320 }}>
            <ResponsiveLine
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
              axisBottom={{ tickRotation: -35 }}
              colors={{ datum: 'color' }}
              lineWidth={3}
              enablePoints
              pointSize={8}
              useMesh
              theme={{ text: { fill: isDark ? '#cbd5e1' : '#334155' }, grid: { line: { stroke: isDark ? '#334155' : '#e2e8f0', strokeDasharray: '4 4' } } }}
            />
          </Box>
        </Paper>
      )}

      {!showCreateProfile && activeTab === 3 && (
        <Paper sx={{ mt: 1.6, p: 1.6, background: isDark ? '#111827' : '#fff', color: isDark ? '#e5e7eb' : 'inherit', '& .MuiTypography-root': { color: isDark ? '#e5e7eb' : 'inherit' }, '& .MuiInputBase-input': { color: isDark ? '#e5e7eb' : 'inherit' } }} component={motion.div} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" color={isDark ? '#cbd5e1' : '#475569'}>Inventory</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search by make/model"
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}
                sx={{ mr: 1, width: 260 }}
              />
              <Button variant="contained" size="small" startIcon={<Search />} onClick={() => loadInventoryPage(1)}>Search</Button>
            </Box>
          </Box>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
          }}>
            {inventory.map((car: any) => (
              <Box key={car.id}>
                <Paper component={motion.div} whileHover={{ y: -6, scale: 1.01 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }} sx={{ p: 2, position: 'relative', overflow: 'hidden', background: isDark ? '#0b1220' : '#fff' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" color={isDark ? '#e2e8f0' : '#0f172a'}>{String(car.make || '')} {String(car.model || '')}</Typography>
                    <Chip size="small" label={String(car.status || 'unknown')} color={car.status === 'active' ? 'success' : car.status === 'sold' ? 'default' : 'warning'} />
                  </Stack>
                  <Typography variant="caption" color={isDark ? '#94a3b8' : '#64748b'}>{String(car.year || '')} • {car.mileage ? Number(car.mileage).toLocaleString() : '0'} km</Typography>
                  <Typography variant="h6" fontWeight={800} color={isDark ? '#60a5fa' : '#2563eb'} sx={{ mt: 0.5 }}>
                    ${Number(car.price || 0).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" sx={{ mr: 0.5 }}><Edit fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="caption" color={isDark ? '#94a3b8' : '#64748b'}>
              Page {String(invPagination.page)} of {String(Math.max(1, Math.ceil((invPagination.total || 0) / (invPagination.limit || 1))))}
            </Typography>
            <Box>
              <Button size="small" onClick={() => loadInventoryPage(Math.max(1, invPagination.page - 1))} disabled={invPagination.page <= 1}>Prev</Button>
              <Button size="small" onClick={() => loadInventoryPage(invPagination.page + 1)} disabled={(invPagination.page * invPagination.limit) >= invPagination.total}>Next</Button>
            </Box>
          </Box>
        </Paper>
      )}

      {!showCreateProfile && activeTab === 4 && (
        <Paper sx={{ mt: 1.6, p: 0, background: isDark ? '#0b1220' : '#fff', overflow: 'hidden' }} component={motion.div} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <Box sx={{ height: 520 }}>
            <MainContainer>
              <ChatContainer>
                <ConversationHeader>
                  <ConversationHeader.Content userName="Customer Support" info="Live chat" />
                </ConversationHeader>
                <MessageList>
                  {messages.map(m => (
                    <Message key={String(m.id)} model={{ message: String(m.text), sender: m.sender === 'me' ? 'You' : 'Client', direction: m.sender === 'me' ? 'outgoing' : 'incoming', position: 'single' }} />
                  ))}
                </MessageList>
                <MessageInput placeholder="Type message..." onSend={handleSendMessage as any} attachButton={false} />
              </ChatContainer>
            </MainContainer>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default DealerDashboard;


