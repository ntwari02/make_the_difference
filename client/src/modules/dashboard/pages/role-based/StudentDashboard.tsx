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
  TrendingUp,
  EmojiEvents,
  Psychology,
  PlayCircle,
  Star,
  Bookmark,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageContainer, CardGrid } from '../../../../shared/components/layout/Containers';

// Mock data for student dashboard
const mockStudentData = {
  profile: {
    name: 'Alex Johnson',
    avatar: '/api/placeholder/80/80',
    level: 'Intermediate',
    totalCourses: 12,
    completedCourses: 8,
    certificates: 5,
    streak: 7,
  },
  stats: {
    totalCourses: 12,
    completedCourses: 8,
    certificates: 5,
    streak: 7,
    totalHours: 45,
    averageScore: 87,
  },
  courses: [
    {
      id: 1,
      title: 'Advanced React Development',
      instructor: 'Dr. Sarah Wilson',
      progress: 75,
      rating: 4.8,
      students: 1250,
      level: 'Advanced',
      duration: '8 weeks',
      thumbnail: '/api/placeholder/300/200',
    },
    {
      id: 2,
      title: 'Machine Learning Fundamentals',
      instructor: 'Prof. Michael Chen',
      progress: 45,
      rating: 4.9,
      students: 980,
      level: 'Intermediate',
      duration: '12 weeks',
      thumbnail: '/api/placeholder/300/200',
    },
    {
      id: 3,
      title: 'Data Structures & Algorithms',
      instructor: 'Dr. Emily Rodriguez',
      progress: 90,
      rating: 4.7,
      students: 2100,
      level: 'Beginner',
      duration: '10 weeks',
      thumbnail: '/api/placeholder/300/200',
    },
  ],
  recommendations: [
    {
      id: 1,
      title: 'Complete React Course',
      description: 'Based on your progress, you should finish the React course',
      confidence: 95,
      type: 'course_completion',
    },
    {
      id: 2,
      title: 'Try Machine Learning',
      description: 'You might enjoy exploring AI and ML concepts',
      confidence: 78,
      type: 'new_course',
    },
  ],
  achievements: [
    {
      id: 1,
      title: 'First Certificate',
      description: 'Completed your first course',
      icon: 'certificate',
      date: '2024-01-15',
      points: 100,
    },
    {
      id: 2,
      title: 'Week Streak',
      description: 'Studied for 7 consecutive days',
      icon: 'streak',
      date: '2024-01-20',
      points: 50,
    },
  ],
  weeklyGoal: {
    target: 10,
    current: 7,
  },
};

const StudentDashboard: React.FC = () => {
  const theme = useTheme();
  const [data] = useState(mockStudentData);

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
        initial={{ opacity: 0, y: -20 }}
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
                  Ready to continue your learning journey?
                </Typography>
                
                <Box display="flex" gap={2}>
                  <Chip
                    icon={<School />}
                    label={`${data.profile.totalCourses} Courses`}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  />
                  <Chip
                    icon={<EmojiEvents />}
                    label={`${data.profile.certificates} Certificates`}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  />
                  <Chip
                    icon={<TrendingUp />}
                    label={`${data.profile.streak} Day Streak`}
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
              title: 'Completed Courses',
              value: data.stats.completedCourses.toString(),
              icon: <CheckCircle />,
              color: theme.palette.success.main,
              change: '+2',
            },
            {
              title: 'Total Hours',
              value: `${data.stats.totalHours}h`,
              icon: <AccessTime />,
              color: theme.palette.info.main,
              change: '+5h',
            },
            {
              title: 'Average Score',
              value: `${data.stats.averageScore}%`,
              icon: <Star />,
              color: theme.palette.warning.main,
              change: '+3%',
            },
            {
              title: 'Certificates',
              value: data.stats.certificates.toString(),
              icon: <EmojiEvents />,
              color: theme.palette.primary.main,
              change: '+1',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={statsVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
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
                  <Box sx={{ color: stat.color, fontSize: '1.5rem' }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="caption" color="success.main">
                  {stat.change} this week
                </Typography>
              </Card>
            </motion.div>
          ))}
        </CardGrid>
      </motion.div>

      {/* Main Content Grid */}
      <Box display="flex" flexWrap="wrap" gap={3}>
        {/* Left Column - Courses */}
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
                  <Button variant="outlined" size="small">
                    View All
                  </Button>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={2}>
                  {data.courses.map((course, index) => (
                    <Box flex="1" minWidth="300px" key={course.id}>
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        transition={{ delay: index * 0.1 }}
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
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Typography variant="h6" fontWeight="bold">
                                {course.title}
                              </Typography>
                              <IconButton size="small">
                                <Bookmark />
                              </IconButton>
                            </Box>

                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              by {course.instructor}
                            </Typography>

                            <Box display="flex" gap={1} mb={2}>
                              <Chip
                                label={course.level}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={course.duration}
                                size="small"
                                variant="outlined"
                              />
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Star sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                                <Typography variant="body2">{course.rating}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ({course.students})
                                </Typography>
                              </Box>
                              <Typography variant="body2" fontWeight="bold">
                                {course.progress}% Complete
                              </Typography>
                            </Box>

                            <Box mb={2}>
                              <LinearProgress
                                variant="determinate"
                                value={course.progress}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>

                            <Box display="flex" gap={1}>
                              <Button
                                size="small"
                                startIcon={<PlayCircle />}
                                variant="contained"
                              >
                                Continue
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Bookmark />}
                                variant="outlined"
                              >
                                Save
                              </Button>
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

        {/* Right Column - Recommendations & Achievements */}
        <Box flex="1" minWidth="300px">
          {/* AI Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Psychology sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    AI Recommendations
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                  {data.recommendations.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card sx={{ p: 2, backgroundColor: theme.palette.primary.main + '10' }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          {rec.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          {rec.description}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Chip label={`${rec.confidence}% confidence`} color="primary" size="small" />
                          <Button size="small" variant="contained">
                            Apply
                          </Button>
                        </Box>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <EmojiEvents sx={{ color: theme.palette.warning.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Recent Achievements
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                  {data.achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.warning.main + '20',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <EmojiEvents sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                          </Box>
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight="bold">
                              {achievement.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {achievement.description}
                            </Typography>
                          </Box>
                          <Typography variant="caption" fontWeight="bold" color="primary">
                            +{achievement.points}
                          </Typography>
                        </Box>
                      </Card>
                    </motion.div>
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

export default StudentDashboard;