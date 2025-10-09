import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Button } from '@mui/material';
import VisaLayout from '../components/layout/VisaLayout';
import { visaApi } from '../services/visaApi';

const VisaApplications: React.FC = () => {
  const [apps, setApps] = React.useState<any[]>([]);

  React.useEffect(() => {
    visaApi.listApplications().then(setApps);
  }, []);

  const update = async (id: string, status: string) => {
    await visaApi.updateApplicationStatus(id, status);
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <VisaLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Visa Applications</Typography>
      </Box>
      <Card>
        <CardContent>
          <List>
            {apps.map((a) => (
              <ListItem key={a.id} secondaryAction={
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label={a.status} color={a.status === 'approved' ? 'success' : a.status === 'rejected' ? 'error' : 'warning'} size="small" />
                  <Button size="small" variant="outlined" onClick={() => update(a.id, 'approved')}>Approve</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => update(a.id, 'rejected')}>Reject</Button>
                </Box>
              }>
                <ListItemText primary={a.applicant_name} secondary={`Submitted ${a.submitted_at}`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </VisaLayout>
  );
};

export default VisaApplications;



