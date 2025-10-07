import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, TextField, Button, Switch, FormControlLabel } from '@mui/material';
import VisaLayout from '../components/layout/VisaLayout';

const VisaSettings: React.FC = () => {
  const [orgName, setOrgName] = React.useState('Visa Office');
  const [contactEmail, setContactEmail] = React.useState('visa@office.com');
  const [notifications, setNotifications] = React.useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ orgName, contactEmail, notifications });
  };

  return (
    <VisaLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Settings</Typography>
      </Box>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSave}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Office Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Contact Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />} label="Email on application updates" />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained">Save Changes</Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </VisaLayout>
  );
};

export default VisaSettings;


