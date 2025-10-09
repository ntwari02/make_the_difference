import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, Tabs, Tab, LinearProgress } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import AdminLayout from '../components/layout/AdminLayout';
import { adminApi } from '../services/adminApi';

const AdminAnalytics: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [overview, setOverview] = React.useState<any | null>(null);
  const [ecommerce, setEcommerce] = React.useState<any | null>(null);
  const [elearning, setElearning] = React.useState<any | null>(null);
  const [classes, setClasses] = React.useState<any | null>(null);
  const [certs, setCerts] = React.useState<any | null>(null);

  React.useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [ov, ec, el, cl, ce] = await Promise.all([
          adminApi.getAnalyticsOverview({ period: '30d' }),
          adminApi.getEcommerceAnalytics({ period: '30d' }),
          adminApi.getElearningAnalytics({ period: '30d' }),
          adminApi.getClassesAnalytics({ period: '30d' }),
          adminApi.getCertificatesAnalytics({ period: '30d' }),
        ]);
        setOverview(ov);
        setEcommerce(ec);
        setElearning(el);
        setClasses(cl);
        setCerts(ce);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const barData = [
    { metric: 'Users', value: overview?.users?.total ?? 0 },
    { metric: 'Courses', value: overview?.elearning?.total_courses ?? 0 },
    { metric: 'Cars', value: overview?.ecommerce?.total_cars ?? 0 },
    { metric: 'Classes', value: overview?.online_classes?.total_classes ?? 0 },
  ];

  const lineData = [
    {
      id: 'New Users',
      data: [
        { x: '7d', y: (overview?.users?.new_this_period ?? 0) / 4 },
        { x: '30d', y: overview?.users?.new_this_period ?? 0 },
        { x: '90d', y: (overview?.users?.new_this_period ?? 0) * 2 },
      ],
    },
  ];

  return (
    <AdminLayout>
      <Box mb={2}>
        <Typography variant="h5" fontWeight={700}>Analytics</Typography>
        <Typography variant="body2" color="text.secondary">System-wide analytics</Typography>
      </Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
            <Tab label="Overview" />
            <Tab label="Ecommerce" />
            <Tab label="E-learning" />
            <Tab label="Classes" />
            <Tab label="Certificates" />
          </Tabs>
        </CardContent>
      </Card>

      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Key Metrics</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveBar data={barData} keys={["value"]} indexBy="metric" margin={{ top: 10, right: 20, bottom: 40, left: 40 }} padding={0.3} colors={{ scheme: 'set2' }} axisBottom={{ tickRotation: 0 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Growth</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveLine data={lineData} margin={{ top: 20, right: 30, bottom: 40, left: 40 }} xScale={{ type: 'point' }} yScale={{ type: 'linear' }} axisBottom={{ orient: 'bottom' }} axisLeft={{ orient: 'left' }} colors={{ scheme: 'category10' }} pointSize={6} useMesh />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Ecommerce Summary</Typography>
                <Typography variant="body2" color="text.secondary">Total Cars: {ecommerce?.total_cars ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary">Sold Cars: {ecommerce?.sold_cars ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary">Pending Cars: {ecommerce?.pending_cars ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>E-learning Summary</Typography>
                <Typography variant="body2" color="text.secondary">Total Courses: {elearning?.total_courses ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary">Published Courses: {elearning?.published_courses ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 3 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Online Classes Summary</Typography>
                <Typography variant="body2" color="text.secondary">Total Classes: {classes?.total_classes ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary">Live: {classes?.live_classes ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary">Completed: {classes?.completed_classes ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 4 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Certificates Summary</Typography>
                <Typography variant="body2" color="text.secondary">Total Issued: {certs?.issued_certificates ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;



