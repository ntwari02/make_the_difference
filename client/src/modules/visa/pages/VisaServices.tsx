import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, Button, TextField, InputAdornment, Chip, useTheme } from '@mui/material';
import { Search as SearchIcon, Public as CountryIcon, Category as TypeIcon, TravelExplore as ServiceIcon, Add as AddIcon } from '@mui/icons-material';
import VisaLayout from '../components/layout/VisaLayout';
import { visaApi } from '../services/visaApi';

const VisaServices: React.FC = () => {
  const theme = useTheme();
  const [items, setItems] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [query, setQuery] = React.useState<string>('');

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await visaApi.listServices();
      const normalized = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
      setItems(normalized);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  return (
    <VisaLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1}>
        <Typography variant="h5" fontWeight={700}>Visa Services</Typography>
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            placeholder="Search services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => window.location.assign('/visa/services/create')}>Create Service</Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box display="grid" placeItems="center" py={8}><Typography variant="body2" color="text.secondary">Loading services…</Typography></Box>
      ) : items.length === 0 ? (
        <Card sx={{ textAlign: 'center' }}>
          <CardContent>
            <ServiceIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>No services found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Create your first visa service to get started.</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => window.location.assign('/visa/services/create')}>Create Service</Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {items
            .filter((s: any) => {
              const q = query.toLowerCase();
              return (
                !q ||
                (s.title || '').toLowerCase().includes(q) ||
                (s.country || '').toLowerCase().includes(q) ||
                (s.visa_type || '').toLowerCase().includes(q)
              );
            })
            .map((s: any, idx: number) => (
            <Grid item xs={12} md={6} key={s.id || idx}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="overline" color="text.secondary">Visa Service</Typography>
                      <Typography variant="h6" fontWeight={700}>{s.title}</Typography>
                    </Box>
                    <ServiceIcon sx={{ color: theme.palette.primary.main }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {s.description || 'No description provided.'}
                  </Typography>
                  <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                    <Chip icon={<CountryIcon />} label={s.country || 'Country'} size="small" />
                    <Chip icon={<TypeIcon />} label={s.visa_type || 'Type'} size="small" variant="outlined" />
                  </Box>
                  <Box mt={2} display="flex" gap={1}>
                    <Button size="small" variant="outlined" onClick={() => window.location.assign(`/visa/services/${s.id}`)}>Edit</Button>
                    <Button size="small" variant="contained" onClick={() => window.location.assign(`/visa/apply?id=${s.id}`)}>Apply</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </VisaLayout>
  );
};

export default VisaServices;


