import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  useTheme,
} from '@mui/material';
import {
  Settings,
  Security,
  Notifications,
  Payment,
  Hub as Integration,
  Storage,
  CloudQueue as CloudSync,
  Backup,
  Shield,
  Key,
  Email,
  Sms,
  Webhook,
  Api,
  Storage as Database,
  Computer as Server,
  Edit,
  Delete,
  Add,
  Save,
  Refresh,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ComprehensiveSystemSettings: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');

  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Universal Platform',
    siteDescription: 'Comprehensive learning and marketplace platform',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    defaultUserRole: 'student',
    maxFileUploadSize: 50,
    sessionTimeout: 30,
    enableAnalytics: true,
    enableCaching: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    enableCaptcha: true,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    sslEnabled: true,
    encryptionLevel: 'AES-256',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    webhookNotifications: true,
    adminAlerts: true,
    userWelcomeEmail: true,
    paymentNotifications: true,
    systemAlerts: true,
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    stripeEnabled: true,
    paypalEnabled: true,
    googleAuthEnabled: true,
    facebookAuthEnabled: false,
    awsS3Enabled: true,
    cloudflareEnabled: true,
    analyticsEnabled: true,
    chatbotEnabled: true,
  });

  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Stripe API Key', key: 'sk_test_***************', status: 'active', lastUsed: '2024-01-22' },
    { id: 2, name: 'PayPal Client ID', key: 'AX***************', status: 'active', lastUsed: '2024-01-21' },
    { id: 3, name: 'AWS Access Key', key: 'AKIA***************', status: 'active', lastUsed: '2024-01-22' },
    { id: 4, name: 'Google OAuth', key: 'ya29***************', status: 'inactive', lastUsed: '2024-01-15' },
  ]);

  const [systemHealth, setSystemHealth] = useState({
    database: { status: 'healthy', responseTime: 45, connections: 25 },
    cache: { status: 'healthy', hitRate: 89.5, memory: 2.1 },
    storage: { status: 'warning', usage: 78.5, available: 450 },
    api: { status: 'healthy', requests: 15420, errors: 12 },
  });

  const handleSaveSettings = (settingsType: string) => {
    setSnackbar({
      open: true,
      message: `${settingsType} settings saved successfully`,
      severity: 'success'
    });
  };

  const handleAddApiKey = () => {
    setDialogType('apiKey');
    setIsDialogOpen(true);
  };

  const handleDeleteApiKey = (id: number) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
    setSnackbar({ open: true, message: 'API key deleted', severity: 'success' });
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <CheckCircle />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure system-wide settings, security, and integrations
          </Typography>
        </Box>
      </motion.div>

      {/* System Health Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.entries(systemHealth).map(([service, health], index) => (
            <Grid item xs={12} sm={6} md={3} key={service}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: `${getHealthColor(health.status)}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: getHealthColor(health.status),
                        }}
                      >
                        {getHealthIcon(health.status)}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                          {service}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable">
              <Tab icon={<Settings />} label="General" />
              <Tab icon={<Security />} label="Security" />
              <Tab icon={<Notifications />} label="Notifications" />
              <Tab icon={<Integration />} label="Integrations" />
              <Tab icon={<Api />} label="API Keys" />
              <Tab icon={<Server />} label="System Health" />
            </Tabs>
          </Box>

          <CardContent>
            {/* General Settings */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  General Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Site Name"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Site Description"
                      multiline
                      rows={3}
                      value={generalSettings.siteDescription}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Default User Role</InputLabel>
                      <Select
                        value={generalSettings.defaultUserRole}
                        label="Default User Role"
                        onChange={(e) => setGeneralSettings({ ...generalSettings, defaultUserRole: e.target.value })}
                      >
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="instructor">Instructor</MenuItem>
                        <MenuItem value="buyer">Buyer</MenuItem>
                        <MenuItem value="seller">Seller</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      System Configuration
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={generalSettings.maintenanceMode}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                          />
                        }
                        label="Maintenance Mode"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={generalSettings.registrationEnabled}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, registrationEnabled: e.target.checked })}
                          />
                        }
                        label="User Registration Enabled"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={generalSettings.emailVerificationRequired}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, emailVerificationRequired: e.target.checked })}
                          />
                        }
                        label="Email Verification Required"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={generalSettings.enableAnalytics}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, enableAnalytics: e.target.checked })}
                          />
                        }
                        label="Enable Analytics"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={generalSettings.enableCaching}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, enableCaching: e.target.checked })}
                          />
                        }
                        label="Enable Caching"
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={() => handleSaveSettings('General')}
                    >
                      Save General Settings
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Security Settings */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Security Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Authentication
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.twoFactorAuth}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                          />
                        }
                        label="Two-Factor Authentication"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.enableCaptcha}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, enableCaptcha: e.target.checked })}
                          />
                        }
                        label="Enable CAPTCHA"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.sslEnabled}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, sslEnabled: e.target.checked })}
                          />
                        }
                        label="SSL/TLS Enabled"
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Password Policy
                    </Typography>
                    <TextField
                      fullWidth
                      label="Minimum Password Length"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Max Login Attempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Lockout Duration (minutes)"
                      type="number"
                      value={securitySettings.lockoutDuration}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, lockoutDuration: parseInt(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={() => handleSaveSettings('Security')}
                    >
                      Save Security Settings
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Notification Settings */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Notification Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      User Notifications
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                          />
                        }
                        label="Email Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.smsNotifications}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                          />
                        }
                        label="SMS Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                          />
                        }
                        label="Push Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.userWelcomeEmail}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, userWelcomeEmail: e.target.checked })}
                          />
                        }
                        label="Welcome Email"
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      System Notifications
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.adminAlerts}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, adminAlerts: e.target.checked })}
                          />
                        }
                        label="Admin Alerts"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.systemAlerts}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, systemAlerts: e.target.checked })}
                          />
                        }
                        label="System Alerts"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.paymentNotifications}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, paymentNotifications: e.target.checked })}
                          />
                        }
                        label="Payment Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.webhookNotifications}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, webhookNotifications: e.target.checked })}
                          />
                        }
                        label="Webhook Notifications"
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={() => handleSaveSettings('Notification')}
                    >
                      Save Notification Settings
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Integration Settings */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Third-Party Integrations
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Payment Gateways
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={integrationSettings.stripeEnabled}
                            onChange={(e) => setIntegrationSettings({ ...integrationSettings, stripeEnabled: e.target.checked })}
                          />
                        }
                        label="Stripe"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={integrationSettings.paypalEnabled}
                            onChange={(e) => setIntegrationSettings({ ...integrationSettings, paypalEnabled: e.target.checked })}
                          />
                        }
                        label="PayPal"
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Authentication Providers
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={integrationSettings.googleAuthEnabled}
                            onChange={(e) => setIntegrationSettings({ ...integrationSettings, googleAuthEnabled: e.target.checked })}
                          />
                        }
                        label="Google OAuth"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={integrationSettings.facebookAuthEnabled}
                            onChange={(e) => setIntegrationSettings({ ...integrationSettings, facebookAuthEnabled: e.target.checked })}
                          />
                        }
                        label="Facebook Login"
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Cloud Services
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={integrationSettings.awsS3Enabled}
                            onChange={(e) => setIntegrationSettings({ ...integrationSettings, awsS3Enabled: e.target.checked })}
                          />
                        }
                        label="AWS S3"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={integrationSettings.cloudflareEnabled}
                            onChange={(e) => setIntegrationSettings({ ...integrationSettings, cloudflareEnabled: e.target.checked })}
                          />
                        }
                        label="Cloudflare"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={integrationSettings.analyticsEnabled}
                            onChange={(e) => setIntegrationSettings({ ...integrationSettings, analyticsEnabled: e.target.checked })}
                          />
                        }
                        label="Google Analytics"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={integrationSettings.chatbotEnabled}
                            onChange={(e) => setIntegrationSettings({ ...integrationSettings, chatbotEnabled: e.target.checked })}
                          />
                        }
                        label="AI Chatbot"
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={() => handleSaveSettings('Integration')}
                    >
                      Save Integration Settings
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* API Keys */}
            {activeTab === 4 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    API Keys Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddApiKey}
                  >
                    Add API Key
                  </Button>
                </Box>
                <Paper variant="outlined">
                  <List>
                    {apiKeys.map((apiKey, index) => (
                      <motion.div
                        key={apiKey.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ListItem>
                          <ListItemText
                            primary={apiKey.name}
                            secondary={
                              <Box>
                                <Typography variant="body2" component="span">
                                  {apiKey.key}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                  Last used: {apiKey.lastUsed}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={apiKey.status}
                                size="small"
                                color={apiKey.status === 'active' ? 'success' : 'default'}
                              />
                              <IconButton size="small">
                                <Edit />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteApiKey(apiKey.id)}>
                                <Delete />
                              </IconButton>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < apiKeys.length - 1 && <Divider />}
                      </motion.div>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}

            {/* System Health */}
            {activeTab === 5 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    System Health Monitor
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => setSnackbar({ open: true, message: 'System health refreshed', severity: 'info' })}
                  >
                    Refresh
                  </Button>
                </Box>
                <Grid container spacing={3}>
                  {Object.entries(systemHealth).map(([service, health]) => (
                    <Grid item xs={12} md={6} key={service}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            {getHealthIcon(health.status)}
                            <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                              {service}
                            </Typography>
                            <Chip
                              label={health.status}
                              size="small"
                              color={health.status === 'healthy' ? 'success' : health.status === 'warning' ? 'warning' : 'error'}
                            />
                          </Box>
                          <Grid container spacing={2}>
                            {Object.entries(health).filter(([key]) => key !== 'status').map(([key, value]) => (
                              <Grid item xs={6} key={key}>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {typeof value === 'number' ? 
                                    (key.includes('Time') ? `${value}ms` :
                                     key.includes('Rate') || key.includes('usage') ? `${value}%` :
                                     key.includes('memory') ? `${value}GB` :
                                     key.includes('available') ? `${value}GB` : value) 
                                    : value}
                                </Typography>
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ComprehensiveSystemSettings;
