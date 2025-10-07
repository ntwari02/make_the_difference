import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, LinearProgress } from '@mui/material';
import StudentLayout from '../components/layout/StudentLayout';
import { useNavigate, useParams } from 'react-router-dom';

const LessonViewer: React.FC = () => {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const lessons = useMemo(() => ([
    { id: 'l1', title: 'Introduction to React', content: 'Welcome to React.' },
    { id: 'l2', title: 'Components and Props', content: 'Components are the building blocks.' },
    { id: 'l3', title: 'State and Effects', content: 'State lets you add interactivity.' },
  ]), []);
  const index = Math.max(0, lessons.findIndex((l) => l.id === (lessonId || 'l1')));
  const current = lessons[index] || lessons[0];
  const progress = Math.round(((index + 1) / lessons.length) * 100);

  const go = (delta: number) => {
    const next = Math.min(lessons.length - 1, Math.max(0, index + delta));
    navigate(`/student/courses/${id}/lessons/${lessons[next].id}`);
  };

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h5" fontWeight={800}>Lesson: {current.title}</Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
        <Card>
          <CardContent>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{current.content}</Typography>
          </CardContent>
        </Card>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button disabled={index === 0} onClick={() => go(-1)}>Previous</Button>
          <Button disabled={index === lessons.length - 1} onClick={() => go(1)}>Next</Button>
        </Box>
      </Box>
    </StudentLayout>
  );
};

export default LessonViewer;


