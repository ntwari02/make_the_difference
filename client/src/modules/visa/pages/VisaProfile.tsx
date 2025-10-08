import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  Tabs,
  Tab,
  Grid,
  Button,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  Rating,
  useTheme,
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  VerifiedUser as VerifiedUserIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  VideoFile as VideoFileIcon,
  AudioFile as AudioFileIcon,
  Description as DescriptionIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  Camera as CameraIcon
} from '@mui/icons-material';
import VisaLayout from '../components/layout/VisaLayout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const VisaProfile: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'warning' | 'info' });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    nationality: 'American',
    passportNumber: 'A12345678',
    passportExpiry: '2025-12-31',
    address: '123 Main Street, New York, NY 10001',
    occupation: 'Software Engineer',
    employer: 'Tech Corp Inc.',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+1 (555) 987-6543',
    profilePicture: '',
    coverPhoto: '',
    bio: 'Passionate traveler and software engineer with 10+ years of experience. Love exploring new cultures and cuisines.',
    verified: true,
    rating: 4.8,
    reviews: 127,
    followers: 234,
    following: 89,
    socialMedia: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
      instagram: 'https://instagram.com/johndoe'
    },
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsUpdates: false,
      privacyMode: false,
      showProfile: true
    },
    achievements: [
      { id: 1, title: 'Frequent Traveler', description: 'Visited 25+ countries', icon: '🌍', date: '2023-12-01' },
      { id: 2, title: 'Visa Expert', description: 'Successfully obtained 15+ visas', icon: '📋', date: '2023-11-15' },
      { id: 3, title: 'Community Helper', description: 'Helped 50+ people with visa applications', icon: '🤝', date: '2023-10-20' }
    ],
    documents: [
      { id: 1, name: 'Passport Copy', type: 'pdf', size: '2.3 MB', uploaded: '2023-12-01', status: 'verified' },
      { id: 2, name: 'Bank Statement', type: 'pdf', size: '1.8 MB', uploaded: '2023-11-28', status: 'pending' },
      { id: 3, name: 'Employment Letter', type: 'pdf', size: '0.9 MB', uploaded: '2023-11-25', status: 'verified' },
      { id: 4, name: 'Travel Insurance', type: 'pdf', size: '1.2 MB', uploaded: '2023-11-20', status: 'verified' }
    ],
    applications: [
      { id: 1, country: 'Japan', type: 'Tourist', status: 'approved', applied: '2023-11-01', processed: '2023-11-15', duration: '30 days' },
      { id: 2, country: 'Germany', type: 'Business', status: 'approved', applied: '2023-10-15', processed: '2023-10-28', duration: '90 days' },
      { id: 3, country: 'Canada', type: 'Tourist', status: 'pending', applied: '2023-12-01', processed: null, duration: '30 days' },
      { id: 4, country: 'Australia', type: 'Work', status: 'rejected', applied: '2023-09-10', processed: '2023-09-25', duration: '365 days' }
    ],
    activity: [
      { id: 1, type: 'application', message: 'Applied for Canada Tourist Visa', timestamp: '2023-12-01T10:30:00Z', status: 'pending' },
      { id: 2, type: 'document', message: 'Uploaded Travel Insurance document', timestamp: '2023-11-20T14:15:00Z', status: 'completed' },
      { id: 3, type: 'achievement', message: 'Earned "Frequent Traveler" badge', timestamp: '2023-12-01T09:00:00Z', status: 'completed' },
      { id: 4, type: 'review', message: 'Left review for Japan Visa Service', timestamp: '2023-11-16T16:45:00Z', status: 'completed' }
    ]
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditProfile = () => {
    setShowEditDialog(true);
  };

  const handlePhotoUpload = () => {
    setShowPhotoDialog(true);
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbar({ open: true, message: 'Profile link copied to clipboard', severity: 'success' });
  };

  const handleExportProfile = () => {
    setSnackbar({ open: true, message: 'Profile data exported successfully', severity: 'success' });
  };

  const handlePrintProfile = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'verified': return 'success';
      default: return 'default';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <PictureAsPdfIcon />;
      case 'image': return <ImageIcon />;
      case 'video': return <VideoFileIcon />;
      case 'audio': return <AudioFileIcon />;
      default: return <DescriptionIcon />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application': return <AssessmentIcon />;
      case 'document': return <AttachFileIcon />;
      case 'achievement': return <StarIcon />;
      case 'review': return <ThumbUpIcon />;
      default: return <TimelineIcon />;
    }
  };

  return (
    <VisaLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Profile Header */}
        <Card sx={{ mb: 3, position: 'relative', overflow: 'hidden' }}>
          {/* Cover Photo */}
          <Box
            sx={{
              height: 200,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconButton
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                color: 'white',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.3)
                }
              }}
              onClick={handlePhotoUpload}
            >
              <PhotoCameraIcon />
            </IconButton>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {profileData.firstName} {profileData.lastName}
            </Typography>
          </Box>

          <CardContent sx={{ position: 'relative', mt: -4 }}>
            <Stack direction="row" spacing={3} alignItems="flex-end">
              {/* Profile Avatar */}
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  border: 4,
                  borderColor: 'background.paper',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  backgroundColor: theme.palette.primary.main
                }}
              >
                {profileData.firstName[0]}{profileData.lastName[0]}
              </Avatar>

              <Box sx={{ flexGrow: 1, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {profileData.firstName} {profileData.lastName}
                  </Typography>
                  {profileData.verified && (
                    <Tooltip title="Verified Profile">
                      <VerifiedUserIcon color="primary" />
                    </Tooltip>
                  )}
                </Stack>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {profileData.bio}
                </Typography>

                {/* Stats */}
                <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold">
                      {profileData.rating}
                    </Typography>
                    <Rating value={profileData.rating} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {profileData.reviews} reviews
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold">
                      {profileData.followers}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Followers
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold">
                      {profileData.following}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Following
                    </Typography>
                  </Box>
                </Stack>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={handleShareProfile}
                  >
                    Share
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportProfile}
                  >
                    Export
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintProfile}
                  >
                    Print
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Overview" />
              <Tab label="Applications" />
              <Tab label="Documents" />
              <Tab label="Achievements" />
              <Tab label="Activity" />
              <Tab label="Social" />
              <Tab label="Settings" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1">
                        {profileData.firstName} {profileData.lastName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {profileData.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {profileData.phone}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Date of Birth
                      </Typography>
                      <Typography variant="body1">
                        {profileData.dateOfBirth}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nationality
                      </Typography>
                      <Typography variant="body1">
                        {profileData.nationality}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* Travel Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Travel Information
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Passport Number
                      </Typography>
                      <Typography variant="body1">
                        {profileData.passportNumber}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Passport Expiry
                      </Typography>
                      <Typography variant="body1">
                        {profileData.passportExpiry}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {profileData.address}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Occupation
                      </Typography>
                      <Typography variant="body1">
                        {profileData.occupation}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Employer
                      </Typography>
                      <Typography variant="body1">
                        {profileData.employer}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* Quick Stats */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Travel Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {profileData.applications.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Applications
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {profileData.applications.filter(app => app.status === 'approved').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Approved Visas
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        {profileData.applications.filter(app => app.status === 'pending').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Applications
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="error.main" fontWeight="bold">
                        {profileData.applications.filter(app => app.status === 'rejected').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rejected Applications
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              Visa Applications
            </Typography>
            <Grid container spacing={2}>
              {profileData.applications.map((app) => (
                <Grid item xs={12} md={6} key={app.id}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                        <Box>
                          <Typography variant="h6">
                            {app.country} - {app.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Applied: {app.applied}
                          </Typography>
                        </Box>
                        <Chip
                          label={app.status}
                          color={getStatusColor(app.status) as any}
                          size="small"
                        />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">
                          Duration: {app.duration}
                        </Typography>
                        {app.processed && (
                          <Typography variant="body2" color="text.secondary">
                            Processed: {app.processed}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Documents
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setSnackbar({ open: true, message: 'Upload document (stub)', severity: 'info' })}
              >
                Upload Document
              </Button>
            </Stack>
            <List>
              {profileData.documents.map((doc) => (
                <ListItem key={doc.id} divider>
                  <ListItemIcon>
                    {getDocumentIcon(doc.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.name}
                    secondary={`${doc.size} • Uploaded ${doc.uploaded}`}
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={doc.status}
                        color={getStatusColor(doc.status) as any}
                        size="small"
                      />
                      <IconButton size="small">
                        <CloudDownloadIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Achievements
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAchievementDialog(true)}
              >
                Add Achievement
              </Button>
            </Stack>
            <Grid container spacing={2}>
              {profileData.achievements.map((achievement) => (
                <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ mb: 1 }}>
                        {achievement.icon}
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        {achievement.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {achievement.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Earned: {achievement.date}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Stack spacing={2}>
              {profileData.activity.map((activity) => (
                <Paper key={activity.id} sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ color: getStatusColor(activity.status) === 'success' ? 'success.main' : getStatusColor(activity.status) === 'warning' ? 'warning.main' : 'primary.main' }}>
                      {getActivityIcon(activity.type)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1">
                        {activity.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(activity.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={activity.status}
                      color={getStatusColor(activity.status) as any}
                      size="small"
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Typography variant="h6" gutterBottom>
              Social Media & Links
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Social Media Links
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        LinkedIn
                      </Typography>
                      <Typography variant="body2">
                        {profileData.socialMedia.linkedin}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Twitter
                      </Typography>
                      <Typography variant="body2">
                        {profileData.socialMedia.twitter}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Instagram
                      </Typography>
                      <Typography variant="body2">
                        {profileData.socialMedia.instagram}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={handleShareProfile}
                    >
                      Share Profile
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CopyIcon />}
                      onClick={() => setSnackbar({ open: true, message: 'Profile link copied', severity: 'success' })}
                    >
                      Copy Link
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<QrCodeIcon />}
                      onClick={() => setSnackbar({ open: true, message: 'QR code generated (stub)', severity: 'info' })}
                    >
                      Generate QR Code
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportProfile}
                    >
                      Export Profile
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={6}>
            <Typography variant="h6" gutterBottom>
              Privacy & Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Notification Preferences
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profileData.preferences.notifications}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, notifications: e.target.checked }
                          }))}
                        />
                      }
                      label="Push Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profileData.preferences.emailUpdates}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, emailUpdates: e.target.checked }
                          }))}
                        />
                      }
                      label="Email Updates"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profileData.preferences.smsUpdates}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, smsUpdates: e.target.checked }
                          }))}
                        />
                      }
                      label="SMS Updates"
                    />
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Privacy Settings
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profileData.preferences.showProfile}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, showProfile: e.target.checked }
                          }))}
                        />
                      }
                      label="Show Profile to Others"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profileData.preferences.privacyMode}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, privacyMode: e.target.checked }
                          }))}
                        />
                      }
                      label="Privacy Mode"
                    />
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>

        {/* Edit Profile Dialog */}
        <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowEditDialog(false);
              setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
            }} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Photo Upload Dialog */}
        <Dialog open={showPhotoDialog} onClose={() => setShowPhotoDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Profile Photo</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}>
                {profileData.firstName[0]}{profileData.lastName[0]}
              </Avatar>
              <Typography variant="body1" gutterBottom>
                Choose a new profile photo
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                <Button variant="outlined" startIcon={<CameraIcon />}>
                  Take Photo
                </Button>
                <Button variant="outlined" startIcon={<PhotoCameraIcon />}>
                  Choose from Gallery
                </Button>
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPhotoDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowPhotoDialog(false);
              setSnackbar({ open: true, message: 'Photo uploaded successfully', severity: 'success' });
            }} variant="contained">
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        {/* Achievement Dialog */}
        <Dialog open={showAchievementDialog} onClose={() => setShowAchievementDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Achievement</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Achievement Title"
                  placeholder="e.g., Visa Expert"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  placeholder="e.g., Successfully obtained 10+ visas"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Icon (Emoji)"
                  placeholder="e.g., 🏆"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAchievementDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowAchievementDialog(false);
              setSnackbar({ open: true, message: 'Achievement added successfully', severity: 'success' });
            }} variant="contained">
              Add Achievement
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </VisaLayout>
  );
};

export default VisaProfile;
