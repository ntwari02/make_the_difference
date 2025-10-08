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
  TravelExplore,
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
  Security,
  VerifiedUser,
  Gavel,
  Policy,
  AccountBalance,
  Payment,
  Receipt,
  CreditCard,
  MonetizationOn,
  TrendingUp as TrendingUpIcon,
  Public,
  Language as LanguageIcon,
  Flag as FlagIcon,
  Public as PublicIcon,
  FlightTakeoff,
  FlightLand,
  AirportShuttle,
  DirectionsCar,
  Train,
  Bus,
  DirectionsBoat,
  DirectionsSubway,
  DirectionsWalk,
  DirectionsRun,
  DirectionsBike,
  DirectionsTransit,
  LocalAirport,
  Hotel,
  Restaurant,
  ShoppingCart,
  Store,
  Business as BusinessIcon,
  Work,
  School,
  Home,
  Person,
  Group,
  FamilyRestroom,
  ChildCare,
  Elderly,
  Accessibility,
  WheelchairPickup,
  Hearing,
  Visibility as VisibilityIcon,
  VisibilityOff,
  Lock,
  LockOpen,
  Security as SecurityIcon,
  Shield,
  Verified,
  Gavel as GavelIcon,
  Policy as PolicyIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  MonetizationOn as MonetizationOnIcon,
} from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, FunnelChart, Funnel, LabelList, Treemap, RadialBarChart, RadialBar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import VisaLayout from '../components/layout/VisaLayout';
import { getTooltipProps, getGridProps, getXAxisProps, getYAxisProps, getLegendStyle } from '../../../shared/charts/rechartsTheme';

