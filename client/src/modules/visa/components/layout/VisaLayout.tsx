import React from 'react';
import { Box, Container } from '@mui/material';
import VisaSidebar from './VisaSidebar';
import VisaHeader from './VisaHeader';

interface VisaLayoutProps {
  children: React.ReactNode;
}

const VisaLayout: React.FC<VisaLayoutProps> = ({ children }) => {
  return (
    <Box display="flex" minHeight="100vh" bgcolor={(t) => t.palette.background.default}>
      <VisaSidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <VisaHeader />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default VisaLayout;


