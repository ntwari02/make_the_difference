import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../../core/hooks/useAuth';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showSidebar = true, 
  showFooter = true 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Handle sidebar state based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Header */}
      <Header 
        onSidebarToggle={handleSidebarToggle}
        sidebarOpen={sidebarOpen}
        showSidebarToggle={showSidebar}
      />

      {/* Main Content Area */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Sidebar */}
        {showSidebar && isAuthenticated && (
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{
                  position: isMobile ? 'fixed' : 'relative',
                  zIndex: isMobile ? 1300 : 'auto',
                  height: isMobile ? '100vh' : 'auto',
                }}
              >
                <Sidebar 
                  onClose={() => setSidebarOpen(false)}
                  isMobile={isMobile}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && showSidebar && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1299,
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            transition: 'margin-left 0.3s ease',
            marginLeft: showSidebar && sidebarOpen && !isMobile ? '280px' : 0,
          }}
        >
          {/* Page Content */}
          <Box
            sx={{
              flex: 1,
              padding: theme.spacing(3),
              paddingTop: theme.spacing(2),
              paddingBottom: showFooter ? theme.spacing(2) : theme.spacing(3),
              maxWidth: '100%',
              overflow: 'auto',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
          </Box>

          {/* Footer */}
          {showFooter && (
            <Footer />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
