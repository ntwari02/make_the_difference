import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  Avatar,
  Button,
  TextField,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import BuyerLayout from '../components/layout/BuyerLayout';

const BuyerProfile: React.FC = () => {
  const [name, setName] = React.useState('Buyer User');
  const [email, setEmail] = React.useState('buyer@example.com');
  const [phone, setPhone] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [bio, setBio] = React.useState('Car enthusiast exploring the best deals.');

  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [priceAlerts, setPriceAlerts] = React.useState(true);

  return (
    <BuyerLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3, p: 3, borderRadius: 2, background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h4" fontWeight={800}>My Profile</Typography>
          <Typography variant="body2" color="text.secondary">Manage your personal information, security, and preferences</Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Left column - Avatar and quick stats */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                <Avatar sx={{ width: 96, height: 96 }}>B</Avatar>
                <Typography variant="h6" fontWeight={700}>{name}</Typography>
                <Typography variant="body2" color="text.secondary">{email}</Typography>
                <Button variant="outlined">Change Avatar</Button>
                <Divider sx={{ width: '100%', my: 1.5 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip label="12 Favorites" color="primary" variant="outlined" />
                  <Chip label="8 Viewed" variant="outlined" />
                  <Chip label="3 Saved Searches" variant="outlined" />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Notifications</Typography>
                <FormControlLabel control={<Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />} label="Email notifications" />
                <FormControlLabel control={<Switch checked={priceAlerts} onChange={(e) => setPriceAlerts(e.target.checked)} />} label="Price drop alerts" />
              </CardContent>
            </Card>
          </Grid>

          {/* Right column - Forms */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Personal Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Bio" multiline rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained">Save Changes</Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Security</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth type="password" label="Current Password" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth type="password" label="New Password" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth type="password" label="Confirm New Password" />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="outlined">Update Password</Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Preferences</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Preferred Make" placeholder="e.g., Tesla, Toyota" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Preferred Body Type" placeholder="e.g., Sedan, SUV" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Max Budget ($)" placeholder="e.g., 40000" />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="outlined">Save Preferences</Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </BuyerLayout>
  );
};

export default BuyerProfile;


