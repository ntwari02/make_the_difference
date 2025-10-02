import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  School,
  People,
  Analytics,
  Add,
  Edit,
  Visibility,
  Star,
  EmojiEvents,
  MonetizationOn,
  Group,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageContainer, CardGrid } from '../../../../shared/components/layout/Containers';

// Mock data for instructor dashboard
const mockInstructorData = {
  profile: {
    name: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@university.edu',
    department: 'Computer Science',
    avatar: '',
    rating: 4.8,
    courses: 12,
    students: 450,
    revenue: 12500,
  },
  stats: {
    totalCourses: 12,
    activeStudents: 450,
    totalRevenue: 12500,
    averageRating: 4.8,
    completionRate: 87,
    satisfactionScore: 92,
  },
  courses: [
    {
      id: 1,
      title: 'Advanced React Development',
      students: 45,
      lessons: 24,
      progress: 78,
      rating: 4.9,
      revenue: 2250,
      status: 'active',
    },
    {
      id: 2,
      title: 'Machine Learning Fundamentals',
      students: 38,
      lessons: 18,
      progress: 65,
      rating: 4.7,
      revenue: 1900,
      status: 'active',
    },
    {
      id: 3,
      title: 'Data Structures & Algorithms',
      students: 52,
      lessons: 30,
      progress: 82,
      rating: 4.8,
      revenue: 2600,
      status: 'active',
    },
  ],
  analytics: {
    weeklyRevenue: [1200, 1350, 1100, 1450, 1300, 1600, 1400],
    studentGrowth: [420, 435, 440, 445, 450, 455, 450],
    courseCompletion: [85, 87, 86, 88, 87, 89, 87],
  },
  students: [
    {
      id: 1,
      name: 'Alex Johnson',
      course: 'Advanced React Development',
      progress: 78,
      lastActive: '2 hours ago',
      avatar: '',
    },
    {
      id: 2,
      name: 'Maria Garcia',
      course: 'Machine Learning Fundamentals',
      progress: 65,
      lastActive: '1 day ago',
      avatar: '',
    },
    {
      id: 3,
      name: 'David Chen',
      course: 'Data Structures & Algorithms',
      progress: 82,
      lastActive: '3 hours ago',
      avatar: '',
    },
  ],
  notifications: [
    {
      id: 1,
      type: 'student',
      message: 'New student enrolled in Advanced React Development',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 2,
      type: 'course',
      message: 'Course "Machine Learning Fundamentals" completed by 5 students',
      time: '4 hours ago',
      unread: false,
    },
    {
      id: 3,
      type: 'revenue',
      message: 'Monthly revenue target achieved!',
      time: '1 day ago',
      unread: false,
    },
  ],
};

const InstructorDashboard: React.FC = () => {
  const theme = useTheme();
  const [data] = useState(mockInstructorData);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.02, y: -5 },
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <PageContainer maxWidth="xl">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          sx={{
            mb: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3,
              }}
            />
            
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                }}
              >
                {data.profile.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Welcome back, {data.profile.name.split(' ')[0]}!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  Ready to inspire your students today?
                </Typography>
                
                <Box display="flex" gap={2}>
                  <Chip
                    icon={<School />}
                    label={`${data.profile.courses} Courses`}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  />
                  <Chip
                    icon={<People />}
                    label={`${data.profile.students} Students`}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  />
                  <Chip
                    icon={<Star />}
                    label={`${data.profile.rating} Rating`}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <CardGrid columns={{ xs: 2, sm: 4 }} spacing={2} sx={{ mb: 4 }}>
          {[
            {
              title: 'Total Revenue',
              value: `$${data.stats.totalRevenue.toLocaleString()}`,
              icon: <MonetizationOn />,
              color: theme.palette.success.main,
              change: '+12%',
            },
            {
              title: 'Active Students',
              value: data.stats.activeStudents.toString(),
              icon: <People />,
              color: theme.palette.primary.main,
              change: '+8%',
            },
            {
              title: 'Course Rating',
              value: data.stats.averageRating.toString(),
              icon: <Star />,
              color: theme.palette.warning.main,
              change: '+0.2',
            },
            {
              title: 'Completion Rate',
              value: `${data.stats.completionRate}%`,
              icon: <EmojiEvents />,
              color: theme.palette.info.main,
              change: '+5%',
            },
          ].map((stat, _index) => (
            <motion.div
              key={stat.title}
              variants={statsVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <IconButton sx={{ color: stat.color }}>
                    {stat.icon}
                  </IconButton>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="caption" color="success.main">
                  {stat.change} from last month
                </Typography>
              </Card>
            </motion.div>
          ))}
        </CardGrid>
      </motion.div>

      {/* Main Content Grid */}
      <Box display="flex" flexWrap="wrap" gap={3}>
        {/* Left Column - Courses Management */}
        <Box flex="2" minWidth="600px">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" fontWeight="bold">
                    My Courses
                  </Typography>
                  <Button variant="outlined" size="small" startIcon={<Add />}>
                    Create Course
                  </Button>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={2}>
                  {data.courses.map((course, _index) => (
                    <Box flex="1" minWidth="300px" key={course.id}>
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        transition={{ delay: 0.1 }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: theme.shadows[8],
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {course.title}
                            </Typography>

                            <Box display="flex" gap={1} mb={2}>
                              <Chip
                                label={`${course.lessons} lessons`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={`${course.students} students`}
                                size="small"
                                variant="outlined"
                              />
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <People sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                                <Typography variant="body2">{course.students}</Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Star sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                                <Typography variant="body2">{course.rating}</Typography>
                              </Box>
                            </Box>

                            <Box mb={2}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body2" color="text.secondary">
                                  Progress
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {course.progress}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={course.progress}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="h6" fontWeight="bold" color="primary">
                                ${course.revenue.toLocaleString()}
                              </Typography>
                              <Box display="flex" gap={1}>
                                <IconButton size="small" color="primary">
                                  <Edit />
                                </IconButton>
                                <IconButton size="small" color="primary">
                                  <Visibility />
                                </IconButton>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Right Column - Analytics & Students */}
        <Box flex="1" minWidth="300px">
          {/* Weekly Analytics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Analytics sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Weekly Analytics
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                  {[
                    { label: 'Revenue', value: '$1,400', change: '+12%', color: theme.palette.success.main },
                    { label: 'Students', value: '450', change: '+8%', color: theme.palette.primary.main },
                    { label: 'Completion', value: '87%', change: '+5%', color: theme.palette.info.main },
                  ].map((metric, _index) => (
                    <Box key={metric.label} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {metric.label}
                      </Typography>
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight="bold">
                          {metric.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: metric.color }}>
                          {metric.change}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Students */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Group sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Recent Students
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                  {data.students.map((student, _index) => (
                    <Box key={student.id} display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {student.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.course}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight="bold">
                          {student.progress}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.lastActive}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default InstructorDashboard;