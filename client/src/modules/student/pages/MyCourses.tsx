import React, { useEffect, useState, useMemo } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, TextField, MenuItem, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/layout/StudentLayout';
import { studentApi } from '../services/studentApi';

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await studentApi.myEnrollments();
        setEnrollments(data?.enrollments || data || []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return (enrollments || []).filter((e: any) =>
      (!search || (e.course_title || '').toLowerCase().includes(search.toLowerCase())) &&
      (!status || (e.status === status))
    );
  }, [enrollments, search, status]);

  const mock = filtered.length ? filtered : [
    { id: 'e1', course_id: 'c1', course_title: 'Intro to JavaScript', progress: 0.42, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop' },
    { id: 'e2', course_id: 'c2', course_title: 'React for Beginners', progress: 0.73, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1547658719-99ad183ddfde?q=80&w=1200&auto=format&fit=crop' },
    { id: 'e3', course_id: 'c3', course_title: 'SQL Essentials', progress: 0.18, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop' },
  ];

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>My Courses</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Search courses" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 240 }} />
          <TextField size="small" select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {mock.map((e: any) => (
            <Card key={e.id} sx={{ transition: 'transform .15s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
              <Box component="img" src={e.thumbnail} alt={e.course_title} sx={{ width: '100%', height: 140, objectFit: 'cover' }} />
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>{e.course_title}</Typography>
                <LinearProgress variant="determinate" value={Math.round((e.progress || 0) * 100)} sx={{ height: 8, borderRadius: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">{Math.round((e.progress || 0) * 100)}% complete</Typography>
                  <Button size="small" onClick={() => navigate(`/student/courses/${e.course_id}`)}>Resume</Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </StudentLayout>
  );
};

export default MyCourses;


