import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Stack, Chip } from '@mui/material';
import VisaLayout from '../components/layout/VisaLayout';

const VisaProfile: React.FC = () => {
  return (
    <VisaLayout>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 64, height: 64 }}>V</Avatar>
            <Box>
              <Typography variant="h6">Visa Office</Typography>
              <Typography variant="body2" color="text.secondary">Visa Provider • Verified</Typography>
              <Box mt={1} display="flex" gap={1}>
                <Chip label="Tourist" />
                <Chip label="Student" />
                <Chip label="Work" />
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </VisaLayout>
  );
};

export default VisaProfile;


