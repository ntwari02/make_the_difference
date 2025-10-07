import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, Chip, Grid, ToggleButtonGroup, ToggleButton, TextField, MenuItem, Avatar, IconButton, Tooltip, LinearProgress, Divider, Switch, FormControlLabel } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShareIcon from '@mui/icons-material/Share';
import StudentLayout from '../components/layout/StudentLayout';
import { studentApi } from '../services/studentApi';

const LiveClasses: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [platform, setPlatform] = useState<'all' | 'Zoom' | 'Google Meet' | 'Teams'>('all');
  const [status, setStatus] = useState<'all' | 'upcoming' | 'live' | 'ended'>('all');
  const [sort, setSort] = useState<'soonest' | 'title'>('soonest');
  const [reminders, setReminders] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await studentApi.live.listUpcoming();
        setClasses(data?.classes || data || []);
      } catch {
        setClasses([
          { id: 'lc1', title: 'React Live Q&A', instructor: 'Jane Doe', date: new Date().toISOString(), duration: '60m', platform: 'Zoom', status: 'upcoming' },
          { id: 'lc2', title: 'SQL Workshop', instructor: 'John Smith', date: new Date(Date.now() + 86400000).toISOString(), duration: '90m', platform: 'Google Meet', status: 'upcoming' },
        ]);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...classes];
    if (q.trim()) list = list.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()) || (c.instructor || '').toLowerCase().includes(q.toLowerCase()));
    if (platform !== 'all') list = list.filter((c) => c.platform === platform);
    if (status !== 'all') list = list.filter((c) => c.status === status);
    if (sort === 'soonest') list.sort((a, b) => +new Date(a.date) - +new Date(b.date));
    if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [classes, q, platform, status, sort]);

  const addToCalendar = (cls: any) => {
    const ics = 'BEGIN:VCALENDAR\nVERSION:2.0\n' + `BEGIN:VEVENT\nSUMMARY:${cls.title}\nDTSTART:${new Date(cls.date).toISOString().replace(/[-:]/g,'').split('.')[0]}Z\nEND:VEVENT` + '\nEND:VCALENDAR';
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${cls.title}.ics`; a.click(); URL.revokeObjectURL(url);
  };

  const share = async (cls: any) => {
    const url = `${window.location.origin}/student/live-classes/${cls.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: cls.title, text: `Join ${cls.title}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied');
      }
    } catch {}
  };

  const joinable = (cls: any) => {
    const start = +new Date(cls.date);
    const now = Date.now();
    return now >= start - 10 * 60 * 1000 && now <= start + 3 * 60 * 60 * 1000; // join 10m before until +3h
  };

  const timeLeft = (cls: any) => {
    const diff = +new Date(cls.date) - Date.now();
    if (diff <= 0) return 'Starting…';
    const m = Math.round(diff / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60); const rm = m % 60;
    return `${h}h ${rm}m`;
  };

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4" fontWeight={700}>Live Classes</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <TextField size="small" placeholder="Search classes" value={q} onChange={(e) => setQ(e.target.value)} />
            <TextField size="small" select label="Platform" value={platform} onChange={(e) => setPlatform(e.target.value as any)}>
              {['all','Zoom','Google Meet','Teams'].map((p) => <MenuItem key={p} value={p as any}>{p}</MenuItem>)}
            </TextField>
            <TextField size="small" select label="Status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              {['all','upcoming','live','ended'].map((s) => <MenuItem key={s} value={s as any}>{s}</MenuItem>)}
            </TextField>
            <TextField size="small" select label="Sort" value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <MenuItem value="soonest">Soonest</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </TextField>
            <ToggleButtonGroup size="small" value={view} exclusive onChange={(_, v) => v && setView(v)}>
            <ToggleButton value="list">List</ToggleButton>
            <ToggleButton value="calendar">Calendar</ToggleButton>
          </ToggleButtonGroup>
            <FormControlLabel control={<Switch checked={reminders} onChange={(e) => setReminders(e.target.checked)} />} label="Reminders" />
          </Box>
        </Box>
        {view === 'list' ? (
        <Grid container spacing={2}>
          {(loading ? Array.from({ length: 4 }).map((_, i) => ({ id: `s${i}`, skeleton: true })) : filtered).map((c: any) => (
            <Grid key={c.id} item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  {c.skeleton ? (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ width: '60%', height: 24, bgcolor: 'action.hover', borderRadius: 1 }} />
                        <Box sx={{ width: 80, height: 24, bgcolor: 'action.hover', borderRadius: 1 }} />
                      </Box>
                      <Box sx={{ mt: 1, width: '40%', height: 18, bgcolor: 'action.hover', borderRadius: 1 }} />
                      <LinearProgress sx={{ mt: 2 }} />
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar>{(c.instructor || 'U').substring(0,1)}</Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={800}>{c.title}</Typography>
                            <Typography variant="caption" color="text.secondary">Instructor: {c.instructor}</Typography>
                          </Box>
                        </Box>
                        <Chip size="small" color={c.status === 'live' ? 'error' : c.status === 'ended' ? 'default' : 'success'} label={c.status} />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2">{new Date(c.date).toLocaleString()} • Starts in {timeLeft(c)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, my: 1, flexWrap: 'wrap' }}>
                        <Chip size="small" label={c.platform} />
                        <Chip size="small" color="info" label={c.duration} />
                        <Chip size="small" icon={<PeopleIcon />} label={`${c.capacity || 100} seats`} />
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button variant="contained" disabled={!joinable(c)} onClick={() => navigate(`/student/live-classes/${c.id}`)}>Join</Button>
                          <Button variant="outlined" onClick={() => addToCalendar(c)} startIcon={<CalendarMonthIcon />}>Add to Calendar</Button>
                        </Box>
                        <Box>
                          <Tooltip title="Share link">
                            <IconButton onClick={() => share(c)}><ShareIcon /></IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      {reminders && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Reminder will be sent 10 minutes before start.</Typography>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Calendar (week)</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                  <Box key={d} sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center', fontWeight: 700 }}>{d}</Box>
                ))}
                {Array.from({ length: 7 }).map((_, i) => (
                  <Box key={i} sx={{ p: 1, minHeight: 100, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    {filtered.filter((_c, idx) => idx % 7 === i).slice(0, 2).map((c) => (
                      <Chip key={c.id} size="small" label={c.title} sx={{ maxWidth: '100%', mb: 0.5 }} />
                    ))}
                  </Box>
                ))}
              </Box>
              <Button sx={{ mt: 2 }} variant="outlined" onClick={() => {
                const ics = 'BEGIN:VCALENDAR\nVERSION:2.0\n' + classes.map((c) => `BEGIN:VEVENT\nSUMMARY:${c.title}\nDTSTART:${new Date(c.date).toISOString().replace(/[-:]/g,'').split('.')[0]}Z\nEND:VEVENT`).join('\n') + '\nEND:VCALENDAR';
                const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'live-classes.ics'; a.click(); URL.revokeObjectURL(url);
              }}>Export .ics</Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </StudentLayout>
  );
};

export default LiveClasses;


