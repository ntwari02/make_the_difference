import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, List, ListItem, ListItemText, Divider, Button, Chip, LinearProgress } from '@mui/material';
import AdminLayout from '../components/layout/AdminLayout';
import { adminApi } from '../services/adminApi';

const AdminModeration: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [flagged, setFlagged] = React.useState<any>({ cars: [], courses: [], reviews: [], messages: [] });

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getFlaggedContent({ status: 'pending' });
      setFlagged(data || { cars: [], courses: [], reviews: [], messages: [] });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const moderate = async (contentId: string, action: string) => {
    await adminApi.moderateContent(contentId, { action });
    load();
  };

  const Section = ({ title, items }: { title: string; items: any[] }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title} <Chip label={items.length} size="small" sx={{ ml: 1 }} /></Typography>
        <List>
          {items.map((it: any, idx) => (
            <React.Fragment key={it.id || idx}>
              <ListItem
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" color="success" onClick={() => moderate(it.id, 'approve')}>Approve</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => moderate(it.id, 'reject')}>Reject</Button>
                  </Box>
                }
              >
                <ListItemText primary={it.title || it.subject || it.id || 'Item'} secondary={it.reason || it.description || ''} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
          {items.length === 0 && <ListItem><ListItemText primary="No items" /></ListItem>}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <Box mb={2}>
        <Typography variant="h5" fontWeight={700}>Content Moderation</Typography>
        <Typography variant="body2" color="text.secondary">Review flagged content across the platform</Typography>
      </Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Section title="Cars" items={flagged.cars || []} />
          <Section title="Reviews" items={flagged.reviews || []} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Section title="Courses" items={flagged.courses || []} />
          <Section title="Messages" items={flagged.messages || []} />
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default AdminModeration;



