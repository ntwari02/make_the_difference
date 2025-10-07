import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';

const UniversityAIAssistant: React.FC = () => {
  return (
    <UniversityLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>AI Assistant</Typography>
      </Box>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">Use AI to draft scholarship descriptions or applicant communications.</Typography>
            <TextField fullWidth multiline minRows={4} placeholder="Draft an email to an applicant requesting missing documents…" />
            <Box>
              <Button variant="contained">Generate</Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </UniversityLayout>
  );
};

export default UniversityAIAssistant;


