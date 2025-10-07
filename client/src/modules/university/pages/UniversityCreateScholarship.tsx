import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, GridLegacy as Grid } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';
import { universityApi } from '../services/universityApi';

const UniversityCreateScholarship: React.FC = () => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [deadline, setDeadline] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await universityApi.createScholarship({ title, description, deadline });
    window.location.assign('/university/scholarships');
  };

  return (
    <UniversityLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Create Scholarship</Typography>
      </Box>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={4} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="YYYY-MM-DD" />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained">Create</Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </UniversityLayout>
  );
};

export default UniversityCreateScholarship;



