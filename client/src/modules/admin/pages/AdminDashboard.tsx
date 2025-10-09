import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, LinearProgress, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import AdminLayout from '../components/layout/AdminLayout';
import { adminApi } from '../services/adminApi';

const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = React.useState<any | null>(null);
  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [activity, setActivity] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [ov, al, ac] = await Promise.all([
          adminApi.getOverview({ period: '30d' }),
          adminApi.getAlerts(),
          adminApi.getRecentActivity({ limit: 10 }),
        ]);
        setOverview(ov);
        setAlerts(Array.isArray(al) ? al : []);
        setActivity(Array.isArray(ac) ? ac : []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <AdminLayout>
      <Box mb={2}>
        <Typography variant="h5" fontWeight={700}>Admin Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Platform overview and recent activity</Typography>
      </Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Users</Typography>
              <Typography variant="h5" fontWeight={800}>{overview?.users?.total ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Courses</Typography>
              <Typography variant="h5" fontWeight={800}>{overview?.elearning?.total_courses ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Cars</Typography>
              <Typography variant="h5" fontWeight={800}>{overview?.ecommerce?.total_cars ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Online Classes</Typography>
              <Typography variant="h5" fontWeight={800}>{overview?.online_classes?.total_classes ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pending Alerts</Typography>
              <List>
                {alerts.map((a, i) => (
                  <React.Fragment key={`${a.type}-${i}`}>
                    <ListItem>
                      <ListItemText primary={a.description || a.type} secondary={`Count: ${a.count ?? 0}`} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {alerts.length === 0 && <ListItem><ListItemText primary="No alerts" /></ListItem>}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Activity</Typography>
              <List>
                {activity.map((e, i) => (
                  <React.Fragment key={i}>
                    <ListItem secondaryAction={<Chip label={e.activity_type} size="small" />}>
                      <ListItemText primary={e.description} secondary={e.timestamp} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {activity.length === 0 && <ListItem><ListItemText primary="No recent activity" /></ListItem>}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default AdminDashboard;



