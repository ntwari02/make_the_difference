import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorAIAssistant: React.FC = () => {
  return (
    <InstructorLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>AI Teaching Assistant</Typography>
      </Box>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">Ask AI to help with lesson plans, quizzes, and explanations.</Typography>
            <TextField fullWidth multiline minRows={4} placeholder="Ask AI to generate a quiz on React hooks…" />
            <Box>
              <Button variant="contained">Generate</Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </InstructorLayout>
  );
};

export default InstructorAIAssistant;


