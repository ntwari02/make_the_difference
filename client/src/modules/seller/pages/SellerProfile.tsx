import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Save as SaveIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  CheckCircle as VerifiedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../core/store';
import { setProfile, setLoading, setError } from '../store/sellerSlice';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';

interface ProfileFormData {
  business_name: string;
  business_type: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  images: string[];
  business_hours: Record<string, any>;
  services: string[];
}

const SellerProfile: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.seller.profile);
  const [activeTab, setActiveTab] = useState(0);
  // const [uiLoading, setUiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Load seller profile on mount if not in store
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        dispatch(setLoading(true));
        const data = await sellerApi.profile.getProfile();
        if (!mounted) return;
        dispatch(setProfile(data));
      } catch (e: any) {
        dispatch(setError(e?.response?.data?.message || 'Failed to load profile'));
      } finally {
        dispatch(setLoading(false));
      }
    };
    if (!profile) load();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState<ProfileFormData>({
    business_name: '',
    business_type: '',
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
    images: [],
    business_hours: {},
    services: [],
  });
  const [original, setOriginal] = useState<Partial<ProfileFormData> | null>(null);

  useEffect(() => {
    // Load profile on mount if not in store
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await sellerApi.profile.getProfile();
        dispatch(setProfile(data as any));
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    if (!profile) {
      loadProfile();
    }

    if (profile) {
      setFormData({
        business_name: profile.business_name || '',
        business_type: profile.business_type || '',
        description: profile.description || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        postal_code: profile.postal_code || '',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        logo: profile.logo || '',
        images: profile.images || [],
        business_hours: profile.business_hours || {},
        services: profile.services || [],
      });
      setOriginal({
        business_name: profile.business_name || '',
        business_type: profile.business_type || '',
        description: profile.description || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        postal_code: profile.postal_code || '',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        logo: profile.logo || '',
        images: profile.images || [],
        business_hours: profile.business_hours || {},
        services: profile.services || [],
      });
    }
  }, [profile]);

  // Auto-hide success message after a short delay
  useEffect(() => {
    if (!success) return;
    const id = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(id);
  }, [success]);

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const buildDiff = (): Partial<ProfileFormData> => {
    if (!original) return formData;
    const diff: any = {};
    const keys: (keyof ProfileFormData)[] = ['business_name','business_type','description','address','city','state','country','postal_code','phone','email','website','logo','images','business_hours','services'];
    keys.forEach((k) => {
      const curr = (formData as any)[k];
      const prev = (original as any)[k];
      const isObj = typeof curr === 'object';
      const changed = isObj ? JSON.stringify(curr) !== JSON.stringify(prev) : curr !== prev;
      if (changed) diff[k] = curr;
    });
    return diff;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setUiError(null);
      setSuccess(null);

      const payload = buildDiff();
      const updatedProfile = await sellerApi.profile.updateProfile(payload);
      dispatch(setProfile(updatedProfile));
      setSuccess('Profile updated successfully!');
    } catch (error) {
      // Surface detailed error info for easier debugging
      const err: any = error;
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      const validationErrors = err?.response?.data?.errors;
      let details = '';
      if (validationErrors && Array.isArray(validationErrors)) {
        details = '\n' + validationErrors.map((e: any) => `${e.param || e.field || 'field'}: ${e.msg || e.message || 'invalid'}`).join('\n');
      }
      console.error('Failed to update profile:', { status, serverMsg, data: err?.response?.data });
      setUiError(`Failed to update profile${status ? ` (HTTP ${status})` : ''}: ${serverMsg || 'Unknown error.'}${details}`);
    } finally {
      setSaving(false);
    }
  };

  const businessTypes = [
    'Dealership',
    'Independent Seller',
    'Auto Broker',
    'Car Rental',
    'Fleet Management',
    'Parts Dealer',
    'Service Center',
  ];

  // countries list removed (unused)

  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const getVerificationStatus = () => {
    if (profile?.is_verified) {
      return { status: 'verified', color: 'success', icon: <VerifiedIcon />, text: 'Verified' };
    }
    return { status: 'pending', color: 'warning', icon: <WarningIcon />, text: 'Pending Verification' };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Seller Profile
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>

        {/* Alerts */}
        {uiError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {uiError}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Profile Overview Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                src={formData.logo}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {formData.business_name?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {formData.business_name || 'Your Business Name'}
                  </Typography>
                  <Chip
                    icon={verificationStatus.icon}
                    label={verificationStatus.text}
                    color={verificationStatus.color as any}
                    size="small"
                  />
                </Box>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {formData.business_type}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formData.city && formData.state ? `${formData.city}, ${formData.state}` : 'Location not set'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon fontSize="small" color="warning" />
                    <Typography variant="body2">
                      4.8 (127 reviews)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Business Information" />
            <Tab label="Contact Details" />
            <Tab label="Business Hours" />
            <Tab label="Services" />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <Box sx={{ mb: 3 }}>
          {/* Business Information Tab */}
          {activeTab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  Business Information
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  }}
                >
                  <Box>
                    <TextField
                      fullWidth
                      label="Business Name"
                      size="small"
                      value={formData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      required
                    />
                  </Box>
                  <Box>
                    <FormControl fullWidth>
                      <InputLabel>Business Type</InputLabel>
                      <Select
                        value={formData.business_type}
                        label="Business Type"
                        size="small"
                        onChange={(e) => handleInputChange('business_type', e.target.value)}
                      >
                        {businessTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Business Description"
                      size="small"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your business, experience, and what makes you unique..."
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Logo URL"
                      size="small"
                      value={formData.logo}
                      onChange={(e) => handleInputChange('logo', e.target.value)}
                      placeholder="https://example.com/logo.jpg"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Contact Details Tab */}
          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Contact Information
                </Typography>
                <Box sx={{ display: 'grid', gap: 3 }}>
                  <Box>
                    <TextField
                      fullWidth
                      label="Business Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </Box>
                  <Box>
                    <FormControl fullWidth>
                      <InputLabel>State</InputLabel>
                      <Select
                        value={formData.state}
                        label="State"
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      >
                        {usStates.map((state) => (
                          <MenuItem key={state} value={state}>
                            {state}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Business Hours Tab */}
          {activeTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Business Hours
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Set your business hours for each day of the week
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <Box key={day}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                          {day}:
                        </Typography>
                <TextField
                  size="small"
                  type="time"
                  value={(formData.business_hours[day]?.open) || ''}
                  onChange={(e) => handleInputChange('business_hours', {
                    ...formData.business_hours,
                    [day]: { ...(formData.business_hours[day] || {}), open: e.target.value }
                  })}
                  inputProps={{ step: 300 }}
                  sx={{ width: 120 }}
                />
                <Typography variant="body2">to</Typography>
                <TextField
                  size="small"
                  type="time"
                  value={(formData.business_hours[day]?.close) || ''}
                  onChange={(e) => handleInputChange('business_hours', {
                    ...formData.business_hours,
                    [day]: { ...(formData.business_hours[day] || {}), close: e.target.value }
                  })}
                  inputProps={{ step: 300 }}
                  sx={{ width: 120 }}
                />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Services Tab */}
          {activeTab === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Services Offered
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select the services your business provides
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  {[
                    'Car Sales',
                    'Financing',
                    'Trade-ins',
                    'Warranty',
                    'Service & Repair',
                    'Parts Sales',
                    'Delivery',
                    'Online Sales',
                    'Test Drives',
                    'Vehicle History Reports',
                    'Extended Warranty',
                    'GAP Insurance',
                  ].map((service) => (
                    <Box key={service}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.services.includes(service)}
                            onChange={(e) => {
                              const newServices = e.target.checked
                                ? [...formData.services, service]
                                : formData.services.filter(s => s !== service);
                              handleInputChange('services', newServices);
                            }}
                          />
                        }
                        label={service}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Verification Status */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Verification Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {verificationStatus.icon}
              <Typography variant="body1">
                Your account is {verificationStatus.text.toLowerCase()}
              </Typography>
            </Box>
            <Alert severity={verificationStatus.status === 'verified' ? 'success' : 'info'}>
              {verificationStatus.status === 'verified'
                ? 'Your business has been verified. You can now access all seller features.'
                : 'Your verification is pending review. You may have limited access to some features until approved.'
              }
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default SellerProfile;
