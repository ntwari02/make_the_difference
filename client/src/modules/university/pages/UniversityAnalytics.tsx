import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  useTheme,
  Button,
  Chip,
  IconButton,
  Tooltip as MuiTooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment,
  Stack,
  Divider,
  LinearProgress,
  Alert,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Paper,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  People,
  AttachMoney,
  School,
  Assignment,
  EmojiEvents,
  Schedule,
  LocationOn,
  Language,
  Psychology,
  Analytics,
  Insights,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart,
  Timeline,
  Download,
  Refresh,
  FilterList,
  Search,
  CalendarToday,
  MoreVert,
  Visibility,
  Edit,
  Share,
  GetApp,
  CloudDownload,
  Print,
  Email,
  Notifications,
  Warning,
  CheckCircle,
  Error,
  Info,
  Star,
  StarBorder,
  Favorite,
  Bookmark,
  Flag,
  TrendingFlat,
  Speed,
  Timer,
  AccessTime,
  DateRange,
  Today,
  Event,
  Schedule as ScheduleIcon,
  AutoAwesome,
  SmartToy,
  Lightbulb,
  Psychology as PsychologyIcon,
  Science,
  Business,
  Palette,
  Diamond,
  WorkspacePremium,
  MilitaryTech,
  LocalLibrary,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, FunnelChart, Funnel, LabelList, Treemap, RadialBarChart, RadialBar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import UniversityLayout from '../components/layout/UniversityLayout';
import { getTooltipProps, getGridProps, getXAxisProps, getYAxisProps, getLegendStyle } from '../../../shared/charts/rechartsTheme';

