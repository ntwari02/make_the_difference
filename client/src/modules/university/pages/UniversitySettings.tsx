import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, TextField, Button, Switch, FormControlLabel } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';

const UniversitySettings: React.FC = () => {
  const [name, setName] = React.useState('University Provider');
  const [notify, setNotify] = React.useState(true);

  return (
    <UniversityLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>University Settings</Typography>
      </Box>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Organization Name" value={name} onChange={(e) => setName(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel control={<Switch checked={notify} onChange={(e) => setNotify(e.target.checked)} />} label="Email notifications" />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained">Save</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </UniversityLayout>
  );
};

export default UniversitySettings;



