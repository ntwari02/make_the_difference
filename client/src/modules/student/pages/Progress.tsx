import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, LinearProgress, TextField, MenuItem, Avatar, List, ListItem, ListItemAvatar, ListItemText, Button, Divider, ToggleButton, ToggleButtonGroup, Stack, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BoltIcon from '@mui/icons-material/Bolt';
import StudentLayout from '../components/layout/StudentLayout';
import { studentApi, Enrollment } from '../services/studentApi';

const StudentProgress: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await studentApi.myEnrollments();
        if (mounted) setEnrollments(Array.isArray(data) ? data : (data?.items || []));
      } catch {
        // no-op demo
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const { avgProgress, completedCount, inProgressCount } = useMemo(() => {
    const total = enrollments.length || 1;
    const avg = enrollments.reduce((acc, e) => acc + (Number(e.progress) || 0), 0) / total;
    const completed = enrollments.filter((e) => (e.progress || 0) >= 100).length;
    const inProg = enrollments.filter((e) => (e.progress || 0) > 0 && (e.progress || 0) < 100).length;
    return { avgProgress: Math.round(avg), completedCount: completed, inProgressCount: inProg };
  }, [enrollments]);

  const filtered = useMemo(() => {
    if (filter === 'completed') return enrollments.filter((e) => (e.progress || 0) >= 100);
    if (filter === 'in_progress') return enrollments.filter((e) => (e.progress || 0) > 0 && (e.progress || 0) < 100);
    return enrollments;
  }, [enrollments, filter]);

  // Demo analytics: streak and time spent (mocked for now)
  const streakDays = useMemo(() => {
    // Pretend we have activity on the last N days based on enrollments length
    const base = Math.min(7, Math.max(1, (enrollments.length % 7) + 3));
    return base;
  }, [enrollments.length]);

  const timeSeries = useMemo(() => {
    const len = timeframe === '7d' ? 7 : timeframe === '30d' ? 10 : 12; // compact columns
    // Generate pseudo hours based on enrollments and timeframe
    const seed = enrollments.length || 3;
    const arr = Array.from({ length: len }, (_, i) => ((Math.sin((i + seed) * 1.3) + 1) * 2 + ((seed % 3) + 1)));
    const max = Math.max(1, ...arr);
    return arr.map((v) => ({ value: v, pct: Math.round((v / max) * 100) }));
  }, [timeframe, enrollments.length]);

  const badges = useMemo(() => {
    const hasStarter = enrollments.length > 0;
    const hasFinisher = completedCount > 0;
    const hasTrailblazer = avgProgress >= 50 && inProgressCount >= 2;
    return [
      hasStarter && { key: 'starter', label: 'Getting Started', color: 'default', icon: <BoltIcon fontSize="small" /> },
      hasFinisher && { key: 'finisher', label: 'Course Finisher', color: 'success', icon: <CheckIcon fontSize="small" /> },
      hasTrailblazer && { key: 'trail', label: 'Trailblazer', color: 'primary', icon: <TrendingUpIcon fontSize="small" /> },
    ].filter(Boolean) as { key: string; label: string; color: any; icon: React.ReactNode }[];
  }, [enrollments.length, completedCount, avgProgress, inProgressCount]);

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight={700}>Progress</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup value={timeframe} exclusive onChange={(_, v) => v && setTimeframe(v)} size="small">
              <ToggleButton value="7d">7d</ToggleButton>
              <ToggleButton value="30d">30d</ToggleButton>
              <ToggleButton value="90d">90d</ToggleButton>
            </ToggleButtonGroup>
            <TextField size="small" select label="Filter" value={filter} onChange={(e) => setFilter(e.target.value as any)} sx={{ minWidth: 160 }}>
              <MenuItem value="all">All courses</MenuItem>
              <MenuItem value="in_progress">In progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" color="text.secondary">Average Progress</Typography>
                <TrendingUpIcon color="primary" />
              </Box>
              <Typography variant="h3" fontWeight={900}>{avgProgress}%</Typography>
              <LinearProgress variant="determinate" value={avgProgress} sx={{ mt: 1, height: 8, borderRadius: 999 }} />
            </CardContent>
          </Card>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" color="text.secondary">Courses In Progress</Typography>
                <TimerIcon color="warning" />
              </Box>
              <Typography variant="h3" fontWeight={900}>{inProgressCount}</Typography>
              <Typography variant="caption" color="text.secondary">Keep the momentum going</Typography>
            </CardContent>
          </Card>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" color="text.secondary">Courses Completed</Typography>
                <StarIcon color="success" />
              </Box>
              <Typography variant="h3" fontWeight={900}>{completedCount}</Typography>
              <Typography variant="caption" color="text.secondary">Great job finishing strong</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Streak + Time Spent + Badges */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 3fr 2fr' }, gap: 2 }}>
          {/* Streak */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Weekly Streak</Typography>
                <LocalFireDepartmentIcon color={streakDays >= 4 ? 'error' : 'disabled'} />
              </Box>
              <Typography variant="h4" fontWeight={900}>{streakDays} day streak</Typography>
              <Box sx={{ display: 'flex', gap: 1.25, mt: 2 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <Tooltip key={i} title={i < streakDays ? 'Active day' : 'No activity'}>
                    <Box sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 0.75,
                      bgcolor: i < streakDays ? 'warning.main' : 'action.hover',
                      opacity: i < streakDays ? 1 : 0.65,
                      border: '1px solid',
                      borderColor: i < streakDays ? 'warning.dark' : 'divider',
                    }} />
                  </Tooltip>
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Keep learning daily to extend your streak</Typography>
            </CardContent>
          </Card>

          {/* Time Spent mini chart */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Time Spent</Typography>
                <TimerIcon color="info" />
              </Box>
              <Typography variant="body2" color="text.secondary">Estimated hours studied</Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 96, mt: 1 }}>
                {timeSeries.map((d, idx) => (
                  <Tooltip key={idx} title={`${d.value.toFixed(1)} hrs`}>
                    <Box sx={{ width: 10, height: `${Math.max(8, d.pct)}%`, bgcolor: 'primary.main', borderRadius: 0.75, opacity: 0.9 }} />
                  </Tooltip>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Less</Typography>
                <Typography variant="caption" color="text.secondary">More</Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Achievements</Typography>
                <EmojiEventsIcon color="secondary" />
              </Box>
              {badges.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Earn badges by progressing through courses.</Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {badges.map((b) => (
                    <Chip key={b.key} color={b.color} icon={b.icon as any} label={b.label} variant={b.color === 'default' ? 'outlined' : 'filled'} />
                  ))}
                </Box>
              )}
              <Box sx={{ mt: 1.5 }}>
                <Button size="small" variant="text">View all achievements</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" fontWeight={800}>Your Courses</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="small" label={`${filtered.length} shown`} />
                <Chip size="small" color="primary" label={`${enrollments.length} total`} />
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <Typography variant="body2" color="text.secondary">Loading progress…</Typography>
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <Typography variant="subtitle1" fontWeight={700}>No courses to show</Typography>
                <Typography variant="body2">Enroll in a course to start tracking your progress.</Typography>
                <Button sx={{ mt: 2 }} variant="contained" href="/browse">Browse Courses</Button>
              </Box>
            ) : (
              <List sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, p: 0 }}>
                {filtered.map((e) => {
                  const pct = Math.max(0, Math.min(100, Number(e.progress) || 0));
                  return (
                    <Card key={e.id} variant="outlined" sx={{ overflow: 'hidden' }}>
                      <CardContent>
                        <ListItem disableGutters>
                          <ListItemAvatar>
                            <Avatar variant="rounded">{pct >= 100 ? <CheckIcon color="success" /> : (pct > 0 ? <TrendingUpIcon color="primary" /> : <TimerIcon color="disabled" />)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography fontWeight={700}>Course #{e.course_id}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary">Enrollment: {e.id}</Typography>}
                          />
                        </ListItem>
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress variant="determinate" value={pct} sx={{ height: 10, borderRadius: 999 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">{pct}% complete</Typography>
                            {pct >= 100 ? <Chip size="small" color="success" label="Completed" /> : <Chip size="small" variant="outlined" label="In progress" />}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                          <Button size="small" variant="contained" href={`/student/courses/${e.course_id}`}>Go to course</Button>
                          {pct > 0 && pct < 100 && (
                            <Button size="small" variant="outlined" href={`/student/courses/${e.course_id}/lessons/1`}>Resume</Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </StudentLayout>
  );
};

export default StudentProgress;


