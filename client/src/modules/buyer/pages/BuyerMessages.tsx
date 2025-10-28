import React from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Avatar,
  Button,
  Chip,
  Badge,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import { Send as SendIcon, Search as SearchIcon, AttachFile as AttachIcon, MoreVert as MoreIcon, Star as StarIcon, StarBorder as StarBorderIcon, DoneAll as DoneAllIcon, Archive as ArchiveIcon } from '@mui/icons-material';
import BuyerLayout from '../components/layout/BuyerLayout';

interface Conversation {
  id: string;
  dealer: string;
  lastMessage: string;
  avatar: string;
  unread?: number;
  starred?: boolean;
}

interface Message {
  id: string;
  from: 'buyer' | 'dealer';
  text: string;
  time: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'c1', dealer: 'Prime Autos', lastMessage: 'We can do a test drive tomorrow.', avatar: 'https://i.pravatar.cc/100?img=12', unread: 2, starred: true },
  { id: 'c2', dealer: 'City Motors', lastMessage: 'Price is slightly negotiable.', avatar: 'https://i.pravatar.cc/100?img=5', unread: 0, starred: false },
  { id: 'c3', dealer: 'Luxury Wheels', lastMessage: 'Sure, sending more photos.', avatar: 'https://i.pravatar.cc/100?img=20', unread: 1, starred: false },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: 'm1', from: 'dealer', text: 'Hello! Thanks for your interest in the Model 3.', time: '09:12' },
    { id: 'm2', from: 'buyer', text: 'Hi! Can I schedule a test drive this week?', time: '09:14' },
    { id: 'm3', from: 'dealer', text: 'We can do a test drive tomorrow.', time: '09:15' },
  ],
  c2: [
    { id: 'm1', from: 'buyer', text: 'Is the price negotiable?', time: '08:01' },
    { id: 'm2', from: 'dealer', text: 'Price is slightly negotiable.', time: '08:05' },
  ],
  c3: [
    { id: 'm1', from: 'buyer', text: 'Could you share interior photos?', time: '10:20' },
    { id: 'm2', from: 'dealer', text: 'Sure, sending more photos.', time: '10:22' },
  ],
};

