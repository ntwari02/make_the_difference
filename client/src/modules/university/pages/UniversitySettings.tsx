import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Divider,
  Stack,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  RadioGroup,
  Radio,
  FormLabel,
  Checkbox,
  FormGroup,
  Paper,
  Tooltip,
  Badge,
  LinearProgress,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Autocomplete,
  InputAdornment,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
} from '@mui/material';
import {
  Settings,
  Person,
  Security,
  Notifications,
  Email,
  Phone,
  LocationOn,
  Language,
  Palette,
  CloudUpload,
  CloudDownload,
  Backup,
  Restore,
  Delete,
  Edit,
  Save,
  Cancel,
  Refresh,
  Download,
  Upload,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  Shield,
  VerifiedUser,
  Key,
  Fingerprint,
  Smartphone,
  Computer,
  Tablet,
  Watch,
  Wifi,
  Bluetooth,
  Storage,
  Database,
  Api,
  Webhook,
  Extension,
  Analytics,
  Assessment,
  TrendingUp,
  Insights,
  Report,
  FileDownload,
  FileUpload,
  Folder,
  FolderOpen,
  Archive,
  Unarchive,
  Schedule,
  CalendarToday,
  Time,
  Timer,
  Stopwatch,
  Alarm,
  Bell,
  NotificationsActive,
  NotificationsOff,
  VolumeUp,
  VolumeDown,
  VolumeOff,
  Mic,
  MicOff,
  Camera,
  CameraAlt,
  PhotoCamera,
  VideoCall,
  Call,
  Message,
  Chat,
  Forum,
  Group,
  Public,
  Private,
  Share,
  Link,
  Copy,
  QrCode,
  Code,
  Terminal,
  Build,
  Add,
  Remove,
  Check,
  Close,
  Warning,
  Error,
  Info,
  Help,
  Support,
  ContactSupport,
  LiveHelp,
  QuestionAnswer,
  TipsAndUpdates,
  Campaign,
  Announcement,
  PriorityHigh,
  Flag,
  Bookmark,
  Star,
  StarBorder,
  Favorite,
  FavoriteBorder,
  ThumbUp,
  ThumbDown,
  Feedback,
  RateReview,
  Reviews,
  Comment,
  ChatBubble,
  ChatBubbleOutline,
  Mail,
  Send,
  Reply,
  ReplyAll,
  Forward,
  Undo,
  Redo,
  Sync,
  Autorenew,
  Loop,
  Replay,
  Restart,
  Update,
  Upgrade,
  Install,
  Uninstall,
  Tune,
  Adjust,
  Configure,
  Customize,
  Personalize,
  Preferences,
  Options,
  MoreHoriz,
  MoreVert,
  Apps,
  GridView,
  ViewList,
  ViewModule,
  ViewComfy,
  ViewStream,
  ViewCarousel,
  ViewDay,
  ViewWeek,
  ViewMonth,
  ViewAgenda,
  ViewHeadline,
  ViewQuilt,
  ViewSidebar,
  ViewColumn,
  ViewArray,
  ViewTimeline,
  ViewKanban,
  ViewDashboard,
  Dashboard,
  Home,
  AccountCircle,
  Translate,
  GTranslate,
  Accessibility,
  AccessibilityNew,
  Hearing,
  HearingDisabled,
  RecordVoiceOver,
  VoiceOverOff,
  VolumeMute,
  MicNone,
  Headset,
  HeadsetMic,
  Headphones,
  Speaker,
  SpeakerGroup,
  SpeakerNotes,
  SpeakerNotesOff,
  Radio as RadioIcon,
  Tv,
  Laptop,
  PhoneAndroid,
  PhoneIphone,
  Devices,
  DeviceHub,
  Router,
  Memory,
  HardDrive,
  SdCard,
  Usb,
  SignalWifi4Bar,
  SignalWifiOff,
  SignalCellular4Bar,
  SignalCellularOff,
  BatteryFull,
  BatteryStd,
  BatteryAlert,
  BatteryUnknown,
  BatteryChargingFull,
  BatteryCharging20,
  BatteryCharging30,
  BatteryCharging50,
  BatteryCharging60,
  BatteryCharging80,
  BatteryCharging90,
  Power,
  PowerOff,
  PowerSettingsNew,
  PowerInput,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import UniversityLayout from '../components/layout/UniversityLayout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    aria-labelledby={`settings-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const UniversitySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);

  // Organization Settings
  const [orgSettings, setOrgSettings] = useState({
    name: 'University of Excellence',
    email: 'contact@university.edu',
    phone: '+1 (555) 123-4567',
    website: 'https://university.edu',
    address: '123 University Ave, City, State 12345',
    logo: '',
    description: 'A leading institution committed to academic excellence and student success.',
    founded: '1950',
    students: '15000',
    faculty: '1200',
    programs: '150',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    applicationUpdates: true,
    deadlineReminders: true,
    systemAlerts: true,
    marketingEmails: false,
    weeklyDigest: true,
    monthlyReport: true,
    emergencyAlerts: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    loginAlerts: true,
    ipWhitelist: '',
    allowedDevices: 5,
    biometricAuth: false,
    encryptionLevel: 'high',
  });

  // API Settings
  const [apiSettings, setApiSettings] = useState({
    apiKey: 'sk-...',
    webhookUrl: '',
    rateLimit: 1000,
    allowedOrigins: '',
    enableCors: true,
    enableWebhooks: false,
    logLevel: 'info',
  });

  // Analytics Settings
  const [analyticsSettings, setAnalyticsSettings] = useState({
    enableAnalytics: true,
    dataRetention: 365,
    anonymizeData: false,
    shareInsights: true,
    customMetrics: true,
    realTimeTracking: true,
    exportFormat: 'json',
    reportFrequency: 'monthly',
  });

  // Backup Settings
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: 30,
    cloudStorage: true,
    localBackup: false,
    encryption: true,
    compression: true,
  });

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbar({ open: true, message: `${section} settings saved successfully!`, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save settings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (section: string) => {
    setSnackbar({ open: true, message: `${section} settings reset to defaults`, severity: 'info' });
  };

  const handleExport = () => {
    setSnackbar({ open: true, message: 'Settings exported successfully!', severity: 'success' });
  };

  const handleImport = () => {
    setSnackbar({ open: true, message: 'Settings imported successfully!', severity: 'success' });
  };

  return (
    <UniversityLayout>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
              Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your university's configuration and preferences
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Export Settings">
              <IconButton onClick={handleExport}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Import Settings">
              <IconButton onClick={handleImport}>
                <Upload />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset to Defaults">
              <IconButton onClick={() => setShowDeleteDialog(true)}>
                <Restore />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Settings Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab icon={<Person />} label="Organization" />
              <Tab icon={<Notifications />} label="Notifications" />
              <Tab icon={<Security />} label="Security" />
              <Tab icon={<Api />} label="API & Integrations" />
              <Tab icon={<Analytics />} label="Analytics" />
              <Tab icon={<Backup />} label="Backup & Data" />
            </Tabs>
          </Box>

          {/* Organization Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Avatar sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Organization Profile
                    </Typography>
                    <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                      <Avatar
                        sx={{ width: 120, height: 120, mb: 2 }}
                        src={orgSettings.logo}
                      >
                        <Person sx={{ fontSize: 60 }} />
                      </Avatar>
                      <Button variant="outlined" startIcon={<CloudUpload />}>
                        Upload Logo
                      </Button>
      </Box>
                    <TextField
                      fullWidth
                      label="Organization Name"
                      value={orgSettings.name}
                      onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={orgSettings.description}
                      onChange={(e) => setOrgSettings({ ...orgSettings, description: e.target.value })}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
      <Card>
        <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Contact Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={orgSettings.email}
                          onChange={(e) => setOrgSettings({ ...orgSettings, email: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={orgSettings.phone}
                          onChange={(e) => setOrgSettings({ ...orgSettings, phone: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Website"
                          value={orgSettings.website}
                          onChange={(e) => setOrgSettings({ ...orgSettings, website: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          multiline
                          rows={2}
                          value={orgSettings.address}
                          onChange={(e) => setOrgSettings({ ...orgSettings, address: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                      University Statistics
                    </Typography>
            <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Founded"
                          value={orgSettings.founded}
                          onChange={(e) => setOrgSettings({ ...orgSettings, founded: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Students"
                          value={orgSettings.students}
                          onChange={(e) => setOrgSettings({ ...orgSettings, students: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Faculty"
                          value={orgSettings.faculty}
                          onChange={(e) => setOrgSettings({ ...orgSettings, faculty: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Programs"
                          value={orgSettings.programs}
                          onChange={(e) => setOrgSettings({ ...orgSettings, programs: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Email Notifications
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                          />
                        }
                        label="Enable Email Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.applicationUpdates}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, applicationUpdates: e.target.checked })}
                          />
                        }
                        label="Application Status Updates"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.deadlineReminders}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, deadlineReminders: e.target.checked })}
                          />
                        }
                        label="Deadline Reminders"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.weeklyDigest}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyDigest: e.target.checked })}
                          />
                        }
                        label="Weekly Digest"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.monthlyReport}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, monthlyReport: e.target.checked })}
                          />
                        }
                        label="Monthly Reports"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Push & SMS Notifications
                    </Typography>
                    <Stack spacing={2}>
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
                            checked={notificationSettings.smsNotifications}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                          />
                        }
                        label="SMS Notifications"
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
                            checked={notificationSettings.emergencyAlerts}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, emergencyAlerts: e.target.checked })}
                          />
                        }
                        label="Emergency Alerts"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.marketingEmails}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, marketingEmails: e.target.checked })}
                          />
                        }
                        label="Marketing Emails"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
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
                            checked={securitySettings.biometricAuth}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, biometricAuth: e.target.checked })}
                          />
                        }
                        label="Biometric Authentication"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.loginAlerts}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, loginAlerts: e.target.checked })}
                          />
                        }
                        label="Login Alerts"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Timer sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Session Management
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography gutterBottom>Password Expiry (days)</Typography>
                        <Slider
                          value={securitySettings.passwordExpiry}
                          onChange={(e, value) => setSecuritySettings({ ...securitySettings, passwordExpiry: value as number })}
                          min={30}
                          max={365}
                          step={30}
                          marks
                          valueLabelDisplay="auto"
                        />
                      </Box>
                      <Box>
                        <Typography gutterBottom>Session Timeout (minutes)</Typography>
                        <Slider
                          value={securitySettings.sessionTimeout}
                          onChange={(e, value) => setSecuritySettings({ ...securitySettings, sessionTimeout: value as number })}
                          min={5}
                          max={120}
                          step={5}
                          marks
                          valueLabelDisplay="auto"
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="Allowed Devices"
                        type="number"
                        value={securitySettings.allowedDevices}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, allowedDevices: parseInt(e.target.value) })}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* API & Integrations Tab */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        <Api sx={{ mr: 1, verticalAlign: 'middle' }} />
                        API Configuration
                      </Typography>
                      <Button variant="outlined" startIcon={<Refresh />}>
                        Regenerate API Key
                      </Button>
                    </Box>
                    <TextField
                      fullWidth
                      label="API Key"
                      value={apiSettings.apiKey}
                      onChange={(e) => setApiSettings({ ...apiSettings, apiKey: e.target.value })}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton>
                              <Visibility />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Webhook URL"
                          value={apiSettings.webhookUrl}
                          onChange={(e) => setApiSettings({ ...apiSettings, webhookUrl: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Rate Limit (requests/hour)"
                          type="number"
                          value={apiSettings.rateLimit}
                          onChange={(e) => setApiSettings({ ...apiSettings, rateLimit: parseInt(e.target.value) })}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Extension sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Integrations
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={apiSettings.enableCors}
                            onChange={(e) => setApiSettings({ ...apiSettings, enableCors: e.target.checked })}
                          />
                        }
                        label="Enable CORS"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={apiSettings.enableWebhooks}
                            onChange={(e) => setApiSettings({ ...apiSettings, enableWebhooks: e.target.checked })}
                          />
                        }
                        label="Enable Webhooks"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Logging
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Log Level</InputLabel>
                      <Select
                        value={apiSettings.logLevel}
                        onChange={(e) => setApiSettings({ ...apiSettings, logLevel: e.target.value })}
                      >
                        <MenuItem value="debug">Debug</MenuItem>
                        <MenuItem value="info">Info</MenuItem>
                        <MenuItem value="warn">Warning</MenuItem>
                        <MenuItem value="error">Error</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Data Collection
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={analyticsSettings.enableAnalytics}
                            onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, enableAnalytics: e.target.checked })}
                          />
                        }
                        label="Enable Analytics"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={analyticsSettings.anonymizeData}
                            onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, anonymizeData: e.target.checked })}
                          />
                        }
                        label="Anonymize Data"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={analyticsSettings.realTimeTracking}
                            onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, realTimeTracking: e.target.checked })}
                          />
                        }
                        label="Real-time Tracking"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={analyticsSettings.shareInsights}
                            onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, shareInsights: e.target.checked })}
                          />
                        }
                        label="Share Insights"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Report sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Reporting
                    </Typography>
                    <Stack spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel>Data Retention (days)</InputLabel>
                        <Select
                          value={analyticsSettings.dataRetention}
                          onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, dataRetention: e.target.value })}
                        >
                          <MenuItem value={30}>30 days</MenuItem>
                          <MenuItem value={90}>90 days</MenuItem>
                          <MenuItem value={180}>6 months</MenuItem>
                          <MenuItem value={365}>1 year</MenuItem>
                          <MenuItem value={730}>2 years</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel>Export Format</InputLabel>
                        <Select
                          value={analyticsSettings.exportFormat}
                          onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, exportFormat: e.target.value })}
                        >
                          <MenuItem value="json">JSON</MenuItem>
                          <MenuItem value="csv">CSV</MenuItem>
                          <MenuItem value="xlsx">Excel</MenuItem>
                          <MenuItem value="pdf">PDF</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel>Report Frequency</InputLabel>
                        <Select
                          value={analyticsSettings.reportFrequency}
                          onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, reportFrequency: e.target.value })}
                        >
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="quarterly">Quarterly</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Backup & Data Tab */}
          <TabPanel value={activeTab} index={5}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Backup sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Backup Settings
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={backupSettings.autoBackup}
                            onChange={(e) => setBackupSettings({ ...backupSettings, autoBackup: e.target.checked })}
                          />
                        }
                        label="Automatic Backup"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={backupSettings.cloudStorage}
                            onChange={(e) => setBackupSettings({ ...backupSettings, cloudStorage: e.target.checked })}
                          />
                        }
                        label="Cloud Storage"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={backupSettings.localBackup}
                            onChange={(e) => setBackupSettings({ ...backupSettings, localBackup: e.target.checked })}
                          />
                        }
                        label="Local Backup"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={backupSettings.encryption}
                            onChange={(e) => setBackupSettings({ ...backupSettings, encryption: e.target.checked })}
                          />
                        }
                        label="Encrypt Backups"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Schedule & Retention
                    </Typography>
                    <Stack spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel>Backup Frequency</InputLabel>
                        <Select
                          value={backupSettings.backupFrequency}
                          onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })}
                        >
                          <MenuItem value="hourly">Hourly</MenuItem>
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Retention Period (days)"
                        type="number"
                        value={backupSettings.retentionPeriod}
                        onChange={(e) => setBackupSettings({ ...backupSettings, retentionPeriod: parseInt(e.target.value) })}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Data Management
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<CloudDownload />}
                          onClick={() => setShowBackupDialog(true)}
                        >
                          Create Backup
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Restore />}
                        >
                          Restore Backup
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<FileDownload />}
                        >
                          Export Data
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<FileUpload />}
                        >
                          Import Data
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Action Buttons */}
          <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => handleReset('All')}
                disabled={loading}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSave('All')}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              >
                {loading ? 'Saving...' : 'Save All Changes'}
              </Button>
            </Stack>
          </Box>
      </Card>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to their default values? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={() => setShowDeleteDialog(false)} color="error">
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog open={showBackupDialog} onClose={() => setShowBackupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Backup</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Choose backup options:
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Include user data" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Include scholarship data" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Include application data" />
            <FormControlLabel control={<Checkbox />} label="Include analytics data" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupDialog(false)}>Cancel</Button>
          <Button onClick={() => setShowBackupDialog(false)} variant="contained">
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>
    </UniversityLayout>
  );
};

export default UniversitySettings;


