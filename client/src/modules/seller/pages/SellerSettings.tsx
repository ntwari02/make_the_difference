import React, { useState } from 'react';
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
    setSaving(true);
    // In a real app, this would save to API
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  const handleDeleteAccount = () => {
    setDeleteDialog(true);
  };

  const confirmDeleteAccount = () => {
    // In a real app, this would delete the account via API
    console.log('Account deletion requested');
    setDeleteDialog(false);
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
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Email Notifications
                </Typography>
                <List dense>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
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
                          checked={settings.notifications.paymentUpdates}
                          onChange={(e) => handleSettingChange('notifications', 'paymentUpdates', e.target.checked)}
                          disabled={!settings.notifications.email}
                        />
                      }
                      label="Payment updates"
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Push Notifications
                </Typography>
                <List dense>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
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
                          checked={settings.notifications.reviewReplies}
                          onChange={(e) => handleSettingChange('notifications', 'reviewReplies', e.target.checked)}
                          disabled={!settings.notifications.push}
                        />
                      }
                      label="Review replies"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Profile Visibility
                </Typography>
                <List dense>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
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
                          checked={settings.privacy.showListings}
                          onChange={(e) => handleSettingChange('privacy', 'showListings', e.target.checked)}
                        />
                      }
                      label="Show listings publicly"
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Communication
                </Typography>
                <List dense>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.privacy.allowMessages}
                          onChange={(e) => handleSettingChange('privacy', 'allowMessages', e.target.checked)}
                        />
                      }
                      label="Allow buyer messages"
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
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

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
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

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
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
                      checked={settings.preferences.autoRefresh}
                      onChange={(e) => handleSettingChange('preferences', 'autoRefresh', e.target.checked)}
                    />
                  }
                  label="Auto-refresh dashboard data"
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
                  checked={mode === 'dark'}
                  onChange={toggleColorMode}
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
            >
              Yes, Delete Account
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerSettings;
