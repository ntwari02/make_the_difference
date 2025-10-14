import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Avatar, List, ListItem, ListItemText, ListItemAvatar, Divider, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { School as CourseIcon, Schedule as ScheduleIcon, WorkspacePremium as CertIcon, TrendingUp as TrendingIcon } from '@mui/icons-material';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, PieChart, Pie, Cell } from 'recharts';
import StudentLayout from '../components/layout/StudentLayout';
import SecurityQuestionsSetupModal from '../../auth/components/SecurityQuestionsSetupModal';
import { api } from '../../../core/services/api/apiClient';
import { studentApi } from '../services/studentApi';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [showSQSetup, setShowSQSetup] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [en, r] = await Promise.allSettled([
          studentApi.myEnrollments(),
          studentApi.recommendations(),
        ]);

        const enrollArr = en.status === 'fulfilled' ? (en.value?.enrollments || en.value || []) : [];
        const recsArr = r.status === 'fulfilled' ? (r.value?.courses || r.value || []) : [];

        setEnrollments(Array.isArray(enrollArr) ? enrollArr : []);
        setRecs(Array.isArray(recsArr) ? recsArr : []);
      } catch (e) {
        setEnrollments([]);
        setRecs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Security questions setup is no longer required
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const resp = await api.get('/security-questions/check');
  //       const has = !!resp?.data?.data?.hasQuestions;
  //       if (!has) setShowSQSetup(true);
  //     } catch (_) {
  //       // If endpoint requires auth and fails, ignore; prompt will not show
  //     }
  //   })();
  // }, []);

  const mockRecs = recs.length ? recs : [
    { id: 'c1', title: 'Intro to JavaScript', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop' },
    { id: 'c2', title: 'React for Beginners', thumbnail: 'https://images.unsplash.com/photo-1547658719-99ad183ddfde?q=80&w=1200&auto=format&fit=crop' },
    { id: 'c3', title: 'SQL Essentials', thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop' },
  ];

  // Mock data for charts
  const studyHoursData = [
    { week: 'Week 1', hours: 8 },
    { week: 'Week 2', hours: 12 },
    { week: 'Week 3', hours: 15 },
    { week: 'Week 4', hours: 18 },
    { week: 'Week 5', hours: 14 },
    { week: 'Week 6', hours: 20 },
  ];

  const courseProgressData = [
    { name: 'JavaScript', value: 85, color: '#1976d2' },
    { name: 'React', value: 60, color: '#10b981' },
    { name: 'SQL', value: 40, color: '#f59e0b' },
    { name: 'Python', value: 25, color: '#ef4444' },
  ];

  const recentActivity = [
    { title: 'Completed JavaScript Basics Quiz', time: '2 hours ago', type: 'quiz' },
    { title: 'Started React Components Module', time: '1 day ago', type: 'course' },
    { title: 'Earned SQL Fundamentals Certificate', time: '3 days ago', type: 'certificate' },
    { title: 'Joined Python Study Group', time: '1 week ago', type: 'community' },
  ];

  const handleEnroll = async (courseId: string) => {
    if (enrollingId) return;
    setEnrollingId(courseId);
    try {
      await studentApi.enroll(courseId);
      toast.success('Enrolled successfully');
      navigate(`/student/courses/${courseId}`);
    } catch (e) {
      // fallback demo success
      toast.success('Enrolled (demo)');
      navigate(`/student/courses/${courseId}`);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <SecurityQuestionsSetupModal open={showSQSetup} onClose={() => setShowSQSetup(false)} onSaved={() => setShowSQSetup(false)} />
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Student Workspace</Typography>
            <Typography variant="body2" color="text.secondary">Track your learning progress and discover new courses</Typography>
          </Box>
          {loading && (
            <Chip label="Loading data…" size="small" />
          )}
        </Box>

        {/* KPI Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Active Courses</Typography>
                  <Typography variant="h4" fontWeight={800}>{enrollments.length}</Typography>
                  <Chip size="small" color="primary" label="Currently enrolled" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}><CourseIcon /></Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Hours Studied</Typography>
                  <Typography variant="h4" fontWeight={800}>{Math.max(4, enrollments.length * 6)}</Typography>
                  <Chip size="small" color="success" label="This month" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 44, height: 44 }}><ScheduleIcon /></Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Certificates</Typography>
                  <Typography variant="h4" fontWeight={800}>{Math.max(0, enrollments.length - 2)}</Typography>
                  <Chip size="small" color="warning" label="Earned" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 44, height: 44 }}><CertIcon /></Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Learning Streak</Typography>
                  <Typography variant="h4" fontWeight={800}>12</Typography>
                  <Chip size="small" color="info" label="Days" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 44, height: 44 }}><TrendingIcon /></Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Two-column layout: Charts left, Content right */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, gap: 3 }}>
          {/* Left Column: Charts */}
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Card sx={{ borderRadius: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Study Hours Trend</Typography>
                <Box sx={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={studyHoursData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="hours" stroke="#1976d2" fill="#1976d2" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Course Progress</Typography>
                <Box sx={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={courseProgressData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                        {courseProgressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column: Activity and Recommendations */}
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Card sx={{ borderRadius: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                <List dense>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {activity.type === 'quiz' ? 'Q' : activity.type === 'course' ? 'C' : activity.type === 'certificate' ? 'A' : 'G'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={activity.title} 
                          secondary={activity.time}
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Course Progress</Typography>
                <List dense>
                  {courseProgressData.map((course, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText primary={course.name} />
                      <Box sx={{ minWidth: 120 }}>
                        <LinearProgress variant="determinate" value={course.value} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                      <Box sx={{ width: 40 }}>
                        <Typography variant="body2" color="text.secondary" align="right">{course.value}%</Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Recommended for you</Typography>
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  {mockRecs.map((c) => (
                    <Card key={c.id} sx={{ cursor: 'pointer', transition: 'transform .15s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                        <Box component="img" src={c.thumbnail} alt={c.title} sx={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 1 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>{c.title}</Typography>
                          <Chip size="small" label="Beginner" sx={{ mt: 0.5 }} />
                        </Box>
                        <Button variant="contained" size="small" disabled={enrollingId === c.id} onClick={() => handleEnroll(c.id)}>
                          {enrollingId === c.id ? 'Enrolling…' : 'Enroll'}
                        </Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </StudentLayout>
  );
};

export default StudentDashboard;


