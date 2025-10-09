import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  GridLegacy as Grid,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import { Edit, Save, RefreshCw as RefreshIcon } from 'lucide-react';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorSettings: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [savedOpen, setSavedOpen] = React.useState(false);

  // Profile
  const [displayName, setDisplayName] = React.useState('John Doe');
  const [headline, setHeadline] = React.useState('Senior Instructor');
  const [bio, setBio] = React.useState('Educator with 10+ years experience.');
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(undefined);

  // Notifications
  const [emailAnnouncements, setEmailAnnouncements] = React.useState(true);
  const [emailReminders, setEmailReminders] = React.useState(true);
  const [pushMessages, setPushMessages] = React.useState(false);

  // Preferences
  const [timezone, setTimezone] = React.useState('UTC');
  const [dateFormat, setDateFormat] = React.useState('YYYY-MM-DD');
  const [theme, setTheme] = React.useState<'system' | 'light' | 'dark'>('system');

  // Security
  const [twoFactor, setTwoFactor] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  // Integrations
  const [apiKey, setApiKey] = React.useState<string>('sk_live_xxxxx-xxxx');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API save
      await new Promise((r) => setTimeout(r, 600));
      setSavedOpen(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <InstructorLayout>
      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h5" fontWeight={700}>Settings</Typography>
          <Typography variant="body2" color="text.secondary">Manage your profile, notifications, preferences and security</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Button variant="outlined" startIcon={<RefreshIcon size={16} />} disabled={saving} onClick={() => window.location.reload()}>Reset</Button>
          <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pt: 1, pb: 0 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
            <Tab label="Profile" />
            <Tab label="Notifications" />
            <Tab label="Preferences" />
            <Tab label="Security" />
            <Tab label="Integrations" />
            <Tab label="Danger Zone" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Profile */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={avatarUrl} sx={{ width: 72, height: 72 }} />
                  <Box>
                    <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                    <label htmlFor="avatar-upload">
                      <Button component="span" size="small" variant="outlined" startIcon={<Edit size={14} />}>Change Avatar</Button>
                    </label>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Bio" multiline minRows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {tab === 1 && (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel control={<Switch checked={emailAnnouncements} onChange={(e) => setEmailAnnouncements(e.target.checked)} />} label="Email announcements" />
                <Typography variant="body2" color="text.secondary">Receive platform news and updates</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel control={<Switch checked={emailReminders} onChange={(e) => setEmailReminders(e.target.checked)} />} label="Email reminders" />
                <Typography variant="body2" color="text.secondary">Get reminders for upcoming sessions</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel control={<Switch checked={pushMessages} onChange={(e) => setPushMessages(e.target.checked)} />} label="Push messages" />
                <Typography variant="body2" color="text.secondary">Enable in-app notifications</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Preferences */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value as string)}>
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">America/New_York</MenuItem>
                    <MenuItem value="Europe/London">Europe/London</MenuItem>
                    <MenuItem value="Asia/Dubai">Asia/Dubai</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select label="Date Format" value={dateFormat} onChange={(e) => setDateFormat(e.target.value as string)}>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select label="Theme" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Security */}
      {tab === 3 && (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} />} label="Two-factor authentication" />
                <Typography variant="body2" color="text.secondary">Add an extra layer of security to your account</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="password" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}>Update Password</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Integrations */}
      {tab === 4 && (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField fullWidth label="API Key" value={apiKey} type="password" onChange={(e) => setApiKey(e.target.value)} />
                <Typography variant="caption" color="text.secondary">Use this key to access the API. Keep it secret.</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" gap={1}>
                  <Button variant="outlined" onClick={() => setApiKey('sk_live_' + Math.random().toString(36).slice(2))}>Regenerate</Button>
                  <Button variant="outlined">Connect Calendar</Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      {tab === 5 && (
        <Card>
          <CardContent>
            <Typography variant="h6" color="error" gutterBottom>Danger Zone</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>Actions in this area are irreversible. Proceed with caution.</Typography>
            <Divider sx={{ my: 2 }} />
            <Button variant="outlined" color="error">Delete Account</Button>
          </CardContent>
        </Card>
      )}

      <Snackbar open={savedOpen} autoHideDuration={2000} onClose={() => setSavedOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSavedOpen(false)} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully
        </Alert>
      </Snackbar>
    </InstructorLayout>
  );
};

export default InstructorSettings;


