import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, Chip, Alert, TextField, InputAdornment, IconButton, List, ListItem, ListItemText, Divider, LinearProgress } from '@mui/material';
import { Search, Refresh, HourglassEmpty, CheckCircle, Cancel as CancelIcon, PlaylistAddCheck as QueueIcon, Clear } from '@mui/icons-material';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveRadar } from '@nivo/radar';
import VisaLayout from '../components/layout/VisaLayout';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../../core/hooks/useAuth';
import { visaApi } from '../services/visaApi';

const VisaDashboard: React.FC = () => {
  // const navigate = useNavigate();
  // const { logout } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [apps, setApps] = React.useState<any[]>([]);
  const [queue, setQueue] = React.useState<any[]>([]);

  // Logout moved to header

  const loadData = async () => {
    setLoading(true);
    try {
      const [a, q] = await Promise.all([
        visaApi.listApplications(),
        visaApi.listReviewQueue(),
      ]);
      setApps(Array.isArray(a) ? a : []);
      setQueue(Array.isArray(q) ? q : []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Charts data
  const statusCounts = React.useMemo(() => ({
    pending: apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  }), [apps]);

  const barData = React.useMemo(() => ([
    { status: 'Pending', count: statusCounts.pending },
    { status: 'Approved', count: statusCounts.approved },
    { status: 'Rejected', count: statusCounts.rejected },
  ]), [statusCounts]);

  const priorityCounts = React.useMemo(() => {
    const high = queue.filter(q => (q.priority || '').toString().toLowerCase() === 'high').length;
    const normal = queue.filter(q => (q.priority || '').toString().toLowerCase() === 'normal').length;
    const low = queue.filter(q => (q.priority || '').toString().toLowerCase() === 'low').length;
    return { high, normal, low };
  }, [queue]);

  const radarData = React.useMemo(() => ([
    { priority: 'High', value: priorityCounts.high },
    { priority: 'Normal', value: priorityCounts.normal },
    { priority: 'Low', value: priorityCounts.low },
  ]), [priorityCounts]);

  return (
    <>
    <VisaLayout>
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>Visa Officer Dashboard</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            sx={{
              minWidth: { xs: 180, sm: 240 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                boxShadow: (t) => t.palette.mode === 'dark' ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'box-shadow 0.2s ease, background 0.2s ease',
                '&:hover': {
                  boxShadow: (t) => t.palette.mode === 'dark' ? 'inset 0 0 0 1px rgba(255,255,255,0.14)' : '0 2px 6px rgba(0,0,0,0.12)'
                },
                '&.Mui-focused': {
                  boxShadow: (t) => t.palette.mode === 'dark' ? '0 0 0 2px rgba(99,102,241,0.4)' : '0 0 0 2px rgba(59,130,246,0.25)'
                },
                '& fieldset': { border: 'none' },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {search && (
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <Clear fontSize="small" />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }}
          />
          <IconButton onClick={loadData} disabled={loading}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {/* Top stats row */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
            boxShadow: 3,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.95 }}>Pending Applications</Typography>
                  <Typography variant="h4" fontWeight={800}>{apps.filter(a => a.status === 'pending').length}</Typography>
                </Box>
                <Box sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: 1,
                }}>
                  <HourglassEmpty />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
            boxShadow: 3,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.95 }}>Approved</Typography>
                  <Typography variant="h4" fontWeight={800}>{apps.filter(a => a.status === 'approved').length}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 48, height: 48, display: 'grid', placeItems: 'center', boxShadow: 1 }}>
                  <CheckCircle />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
            boxShadow: 3,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.95 }}>Rejected</Typography>
                  <Typography variant="h4" fontWeight={800}>{apps.filter(a => a.status === 'rejected').length}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 48, height: 48, display: 'grid', placeItems: 'center', boxShadow: 1 }}>
                  <CancelIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            boxShadow: 3,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.95 }}>Review Queue</Typography>
                  <Typography variant="h4" fontWeight={800}>{queue.length}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 48, height: 48, display: 'grid', placeItems: 'center', boxShadow: 1 }}>
                  <QueueIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Left: Charts */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Submissions Trend</Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveBar
                  data={barData}
                  keys={["count"]}
                  indexBy="status"
                  margin={{ top: 10, right: 20, bottom: 40, left: 40 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={{ scheme: 'set2' }}
                  axisBottom={{ tickRotation: 0 }}
                  axisLeft={{ tickSize: 5, tickPadding: 5 }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
                  role="application"
                />
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Approval Breakdown</Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveRadar
                  data={radarData}
                  keys={["value"]}
                  indexBy="priority"
                  maxValue="auto"
                  margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
                  curve="linearClosed"
                  borderWidth={2}
                  gridLabelOffset={24}
                  enableDots={true}
                  dotSize={6}
                  dotColor={{ theme: 'background' }}
                  dotBorderWidth={2}
                  colors={{ scheme: 'category10' }}
                  blendMode="multiply"
                  motionConfig="gentle"
                  role="application"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Other contents */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="View Applications" component="a" href="/visa/applications" clickable />
                    <Chip label="Inbox" component="a" href="/visa/inbox" clickable />
                    <Chip label="Review Queue" component="a" href="/visa/applications#queue" clickable />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recent Applications</Typography>
                  <List>
                    {apps.filter(a => !search || (a.applicant_name || '').toLowerCase().includes(search.toLowerCase())).slice(0, 6).map((a) => (
                      <React.Fragment key={a.id}>
                        <ListItem secondaryAction={<Chip label={a.status} color={a.status === 'approved' ? 'success' : a.status === 'rejected' ? 'error' : 'warning'} size="small" />}>
                          <ListItemText primary={a.applicant_name} secondary={`Submitted ${a.submitted_at}`} />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                    {apps.length === 0 && (
                      <ListItem>
                        <ListItemText primary="No applications yet" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Queue Snapshot</Typography>
                  <List>
                    {queue.slice(0, 5).map(q => (
                      <React.Fragment key={q.id}>
                        <ListItem>
                          <ListItemText primary={q.applicant_name} secondary={`Priority: ${q.priority}`} />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                    {queue.length === 0 && (
                      <ListItem><ListItemText primary="No items in queue" /></ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
    </VisaLayout>
    
    </>
  );
};

export default VisaDashboard;



