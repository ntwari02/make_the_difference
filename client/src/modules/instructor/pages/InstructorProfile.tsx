import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Stack, Chip } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorProfile: React.FC = () => {
  return (
    <InstructorLayout>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 64, height: 64 }}>JD</Avatar>
            <Box>
              <Typography variant="h6">John Doe</Typography>
              <Typography variant="body2" color="text.secondary">Senior Instructor • 4.7 rating</Typography>
              <Box mt={1} display="flex" gap={1}>
                <Chip label="React" />
                <Chip label="TypeScript" />
                <Chip label="Node.js" />
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </InstructorLayout>
  );
};

export default InstructorProfile;


