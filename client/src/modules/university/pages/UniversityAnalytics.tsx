import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';

const UniversityAnalytics: React.FC = () => {
  return (
    <UniversityLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Analytics</Typography>
        <Typography variant="body2" color="text.secondary">Visualize applications and awards</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Submissions Trend</Typography>
              <Box height={220} display="grid" placeItems="center" color="text.secondary.main">Chart Placeholder</Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Approval Rate</Typography>
              <Box height={220} display="grid" placeItems="center" color="text.secondary.main">Chart Placeholder</Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </UniversityLayout>
  );
};

export default UniversityAnalytics;



