import React, { useState } from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as ThemeIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Key as KeyIcon,
  Shield as ShieldIcon,
  Email as EmailIcon,
  Smartphone as PhoneIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DealerLayout from '../components/layout/DealerLayout';
import toast from 'react-hot-toast';

const DealerSettings: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State for settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [reviewNotifications, setReviewNotifications] = useState(true);
  const [salesNotifications, setSalesNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC-8');
  const [currency, setCurrency] = useState('USD');
  
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  const handleChangePassword = () => {
    toast.success('Password changed successfully!');
    setChangePasswordOpen(false);
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires confirmation via email');
    setDeleteAccountOpen(false);
  };

  return (
    <DealerLayout>
      <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account preferences and configurations
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Account Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <InfoIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Account Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your account details
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ width: 80, height: 80 }}>JD</Avatar>
                  <Box>
                    <Button variant="outlined" startIcon={<UploadIcon />} size="small">
                      Upload Photo
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      JPG, PNG (max 2MB)
                    </Typography>
                  </Box>
                </Box>

                <TextField
                  fullWidth
                  label="Full Name"
                  defaultValue="John Doe"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  defaultValue="john.doe@dealership.com"
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <Chip label="Verified" size="small" color="success" />
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  defaultValue="+1 (555) 123-4567"
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  }}
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#06b6d4', width: 48, height: 48 }}>
                    <NotificationIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage notification preferences
                    </Typography>
                  </Box>
                </Box>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive notifications via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />

                  <ListItem>
                    <ListItemText
                      primary="Push Notifications"
                      secondary="Receive push notifications on your device"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />

                  <ListItem>
                    <ListItemText
                      primary="New Messages"
                      secondary="Notify when you receive new messages"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={messageNotifications}
                        onChange={(e) => setMessageNotifications(e.target.checked)}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />

                  <ListItem>
                    <ListItemText
                      primary="New Reviews"
                      secondary="Notify when customers leave reviews"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={reviewNotifications}
                        onChange={(e) => setReviewNotifications(e.target.checked)}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />

                  <ListItem>
                    <ListItemText
                      primary="Sales Updates"
                      secondary="Notify about sales and transactions"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={salesNotifications}
                        onChange={(e) => setSalesNotifications(e.target.checked)}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#14b8a6', width: 48, height: 48 }}>
                    <SecurityIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Security
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage your security settings
                    </Typography>
                  </Box>
                </Box>

                <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" fontWeight={600} gutterBottom>
                        Password
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last changed 3 months ago
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<KeyIcon />}
                      onClick={() => setChangePasswordOpen(true)}
                    >
                      Change
                    </Button>
                  </Box>
                </Paper>

                <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={600} gutterBottom>
                        Two-Factor Authentication
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add an extra layer of security to your account
                      </Typography>
                    </Box>
                    <Switch
                      checked={twoFactorEnabled}
                      onChange={(e) => {
                        setTwoFactorEnabled(e.target.checked);
                        toast.info(
                          e.target.checked ? '2FA enabled' : '2FA disabled'
                        );
                      }}
                      color="primary"
                    />
                  </Box>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    Active Sessions
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Current Device"
                        secondary="Chrome on Windows • Los Angeles, CA"
                      />
                      <Chip label="Active" size="small" color="success" />
                    </ListItem>
                  </List>
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          {/* Preferences */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}>
                    <LanguageIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Preferences
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customize your experience
                    </Typography>
                  </Box>
                </Box>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={language}
                    label="Language"
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="fr">Français</MenuItem>
                    <MenuItem value="de">Deutsch</MenuItem>
                    <MenuItem value="zh">中文</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={timezone}
                    label="Timezone"
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <MenuItem value="UTC-8">Pacific Time (UTC-8)</MenuItem>
                    <MenuItem value="UTC-7">Mountain Time (UTC-7)</MenuItem>
                    <MenuItem value="UTC-6">Central Time (UTC-6)</MenuItem>
                    <MenuItem value="UTC-5">Eastern Time (UTC-5)</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={currency}
                    label="Currency"
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="CAD">CAD ($)</MenuItem>
                    <MenuItem value="AUD">AUD ($)</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label="Show profile to customers"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Subscription */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#fbbf24', width: 48, height: 48 }}>
                    <ShieldIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Subscription
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage your subscription plan
                    </Typography>
                  </Box>
                </Box>

                <Paper
                  sx={{
                    p: 3,
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
                    border: `2px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        Premium Plan
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unlimited listings & premium features
                      </Typography>
                    </Box>
                    <Chip label="Active" color="success" />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                    $99/month
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next billing date: November 1, 2024
                  </Typography>
                </Paper>

                <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                  Change Plan
                </Button>
                <Button variant="outlined" fullWidth color="error">
                  Cancel Subscription
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Help & Support */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#8b5cf6', width: 48, height: 48 }}>
                    <HelpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Help & Support
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get help when you need it
                    </Typography>
                  </Box>
                </Box>

                <List>
                  <ListItem button onClick={() => toast.info('Opening documentation')}>
                    <ListItemText
                      primary="Documentation"
                      secondary="Browse our help articles and guides"
                    />
                  </ListItem>
                  <Divider />

                  <ListItem button onClick={() => toast.info('Opening support chat')}>
                    <ListItemText
                      primary="Contact Support"
                      secondary="Get help from our support team"
                    />
                  </ListItem>
                  <Divider />

                  <ListItem button onClick={() => toast.info('Opening FAQ')}>
                    <ListItemText
                      primary="FAQ"
                      secondary="Find answers to common questions"
                    />
                  </ListItem>
                  <Divider />

                  <ListItem button onClick={() => toast.info('Opening API docs')}>
                    <ListItemText
                      primary="API Documentation"
                      secondary="Integrate with our platform"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Danger Zone */}
          <Grid item xs={12}>
            <Card sx={{ borderColor: 'error.main', borderWidth: 2, borderStyle: 'solid' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} color="error" gutterBottom>
                  Danger Zone
                </Typography>
                <Alert severity="error" sx={{ mb: 2 }}>
                  These actions are permanent and cannot be undone. Please proceed with caution.
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => toast.warning('Data export initiated')}
                  >
                    Export All Data
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteAccountOpen(true)}
                  >
                    Delete Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Change Password Dialog */}
        <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              sx={{ mt: 2, mb: 2 }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              sx={{ mb: 2 }}
            />
            <Alert severity="info" sx={{ mt: 1 }}>
              Password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                This action is permanent and cannot be undone!
              </Typography>
              <Typography variant="body2">
                All your data, including vehicles, messages, and transaction history will be permanently deleted.
              </Typography>
            </Alert>
            <TextField
              fullWidth
              label="Type 'DELETE' to confirm"
              placeholder="DELETE"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteAccountOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteAccount}>
              Delete My Account
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DealerLayout>
  );
};

export default DealerSettings;

