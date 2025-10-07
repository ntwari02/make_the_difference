import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack } from '@mui/material';
import VisaLayout from '../components/layout/VisaLayout';

const VisaAIAssistant: React.FC = () => {
  return (
    <VisaLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>AI Assistant</Typography>
      </Box>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">Use AI to draft visa service descriptions or applicant communications.</Typography>
            <TextField fullWidth multiline minRows={4} placeholder="Draft a message requesting additional documents…" />
            <Box>
              <Button variant="contained">Generate</Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </VisaLayout>
  );
};

export default VisaAIAssistant;


