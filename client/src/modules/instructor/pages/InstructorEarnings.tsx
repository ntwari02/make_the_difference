import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorEarnings: React.FC = () => {
  return (
    <InstructorLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Earnings</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">This Month</Typography>
              <Typography variant="h4" fontWeight={700}>$8,430</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Pending Payout</Typography>
              <Typography variant="h4" fontWeight={700}>$2,140</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Total</Typography>
              <Typography variant="h4" fontWeight={700}>$42,380</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </InstructorLayout>
  );
};

export default InstructorEarnings;


