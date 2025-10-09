import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Schedule,
  People,
  AccessTime,
  CalendarMonth,
  CheckCircle,
  Cancel,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface AnalyticsData {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  averageBookingRate: number;
  peakHours: { hour: string; bookings: number }[];
  weeklyTrend: { day: string; appointments: number }[];
  topStudents: { name: string; appointments: number }[];
  meetingTypeDistribution: { type: string; count: number; percentage: number }[];
}

interface SchedulerAnalyticsProps {
  data: AnalyticsData;
  dateRange: {
    start: Date;
    end: Date;
  };
}

const SchedulerAnalytics: React.FC<SchedulerAnalyticsProps> = ({ data, dateRange }) => {
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp color="success" />;
    if (current < previous) return <TrendingDown color="error" />;
    return <TrendingUp color="disabled" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'success';
    if (current < previous) return 'error';
    return 'default';
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Overview Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {data.totalAppointments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Appointments
                    </Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  {getTrendIcon(data.totalAppointments, data.totalAppointments - 5)}
                  <Typography
                    variant="caption"
                    color={`${getTrendColor(data.totalAppointments, data.totalAppointments - 5)}.main`}
                  >
                    +{calculateTrend(data.totalAppointments, data.totalAppointments - 5)}% vs last week
                  </Typography>
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
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {data.averageBookingRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Booking Rate
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <LinearProgress
                    variant="determinate"
                    value={data.averageBookingRate}
                    sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                  />
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
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {data.confirmedAppointments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Confirmed
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Chip
                    label={`${Math.round((data.confirmedAppointments / data.totalAppointments) * 100)}%`}
                    size="small"
                    color="success"
                  />
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
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {data.pendingAppointments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  </Box>
                  <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Chip
                    label={`${Math.round((data.pendingAppointments / data.totalAppointments) * 100)}%`}
                    size="small"
                    color="warning"
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Charts and Detailed Analytics */}
      <Grid container spacing={3}>
        {/* Peak Hours Chart */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Peak Booking Hours
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {data.peakHours.map((hour, index) => (
                    <Box key={hour.hour} sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontWeight={500}>
                          {hour.hour}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hour.bookings} bookings
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(hour.bookings / Math.max(...data.peakHours.map(h => h.bookings))) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Weekly Trend */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Weekly Trend
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {data.weeklyTrend.map((day, index) => (
                    <Box key={day.day} sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontWeight={500}>
                          {day.day}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.appointments} appointments
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(day.appointments / Math.max(...data.weeklyTrend.map(d => d.appointments))) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Top Students */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Top Students
                </Typography>
                <List sx={{ mt: 1 }}>
                  {data.topStudents.map((student, index) => (
                    <React.Fragment key={student.name}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            {index + 1}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={student.name}
                          secondary={`${student.appointments} appointments`}
                        />
                      </ListItem>
                      {index < data.topStudents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Meeting Type Distribution */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Meeting Types
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {data.meetingTypeDistribution.map((type, index) => (
                    <Box key={type.type} sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                          {type.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type.count} ({type.percentage}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={type.percentage}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SchedulerAnalytics;
