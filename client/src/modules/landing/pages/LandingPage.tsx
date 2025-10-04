import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  GridLegacy as Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
} from '@mui/material';
import {
  School,
  DirectionsCar,
  Psychology,
  FlightTakeoff,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';
import ThemeSwitcher from '../../../shared/components/ui/ThemeSwitcher';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Theme Context for the landing page
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('landingTheme');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('landingTheme', JSON.stringify(newTheme));
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
const useTheme = () => React.useContext(ThemeContext);

// Get Started Section Component
const GetStartedSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background: isDarkMode ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white',
        py: { xs: 12, md: 16 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4.5rem' },
              fontWeight: 900,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 5,
              lineHeight: 1.1,
            }}
          >
            Make The Difference
          </Typography>
          
          <Typography
            variant="h4"
            sx={{
              color: '#e0e0e0',
              mb: 6,
              fontWeight: 300,
              maxWidth: 800,
              mx: 'auto',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
            }}
          >
            Your gateway to education, commerce, and intelligent insights
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            sx={{ mt: 6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/auth/login')}
                sx={{
                  bgcolor: '#6366f1',
                  color: 'white',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                  '&:hover': {
                    bgcolor: '#4f46e5',
                  },
                }}
                endIcon={<ArrowForward />}
              >
                Get Started
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: '#6366f1',
                  color: '#6366f1',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderWidth: 2,
                  background: 'rgba(99, 102, 241, 0.1)',
                  '&:hover': {
                    borderWidth: 2,
                    background: 'rgba(99, 102, 241, 0.3)',
                  },
                }}
              >
                Learn More
              </Button>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

// Features Section Component
const FeaturesSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  const features = [
    {
      icon: <School sx={{ fontSize: 40 }} />,
      title: 'E-Learning Platform',
      description: 'Access thousands of courses, interactive lessons, and earn certificates from top instructors worldwide.',
      color: '#10b981',
    },
    {
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      title: 'E-Commerce Hub',
      description: 'Buy and sell cars, spare parts, and automotive services with secure payment processing and verification.',
      color: '#3b82f6',
    },
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations, chatbot assistance, and intelligent analytics for better decisions.',
      color: '#8b5cf6',
    },
  ];

  return (
    <Box sx={{ py: { xs: 12, md: 16 }, bgcolor: isDarkMode ? '#f8fafc' : '#f1f5f9' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              color: isDarkMode ? '#1e293b' : '#334155',
            }}
          >
            Everything You Need In One Platform
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              mb: 8,
              maxWidth: 600,
              mx: 'auto',
              color: isDarkMode ? '#64748b' : '#94a3b8',
              fontWeight: 400,
            }}
          >
            Discover the power of integrated education, commerce, and artificial intelligence
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                  <Card sx={{
                    height: '100%',
                    background: 'white',
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <CardContent sx={{ p: 6, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: 3, bgcolor: `${feature.color}15`, mx: 'auto' }}>
                        <Box sx={{ color: feature.color }}>
                          {feature.icon}
                        </Box>
                      </Box>
                      
                      <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 700, color: '#1e293b' }}>
                        {feature.title}
                      </Typography>
                      
                      <Typography sx={{ textAlign: 'center', mb: 4, color: '#64748b', lineHeight: 1.7 }}>
                        {feature.description}
                      </Typography>
                      
                      <Box sx={{ flex: 1 }}>&nbsp;</Box>
                    </CardContent>
                  </Card>
                </motion.div>
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
  const { isDarkMode } = useTheme();

  const stats = [
    { number: '500+', label: 'Courses Available', icon: <School /> },
    { number: '2,500+', label: 'Cars Listed', icon: <DirectionsCar /> },
    { number: '10,000+', label: 'Happy Users', icon: <Psychology /> },
    { number: '15+', label: 'Countries Served', icon: <FlightTakeoff /> },
  ];

  return (
    <Box sx={{ 
      py: { xs: 12, md: 16 }, 
      background: isDarkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography variant="h2" sx={{ textAlign: 'center', mb: 8, fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, color: 'white' }}>
            Trusted By Thousands Worldwide
          </Typography>
        </motion.div>

        <Grid container spacing={6}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Box sx={{
                  textAlign: 'center',
                  p: 4,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <Box sx={{ color: '#6366f1', mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {stat.icon}
                    </Box>
                  </Box>
                  
                  <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', mb: 1 }}>
                    {stat.number}
                  </Typography>
                  
                  <Typography sx={{ color: '#a0a0a0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.9rem' }}>
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

// Testimonials Section Component
const TestimonialsSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student',
      content: 'The e-learning platform transformed my career. The quality of courses and AI-powered recommendations are incredible.',
      avatar: '/api/placeholder/60/60',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Car Dealer',
      content: 'The e-commerce features helped me reach more customers. The analytics dashboard gives me insights I never had before.',
      avatar: '/api/placeholder/60/60',
      rating: 5,
    },
    {
      name: 'Emma Wilson',
      role: 'Business Owner',
      content: 'The AI assistance is game-changing. It helped streamline our operations and improved customer satisfaction significantly.',
      avatar: '/api/placeholder/60/60',
      rating: 5,
    },
  ];

  return (
    <Box sx={{ py: { xs: 12, md: 16 }, bgcolor: isDarkMode ? '#f8fafc' : '#ffffff', position: 'relative' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography variant="h2" sx={{ textAlign: 'center', mb: 2, fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, color: isDarkMode ? '#1e293b' : '#334155' }}>
            What Our Users Say
          </Typography>
          
          <Typography variant="h6" sx={{ textAlign: 'center', mb: 8, maxWidth: 600, mx: 'auto', color: isDarkMode ? '#64748b' : '#94a3b8', fontWeight: 400 }}>
            Join thousands of satisfied users who have transformed their learning and business
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                  <Card sx={{
                    height: '100%',
                    background: 'white',
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    p: 4,
                    position: 'relative',
                  }}>
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={testimonial.avatar} sx={{ width: 60, height: 60, border: '3px solid #6366f1' }}>
                          {testimonial.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={600} color="#1e293b">
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="#64748b">
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={0.5}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <CheckCircle key={i} sx={{ color: '#10b981', fontSize: 20 }} />
                        ))}
                      </Stack>

                      <Typography sx={{ color: '#475569', lineHeight: 1.7, fontStyle: 'italic' }}>
                        "{testimonial.content}"
                      </Typography>
                    </Stack>
                  </Card>
                </motion.div>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginTop: '4rem' }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/auth/register')}
              sx={{
                bgcolor: '#6366f1',
                color: 'white',
                px: 8,
                py: 3,
                fontSize: '1.2rem',
                borderRadius: 4,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 16px 48px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  bgcolor: '#4f46e5',
                  boxShadow: '0 20px 60px rgba(99, 102, 241, 0.6)',
                },
              }}
              endIcon={<ArrowForward />}
            >
              Start Your Journey Today
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

// Main Landing Page Component
const LandingPage: React.FC = () => {
  return (
    <ThemeProvider>
      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
        <ThemeSwitcher />
        <GetStartedSection />
        <FeaturesSection />
        <StatisticsSection />
        <TestimonialsSection />
      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;