const UniversityAnalytics: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('6months');
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState(['applications', 'awards', 'revenue']);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Enhanced mock data
  const monthlyData = [
    { month: 'Jan', submitted: 120, approved: 40, awardRate: 33, revenue: 45000, avgAward: 1125, demographics: { male: 60, female: 40 }, geography: { domestic: 75, international: 25 } },
    { month: 'Feb', submitted: 150, approved: 55, awardRate: 37, revenue: 55000, avgAward: 1000, demographics: { male: 58, female: 42 }, geography: { domestic: 72, international: 28 } },
    { month: 'Mar', submitted: 140, approved: 52, awardRate: 37, revenue: 52000, avgAward: 1000, demographics: { male: 62, female: 38 }, geography: { domestic: 78, international: 22 } },
    { month: 'Apr', submitted: 180, approved: 70, awardRate: 39, revenue: 70000, avgAward: 1000, demographics: { male: 55, female: 45 }, geography: { domestic: 70, international: 30 } },
    { month: 'May', submitted: 200, approved: 85, awardRate: 42, revenue: 85000, avgAward: 1000, demographics: { male: 57, female: 43 }, geography: { domestic: 73, international: 27 } },
    { month: 'Jun', submitted: 210, approved: 92, awardRate: 44, revenue: 92000, avgAward: 1000, demographics: { male: 59, female: 41 }, geography: { domestic: 76, international: 24 } },
  ];

  const categoryData = [
    { name: 'STEM', applications: 450, awards: 180, amount: 180000, percentage: 40 },
    { name: 'Business', applications: 320, awards: 128, amount: 128000, percentage: 28 },
    { name: 'Arts', applications: 280, awards: 112, amount: 112000, percentage: 25 },
    { name: 'Health', applications: 200, awards: 80, amount: 80000, percentage: 18 },
    { name: 'Education', applications: 150, awards: 60, amount: 60000, percentage: 13 },
  ];

  const demographicData = [
    { name: 'Male', value: 58, color: theme.palette.primary.main },
    { name: 'Female', value: 42, color: theme.palette.secondary.main },
  ];

  const geographicData = [
    { name: 'North America', applications: 1200, awards: 480, amount: 480000 },
    { name: 'Europe', applications: 800, awards: 320, amount: 320000 },
    { name: 'Asia', applications: 600, awards: 240, amount: 240000 },
    { name: 'South America', applications: 300, awards: 120, amount: 120000 },
    { name: 'Africa', applications: 200, awards: 80, amount: 80000 },
    { name: 'Oceania', applications: 100, awards: 40, amount: 40000 },
  ];

  const performanceMetrics = [
    { metric: 'Application Processing Time', current: 14, target: 10, unit: 'days', trend: 'up', change: 12 },
    { metric: 'Award Rate', current: 42, target: 45, unit: '%', trend: 'up', change: 8 },
    { metric: 'Student Satisfaction', current: 4.2, target: 4.5, unit: '/5', trend: 'down', change: -5 },
    { metric: 'Revenue Growth', current: 15, target: 20, unit: '%', trend: 'up', change: 25 },
  ];

  const topPerformers = [
    { name: 'Dr. Sarah Johnson', department: 'Computer Science', applications: 45, awards: 18, rate: 40 },
    { name: 'Prof. Michael Chen', department: 'Business', applications: 38, awards: 15, rate: 39 },
    { name: 'Dr. Emily Rodriguez', department: 'Engineering', applications: 42, awards: 16, rate: 38 },
    { name: 'Prof. David Kim', department: 'Medicine', applications: 35, awards: 13, rate: 37 },
  ];

  const insights = [
    { type: 'success', title: 'High Performance Alert', message: 'STEM scholarships showing 40% award rate - above target', action: 'View Details' },
    { type: 'warning', title: 'Processing Time Alert', message: 'Average processing time increased by 12% this month', action: 'Optimize Process' },
    { type: 'info', title: 'Growth Opportunity', message: 'International applications increased by 25% - consider expanding', action: 'Explore Options' },
  ];

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdated(new Date());
        // Simulate data refresh
        console.log('Refreshing analytics data...');
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleExport = () => {
    setLoading(true);
    // Simulate export process
    setTimeout(() => {
      setLoading(false);
      setShowExportDialog(false);
      console.log(`Exporting analytics data as ${exportFormat}`);
    }, 2000);
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
              <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive insights into scholarship performance and trends
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <MuiTooltip title="Refresh Data">
              <IconButton onClick={() => setLastUpdated(new Date())}>
                <Refresh />
              </IconButton>
            </MuiTooltip>
            <MuiTooltip title="Export Report">
              <IconButton onClick={() => setShowExportDialog(true)}>
                <Download />
              </IconButton>
            </MuiTooltip>
            <MuiTooltip title="Share Dashboard">
              <IconButton>
                <Share />
              </IconButton>
            </MuiTooltip>
          </Stack>
        </Box>

        {/* Status Bar */}
        <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
          <CardContent sx={{ py: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Chip 
                  icon={<CheckCircle />} 
                  label="Live Data" 
                  color="success" 
                  size="small" 
                />
                <Typography variant="body2" color="text.secondary">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Auto-refresh"
                />
              </Box>
              <Box display="flex" gap={1}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    label="Date Range"
                  >
                    <MenuItem value="7days">Last 7 days</MenuItem>
                    <MenuItem value="30days">Last 30 days</MenuItem>
                    <MenuItem value="3months">Last 3 months</MenuItem>
                    <MenuItem value="6months">Last 6 months</MenuItem>
                    <MenuItem value="1year">Last year</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)` }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Total Applications
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        1,200
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" color="success.main">
                          +12% vs last month
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <Assignment />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)` }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Awards Granted
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        480
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" color="success.main">
                          +8% vs last month
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                      <EmojiEvents />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)` }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Total Awarded
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        $480K
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" color="success.main">
                          +15% vs last month
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                      <AttachMoney />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${theme.palette.info.main}15, ${theme.palette.info.main}05)` }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Award Rate
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        42%
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" color="success.main">
                          +3% vs last month
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                      <Assessment />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Main Analytics Tabs */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Overview" icon={<BarChartIcon />} />
              <Tab label="Demographics" icon={<People />} />
              <Tab label="Performance" icon={<TrendingUp />} />
              <Tab label="Insights" icon={<Lightbulb />} />
              <Tab label="Predictions" icon={<SmartToy />} />
            </Tabs>
      </Box>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card sx={{ height: 400 }}>
            <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Monthly Applications & Awards Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height={320}>
                      <ComposedChart data={monthlyData}>
                    <defs>
                      <linearGradient id="submittedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme.palette.success.main} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={theme.palette.success.main} stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...getGridProps(theme)} />
                    <XAxis dataKey="month" {...getXAxisProps(theme)} />
                        <YAxis yAxisId="left" {...getYAxisProps(theme)} />
                        <YAxis yAxisId="right" orientation="right" {...getYAxisProps(theme)} />
                    <Tooltip {...getTooltipProps(theme)} />
                    <Legend wrapperStyle={getLegendStyle(theme)} />
                        <Bar yAxisId="left" dataKey="submitted" name="Applications" fill="url(#submittedGradient)" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="approved" name="Awards" fill="url(#approvedGradient)" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="awardRate" name="Award Rate %" stroke={theme.palette.info.main} strokeWidth={3} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card sx={{ height: 400 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Category Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={320}>
                      <RechartsPieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="applications"
                        >
                          {categoryData.map((entry, index) => {
                            const colors = [
                              theme.palette.primary.main,
                              theme.palette.secondary.main,
                              theme.palette.success.main,
                              theme.palette.warning.main,
                              theme.palette.error.main,
                              theme.palette.info.main
                            ];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip {...getTooltipProps(theme)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: 300 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Gender Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <RechartsPieChart>
                        <Pie
                          data={demographicData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {demographicData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip {...getTooltipProps(theme)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: 300 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Geographic Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={geographicData} layout="horizontal">
                        <CartesianGrid {...getGridProps(theme)} />
                        <XAxis type="number" {...getXAxisProps(theme)} />
                        <YAxis dataKey="name" type="category" {...getYAxisProps(theme)} />
                        <Tooltip {...getTooltipProps(theme)} />
                        <Bar dataKey="applications" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      {performanceMetrics.map((metric, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {metric.metric}
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                              {metric.current}{metric.unit}
                            </Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                              {metric.trend === 'up' ? (
                                <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                              ) : (
                                <TrendingDown sx={{ color: 'error.main', mr: 0.5, fontSize: 16 }} />
                              )}
                              <Typography variant="body2" color={metric.trend === 'up' ? 'success.main' : 'error.main'}>
                                {metric.change > 0 ? '+' : ''}{metric.change}%
                              </Typography>
              </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={(metric.current / metric.target) * 100} 
                              sx={{ mt: 1 }}
                              color={metric.current >= metric.target ? 'success' : 'warning'}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Target: {metric.target}{metric.unit}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
            </CardContent>
          </Card>
        </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Performing Reviewers
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Reviewer</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell align="right">Applications</TableCell>
                            <TableCell align="right">Awards</TableCell>
                            <TableCell align="right">Rate</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {topPerformers.map((performer, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                    {performer.name.split(' ').map(n => n[0]).join('')}
                                  </Avatar>
                                  {performer.name}
                                </Box>
                              </TableCell>
                              <TableCell>{performer.department}</TableCell>
                              <TableCell align="right">{performer.applications}</TableCell>
                              <TableCell align="right">{performer.awards}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`${performer.rate}%`} 
                                  color={performer.rate >= 40 ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  AI-Powered Insights
                </Typography>
                <Stack spacing={2}>
                  {insights.map((insight, index) => (
                    <Alert 
                      key={index}
                      severity={insight.type as any}
                      action={
                        <Button color="inherit" size="small">
                          {insight.action}
                        </Button>
                      }
                    >
                      <Typography variant="subtitle2">{insight.title}</Typography>
                      <Typography variant="body2">{insight.message}</Typography>
                    </Alert>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
            <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Predictive Analytics & Forecasting
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      AI-powered predictions for next quarter performance
                    </Typography>
                    <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                          <defs>
                            <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={theme.palette.info.main} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={theme.palette.info.main} stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                    <CartesianGrid {...getGridProps(theme)} />
                    <XAxis dataKey="month" {...getXAxisProps(theme)} />
                    <YAxis {...getYAxisProps(theme)} />
                    <Tooltip {...getTooltipProps(theme)} />
                          <Area type="monotone" dataKey="submitted" name="Historical" stroke={theme.palette.primary.main} fill="url(#predictionGradient)" />
                          <Line type="monotone" dataKey="approved" name="Predicted" stroke={theme.palette.warning.main} strokeWidth={2} strokeDasharray="5 5" />
                        </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
          </TabPanel>
        </Card>
      </Box>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Analytics Report</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              label="Export Format"
            >
              <MenuItem value="pdf">PDF Report</MenuItem>
              <MenuItem value="excel">Excel Spreadsheet</MenuItem>
              <MenuItem value="csv">CSV Data</MenuItem>
              <MenuItem value="json">JSON Data</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Date Range"
            >
              <MenuItem value="7days">Last 7 days</MenuItem>
              <MenuItem value="30days">Last 30 days</MenuItem>
              <MenuItem value="3months">Last 3 months</MenuItem>
              <MenuItem value="6months">Last 6 months</MenuItem>
              <MenuItem value="1year">Last year</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </UniversityLayout>
  );
};

export default UniversityAnalytics;


