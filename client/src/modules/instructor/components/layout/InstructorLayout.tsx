import React from 'react';
import { Box, Container } from '@mui/material';
import InstructorSidebar from './InstructorSidebar';
import InstructorHeader from './InstructorHeader';

interface InstructorLayoutProps {
  children: React.ReactNode;
}

const InstructorLayout: React.FC<InstructorLayoutProps> = ({ children }) => {
  return (
    <Box display="flex" minHeight="100vh" bgcolor={(theme) => theme.palette.background.default}>
      <InstructorSidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <InstructorHeader />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default InstructorLayout;


