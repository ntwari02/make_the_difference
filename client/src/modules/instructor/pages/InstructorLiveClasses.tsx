import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, CircularProgress, Avatar, IconButton,
  TextField, InputAdornment, ToggleButtonGroup, ToggleButton, Divider, List, ListItem,
  ListItemAvatar, ListItemText, Paper, Tooltip, Badge, Dialog, DialogTitle, DialogContent,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  VideoCall as VideoCallIcon, ContentCopy as CopyIcon, PlayArrow as StartIcon, Stop as StopIcon,
  Mic as MicIcon, MicOff as MicOffIcon, Videocam as CamIcon, VideocamOff as CamOffIcon,
  ScreenShare as ShareIcon, StopScreenShare as StopShareIcon, Group as GroupIcon,
  Chat as ChatIcon, People as PeopleIcon, Search as SearchIcon, Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon, FiberManualRecord as LiveDotIcon, MoreVert as MoreIcon,
  VolumeUp as VolumeUpIcon, VolumeOff as VolumeOffIcon, Timer as TimerIcon
} from '@mui/icons-material';
import InstructorLayout from '../components/layout/InstructorLayout';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import { fetchLiveSessions, upsertAttendance, fetchAttendance, fetchPolls, createPoll, votePoll } from '../store/instructorSlice';
import { instructorApi } from '../services/instructorApi';

