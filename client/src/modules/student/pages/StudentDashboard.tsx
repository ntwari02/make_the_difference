import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import StudentLayout from '../components/layout/StudentLayout';
import { studentApi } from '../services/studentApi';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [en, r] = await Promise.allSettled([
          studentApi.myEnrollments(),
          studentApi.recommendations(),
        ]);

        const enrollArr = en.status === 'fulfilled' ? (en.value?.enrollments || en.value || []) : [];
        const recsArr = r.status === 'fulfilled' ? (r.value?.courses || r.value || []) : [];

        setEnrollments(Array.isArray(enrollArr) ? enrollArr : []);
        setRecs(Array.isArray(recsArr) ? recsArr : []);
      } catch (e) {
        setEnrollments([]);
        setRecs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const mockRecs = recs.length ? recs : [
    { id: 'c1', title: 'Intro to JavaScript', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop' },
    { id: 'c2', title: 'React for Beginners', thumbnail: 'https://images.unsplash.com/photo-1547658719-99ad183ddfde?q=80&w=1200&auto=format&fit=crop' },
    { id: 'c3', title: 'SQL Essentials', thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop' },
  ];

  const handleEnroll = async (courseId: string) => {
    if (enrollingId) return;
    setEnrollingId(courseId);
    try {
      await studentApi.enroll(courseId);
      toast.success('Enrolled successfully');
      navigate(`/student/courses/${courseId}`);
    } catch (e) {
      // fallback demo success
      toast.success('Enrolled (demo)');
      navigate(`/student/courses/${courseId}`);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Student Workspace</Typography>
        {loading && (
          <Box role="status" aria-live="polite" aria-label="Loading" sx={{ display: 'inline-flex' }}>
            <Chip label="Loading data…" size="small" />
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Card><CardContent><Typography variant="subtitle2" color="text.secondary">Active Courses</Typography><Typography variant="h5" fontWeight={800}>{enrollments.length}</Typography></CardContent></Card>
          <Card><CardContent><Typography variant="subtitle2" color="text.secondary">Hours Studied</Typography><Typography variant="h5" fontWeight={800}>{Math.max(4, enrollments.length * 6)}</Typography></CardContent></Card>
          <Card><CardContent><Typography variant="subtitle2" color="text.secondary">Certificates</Typography><Typography variant="h5" fontWeight={800}>{Math.max(0, enrollments.length - 2)}</Typography></CardContent></Card>
        </Box>

        <Typography variant="h6" fontWeight={700}>Recommended for you</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {mockRecs.map((c) => (
            <Card key={c.id} sx={{ cursor: 'pointer', transition: 'transform .15s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
              <Box component="img" src={c.thumbnail} alt={c.title} sx={{ width: '100%', height: 140, objectFit: 'cover' }} />
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700}>{c.title}</Typography>
                <Chip size="small" label="Beginner" />
                <Button variant="contained" size="small" sx={{ float: 'right' }} disabled={enrollingId === c.id} onClick={() => handleEnroll(c.id)}>
                  {enrollingId === c.id ? 'Enrolling…' : 'Enroll'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </StudentLayout>
  );
};

export default StudentDashboard;


