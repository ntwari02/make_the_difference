import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, TextField, Button, Snackbar, Alert } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';
import { universityApi } from '../services/universityApi';

const UniversityCreateScholarship: React.FC = () => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [awards, setAwards] = React.useState(1);
  const [open, setOpen] = React.useState(false);

  const submit = async () => {
    if (!title) return;
    await universityApi.createScholarship({ title, description, awards_count: awards });
    setOpen(true);
    setTitle('');
    setDescription('');
    setAwards(1);
  };

  return (
    <UniversityLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Create Scholarship</Typography>
        <Typography variant="body2" color="text.secondary">Define a new scholarship opportunity</Typography>
      </Box>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline minRows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Awards Count" type="number" value={awards} onChange={(e) => setAwards(parseInt(e.target.value, 10) || 0)} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={submit} disabled={!title}>Create</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Snackbar open={open} autoHideDuration={2000} onClose={() => setOpen(false)}>
        <Alert severity="success" onClose={() => setOpen(false)}>Scholarship created</Alert>
      </Snackbar>
    </UniversityLayout>
  );
};

export default UniversityCreateScholarship;