const InstructorLiveClasses: React.FC = () => {
  const dispatch = useDispatch();
  const { liveSessions, isLoading, attendanceByClassId, pollsByClassId } = useSelector((s: RootState) => s.instructor);
  const [viewMode, setViewMode] = useState<'list' | 'workspace'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'live' | 'ended'>('all');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);
  const [volOn, setVolOn] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'late' | 'absent'>>({});
  const [handsRaised, setHandsRaised] = useState<string[]>([]);
  const [pollOpen, setPollOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('What topic should we review next?');
  const [pollOptions, setPollOptions] = useState(['Hooks', 'TypeScript', 'Testing']);
  const [pollVotes, setPollVotes] = useState<number[]>([2, 5, 3]);
  const [activePollId, setActivePollId] = useState<string | null>(null);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState<string>('');

  React.useEffect(() => {
    dispatch(fetchLiveSessions() as any);
  }, [dispatch]);

  // pick first session as the active class for demo purposes
  const activeClassId = (Array.isArray(liveSessions) && liveSessions[0]?.id) || 'demo-class-1';

  React.useEffect(() => {
    if (activeClassId) {
      dispatch(fetchAttendance(activeClassId) as any);
      dispatch(fetchPolls(activeClassId) as any);
    }
  }, [dispatch, activeClassId]);

  // Hydrate local attendance state from store when available
  React.useEffect(() => {
    const records = attendanceByClassId?.[activeClassId];
    if (records && Object.keys(records).length) {
      const map: Record<string, 'present' | 'late' | 'absent'> = {};
      records.forEach((r: any) => { map[r.studentId] = r.status; });
      setAttendance(map);
    }
  }, [attendanceByClassId, activeClassId]);

  // Seed demo attendance and a sample poll if none exist yet
  React.useEffect(() => {
    if (!attendanceByClassId?.[activeClassId]) {
      const sample = [
        { studentId: 'student-1', status: 'present' as const },
        { studentId: 'student-2', status: 'late' as const },
        { studentId: 'student-3', status: 'absent' as const },
      ];
      const map: Record<string, 'present' | 'late' | 'absent'> = {};
      sample.forEach(s => { map[s.studentId] = s.status; });
      setAttendance(map);
      dispatch(upsertAttendance({ classId: activeClassId, records: sample }) as any);
    }
    const polls = pollsByClassId?.[activeClassId];
    if (!polls || polls.length === 0) {
      dispatch(createPoll({ classId: activeClassId, question: 'Which topic next?', options: ['Hooks', 'TypeScript', 'Testing'] }) as any);
    }
  }, [attendanceByClassId, pollsByClassId, activeClassId, dispatch]);

  const stopLocalStream = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const ensureLocalMedia = async () => {
    try {
      if (!localStreamRef.current) {
        const constraints: MediaStreamConstraints = {
          video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
          audio: true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
      const stream = localStreamRef.current!;
      stream.getVideoTracks().forEach(t => { t.enabled = camOn; });
      stream.getAudioTracks().forEach(t => { t.enabled = micOn; });
    } catch (e) {
      console.error('Failed to access media devices', e);
    }
  };

  useEffect(() => {
    if (camOn || micOn) {
      ensureLocalMedia();
    } else {
      stopLocalStream();
    }
    return () => {};
  }, [camOn, micOn]);

  useEffect(() => {
    // enumerate devices once permissions are granted
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(cams);
        if (!selectedCameraId && cams[0]) setSelectedCameraId(cams[0].deviceId);
      } catch (e) {
        // ignore if not available yet
      }
    };
    loadDevices();
    navigator.mediaDevices?.addEventListener?.('devicechange', loadDevices as any);
    return () => navigator.mediaDevices?.removeEventListener?.('devicechange', loadDevices as any);
  }, [selectedCameraId]);

  useEffect(() => {
    // when user switches camera, restart the stream with new deviceId
    if (!camOn && !micOn) return; // will start when toggled on
    if (!selectedCameraId) return;
    (async () => {
      stopLocalStream();
      await ensureLocalMedia();
      if (previewOpen && previewVideoRef.current && localStreamRef.current) {
        previewVideoRef.current.srcObject = localStreamRef.current;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCameraId]);

  const handleCreate = async () => {
    await instructorApi.createLiveSession({ title: 'New Live Session', starts_at: new Date().toISOString(), duration_minutes: 60 });
    dispatch(fetchLiveSessions() as any);
  };

  const filteredSessions = useMemo(() => {
    const now = Date.now();
    const fallbackMock = [
      {
        id: 'demo-class-live',
        title: 'React Q&A Live',
        starts_at: new Date(now - 5 * 60 * 1000).toISOString(), // started 5m ago
        duration_minutes: 60,
        tags: ['Video', 'Interactive Q&A']
      },
      {
        id: 'demo-class-upcoming',
        title: 'TypeScript Deep Dive',
        starts_at: new Date(now + 30 * 60 * 1000).toISOString(), // in 30m
        duration_minutes: 45,
        tags: ['Video', 'Slides']
      },
      {
        id: 'demo-class-ended',
        title: 'Node.js Performance',
        starts_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
        duration_minutes: 60,
        tags: ['Recording Available']
      },
    ];
    const items = Array.isArray(liveSessions) && liveSessions.length ? liveSessions : fallbackMock;
    return items
      .filter((s: any) => (s.title || 'Live Session').toLowerCase().includes(search.toLowerCase()))
      .filter((s: any) => {
        if (statusFilter === 'all') return true;
        const now = new Date();
        const start = new Date(s.starts_at);
        const end = new Date(start.getTime() + (s.duration_minutes || 60) * 60000);
        const isLiveNow = now >= start && now <= end;
        if (statusFilter === 'live') return isLiveNow;
        if (statusFilter === 'upcoming') return now < start;
        if (statusFilter === 'ended') return now > end;
        return true;
      });
  }, [liveSessions, search, statusFilter]);

  return (
    <InstructorLayout>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, alignItems: 'center', mb: 2, columnGap: 2 }}>
        <Box sx={{ gridColumn: '1 / 2' }}>
          <Typography variant="h4" fontWeight={700}>Live Classes</Typography>
          <Typography variant="body2" color="text.secondary">Host and manage live sessions with students</Typography>
        </Box>
        <Box sx={{ gridColumn: { xs: '1 / 2', md: '2 / 3' }, display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: { xs: 1, md: 0 } }}>
          <Button variant="outlined" startIcon={<CopyIcon />}>Copy Invite Link</Button>
          <Button variant="contained" startIcon={<VideoCallIcon />} onClick={handleCreate}>Schedule Live Session</Button>
        </Box>
      </Box>

      {/* KPI row */}
      <Box sx={{ gridColumn: '1 / 2', mb: 3, display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
        <Card sx={{ borderRadius: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Upcoming</Typography>
            <Typography variant="h4" fontWeight={800}>{filteredSessions.filter((s: any) => new Date() < new Date(s.starts_at)).length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Live Now</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" fontWeight={800}>{filteredSessions.length}</Typography>
              <LiveDotIcon color="error" />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Participants</Typography>
            <Typography variant="h4" fontWeight={800}>42</Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Avg Duration</Typography>
            <Typography variant="h4" fontWeight={800}>58m</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Controls */}
      <Card sx={{ borderRadius: 1, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search sessions..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ToggleButtonGroup value={statusFilter} exclusive onChange={(_, v) => v && setStatusFilter(v)} size="small">
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="upcoming">Upcoming</ToggleButton>
                <ToggleButton value="live">Live</ToggleButton>
                <ToggleButton value="ended">Ended</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
                <ToggleButton value="list">Sessions</ToggleButton>
                <ToggleButton value="workspace">Live Workspace</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Box display="grid" placeItems="center" py={6}><CircularProgress /></Box>
      ) : viewMode === 'list' ? (
        <Grid container spacing={2}>
          {filteredSessions.map((s: any, idx: number) => (
            <Grid item xs={12} md={6} key={s.id || idx}>
              <Card sx={{ borderRadius: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{s.title || 'Live Session'}</Typography>
                      <Typography variant="body2" color="text.secondary">Starts: {s.starts_at} • Duration: {s.duration_minutes}m</Typography>
                      <Box mt={1} display="flex" gap={1}>
                        <Chip label="Global" size="small" />
                        <Chip label="Video" size="small" />
                        <Chip label="Interactive Q&A" size="small" />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<CopyIcon />}>Invite</Button>
                      <Button size="small" variant="contained" startIcon={<StartIcon />} onClick={() => setViewMode('workspace')}>Start</Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '280px 1fr 340px' }, gap: 2 }}>
          {/* Left: Roster */}
          <Card sx={{ borderRadius: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight={700}>Participants</Typography>
                <Badge color="primary" badgeContent={12}><PeopleIcon /></Badge>
              </Box>
              <TextField
                fullWidth size="small" placeholder="Search participants" sx={{ mt: 1.5 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              />
            </CardContent>
            <Divider />
            <List sx={{ px: 1.5 }}>
              {Array.from({ length: 10 }).map((_, i) => {
                const id = `student-${i+1}`;
                const isRaised = handsRaised.includes(id);
                const status = attendance[id] || 'present';
                return (
                  <ListItem key={i} divider secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isRaised && <Chip size="small" color="warning" label="Hand Raised" />}
                      <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={status}
                        onChange={(_, v) => {
                          if (!v) return;
                          const next = { ...attendance, [id]: v } as Record<string, 'present' | 'late' | 'absent'>;
                          setAttendance(next);
                          const records = Object.entries(next).map(([studentId, status]) => ({ studentId, status }));
                          dispatch(upsertAttendance({ classId: activeClassId, records }) as any);
                        }}
                      >
                        <ToggleButton value="present">P</ToggleButton>
                        <ToggleButton value="late">L</ToggleButton>
                        <ToggleButton value="absent">A</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  }>
                    <ListItemAvatar><Avatar>{`S${i+1}`}</Avatar></ListItemAvatar>
                    <ListItemText primary={`Student ${i+1}`} secondary={i % 3 === 0 ? 'Speaking' : 'Muted'} />
                    {i % 3 === 0 ? <LiveDotIcon color="error" /> : <MicOffIcon color="disabled" />}
                  </ListItem>
                );
              })}
            </List>
          </Card>

          {/* Center: Video Grid */}
          <Card sx={{ borderRadius: 1, p: 1.5 }}>
            {/* Instructor personal preview (separate from student tiles) */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Your Preview</Typography>
              <Paper variant="outlined" sx={{ aspectRatio: '16 / 9', position: 'relative', overflow: 'hidden', bgcolor: 'black' }}>
                <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box sx={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24 }}>You</Avatar>
                  <Typography variant="caption" color="common.white">Instructor</Typography>
                </Box>
              </Paper>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Paper key={i} variant="outlined" sx={{ aspectRatio: '16 / 9', display: 'grid', placeItems: 'center', position: 'relative', bgcolor: 'black', color: 'white' }}>
                  <Typography>Video {i+1}</Typography>
                  <Box sx={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>{`S${i+1}`}</Avatar>
                    <Typography variant="caption">Student {i+1}</Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
            {/* Controls */}
            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={micOn ? 'Mute' : 'Unmute'}><IconButton color={micOn ? 'primary' : 'default'} onClick={() => setMicOn(v => !v)}>{micOn ? <MicIcon /> : <MicOffIcon />}</IconButton></Tooltip>
                <Tooltip title={camOn ? 'Turn camera off' : 'Turn camera on'}><IconButton color={camOn ? 'primary' : 'default'} onClick={() => setCamOn(v => !v)}>{camOn ? <CamIcon /> : <CamOffIcon />}</IconButton></Tooltip>
                <Tooltip title={shareOn ? 'Stop sharing' : 'Share screen'}><IconButton color={shareOn ? 'primary' : 'default'} onClick={() => setShareOn(v => !v)}>{shareOn ? <StopShareIcon /> : <ShareIcon />}</IconButton></Tooltip>
                <Tooltip title={volOn ? 'Mute speakers' : 'Unmute speakers'}><IconButton color={volOn ? 'primary' : 'default'} onClick={() => setVolOn(v => !v)}>{volOn ? <VolumeUpIcon /> : <VolumeOffIcon />}</IconButton></Tooltip>
                <Tooltip title="Simulate raised hands"><IconButton onClick={() => setHandsRaised(prev => prev.length ? [] : ['student-2','student-5'])}><GroupIcon /></IconButton></Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon color="action" />
                <Typography variant="body2">00:42:18</Typography>
                <Button variant={isLive ? 'outlined' : 'contained'} color={isLive ? 'error' : 'primary'} startIcon={isLive ? <StopIcon /> : <StartIcon />} onClick={() => setIsLive(v => !v)}>
                  {isLive ? 'End Session' : 'Go Live'}
                </Button>
              </Box>
            </Box>
          </Card>

          {/* Right: Chat */}
          <Card sx={{ borderRadius: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight={700}>Class Chat</Typography>
                <Badge color="primary" badgeContent={5}><ChatIcon /></Badge>
              </Box>
            </CardContent>
            <Divider />
            <Box sx={{ p: 1.5, display: 'grid', gap: 1, flex: 1, alignContent: 'start', maxHeight: 480, overflowY: 'auto' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Avatar>{`S${i+1}`}</Avatar>
                  <Box>
                    <Typography variant="body2"><strong>Student {i+1}</strong> Hello everyone!</Typography>
                    <Typography variant="caption" color="text.secondary">10:{i}5 AM</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Divider />
            <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
              <TextField fullWidth size="small" placeholder="Write a message to the class..." />
              <Button variant="contained">Send</Button>
            </Box>
          </Card>
        
          {/* Polls */}
          <Card sx={{ borderRadius: 1, display: { xs: 'none', xl: 'flex' }, flexDirection: 'column' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight={700}>Quick Poll</Typography>
                <Button size="small" onClick={() => setPollOpen(p => !p)}>{pollOpen ? 'Hide' : 'Open'}</Button>
              </Box>
              {pollOpen && (
                <Box sx={{ mt: 1 }}>
                  {/* Existing polls list */}
                  <Typography variant="overline" color="text.secondary">Existing Polls</Typography>
                  <List dense>
                    {(pollsByClassId?.[activeClassId] || []).map((p: any) => (
                      <ListItem key={p.id} button selected={activePollId === p.id} onClick={() => setActivePollId(p.id)}>
                        <ListItemText primary={p.question} secondary={(p.options || []).map((o: any, i: number) => `${o.label || o} (${o.votes ?? 0})`).join(' · ')} />
                      </ListItem>
                    ))}
                  </List>

                  {/* Active poll (fallback to local demo) */}
                  <Typography variant="overline" color="text.secondary">Active Poll</Typography>
                  <Typography variant="body2" fontWeight={600}>{activePollId ? (pollsByClassId?.[activeClassId]?.find((p: any) => p.id === activePollId)?.question) : pollQuestion}</Typography>
                  <Box sx={{ display: 'grid', gap: 1, mt: 1 }}>
                    {(activePollId ? (pollsByClassId?.[activeClassId]?.find((p: any) => p.id === activePollId)?.options || []) : pollOptions).map((opt: any, idx: number) => (
                      <Button
                        key={idx}
                        variant="outlined"
                        onClick={() => {
                          if (activePollId) {
                            dispatch(votePoll({ classId: activeClassId, pollId: activePollId, optionIndex: idx }) as any);
                          } else {
                            setPollVotes(v => v.map((n, i) => i === idx ? n + 1 : n));
                            dispatch(votePoll({ classId: activeClassId, pollId: 'demo-poll-1', optionIndex: idx }) as any);
                          }
                        }}
                      >
                        {activePollId ? (opt.label ?? String(opt)) : (opt as string)} · {activePollId ? (opt.votes ?? 0) : pollVotes[idx]} votes
                      </Button>
                    ))}
                  </Box>

                  {/* Create poll */}
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="overline" color="text.secondary">Create Poll</Typography>
                  <TextField fullWidth size="small" placeholder="Poll question" sx={{ mt: 1 }} value={newPollQuestion} onChange={(e) => setNewPollQuestion(e.target.value)} />
                  <TextField fullWidth size="small" placeholder="Options (comma separated)" sx={{ mt: 1 }} value={newPollOptions} onChange={(e) => setNewPollOptions(e.target.value)} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        const opts = newPollOptions.split(',').map(s => s.trim()).filter(Boolean);
                        if (!newPollQuestion.trim() || opts.length < 2) return;
                        dispatch(createPoll({ classId: activeClassId, question: newPollQuestion.trim(), options: opts }) as any);
                        setNewPollQuestion('');
                        setNewPollOptions('');
                      }}
                    >
                      Create
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </InstructorLayout>
  );
};

export default InstructorLiveClasses;


