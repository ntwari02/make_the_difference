import React, { useState, useEffect } from 'react';
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
  IconButton,
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
  ArrowForward,
  CheckCircle,
  ArrowBack,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';



// Theme Context
const ThemeContext = React.createContext<{
  isDarkMode: boolean;
  toggleTheme: () => void;
}>({
  isDarkMode: false,
  toggleTheme: () => {},
});

// Theme Provider Component
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Apply CSS variables to document
    const root = document.documentElement;
    if (newTheme) {
      root.style.setProperty('--bg-primary', '#0f0f23');
      root.style.setProperty('--bg-secondary', '#1a1a2e');
      root.style.setProperty('--bg-tertiary', '#16213e');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#e0e0e0');
      root.style.setProperty('--text-muted', '#a0a0a0');
      root.style.setProperty('--accent-primary', '#6366f1');
      root.style.setProperty('--accent-secondary', '#8b5cf6');
      root.style.setProperty('--card-bg', 'rgba(26, 26, 46, 0.8)');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
    } else {
      root.style.setProperty('--bg-primary', '#1a1a2e');
      root.style.setProperty('--bg-secondary', '#16213e');
      root.style.setProperty('--bg-tertiary', '#0f0f23');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#e0e0e0');
      root.style.setProperty('--text-muted', '#a0a0a0');
      root.style.setProperty('--accent-primary', '#6366f1');
      root.style.setProperty('--accent-secondary', '#8b5cf6');
      root.style.setProperty('--card-bg', 'rgba(26, 26, 46, 0.8)');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
const useTheme = () => React.useContext(ThemeContext);

// Innovative Theme Switcher Component
const ThemeSwitcher: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 15,
        delay: 0.5 
      }}
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        style={{
          width: 45,
          height: 45,
          borderRadius: '50%',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isDarkMode
            ? '0 6px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 6px 24px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Animation */}
        <motion.div
          animate={{
            rotate: isDarkMode ? 360 : 0,
            scale: isDarkMode ? [1, 1.2, 1] : [1, 0.8, 1],
          }}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: isDarkMode
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
          }}
        />

        {/* Icon Container */}
        <motion.div
          animate={{
            rotate: isDarkMode ? 180 : 0,
            scale: isDarkMode ? [1, 0.8, 1] : [1, 1.2, 1],
          }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
          }}
          style={{
            position: 'relative',
            zIndex: 2,
          }}
        >
          {isDarkMode ? (
            <DarkMode 
              sx={{ 
                fontSize: 20, 
                color: '#e0e0e0',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
              }} 
            />
          ) : (
            <LightMode 
              sx={{ 
                fontSize: 20, 
                color: '#ff6b35',
                filter: 'drop-shadow(0 1px 2px rgba(255, 107, 53, 0.3))',
              }} 
            />
          )}
        </motion.div>

        {/* Floating Particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: isDarkMode ? [0, -15, 0] : [0, 15, 0],
              x: isDarkMode ? [0, 8, 0] : [0, -8, 0],
              opacity: isDarkMode ? [0.2, 0.6, 0.2] : [0.4, 0.8, 0.4],
              scale: isDarkMode ? [0.3, 0.8, 0.3] : [0.8, 0.3, 0.8],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              position: 'absolute',
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: isDarkMode ? '#e0e0e0' : '#ff6b35',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </motion.div>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 1.5,
          duration: 0.3 
        }}
        style={{
          position: 'absolute',
          top: '70px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
      </motion.div>
    </motion.div>
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
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
=======
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        style={{
          position: 'absolute',
          top: 55,
          right: 0,
          background: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          color: isDarkMode ? '#fff' : '#333',
          padding: '6px 10px',
          borderRadius: 6,
          fontSize: '11px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
      </motion.div>
    </motion.div>
>>>>>>> sam's
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
    <Box 
      id="why-choose-section"
      sx={{ 
      minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      py: 8,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Animation Elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 80 + 40,
            height: Math.random() * 80 + 40,
            borderRadius: '50%',
            background: `rgba(25, 118, 210, ${Math.random() * 0.1 + 0.05})`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: Math.random() * 8 + 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ px: 4, position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" mb={8}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#1e293b',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' },
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Why Choose Reaglex?
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#64748b', 
                  maxWidth: 600, 
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                }}
              >
                We provide comprehensive solutions that empower individuals and businesses 
                to achieve their goals through technology and innovation.
              </Typography>
            </motion.div>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 100,
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                      borderColor: feature.color,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${feature.color}20, ${feature.color}60)`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
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
                          boxShadow: `0 8px 24px ${feature.color}30`,
                        }}
                      >
                        {feature.icon}
                      </Box>
                    </motion.div>
                    
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
                      <Typography variant="subtitle2" sx={{ color: '#374151', mb: 1, fontWeight: 600, textAlign: 'center' }}>
                        Key Benefits:
                      </Typography>
                      <Stack spacing={1}>
                        {feature.benefits.map((benefit, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 + idx * 0.05 }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircle sx={{ color: feature.color, fontSize: 16 }} />
                              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                {benefit}
                              </Typography>
                            </Box>
                          </motion.div>
                        ))}
                      </Stack>
                    </Box>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                          borderColor: feature.color,
                          color: feature.color,
                          fontWeight: 600,
                          borderRadius: 3,
                          py: 1.5,
                          borderWidth: 2,
                          '&:hover': {
                            background: `${feature.color}10`,
                            borderColor: feature.color,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 24px ${feature.color}30`,
                          },
                        }}
                      >
                        Learn More
                      </Button>
                    </motion.div>
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

<<<<<<< HEAD
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
=======
>>>>>>> sam's

// Testimonials Section Component
const TestimonialsSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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
    {
      name: 'David Kim',
      role: 'Scholarship Recipient',
      avatar: 'DK',
      content: 'Thanks to Reaglex, I found the perfect scholarship that helped me pursue my dream education abroad.',
      rating: 5,
    },
    {
      name: 'Lisa Wang',
      role: 'Visa Applicant',
      avatar: 'LW',
      content: 'The visa assistance service was incredible. They guided me through every step and my application was approved!',
      rating: 5,
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 2500); // Change slide every 2.5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length, isPaused]);

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

        <Box 
          sx={{ position: 'relative', overflow: 'hidden' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows */}
          <IconButton
            onClick={prevSlide}
            sx={{
              position: 'absolute',
              left: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              background: 'white',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                background: '#f8f9fa',
                transform: 'translateY(-50%) scale(1.1)',
              },
            }}
          >
            <ArrowBack />
          </IconButton>

          <IconButton
            onClick={nextSlide}
            sx={{
              position: 'absolute',
              right: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              background: 'white',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                background: '#f8f9fa',
                transform: 'translateY(-50%) scale(1.1)',
              },
            }}
          >
            <ArrowForward />
          </IconButton>

          {/* Sliding Container */}
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              height: 300,
            }}
          >
          <Box
            sx={{
              display: 'flex',
              transition: 'transform 0.5s ease-in-out',
              transform: `translateX(-${currentSlide * 100}%)`,
                height: '100%',
            }}
          >
            {testimonials.map((testimonial, index) => (
              <Box
                key={index}
                sx={{
                    minWidth: '100%',
                    width: '100%',
                  px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                      opacity: 1,
                      scale: 1,
                  }}
                  transition={{ duration: 0.3 }}
                    style={{ width: '100%', maxWidth: 600 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                      p: 4,
                      background: 'white',
                        border: '2px solid #1976d2',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Rating Stars */}
                    <Box display="flex" alignItems="center" mb={2}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} sx={{ color: '#ffd700', fontSize: 24 }} />
                      ))}
                    </Box>
                    
                    {/* Testimonial Content */}
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3, 
                        fontStyle: 'italic',
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                      }}
                    >
                      "{testimonial.content}"
                    </Typography>
                    
                    {/* User Information */}
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          mr: 2,
                          width: 60,
                          height: 60,
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>
                      
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </motion.div>
              </Box>
            ))}
            </Box>
          </Box>

          {/* Dots Indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 1 }}>
            {testimonials.map((_, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Box
                  onClick={() => goToSlide(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: index === currentSlide ? '#1976d2' : '#e0e0e0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: index === currentSlide ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: index === currentSlide ? '0 0 8px rgba(25, 118, 210, 0.3)' : 'none',
                    '&:hover': {
                      background: index === currentSlide ? '#1565c0' : '#bdbdbd',
                      transform: 'scale(1.3)',
                    },
                  }}
                />
              </motion.div>
            ))}
            
            {/* Auto-slide indicator */}
            <Box sx={{ ml: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isPaused ? '#ff9800' : '#4caf50',
                  transition: 'all 0.3s ease',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {isPaused ? 'Paused' : `Auto (${currentSlide + 1}/${testimonials.length})`}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// Typing Animation Component
const TypingAnimation: React.FC<{ text: string; speed?: number }> = ({ text, speed = 100 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isDeleting && currentIndex < text.length) {
      // Typing phase
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isDeleting && currentIndex >= text.length) {
      // Finished typing, wait a moment then start deleting
      const waitTimeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1500); // Wait 1.5 seconds before starting to delete

      return () => clearTimeout(waitTimeout);
    } else if (isDeleting && displayText.length > 0) {
      // Deleting phase
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev.slice(0, -1));
      }, speed / 2); // Delete faster than typing

      return () => clearTimeout(timeout);
    } else if (isDeleting && displayText.length === 0) {
      // Finished deleting, restart
      const restartTimeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentIndex(0);
      }, 500); // Short pause before restarting

      return () => clearTimeout(restartTimeout);
    }
  }, [currentIndex, text, speed, isDeleting, displayText.length]);

  return <span>{displayText}</span>;
};

