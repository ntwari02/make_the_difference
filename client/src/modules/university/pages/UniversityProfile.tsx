import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, GridLegacy as Grid, Chip } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';

const UniversityProfile: React.FC = () => {
  return (
    <UniversityLayout>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 64, height: 64 }}>U</Avatar>
            <Box>
              <Typography variant="h6">University Provider</Typography>
              <Typography variant="body2" color="text.secondary">Partner since 2024</Typography>
              <Box mt={1} display="flex" gap={1}>
                <Chip label="STEM" />
                <Chip label="International" />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </UniversityLayout>
  );
};

export default UniversityProfile;



