import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, LinearProgress } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';
import { universityApi } from '../services/universityApi';

const UniversityDashboard: React.FC = () => {
  const [stats, setStats] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const s = await universityApi.getProviderApplicationStats();
        setStats(s);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <UniversityLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>University Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Overview of your scholarships and applications</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6">{stats?.active_scholarships ?? 0}</Typography>
              <Typography variant="body2">Active Scholarships</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h6">{stats?.pending_applications ?? 0}</Typography>
              <Typography variant="body2">Pending Applications</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">{stats?.approved_this_month ?? 0}</Typography>
              <Typography variant="body2" color="text.secondary">Approved This Month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">{stats?.award_rate ?? 0}%</Typography>
              <Typography variant="body2" color="text.secondary">Award Rate</Typography>
              <LinearProgress variant="determinate" value={stats?.award_rate ?? 0} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </UniversityLayout>
  );
};

export default UniversityDashboard;



