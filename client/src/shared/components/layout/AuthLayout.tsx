import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Outlet />
      </Container>
    </Box>
  );
};

export default AuthLayout;
