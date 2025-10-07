import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, GridLegacy as Grid } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorSettings: React.FC = () => {
  return (
    <InstructorLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Settings</Typography>
      </Box>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Display Name" defaultValue="John Doe" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Headline" defaultValue="Senior Instructor" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Bio" multiline minRows={4} defaultValue="Educator with 10+ years experience." />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained">Save Changes</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </InstructorLayout>
  );
};

export default InstructorSettings;


