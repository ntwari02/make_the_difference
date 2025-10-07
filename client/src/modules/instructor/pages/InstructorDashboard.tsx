import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  School as CourseIcon,
  Group as StudentsIcon,
  AttachMoney as RevenueIcon,
  Star as RatingIcon,
  TrendingUp,
  TrendingDown,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import InstructorLayout from '../components/layout/InstructorLayout';

const kpiCard = (
  label: string,
  value: React.ReactNode,
  icon: React.ReactNode,
  trend: { up?: boolean; value: string },
) => (
  <Card sx={{ borderRadius: 1, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}`, height: '100%' }}>
    <CardContent sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="overline" color="text.secondary">{label}</Typography>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          {icon}
          <Chip
            size="small"
            color={trend.up ? 'success' : 'error'}
            icon={trend.up ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
            label={trend.value}
          />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const InstructorDashboard: React.FC = () => {
  const [range, setRange] = React.useState<'7d' | '30d' | '90d' | 'ytd'>('30d');

  const revenueData = [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 5100 },
    { month: 'Mar', revenue: 4800 },
    { month: 'Apr', revenue: 6900 },
    { month: 'May', revenue: 8430 },
    { month: 'Jun', revenue: 7900 },
  ];

  const enrollmentsData = [
    { month: 'Jan', enrollments: 120 },
    { month: 'Feb', enrollments: 150 },
    { month: 'Mar', enrollments: 140 },
    { month: 'Apr', enrollments: 190 },
    { month: 'May', enrollments: 220 },
    { month: 'Jun', enrollments: 205 },
  ];

  const courseProgress = [
    { title: 'React Masterclass', progress: 76 },
    { title: 'Advanced TypeScript', progress: 52 },
    { title: 'Node.js Deep Dive', progress: 88 },
  ];

  const topCourses = [
    { title: 'React Masterclass', revenue: 5400, students: 220, rating: 4.8 },
    { title: 'Advanced TypeScript', revenue: 4200, students: 180, rating: 4.7 },
    { title: 'Node.js Deep Dive', revenue: 3900, students: 160, rating: 4.6 },
  ];

  const activities = [
    { title: 'New review on React Masterclass', detail: '“Excellent explanations!”', when: '2h ago' },
    { title: '10 students enrolled', detail: 'Node.js Deep Dive', when: '5h ago' },
    { title: 'Payout processed', detail: '$1,230 to your bank', when: '1d ago' },
  ];

  return (
    <InstructorLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} px={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Welcome back, Instructor</Typography>
          <Typography variant="body2" color="text.secondary">Comprehensive overview of your teaching performance</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <ToggleButtonGroup size="small" color="primary" value={range} exclusive onChange={(e, v) => v && setRange(v)}>
            <ToggleButton value="7d">7d</ToggleButton>
            <ToggleButton value="30d">30d</ToggleButton>
            <ToggleButton value="90d">90d</ToggleButton>
            <ToggleButton value="ytd">YTD</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Refresh">
            <IconButton color="primary"><RefreshIcon /></IconButton>
          </Tooltip>
        <Button variant="contained" startIcon={<AddIcon />}>Create Course</Button>
      </Box>
      </Box>

      <Box sx={{ px: 2, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
        <Box>{kpiCard('ACTIVE COURSES', 14, <CourseIcon color="primary" />, { up: true, value: '+8%' })}</Box>
        <Box>{kpiCard('ENROLLED STUDENTS', 1240, <StudentsIcon color="primary" />, { up: true, value: '+12%' })}</Box>
        <Box>{kpiCard('MONTHLY REVENUE', `$${(8430).toLocaleString()}`, <RevenueIcon color="primary" />, { up: true, value: '+6%' })}</Box>
        <Box>{kpiCard('AVERAGE RATING', '4.7', <RatingIcon color="primary" />, { up: false, value: '-2%' })}</Box>
                </Box>

      <Box sx={{ mt: 1, px: 2, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' } }}>
        {/* Left column: charts stacked */}
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Revenue (last 6 months)</Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#1976d2" fill="#1976d2" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Enrollments (radar)</Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={enrollmentsData} outerRadius="70%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="month" />
                    <PolarRadiusAxis />
                    <RechartsTooltip />
                    <Radar name="Enrollments" dataKey="enrollments" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right column: tables and lists stacked */}
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Top courses</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Course</TableCell>
                      <TableCell align="right">Students</TableCell>
                      <TableCell align="right">Rating</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topCourses.map((c) => (
                      <TableRow key={c.title} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar>{c.title[0]}</Avatar>
                            <Typography>{c.title}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{c.students}</TableCell>
                        <TableCell align="right">{c.rating}</TableCell>
                        <TableCell align="right">${c.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Recent activity</Typography>
              <List dense>
                {activities.map((a) => (
                  <ListItem key={a.title} sx={{ px: 0 }}>
                    <ListItemText primary={a.title} secondary={`${a.detail} • ${a.when}`} />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="h6" gutterBottom>Course progress</Typography>
              <List dense>
                {courseProgress.map((c) => (
                  <ListItem key={c.title} sx={{ px: 0 }}>
                    <ListItemText primary={c.title} />
                    <Box sx={{ minWidth: 160 }}>
                      <LinearProgress variant="determinate" value={c.progress} />
                    </Box>
                    <Box sx={{ width: 40 }}>
                      <Typography variant="body2" color="text.secondary" align="right">{c.progress}%</Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </InstructorLayout>
  );
};

export default InstructorDashboard;
