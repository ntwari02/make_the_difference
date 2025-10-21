import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  PrivacyTip as PrivacyIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../core/store';
import { useThemeMode } from '../../../core/theme/ThemeProvider';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';

const SellerSettings: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.seller.profile);
  const { mode, toggleColorMode } = useThemeMode();

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      newInquiries: true,
      newOffers: true,
      paymentUpdates: true,
      reviewReplies: true,
    },
    privacy: {
      showProfile: true,
      showContact: false,
      showListings: true,
      allowMessages: true,
    },
    preferences: {
      language: 'en',
      timezone: 'America/New_York',
      currency: 'USD',
      autoRefresh: true,
    },
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await sellerApi.settings.getSettings();
        if (!mounted) return;
        // Merge with defaults to avoid undefined keys
        setSettings(prev => ({
          notifications: { ...prev.notifications, ...(data.notifications || {}) },
          privacy: { ...prev.privacy, ...(data.privacy || {}) },
          preferences: { ...prev.preferences, ...(data.preferences || {}) },
        }));
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const handleSettingChange = (category: keyof typeof settings, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = settings;
      await sellerApi.settings.updateSettings(payload);
      setSuccess('Settings saved');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    console.log('Opening delete dialog...');
    setDeleteDialog(true);
  };

  const confirmDeleteAccount = async () => {
    if (saving) return; // prevent double submit
    try {
      setSaving(true);
      setError(null);
      console.log('Starting account deletion...');
      await sellerApi.user.deleteAccount();
      console.log('Account deletion successful, clearing session...');
      // Clear local session and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_data');
      sessionStorage.clear();
      console.log('Redirecting to login...');
      window.location.href = '/login';
    } catch (e: any) {
      console.error('Delete account error:', e);
      setError(e?.response?.data?.message || e?.message || 'Failed to delete account');
    } finally {
      setSaving(false);
      setDeleteDialog(false);
    }
  };

  return (
    <SellerLayout>
      <Box sx={{ 
        flexGrow: 1,
        minHeight: 0, // Allow flex shrinking
        overflow: 'auto', // Allow scrolling if content is too tall
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          gap: { xs: 2, sm: 0 },
          mb: 3 
        }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Settings
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            fullWidth={{ xs: true, sm: false }}
            sx={{ minWidth: { xs: 'auto', sm: '140px' } }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {/* Notification Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <NotificationsIcon />
              <Typography variant="h6" fontWeight={600}>
                Notification Preferences
              </Typography>
            </Box>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Email Notifications
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-email"
                          checked={settings.notifications.email}
                          onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                        />
                      }
                      label="Enable email notifications"
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-new-inquiries"
                          checked={settings.notifications.newInquiries}
                          onChange={(e) => handleSettingChange('notifications', 'newInquiries', e.target.checked)}
                          disabled={!settings.notifications.email}
                        />
                      }
                      label="New buyer inquiries"
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-new-offers"
                          checked={settings.notifications.newOffers}
                          onChange={(e) => handleSettingChange('notifications', 'newOffers', e.target.checked)}
                          disabled={!settings.notifications.email}
                        />
                      }
                      label="New purchase offers"
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-payment-updates"
                          checked={settings.notifications.paymentUpdates}
                          onChange={(e) => handleSettingChange('notifications', 'paymentUpdates', e.target.checked)}
                          disabled={!settings.notifications.email}
                        />
                      }
                      label="Payment updates"
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Push Notifications
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-push"
                          checked={settings.notifications.push}
                          onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                        />
                      }
                      label="Enable push notifications"
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-review-replies"
                          checked={settings.notifications.reviewReplies}
                          onChange={(e) => handleSettingChange('notifications', 'reviewReplies', e.target.checked)}
                          disabled={!settings.notifications.push}
                        />
                      }
                      label="Review replies"
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
            {loading ? (
              <Typography variant="body2" color="text.secondary">Loading settings...</Typography>
            ) : null}
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <PrivacyIcon />
              <Typography variant="h6" fontWeight={600}>
                Privacy & Visibility
              </Typography>
            </Box>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Profile Visibility
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="privacy-show-profile"
                          checked={settings.privacy.showProfile}
                          onChange={(e) => handleSettingChange('privacy', 'showProfile', e.target.checked)}
                        />
                      }
                      label="Show profile publicly"
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="privacy-show-contact"
                          checked={settings.privacy.showContact}
                          onChange={(e) => handleSettingChange('privacy', 'showContact', e.target.checked)}
                        />
                      }
                      label="Show contact information"
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="privacy-show-listings"
                          checked={settings.privacy.showListings}
                          onChange={(e) => handleSettingChange('privacy', 'showListings', e.target.checked)}
                        />
                      }
                      label="Show listings publicly"
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Communication
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="privacy-allow-messages"
                          checked={settings.privacy.allowMessages}
                          onChange={(e) => handleSettingChange('privacy', 'allowMessages', e.target.checked)}
                        />
                      }
                      label="Allow buyer messages"
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <PaletteIcon />
              <Typography variant="h6" fontWeight={600}>
                Preferences
              </Typography>
            </Box>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    id="preferences-language"
                    value={settings.preferences.language}
                    label="Language"
                    onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    id="preferences-timezone"
                    value={settings.preferences.timezone}
                    label="Timezone"
                    onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                  >
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    id="preferences-currency"
                    value={settings.preferences.currency}
                    label="Currency"
                    onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="CAD">CAD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      id="preferences-auto-refresh"
                      checked={settings.preferences.autoRefresh}
                      onChange={(e) => handleSettingChange('preferences', 'autoRefresh', e.target.checked)}
                    />
                  }
                  label="Auto-refresh dashboard data"
                  sx={{ width: '100%' }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <PaletteIcon />
              <Typography variant="h6" fontWeight={600}>
                Appearance
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  id="appearance-dark-mode"
                  checked={mode === 'dark'}
                  onChange={toggleColorMode}
                />
              }
              label={`${mode === 'dark' ? 'Dark' : 'Light'} mode`}
              sx={{ width: '100%' }}
            />
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <WarningIcon color="error" />
              <Typography variant="h6" fontWeight={600} color="error">
                Danger Zone
              </Typography>
            </Box>
            <Alert severity="error" sx={{ mb: 3 }}>
              Once you delete your account, there is no going back. Please be certain.
            </Alert>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteAccount}
              fullWidth={{ xs: true, sm: false }}
              sx={{ minWidth: { xs: 'auto', sm: '140px' } }}
            >
              Delete Account
            </Button>
            
            {/* Debug: Show dialog state */}
            {process.env.NODE_ENV === 'development' && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Debug: Dialog open = {deleteDialog ? 'true' : 'false'} | Saving = {saving ? 'true' : 'false'}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              margin: { xs: 1, sm: 'auto' },
              maxHeight: { xs: 'calc(100vh - 16px)', sm: 'auto' },
              height: { xs: 'auto', sm: 'auto' },
              width: { xs: 'calc(100vw - 16px)', sm: 'auto' },
              maxWidth: { xs: 'calc(100vw - 16px)', sm: '600px' },
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <DialogTitle sx={{ color: 'error.main', flexShrink: 0 }}>
            Delete Account
          </DialogTitle>
          <DialogContent sx={{ 
            flex: 1,
            overflow: 'auto',
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 2 }
          }}>
            <Typography variant="body1" paragraph>
              Are you absolutely sure you want to delete your account? This action cannot be undone.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This will permanently delete:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• All your car listings" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Your profile and business information" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• All transaction history" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Customer reviews and ratings" />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions sx={{ 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 1 },
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2 },
            flexShrink: 0,
            // Ensure buttons are always visible
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            mt: 'auto',
            minHeight: '120px', // Ensure enough space for both buttons
            alignItems: 'stretch'
          }}>
            <Button 
              onClick={() => setDeleteDialog(false)}
              fullWidth={{ xs: true, sm: false }}
              variant="outlined"
              size="large"
              sx={{ 
                minHeight: '48px',
                fontSize: '16px',
                order: { xs: 2, sm: 1 }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDeleteAccount}
              disabled={saving}
              fullWidth={{ xs: true, sm: false }}
              size="large"
              sx={{ 
                minHeight: '48px',
                fontSize: '16px',
                order: { xs: 1, sm: 2 }
              }}
            >
              {saving ? 'Deleting...' : 'Yes, Delete Account'}
            </Button>
            
            {/* Debug: Show button count */}
            {process.env.NODE_ENV === 'development' && (
              <Typography variant="caption" color="text.secondary" sx={{ 
                textAlign: 'center', 
                width: '100%', 
                mt: 1,
                order: 3
              }}>
                Debug: 2 buttons should be visible above
              </Typography>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerSettings;
