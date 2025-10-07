import React from 'react';
import { Box, GridLegacy as Grid, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import { School as CourseIcon, Group as StudentsIcon, AttachMoney as RevenueIcon, Star as RatingIcon, Add as AddIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import InstructorLayout from '../components/layout/InstructorLayout';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import { fetchInstructorStats } from '../store/instructorSlice';

const InstructorDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { stats } = useSelector((s: RootState) => s.instructor);

  React.useEffect(() => {
    dispatch(fetchInstructorStats() as any);
  }, [dispatch]);

  const revenueData = [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 5100 },
    { month: 'Mar', revenue: 4800 },
    { month: 'Apr', revenue: 6900 },
    { month: 'May', revenue: 8430 },
    { month: 'Jun', revenue: 7900 },
  ];

  return (
    <InstructorLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Welcome back, Instructor</Typography>
          <Typography variant="body2" color="text.secondary">Here’s an overview of your teaching performance</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>Create Course</Button>
      </Box>

      <Grid container spacing={2}>
        {(stats ? [
          { label: 'Active Courses', value: stats.activeCourses, icon: <CourseIcon color="primary" /> },
          { label: 'Enrolled Students', value: stats.totalStudents, icon: <StudentsIcon color="primary" /> },
          { label: 'Monthly Revenue', value: `$${stats.monthlyRevenue?.toLocaleString?.() || stats.monthlyRevenue}`, icon: <RevenueIcon color="primary" /> },
          { label: 'Average Rating', value: String(stats.averageRating ?? '-'), icon: <RatingIcon color="primary" /> },
        ] : [
          { label: 'Active Courses', value: '-', icon: <CourseIcon color="primary" /> },
          { label: 'Enrolled Students', value: '-', icon: <StudentsIcon color="primary" /> },
          { label: 'Monthly Revenue', value: '-', icon: <RevenueIcon color="primary" /> },
          { label: 'Average Rating', value: '-', icon: <RatingIcon color="primary" /> },
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
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Revenue (last 6 months)</Typography>
              <Box height={260}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#1976d2" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip label="Create course" color="primary" />
                <Chip label="Manage students" variant="outlined" />
                <Chip label="View payouts" variant="outlined" />
                <Chip label="Course reviews" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </InstructorLayout>
  );
};

export default InstructorDashboard;