const BuyerMessages: React.FC = () => {
  const theme = useTheme();
  const [query, setQuery] = React.useState('');
  const [activeId, setActiveId] = React.useState('c1');
  const [draft, setDraft] = React.useState('');
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  // Local copy so we can toggle starred/unread in UI
  const [convList, setConvList] = React.useState<Conversation[]>(MOCK_CONVERSATIONS);

  const [filters, setFilters] = React.useState<{ new: boolean; unread: boolean; important: boolean }>({ new: false, unread: false, important: false });

  const toggleFilter = (key: 'new' | 'unread' | 'important') => setFilters((f) => ({ ...f, [key]: !f[key] }));

  const filteredByQuery = React.useMemo(
    () => convList.filter((c) => (query ? c.dealer.toLowerCase().includes(query.toLowerCase()) : true)),
    [convList, query]
  );

  const conversations = React.useMemo(() => {
    let result = filteredByQuery;
    // Tabs: 0 Inbox (all), 1 Sent (none in mock), 2 Starred
    if (tabValue === 2) {
      result = result.filter((c) => c.starred);
    }
    // Chips
    if (filters.unread || filters.new) {
      result = result.filter((c) => (c.unread || 0) > 0);
    }
    if (filters.important) {
      result = result.filter((c) => c.starred);
    }
    return result;
  }, [filteredByQuery, tabValue, filters]);

  const inboxCount = convList.length;
  const starredCount = convList.filter((c) => c.starred).length;

  const markAllAsRead = () => setConvList((list) => list.map((c) => ({ ...c, unread: 0 })));
  const archiveFiltered = () => setConvList((list) => list.filter((c) => !conversations.some((fc) => fc.id === c.id)));

  const messages = MOCK_MESSAGES[activeId] || [];

  const sendMessage = () => {
    if (!draft.trim()) return;
    messages.push({ id: `${Date.now()}`, from: 'buyer', text: draft.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    setDraft('');
  };

  return (
    <BuyerLayout>
      <Box>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Messages</Typography>
            <Typography variant="body2" color="text.secondary">Chat with dealers and manage conversations</Typography>
          </Box>
          <Button variant="contained" startIcon={<SendIcon />} onClick={() => setComposeOpen(true)} sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` }}>
            Compose
          </Button>
        </Box>

        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ pt: 1 }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography>Inbox</Typography><Chip label={inboxCount} size="small" color="primary" /></Box>} />
              <Tab label="Sent" />
              <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><StarIcon fontSize="small" /> Starred<Chip label={starredCount} size="small" /></Box>} />
            </Tabs>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="New" color="success" variant={filters.new ? 'filled' : 'outlined'} onClick={() => toggleFilter('new')} clickable />
              <Chip label="Unread" color="primary" variant={filters.unread ? 'filled' : 'outlined'} onClick={() => toggleFilter('unread')} clickable />
              <Chip label="Important" color="warning" variant={filters.important ? 'filled' : 'outlined'} onClick={() => toggleFilter('important')} clickable />
            </Box>
          </CardContent>
        </Card>
        <Grid container spacing={2}>
          {/* Conversations list */}
          <Grid item xs={12} md={4} lg={3}>
            <Card sx={{ height: { md: 'calc(100vh - 260px)' }, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ pb: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search dealers..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  InputProps={{ endAdornment: (<InputAdornment position="end"><SearchIcon fontSize="small" /></InputAdornment>) }}
                />
              </CardContent>
              <Divider />
              <Box sx={{ px: 2, py: 1, display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                <Button size="small" variant="outlined" startIcon={<DoneAllIcon />} onClick={markAllAsRead}>
                  Mark all read
                </Button>
                <Button size="small" color="warning" variant="outlined" startIcon={<ArchiveIcon />} onClick={archiveFiltered}>
                  Archive filtered
                </Button>
              </Box>
              <Divider />
              <List sx={{ overflowY: 'auto' }}>
                {conversations.map((c) => (
                  <ListItem
                    key={c.id}
                    selected={activeId === c.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
                        <MoreIcon />
                      </IconButton>
                    }
                    disablePadding
                  >
                    <ListItemButton onClick={() => setActiveId(c.id)}>
                      <Badge color="error" badgeContent={c.unread || 0} overlap="circular" invisible={!c.unread} sx={{ mr: 2 }}>
                        <Avatar src={c.avatar} />
                      </Badge>
                      <ListItemText
                        primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography fontWeight={700}>{c.dealer}</Typography>{c.starred ? (
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setConvList((list) => list.map((x) => x.id === c.id ? { ...x, starred: false } : x)); }}><StarIcon fontSize="small" color="warning" /></IconButton>
                        ) : (
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setConvList((list) => list.map((x) => x.id === c.id ? { ...x, starred: true } : x)); }}><StarBorderIcon fontSize="small" sx={{ color: 'text.disabled' }} /></IconButton>
                        )}</Box>}
                        secondaryTypographyProps={{ component: 'div' }}
                        secondary={<Typography variant="body2" color="text.secondary" noWrap>{c.lastMessage}</Typography>}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>

          {/* Chat pane */}
          <Grid item xs={12} md={8} lg={9}>
            <Card sx={{ height: { md: 'calc(100vh - 260px)' }, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
                <List>
                  {messages.map((m) => (
                    <ListItem key={m.id} sx={{ justifyContent: m.from === 'buyer' ? 'flex-end' : 'flex-start' }}>
                      {m.from === 'dealer' && <Avatar sx={{ mr: 1 }} />}
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: m.from === 'buyer' ? 'primary.main' : (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'),
                          color: m.from === 'buyer' ? '#fff' : 'text.primary',
                          maxWidth: '70%',
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{m.text}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>{m.time}</Typography>
                      </Box>
                      {m.from === 'buyer' && <Avatar sx={{ ml: 1 }} />}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <Divider />
              <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                />
                <IconButton color="default">
                  <AttachIcon />
                </IconButton>
                <IconButton color="primary" onClick={sendMessage}>
                  <SendIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        </Grid>
        <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => setMenuAnchorEl(null)}>
          <MenuItem onClick={() => setMenuAnchorEl(null)}>Mark as Read</MenuItem>
          <MenuItem onClick={() => setMenuAnchorEl(null)}>Star/Unstar</MenuItem>
          <MenuItem onClick={() => setMenuAnchorEl(null)}>Delete</MenuItem>
        </Menu>

        <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>New Message</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="To" sx={{ mb: 2, mt: 1 }} />
            <TextField fullWidth label="Subject" sx={{ mb: 2 }} />
            <TextField fullWidth multiline rows={8} placeholder="Type your message..." />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button startIcon={<AttachIcon />} variant="outlined">Attach</Button>
            <Button variant="contained" startIcon={<SendIcon />} onClick={() => setComposeOpen(false)}>Send</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </BuyerLayout>
  );
};

export default BuyerMessages;


