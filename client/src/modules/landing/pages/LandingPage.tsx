import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
} from '@mui/material';
import {
  School,
  DirectionsCar,
  Psychology,
  School as ScholarshipIcon,
  FlightTakeoff,
  Campaign,
  Star,
  TrendingUp,
  People,
  Security,
  Speed,
  Support,
  DarkMode,
  LightMode,
  ArrowForward,
  CheckCircle,
  PlayArrow,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

// Theme Toggle Component
const ThemeToggle: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Here you would integrate with your theme system
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={darkMode}
          onChange={toggleTheme}
          icon={<LightMode />}
          checkedIcon={<DarkMode />}
          sx={{
            '& .MuiSwitch-thumb': {
              backgroundColor: darkMode ? '#1976d2' : '#ffc107',
            },
            '& .MuiSwitch-track': {
              backgroundColor: darkMode ? '#1976d2' : '#ffc107',
            },
          }}
        />
      }
      label={darkMode ? 'Dark' : 'Light'}
      sx={{ color: 'white' }}
    />
  );
};

// Hero Section Component
const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleGetStarted = () => {
    navigate('/auth/register');
  };

  const handleSignIn = () => {
    navigate('/auth/login');
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <ThemeToggle />
      </Box>

      {/* 3D Background */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
        <Canvas>
          <OrbitControls enableZoom={false} enablePan={false} />
          <Sphere args={[1, 100, 200]} scale={2}>
            <MeshDistortMaterial
              color="#ffffff"
              attach="material"
              distort={0.3}
              speed={1.5}
            />
          </Sphere>
        </Canvas>
      </Box>

      <Container maxWidth="lg" sx={{ px: 4, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Welcome to{' '}
                <Box component="span" sx={{ color: '#fbbf24', fontWeight: 'bold' }}>
                  Reaglex
                </Box>
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  mb: 3,
                  fontWeight: 500,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                Your Gateway to Education, Commerce, and Innovation
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'white',
                  mb: 4,
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  opacity: 0.95,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                Discover a comprehensive platform that combines e-learning, e-commerce, 
                AI-powered insights, scholarship opportunities, visa assistance, and 
                advertising solutions - all in one place.
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    endIcon={<ArrowForward />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.25)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    Get Started Free
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleSignIn}
                    startIcon={<PlayArrow />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      borderColor: 'white',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderWidth: 2,
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </motion.div>
              </Stack>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      Free to Start
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      No Credit Card Required
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      Instant Access
                    </Typography>
                  </Box>
                </Stack>
              </motion.div>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box
                sx={{
                  height: isMobile ? 300 : 500,
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Canvas>
                  <OrbitControls enableZoom={false} enablePan={false} />
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} />
                  <Sphere args={[1, 100, 200]} scale={1.5}>
                    <MeshDistortMaterial
                      color="#fbbf24"
                      attach="material"
                      distort={0.4}
                      speed={2}
                    />
                  </Sphere>
                </Canvas>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Features Section Component
const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <School sx={{ fontSize: 40 }} />,
      title: 'E-Learning Platform',
      description: 'Access thousands of courses, interactive lessons, and earn certificates from top instructors worldwide.',
      color: '#10b981',
      benefits: ['500+ Courses', 'Live Classes', 'Certificates', 'Expert Instructors'],
    },
    {
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      title: 'E-Commerce Hub',
      description: 'Buy and sell cars, spare parts, and automotive services with secure payment processing and verification.',
      color: '#3b82f6',
      benefits: ['2,500+ Cars', 'Secure Payments', 'Quality Assurance', '24/7 Support'],
    },
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations, chatbot assistance, and intelligent analytics for better decisions.',
      color: '#8b5cf6',
      benefits: ['Smart Chatbot', 'Personalized Learning', 'Analytics Dashboard', 'Predictive Insights'],
    },
    {
      icon: <ScholarshipIcon sx={{ fontSize: 40 }} />,
      title: 'Scholarship Opportunities',
      description: 'Discover and apply for scholarships that match your profile and academic goals with expert guidance.',
      color: '#f59e0b',
      benefits: ['100+ Scholarships', 'Easy Application', 'Expert Guidance', 'Success Tracking'],
    },
    {
      icon: <FlightTakeoff sx={{ fontSize: 40 }} />,
      title: 'Visa Assistance',
      description: 'Get expert guidance and support for your visa applications and immigration process with high success rates.',
      color: '#ef4444',
      benefits: ['Expert Consultation', 'Document Review', 'Application Support', '98% Success Rate'],
    },
    {
      icon: <Campaign sx={{ fontSize: 40 }} />,
      title: 'Advertising Solutions',
      description: 'Promote your business with targeted advertising campaigns and marketing tools for maximum reach.',
      color: '#06b6d4',
      benefits: ['Targeted Ads', 'Analytics Tools', 'ROI Tracking', 'Multi-Platform'],
    },
  ];

  return (
    <Box sx={{ py: 12, background: '#f8fafc' }}>
      <Container maxWidth="lg" sx={{ px: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box textAlign="center" mb={8}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#1e293b',
                mb: 2,
              }}
            >
              Why Choose Reaglex?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#64748b', 
                maxWidth: 600, 
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              We provide comprehensive solutions that empower individuals and businesses 
              to achieve their goals through technology and innovation.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                      borderColor: feature.color,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}40)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        color: feature.color,
                        border: `2px solid ${feature.color}20`,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: '#1e293b',
                        mb: 2,
                        textAlign: 'center',
                      }}
                    >
                      {feature.title}
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#64748b',
                        mb: 3,
                        lineHeight: 1.6,
                        textAlign: 'center',
                      }}
                    >
                      {feature.description}
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ color: '#374151', mb: 1, fontWeight: 600 }}>
                        Key Benefits:
                      </Typography>
                      <Stack spacing={1}>
                        {feature.benefits.map((benefit, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: feature.color, fontSize: 16 }} />
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              {benefit}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderColor: feature.color,
                        color: feature.color,
                        fontWeight: 600,
                        borderRadius: 2,
                        py: 1,
                        '&:hover': {
                          background: `${feature.color}10`,
                          borderColor: feature.color,
                        },
                      }}
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Statistics Section Component
const StatisticsSection: React.FC = () => {
  const stats = [
    { icon: <People sx={{ fontSize: 30 }} />, value: '10,000+', label: 'Active Users' },
    { icon: <School sx={{ fontSize: 30 }} />, value: '500+', label: 'Courses Available' },
    { icon: <DirectionsCar sx={{ fontSize: 30 }} />, value: '2,500+', label: 'Cars Listed' },
    { icon: <TrendingUp sx={{ fontSize: 30 }} />, value: '98%', label: 'Success Rate' },
  ];

  return (
    <Box sx={{ py: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" fontWeight="bold" color="white" gutterBottom>
              Our Impact
            </Typography>
            <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
              Numbers that speak for themselves
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: 'white',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  
                  <Typography variant="h3" component="div" fontWeight="bold" color="white" gutterBottom>
                    {stat.value}
                  </Typography>
                  
                  <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Call to Action Section
const CallToActionSection: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth/register');
  };

  const handleSignIn = () => {
    navigate('/auth/login');
  };

  return (
    <Box sx={{ py: 12, background: '#f8fafc' }}>
      <Container maxWidth="lg" sx={{ px: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
              }}
            >
              <Canvas>
                <OrbitControls enableZoom={false} enablePan={false} />
                <Sphere args={[1, 100, 200]} scale={3}>
                  <MeshDistortMaterial
                    color="#ffffff"
                    attach="material"
                    distort={0.3}
                    speed={1.5}
                  />
                </Sphere>
              </Canvas>
            </Box>

            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography 
                variant="h3" 
                component="h2" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'white',
                  mb: 3,
                }}
              >
                Ready to Transform Your Future?
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  maxWidth: 600, 
                  mx: 'auto',
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Join thousands of users who are already achieving their goals with Reaglex. 
                Start your journey today and unlock endless possibilities.
              </Typography>

              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={3} 
                justifyContent="center"
                alignItems="center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    endIcon={<ArrowForward />}
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      minWidth: 200,
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Get Started Free
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleSignIn}
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: 3,
                      borderColor: 'white',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderWidth: 2,
                      minWidth: 200,
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </motion.div>
              </Stack>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                    No Setup Fees
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                    Cancel Anytime
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                    24/7 Support
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

// Testimonials Section Component
const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student',
      avatar: 'SJ',
      content: 'Reaglex has transformed my learning experience. The courses are comprehensive and the instructors are amazing!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Car Dealer',
      avatar: 'MC',
      content: 'The e-commerce platform is fantastic. I\'ve sold more cars in 3 months than I did in a year before.',
      rating: 5,
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Instructor',
      avatar: 'ER',
      content: 'Teaching on Reaglex is a joy. The platform provides excellent tools for creating engaging content.',
      rating: 5,
    },
  ];

  return (
    <Box sx={{ py: 8, background: '#f8f9fa' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              What Our Users Say
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Real stories from our community
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    p: 3,
                  }}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: '#ffd700', fontSize: 20 }} />
                    ))}
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                    "{testimonial.content}"
                  </Typography>
                  
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        mr: 2,
                        width: 50,
                        height: 50,
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// CTA Section Component
const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box textAlign="center">
            <Typography variant="h3" component="h2" fontWeight="bold" color="white" gutterBottom>
              Ready to Get Started?
            </Typography>
            
            <Typography variant="h6" color="white" sx={{ opacity: 0.9, mb: 4 }}>
              Join thousands of users who are already transforming their lives with Reaglex
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/auth/register')}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Create Free Account
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/auth/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'white',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </motion.div>
            </Stack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

// Main Landing Page Component
const LandingPage: React.FC = () => {
  return (
    <Box>
      <HeroSection />
      <FeaturesSection />
      <StatisticsSection />
      <CallToActionSection />
      <TestimonialsSection />
    </Box>
  );
};

export default LandingPage;