const VisaAnalytics: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('6months');
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState(['applications', 'approvals', 'revenue']);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Enhanced visa analytics data
  const monthlyData = [
    { month: 'Jan', submitted: 80, approved: 30, pending: 25, rejected: 5, rate: 38, processingTime: 12, revenue: 15000, avgFee: 500 },
    { month: 'Feb', submitted: 95, approved: 40, pending: 30, rejected: 8, rate: 42, processingTime: 11, revenue: 18000, avgFee: 520 },
    { month: 'Mar', submitted: 110, approved: 45, pending: 35, rejected: 10, rate: 41, processingTime: 13, revenue: 21000, avgFee: 510 },
    { month: 'Apr', submitted: 120, approved: 55, pending: 40, rejected: 12, rate: 46, processingTime: 10, revenue: 24000, avgFee: 530 },
    { month: 'May', submitted: 140, approved: 60, pending: 45, rejected: 15, rate: 43, processingTime: 12, revenue: 28000, avgFee: 540 },
    { month: 'Jun', submitted: 150, approved: 62, pending: 50, rejected: 18, rate: 41, processingTime: 14, revenue: 30000, avgFee: 550 },
  ];

  const visaTypeData = [
    { name: 'Tourist Visa', applications: 450, approvals: 180, amount: 90000, percentage: 40, avgProcessingTime: 10 },
    { name: 'Business Visa', applications: 320, approvals: 128, amount: 128000, percentage: 40, avgProcessingTime: 12 },
    { name: 'Student Visa', applications: 280, approvals: 112, amount: 112000, percentage: 40, avgProcessingTime: 15 },
    { name: 'Work Visa', applications: 200, approvals: 80, amount: 80000, percentage: 40, avgProcessingTime: 18 },
    { name: 'Transit Visa', applications: 150, approvals: 60, amount: 30000, percentage: 40, avgProcessingTime: 8 },
  ];

  const statusData = [
    { name: 'Approved', value: 45, color: theme.palette.success.main },
    { name: 'Pending', value: 35, color: theme.palette.warning.main },
    { name: 'Rejected', value: 20, color: theme.palette.error.main },
  ];

  const countryData = [
    { name: 'United States', applications: 800, approvals: 320, amount: 160000, avgProcessingTime: 12 },
    { name: 'United Kingdom', applications: 600, approvals: 240, amount: 120000, avgProcessingTime: 14 },
    { name: 'Canada', applications: 500, approvals: 200, amount: 100000, avgProcessingTime: 10 },
    { name: 'Australia', applications: 400, approvals: 160, amount: 80000, avgProcessingTime: 16 },
    { name: 'Germany', applications: 300, approvals: 120, amount: 60000, avgProcessingTime: 11 },
    { name: 'France', applications: 250, approvals: 100, amount: 50000, avgProcessingTime: 13 },
  ];

  const officerPerformance = [
    { name: 'Officer Sarah Johnson', department: 'Tourist Visas', applications: 45, approvals: 18, rate: 40, avgProcessingTime: 10 },
    { name: 'Officer Michael Chen', department: 'Business Visas', applications: 38, approvals: 15, rate: 39, avgProcessingTime: 12 },
    { name: 'Officer Emily Rodriguez', department: 'Student Visas', applications: 42, approvals: 16, rate: 38, avgProcessingTime: 15 },
    { name: 'Officer David Kim', department: 'Work Visas', applications: 35, approvals: 13, rate: 37, avgProcessingTime: 18 },
  ];

  const performanceMetrics = [
    { metric: 'Average Processing Time', current: 12, target: 10, unit: 'days', trend: 'up', change: 8 },
    { metric: 'Approval Rate', current: 42, target: 45, unit: '%', trend: 'up', change: 5 },
    { metric: 'Customer Satisfaction', current: 4.3, target: 4.5, unit: '/5', trend: 'down', change: -3 },
    { metric: 'Revenue Growth', current: 18, target: 20, unit: '%', trend: 'up', change: 22 },
  ];

  const insights = [
    { type: 'success', title: 'High Performance Alert', message: 'Tourist visa processing showing 40% approval rate - above target', action: 'View Details' },
    { type: 'warning', title: 'Processing Time Alert', message: 'Average processing time increased by 8% this month', action: 'Optimize Process' },
    { type: 'info', title: 'Growth Opportunity', message: 'Business visa applications increased by 25% - consider expanding', action: 'Explore Options' },
  ];

  const complianceMetrics = [
    { metric: 'Security Clearance Rate', value: 98.5, unit: '%', status: 'excellent' },
    { metric: 'Document Verification', value: 95.2, unit: '%', status: 'good' },
    { metric: 'Background Check Completion', value: 99.1, unit: '%', status: 'excellent' },
    { metric: 'Compliance Violations', value: 0.3, unit: '%', status: 'good' },
  ];

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdated(new Date());
        // Simulate data refresh
        console.log('Refreshing visa analytics data...');
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
      console.log(`Exporting visa analytics data as ${exportFormat}`);
    }, 2000);
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <VisaLayout>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
              Visa Analytics Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive insights into visa processing performance and trends
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
                        1,400
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" color="success.main">
                          +15% vs last month
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
                        Visas Approved
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        560
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" color="success.main">
                          +12% vs last month
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
                        Total Revenue
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        $280K
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" color="success.main">
                          +18% vs last month
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
                        Approval Rate
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        42%
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" color="success.main">
                          +5% vs last month
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
              <Tab label="Visa Types" icon={<TravelExplore />} />
              <Tab label="Performance" icon={<TrendingUp />} />
              <Tab label="Compliance" icon={<Security />} />
              <Tab label="Insights" icon={<Lightbulb />} />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card sx={{ height: 400 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Monthly Applications & Approvals Trend
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
                        <Bar yAxisId="left" dataKey="approved" name="Approved" fill="url(#approvedGradient)" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="rate" name="Approval Rate %" stroke={theme.palette.info.main} strokeWidth={3} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card sx={{ height: 400 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Application Status Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={320}>
                      <RechartsPieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name} ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
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
                      Visa Type Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <RechartsPieChart>
                        <Pie
                          data={visaTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="applications"
                        >
                          {visaTypeData.map((entry, index) => {
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

              <Grid item xs={12} md={6}>
                <Card sx={{ height: 300 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Country-wise Applications
                    </Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={countryData} layout="horizontal">
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
                      Top Performing Visa Officers
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Officer</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell align="right">Applications</TableCell>
                            <TableCell align="right">Approvals</TableCell>
                            <TableCell align="right">Rate</TableCell>
                            <TableCell align="right">Avg. Time</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {officerPerformance.map((officer, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                    {officer.name.split(' ').map(n => n[0]).join('')}
                                  </Avatar>
                                  {officer.name}
                                </Box>
                              </TableCell>
                              <TableCell>{officer.department}</TableCell>
                              <TableCell align="right">{officer.applications}</TableCell>
                              <TableCell align="right">{officer.approvals}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`${officer.rate}%`} 
                                  color={officer.rate >= 40 ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">{officer.avgProcessingTime} days</TableCell>
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
                  Compliance & Security Metrics
                </Typography>
                <Grid container spacing={2}>
                  {complianceMetrics.map((metric, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {metric.metric}
                              </Typography>
                              <Typography variant="h4" fontWeight={700}>
                                {metric.value}{metric.unit}
                              </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: metric.status === 'excellent' ? 'success.main' : 'warning.main' }}>
                              {metric.status === 'excellent' ? <CheckCircle /> : <Warning />}
                            </Avatar>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
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
        </Card>
      </Box>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Visa Analytics Report</DialogTitle>
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
    </VisaLayout>
  );
};

export default VisaAnalytics;


