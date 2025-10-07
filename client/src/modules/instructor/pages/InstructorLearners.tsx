import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import { fetchLearners } from '../store/instructorSlice';

const InstructorLearners: React.FC = () => {
  const dispatch = useDispatch();
  const { learners, isLoading } = useSelector((s: RootState) => s.instructor);

  React.useEffect(() => {
    dispatch(fetchLearners() as any);
  }, [dispatch]);

  return (
    <InstructorLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Learners</Typography>
      </Box>
      <Card>
        <CardContent>
          {isLoading ? (
            <Box display="grid" placeItems="center" py={4}><CircularProgress /></Box>
          ) : (
            <List>
              {(learners || []).map((l: any) => (
                <ListItem key={l.id || l.email || l.name} divider>
                  <ListItemText primary={l.name || l.full_name || l.email} secondary={`Progress: ${l.progress ?? '-'}%`} />
                  <Chip label={l.status || 'Active'} color={(l.status || 'Active') === 'Completed' ? 'success' : (l.status || 'Active') === 'Behind' ? 'warning' : 'primary'} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </InstructorLayout>
  );
};

export default InstructorLearners;


