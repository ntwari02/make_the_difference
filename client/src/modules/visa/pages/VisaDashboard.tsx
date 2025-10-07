import React from 'react';
import { Box, GridLegacy as Grid, Card, CardContent, Typography, Chip, useTheme, Button, Alert, LinearProgress } from '@mui/material';
import VisaLayout from '../components/layout/VisaLayout';
import { Assignment, TravelExplore, EmojiEvents, Assessment, Payment, Schedule, NotificationsActive, CheckCircle } from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { visaApi } from '../services/visaApi';
import { getTooltipProps, getGridProps, getXAxisProps, getYAxisProps, getLegendStyle } from '../../../shared/charts/rechartsTheme';
import VisaAIFab from '../components/VisaAIFab';

const VisaDashboard: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = React.useState<any | null>(null);
  const [monthly, setMonthly] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      const data = await visaApi.statsMy();
      setStats(data || {});
      setMonthly(Array.isArray(data?.monthly) ? data.monthly : []);
    };
    load();
  }, []);

  const fallbackMonthly = [
    { month: 'Jan', submitted: 80, approved: 30, pending: 25, rejected: 5 },
    { month: 'Feb', submitted: 95, approved: 40, pending: 30, rejected: 8 },
    { month: 'Mar', submitted: 110, approved: 45, pending: 35, rejected: 10 },
    { month: 'Apr', submitted: 120, approved: 55, pending: 40, rejected: 12 },
    { month: 'May', submitted: 140, approved: 60, pending: 45, rejected: 15 },
    { month: 'Jun', submitted: 150, approved: 62, pending: 50, rejected: 18 },
  ];
  const chartMonthly = monthly.length > 0 ? monthly : fallbackMonthly;

  const statusData = [
    { name: 'Approved', value: 45, color: theme.palette.success.main },
    { name: 'Pending', value: 30, color: theme.palette.warning.main },
    { name: 'Under Review', value: 20, color: theme.palette.info.main },
    { name: 'Rejected', value: 5, color: theme.palette.error.main },
  ];

  const recentApplications = [
    { id: 'V001', country: 'Canada', type: 'Student Visa', status: 'approved', submitted: '2024-01-15', fee: '$150', progress: 100 },
    { id: 'V002', country: 'UK', type: 'Tourist Visa', status: 'pending', submitted: '2024-01-20', fee: '$120', progress: 60 },
    { id: 'V003', country: 'Germany', type: 'Work Visa', status: 'under_review', submitted: '2024-01-22', fee: '$200', progress: 40 },
    { id: 'V004', country: 'Australia', type: 'Student Visa', status: 'rejected', submitted: '2024-01-18', fee: '$180', progress: 100 },
  ];

  const upcomingTravels = [
    { country: 'Canada', departure: '2024-02-15', visa: 'Student Visa', status: 'approved' },
    { country: 'UK', departure: '2024-03-01', visa: 'Tourist Visa', status: 'pending' },
    { country: 'Germany', departure: '2024-03-15', visa: 'Work Visa', status: 'under_review' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'under_review': return 'info';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <VisaLayout>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>My Visa Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Track your visa applications and upcoming travels</Typography>
      </Box>

      {/* Notifications */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Update:</strong> Your Canada Student Visa has been approved! You can now book your flight and prepare for departure on February 15, 2024.
        </Typography>
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={2}>
        {([
          { label: 'Active Applications', value: stats?.active_applications ?? '3', icon: <Assignment color="primary" /> },
          { label: 'Approved Visas', value: stats?.approved_visas ?? '12', icon: <CheckCircle color="success" /> },
          { label: 'Total Paid', value: stats?.total_paid ?? '$1,250', icon: <Payment color="primary" /> },
          { label: 'Upcoming Travels', value: stats?.upcoming_travels ?? '2', icon: <Schedule color="primary" /> },
        ]).map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}`, height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="overline" color="text.secondary">{s.label}</Typography>
                    <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
                  </Box>
                  {s.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mt={1}>
        {/* Monthly Applications Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Application Trends</Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartMonthly}>
                    <defs>
                      <linearGradient id="submittedGradientVisa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="approvedGradientVisa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.success.main} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="pendingGradientVisa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.warning.main} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={theme.palette.warning.main} stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...getGridProps(theme)} />
                    <XAxis dataKey="month" {...getXAxisProps(theme)} />
                    <YAxis {...getYAxisProps(theme)} />
                    <Tooltip {...getTooltipProps(theme)} />
                    <Legend wrapperStyle={getLegendStyle(theme)} />
                    <Bar dataKey="submitted" name="Submitted" fill="url(#submittedGradientVisa)" radius={[8,8,0,0]} maxBarSize={48} />
                    <Bar dataKey="approved" name="Approved" fill="url(#approvedGradientVisa)" radius={[8,8,0,0]} maxBarSize={48} />
                    <Bar dataKey="pending" name="Pending" fill="url(#pendingGradientVisa)" radius={[8,8,0,0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Application Status</Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...getTooltipProps(theme)} />
                    <Legend wrapperStyle={getLegendStyle(theme)} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={1}>
        {/* Recent Applications */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Applications</Typography>
              <Box>
                {recentApplications.map((app) => (
                  <Box key={app.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" fontWeight={600}>{app.country} - {app.type}</Typography>
                      <Chip label={app.status.replace('_', ' ')} color={getStatusColor(app.status) as any} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Submitted: {app.submitted} • Fee: {app.fee}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress variant="determinate" value={app.progress} sx={{ flex: 1 }} />
                      <Typography variant="caption">{app.progress}%</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => window.location.assign('/visa/my-applications')}>
                View All Applications
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Travels */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Upcoming Travels</Typography>
              <Box>
                {upcomingTravels.map((travel, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" fontWeight={600}>{travel.country}</Typography>
                      <Chip label={travel.status.replace('_', ' ')} color={getStatusColor(travel.status) as any} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Departure: {travel.departure}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Visa: {travel.visa}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => window.location.assign('/visa/services')}>
                Apply for New Visa
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}`, mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip label="Apply for Visa" color="primary" onClick={() => window.location.assign('/visa/services')} />
            <Chip label="Track Applications" variant="outlined" onClick={() => window.location.assign('/visa/my-applications')} />
            <Chip label="Payment History" variant="outlined" onClick={() => window.location.assign('/visa/payments')} />
            <Chip label="Document Vault" variant="outlined" onClick={() => window.location.assign('/visa/documents')} />
            <Chip label="Get Help" variant="outlined" onClick={() => window.location.assign('/visa/support')} />
          </Box>
        </CardContent>
      </Card>

      <VisaAIFab />
    </VisaLayout>
  );
};

export default VisaDashboard;


