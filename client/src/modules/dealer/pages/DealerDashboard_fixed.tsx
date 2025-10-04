import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, IconButton, Tabs, Tab, TextField, InputAdornment, Tooltip, Chip, Stack, Button, FormControl, InputLabel, Select, MenuItem, FormHelperText, FormControlLabel, Switch, Alert } from '@mui/material';
import { DarkMode, LightMode, Chat, Refresh, Search, Edit, Delete, Logout, Close } from '@mui/icons-material';
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
  
  // Business Hours Categories
  const [businessHoursCategories, setBusinessHoursCategories] = useState({
    weekdays: {
      enabled: true,
      name: 'Weekdays (Mon-Fri)',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      hours: { open: '09:00', close: '18:00' }
    },
    saturday: {
      enabled: false,
      name: 'Saturday',
      days: ['sat'],
      hours: { open: '09:00', close: '15:00' }
    },
    sunday: {
      enabled: false,
      name: 'Sunday',
      days: ['sun'],
      hours: { open: '10:00', close: '14:00' }
    },
    holidays: {
      enabled: false,
      name: 'Holidays',
      days: [],
      hours: { open: '09:00', close: '16:00' }
    }
  });

  // Legacy hours state for backward compatibility
  const [hoursState, setHoursState] = useState<Record<string, { open: boolean; from?: string; to?: string }>>({
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
  const [submitSuccess, setSubmitSuccess] = useState<string>('');
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
    
    // parse business hours if present - enhanced parsing
    try {
      if (profileData.business_hours_input) {
        console.log('ðŸ”„ Syncing hours from business_hours_input:', profileData.business_hours_input);
        const parsed = JSON.parse(profileData.business_hours_input);
        console.log('   ðŸ“‹ Parsed hours:', parsed);
        
        const next: any = { ...hoursState };
        daysOfWeek.forEach(d => {
          const val = parsed?.[d];
          console.log(`   ðŸ” Processing ${d}:`, val);
          
          if (typeof val === 'string' && val.includes('-')) {
            const [from, to] = val.split('-');
            // Check if it's a valid business time (not closed/default)
            // Accept any non-zero times, including same start/end times like "09:00-09:00"
            const isValidTime = 
              val !== '00:00-00:00' && 
              val !== '24:00-24:00' &&
              from && 
              to &&
              // Allow same start/end times (full day operations) and regular time format
              (val.includes('-') && from.length === 5 && to.length === 5);
            
            if (isValidTime) {
              next[d] = { open: true, from, to };
              console.log(`   âœ… ${d}: ON (${val})`);
            } else {
              next[d] = { ...next[d], open: false };
              console.log(`   âŒ ${d}: OFF (${val})`);
            }
          } else {
            next[d] = { ...next[d], open: false };
            console.log(`   âŒ ${d}: OFF - No dash or invalid format:`, val);
          }
        });
        setHoursState(next);
        console.log('ðŸ”„ Final synced hours state:', next);
      }
    } catch (error) {
      console.error('âŒ Error parsing business hours:', error);
    }
  }, [profileData.business_hours_input]);

  // Debug: Log whenever hoursState changes
  useEffect(() => {
    console.log('ðŸŽ¯ HOURS STATE CHANGED:', hoursState);
    console.log('   MON:', hoursState.mon);
    console.log('   TUE:', hoursState.tue);
  }, [hoursState]);

  // Force re-run business hours loading when profile data changes
  useEffect(() => {
    console.log('ðŸ”„ BUSINESS HOURS INPUT CHANGED - Triggers reload from profileData.business_hours_input:', profileData.business_hours_input);
  }, [profileData.business_hours_input]);

  // Load profile data into form when editing
  useEffect(() => {
    if (showCreateProfile && myProfile) {
      console.log('ðŸš€ STARTING PROFILE DATA LOAD - DEBUG INFO:');
      console.log('ðŸ“Š myProfile:', myProfile);
      console.log('ðŸ“Š myProfile.business_hours:', myProfile.business_hours);
      console.log('ðŸ“Š myProfile.business_hours type:', typeof myProfile.business_hours);
      console.log('ðŸ“Š myProfile.business_hours keys:', myProfile.business_hours ? Object.keys(myProfile.business_hours) : 'none');
      console.log('ðŸ“Š myProfile.business_hours entries:', myProfile.business_hours ? Object.entries(myProfile.business_hours) : 'none');
      console.log('ðŸ“Š Full myProfile keys:', Object.keys(myProfile));
      
      // Check all possible business hours properties
      console.log('ðŸ” CHECKING ALL BUSINESS HOURS PROPERTIES:');
      console.log('   myProfile.business_hours:', myProfile.business_hours);
      console.log('   myProfile.business_hours_input:', myProfile.business_hours_input);
      console.log('   myProfile.businessHours:', myProfile.businessHours);
      console.log('   myProfile.working_hours:', myProfile.working_hours);
      
      // Prepare business hours input - prioritize business_hours over business_hours_input
      let businessHoursInput = '';
      if (myProfile.business_hours && Object.keys(myProfile.business_hours).length > 0) {
        businessHoursInput = JSON.stringify(myProfile.business_hours);
        console.log('ðŸ”„ Using myProfile.business_hours for input:', myProfile.business_hours);
      } else if (myProfile.business_hours_input) {
        businessHoursInput = myProfile.business_hours_input;
        console.log('ðŸ”„ Using myProfile.business_hours_input:', myProfile.business_hours_input);
      } else {
        console.log('âŒ No business hours found in profile');
      }

      setProfileData({
        business_name: myProfile.business_name || '',
        business_type: myProfile.business_type || 'dealership',
        license_number: myProfile.license_number || '',
        description: myProfile.description || '',
        address: myProfile.address || '',
        city: myProfile.city || '',
        state: myProfile.state || '',
        country: myProfile.country || '',
        postal_code: myProfile.postal_code || '',
        phone: myProfile.phone || '',
        email: myProfile.email || '',
        website: myProfile.website || '',
        logo: myProfile.logo || '',
        images_input: myProfile.images ? myProfile.images.join(', ') : '',
        services_input: myProfile.services ? myProfile.services.join(', ') : '',
        business_hours_input: businessHoursInput
      });

      console.log('ðŸ”„ PROFILE DATA SET - business_hours_input:', businessHoursInput);

      // Initialize business hours state properly
      const newHoursState: Record<string, { open: boolean; from: string; to: string }> = {};
      
      // Initialize with defaults for all days
      daysOfWeek.forEach(day => {
        newHoursState[day] = { open: false, from: '09:00', to: '17:00' };
      });

      // Load saved hours if they exist
      if (myProfile.business_hours && Object.keys(myProfile.business_hours).length > 0) {
        console.log('ðŸ”„ Loading saved business hours from profile:', myProfile.business_hours);
        console.log('ðŸ”„ Number of saved hours entries:', Object.keys(myProfile.business_hours).length);
        
        Object.entries(myProfile.business_hours).forEach(([day, timeRange]) => {
          console.log(`   ðŸ” Processing ${day}:`, timeRange);
          console.log(`   ðŸ” TimeRange type:`, typeof timeRange);
          console.log(`   ðŸ” TimeRange includes dash:`, typeof timeRange === 'string' && timeRange.includes('-'));
          
          if (timeRange && typeof timeRange === 'string') {
            // Handle both "00:00-00:00" (closed) and actual time ranges
            if (timeRange.includes('-')) {
              const [fromTime, toTime] = timeRange.split('-');
              
              // Check if it's a valid business hours (not closed/default times)
              // Accept any non-zero times, including same start/end times like "09:00-09:00"
              const isValidBusinessHours = 
                timeRange !== '00:00-00:00' && 
                timeRange !== '24:00-24:00' &&
                fromTime && 
                toTime &&
                // Allow same start/end times (full day operations)
                (timeRange.includes('-') && fromTime.length === 5 && toTime.length === 5);
              
              console.log(`   ðŸ” Validation check for ${day}:`);
              console.log(`     timeRange !== '00:00-00:00':`, timeRange !== '00:00-00:00');
              console.log(`     timeRange !== '24:00-24:00':`, timeRange !== '24:00-24:00');
              console.log(`     fromTime exists:`, !!fromTime);
              console.log(`     toTime exists:`, !!toTime);
              console.log(`     timeRange includes dash:`, timeRange.includes('-'));
              console.log(`     fromTime length === 5:`, fromTime.length === 5);
              console.log(`     toTime length === 5:`, toTime.length === 5);
              console.log(`   ðŸ” FINAL isValidBusinessHours for ${day}:`, isValidBusinessHours);
              
              if (isValidBusinessHours) {
                // Update the state for this day
                newHoursState[day] = {
                  open: true,
                  from: fromTime,
                  to: toTime
                };
                console.log(`   âœ… ${day}: ON (${timeRange}) - Set from=${fromTime}, to=${toTime}`);
              } else {
                // Keep as OFF
                newHoursState[day] = {
                  open: false,
                  from: fromTime || '09:00',
                  to: toTime || '17:00'
                };
                console.log(`   âŒ ${day}: OFF (${timeRange}) - Invalid/closed time`);
              }
            } else {
              // Single time value (handle edge cases)
              console.log(`   âŒ ${day}: OFF - No dash in time format: ${timeRange}`);
              newHoursState[day] = {
                open: false,
                from: '09:00',
                to: '17:00'
              };
            }
          } else {
            console.log(`   âŒ ${day}: OFF - Invalid time type:`, timeRange);
            newHoursState[day] = {
              open: false,
              from: '09:00',
              to: '17:00'
            };
          }
        });
      } else {
        console.log('ðŸ”„ No saved business hours found, using defaults');
      }

      setHoursState(newHoursState);
      console.log('ðŸ”„ Final hours state set:', newHoursState);
      console.log('ðŸŽ¯ SETTING HOURS STATE - MON:', newHoursState.mon);
      console.log('ðŸŽ¯ SETTING HOURS STATE - TUE:', newHoursState.tue);
      
      // Reset form errors
      setFormErrors({});
      setSubmitError('');
      setSubmitSuccess('');
      
      // Additional debug: Check what switches will show
      setTimeout(() => {
        console.log('â° AFTER TIMEOUT - Current hoursState should show:');
        console.log('   MON switch:', hoursState.mon?.open, hoursState.mon?.from, hoursState.mon?.to);
        console.log('   TUE switch:', hoursState.tue?.open, hoursState.tue?.from, hoursState.tue?.to);
      }, 100);
      
      // Force a re-render by updating the form data to trigger the sync effect
      setTimeout(() => {
        console.log('ðŸ”„ FORCING SYNC with current hoursState...');
        syncHoursToInputFromState(newHoursState);
      }, 200);
    }
  }, [showCreateProfile, myProfile]);

  // Convert categories to individual day format for API compatibility
  const convertCategoriesToHours = (categories: typeof businessHoursCategories) => {
    const hoursObj: Record<string, string> = {};
    
    Object.values(categories).forEach(category => {
      if (category.enabled && category.days.length > 0) {
        const openTime = category.hours.open;
        const closeTime = category.hours.close;
        
        category.days.forEach(day => {
          hoursObj[day] = `${openTime}-${closeTime}`;
        });
      }
    });
    
    console.log('ðŸ”„ Converted categories to hours:', hoursObj);
    return hoursObj;
  };

  // Convert legacy individual day format to categories
  const convertHoursToCategories = (hoursObj: Record<string, string>) => {
    const newCategories = { ...businessHoursCategories };

    // Reset all categories
    Object.keys(newCategories).forEach(key => {
      newCategories[key as keyof typeof newCategories].enabled = false;
    });

    // Analyze the hours to determine categories
    const hoursEntries = Object.entries(hoursObj);
    
    // Group similar hours
    const hourGroups: Record<string, string[]> = {};
    hoursEntries.forEach(([day, hours]) => {
      if (hours && hours !== '00:00-00:00') {
        if (!hourGroups[hours]) {
          hourGroups[hours] = [];
        }
        hourGroups[hours].push(day);
      }
    });

    // Map common patterns to categories
    Object.entries(hourGroups).forEach(([hours, days]) => {
      const [open, close] = hours.split('-');
      
      if (days.includes('mon') && days.includes('tue') && days.includes('wed') && 
          days.includes('thu') && days.includes('fri')) {
        // Full weekdays
        newCategories.weekdays.enabled = true;
        newCategories.weekdays.hours = { open, close };
      }
      
      if (days.includes('sat')) {
        // Saturday
        newCategories.saturday.enabled = true;
        newCategories.saturday.hours = { open, close };
      }
      
      if (days.includes('sun')) {
        // Sunday
        newCategories.sunday.enabled = true;
        newCategories.sunday.hours = { open, close };
      }
    });

    console.log('ðŸ”„ Converted hours to categories:', newCategories);
    return newCategories;
  };

  // Sync categories to profile data
  const syncCategoriesToInput = () => {
    const hoursObj = convertCategoriesToHours(businessHoursCategories);
    const jsonString = JSON.stringify(hoursObj);
    console.log('ðŸ”„ SYNCING CATEGORIES TO INPUT:', jsonString);
    setProfileData((prev: any) => ({ ...prev, business_hours_input: jsonString }));
  };

  // Legacy function for backward compatibility
  const syncHoursToInputFromState = (next: Record<string, { open: boolean; from: string; to: string }>) => {
    console.log('ðŸ”„ SYNCING HOURS TO INPUT - Current state:', next);
    const obj: Record<string, string> = {};
    daysOfWeek.forEach((d) => {
      if (next[d]?.open) {
        const from = (next[d].from || '').includes('T') ? (next[d].from || '').split('T')[1]?.slice(0,5) : (next[d].from || '');
        const to = (next[d].to || '').includes('T') ? (next[d].to || '').split('T')[1]?.slice(0,5) : (next[d].to || '');
        if (from && to) {
          obj[d] = `${from}-${to}`;
          console.log(`   âœ… ${d}: SYNCED ${from}-${to}`);
        }
      } else {
        console.log(`   âŒ ${d}: SKIPPED (closed)`);
      }
    });
    const jsonString = JSON.stringify(obj);
    console.log('ðŸ”„ SYNCED hours JSON:', jsonString);
    setProfileData((prev: any) => ({ ...prev, business_hours_input: jsonString }));
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
    
    console.log('ðŸ” Dashboard Debug - Storage check:');
    console.log('- localStorage.user:', localStorage.getItem('user'));
    console.log('- localStorage.user_data:', localStorage.getItem('user_data'));
    console.log('- localStorage.access_token exists:', !!localStorage.getItem('access_token'));
    console.log('- Final userStr:', userStr);
    console.log('- Final token exists:', !!token);
    console.log('- Full token preview:', token?.substring(0, 50) + '...');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('ðŸ” Debug - Parsed user:', user);
        console.log('ðŸ” Debug - User role:', user.role);
        console.log('ðŸ” Debug - User ID:', user.id);
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
          console.log('âœ… No dealer profile found, showing create dialog');
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
        console.log('ðŸŽ¯ API PROFILE RESPONSE:', myProfileRes);
        console.log('ðŸŽ¯ API PROFILE business_hours:', myProfileRes.business_hours);
        console.log('ðŸŽ¯ API PROFILE business_hours type:', typeof myProfileRes.business_hours);
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
    console.log('ðŸ” Create Profile Debug:');
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
      console.log('ðŸš€ Calling createProfile API...');
      console.log('ðŸ“Š Current profileData.business_hours_input:', profileData.business_hours_input);
      console.log('ðŸ“Š Current hoursState:', hoursState);
      console.log('ðŸ“Š Current imagesList:', imagesList);
      console.log('ðŸ“Š Current servicesList:', servicesList);
      
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
        services: profileData.services_input ? String(profileData.services_input).split(',').map((s: string) => s.trim()).
filter(Boolean) : []
      } as any;
      
      console.log('ðŸ“¦ SENDING PAYLOAD:');
      console.log('   business_hours:', payload.business_hours);
      console.log('   Full payload:', payload);
      
      const result = await dealerAPI.createProfile(payload);
      console.log('âœ… Profile created successfully:', result);
      setShowCreateProfile(false);
      await loadData(); // Reload data after profile creation
      
      // Show success message
      setSubmitSuccess('âœ… Profile created successfully!');
      
      // Auto-hide success message after 4 seconds
      setTimeout(() => {
        setSubmitSuccess('');
      }, 4000);
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
      
      // Clear success message on error
      setSubmitSuccess('');
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create profile';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
      <Box sx={{ position: 'relative', p: 1.6, minHeight: '100vh', background: isDark ? '#0f172a' : '#f5f7fb', overflow: 'hidden' }}>

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
        <>
          {/* Profile Card Display */}
          {myProfile && (
            <Paper 
              sx={{ 
                p: 0, 
                background: isDark ? 'linear-gradient(145deg, #1f2937 0%, #111827 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                maxWidth: { xs: '100%', md: '90%' }, 
                mx: 'auto', 
                color: isDark ? '#e5e7eb' : 'inherit',
                borderRadius: '20px',
                boxShadow: isDark 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #60a5fa, #3b82f6, #2563eb, #1d4ed8)',
                  borderRadius: '20px 20px 0 0'
                },
                '&:hover': {
                  boxShadow: isDark 
                    ? '0 35px 70px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(96, 165, 250, 0.2)' 
                    : '0 35px 70px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)',
                  transform: 'translateY(-4px)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '& .MuiTypography-root': { color: isDark ? '#e5e7eb' : 'inherit' }
              }} 
              component={motion.div} 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ 
                y: -6,
                transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
              }}
            >
              {/* Hero Header Section */}
              <Box sx={{ 
                background: isDark ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(96, 165, 250, 0.02) 100%)',
                p: 4,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: isDark ? 'radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                  opacity: 0.6
                }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, position: 'relative', zIndex: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ 
                      mb: 1,
                      background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                      fontSize: '1.5rem'
                    }}>
                      Dealer Profile
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                        Manage your business information
                      </Typography>
                      <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: '1.2rem' }}
                      >
                        <span style={{ color: isDark ? '#60a5fa' : '#2563eb' }}>âš¡</span>
                      </motion.div>
                    </Box>
                  </Box>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton 
                      onClick={() => setShowCreateProfile(true)}
                      sx={{ 
                        color: isDark ? '#60a5fa' : '#2563eb',
                        background: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                        border: `1px solid ${isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                        '&:hover': {
                          background: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                          border: `1px solid ${isDark ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
                          transform: 'translateY(-2px)',
                          boxShadow: isDark ? '0 8px 25px rgba(96, 165, 250, 0.15)' : '0 8px 25px rgba(59, 130, 246, 0.1)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      title="Edit Profile"
                    >
                      <Edit />
                    </IconButton>
                  </motion.div>
                </Box>
              </Box>
              
              {/* Profile Information Grid */}
              <Box sx={{ p: 4 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  {/* Business Details Hero */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{ gridColumn: '1 / -1' }}
                  >
                    <Box sx={{
                      background: isDark ? 'rgba(96, 165, 250, 0.05)' : 'rgba(59, 130, 246, 0.02)',
                      borderRadius: '16px',
                      p: 3,
                      border: `1px solid ${isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.05)'}`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #60a5fa, #3b82f6, reset)',
                        borderRadius: '16px 16px 0 0'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <motion.div
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <span style={{ fontSize: '2rem' }}>ðŸ¢</span>
                            </motion.div>
                            <Typography variant="h5" sx={{ 
                              fontWeight: 700,
                              background: isDark ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)' : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}>
                              {myProfile.business_name}
                            </Typography>
                          </Box>
                          <Chip 
                            label={myProfile.business_type?.replace('_', ' ')}
                            sx={{ 
                              ml: 1,
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                              color: 'white',
                              border: 'none',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          />
                        </Box>
                      </Box>
                      {myProfile.description && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <Typography variant="body1" sx={{ 
                            color: isDark ? '#cbd5e1' : '#475569',
                            lineHeight: 1.6,
                            fontStyle: 'italic',
                            position: 'relative',
                            pl: 2,
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              width: '3px',
                              height: '100%',
                              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                              borderRadius: '2px'
                            }
                          }}>
                            "{myProfile.description}"
                          </Typography>
                        </motion.div>
                      )}
                    </Box>
                  </motion.div>

                  {/* Quick Hours Summary */}
                  {/* Quick Hours Summary - Always Show */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.35 }}
                      style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}
                    >
                      <Box sx={{
                        background: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.03)',
                        borderRadius: '12px',
                        p: 2.5,
                        border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'}`,
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '3px',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          borderRadius: '0 3px 3px 0'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            <span style={{ fontSize: '1.2rem' }}>â°</span>
                          </motion.div>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600,
                            color: isDark ? '#8b5cf6' : '#7c3aed',
                            fontSize: '1rem'
                          }}>
                            Business Hours
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
                          {daysOfWeek.map((day, index) => {
                            const hours = myProfile.business_hours?.[day];
                            const defaultHours: Record<string, string> = {
                              'mon': '09:00-18:00',
                              'tue': '09:00-18:00', 
                              'wed': '09:00-18:00',
                              'thu': '09:00-18:00',
                              'fri': '09:00-18:00',
                              'sat': '10:00-16:00',
                              'sun': 'Closed'
                            };
                            const displayHours = (!hours || hours === '00:00-00:00') ? defaultHours[day] : hours;
                            return (
                              <motion.div
                                key={day}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.5 + (0.1 * index) }}
                                whileHover={{ scale: 1.05 }}
                              >
                                <Box sx={{
                                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                  borderRadius: '8px',
                                  px: 2,
                                  py: 1,
                                  textAlign: 'center',
                                  border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)'}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                                    borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)'
                                  }
                                }}>
                                  <Typography variant="caption" sx={{ 
                                    color: isDark ? '#8b5cf6' : '#7c3aed',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    display: 'block',
                                    mb: 0.5
                                  }}>
                                    {day.toUpperCase()}
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    color: isDark ? '#e2e8f0' : '#334155',
                                    fontWeight: 500,
                                    fontSize: '0.8rem'
                                  }}>
                                    {displayHours}
                                  </Typography>
                                </Box>
                              </motion.div>
                            );
                          })}
                        </Box>
                      </Box>
                    </motion.div>

                  {/* Contact Information */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Box sx={{
                      background: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)',
                      borderRadius: '16px',
                      p: 3,
                      border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'}`,
                      height: 'fit-content',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #10b981, #059669, #047857)',
                        borderRadius: '16px 16px 0 0'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <span style={{ fontSize: '1.5rem' }}>ðŸ“ž</span>
                        </motion.div>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: isDark ? '#10b981' : '#047857',
                          fontSize: '1.1rem'
                        }}>
                          Contact Information
                        </Typography>
                      </Box>
                      <Stack spacing={2}>
                        {myProfile.phone && (
                          <motion.div
                            whileHover={{ x: 8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <span style={{ fontSize: '1.2rem' }}>ðŸ“±</span>
                              <Box>
                                <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block' }}>
                                  Phone
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {myProfile.phone}
                                </Typography>
                              </Box>
                            </Box>
                          </motion.div>
                        )}
                        {myProfile.email && (
                          <motion.div
                            whileHover={{ x: 8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <span style={{ fontSize: '1.2rem' }}>âœ‰ï¸</span>
                              <Box>
                                <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block' }}>
                                  Email
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {myProfile.email}
                                </Typography>
                              </Box>
                            </Box>
                          </motion.div>
                        )}
                        {myProfile.website && (
                          <motion.div
                            whileHover={{ x: 8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <span style={{ fontSize: '1.2rem' }}>ðŸŒ</span>
                              <Box>
                                <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block' }}>
                                  Website
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 500,
                                    color: isDark ? '#60a5fa' : '#2563eb',
                                    textDecoration: 'none',
                                    '&:hover': {
                                      textDecoration: 'underline'
                                    }
                                  }}
                                  component="a"
                                  href={myProfile.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {myProfile.website}
                                </Typography>
                              </Box>
                            </Box>
                          </motion.div>
                        )}
                      </Stack>
                    </Box>
                  </motion.div>

                  {/* Address Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Box sx={{
                      background: isDark ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.02)',
                      borderRadius: '16px',
                      p: 3,
                      border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)'}`,
                      height: 'fit-content',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #f59e0b, #d97706, #b45309)',
                        borderRadius: '16px 16px 0 0'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <span style={{ fontSize: '1.5rem' }}>ðŸ“</span>
                        </motion.div>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: isDark ? '#f59e0b' : '#d97706',
                          fontSize: '1.1rem'
                        }}>
                          Business Location
                        </Typography>
                      </Box>
                      <Stack spacing={2.5}>
                        <motion.div
                          whileHover={{ x: 8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>ðŸ¢</span>
                            <Box>
                              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block' }}>
                                Business Address
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {myProfile.address}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ x: 8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>ðŸŒ</span>
                            <Box>
                              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block' }}>
                                Location
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {myProfile.city}, {myProfile.state}, {myProfile.country}
                                {myProfile.postal_code && ` â€¢ ${myProfile.postal_code}`}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>
                        
                        {myProfile.license_number && (
                          <motion.div
                            whileHover={{ x: 8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                              <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>ðŸ“‹</span>
                              <Box>
                                <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block' }}>
                                  License Number
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {myProfile.license_number}
                                </Typography>
                              </Box>
                            </Box>
                          </motion.div>
                        )}
                      </Stack>
                    </Box>
                  </motion.div>
                </Box>
              </Box>

              {/* Business Hours */}
              {myProfile.business_hours && Object.keys(myProfile.business_hours).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  style={{ marginTop: '2rem' }}
                >
                  <Box sx={{
                    background: isDark ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.02)',
                    borderRadius: '16px',
                    p: 3,
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'}`,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #8b5cf6, #7c3aed, #6d28d9)',
                      borderRadius: '16px 16px 0 0'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>â°</span>
                      </motion.div>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        color: isDark ? '#8b5cf6' : '#7c3aed',
                        fontSize: '1.1rem'
                      }}>
                        Business Hours
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                      {daysOfWeek.map((day, index) => {
                        const hours = myProfile.business_hours[day];
                        if (!hours || hours === '00:00-00:00') return null;
                        return (
                          <motion.div
                            key={day}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Box sx={{
                              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                              borderRadius: '8px',
                              p: 2,
                              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                              '&:hover': {
                                background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                                borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'
                              },
                              transition: 'all 0.2s ease'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700,
                                  color: isDark ? '#8b5cf6' : '#7c3aed',
                                  minWidth: '60px',
                                  fontSize: '0.8rem'
                                }}>
                                  {day.toUpperCase()}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {hours}
                                </Typography>
                              </Box>
                            </Box>
                          </motion.div>
                        );
                      }).filter(Boolean)}
                    </Box>
                  </Box>
                </motion.div>
              )}

              {/* Services */}
              {myProfile.services && myProfile.services.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  style={{ marginTop: '2rem' }}
                >
                  <Box sx={{
                    background: isDark ? 'rgba(236, 72, 153, 0.05)' : 'rgba(236, 72, 153, 0.02)',
                    borderRadius: '16px',
                    p: 3,
                    border: `1px solid ${isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.05)'}`,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #ec4899, #db2777, #be185d)',
                      borderRadius: '16px 16px 0 0'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>âš¡</span>
                      </motion.div>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        color: isDark ? '#ec4899' : '#db2777',
                        fontSize: '1.1rem'
                      }}>
                        Services Offered
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {myProfile.services.map((service: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Chip 
                            label={service} 
                            sx={{
                              background: isDark 
                                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.2) 100%)'
                                : 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(219, 39, 119, 0.1) 100%)',
                              border: `1px solid ${isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.2)'}`,
                              color: isDark ? '#ec4899' : '#db2777',
                              fontWeight: 600,
                              '&:hover': {
                                background: isDark 
                                  ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.3) 100%)'
                                  : 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.2) 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: isDark ? '0 4px 12px rgba(236, 72, 153, 0.2)' : '0 4px 12px rgba(236, 72, 153, 0.1)'
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          />
                        </motion.div>
                      ))}
                    </Box>
                  </Box>
                </motion.div>
              )}

              {/* Gallery */}
              {myProfile.images && myProfile.images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  style={{ marginTop: '2rem' }}
                >
                  <Box sx={{
                    background: isDark ? 'rgba(34, 197, 158, 0.05)' : 'rgba(34, 197, 158, 0.02)',
                    borderRadius: '16px',
                    p: 3,
                    border: `1px solid ${isDark ? 'rgba(34, 197, 158, 0.1)' : 'rgba(34, 197, 158, 0.05)'}`,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #22c55e, #16a34a, #15803d)',
                      borderRadius: '16px 16px 0 0'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>ðŸ“¸</span>
                      </motion.div>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        color: isDark ? '#22c55e' : '#16a34a',
                        fontSize: '1.1rem'
                      }}>
                        Business Gallery
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {myProfile.images.slice(0, 4).map((image: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                          whileHover={{ scale: 1.1, zIndex: 1 }}
                          style={{ position: 'relative' }}
                        >
                          <Box sx={{ 
                            width: 120, 
                            height: 90, 
                            borderRadius: 12, 
                            overflow: 'hidden', 
                            border: `2px solid ${isDark ? 'rgba(34, 197, 158, 0.2)' : 'rgba(34, 197, 158, 0.1)'}`,
                            boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                              borderColor: isDark ? 'rgba(34, 197, 158, 0.5)' : 'rgba(34, 197, 158, 0.3)',
                              boxShadow: isDark ? '0 8px 20px rgba(34, 197, 158, 0.2)' : '0 8px 20px rgba(34, 197, 158, 0.1)'
                            },
                            transition: 'all 0.3s ease'
                          }}>
                            <Box
                              component="img"
                              src={image}
                              alt={`Business image ${index + 1}`}
                              sx={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)'
                                }
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </Box>
                        </motion.div>
                      ))}
                      {myProfile.images.length > 4 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.4 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Box sx={{ 
                            width: 120, 
                            height: 90, 
                            borderRadius: 12, 
                            border: `2px dashed ${isDark ? 'rgba(34, 197, 158, 0.3)' : 'rgba(34, 197, 158, 0.2)'}`,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            background: isDark ? 'rgba(34, 197, 158, 0.05)' : 'rgba(34, 197, 158, 0.02)',
                            cursor: 'pointer',
                            '&:hover': {
                              background: isDark ? 'rgba(34, 197, 158, 0.1)' : 'rgba(34, 197, 158, 0.05)',
                              borderColor: isDark ? 'rgba(34, 197, 158, 0.5)' : 'rgba(34, 197, 158, 0.3)',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.3s ease'
                          }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600,
                              color: isDark ? '#22c55e' : '#16a34a',
                              textAlign: 'center'
                            }}>
                              +{myProfile.images.length - 4}
                              <br />
                              More
                            </Typography>
                          </Box>
                        </motion.div>
                      )}
                    </Box>
                  </Box>
                </motion.div>
              )}
            </Paper>
          )}

          {/* Empty State */}
          {!myProfile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Paper sx={{ 
                p: 4, 
                textAlign: 'center', 
                background: isDark 
                  ? 'linear-gradient(145deg, #1f2937 0%, #111827 100%)' 
                  : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                maxWidth: { xs: '100%', md: '70%' }, 
                mx: 'auto',
                borderRadius: '20px',
                boxShadow: isDark 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #60a5fa, #3b82f6, #2563eb, #1d4ed8)',
                  borderRadius: '20px 20px 0 0'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: isDark ? 'radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                  opacity: 0.6
                }
              }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ marginBottom: '1rem' }}
                  >
                    <span style={{ fontSize: '4rem' }}>ðŸš—</span>
                  </motion.div>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      mb: 2, 
                      color: isDark ? '#e5e7eb' : 'inherit',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Welcome to DealerHub
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    mb: 1, 
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontWeight: 500
                  }}>
                    Ready to showcase your business?
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    mb: 3, 
                    color: isDark ? '#94a3b8' : '#64748b',
                    maxWidth: '400px',
                    mx: 'auto',
                        lineHeight: 1.6
                  }}>
                    Create your dealer profile to start managing inventory, track sales, and connect with customers on our platform.
                  </Typography>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="contained" 
                      onClick={() => setShowCreateProfile(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      ðŸš€ Create Your Profile
                    </Button>
                  </motion.div>
                </Box>
              </Paper>
            </motion.div>
          )}
        </>
      )}

      {showCreateProfile && activeTab === 0 && (
        <Paper sx={{ p: 1.6, background: isDark ? '#1f2937' : '#fff', maxWidth: { xs: '100%', md: '80%' }, mx: 'auto', color: isDark ? '#e5e7eb' : 'inherit', '& .MuiTypography-root': { color: isDark ? '#e5e7eb' : 'inherit' }, '& .MuiInputBase-input': { color: isDark ? '#e5e7eb' : 'inherit' }, '& .MuiInputLabel-root': { color: isDark ? '#cbd5e1' : 'inherit' }, '& .MuiFormHelperText-root': { color: isDark ? '#94a3b8' : 'inherit' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(148,163,184,0.25)' : undefined }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(148,163,184,0.45)' : undefined }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#60a5fa' : undefined } }} component={motion.div} initial={{ opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6">{myProfile ? 'Edit Dealer Profile' : 'Create Dealer Profile'}</Typography>
            <IconButton 
              onClick={() => setShowCreateProfile(false)}
              sx={{ color: isDark ? '#e5e7eb' : 'inherit' }}
              title="Close"
            >
              <Close />
            </IconButton>
          </Box>
          
          {submitError && (
            <Typography color="error" sx={{ mb: 1, p: 1, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
              âš ï¸ {submitError}
            </Typography>
          )}
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                severity="success" 
                sx={{ mb: 1 }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setSubmitSuccess('')}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
              >
                {submitSuccess}
              </Alert>
            </motion.div>
          )}
          <Stack spacing={2} component={motion.div} initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>
            <TextField
              fullWidth
              required
              label="Business Name"
              value={profileData.business_name}
              onChange={(e) => { setProfileData({ ...profileData, business_name: e.target.value }); setSubmitError(''); }}
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
            <TextField fullWidth label="Website" value={profileData.website} onChange={(e) => { setProfileData({ ...profileData, website: e.target.value }); setFormErrors({ ...formErrors, website: '' }); }} error={!!formErrors.website} helperText={formErrors.website} />
            <TextField fullWidth label="Logo URL" value={profileData.logo} onChange={(e) => { setProfileData({ ...profileData, logo: e.target.value }); setFormErrors({ ...formErrors, logo: '' }); }} error={!!formErrors.logo} helperText={formErrors.logo} />
            <TextField fullWidth label="Images (comma-separated)" value={profileData.images_input} onChange={(e) => setProfileData({ ...profileData, images_input: e.target.value })} />
            <TextField fullWidth label="Services (comma-separated)" value={profileData.services_input} onChange={(e) => setProfileData({ ...profileData, services_input: e.target.value })} />
            {/* NEW CATEGORIZED BUSINESS HOURS FORM */}
            <Box sx={{ 
              border: '1px solid', 
              borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)', 
              borderRadius: 2, 
              p: 3,
              background: isDark ? 'rgba(139, 92, 246, 0.02)' : 'rgba(139, 92, 246, 0.01)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: isDark ? '#8b5cf6' : '#7c3aed'
                }}>
                  Business Hours
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontStyle: 'italic'
                }}>
                  Set hours by category for easier management
                </Typography>
              </Box>

              <Stack spacing={3}>
                {/* WEEKDAYS */}
                <Box sx={{
                  p: 2.5,
                  borderRadius: 2,
                  background: businessHoursCategories.weekdays.enabled 
                    ? (isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)') 
                    : 'transparent',
                  border: `2px solid ${businessHoursCategories.weekdays.enabled 
                    ? (isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)') 
                    : 'transparent'}`,
                  transition: 'all 0.3s ease',
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={businessHoursCategories.weekdays.enabled}
                        onChange={(e) => {
                          const updated = { 
                            ...businessHoursCategories, 
                            weekdays: { 
                              ...businessHoursCategories.weekdays, 
                              enabled: e.target.checked 
                            } 
                          };
                          setBusinessHoursCategories(updated);
                          syncCategoriesToInput();
                        }}
                        sx={{
                          '& .MuiSwitch-track': {
                            backgroundColor: businessHoursCategories.weekdays.enabled ? '#10b981' : '#ccc',
                          }
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: isDark ? '#e2e8f0' : '#1e293b'
                        }}>
                          ðŸ“… Weekdays (Mon-Fri): mon tue wed thu fri
                        </Typography>
                        {businessHoursCategories.weekdays.enabled && (
                          <>
                            <TextField
                              size="small"
                              type="time"
                              label="Opens"
                              value={businessHoursCategories.weekdays.hours.open}
                              onChange={(e) => {
                                const updated = {
                                  ...businessHoursCategories,
                                  weekdays: {
                                    ...businessHoursCategories.weekdays,
                                    hours: { ...businessHoursCategories.weekdays.hours, open: e.target.value }
                                  }
                                };
                                setBusinessHoursCategories(updated);
                                syncCategoriesToInput();
                              }}
                              sx={{ width: 120 }}
                            />
                            <Typography variant="body1" sx={{ mx: 1 }}>to</Typography>
                            <TextField
                              size="small"
                              type="time"
                              label="Closes"
                              value={businessHoursCategories.weekdays.hours.close}
                              onChange={(e) => {
                                const updated = {
                                  ...businessHoursCategories,
                                  weekdays: {
                                    ...businessHoursCategories.weekdays,
                                    hours: { ...businessHoursCategories.weekdays.hours, close: e.target.value }
                                  }
                                };
                                setBusinessHoursCategories(updated);
                                syncCategoriesToInput();
                              }}
                              sx={{ width: 120 }}
                            />
                            <span style={{ fontSize: '1.2rem' }}>âœ…</span>
                          </>
                        )}
                      </Box>
                    }
                  />
                </Box>

                {/* SATURDAY */}
                <Box sx={{
                  p: 2.5,
                  borderRadius: 2,
                  background: businessHoursCategories.saturday.enabled 
                    ? (isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)') 
                    : 'transparent',
                  border: `2px solid ${businessHoursCategories.saturday.enabled 
                    ? (isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)') 
                    : 'transparent'}`,
                  transition: 'all 0.3s ease',
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={businessHoursCategories.saturday.enabled}
                        onChange={(e) => {
                          const updated = { 
                            ...businessHoursCategories, 
                            saturday: { 
                              ...businessHoursCategories.saturday, 
                              enabled: e.target.checked 
                            } 
                          };
                          setBusinessHoursCategories(updated);
                          syncCategoriesToInput();
                        }}
                        sx={{
                          '& .MuiSwitch-track': {
                            backgroundColor: businessHoursCategories.saturday.enabled ? '#3b82f6' : '#ccc',
                          }
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: isDark ? '#e2e8f0' : '#1e293b'
                        }}>
                          ðŸ–ï¸ Saturday: sat
                        </Typography>
                        {businessHoursCategories.saturday.enabled && (
                          <>
                            <TextField
                              size="small"
                              type="time"
                              label="Opens"
                              value={businessHoursCategories.saturday.hours.open}
                              onChange={(e) => {
                                const updated = {
                                  ...businessHoursCategories,
                                  saturday: {
                                    ...businessHoursCategories.saturday,
                                    hours: { ...businessHoursCategories.saturday.hours, open: e.target.value }
                                  }
                                };
                                setBusinessHoursCategories(updated);
                                syncCategoriesToInput();
                              }}
                              sx={{ width: 120 }}
                            />
                            <Typography variant="body1" sx={{ mx: 1 }}>to</Typography>
                            <TextField
                              size="small"
                              type="time"
                              label="Closes"
                              value={businessHoursCategories.saturday.hours.close}
                              onChange={(e) => {
                                const updated = {
                                  ...businessHoursCategories,
                                  saturday: {
                                    ...businessHoursCategories.saturday,
                                    hours: { ...businessHoursCategories.saturday.hours, close: e.target.value }
                                  }
                                };
                                setBusinessHoursCategories(updated);
                                syncCategoriesToInput();
                              }}
                              sx={{ width: 120 }}
                            />
                            <span style={{ fontSize: '1.2rem' }}>âœ…</span>
                          </>
                        )}
                      </Box>
                    }
                  />
                </Box>

                {/* SUNDAY */}
                <Box sx={{
                  p: 2.5,
                  borderRadius: 2,
                  background: businessHoursCategories.sunday.enabled 
                    ? (isDark ? 'rgba(236, 72, 153, 0.05)' : 'rgba(236, 72, 153, 0.02)') 
                    : 'transparent',
                  border: `2px solid ${businessHoursCategories.sunday.enabled 
                    ? (isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.2)') 
                    : 'transparent'}`,
                  transition: 'all 0.3s ease',
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={businessHoursCategories.sunday.enabled}
                        onChange={(e) => {
                          const updated = { 
                            ...businessHoursCategories, 
                            sunday: { 
                              ...businessHoursCategories.sunday, 
                              enabled: e.target.checked 
                            } 
                          };
                          setBusinessHoursCategories(updated);
                          syncCategoriesToInput();
                        }}
                        sx={{
                          '& .MuiSwitch-track': {
                            backgroundColor: businessHoursCategories.sunday.enabled ? '#ec4899' : '#ccc',
                          }
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: isDark ? '#e2e8f0' : '#1e293b'
                        }}>
                          ðŸ›ï¸ Sunday: sun
                        </Typography>
                        {businessHoursCategories.sunday.enabled && (
                          <>
                            <TextField
                              size="small"
                              type="time"
                              label="Opens"
                              value={businessHoursCategories.sunday.hours.open}
                              onChange={(e) => {
                                const updated = {
                                  ...businessHoursCategories,
                                  sunday: {
                                    ...businessHoursCategories.sunday,
                                    hours: { ...businessHoursCategories.sunday.hours, open: e.target.value }
                                  }
                                };
                                setBusinessHoursCategories(updated);
                                syncCategoriesToInput();
                              }}
                              sx={{ width: 120 }}
                            />
                            <Typography variant="body1" sx={{ mx: 1 }}>to</Typography>
                            <TextField
                              size="small"
                              type="time"
                              label="Closes"
                              value={businessHoursCategories.sunday.hours.close}
                              onChange={(e) => {
                                const updated = {
                                  ...businessHoursCategories,
                                  sunday: {
                                    ...businessHoursCategories.sunday,
                                    hours: { ...businessHoursCategories.sunday.hours, close: e.target.value }
                                  }
                                };
                                setBusinessHoursCategories(updated);
                                syncCategoriesToInput();
                              }}
                              sx={{ width: 120 }}
                            />
                            <span style={{ fontSize: '1.2rem' }}>âœ…</span>
                          </>
                        )}
                      </Box>
                    }
                  />
                </Box>
              </Stack>

              {/* PREVIEW */}
              <Box sx={{ mt: 3, p: 2, borderRadius: 1, background: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)' }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600,
                  color: isDark ? '#94a3b8' : '#64748b',
                  mb: 1
                }}>
                  Hours Preview:
                </Typography>
                <Typography variant="caption" sx={{ 
                  fontFamily: 'monospace',
                  display: 'block',
                  color: isDark ? '#cbd5e1' : '#475569'
                }}>
                  {JSON.stringify(convertCategoriesToHours(businessHoursCategories), null, 2)}
                </Typography>
              </Box>

              {formErrors.business_hours_input && (
                <FormHelperText error sx={{ mt: 2 }}>{formErrors.business_hours_input}</FormHelperText>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!myProfile ? (
                <>
                  <Button variant="contained" onClick={handleCreateProfile} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Profile'}
                  </Button>
                  <Button onClick={() => setShowCreateProfile(false)} disabled={loading}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                <Button
                  variant="contained"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      console.log('ðŸ”„ Updating profile...');
                      console.log('ðŸ“Š Current profileData.business_hours_input:', profileData.business_hours_input);
                      console.log('ðŸ“Š Current hoursState:', hoursState);
                      
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
                        website: profileData.website ? String(profileData.website).trim() : '',
                        logo: profileData.logo ? String(profileData.logo).trim() : '',
                        images: imagesList.length ? imagesList : (profileData.images_input ? String(profileData.images_input).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                        business_hours: profileData.business_hours_input ? JSON.parse(profileData.business_hours_input) : {},
                        services: servicesList.length ? servicesList : (profileData.services_input ? String(profileData.services_input).split(',').map((s: string) => s.trim()).filter(Boolean) : [])
                      } as any;
                      
                      console.log('ðŸ“¦ SENDING UPDATE PAYLOAD:');
                      console.log('   business_hours:', updatePayload.business_hours);
                      console.log('   Full payload:', updatePayload);
                      
                      await dealerAPI.updateProfile(String(myProfile.id || myProfile.dealer_id || ''), updatePayload);
                      await loadData();
                      
                      // Clear any previous errors on successful update
                      setFormErrors({});
                      setSubmitError('');
                      
                      // Close form and return to card view
                      setShowCreateProfile(false);
                      
                      // Show success message
                      setSubmitSuccess('âœ… Profile updated successfully!');
                      
                      // Auto-hide success message after 3 seconds
                      setTimeout(() => {
                        setSubmitSuccess('');
                      }, 3000);
                    } catch (error: any) {
                      console.error('Update profile failed:', error);
                      
                      // Handle validation errors
                      if (error.response?.status === 400 && error.response?.data?.errors) {
                        const validationErrors = error.response.data.errors;
                        const fieldErrors: Record<string, string> = {};
                        
                        validationErrors.forEach((err: any) => {
                          if (err.path) {
                            fieldErrors[err.path] = err.msg;
                          }
                        });
                        
                        setFormErrors(prev => ({ ...prev, ...fieldErrors }));
                        
                        // Also show general error message
                        setSubmitError(error.response.data.message || 'Please fix the validation errors');
                      } else {
                        // Generic error
                        setSubmitError(error.response?.data?.message || error.message || 'Failed to update profile');
                      }
                      
                      // Clear success message on error
                      setSubmitSuccess('');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button onClick={() => setShowCreateProfile(false)} disabled={loading}>
                  Cancel
                </Button>
                </>
              )}
            </Box>
          </Stack>
        </Paper>
      )}

      {!showCreateProfile && activeTab === 1 && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1HOVER', md: 'repeat(4, 1fr)' },
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
                  {loading ? 'â€¦' : String(kpi.value ?? 0)}
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
              lineWidth={1}
              enablePoints
              pointSize={12}
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
                    <Typography variant="subtitle2" color={isDark ? '#e2e8f0' : '#0f172a'}>{String(car.make_ || '')} {String(car.model || '')}</Typography>
                    <Chip size="small" label={String(car.status || 'unknown')} color={car.status === 'active' ? 'success' : car.status === 'sold' ? 'default' : 'warning'} />
                  </Stack>
                  <Typography variant="caption" color={isDark ? '#94a3b8' : '#64748b'}>{String(car.year_ || '')} â€¢ {car.mileage ? Number(car.mileage).toLocaleString() : '0'} km</Typography>
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
                  {messages.map((m: any) => (
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

