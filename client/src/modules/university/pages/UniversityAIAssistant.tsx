import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  GridLegacy as Grid,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  SmartToy,
  AutoAwesome,
  Psychology,
  Analytics,
  Lightbulb,
  Chat,
  Email,
  Description,
  Assessment,
  TrendingUp,
  Insights,
  Speed,
  Security,
  School,
  People,
  AttachMoney,
  Schedule,
  CheckCircle,
  Warning,
  Info,
  Refresh,
  Download,
  Share,
  Bookmark,
  Star,
  StarBorder,
  MoreVert,
  ExpandMore,
  Send,
  ContentCopy,
  Edit,
  Delete,
  Add,
  Search,
  FilterList,
  Settings,
  Help,
  Support,
  Feedback,
  ThumbUp,
  ThumbDown,
  Flag,
  Report,
  Visibility,
  VisibilityOff,
  Lock,
  Public,
  Group,
  Person,
  Business,
  Science,
  Art,
  Sports,
  Music,
  Technology,
  Health,
  Environment,
  Education,
  Research,
  Innovation,
  Leadership,
  Community,
  Diversity,
  Inclusion,
  Sustainability,
  Global,
  Local,
  Remote,
  Hybrid,
  Online,
  Offline,
  Mobile,
  Desktop,
  Tablet,
  Watch,
  Camera,
  Video,
  Audio,
  Image,
  File,
  Folder,
  Cloud,
  Database,
  Server,
  Network,
  Internet,
  Wifi,
  Bluetooth,
  GPS,
  Location,
  Map,
  Directions,
  Travel,
  Flight,
  Hotel,
  Restaurant,
  Shopping,
  Payment,
  CreditCard,
  Money,
  Budget,
  Finance,
  Investment,
  Savings,
  Loan,
  Insurance,
  Tax,
  Legal,
  Contract,
  Agreement,
  Policy,
  Terms,
  Privacy,
  Security as SecurityIcon,
  Shield,
  Verified,
  Certificate,
  Award,
  Medal,
  Trophy,
  Badge as BadgeIcon,
  EmojiEvents,
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
  Message,
  Mail,
  Phone,
  Call,
  VideoCall,
  Meeting,
  Conference,
  Webinar,
  Workshop,
  Training,
  Course,
  Lesson,
  Class,
  Lecture,
  Seminar,
  Presentation,
  Demo,
  Tutorial,
  Guide,
  Manual,
  Documentation,
  Help as HelpIcon,
  FAQ,
  Support as SupportIcon,
  Contact,
  About,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error,
  Success,
  Check,
  Close,
  Cancel,
  Save,
  SaveAlt,
  OpenInNew,
  Launch,
  ExternalLink,
  Link,
  AttachFile,
  Upload,
  Download as DownloadIcon,
  CloudUpload,
  CloudDownload,
  Sync,
  Autorenew,
  Loop,
  Replay,
  Restart,
  Refresh as RefreshIcon,
  Update,
  Upgrade,
  Install,
  Uninstall,
  Settings as SettingsIcon,
  Tune,
  Adjust,
  Configure,
  Customize,
  Personalize,
  Preferences,
  Options,
  Menu,
  MoreHoriz,
  MoreVert as MoreVertIcon,
  Apps,
  GridView,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
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
  Dashboard as DashboardIcon,
  Home,
  AccountCircle,
  Person as PersonIcon,
  Group as GroupIcon,
  Public as PublicIcon,
  Language,
  Translate,
  GTranslate,
  Accessibility,
  AccessibilityNew,
  Hearing,
  HearingDisabled,
  RecordVoiceOver,
  VoiceOverOff,
  VolumeUp,
  VolumeDown,
  VolumeOff,
  VolumeMute,
  Mic,
  MicOff,
  MicNone,
  Headset,
  HeadsetMic,
  Headphones,
  Speaker,
  SpeakerGroup,
  SpeakerNotes,
  SpeakerNotesOff,
  Radio,
  Tv,
  Computer,
  Laptop,
  Phone as PhoneIcon,
  PhoneAndroid,
  PhoneIphone,
  Tablet as TabletIcon,
  Watch as WatchIcon,
  Devices,
  DeviceHub,
  Router,
  Memory,
  Storage,
  HardDrive,
  SdCard,
  Usb,
  Bluetooth as BluetoothIcon,
  Wifi as WifiIcon,
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

const UniversityAIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [inputText, setInputText] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{id: string, type: 'user' | 'ai', message: string, timestamp: Date}>>([]);
  const [currentChat, setCurrentChat] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // AI Tools Data
  const aiTools = [
    { id: 'content', name: 'Content Generator', icon: <AutoAwesome />, description: 'Generate scholarship descriptions, emails, and documents', color: 'primary' },
    { id: 'analytics', name: 'AI Analytics', icon: <Analytics />, description: 'Get insights from your scholarship data', color: 'success' },
    { id: 'chat', name: 'AI Chatbot', icon: <Chat />, description: 'Get instant answers and support', color: 'info' },
    { id: 'review', name: 'Application Reviewer', icon: <Assessment />, description: 'AI-powered application analysis', color: 'warning' },
    { id: 'recommend', name: 'Smart Recommendations', icon: <Lightbulb />, description: 'Personalized suggestions and insights', color: 'secondary' },
    { id: 'automation', name: 'Workflow Automation', icon: <Speed />, description: 'Automate repetitive tasks', color: 'error' },
  ];

  const templates = [
    { id: 'scholarship-desc', name: 'Scholarship Description', category: 'Content', prompt: 'Write a compelling scholarship description for...' },
    { id: 'applicant-email', name: 'Applicant Communication', category: 'Communication', prompt: 'Draft a professional email to an applicant about...' },
    { id: 'rejection-letter', name: 'Rejection Letter', category: 'Communication', prompt: 'Write a respectful rejection letter for...' },
    { id: 'acceptance-letter', name: 'Acceptance Letter', category: 'Communication', prompt: 'Draft an acceptance letter for...' },
    { id: 'essay-prompt', name: 'Essay Prompt', category: 'Content', prompt: 'Create an engaging essay prompt about...' },
    { id: 'report-summary', name: 'Report Summary', category: 'Analytics', prompt: 'Summarize the scholarship application data...' },
  ];

  const mockInsights = [
    { id: '1', title: 'Application Quality Trend', insight: 'Application quality has improved by 15% this month', confidence: 92, type: 'positive' },
    { id: '2', title: 'Demographic Analysis', insight: 'STEM applications increased by 25% among female applicants', confidence: 88, type: 'info' },
    { id: '3', title: 'Deadline Optimization', insight: 'Applications submitted 2 weeks before deadline show 30% higher success rate', confidence: 95, type: 'recommendation' },
  ];

  const mockRecommendations = [
    { id: '1', title: 'Expand STEM Scholarships', description: 'Consider adding more STEM-focused scholarships based on demand', priority: 'high', impact: 'high' },
    { id: '2', title: 'Improve Communication', description: 'Send reminder emails 1 week before deadlines', priority: 'medium', impact: 'medium' },
    { id: '3', title: 'Diversify Criteria', description: 'Add more inclusive eligibility criteria', priority: 'high', impact: 'high' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent(`AI-generated content based on: "${inputText}"\n\nThis is a comprehensive, well-structured response that addresses your request with detailed information and actionable insights. The AI has analyzed your input and provided relevant suggestions and recommendations.`);
      setIsGenerating(false);
    }, 2000);
  };

  const handleChatSend = () => {
    if (!currentChat.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      message: currentChat,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, newMessage]);
    setCurrentChat('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        message: `I understand you're asking about "${currentChat}". Here's my response with detailed insights and recommendations.`,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <UniversityLayout>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              <SmartToy sx={{ mr: 1, verticalAlign: 'middle' }} />
              AI Assistant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Intelligent tools to enhance your scholarship management
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="AI Settings">
              <IconButton>
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="Help & Support">
              <IconButton>
                <Help />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* AI Tools Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {aiTools.map((tool, index) => (
            <Grid item xs={12} sm={6} md={4} key={tool.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: `${tool.color}.main`, mr: 2 }}>
                        {tool.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        {tool.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {tool.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Main AI Interface */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Content Generator" icon={<AutoAwesome />} />
              <Tab label="AI Chatbot" icon={<Chat />} />
              <Tab label="Analytics & Insights" icon={<Analytics />} />
              <Tab label="Templates" icon={<Description />} />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Input Your Request</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe what you want to generate... (e.g., 'Write a scholarship description for computer science students')"
                  sx={{ mb: 2 }}
                />
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    onClick={handleGenerate}
                    disabled={!inputText.trim() || isGenerating}
                    startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoAwesome />}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Content'}
                  </Button>
                  <Button variant="outlined" onClick={() => setInputText('')}>
                    Clear
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Generated Content</Typography>
                <Paper sx={{ p: 2, minHeight: 200, bgcolor: 'grey.50' }}>
                  {generatedContent ? (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {generatedContent}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Generated content will appear here...
                    </Typography>
                  )}
                </Paper>
                {generatedContent && (
                  <Box display="flex" gap={1} mt={2}>
                    <Button size="small" startIcon={<ContentCopy />}>Copy</Button>
                    <Button size="small" startIcon={<Edit />}>Edit</Button>
                    <Button size="small" startIcon={<Download />}>Save</Button>
                  </Box>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>AI Chat Assistant</Typography>
                <Paper sx={{ height: 400, p: 2, overflow: 'auto', bgcolor: 'grey.50' }}>
                  {chatHistory.length === 0 ? (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                      <Typography variant="body2" color="text.secondary">
                        Start a conversation with the AI assistant...
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {chatHistory.map((msg) => (
                        <Box
                          key={msg.id}
                          display="flex"
                          justifyContent={msg.type === 'user' ? 'flex-end' : 'flex-start'}
                        >
                          <Paper
                            sx={{
                              p: 2,
                              maxWidth: '70%',
                              bgcolor: msg.type === 'user' ? 'primary.main' : 'background.paper',
                              color: msg.type === 'user' ? 'primary.contrastText' : 'text.primary'
                            }}
                          >
                            <Typography variant="body2">
                              {msg.message}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {msg.timestamp.toLocaleTimeString()}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Paper>
                <Box display="flex" gap={1} mt={2}>
                  <TextField
                    fullWidth
                    value={currentChat}
                    onChange={(e) => setCurrentChat(e.target.value)}
                    placeholder="Ask the AI assistant anything..."
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleChatSend}
                    disabled={!currentChat.trim()}
                    startIcon={<Send />}
                  >
                    Send
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Stack spacing={1}>
                  <Button variant="outlined" startIcon={<School />} fullWidth>
                    Scholarship Help
                  </Button>
                  <Button variant="outlined" startIcon={<People />} fullWidth>
                    Application Support
                  </Button>
                  <Button variant="outlined" startIcon={<Analytics />} fullWidth>
                    Data Analysis
                  </Button>
                  <Button variant="outlined" startIcon={<Email />} fullWidth>
                    Communication Help
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>AI Insights</Typography>
                <Stack spacing={2}>
                  {mockInsights.map((insight) => (
                    <Card key={insight.id}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {insight.title}
                          </Typography>
                          <Chip
                            label={`${insight.confidence}% confidence`}
                            size="small"
                            color={insight.confidence > 90 ? 'success' : 'warning'}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {insight.insight}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={insight.confidence}
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Smart Recommendations</Typography>
                <Stack spacing={2}>
                  {mockRecommendations.map((rec) => (
                    <Card key={rec.id}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {rec.title}
                          </Typography>
                          <Chip
                            label={rec.priority}
                            size="small"
                            color={rec.priority === 'high' ? 'error' : 'warning'}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {rec.description}
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Button size="small" variant="outlined">Implement</Button>
                          <Button size="small">Learn More</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>Content Templates</Typography>
            <Grid container spacing={2}>
              {templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {template.name}
                      </Typography>
                      <Chip label={template.category} size="small" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {template.prompt}
                      </Typography>
                      <Button size="small" variant="outlined" fullWidth>
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Card>
      </Box>
    </UniversityLayout>
  );
};

export default UniversityAIAssistant;


