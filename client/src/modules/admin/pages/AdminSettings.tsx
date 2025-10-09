import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, Switch, FormControlLabel, TextField, Button, LinearProgress, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import AdminLayout from '../components/layout/AdminLayout';
import { adminApi } from '../services/adminApi';

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [settings, setSettings] = React.useState<any>({});
  const [flags, setFlags] = React.useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [s, f] = await Promise.all([adminApi.getSystemSettings(), adminApi.getFeatureFlags()]);
      setSettings(s || {});
      setFlags(Array.isArray(f) ? f : []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true);
    try {
      await adminApi.updateSystemSettings(settings);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (flag: any) => {
    const updated = { ...flag, is_enabled: !flag.is_enabled };
    await adminApi.updateFeatureFlag(flag.id, { is_enabled: updated.is_enabled, target_percentage: flag.target_percentage, description: flag.description });
    setFlags(flags.map(f => f.id === flag.id ? updated : f));
  };

  return (
    <AdminLayout>
      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h5" fontWeight={700}>System Settings</Typography>
          <Typography variant="body2" color="text.secondary">Manage global configuration and feature flags</Typography>
        </Box>
        <Button variant="contained" onClick={save} disabled={loading}>Save</Button>
      </Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>General</Typography>
              <FormControlLabel control={<Switch checked={!!settings.maintenance_mode} onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })} />} label="Maintenance Mode" />
              <TextField fullWidth label="Maintenance Message" value={settings.maintenance_message || ''} onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })} sx={{ mt: 2 }} />
              <FormControlLabel control={<Switch checked={!!settings.auto_approve_courses} onChange={(e) => setSettings({ ...settings, auto_approve_courses: e.target.checked })} />} label="Auto-approve Courses" />
              <FormControlLabel control={<Switch checked={!!settings.require_email_verification} onChange={(e) => setSettings({ ...settings, require_email_verification: e.target.checked })} />} label="Require Email Verification" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Feature Flags</Typography>
              <List>
                {flags.map((f) => (
                  <React.Fragment key={f.id}>
                    <ListItem secondaryAction={<Chip label={f.is_enabled ? 'Enabled' : 'Disabled'} color={f.is_enabled ? 'success' : 'default'} onClick={() => toggleFlag(f)} />}>
                      <ListItemText primary={f.name} secondary={f.description} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {flags.length === 0 && <ListItem><ListItemText primary="No feature flags" /></ListItem>}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default AdminSettings;



