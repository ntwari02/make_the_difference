import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, Chip, Button } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';
import { universityApi } from '../services/universityApi';

const UniversityApplications: React.FC = () => {
  const [scholarships, setScholarships] = React.useState<any[]>([]);
  const [selectedSch, setSelectedSch] = React.useState<string>('');
  const [apps, setApps] = React.useState<any[]>([]);

  React.useEffect(() => {
    universityApi.listProviderScholarships().then((res: any) => {
      const normalized = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setScholarships(normalized);
      if (normalized.length) setSelectedSch(normalized[0].id);
    }).catch(() => {
      setScholarships([]);
    });
  }, []);

  React.useEffect(() => {
    if (!selectedSch) return;
    universityApi.listApplications(selectedSch).then(setApps);
  }, [selectedSch]);

  const updateStatus = async (id: string, status: string) => {
    await universityApi.updateApplicationStatus(id, status);
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  return (
    <UniversityLayout>
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={700}>Applications</Typography>
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel>Scholarship</InputLabel>
          <Select label="Scholarship" value={selectedSch} onChange={(e) => setSelectedSch(e.target.value)}>
            {(scholarships || []).map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Card>
        <CardContent>
          <List>
            {apps.map((a) => (
              <ListItem key={a.id} secondaryAction={
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label={a.status} color={a.status === 'approved' ? 'success' : a.status === 'rejected' ? 'error' : 'warning'} size="small" />
                  <Button size="small" variant="outlined" onClick={() => updateStatus(a.id, 'approved')}>Approve</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => updateStatus(a.id, 'rejected')}>Reject</Button>
                </Box>
              }>
                <ListItemText primary={a.applicant_name} secondary={`Submitted ${a.submitted_at}`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </UniversityLayout>
  );
};

export default UniversityApplications;