// Get Started Section Component
const GetStartedSection: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleGetStarted = () => {
    navigate('/auth/login');
  };

  const handleLearnMore = () => {
    // Scroll to "Why Choose Reaglex" section
    const whyChooseSection = document.getElementById('why-choose-section');
    if (whyChooseSection) {
      whyChooseSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ 
      py: 8, 
      background: isDarkMode 
        ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)'
        : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Animation Elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 60 + 30,
            height: Math.random() * 60 + 30,
            borderRadius: '50%',
            background: `rgba(255, 255, 255, ${Math.random() * 0.08 + 0.03})`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: Math.random() * 8 + 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box textAlign="center" mb={6}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'white',
                  mb: 2,
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                }}
              >
                <TypingAnimation text="Your Journey to Success Starts with Reaglex" speed={80} />
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  maxWidth: 500, 
                  mx: 'auto',
                  lineHeight: 1.5,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  mb: 3,
                }}
              >
                Trusted by over 10,000+ learners worldwide. Reaglex unlocks your potential with our comprehensive platform that delivers real results and transforms dreams into achievements.
              </Typography>
            </motion.div>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                size="medium"
                onClick={handleGetStarted}
                sx={{
                  background: 'linear-gradient(45deg, #ffffff 30%, #f5f5f5 90%)',
                  color: '#1976d2',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #f5f5f5 30%, #ffffff 90%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Get Free Start
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outlined"
                size="medium"
                onClick={handleLearnMore}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Learn More
              </Button>
            </motion.div>
          </Box>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            {[
              { icon: <People sx={{ fontSize: 24 }} />, text: '10,000+ Success Stories' },
              { icon: <Star sx={{ fontSize: 24 }} />, text: '4.9/5 Trusted Rating' },
              { icon: <TrendingUp sx={{ fontSize: 24 }} />, text: '98% Achievement Rate' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                  {item.icon}
                  <Typography variant="body1" fontWeight="bold">
                    {item.text}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};


// Main Landing Page Component
const LandingPage: React.FC = () => {
  return (
    <ThemeProvider>
    <Box>
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
