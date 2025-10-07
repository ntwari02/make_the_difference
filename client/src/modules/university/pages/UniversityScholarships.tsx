import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, Button } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';
import { universityApi } from '../services/universityApi';

const UniversityScholarships: React.FC = () => {
  const [items, setItems] = React.useState<any[]>([]);

  const load = async () => {
    const data = await universityApi.listProviderScholarships();
    const normalized = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
    setItems(normalized);
  };

  React.useEffect(() => { load(); }, []);

  return (
    <UniversityLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>My Scholarships</Typography>
        <Button variant="contained" onClick={() => window.location.assign('/university/scholarships/create')}>Create Scholarship</Button>
      </Box>
      <Grid container spacing={2}>
        {(items || []).map((s: any, idx: number) => (
          <Grid item xs={12} md={6} key={s.id || idx}>
            <Card>
              <CardContent>
                <Typography variant="h6">{s.title || s.name}</Typography>
                <Typography variant="body2" color="text.secondary">Awards: {s.awards_count ?? '-'}</Typography>
                <Box mt={2} display="flex" gap={1}>
                  <Button size="small" variant="outlined" onClick={() => window.location.assign(`/university/applications?scholarshipId=${s.id}`)}>View Applications</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </UniversityLayout>
  );
};

export default UniversityScholarships;



