import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, Button } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorScheduler: React.FC = () => {
  return (
    <InstructorLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>Scheduler</Typography>
        <Button variant="contained">Add Availability</Button>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Calendar coming soon…</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </InstructorLayout>
  );
};

export default InstructorScheduler;


