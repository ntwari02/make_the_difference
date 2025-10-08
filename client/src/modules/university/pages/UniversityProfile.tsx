import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  Button,
  Grid,
  TextField,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Autocomplete,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  RadioGroup,
  Radio,
  FormLabel,
  Checkbox,
  FormGroup,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Breadcrumbs,
  Link,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Camera,
  PhotoCamera,
  CloudUpload,
  VerifiedUser,
  School,
  LocationOn,
  Email,
  Phone,
  Language,
  Public,
  Share,
  Link as LinkIcon,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  YouTube,
  GitHub,
  Website,
  CalendarToday,
  TrendingUp,
  Assessment,
  Analytics,
  Insights,
  Star,
  StarBorder,
  EmojiEvents,
  MilitaryTech,
  WorkspacePremium,
  Diamond,
  AutoAwesome,
  CheckCircle,
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
  BookmarkBorder,
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
  Message,
  Mail,
  Send,
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Unarchive,
  Delete,
  Restore,
  Undo,
  Redo,
  Refresh,
  Sync,
  Autorenew,
  Loop,
  Replay,
  Restart,
  Update,
  Upgrade,
  Install,
  Uninstall,
  Settings,
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
  Add,
  Remove,
  Close,
  ExpandMore,
  ExpandLess,
  KeyboardArrowDown,
  KeyboardArrowUp,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  CheckCircleOutline,
  ErrorOutline,
  WarningAmber,
  InfoOutlined,
  HelpOutline,
  QuestionMark,
  LocationOn as LocationIcon,
  Print,
  GetApp,
  Security,
  Verified,
  Certificate,
  Award,
  Medal,
  Trophy,
  Celebration,
  Party,
  Event,
  Calendar,
  Time,
  Clock,
  Timer,
  Stopwatch,
  Alarm,
  Notification,
  Bell,
  Notifications,
  NotificationsActive,
  NotificationsOff,
  EditNote,
  AutoStories,
  Compare,
  Event as EventIcon,
  MilitaryTech as MilitaryTechIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Diamond as DiamondIcon,
  AutoAwesome as AutoAwesomeIcon,
  SmartToy,
  Chat,
  Forum,
  Group,
  People,
  AttachMoney,
  Schedule,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  Shield as ShieldIcon,
  Key,
  Fingerprint,
  Smartphone,
  Computer as ComputerIcon,
  Tablet as TabletIcon,
  Watch as WatchIcon,
  Wifi,
  Bluetooth,
  Storage,
  Database,
  Api,
  Webhook,
  Extension,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Insights as InsightsIcon,
  Report,
  FileDownload,
  FileUpload,
  Folder,
  FolderOpen,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarTodayIcon,
  Time as TimeIcon,
  Timer as TimerIcon,
  Stopwatch as StopwatchIcon,
  Alarm as AlarmIcon,
  Bell as BellIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  VolumeUp,
  VolumeDown,
  VolumeOff,
  Mic,
  MicOff,
  Camera as CameraIcon,
  CameraAlt,
  PhotoCamera as PhotoCameraIcon,
  VideoCall,
  Call,
  Message as MessageIcon,
  Chat as ChatIcon,
  Forum as ForumIcon,
  Group as GroupIcon,
  Public as PublicIcon,
  Private,
  Share as ShareIcon,
  Link as LinkIconAlt,
  Copy,
  QrCode,
  Code,
  Terminal,
  Build,
  Add as AddIcon,
  Remove as RemoveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  Support as SupportIcon,
  ContactSupport as ContactSupportIcon,
  LiveHelp as LiveHelpIcon,
  QuestionAnswer as QuestionAnswerIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
  Campaign as CampaignIcon,
  Announcement as AnnouncementIcon,
  PriorityHigh as PriorityHighIcon,
  Flag as FlagIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Feedback as FeedbackIcon,
  RateReview as RateReviewIcon,
  Reviews as ReviewsIcon,
  Comment as CommentIcon,
  ChatBubble as ChatBubbleIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Mail as MailIcon,
  Send as SendIcon,
  Reply as ReplyIcon,
  ReplyAll as ReplyAllIcon,
  Forward as ForwardIcon,
  Archive as ArchiveIconAlt,
  Unarchive as UnarchiveIconAlt,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Refresh as RefreshIcon,
  Sync as SyncIcon,
  Autorenew as AutorenewIcon,
  Loop as LoopIcon,
  Replay as ReplayIcon,
  Restart as RestartIcon,
  Update as UpdateIcon,
  Upgrade as UpgradeIcon,
  Install as InstallIcon,
  Uninstall as UninstallIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Adjust as AdjustIcon,
  Configure as ConfigureIcon,
  Customize as CustomizeIcon,
  Personalize as PersonalizeIcon,
  Preferences as PreferencesIcon,
  Options as OptionsIcon,
  MoreHoriz as MoreHorizIcon,
  MoreVert as MoreVertIcon,
  Apps as AppsIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ViewComfy as ViewComfyIcon,
  ViewStream as ViewStreamIcon,
  ViewCarousel as ViewCarouselIcon,
  ViewDay as ViewDayIcon,
  ViewWeek as ViewWeekIcon,
  ViewMonth as ViewMonthIcon,
  ViewAgenda as ViewAgendaIcon,
  ViewHeadline as ViewHeadlineIcon,
  ViewQuilt as ViewQuiltIcon,
  ViewSidebar as ViewSidebarIcon,
  ViewColumn as ViewColumnIcon,
  ViewArray as ViewArrayIcon,
  ViewKanban as ViewKanbanIcon,
  ViewDashboard as ViewDashboardIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  Translate as TranslateIcon,
  GTranslate as GTranslateIcon,
  Accessibility as AccessibilityIcon,
  AccessibilityNew as AccessibilityNewIcon,
  Hearing as HearingIcon,
  HearingDisabled as HearingDisabledIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  VoiceOverOff as VoiceOverOffIcon,
  VolumeMute as VolumeMuteIcon,
  MicNone as MicNoneIcon,
  Headset as HeadsetIcon,
  HeadsetMic as HeadsetMicIcon,
  Headphones as HeadphonesIcon,
  Speaker as SpeakerIcon,
  SpeakerGroup as SpeakerGroupIcon,
  SpeakerNotes as SpeakerNotesIcon,
  SpeakerNotesOff as SpeakerNotesOffIcon,
  Tv as TvIcon,
  Laptop as LaptopIcon,
  PhoneAndroid as PhoneAndroidIcon,
  PhoneIphone as PhoneIphoneIcon,
  Devices as DevicesIcon,
  DeviceHub as DeviceHubIcon,
  Router as RouterIcon,
  Memory as MemoryIcon,
  HardDrive as HardDriveIcon,
  SdCard as SdCardIcon,
  Usb as UsbIcon,
  SignalWifi4Bar as SignalWifi4BarIcon,
  SignalWifiOff as SignalWifiOffIcon,
  SignalCellular4Bar as SignalCellular4BarIcon,
  SignalCellularOff as SignalCellularOffIcon,
  BatteryFull as BatteryFullIcon,
  BatteryStd as BatteryStdIcon,
  BatteryAlert as BatteryAlertIcon,
  BatteryUnknown as BatteryUnknownIcon,
  BatteryChargingFull as BatteryChargingFullIcon,
  BatteryCharging20 as BatteryCharging20Icon,
  BatteryCharging30 as BatteryCharging30Icon,
  BatteryCharging50 as BatteryCharging50Icon,
  BatteryCharging60 as BatteryCharging60Icon,
  BatteryCharging80 as BatteryCharging80Icon,
  BatteryCharging90 as BatteryCharging90Icon,
  Power as PowerIcon,
  PowerOff as PowerOffIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  PowerInput as PowerInputIcon,
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
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const UniversityProfile: React.FC = () => {
  const role = useSelector((state: any) => state?.auth?.user?.role);
  const isAdmin = role === 'admin' || role === 'university' || role === 'staff' || role === 'moderator';
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Profile Data
  const [profileData, setProfileData] = useState({
    name: 'University of Excellence',
    email: 'contact@university.edu',
    phone: '+1 (555) 123-4567',
    website: 'https://university.edu',
    address: '123 University Ave, City, State 12345',
    description: 'A leading institution committed to academic excellence and student success.',
    founded: '1950',
    students: '15000',
    faculty: '1200',
    programs: '150',
    logo: '',
    coverPhoto: '',
    verified: true,
    rating: 4.8,
    reviews: 1247,
    followers: 8923,
    following: 156,
    socialMedia: {
      facebook: 'https://facebook.com/university',
      twitter: 'https://twitter.com/university',
      linkedin: 'https://linkedin.com/company/university',
      instagram: 'https://instagram.com/university',
      youtube: 'https://youtube.com/university',
      github: 'https://github.com/university',
    },
    categories: ['STEM', 'Arts', 'International', 'Research', 'Innovation'],
    achievements: [
      { id: 1, title: 'Top 100 Universities', year: '2023', type: 'ranking', verified: true },
      { id: 2, title: 'Research Excellence Award', year: '2022', type: 'award', verified: true },
      { id: 3, title: 'Student Satisfaction Leader', year: '2023', type: 'recognition', verified: true },
    ],
    team: [
      { id: 1, name: 'Dr. Sarah Johnson', role: 'President', email: 'sarah@university.edu', avatar: '', verified: true },
      { id: 2, name: 'Prof. Michael Chen', role: 'Dean of Admissions', email: 'michael@university.edu', avatar: '', verified: true },
      { id: 3, name: 'Dr. Emily Rodriguez', role: 'Scholarship Director', email: 'emily@university.edu', avatar: '', verified: true },
    ],
    activity: [
      { id: 1, type: 'scholarship', action: 'Created new scholarship', date: '2024-01-15', details: 'STEM Excellence Scholarship' },
      { id: 2, type: 'application', action: 'Reviewed applications', date: '2024-01-14', details: '25 applications reviewed' },
      { id: 3, type: 'award', action: 'Awarded scholarships', date: '2024-01-13', details: '12 students awarded' },
    ],
    privacy: {
      profileVisibility: 'public',
      contactInfo: 'public',
      achievements: 'public',
      team: 'public',
      activity: 'public',
    },
  });

  const handleSave = async (field?: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbar({ open: true, message: `${field || 'Profile'} updated successfully!`, severity: 'success' });
      setEditingField(null);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const handleShare = () => {
    setSnackbar({ open: true, message: 'Profile link copied to clipboard!', severity: 'success' });
  };

  const handleFollow = () => {
    setSnackbar({ open: true, message: 'Following university updates!', severity: 'success' });
  };

  return (
    <UniversityLayout>
      <Box mb={3}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/university/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Profile</Typography>
        </Breadcrumbs>

        {/* Profile Header */}
        <Card sx={{ mb: 3, position: 'relative' }}>
          {/* Cover Photo */}
          <Box
            sx={{
              height: 200,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton
              sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(255,255,255,0.2)' }}
              onClick={() => setShowPhotoDialog(true)}
            >
              <Camera />
            </IconButton>
            <Typography variant="h4" color="white" fontWeight={700}>
              {profileData.name}
            </Typography>
          </Box>

          <CardContent>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
              <Box display="flex" alignItems="flex-start" gap={3}>
                {/* Profile Avatar */}
                <Box position="relative">
                  <Avatar
                    sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: 3 }}
                    src={profileData.logo}
                  >
                    <School sx={{ fontSize: 60 }} />
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                    onClick={() => setShowPhotoDialog(true)}
                  >
                    <PhotoCamera />
                  </IconButton>
                  {profileData.verified && (
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>
                          <VerifiedUser sx={{ fontSize: 16 }} />
                        </Avatar>
                      }
                    />
                  )}
                </Box>

                {/* Profile Info */}
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Typography variant="h4" fontWeight={700}>
                      {profileData.name}
                    </Typography>
                    {profileData.verified && (
                      <Chip
                        icon={<VerifiedUser />}
                        label="Verified"
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" mb={2}>
                    {profileData.description}
                  </Typography>

                  {/* Stats */}
                  <Stack direction="row" spacing={3} mb={2}>
                    <Box textAlign="center">
                      <Typography variant="h6" fontWeight={600}>
                        {profileData.students}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Students
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h6" fontWeight={600}>
                        {profileData.faculty}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Faculty
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h6" fontWeight={600}>
                        {profileData.programs}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Programs
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h6" fontWeight={600}>
                        {profileData.followers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Followers
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Categories */}
                  <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                    {profileData.categories.map((category) => (
                      <Chip key={category} label={category} size="small" />
                    ))}
                  </Box>

                  {/* Rating */}
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating value={profileData.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {profileData.rating} ({profileData.reviews} reviews)
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1}>
                {isAdmin && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setShowEditDialog(true)}
                  >
                    Edit Profile
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={handleShare}
                >
                  Share
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Star />}
                  onClick={handleFollow}
                >
                  Follow
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab icon={<Person />} label="Overview" />
              <Tab icon={<Group />} label="Team" />
              <Tab icon={<EmojiEvents />} label="Achievements" />
              <Tab icon={<Assessment />} label="Activity" />
              <Tab icon={<Public />} label="Social" />
              {isAdmin && <Tab icon={<Settings />} label="Settings" />}
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                      University Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Founded"
                          value={profileData.founded}
                          InputProps={{ readOnly: editingField !== 'founded' }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Website"
                          value={profileData.website}
                          InputProps={{ readOnly: editingField !== 'website' }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          multiline
                          rows={2}
                          value={profileData.address}
                          InputProps={{ readOnly: editingField !== 'address' }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={3}
                          value={profileData.description}
                          InputProps={{ readOnly: editingField !== 'description' }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="primary.main" fontWeight={700}>
                            {profileData.students}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Students
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="secondary.main" fontWeight={700}>
                            {profileData.faculty}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Faculty Members
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main" fontWeight={700}>
                            {profileData.programs}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Academic Programs
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="warning.main" fontWeight={700}>
                            {profileData.followers}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Followers
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <ContactSupport sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Contact Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Email color="primary" />
                        <Typography variant="body2">{profileData.email}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Phone color="primary" />
                        <Typography variant="body2">{profileData.phone}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <LocationOn color="primary" />
                        <Typography variant="body2">{profileData.address}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Language color="primary" />
                        <Typography variant="body2">{profileData.website}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Rating & Reviews
                    </Typography>
                    <Box textAlign="center" mb={2}>
                      <Typography variant="h3" fontWeight={700} color="primary.main">
                        {profileData.rating}
                      </Typography>
                      <Rating value={profileData.rating} precision={0.1} readOnly size="large" />
                      <Typography variant="body2" color="text.secondary">
                        Based on {profileData.reviews} reviews
                      </Typography>
                    </Box>
                    <Button fullWidth variant="outlined" startIcon={<Reviews />}>
                      View All Reviews
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Team Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
                Team Members
              </Typography>
              {isAdmin && (
                <Button variant="contained" startIcon={<Add />} onClick={() => setShowTeamDialog(true)}>
                  Add Member
                </Button>
              )}
            </Box>
            <Grid container spacing={2}>
              {profileData.team.map((member) => (
                <Grid item xs={12} sm={6} md={4} key={member.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar src={member.avatar}>
                          <Person />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6">{member.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.role}
                          </Typography>
                        </Box>
                        {member.verified && (
                          <VerifiedUser color="success" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {member.email}
                      </Typography>
                      <Button size="small" variant="outlined" startIcon={<Message />}>
                        Contact
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Achievements Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                Achievements & Certifications
              </Typography>
              {isAdmin && (
                <Button variant="contained" startIcon={<Add />} onClick={() => setShowAchievementDialog(true)}>
                  Add Achievement
                </Button>
              )}
            </Box>
            <Grid container spacing={2}>
              {profileData.achievements.map((achievement) => (
                <Grid item xs={12} sm={6} md={4} key={achievement.id}>
      <Card>
        <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <EmojiEvents />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6">{achievement.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {achievement.year}
                          </Typography>
                        </Box>
                        {achievement.verified && (
                          <VerifiedUser color="success" />
                        )}
                      </Box>
                      <Chip label={achievement.type} size="small" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Activity Tab */}
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Activity
            </Typography>
            <Box>
              {profileData.activity.map((item, index) => (
                <Box key={item.id} display="flex" alignItems="flex-start" mb={3}>
                  {/* Timeline Dot */}
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Assessment sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  
                  {/* Timeline Content */}
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {item.action}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {item.details}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.date}
                    </Typography>
                  </Box>
                  
                  {/* Timeline Connector */}
                  {index < profileData.activity.length - 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 19,
                        top: 40,
                        width: 2,
                        height: 40,
                        bgcolor: 'divider',
                        ml: 2,
                      }}
                    />
                  )}
              </Box>
              ))}
            </Box>
          </TabPanel>

          {/* Social Tab */}
          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" gutterBottom>
              <Public sx={{ mr: 1, verticalAlign: 'middle' }} />
              Social Media & Links
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Social Media</Typography>
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Facebook color="primary" />
                        <Typography variant="body2">{profileData.socialMedia.facebook}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Twitter color="primary" />
                        <Typography variant="body2">{profileData.socialMedia.twitter}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <LinkedIn color="primary" />
                        <Typography variant="body2">{profileData.socialMedia.linkedin}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Instagram color="primary" />
                        <Typography variant="body2">{profileData.socialMedia.instagram}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <YouTube color="primary" />
                        <Typography variant="body2">{profileData.socialMedia.youtube}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <GitHub color="primary" />
                        <Typography variant="body2">{profileData.socialMedia.github}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                    <Stack spacing={2}>
                      <Button variant="outlined" startIcon={<Share />} fullWidth>
                        Share Profile
                      </Button>
                      <Button variant="outlined" startIcon={<Link />} fullWidth>
                        Copy Profile Link
                      </Button>
                      <Button variant="outlined" startIcon={<QrCode />} fullWidth>
                        Generate QR Code
                      </Button>
                      <Button variant="outlined" startIcon={<FileDownload />} fullWidth>
                        Export Profile
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Settings Tab (admin only) */}
          {isAdmin && (
          <TabPanel value={activeTab} index={5}>
            <Typography variant="h6" gutterBottom>
              <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
              Privacy & Visibility Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Profile Visibility</Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={<Switch checked={profileData.privacy.profileVisibility === 'public'} />}
                        label="Make profile public"
                      />
                      <FormControlLabel
                        control={<Switch checked={profileData.privacy.contactInfo === 'public'} />}
                        label="Show contact information"
                      />
                      <FormControlLabel
                        control={<Switch checked={profileData.privacy.achievements === 'public'} />}
                        label="Display achievements"
                      />
                      <FormControlLabel
                        control={<Switch checked={profileData.privacy.team === 'public'} />}
                        label="Show team members"
                      />
                      <FormControlLabel
                        control={<Switch checked={profileData.privacy.activity === 'public'} />}
                        label="Display activity timeline"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Account Management</Typography>
                    <Stack spacing={2}>
                      <Button variant="outlined" startIcon={<Security />} fullWidth>
                        Security Settings
                      </Button>
                      <Button variant="outlined" startIcon={<CloudUpload />} fullWidth>
                        Backup Profile Data
                      </Button>
                      <Button variant="outlined" startIcon={<FileDownload />} fullWidth>
                        Export All Data
                      </Button>
                      <Button variant="outlined" startIcon={<Delete />} color="error" fullWidth>
                        Delete Account
                      </Button>
          </Stack>
        </CardContent>
      </Card>
              </Grid>
            </Grid>
          </TabPanel>
          )}
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

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="University Name" defaultValue={profileData.name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" defaultValue={profileData.email} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} defaultValue={profileData.description} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={() => setShowEditDialog(false)} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoDialog} onClose={() => setShowPhotoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Profile Photo</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} sx={{ mt: 2 }}>
            <Avatar sx={{ width: 120, height: 120 }}>
              <School sx={{ fontSize: 60 }} />
            </Avatar>
            <Button variant="outlined" startIcon={<CloudUpload />}>
              Upload New Photo
            </Button>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Recommended: Square image, at least 400x400 pixels
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPhotoDialog(false)}>Cancel</Button>
          <Button onClick={() => setShowPhotoDialog(false)} variant="contained">
            Update Photo
          </Button>
        </DialogActions>
      </Dialog>
    </UniversityLayout>
  );
};

export default UniversityProfile;


