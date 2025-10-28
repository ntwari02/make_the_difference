import React, { useMemo, useState } from 'react';
import {
  Box, Card, Typography, List, ListItem, ListItemText, Chip, TextField,
  InputAdornment, IconButton, Avatar, Divider, Button, ToggleButtonGroup, ToggleButton,
  Tooltip, ListItemButton
} from '@mui/material';
import {
  Search as SearchIcon, FilterList as FilterIcon, Star as StarIcon, StarBorder as StarBorderIcon,
  Archive as ArchiveIcon, Delete as DeleteIcon, MoreVert as MoreIcon, Send as SendIcon,
  AttachFile as AttachFileIcon, EmojiEmotions as EmojiIcon, Reply as ReplyIcon,
  MarkEmailRead as ReadIcon
} from '@mui/icons-material';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorMessages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [composerValue, setComposerValue] = useState('');

  const conversations = [
    { id: '1', from: 'Alice Johnson', subject: 'Question about assignment', unread: true, starred: true, lastMessageAt: 'Today, 09:12', avatar: '', archived: false },
    { id: '2', from: 'Bob Smith', subject: 'Course enrollment issue', unread: false, starred: false, lastMessageAt: 'Yesterday, 16:47', avatar: '', archived: false },
    { id: '3', from: 'Carol Davis', subject: 'Feedback on the last lecture', unread: false, starred: true, lastMessageAt: 'Sun, 12:30', avatar: '', archived: false },
    { id: '4', from: 'David Wilson', subject: 'Request for reschedule', unread: true, starred: false, lastMessageAt: 'Sat, 10:05', avatar: '', archived: false },
  ];

  const messagesByConversation: Record<string, Array<{ id: string; fromMe?: boolean; text: string; time: string }>> = {
    '1': [
      { id: 'm1', text: 'Hi, I have a question about the assignment due date.', time: '09:12' },
      { id: 'm2', text: 'Sure! It is due next Friday at 5PM.', time: '09:20', fromMe: true },
    ],
    '2': [
      { id: 'm1', text: 'I am having trouble enrolling in the course.', time: '16:47' },
      { id: 'm2', text: 'Can you try again now? I have updated permissions.', time: '16:55', fromMe: true },
    ],
    '3': [
      { id: 'm1', text: 'The last lecture was very informative. Thanks!', time: '12:30' },
      { id: 'm2', text: 'Glad to hear that! Let me know if you have suggestions.', time: '12:41', fromMe: true },
    ],
    '4': [
      { id: 'm1', text: 'Could we reschedule the session to Wednesday?', time: '10:05' },
      { id: 'm2', text: 'Yes, Wednesday 2PM works. I will update the calendar.', time: '10:18', fromMe: true },
    ],
  };

  const filteredConversations = useMemo(() => {
    return conversations
      .filter(c =>
        c.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(c => {
        if (filter === 'unread') return c.unread;
        if (filter === 'starred') return c.starred;
        if (filter === 'archived') return c.archived;
        return true;
      });
  }, [searchTerm, filter]);

  const activeConversationId = selectedConversationId || filteredConversations[0]?.id || null;
  const activeMessages = activeConversationId ? messagesByConversation[activeConversationId] || [] : [];

  

  return (
    <InstructorLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Messages</Typography>
            <Typography variant="body2" color="text.secondary">Manage your conversations with students</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Mark all as read"><IconButton><ReadIcon /></IconButton></Tooltip>
            <Tooltip title="Archive"><IconButton><ArchiveIcon /></IconButton></Tooltip>
            <Tooltip title="More"><IconButton><MoreIcon /></IconButton></Tooltip>
          </Box>
        </Box>

        <Card sx={{ borderRadius: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' } }}>
            {/* Left: Conversations list */}
            <Box sx={{ borderRight: { md: theme => `1px solid ${theme.palette.divider}` }, p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search messages..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
                <IconButton><FilterIcon /></IconButton>
              </Box>

              <ToggleButtonGroup
                size="small"
                exclusive
                value={filter}
                onChange={(_, v) => v && setFilter(v)}
                fullWidth
                sx={{ mb: 2 }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="unread">Unread</ToggleButton>
                <ToggleButton value="starred">Starred</ToggleButton>
                <ToggleButton value="archived">Archived</ToggleButton>
              </ToggleButtonGroup>

              <List>
                {filteredConversations.map((c) => (
                  <ListItem
                    key={c.id}
                    divider
                    disablePadding
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">{c.lastMessageAt}</Typography>
                        <IconButton size="small">
                          {c.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemButton
                      selected={activeConversationId === c.id}
                      onClick={() => setSelectedConversationId(c.id)}
                    >
                      <Avatar sx={{ mr: 2 }}>{c.from.split(' ').map(n => n[0]).join('')}</Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={600}>{c.from}</Typography>
                            {c.unread && <Chip size="small" label="Unread" color="primary" />}
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                        secondary={<Typography variant="body2" color="text.secondary" noWrap>{c.subject}</Typography>}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Right: Message thread */}
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 520 }}>
              {activeConversationId ? (
                <>
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{conversations.find(c => c.id === activeConversationId)?.from}</Typography>
                      <Typography variant="body2" color="text.secondary">{conversations.find(c => c.id === activeConversationId)?.subject}</Typography>
                    </Box>
                    <Box>
                      <Tooltip title="Reply"><IconButton><ReplyIcon /></IconButton></Tooltip>
                      <Tooltip title="Mark read"><IconButton><ReadIcon /></IconButton></Tooltip>
                      <Tooltip title="Archive"><IconButton><ArchiveIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton color="error"><DeleteIcon /></IconButton></Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, p: 2, display: 'grid', gap: 1, alignContent: 'start' }}>
                    {activeMessages.map(m => (
                      <Box key={m.id} sx={{ display: 'flex', justifyContent: m.fromMe ? 'flex-end' : 'flex-start' }}>
                        <Box sx={{
                          bgcolor: m.fromMe ? 'primary.main' : 'background.paper',
                          color: m.fromMe ? 'primary.contrastText' : 'text.primary',
                          border: m.fromMe ? 'none' : theme => `1px solid ${theme.palette.divider}`,
                          px: 1.5, py: 1, borderRadius: 2, maxWidth: '70%'
                        }}>
                          <Typography variant="body2">{m.text}</Typography>
                          <Typography variant="caption" color={m.fromMe ? 'primary.contrastText' : 'text.secondary'}>{m.time}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <Divider />
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton><EmojiIcon /></IconButton>
                    <IconButton><AttachFileIcon /></IconButton>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      size="small"
                      value={composerValue}
                      onChange={(e) => setComposerValue(e.target.value)}
                    />
                    <Button variant="contained" endIcon={<SendIcon />} disabled={!composerValue.trim()}>Send</Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">Select a conversation to view messages</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Card>
      </Box>
    </InstructorLayout>
  );
};

export default InstructorMessages;


