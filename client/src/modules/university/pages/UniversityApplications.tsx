import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TextField,
  Button,
  GridLegacy as Grid,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  Stack,
  Badge,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Checkbox,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Chip as FilterChip,
  Skeleton,
  Fade,
  Zoom,
  Toolbar,
  AppBar,
  useTheme,
  alpha,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText as MuiListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  FileUpload as UploadIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Assessment as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Note as NoteIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  LocalLibrary as LibraryIcon,
  EmojiEvents as TrophyIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  Business as BusinessIcon,
  Palette as ArtIcon,
  Favorite as HeartIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  EditNote as EditNoteIcon,
  AutoStories as AutoStoriesIcon,
  Lightbulb as LightbulbIcon,
  Compare as CompareIcon,
  CalendarMonth as CalendarMonthIcon,
  Event as EventIcon,
  MilitaryTech as MilitaryTechIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Diamond as DiamondIcon,
  AutoAwesome as AutoAwesomeIcon,
  SmartToy as SmartToyIcon,
  Chat as ChatIcon,
  Forum as ForumIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon2,
  Insights as InsightsIcon,
  TrendingFlat as TrendingFlatIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Feedback as FeedbackIcon,
  Help as HelpIcon,
  Quiz as QuizIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  Public as PublicIcon,
  Language as LanguageIcon,
  Translate as TranslateIcon,
  Accessibility as AccessibilityIcon,
  Support as SupportIcon,
  ContactSupport as ContactSupportIcon,
  LiveHelp as LiveHelpIcon,
  QuestionAnswer as QuestionAnswerIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
  Campaign as CampaignIcon,
  Announcement as AnnouncementIcon,
  PriorityHigh as PriorityHighIcon,
  Flag as FlagIcon,
  BookmarkAdd as BookmarkAddIcon,
  BookmarkRemove as BookmarkRemoveIcon,
  BookmarkAdded as BookmarkAddedIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import UniversityLayout from '../components/layout/UniversityLayout';
import { universityApi } from '../services/universityApi';

