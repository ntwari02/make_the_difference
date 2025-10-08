import React from 'react';
import { Box, GridLegacy as Grid, Card, CardContent, Typography, Chip, useTheme, Button, Alert, LinearProgress, Avatar, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, IconButton, Badge, Divider } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { getTooltipProps, getGridProps, getXAxisProps, getYAxisProps, getLegendStyle } from '../../../shared/charts/rechartsTheme';
import UniversityLayout from '../components/layout/UniversityLayout';
import { Assessment, School, Assignment, EmojiEvents, TrendingUp, TrendingDown, People, AttachMoney, Schedule, NotificationsActive, CheckCircle, Warning, Error, Info, MoreVert, Visibility, Edit, Delete, Add, FilterList, Search, Download, Upload } from '@mui/icons-material';
import { universityApi } from '../services/universityApi';

const UniversityDashboard: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = React.useState<any | null>(null);
  const [monthly, setMonthly] = React.useState<any[]>([]);
  const [recentApplications, setRecentApplications] = React.useState<any[]>([]);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [topScholarships, setTopScholarships] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await universityApi.getProviderApplicationStats();
        setStats(data || {});
        setMonthly(Array.isArray(data?.monthly) ? data.monthly : []);
        
        // Load additional data
        const applications = await universityApi.getApplications();
        setRecentApplications(Array.isArray(applications) ? applications.slice(0, 5) : []);
        
        const scholarships = await universityApi.getScholarships();
        setTopScholarships(Array.isArray(scholarships) ? scholarships.slice(0, 3) : []);
        
        // Mock notifications
        setNotifications([
          { id: 1, type: 'success', message: 'New scholarship application received', time: '2 min ago', unread: true },
          { id: 2, type: 'warning', message: 'Application deadline approaching for Engineering Scholarship', time: '1 hour ago', unread: true },
          { id: 3, type: 'info', message: 'Monthly report generated successfully', time: '3 hours ago', unread: false },
        ]);
      } catch {}
    };
    load();
  }, []);

  // Provide polished demo data if API doesn't return anything yet
  const fallbackMonthly = [
    { month: 'Jan', submitted: 120, approved: 40, rejected: 15, pending: 65 },
    { month: 'Feb', submitted: 150, approved: 55, rejected: 20, pending: 75 },
    { month: 'Mar', submitted: 140, approved: 52, rejected: 18, pending: 70 },
    { month: 'Apr', submitted: 180, approved: 70, rejected: 25, pending: 85 },
    { month: 'May', submitted: 200, approved: 85, rejected: 30, pending: 85 },
    { month: 'Jun', submitted: 210, approved: 92, rejected: 35, pending: 83 },
  ];
  const chartMonthly = (monthly && monthly.length > 0) ? monthly : fallbackMonthly;

  // Mock data for enhanced features
  const mockRecentApplications = recentApplications.length > 0 ? recentApplications : [
    { id: 1, student_name: 'John Doe', scholarship: 'Engineering Excellence', status: 'pending', submitted: '2024-01-20', gpa: 3.8 },
    { id: 2, student_name: 'Jane Smith', scholarship: 'Computer Science Merit', status: 'approved', submitted: '2024-01-19', gpa: 3.9 },
    { id: 3, student_name: 'Mike Johnson', scholarship: 'Business Leadership', status: 'rejected', submitted: '2024-01-18', gpa: 3.2 },
    { id: 4, student_name: 'Sarah Wilson', scholarship: 'Engineering Excellence', status: 'pending', submitted: '2024-01-17', gpa: 3.7 },
    { id: 5, student_name: 'David Brown', scholarship: 'Arts & Humanities', status: 'approved', submitted: '2024-01-16', gpa: 3.6 },
  ];

  const mockTopScholarships = topScholarships.length > 0 ? topScholarships : [
    { id: 1, title: 'Engineering Excellence', applications: 45, budget: 50000, deadline: '2024-03-15' },
    { id: 2, title: 'Computer Science Merit', applications: 32, budget: 30000, deadline: '2024-03-20' },
    { id: 3, title: 'Business Leadership', applications: 28, budget: 25000, deadline: '2024-03-25' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'pending': return <Schedule />;
      case 'rejected': return <Error />;
      default: return <Info />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  return (
    <UniversityLayout>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>University Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Comprehensive scholarship management and analytics</Typography>
      </Box>

      {/* Notifications Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Update:</strong> 5 new applications received today. Review deadline for Engineering Excellence scholarship is March 15, 2024.
        </Typography>
      </Alert>

      {/* Enhanced Stats Cards */}
      <Grid container spacing={2}>
        {([ 
          { label: 'Active Scholarships', value: stats?.active_scholarships ?? '12', icon: <School color="primary" />, trend: '+2', trendUp: true },
          { label: 'Pending Applications', value: stats?.pending_applications ?? '45', icon: <Assignment color="primary" />, trend: '+8', trendUp: true },
          { label: 'Approved This Month', value: stats?.approved_this_month ?? '28', icon: <EmojiEvents color="primary" />, trend: '+12%', trendUp: true },
          { label: 'Overall Award Rate', value: (stats?.award_rate ?? '68') + '%', icon: <Assessment color="primary" />, trend: '+5%', trendUp: true },
          { label: 'Total Budget', value: '$125,000', icon: <AttachMoney color="primary" />, trend: '+$15K', trendUp: true },
          { label: 'Active Students', value: stats?.active_students ?? '156', icon: <People color="primary" />, trend: '+23', trendUp: true },
        ]).map((s) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={s.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}`, height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">{s.label}</Typography>
                    <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
                  </Box>
                  {s.icon}
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  {s.trendUp ? <TrendingUp color="success" fontSize="small" /> : <TrendingDown color="error" fontSize="small" />}
                  <Typography variant="caption" color={s.trendUp ? 'success.main' : 'error.main'}>
                    {s.trend} from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Charts Section */}
      <Grid container spacing={2} mt={1} alignItems="stretch">
        {/* Application Trends Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Application Trends</Typography>
                <Box display="flex" gap={1}>
                  <Button size="small" startIcon={<Download />}>Export</Button>
                  <Button size="small" startIcon={<FilterList />}>Filter</Button>
                </Box>
              </Box>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartMonthly}>
                    <defs>
                      <linearGradient id="submittedGradientUni" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="approvedGradientUni" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.success.main} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="rejectedGradientUni" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.error.main} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={theme.palette.error.main} stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...getGridProps(theme)} />
                    <XAxis dataKey="month" {...getXAxisProps(theme)} />
                    <YAxis {...getYAxisProps(theme)} />
                    <Tooltip {...getTooltipProps(theme)} />
                    <Legend wrapperStyle={getLegendStyle(theme)} />
                    <Bar dataKey="submitted" name="Submitted" fill="url(#submittedGradientUni)" radius={[8,8,0,0]} maxBarSize={48} />
                    <Bar dataKey="approved" name="Approved" fill="url(#approvedGradientUni)" radius={[8,8,0,0]} maxBarSize={48} />
                    <Bar dataKey="rejected" name="Rejected" fill="url(#rejectedGradientUni)" radius={[8,8,0,0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Breakdown */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Status Breakdown</Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={(() => {
                      const submitted = chartMonthly.reduce((a, m) => a + (Number(m.submitted) || 0), 0);
                      const approved = chartMonthly.reduce((a, m) => a + (Number(m.approved) || 0), 0);
                      const rejected = chartMonthly.reduce((a, m) => a + (Number(m.rejected) || 0), 0);
                      const pending = Math.max(submitted - approved - rejected, 0);
                      return [
                        { name: 'Approved', value: approved, color: theme.palette.success.main },
                        { name: 'Pending', value: pending, color: theme.palette.warning.main },
                        { name: 'Rejected', value: rejected, color: theme.palette.error.main },
                      ];
                    })()} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                      {[theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main].map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={getLegendStyle(theme)} />
                    <Tooltip {...getTooltipProps(theme)} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Engagement & Performance (compact, modern visuals) */}
      <Grid container spacing={2} mt={1} alignItems="stretch">
        {/* Engagement Overview (sparklines) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}`, height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Engagement Overview</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
                {[{label: 'Views', color: theme.palette.primary.main, data: [20, 40, 35, 50, 60, 80, 75]},
                  {label: 'Starts', color: theme.palette.success.main, data: [10, 18, 22, 28, 35, 44, 50]},
                  {label: 'Completions', color: theme.palette.info.main, data: [4, 8, 10, 15, 18, 20, 24]},
                  {label: 'Bounce', color: theme.palette.error.main, data: [30, 28, 27, 26, 24, 22, 20]}].map((m) => (
                  <Box key={m.label} sx={{ p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                      <Box width={8} height={8} borderRadius="50%" bgcolor={m.color} />
                    </Box>
                    <Box height={48}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={m.data.map((v, i) => ({ i, v }))}>
                          <defs>
                            <linearGradient id={`grad-${m.label}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={m.color} stopOpacity={0.6} />
                              <stop offset="100%" stopColor={m.color} stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="v" stroke={m.color} strokeWidth={2} fill={`url(#grad-${m.label})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Application Funnel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}`, height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Application Funnel</Typography>
              {[{label: 'Viewed', value: 86, color: 'primary.main'},
                {label: 'Started', value: 62, color: 'info.main'},
                {label: 'Submitted', value: 48, color: 'success.main'},
                {label: 'Approved', value: 28, color: 'success.dark'}].map((f) => (
                <Box key={f.label} mb={1.25}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{f.value}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={f.value} sx={{ height: 6, borderRadius: 3, [`& .MuiLinearProgress-bar`]: { backgroundColor: f.color } }} />
                </Box>
              ))}
              <Box display="flex" gap={1} mt={1}>
                <Chip label="Improve conversion" size="small" variant="outlined" />
                <Chip label="View drop-offs" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Activity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}`, height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Weekly Activity</Typography>
              <Box height={120}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { d: 'Mon', v: 22 }, { d: 'Tue', v: 35 }, { d: 'Wed', v: 28 }, { d: 'Thu', v: 40 }, { d: 'Fri', v: 52 }, { d: 'Sat', v: 18 }, { d: 'Sun', v: 12 }
                  ]}>
                    <defs>
                      <linearGradient id="barAct" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...getGridProps(theme)} vertical={false} />
                    <XAxis dataKey="d" {...getXAxisProps(theme)} />
                    <YAxis hide />
                    <Tooltip {...getTooltipProps(theme)} />
                    <Bar dataKey="v" fill="url(#barAct)" radius={[6,6,0,0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Chip label="+12% vs last week" size="small" color="success" variant="outlined" />
                <Chip label="Peak: Fri" size="small" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Applications and Top Scholarships */}
      <Grid container spacing={2} mt={1} alignItems="stretch">
        {/* Recent Applications */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}`, transition: 'all 200ms ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }, height: '100%', minHeight: 420 }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle1" fontWeight={600}>Recent Applications</Typography>
                <Button size="small" onClick={() => window.location.assign('/university/applications')}>
                  View All
                </Button>
              </Box>
              <List dense>
                {mockRecentApplications.map((app, index) => (
                  <React.Fragment key={app.id}>
                    <ListItem dense sx={{ py: 0.75 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {app.student_name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={app.student_name}
                        primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {app.scholarship}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              GPA: {app.gpa} • Submitted: {app.submitted}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip 
                            icon={getStatusIcon(app.status)} 
                            label={app.status} 
                            color={getStatusColor(app.status) as any} 
                            size="small"
                          />
                          <IconButton size="small">
                            <MoreVert />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < mockRecentApplications.length - 1 && <Divider light sx={{ my: 0.5 }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Scholarships */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}`, transition: 'all 200ms ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }, height: '100%', minHeight: 420 }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle1" fontWeight={600}>Top Scholarships</Typography>
                <Button size="small" onClick={() => window.location.assign('/university/scholarships')}>
                  View All
                </Button>
              </Box>
              <List dense>
                {mockTopScholarships.map((scholarship, index) => (
                  <React.Fragment key={scholarship.id}>
                    <ListItem dense sx={{ py: 0.75 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                          <School />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={scholarship.title}
                        primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {scholarship.applications} applications • Budget: ${scholarship.budget.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Deadline: {scholarship.deadline}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" alignItems="center" gap={1}>
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < mockTopScholarships.length - 1 && <Divider light sx={{ my: 0.5 }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications and Quick Actions */}
      <Grid container spacing={2} mt={1} alignItems="stretch">
        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}`, transition: 'all 200ms ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }, height: '100%', minHeight: 340 }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
                <Badge badgeContent={notifications.filter(n => n.unread).length} color="error">
                  <NotificationsActive />
                </Badge>
              </Box>
              <List dense>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem dense sx={{ bgcolor: notification.unread ? 'action.hover' : 'transparent', py: 0.75 }}>
                      <ListItemAvatar>
                        {getNotificationIcon(notification.type)}
                      </ListItemAvatar>
                      <ListItemText
                        primary={notification.message}
                        primaryTypographyProps={{ variant: 'subtitle2' }}
                        secondary={notification.time}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      {notification.unread && (
                        <ListItemSecondaryAction>
                          <Box width={8} height={8} borderRadius="50%" bgcolor="primary.main" />
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                    {index < notifications.length - 1 && <Divider light sx={{ my: 0.5 }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}`, transition: 'all 200ms ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }, height: '100%', minHeight: 340 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Quick Actions</Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button variant="contained" startIcon={<Add />} onClick={() => window.location.assign('/university/scholarships/create')}>
                    Create Scholarship
                  </Button>
                  <Button variant="outlined" startIcon={<Assignment />} onClick={() => window.location.assign('/university/applications')}>
                    Review Applications
                  </Button>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button variant="outlined" startIcon={<Upload />} onClick={() => window.location.assign('/university/analytics')}>
                    View Analytics
                  </Button>
                  <Button variant="outlined" startIcon={<Download />} onClick={() => window.location.assign('/university/settings')}>
                    Export Data
                  </Button>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip label="Create scholarship" color="primary" onClick={() => window.location.assign('/university/scholarships/create')} />
                  <Chip label="View applications" variant="outlined" onClick={() => window.location.assign('/university/applications')} />
                  <Chip label="Analytics" variant="outlined" onClick={() => window.location.assign('/university/analytics')} />
                  <Chip label="Settings" variant="outlined" onClick={() => window.location.assign('/university/settings')} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </UniversityLayout>
  );
};

export default UniversityDashboard;



