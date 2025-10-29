import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
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
  Stack,
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
import toast from 'react-hot-toast';

const SellerSettings: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.seller.profile);
  const { mode, toggleColorMode, setMode } = useThemeMode();

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
      theme: 'light',
    },
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await sellerApi.settings.getSettings();
        if (!mounted) return;
        const loadedSettings = {
          notifications: {
            email: !!data?.notifications?.email,
            push: !!data?.notifications?.push,
            sms: !!data?.notifications?.sms,
            newInquiries: !!data?.notifications?.newInquiries,
            newOffers: !!data?.notifications?.newOffers,
            paymentUpdates: !!data?.notifications?.paymentUpdates,
            reviewReplies: !!data?.notifications?.reviewReplies,
          },
          privacy: {
            showProfile: data?.privacy?.showProfile !== false,
            showContact: !!data?.privacy?.showContact,
            showListings: data?.privacy?.showListings !== false,
            allowMessages: data?.privacy?.allowMessages !== false,
          },
          preferences: {
            language: data?.preferences?.language || 'en',
            timezone: data?.preferences?.timezone || 'America/New_York',
            currency: data?.preferences?.currency || 'USD',
            autoRefresh: data?.preferences?.autoRefresh !== false,
            theme: data?.preferences?.theme || 'light',
          },
        };
        setSettings(loadedSettings);
        if (data?.preferences?.theme && setMode) {
          setMode(data.preferences.theme as 'light' | 'dark');
        }
      } catch (_) {
        // best-effort: keep defaults
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [setMode]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Include current theme mode in settings
      const settingsToSave = {
        ...settings,
        preferences: {
          ...settings.preferences,
          theme: mode, // Save current theme mode
        },
      };
      await sellerApi.settings.updateSettings(settingsToSave);
      toast.success('Settings saved');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteDialog(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setSaving(true);
      await sellerApi.settings.deleteAccount();
      toast.success('Account deleted successfully');
      // Redirect to home/login after successful deletion
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete account');
      setSaving(false);
      setDeleteDialog(false);
    }
  };

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Settings
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : (loading ? 'Loading…' : 'Save Changes')}
          </Button>
        </Box>

        {/* Notification Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <NotificationsIcon />
              <Typography variant="h6" fontWeight={600}>
                Notification Preferences
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Email Notifications
                </Typography>
                <List dense>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-email"
                          name="notifications.email"
                          checked={settings.notifications.email}
                          onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                        />
                      }
                      label="Enable email notifications"
                    />
                  </ListItem>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-new-inquiries"
                          name="notifications.newInquiries"
                          checked={settings.notifications.newInquiries}
                          onChange={(e) => handleSettingChange('notifications', 'newInquiries', e.target.checked)}
                          disabled={!settings.notifications.email}
                        />
                      }
                      label="New buyer inquiries"
                    />
                  </ListItem>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-new-offers"
                          name="notifications.newOffers"
                          checked={settings.notifications.newOffers}
                          onChange={(e) => handleSettingChange('notifications', 'newOffers', e.target.checked)}
                          disabled={!settings.notifications.email}
                        />
                      }
                      label="New purchase offers"
                    />
                  </ListItem>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-payment-updates"
                          name="notifications.paymentUpdates"
                          checked={settings.notifications.paymentUpdates}
                          onChange={(e) => handleSettingChange('notifications', 'paymentUpdates', e.target.checked)}
                          disabled={!settings.notifications.email}
                        />
                      }
                      label="Payment updates"
                    />
                  </ListItem>
                </List>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Push Notifications
                </Typography>
                <List dense>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-push"
                          name="notifications.push"
                          checked={settings.notifications.push}
                          onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                        />
                      }
                      label="Enable push notifications"
                    />
                  </ListItem>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-review-replies"
                          name="notifications.reviewReplies"
                          checked={settings.notifications.reviewReplies}
                          onChange={(e) => handleSettingChange('notifications', 'reviewReplies', e.target.checked)}
                          disabled={!settings.notifications.push}
                        />
                      }
                      label="Review replies"
                    />
                  </ListItem>
                </List>
                <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
                  SMS Notifications
                </Typography>
                <List dense>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          id="notifications-sms"
                          name="notifications.sms"
                          checked={settings.notifications.sms}
                          onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                        />
                      }
                      label="Enable SMS notifications"
                    />
                  </ListItem>
                </List>
              </Box>
            </Stack>
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
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Profile Visibility
                </Typography>
                <List dense>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          id="privacy-show-profile"
                          name="privacy.showProfile"
                          checked={settings.privacy.showProfile}
                          onChange={(e) => handleSettingChange('privacy', 'showProfile', e.target.checked)}
                        />
                      }
                      label="Show profile publicly"
                    />
                  </ListItem>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          id="privacy-show-contact"
                          name="privacy.showContact"
                          checked={settings.privacy.showContact}
                          onChange={(e) => handleSettingChange('privacy', 'showContact', e.target.checked)}
                        />
                      }
                      label="Show contact information"
                    />
                  </ListItem>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          id="privacy-show-listings"
                          name="privacy.showListings"
                          checked={settings.privacy.showListings}
                          onChange={(e) => handleSettingChange('privacy', 'showListings', e.target.checked)}
                        />
                      }
                      label="Show listings publicly"
                    />
                  </ListItem>
                </List>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Communication
                </Typography>
                <List dense>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          id="privacy-allow-messages"
                          name="privacy.allowMessages"
                          checked={settings.privacy.allowMessages}
                          onChange={(e) => handleSettingChange('privacy', 'allowMessages', e.target.checked)}
                        />
                      }
                      label="Allow buyer messages"
                    />
                  </ListItem>
                </List>
              </Box>
            </Stack>
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
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel id="preferences-language-label">Language</InputLabel>
                  <Select
                    id="preferences-language"
                    name="preferences.language"
                    labelId="preferences-language-label"
                    aria-labelledby="preferences-language-label"
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
              </Box>

              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel id="preferences-timezone-label">Timezone</InputLabel>
                  <Select
                    id="preferences-timezone"
                    name="preferences.timezone"
                    labelId="preferences-timezone-label"
                    aria-labelledby="preferences-timezone-label"
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
              </Box>

              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel id="preferences-currency-label">Currency</InputLabel>
                  <Select
                    id="preferences-currency"
                    name="preferences.currency"
                    labelId="preferences-currency-label"
                    aria-labelledby="preferences-currency-label"
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
              </Box>
            </Stack>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    id="preferences-auto-refresh"
                    name="preferences.autoRefresh"
                    checked={settings.preferences.autoRefresh}
                    onChange={(e) => handleSettingChange('preferences', 'autoRefresh', e.target.checked)}
                  />
                }
                label="Auto-refresh dashboard data"
              />
            </Box>
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
                  id="preferences-theme"
                  name="preferences.theme"
                  checked={mode === 'dark'}
                  onChange={(e) => {
                    toggleColorMode();
                    // Update settings state immediately when theme changes
                    handleSettingChange('preferences', 'theme', e.target.checked ? 'dark' : 'light');
                  }}
                />
              }
              label={`${mode === 'dark' ? 'Dark' : 'Light'} mode`}
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
              disabled={saving || loading}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            Delete Account
          </DialogTitle>
          <DialogContent>
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
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDeleteAccount}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Yes, Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerSettings;
