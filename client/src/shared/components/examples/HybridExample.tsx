import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Container,
  Chip,
  Avatar,
} from '@mui/material';
import {
  School,
  DirectionsCar,
  Psychology,
  Star,
  TrendingUp,
  People,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Example: Hybrid Material-UI + Tailwind Component
const HybridExample: React.FC = () => {
  const features = [
    {
      icon: <School className="text-4xl" />,
      title: 'E-Learning Platform',
      description: 'Access thousands of courses with interactive lessons and certificates.',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: <DirectionsCar className="text-4xl" />,
      title: 'E-Commerce Hub',
      description: 'Buy and sell cars with secure payment processing and verification.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: <Psychology className="text-4xl" />,
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations and intelligent analytics.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <Box className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <Container maxWidth="lg" className="px-4">
        {/* Header with Tailwind classes */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Typography 
            variant="h3" 
            component="h2" 
            className="font-bold text-gray-800 mb-4"
          >
            Why Choose Our Platform?
          </Typography>
          <Typography 
            variant="h6" 
            className="text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            We provide comprehensive solutions that empower individuals and businesses 
            to achieve their goals through technology and innovation.
          </Typography>
        </motion.div>

        {/* Features Grid with Material-UI Grid + Tailwind styling */}
        <Grid container spacing={6}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className="h-full rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm"
                  elevation={0}
                >
                  <CardContent className="p-8 text-center">
                    {/* Icon with Tailwind classes */}
                    <Box
                      className={`w-20 h-20 rounded-full ${feature.bgColor} flex items-center justify-center mx-auto mb-6 ${feature.color}`}
                    >
                      {feature.icon}
                    </Box>
                    
                    {/* Title with Material-UI Typography + Tailwind */}
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      className="font-bold text-gray-800 mb-4"
                    >
                      {feature.title}
                    </Typography>
                    
                    {/* Description with Tailwind classes */}
                    <Typography 
                      variant="body1" 
                      className="text-gray-600 leading-relaxed mb-6"
                    >
                      {feature.description}
                    </Typography>

                    {/* Button with hybrid styling */}
                    <Button
                      variant="contained"
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Stats Section with Tailwind Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <People className="text-3xl" />, value: '10,000+', label: 'Active Users' },
              { icon: <School className="text-3xl" />, value: '500+', label: 'Courses' },
              { icon: <TrendingUp className="text-3xl" />, value: '98%', label: 'Success Rate' },
              { icon: <Star className="text-3xl" />, value: '4.9/5', label: 'Rating' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-white">
                  {stat.icon}
                </div>
                <Typography variant="h4" className="font-bold text-gray-800 mb-2">
                  {stat.value}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {stat.label}
                </Typography>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section with Tailwind */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
            <Typography variant="h4" className="font-bold mb-4">
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" className="opacity-90 mb-8">
              Join thousands of users who are already transforming their lives
            </Typography>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="contained"
                size="large"
                className="px-8 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-lg font-semibold hover:bg-white/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                className="px-8 py-3 rounded-xl border-2 border-white text-white text-lg font-semibold hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                Learn More
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HybridExample;
