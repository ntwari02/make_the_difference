import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  GitHub,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const theme = useTheme();

  const footerLinks = {
    platform: [
      { label: 'E-Learning', href: '/app/courses' },
      { label: 'E-Commerce', href: '/app/cars' },
      { label: 'AI Features', href: '/app/ai' },
      { label: 'Scholarships', href: '/app/scholarships' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api-docs' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR Compliance', href: '/gdpr' },
    ],
  };

  const socialLinks = [
    { icon: <Facebook />, href: 'https://facebook.com/reaglex', label: 'Facebook' },
    { icon: <Twitter />, href: 'https://twitter.com/reaglex', label: 'Twitter' },
    { icon: <LinkedIn />, href: 'https://linkedin.com/company/reaglex', label: 'LinkedIn' },
    { icon: <Instagram />, href: 'https://instagram.com/reaglex', label: 'Instagram' },
    { icon: <GitHub />, href: 'https://github.com/reaglex', label: 'GitHub' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'dark' 
          ? theme.palette.grey[900] 
          : theme.palette.grey[50],
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                Reaglex Platform
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                A comprehensive platform combining e-learning, e-commerce, AI features, 
                scholarships, and visa management for a complete digital experience.
              </Typography>
              
              {/* Contact Info */}
              <Box sx={{ mt: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Email sx={{ fontSize: 16, mr: 1, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary">
                    support@reaglex.com
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <Phone sx={{ fontSize: 16, mr: 1, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary">
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <LocationOn sx={{ fontSize: 16, mr: 1, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary">
                    San Francisco, CA
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Platform Links */}
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                Platform
              </Typography>
              {footerLinks.platform.map((link) => (
                <Box key={link.label} mb={1}>
                  <Link
                    href={link.href}
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </motion.div>
          </Grid>

          {/* Support Links */}
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                Support
              </Typography>
              {footerLinks.support.map((link) => (
                <Box key={link.label} mb={1}>
                  <Link
                    href={link.href}
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </motion.div>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                Legal
              </Typography>
              {footerLinks.legal.map((link) => (
                <Box key={link.label} mb={1}>
                  <Link
                    href={link.href}
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </motion.div>
          </Grid>

          {/* Social Links */}
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                Follow Us
              </Typography>
              <Box display="flex" gap={1}>
                {socialLinks.map((social) => (
                  <motion.div
                    key={social.label}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IconButton
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          color: theme.palette.primary.main,
                          backgroundColor: theme.palette.action.hover,
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {social.icon}
                    </IconButton>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Bottom Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Typography variant="body2" color="text.secondary">
              © 2024 Reaglex Platform. All rights reserved.
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="body2" color="text.secondary">
              Built with ❤️ for the future of education and commerce
            </Typography>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
