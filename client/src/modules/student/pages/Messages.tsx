import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, IconButton, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, Chip, Button, Tooltip, Menu, MenuItem, Badge } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import StudentLayout from '../components/layout/StudentLayout';

interface Conversation { id: string; name: string; avatar?: string; lastMessage: string; unread?: number }
interface Message { id: string; conversationId: string; author: 'me' | 'other'; text: string; timestamp: string; delivered?: boolean; read?: boolean; reactions?: string[] }

const mockConversations: Conversation[] = [
  { id: '1', name: 'Instructor Jane', lastMessage: 'See you in class tomorrow!', unread: 2 },
  { id: '2', name: 'Support', lastMessage: 'Your ticket has been updated.' },
  { id: '3', name: 'Study Group', lastMessage: 'Sharing notes for chapter 3.' },
];

const mockMessages: Message[] = [
  { id: 'm1', conversationId: '1', author: 'other', text: 'Welcome to the course!', timestamp: '09:32' },
  { id: 'm2', conversationId: '1', author: 'me', text: 'Thanks! Excited to start.', timestamp: '09:35', delivered: true },
  { id: 'm3', conversationId: '1', author: 'other', text: 'See you in class tomorrow!', timestamp: '09:45' },
  { id: 'm4', conversationId: '2', author: 'other', text: 'We updated your ticket.', timestamp: '11:20' },
  { id: 'm5', conversationId: '3', author: 'me', text: 'Anyone has notes?', timestamp: '13:05', delivered: true, read: true },
];

const StudentMessages: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('1');
  const [query, setQuery] = useState('');
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const [typing, setTyping] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextMsg, setContextMsg] = useState<Message | null>(null);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockConversations;
    return mockConversations.filter((c) => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  }, [query]);

  const messages = useMemo(() => mockMessages.filter((m) => m.conversationId === selectedId), [selectedId]);

  const send = () => {
    if (!input.trim()) return;
    // In real app, post to API and refresh
    mockMessages.push({ id: String(Math.random()), conversationId: selectedId, author: 'me', text: input.trim(), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), delivered: true });
    setInput('');
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  // Mock typing indicator on conversation change
  useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 1200);
    return () => clearTimeout(t);
  }, [selectedId]);

  const openMenu = (e: React.MouseEvent<HTMLElement>, m: Message) => {
    setAnchorEl(e.currentTarget);
    setContextMsg(m);
  };
  const closeMenu = () => { setAnchorEl(null); setContextMsg(null); };
  const addReaction = (emoji: string) => {
    if (!contextMsg) return;
    contextMsg.reactions = Array.from(new Set([...(contextMsg.reactions || []), emoji]));
    closeMenu();
  };
  const markRead = () => {
    mockMessages.forEach((m) => { if (m.conversationId === selectedId) m.read = true; });
    closeMenu();
  };
  const newConversation = () => {
    const id = String(Math.random());
    mockConversations.unshift({ id, name: 'New Chat', lastMessage: 'Say hi!' });
    setSelectedId(id);
  };

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight={700}>Messages</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip color="primary" label={`${filteredConversations.length} conversations`} />
            <Button size="small" startIcon={<AddIcon />} onClick={newConversation}>New</Button>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 2 }}>
              {/* Conversations list */}
              <Box>
                <TextField size="small" fullWidth placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                <List sx={{ mt: 1 }}>
                  {filteredConversations.map((c) => (
                    <Box key={c.id}>
                      <ListItem selected={selectedId === c.id} onClick={() => setSelectedId(c.id)} sx={{ borderRadius: 1, cursor: 'pointer' }} secondaryAction={<IconButton edge="end"><MoreVertIcon /></IconButton>}>
                        <ListItemAvatar>
                          <Avatar>{c.name.substring(0,1)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<Typography fontWeight={700}>{c.name}</Typography>} 
                          secondaryTypographyProps={{ component: 'div' }}
                          secondary={<Typography variant="caption" color="text.secondary">{c.lastMessage}</Typography>} 
                        />
                        {c.unread ? <Chip size="small" color="error" label={c.unread} /> : null}
                      </ListItem>
                      <Divider sx={{ my: 0.5 }} />
                    </Box>
                  ))}
                </List>
              </Box>

              {/* Conversation panel */}
              <Box sx={{ display: 'flex', flexDirection: 'column', height: { xs: 420, md: 520 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar>{(mockConversations.find(c => c.id === selectedId)?.name || 'U').substring(0,1)}</Avatar>
                    <Box>
                      <Typography fontWeight={700}>{mockConversations.find(c => c.id === selectedId)?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">Active now</Typography>
                    </Box>
                  </Box>
                  <IconButton><MoreVertIcon /></IconButton>
                </Box>
                <Divider />
                <Box sx={{ flex: 1, overflowY: 'auto', py: 2, pr: 1 }}>
                  {messages.map((m) => (
                    <Box key={m.id} sx={{ display: 'flex', justifyContent: m.author === 'me' ? 'flex-end' : 'flex-start', mb: 1.5 }}>
                      <Tooltip title="Message options">
                        <Box onClick={(e: any) => openMenu(e, m)} sx={{ maxWidth: '70%', p: 1, px: 1.5, borderRadius: 2, bgcolor: m.author === 'me' ? 'primary.main' : 'action.hover', color: m.author === 'me' ? 'primary.contrastText' : 'text.primary', cursor: 'pointer' }}>
                          <Typography variant="body2">{m.text}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{m.timestamp}</Typography>
                            {m.author === 'me' && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.9 }}>
                                {m.read ? <DoneAllIcon fontSize="small" /> : m.delivered ? <DoneIcon fontSize="small" /> : null}
                              </Box>
                            )}
                          </Box>
                          {m.reactions && m.reactions.length > 0 && (
                            <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5 }}>
                              {m.reactions.map((r, i) => (
                                <Badge key={i} badgeContent={1} color="secondary" sx={{ '& .MuiBadge-badge': { transform: 'scale(0.75)', transformOrigin: '100% 0%' } }}>
                                  <Chip size="small" label={r} variant="outlined" />
                                </Badge>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Tooltip>
                    </Box>
                  ))}
                  {typing && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24 }}>…</Avatar>
                      <Typography variant="caption">Typing…</Typography>
                    </Box>
                  )}
                  <div ref={endRef} />
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}>
                  <IconButton color="default"><AttachFileIcon /></IconButton>
                  <TextField fullWidth size="small" placeholder="Type a message" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
                  <Button variant="contained" onClick={send} endIcon={<SendIcon />}>Send</Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu} transformOrigin={{ vertical: 'top', horizontal: 'right' }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <MenuItem onClick={() => addReaction('👍')}>React 👍</MenuItem>
          <MenuItem onClick={() => addReaction('🎉')}>React 🎉</MenuItem>
          <MenuItem onClick={() => addReaction('❤️')}>React ❤️</MenuItem>
          <Divider />
          <MenuItem onClick={markRead}>Mark as read</MenuItem>
        </Menu>
      </Box>
    </StudentLayout>
  );
};

export default StudentMessages;