const UniversityApplications: React.FC = () => {
  const theme = useTheme();
  const [myApplications, setMyApplications] = React.useState<any[]>([]);
  const [availableScholarships, setAvailableScholarships] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('date_desc');
  const [selectedApplication, setSelectedApplication] = React.useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState<boolean>(false);
  const [applyDialogOpen, setApplyDialogOpen] = React.useState<boolean>(false);
  const [selectedScholarship, setSelectedScholarship] = React.useState<any | null>(null);
  const [toast, setToast] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [tab, setTab] = React.useState<'my-applications' | 'available' | 'saved' | 'history'>('my-applications');
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());
  const [savedScholarships, setSavedScholarships] = React.useState<Set<string>>(new Set());
  const [personalStats, setPersonalStats] = React.useState<any>({});
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotifications, setShowNotifications] = React.useState<boolean>(false);
  const [essayTemplates, setEssayTemplates] = React.useState<any[]>([]);
  const [showEssayBuilder, setShowEssayBuilder] = React.useState<boolean>(false);
  const [deadlineReminders, setDeadlineReminders] = React.useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = React.useState<any[]>([]);
  const [achievementBadges, setAchievementBadges] = React.useState<any[]>([]);
  const [peerComparison, setPeerComparison] = React.useState<any>({});
  const [showCalendar, setShowCalendar] = React.useState<boolean>(false);
  const [applicationTemplates, setApplicationTemplates] = React.useState<any[]>([]);
  const [showTemplates, setShowTemplates] = React.useState<boolean>(false);

  // Mock user data - in real app, this would come from auth context
  const currentUser = {
    name: 'John Doe',
    email: 'john.doe@university.edu',
    gpa: 3.8,
    major: 'Computer Science',
    year: 'Senior',
    avatar: '/api/placeholder/40/40'
  };

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      // Load user's applications
      const applicationsData = await universityApi.getApplications();
      setMyApplications(Array.isArray(applicationsData) ? applicationsData : []);
      
      // Load available scholarships
      const scholarshipsData = await universityApi.getScholarships();
      setAvailableScholarships(Array.isArray(scholarshipsData) ? scholarshipsData : []);
      
      // Calculate personal stats
      const stats = calculatePersonalStats(applicationsData || []);
      setPersonalStats(stats);
      
      // Load additional features data
      loadEnhancedFeatures();
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  // Load enhanced features
  const loadEnhancedFeatures = () => {
    // Mock notifications
    setNotifications([
      { id: 1, type: 'success', title: 'Application Approved!', message: 'Your Engineering Excellence application has been approved.', time: '2 hours ago', unread: true },
      { id: 2, type: 'warning', title: 'Deadline Reminder', message: 'Computer Science Merit Award deadline is in 3 days.', time: '1 day ago', unread: true },
      { id: 3, type: 'info', title: 'New Scholarship Available', message: 'AI & Data Science Fellowship is now accepting applications.', time: '2 days ago', unread: false },
      { id: 4, type: 'success', title: 'Document Uploaded', message: 'Your transcript has been successfully uploaded.', time: '3 days ago', unread: false },
    ]);

    // Mock essay templates
    setEssayTemplates([
      { id: 1, title: 'Personal Statement Template', category: 'General', content: 'Template for personal statements...', usage: 45 },
      { id: 2, title: 'Leadership Essay Template', category: 'Leadership', content: 'Template for leadership essays...', usage: 32 },
      { id: 3, title: 'Academic Achievement Template', category: 'Academic', content: 'Template for academic achievements...', usage: 28 },
      { id: 4, title: 'Community Service Template', category: 'Service', content: 'Template for community service essays...', usage: 21 },
    ]);

    // Mock deadline reminders
    setDeadlineReminders([
      { id: 1, scholarship: 'Computer Science Merit Award', deadline: '2024-02-15', daysLeft: 3, priority: 'high' },
      { id: 2, scholarship: 'Business Leadership Grant', deadline: '2024-02-20', daysLeft: 8, priority: 'medium' },
      { id: 3, scholarship: 'Arts & Humanities Fund', deadline: '2024-02-25', daysLeft: 13, priority: 'low' },
    ]);

    // Mock AI recommendations
    setAiRecommendations([
      { id: 1, scholarship: 'AI & Data Science Fellowship', match: 95, reason: 'High GPA match and relevant major', amount: 65000 },
      { id: 2, scholarship: 'Global STEM Innovators', match: 88, reason: 'STEM background and research experience', amount: 52000 },
      { id: 3, scholarship: 'Sustainable Energy Scholarship', match: 82, reason: 'Environmental interest and academic performance', amount: 45000 },
    ]);

    // Mock achievement badges
    setAchievementBadges([
      { id: 1, name: 'First Application', description: 'Submitted your first scholarship application', icon: '🎯', earned: true, date: '2024-01-15' },
      { id: 2, name: 'High Achiever', description: 'Maintained GPA above 3.5', icon: '⭐', earned: true, date: '2024-01-20' },
      { id: 3, name: 'Application Master', description: 'Submitted 5+ applications', icon: '🏆', earned: false, progress: 3 },
      { id: 4, name: 'Scholarship Winner', description: 'Received your first scholarship', icon: '🎉', earned: false, progress: 0 },
    ]);

    // Mock peer comparison
    setPeerComparison({
      myGPA: 3.8,
      averageGPA: 3.6,
      myApplications: 5,
      averageApplications: 8,
      mySuccessRate: 40,
      averageSuccessRate: 35,
      percentile: 75
    });

    // Mock application templates
    setApplicationTemplates([
      { id: 1, name: 'STEM Scholarship Template', category: 'STEM', fields: ['Personal Info', 'Academic Record', 'Research Experience', 'Future Goals'] },
      { id: 2, name: 'Business Scholarship Template', category: 'Business', fields: ['Personal Info', 'Leadership Experience', 'Career Goals', 'Community Service'] },
      { id: 3, name: 'Arts Scholarship Template', category: 'Arts', fields: ['Personal Info', 'Portfolio', 'Creative Statement', 'Artistic Goals'] },
    ]);
  };

  const calculatePersonalStats = (applications: any[]) => {
    const total = applications.length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const successRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    
    return {
      totalApplications: total,
      approvedApplications: approved,
      pendingApplications: pending,
      rejectedApplications: rejected,
      successRate: successRate,
      totalAwarded: approved * 5000, // Mock calculation
      averageGPA: 3.8
    };
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Filter applications
  const filteredApplications = React.useMemo(() => {
    let filtered = myApplications.filter((app: any) => {
      const matchesSearch = !searchQuery || 
        (app.scholarship || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.status || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort applications
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.submitted || b.created_at || 0).getTime() - new Date(a.submitted || a.created_at || 0).getTime();
        case 'date_asc':
          return new Date(a.submitted || a.created_at || 0).getTime() - new Date(b.submitted || b.created_at || 0).getTime();
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [myApplications, searchQuery, statusFilter, sortBy]);

  // Filter available scholarships
  const filteredScholarships = React.useMemo(() => {
    let filtered = availableScholarships.filter((sch: any) => {
      const matchesSearch = !searchQuery || 
        (sch.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sch.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sch.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || 
        (sch.tags || []).some((tag: string) => tag.toLowerCase() === categoryFilter.toLowerCase());
      
      return matchesSearch && matchesCategory && sch.status === 'active';
    });

    return filtered;
  }, [availableScholarships, searchQuery, categoryFilter]);

  // Apply to scholarship
  const applyToScholarship = async (scholarshipId: string) => {
    try {
      // Mock application submission
      const newApplication = {
        id: `app-${Date.now()}`,
        scholarship_id: scholarshipId,
        scholarship: availableScholarships.find(s => s.id === scholarshipId)?.title || 'Unknown',
        status: 'pending',
        submitted: new Date().toISOString(),
        gpa: currentUser.gpa,
        student_name: currentUser.name,
        email: currentUser.email
      };
      
      setMyApplications(prev => [newApplication, ...prev]);
      setApplyDialogOpen(false);
      setToast({ open: true, message: 'Application submitted successfully!', severity: 'success' });
    } catch (error) {
      setToast({ open: true, message: 'Failed to submit application', severity: 'error' });
    }
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle saved scholarship
  const toggleSavedScholarship = (id: string) => {
    setSavedScholarships(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon fontSize="small" />;
      case 'rejected': return <CancelIcon fontSize="small" />;
      case 'pending': return <ScheduleIcon fontSize="small" />;
      default: return null;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'stem': return <ScienceIcon />;
      case 'business': return <BusinessIcon />;
      case 'arts': return <ArtIcon />;
      case 'health': return <HeartIcon />;
      case 'technology': return <PsychologyIcon />;
      default: return <LibraryIcon />;
    }
  };

  // Personal stats cards
  const statsCards = [
    { 
      title: 'My Applications', 
      value: personalStats.totalApplications || 0, 
      icon: <AssignmentIcon />, 
      color: 'primary',
      subtitle: 'Total submitted'
    },
    { 
      title: 'Approved', 
      value: personalStats.approvedApplications || 0, 
      icon: <CheckCircleIcon />, 
      color: 'success',
      subtitle: 'Success rate: ' + (personalStats.successRate || 0) + '%'
    },
    { 
      title: 'Pending Review', 
      value: personalStats.pendingApplications || 0, 
      icon: <ScheduleIcon />, 
      color: 'warning',
      subtitle: 'Awaiting decision'
    },
    { 
      title: 'Total Awarded', 
      value: `$${(personalStats.totalAwarded || 0).toLocaleString()}`, 
      icon: <MoneyIcon />, 
      color: 'info',
      subtitle: 'Scholarship funds'
    },
  ];

  return (
    <UniversityLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box mb={3}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Scholarship Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your applications and discover new opportunities
          </Typography>
        </Box>
      </motion.div>

      {/* Personal Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Grid container spacing={3} mb={3}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: 2, 
                  border: (t) => `1px solid ${t.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    transform: 'translateY(-2px)', 
                    boxShadow: 4 
                  }
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight={700} color={`${stat.color}.main`}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.subtitle}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '50%',
                          bgcolor: (t) => alpha(t.palette[stat.color as keyof typeof t.palette].main, 0.1),
                          color: `${stat.color}.main`
                        }}
                      >
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Enhanced Header with Notifications and Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab value="my-applications" label={`My Applications (${myApplications.length})`} />
            <Tab value="available" label={`Available (${filteredScholarships.length})`} />
            <Tab value="saved" label={`Saved (${savedScholarships.size})`} />
            <Tab value="history" label="History" />
          </Tabs>
          
          <Stack direction="row" spacing={1}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton onClick={() => setShowNotifications(!showNotifications)}>
                <Badge badgeContent={notifications.filter(n => n.unread).length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* Essay Builder */}
            <Tooltip title="Essay Builder">
              <IconButton onClick={() => setShowEssayBuilder(true)}>
                <EditNoteIcon />
              </IconButton>
            </Tooltip>
            
            {/* Calendar */}
            <Tooltip title="Calendar">
              <IconButton onClick={() => setShowCalendar(true)}>
                <CalendarMonthIcon />
              </IconButton>
            </Tooltip>
            
            {/* AI Recommendations */}
            <Tooltip title="AI Recommendations">
              <IconButton onClick={() => setTab('available')}>
                <SmartToyIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </motion.div>

      {/* Notifications Panel */}
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card sx={{ mb: 2, maxHeight: 300, overflow: 'auto' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Notifications</Typography>
                <IconButton size="small" onClick={() => setShowNotifications(false)}>
                  <CancelIcon />
                </IconButton>
              </Box>
              <List>
                {notifications.map((notification) => (
                  <ListItem key={notification.id} sx={{ bgcolor: notification.unread ? 'action.hover' : 'transparent' }}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: notification.type === 'success' ? 'success.main' : 
                                notification.type === 'warning' ? 'warning.main' : 'info.main' 
                      }}>
                        {notification.type === 'success' ? <CheckCircleIcon /> :
                         notification.type === 'warning' ? <WarningIcon /> : <InfoIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <MuiListItemText
                      primary={notification.title}
                      secondary={notification.message}
                      sx={{ '& .MuiListItemText-secondary': { fontSize: '0.875rem' } }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Recommendations Banner */}
      {aiRecommendations.length > 0 && tab === 'available' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Alert 
            severity="info" 
            icon={<SmartToyIcon />}
            sx={{ mb: 2, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small">
                View All
              </Button>
            }
          >
            <Typography variant="subtitle2" gutterBottom>
              AI-Powered Recommendations
            </Typography>
            <Typography variant="body2">
              We found {aiRecommendations.length} scholarships that match your profile with 80%+ compatibility.
            </Typography>
          </Alert>
        </motion.div>
      )}

      {/* Achievement Badges */}
      {achievementBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card sx={{ mb: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="primary.main">
                  <TrophyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Achievement Badges
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {achievementBadges.filter(b => b.earned).length} of {achievementBadges.length} earned
                </Typography>
              </Box>
              <Grid container spacing={1}>
                {achievementBadges.map((badge) => (
                  <Grid item key={badge.id}>
                    <Tooltip title={badge.description}>
                      <Chip
                        icon={<span style={{ fontSize: '16px' }}>{badge.icon}</span>}
                        label={badge.name}
                        color={badge.earned ? 'primary' : 'default'}
                        variant={badge.earned ? 'filled' : 'outlined'}
                        sx={{ 
                          opacity: badge.earned ? 1 : 0.6,
                          position: 'relative'
                        }}
                      />
                    </Tooltip>
                    {!badge.earned && badge.progress > 0 && (
                      <LinearProgress 
                        variant="determinate" 
                        value={(badge.progress / 5) * 100} 
                        size="small"
                        sx={{ mt: 0.5, width: '100%' }}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Deadline Reminders */}
      {deadlineReminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card sx={{ mb: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
            <CardContent>
              <Typography variant="h6" color="warning.main" gutterBottom>
                <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Upcoming Deadlines
              </Typography>
              <List dense>
                {deadlineReminders.map((reminder) => (
                  <ListItem key={reminder.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: reminder.priority === 'high' ? 'error.main' : 
                                reminder.priority === 'medium' ? 'warning.main' : 'info.main',
                        width: 32,
                        height: 32
                      }}>
                        <CalendarIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <MuiListItemText
                      primary={reminder.scholarship}
                      secondary={`${reminder.daysLeft} days left - ${new Date(reminder.deadline).toLocaleDateString()}`}
                    />
                    <Chip
                      label={reminder.priority}
                      size="small"
                      color={reminder.priority === 'high' ? 'error' : reminder.priority === 'medium' ? 'warning' : 'info'}
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {tab === 'my-applications' && (
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {tab === 'available' && (
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="STEM">STEM</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                    <MenuItem value="Arts">Arts</MenuItem>
                    <MenuItem value="Health">Health</MenuItem>
                    <MenuItem value="Technology">Technology</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="date_desc">Date (Newest)</MenuItem>
                  <MenuItem value="date_asc">Date (Oldest)</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadData}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Content based on tab */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {tab === 'my-applications' && (
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box p={2}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} display="flex" alignItems="center" p={2}>
                      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                      <Box flex={1}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                      <Skeleton variant="rectangular" width={80} height={32} />
                    </Box>
                  ))}
                </Box>
              ) : filteredApplications.length === 0 ? (
                <Box p={4} textAlign="center">
                  <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No applications found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Start applying to scholarships to see your applications here.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setTab('available')}
                  >
                    Browse Scholarships
                  </Button>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Scholarship</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Applied Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AnimatePresence>
                      {filteredApplications.map((app: any, index: number) => (
                        <motion.tr
                          key={app.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          component={TableRow}
                          sx={{
                            '&:hover': {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.04)
                            }
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {app.scholarship || 'Unknown Scholarship'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Application ID: {app.id}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(app.status)}
                              label={app.status}
                              color={getStatusColor(app.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(app.submitted || app.created_at || '').toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              ${app.amount || '5,000'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedApplication(app);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download Documents">
                                <IconButton size="small">
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 'available' && (
          <Grid container spacing={3}>
            {filteredScholarships.map((scholarship: any, index: number) => (
              <Grid item xs={12} md={6} lg={4} key={scholarship.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: 3, 
                    boxShadow: 2,
                    border: (t) => `1px solid ${t.palette.divider}`,
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      boxShadow: 4 
                    }
                  }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {scholarship.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {scholarship.description}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => toggleSavedScholarship(scholarship.id)}
                        >
                          {savedScholarships.has(scholarship.id) ? 
                            <BookmarkIcon color="primary" /> : 
                            <BookmarkBorderIcon />
                          }
                        </IconButton>
                      </Box>
                      
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                        {(scholarship.tags || []).slice(0, 3).map((tag: string) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            icon={getCategoryIcon(tag)}
                          />
                        ))}
                      </Stack>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                          <Typography variant="h6" color="primary.main" fontWeight={700}>
                            ${(scholarship.budget || 0).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Award Amount
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="body2" fontWeight={600}>
                            {scholarship.applications || 0} applications
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Deadline: {new Date(scholarship.deadline || '').toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setSelectedScholarship(scholarship);
                          setApplyDialogOpen(true);
                        }}
                        disabled={myApplications.some(app => app.scholarship_id === scholarship.id)}
                      >
                        {myApplications.some(app => app.scholarship_id === scholarship.id) ? 
                          'Already Applied' : 'Apply Now'
                        }
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        {tab === 'saved' && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Saved Scholarships ({savedScholarships.size})
            </Typography>
            {savedScholarships.size === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <BookmarkBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No saved scholarships
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Save scholarships you're interested in to view them here.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setTab('available')}
                >
                  Browse Scholarships
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {availableScholarships
                  .filter(sch => savedScholarships.has(sch.id))
                  .map((scholarship: any) => (
                    <Grid item xs={12} md={6} lg={4} key={scholarship.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {scholarship.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {scholarship.description}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" color="primary.main">
                              ${(scholarship.budget || 0).toLocaleString()}
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSelectedScholarship(scholarship);
                                setApplyDialogOpen(true);
                              }}
                            >
                              Apply
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            )}
          </Box>
        )}

        {tab === 'history' && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View your complete application history and track your progress over time.
              </Typography>
              {/* Timeline component would go here */}
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Application Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Application Details
          <IconButton
            onClick={() => setDetailsOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Application Information</Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Scholarship</Typography>
                      <Typography variant="body1">{selectedApplication.scholarship}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        icon={getStatusIcon(selectedApplication.status)}
                        label={selectedApplication.status}
                        color={getStatusColor(selectedApplication.status) as any}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Applied Date</Typography>
                      <Typography variant="body1">
                        {new Date(selectedApplication.submitted || selectedApplication.created_at || '').toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Award Amount</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        ${selectedApplication.amount || '5,000'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Application Timeline</Typography>
                  <Stepper orientation="vertical">
                    <Step completed>
                      <StepLabel>Application Submitted</StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          Your application was submitted successfully.
                        </Typography>
                      </StepContent>
                    </Step>
                    <Step completed={selectedApplication.status === 'approved' || selectedApplication.status === 'rejected'}>
                      <StepLabel>Under Review</StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          Your application is being reviewed by the scholarship committee.
                        </Typography>
                      </StepContent>
                    </Step>
                    <Step completed={selectedApplication.status === 'approved'}>
                      <StepLabel>Decision Made</StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          {selectedApplication.status === 'approved' ? 
                            'Congratulations! Your application has been approved.' :
                            'Unfortunately, your application was not selected this time.'
                          }
                        </Typography>
                      </StepContent>
                    </Step>
                  </Stepper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Download Documents
          </Button>
        </DialogActions>
      </Dialog>

      {/* Apply to Scholarship Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Apply to Scholarship
          <IconButton
            onClick={() => setApplyDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedScholarship && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedScholarship.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedScholarship.description}
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Application Requirements:</strong>
                </Typography>
                <ul>
                  <li>Minimum GPA: 3.0</li>
                  <li>Current GPA: {currentUser.gpa} ✓</li>
                  <li>Personal Statement</li>
                  <li>Academic Transcript</li>
                  <li>Letter of Recommendation</li>
                </ul>
              </Alert>

              <Typography variant="subtitle2" gutterBottom>
                Upload Required Documents
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Upload Personal Statement
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Upload Transcript
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  Upload Recommendation Letter
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => selectedScholarship && applyToScholarship(selectedScholarship.id)}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Essay Builder Dialog */}
      <Dialog open={showEssayBuilder} onClose={() => setShowEssayBuilder(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <EditNoteIcon sx={{ mr: 1 }} />
            Essay Builder & Templates
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Essay Templates</Typography>
              <List>
                {essayTemplates.map((template) => (
                  <ListItem key={template.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <AutoStoriesIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <MuiListItemText
                      primary={template.title}
                      secondary={`${template.category} • Used ${template.usage} times`}
                    />
                    <Button size="small" variant="outlined">Use Template</Button>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>AI Writing Assistant</Typography>
              <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Get AI-powered suggestions for your scholarship essays
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Paste your essay draft here for AI feedback..."
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" startIcon={<SmartToyIcon />} fullWidth>
                  Get AI Feedback
                </Button>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEssayBuilder(false)}>Close</Button>
          <Button variant="contained">Save Essay</Button>
        </DialogActions>
      </Dialog>

      {/* Calendar Integration Dialog */}
      <Dialog open={showCalendar} onClose={() => setShowCalendar(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <CalendarMonthIcon sx={{ mr: 1 }} />
            Scholarship Calendar
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Upcoming Deadlines</Typography>
              <List>
                {deadlineReminders.map((reminder) => (
                  <ListItem key={reminder.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: reminder.priority === 'high' ? 'error.main' : 
                                reminder.priority === 'medium' ? 'warning.main' : 'info.main' 
                      }}>
                        <EventIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <MuiListItemText
                      primary={reminder.scholarship}
                      secondary={new Date(reminder.deadline).toLocaleDateString()}
                    />
                    <Chip label={`${reminder.daysLeft} days`} size="small" />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Calendar Integration</Typography>
              <Stack spacing={2}>
                <Button variant="outlined" startIcon={<CalendarIcon />} fullWidth>
                  Add to Google Calendar
                </Button>
                <Button variant="outlined" startIcon={<CalendarIcon />} fullWidth>
                  Add to Outlook
                </Button>
                <Button variant="outlined" startIcon={<CalendarIcon />} fullWidth>
                  Export iCal
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCalendar(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Application Templates Dialog */}
      <Dialog open={showTemplates} onClose={() => setShowTemplates(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <DescriptionIcon sx={{ mr: 1 }} />
            Application Templates
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {applicationTemplates.map((template) => (
              <Grid item xs={12} md={6} key={template.id}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>{template.name}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category: {template.category}
                  </Typography>
                  <Typography variant="body2" gutterBottom>Includes:</Typography>
                  <Stack spacing={0.5}>
                    {template.fields.map((field, index) => (
                      <Box key={index} display="flex" alignItems="center">
                        <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">{field}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                    Use Template
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplates(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Peer Comparison Dialog */}
      <Dialog open={false} onClose={() => {}} maxWidth="sm" fullWidth>
        <DialogTitle>Peer Comparison</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">{peerComparison.myGPA}</Typography>
                <Typography variant="body2">Your GPA</Typography>
                <Typography variant="caption" color="text.secondary">
                  vs {peerComparison.averageGPA} average
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">{peerComparison.mySuccessRate}%</Typography>
                <Typography variant="body2">Your Success Rate</Typography>
                <Typography variant="caption" color="text.secondary">
                  vs {peerComparison.averageSuccessRate}% average
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>You're in the top {peerComparison.percentile}% of applicants</Typography>
              <LinearProgress 
                variant="determinate" 
                value={peerComparison.percentile} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </UniversityLayout>
  );
};

export default UniversityApplications;