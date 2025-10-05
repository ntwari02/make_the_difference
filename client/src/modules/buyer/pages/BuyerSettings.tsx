import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  RadioGroup,
  Radio,
} from '@mui/material';
import BuyerLayout from '../components/layout/BuyerLayout';

const BuyerSettings: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [priceAlerts, setPriceAlerts] = React.useState(true);
  const [marketingEmails, setMarketingEmails] = React.useState(false);
  const [pushAlerts, setPushAlerts] = React.useState(true);

  const [location, setLocation] = React.useState('');
  const [themePref, setThemePref] = React.useState<'system' | 'light' | 'dark'>('system');

  const sessions = [
    { id: 's1', device: 'Windows Chrome', location: 'Austin, US', lastActive: 'Just now' },
    { id: 's2', device: 'iPhone Safari', location: 'Miami, US', lastActive: '2 days ago' },
  ];

  return (
    <BuyerLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3, p: 3, borderRadius: 2, background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h4" fontWeight={800}>Settings</Typography>
          <Typography variant="body2" color="text.secondary">Control notifications, privacy, security, and preferences</Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Left column */}
          <Grid item xs={12} md={6}>
            {/* Notifications */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Notifications</Typography>
                <FormControlLabel control={<Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />} label="Email notifications" />
                <FormControlLabel control={<Switch checked={pushAlerts} onChange={(e) => setPushAlerts(e.target.checked)} />} label="Push notifications" />
                <FormControlLabel control={<Switch checked={priceAlerts} onChange={(e) => setPriceAlerts(e.target.checked)} />} label="Price drop alerts" />
                <FormControlLabel control={<Switch checked={marketingEmails} onChange={(e) => setMarketingEmails(e.target.checked)} />} label="Marketing emails" />
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Favorites" variant="outlined" />
                  <Chip label="New listings" variant="outlined" />
                  <Chip label="Price changes" variant="outlined" />
                  <Chip label="Dealer replies" variant="outlined" />
                </Box>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Privacy</Typography>
                <FormControlLabel control={<Switch defaultChecked />} label="Show profile to dealers" />
                <FormControlLabel control={<Switch />} label="Allow messages from all dealers" />
                <FormControlLabel control={<Switch defaultChecked />} label="Share approximate location" />
                <Divider sx={{ my: 1.5 }} />
                <Button variant="outlined">Export My Data</Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: 'error.main' }}>Danger Zone</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Deleting your account is irreversible. Your data will be permanently removed.</Typography>
                <Button variant="outlined" color="error" sx={{ mr: 1 }}>Deactivate Account</Button>
                <Button variant="contained" color="error">Delete Account</Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Right column */}
          <Grid item xs={12} md={6}>
            {/* Preferences */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Preferences</Typography>
                <TextField fullWidth label="Preferred Location" value={location} onChange={(e) => setLocation(e.target.value)} sx={{ mb: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Theme</Typography>
                <RadioGroup row value={themePref} onChange={(e) => setThemePref(e.target.value as any)}>
                  <FormControlLabel value="system" control={<Radio />} label="System" />
                  <FormControlLabel value="light" control={<Radio />} label="Light" />
                  <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                </RadioGroup>
                <Divider sx={{ my: 1.5 }} />
                <Button variant="contained">Save Preferences</Button>
              </CardContent>
            </Card>

            {/* Security */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Security</Typography>
                <FormControlLabel control={<Switch />} label="Two-factor authentication (2FA)" />
                <Divider sx={{ my: 1.5 }} />
                <Button variant="outlined" sx={{ mr: 1 }}>Change Password</Button>
                <Button variant="outlined">Setup 2FA</Button>
              </CardContent>
            </Card>

            {/* Sessions */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Active Sessions</Typography>
                <List>
                  {sessions.map((s) => (
                    <ListItem key={s.id} divider>
                      <ListItemText primary={`${s.device} · ${s.location}`} secondary={`Last active: ${s.lastActive}`} />
                      <Button size="small">Sign out</Button>
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 1.5 }} />
                <Button variant="outlined">Sign out of all devices</Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </BuyerLayout>
  );
};

export default BuyerSettings;


