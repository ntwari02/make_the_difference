import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const CarDetailsPage: React.FC = () => {
  const { id } = useParams();

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
          Car Details - {id}
        </Typography>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Car details page - Coming soon!
        </Typography>
      </Container>
    </Box>
  );
};

export default CarDetailsPage;

