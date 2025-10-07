import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Divider, IconButton, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText, Tabs, Tab, Tooltip, Snackbar, Alert, Badge } from '@mui/material';
import StudentLayout from '../components/layout/StudentLayout';
import { useParams } from 'react-router-dom';
import { studentApi } from '../services/studentApi';
import MicOffIcon from '@mui/icons-material/MicOff';
import MicIcon from '@mui/icons-material/Mic';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SendIcon from '@mui/icons-material/Send';

const LiveClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<any>(null);
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);
  const [tab, setTab] = useState<'chat' | 'participants'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ id: string; author: string; text: string; ts: string }[]>([
    { id: 'm1', author: 'Instructor', text: 'Welcome! We start shortly.', ts: '09:58' },
  ]);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({ open: false, message: '', severity: 'success' });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [participants, setParticipants] = useState<{ name: string; role?: 'Host' | 'Co-host' | 'Participant'; speaking?: boolean; muted?: boolean }[]>([]);
  const [participantQuery, setParticipantQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await studentApi.live.getClass(id!);
        setCls(data?.class || data || { id, title: 'React Live Q&A', instructor: 'Jane Doe', date: new Date().toISOString(), duration: '60m', platform: 'Zoom', status: 'upcoming' });
      } catch {
        setCls({ id, title: 'React Live Q&A', instructor: 'Jane Doe', date: new Date().toISOString(), duration: '60m', platform: 'Zoom', status: 'upcoming' });
      }
    };
    load();
  }, [id]);

  const startTs = new Date(cls?.date || Date.now()).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const remaining = Math.max(0, startTs - now);
  const canJoin = useMemo(() => now >= startTs - 10 * 60 * 1000 && now <= startTs + 3 * 60 * 60 * 1000, [now, startTs]);

  const handleJoin = () => {
    if (!canJoin) {
      setSnack({ open: true, message: 'You can join 10 minutes before start.', severity: 'info' });
      return;
    }
    setJoined(true);
    setSnack({ open: true, message: 'Joined session (demo)', severity: 'success' });
    // Add current user to participant list
    setParticipants((prev) => {
      const hasYou = prev.some((p) => p.name === 'You');
      return hasYou ? prev : [{ name: 'You', role: 'Participant', muted: !micOn }, ...prev];
    });
  };

  const handleLeave = () => {
    setJoined(false);
    setShareOn(false);
    // Stop media on leave
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setSnack({ open: true, message: 'You left the session', severity: 'info' });
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { id: String(Math.random()), author: 'You', text: chatInput.trim(), ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  };

  // Camera/mic handling
  const startMedia = async () => {
    try {
      // Request camera and optionally mic
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micOn });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      setSnack({ open: true, message: 'Unable to access camera/mic. Check permissions.', severity: 'error' });
      setCamOn(false);
    }
  };

  const stopMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    // Toggle media based on camOn
    if (camOn) {
      startMedia();
    } else {
      stopMedia();
    }
    return () => {
      // On unmount or cam change, ensure tracks stopped if turning off
      if (!camOn) stopMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camOn]);

  useEffect(() => {
    // If mic toggled while stream active, update audio tracks
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach((t) => (t.enabled = micOn));
    }
  }, [micOn]);

  // Seed participants from class data or fallback
  useEffect(() => {
    const base = (cls && (cls.participants as any[])) || [
      { name: 'Instructor Jane', role: 'Host' as const },
      { name: 'Alex' },
      { name: 'Sam' },
      { name: 'Priya' },
      { name: 'Lee' },
    ];
    setParticipants(base);
  }, [cls]);

  const visibleParticipants = useMemo(() => {
    const q = participantQuery.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => p.name.toLowerCase().includes(q));
  }, [participants, participantQuery]);

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Live Class</Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', p: 1, borderRadius: 2, background: (theme) => `linear-gradient(90deg, ${theme.palette.action.hover}, transparent)` }}>
              <Box>
                <Typography variant="h5" fontWeight={800}>{cls?.title}</Typography>
                <Typography variant="body2" color="text.secondary">Instructor: {cls?.instructor}</Typography>
                <Typography variant="body2" color="text.secondary">When: {new Date(cls?.date).toLocaleString()}</Typography>
                <Box sx={{ display: 'flex', gap: 1, my: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" label={cls?.platform} />
                  <Chip size="small" color="info" label={cls?.duration} />
                  <Chip size="small" color={cls?.status === 'live' ? 'error' : 'default'} label={cls?.status} />
                  <Chip size="small" variant="outlined" label={`${participants.length} students`} />
                </Box>
              </Box>
              <Box>
                {!joined ? (
                  <Button variant="contained" onClick={handleJoin} disabled={!canJoin}>Join class</Button>
                ) : (
                  <Chip icon={<FiberManualRecordIcon color="error" />} color="error" label="LIVE" />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {!joined ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
                <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover', height: 240 }}>
                  <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {!camOn && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                      <Typography color="text.secondary">Camera is off</Typography>
                    </Box>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Pre-join settings</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startIcon={micOn ? <MicIcon /> : <MicOffIcon />} variant={micOn ? 'contained' : 'outlined'} onClick={() => setMicOn((v) => !v)}>{micOn ? 'Mic on' : 'Mic off'}</Button>
                    <Button startIcon={camOn ? <VideocamIcon /> : <VideocamOffIcon />} variant={camOn ? 'contained' : 'outlined'} onClick={() => setCamOn((v) => !v)}>{camOn ? 'Camera on' : 'Camera off'}</Button>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Starts in: {new Date(remaining).toISOString().substr(11, 8)} • You can join 10 minutes before.</Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2 }}>
                {/* Video stage */}
                <Box>
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: 'black', height: { xs: 280, md: 420 } }}>
                    <video ref={videoRef} autoPlay muted={micOn ? false : true} playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {!camOn && (
                      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'white' }}>
                        <Typography variant="h6">Camera is off</Typography>
                      </Box>
                    )}
                    {/* Self preview */}
                    {camOn && (
                      <Box sx={{ position: 'absolute', bottom: 70, right: 16, width: 140, height: 90, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.800', border: '1px solid rgba(255,255,255,.2)' }}>
                        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    )}
                    {/* Controls */}
                    <Box sx={{ position: 'absolute', bottom: 8, left: 8, right: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={micOn ? 'Mute' : 'Unmute'}>
                          <IconButton color={micOn ? 'primary' : 'default'} onClick={() => setMicOn((v) => !v)} sx={{ bgcolor: 'background.paper' }}>{micOn ? <MicIcon /> : <MicOffIcon />}</IconButton>
                        </Tooltip>
                        <Tooltip title={camOn ? 'Turn camera off' : 'Turn camera on'}>
                          <IconButton color={camOn ? 'primary' : 'default'} onClick={() => setCamOn((v) => !v)} sx={{ bgcolor: 'background.paper' }}>{camOn ? <VideocamIcon /> : <VideocamOffIcon />}</IconButton>
                        </Tooltip>
                        <Tooltip title={shareOn ? 'Stop sharing' : 'Share screen'}>
                          <IconButton color={shareOn ? 'primary' : 'default'} onClick={() => setShareOn((v) => !v)} sx={{ bgcolor: 'background.paper' }}>{shareOn ? <StopScreenShareIcon /> : <ScreenShareIcon />}</IconButton>
                        </Tooltip>
                        <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                          {['👍','👏','🎉','❤️'].map((e) => (
                            <Button key={e} size="small" variant="outlined">{e}</Button>
                          ))}
                        </Box>
                      </Box>
                      <Tooltip title="Leave">
                        <IconButton onClick={handleLeave} sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}>
                          <CallEndIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                {/* Side panel */}
                <Box>
                  <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
                    <Tab label="Chat" value="chat" />
                    <Tab label={`Participants (${participants.length})`} value="participants" />
                  </Tabs>
                  {tab === 'chat' ? (
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ maxHeight: 320, overflowY: 'auto', display: 'grid', gap: 1 }}>
                          {messages.map((m) => (
                            <Box key={m.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                              <Avatar>{m.author.substring(0,1)}</Avatar>
                              <Box>
                                <Typography variant="subtitle2">{m.author} <Typography component="span" variant="caption" color="text.secondary">{m.ts}</Typography></Typography>
                                <Typography variant="body2">{m.text}</Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField fullWidth size="small" placeholder="Type a message" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }} />
                          <Button variant="contained" onClick={sendChat} endIcon={<SendIcon />}>Send</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                          <TextField size="small" placeholder="Search students" value={participantQuery} onChange={(e) => setParticipantQuery(e.target.value)} />
                          <Chip size="small" label={`${visibleParticipants.length} shown`} />
                        </Box>
                        <List>
                          {visibleParticipants.map((p, i) => (
                            <ListItem key={`${p.name}-${i}`} secondaryAction={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {p.role ? <Chip size="small" color={p.role === 'Host' ? 'secondary' : 'default'} label={p.role} /> : null}
                                {p.speaking ? <Chip size="small" color="success" label="Speaking" /> : null}
                                {p.muted ? <Chip size="small" variant="outlined" label="Muted" /> : null}
                              </Box>
                            }>
                              <ListItemAvatar>
                                <Badge color={p.speaking ? 'success' : 'default'} variant={p.speaking ? 'dot' : undefined} overlap="circular">
                                  <Avatar>{p.name.substring(0,1)}</Avatar>
                                </Badge>
                              </ListItemAvatar>
                              <ListItemText primary={p.name} secondary={p.role || 'Participant'} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
        </Snackbar>
      </Box>
    </StudentLayout>
  );
};

export default LiveClassDetail;


