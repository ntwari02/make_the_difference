import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Stack, Chip } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';

const UniversityProfile: React.FC = () => {
  return (
    <UniversityLayout>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 64, height: 64 }}>U</Avatar>
            <Box>
              <Typography variant="h6">My University</Typography>
              <Typography variant="body2" color="text.secondary">Scholarship Provider • Verified</Typography>
              <Box mt={1} display="flex" gap={1}>
                <Chip label="STEM" />
                <Chip label="Arts" />
                <Chip label="International" />
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </UniversityLayout>
  );
};

export default UniversityProfile;


