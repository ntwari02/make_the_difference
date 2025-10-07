import React from 'react';
import { Box, Container } from '@mui/material';
import UniversitySidebar from './UniversitySidebar';
import UniversityHeader from './UniversityHeader';

interface UniversityLayoutProps {
  children: React.ReactNode;
}

const UniversityLayout: React.FC<UniversityLayoutProps> = ({ children }) => {
  return (
    <Box display="flex" minHeight="100vh" bgcolor={(t) => t.palette.background.default}>
      <UniversitySidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <UniversityHeader />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default UniversityLayout;



