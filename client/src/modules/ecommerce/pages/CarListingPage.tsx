import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const CarListingPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ color: '#fff', mb: 4 }}>
          Car Listings
        </Typography>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Car listing page - Coming soon!
        </Typography>
      </Container>
    </Box>
  );
};

export default CarListingPage;

