import React from 'react';
import { Box, Card, CardContent, Typography, Button, GridLegacy as Grid, CircularProgress } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import { fetchInstructorCourses } from '../store/instructorSlice';

const InstructorCourses: React.FC = () => {
  const dispatch = useDispatch();
  const { courses, isLoading } = useSelector((s: RootState) => s.instructor);

  React.useEffect(() => {
    dispatch(fetchInstructorCourses() as any);
  }, [dispatch]);

  return (
    <InstructorLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>My Courses</Typography>
        <Button variant="contained">Create Course</Button>
      </Box>
      {isLoading ? (
        <Box display="grid" placeItems="center" py={6}><CircularProgress /></Box>
      ) : (
      <Grid container spacing={2}>
        {(courses && courses.length > 0 ? courses : []).map((c) => (
          <Grid item xs={12} md={6} key={c.id || c.title}>
            <Card>
              <CardContent>
                <Typography variant="h6">{c.title}</Typography>
                <Typography variant="body2" color="text.secondary">Students: {c.students ?? c.student_count ?? 0} • Rating: {c.rating ?? '-'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}
    </InstructorLayout>
  );
};

export default InstructorCourses;


