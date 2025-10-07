import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, TextField, Button, Switch, FormControlLabel } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';

const UniversitySettings: React.FC = () => {
  const [orgName, setOrgName] = React.useState('My University');
  const [contactEmail, setContactEmail] = React.useState('contact@university.edu');
  const [notifyApplicants, setNotifyApplicants] = React.useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Persist later; for now just simulate
    console.log({ orgName, contactEmail, notifyApplicants });
  };

  return (
    <UniversityLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Settings</Typography>
        <Typography variant="body2" color="text.secondary">Manage organization preferences</Typography>
      </Box>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSave}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Organization Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Contact Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={notifyApplicants} onChange={(e) => setNotifyApplicants(e.target.checked)} />} label="Email applicants on status changes" />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained">Save Changes</Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </UniversityLayout>
  );
};

export default UniversitySettings;


