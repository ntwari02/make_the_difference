import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, LinearProgress, List, ListItemButton, ListItemText, Divider, TextField, Rating } from '@mui/material';
import StudentLayout from '../components/layout/StudentLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { studentApi } from '../services/studentApi';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [enroll, setEnroll] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    const load = async () => {
      // Minimal mock; backend endpoints for course/lessons not enumerated, so demo
      const mock = {
        id,
        title: 'React for Beginners',
        thumbnail: 'https://images.unsplash.com/photo-1547658719-99ad183ddfde?q=80&w=1200&auto=format&fit=crop',
        description: 'Learn React from scratch with hands-on projects.',
      };
      setCourse(mock);
      try {
        const enrolled = await studentApi.getEnrollment(id!);
        setEnroll(enrolled || null);
      } catch {}
      setLessons([
        { id: 'l1', title: 'Introduction to React', progress: 1 },
        { id: 'l2', title: 'Components and Props', progress: 0.5 },
        { id: 'l3', title: 'State and Effects', progress: 0 },
      ]);
      try {
        const r = await studentApi.listReviews(id!);
        setReviews(r?.reviews || r || []);
      } catch {}
    };
    load();
  }, [id]);

  const totalProgress = Math.round((lessons.reduce((a, l) => a + (l.progress || 0), 0) / Math.max(1, lessons.length)) * 100);

  const handleToggleLesson = async (l: any) => {
    const next = l.progress >= 1 ? 0 : 1;
    setLessons((prev) => prev.map((x) => (x.id === l.id ? { ...x, progress: next } : x)));
    try { await studentApi.updateLessonProgress(l.id, next); } catch {}
  };

  const handleEnroll = async () => {
    try { await studentApi.enroll(id!); setEnroll({ status: 'active' }); } catch {}
  };

  const submitReview = async () => {
    try { await studentApi.addReview(id!, review); setReview({ rating: 5, comment: '' }); const r = await studentApi.listReviews(id!); setReviews(r?.reviews || r || []); } catch {}
  };

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, gap: 2 }}>
          <Card>
            <Box component="img" src={course?.thumbnail} alt={course?.title} sx={{ width: '100%', height: 220, objectFit: 'cover' }} />
            <CardContent>
              <Typography variant="h5" fontWeight={800}>{course?.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{course?.description}</Typography>
              <Typography variant="subtitle2" color="text.secondary">Overall Progress</Typography>
              <LinearProgress variant="determinate" value={totalProgress} sx={{ height: 8, borderRadius: 1, my: 1 }} />
              <Typography variant="caption" color="text.secondary">{totalProgress}% complete</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Lessons</Typography>
              <List dense>
                {lessons.map((l) => (
                  <ListItemButton key={l.id} onClick={() => navigate(`/student/courses/${id}/lessons/${l.id}`)} onDoubleClick={() => handleToggleLesson(l)}>
                    <ListItemText primary={l.title} secondary={l.progress >= 1 ? 'Completed' : l.progress > 0 ? 'In progress' : 'Not started'} />
                    <Box sx={{ minWidth: 120 }}>
                      <LinearProgress variant="determinate" value={Math.round((l.progress || 0) * 100)} sx={{ height: 6, borderRadius: 1 }} />
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ alignSelf: 'start', position: 'sticky', top: 16 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Course Actions</Typography>
              {enroll ? (
                <Button variant="contained" fullWidth sx={{ mb: 1 }}>Continue Learning</Button>
              ) : (
                <Button variant="contained" fullWidth sx={{ mb: 1 }} onClick={handleEnroll}>Enroll Now</Button>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={700}>Leave a Review</Typography>
              <Box sx={{ display: 'grid', gap: 1, my: 1 }}>
                <Rating value={review.rating} onChange={(_, v) => setReview((p) => ({ ...p, rating: v || 5 }))} />
                <TextField multiline minRows={3} placeholder="Share your experience" value={review.comment} onChange={(e) => setReview((p) => ({ ...p, comment: e.target.value }))} />
                <Button variant="outlined" onClick={submitReview}>Submit Review</Button>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Recent Reviews</Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {(reviews || []).slice(0, 3).map((r: any, idx: number) => (
                  <Box key={idx} sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{r.user_name || 'Anonymous'}</Typography>
                    <Rating value={r.rating || 5} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">{r.comment || 'Great course!'}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </StudentLayout>
  );
};

export default CourseDetail;


