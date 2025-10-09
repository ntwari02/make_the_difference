import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';

const UniversityAIAssistant: React.FC = () => {
  return (
    <UniversityLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>AI Assistant</Typography>
        <Typography variant="body2" color="text.secondary">Coming soon</Typography>
      </Box>
      <Card>
        <CardContent>
          <Typography color="text.secondary">This space is reserved for AI assistance features.</Typography>
        </CardContent>
      </Card>
    </UniversityLayout>
  );
};

export default UniversityAIAssistant;



