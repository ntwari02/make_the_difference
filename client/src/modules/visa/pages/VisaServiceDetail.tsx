import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, TextField, Button } from '@mui/material';
import VisaLayout from '../components/layout/VisaLayout';
import { visaApi } from '../services/visaApi';

const VisaServiceDetail: React.FC = () => {
  const { id } = useParams();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [visaType, setVisaType] = React.useState('');

  React.useEffect(() => {
    const load = async () => {
      if (!id) return;
      const data = await visaApi.getService(id);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setCountry(data.country || '');
      setVisaType(data.visa_type || '');
    };
    load();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await visaApi.updateService(id, { title, description, country, visa_type: visaType });
    window.history.back();
  };

  return (
    <VisaLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Edit Visa Service</Typography>
      </Box>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSave}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={4} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Visa Type" value={visaType} onChange={(e) => setVisaType(e.target.value)} required />
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

export default VisaServiceDetail;


