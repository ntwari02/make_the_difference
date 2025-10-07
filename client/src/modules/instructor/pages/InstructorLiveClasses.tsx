import React from 'react';
import { Box, Card, CardContent, Typography, Button, GridLegacy as Grid, Chip, CircularProgress } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import { fetchLiveSessions } from '../store/instructorSlice';
import { instructorApi } from '../services/instructorApi';

const InstructorLiveClasses: React.FC = () => {
  const dispatch = useDispatch();
  const { liveSessions, isLoading } = useSelector((s: RootState) => s.instructor);

  React.useEffect(() => {
    dispatch(fetchLiveSessions() as any);
  }, [dispatch]);

  const handleCreate = async () => {
    await instructorApi.createLiveSession({ title: 'New Live Session', starts_at: new Date().toISOString(), duration_minutes: 60 });
    dispatch(fetchLiveSessions() as any);
  };

  return (
    <InstructorLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>Live Classes</Typography>
        <Button variant="contained" onClick={handleCreate}>Schedule Live Session</Button>
      </Box>
      {isLoading ? (
        <Box display="grid" placeItems="center" py={6}><CircularProgress /></Box>
      ) : (
      <Grid container spacing={2}>
        {(Array.isArray(liveSessions) ? liveSessions : []).map((s: any, idx: number) => (
          <Grid item xs={12} md={6} key={s.id || idx}>
            <Card>
              <CardContent>
                <Typography variant="h6">{s.title || 'Live Session'}</Typography>
                <Typography variant="body2" color="text.secondary">Starts: {s.starts_at} • Duration: {s.duration_minutes}m</Typography>
                <Box mt={1} display="flex" gap={1}>
                  <Chip label="Global" size="small" />
                  <Chip label="Video" size="small" />
                  <Chip label="Interactive Q&A" size="small" />
                </Box>
                <Box mt={2} display="flex" gap={1}>
                  <Button size="small" variant="outlined">Copy Invite Link</Button>
                  <Button size="small" variant="outlined">Start Session</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}
    </InstructorLayout>
  );
};

export default InstructorLiveClasses;


