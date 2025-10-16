import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  Paper,
  Chip,
  Badge,
  
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Pagination,
  Tooltip,
  ListItemButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Reply as ReplyIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Markunread as MarkUnreadIcon,
  MarkEmailRead as MarkReadIcon,
  AttachFile as AttachIcon,
  Undo as UndoIcon,
  ForwardToInbox as ForwardIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import SellerLayout from '../components/layout/SellerLayout';

interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
    type: 'buyer' | 'seller' | 'admin';
  };
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high';
  category: 'inquiry' | 'offer' | 'complaint' | 'support';
  seen?: boolean; // for outgoing messages (seller)
}

const SellerMessages: React.FC = () => {
  const profile = useSelector((state: RootState) => state.seller.profile);

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  
  const [filter, setFilter] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>(
    { open: false, message: '', severity: 'success' }
  );
  const [pendingSend, setPendingSend] = useState<{ timeoutId: number | null; content: string } | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  useEffect(() => {
    // Mock messages data
    const mockMessages: Message[] = [
      {
        id: '1',
        sender: {
          name: 'John Smith',
          avatar: '',
          type: 'buyer'
        },
        subject: 'Interested in Toyota Camry',
        message: 'Hi! I saw your Toyota Camry listing and I\'m very interested. Is it still available? Can we schedule a test drive?',
        timestamp: '2024-01-15T10:30:00Z',
        read: false,
        priority: 'high',
        category: 'inquiry'
      },
      {
        id: '2',
        sender: {
          name: 'Sarah Johnson',
          avatar: '',
          type: 'buyer'
        },
        subject: 'Price negotiation for Honda Accord',
        message: 'I love the Honda Accord you have listed. Would you consider $22,000? I can pay cash.',
        timestamp: '2024-01-14T15:45:00Z',
        read: true,
        priority: 'normal',
        category: 'offer'
      },
      {
        id: '3',
        sender: {
          name: 'Mike Wilson',
          avatar: '',
          type: 'buyer'
        },
        subject: 'Question about vehicle history',
        message: 'Can you provide more details about the service history? Any accidents or major repairs?',
        timestamp: '2024-01-13T09:20:00Z',
        read: true,
        priority: 'normal',
        category: 'inquiry'
      },
      {
        id: '4',
        sender: {
          name: 'Support Team',
          avatar: '',
          type: 'admin'
        },
        subject: 'Listing approval update',
        message: 'Your recent listing for the BMW 3 Series has been approved and is now live on the platform.',
        timestamp: '2024-01-12T14:10:00Z',
        read: false,
        priority: 'normal',
        category: 'support'
      }
    ];
    setMessages(mockMessages);
  }, []);

  const filteredMessages = messages.filter(msg => {
    const folderOk = filter === 'inbox' ? true : filter === 'archived' ? msg.read : filter === 'sent' ? msg.sender.type === 'seller' : true;
    const matchesSearch = searchTerm === '' ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender.name.toLowerCase().includes(searchTerm.toLowerCase());
    return folderOk && matchesSearch;
  });

  const unreadCount = messages.filter(msg => !msg.read).length;

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setThread([message]);
    // Mark as read when opened
    if (!message.read) {
      setMessages(prev => prev.map(m =>
        m.id === message.id ? { ...m, read: true } : m
      ));
    }
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    // Simulate delayed send with undo option
    const content = replyText;
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      sender: { name: profile?.business_name || 'You', avatar: '', type: 'seller' },
      subject: `Re: ${selectedMessage.subject}`,
      message: (replyTo ? `@reply-to:${replyTo.id}\n` : '') + content + (attachments.length ? `\n\n[${attachments.length} attachment(s)]` : ''),
      timestamp: new Date().toISOString(),
      read: true,
      priority: 'normal',
      category: 'support',
      seen: false,
    };
    setThread((prev) => [...prev, optimistic]);
    setPendingSend({ timeoutId: window.setTimeout(() => {
      // Commit send (append a seller message)
      setMessages((prev) => [...prev, { ...optimistic, id: `${Date.now()}` }]);
      setSnackbar({ open: true, message: 'Reply sent', severity: 'success' });
      setPendingSend(null);
    }, 4000), content });
    setSnackbar({ open: true, message: 'Sending… You can undo', severity: 'info' });
    setReplyText('');
    setAttachments([]);
    setReplyTo(null);
  };

  const handleUndoSend = () => {
    if (pendingSend?.timeoutId) {
      clearTimeout(pendingSend.timeoutId);
      setPendingSend(null);
      setSnackbar({ open: true, message: 'Send undone', severity: 'success' });
    }
  };

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setAttachments((prev) => [...prev, ...Array.from(files)]);
    e.target.value = '';
  };

  const removeAttachment = (fileName: string) => {
    setAttachments((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleDeleteThreadMessage = (messageId: string) => {
    // Delete a single message bubble from the open thread
    setThread((prev) => prev.filter((m) => m.id !== messageId));
    setSnackbar({ open: true, message: 'Message removed', severity: 'success' });
  };

  const handleForward = async () => {
    if (!selectedMessage) return;
    try {
      await navigator.clipboard.writeText(`${selectedMessage.sender.name}: ${selectedMessage.message}`);
      setSnackbar({ open: true, message: 'Message copied to clipboard for forwarding', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Could not copy to clipboard', severity: 'error' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'normal': return 'default';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inquiry': return 'primary';
      case 'offer': return 'success';
      case 'complaint': return 'error';
      case 'support': return 'info';
      default: return 'default';
    }
  };

  const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredMessages.slice(start, start + rowsPerPage);
  }, [filteredMessages, page, rowsPerPage]);

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(paged.map((m) => m.id)));
    else setSelectedIds(new Set());
  };

  const bulkMarkRead = () => {
    setMessages((prev) => prev.map((m) => selectedIds.has(m.id) ? { ...m, read: true } : m));
    setSelectedIds(new Set());
  };

  const bulkDelete = () => {
    setMessages((prev) => prev.filter((m) => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
  };

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Three-pane layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px 1fr', lg: '280px 1.1fr 1.4fr' }, gap: 2 }}>
          {/* Folders */}
          <Card sx={{ height: { md: 'calc(100vh - 140px)' }, position: { md: 'sticky' as any }, top: { md: 80 } }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Folders</Typography>
              <List>
                {[
                  { key: 'inbox', label: 'Inbox', count: unreadCount },
                  { key: 'archived', label: 'Archived', count: 0 },
                  { key: 'sent', label: 'Sent', count: 0 },
                ].map((f: any) => (
                  <ListItem key={f.key} disablePadding>
                    <ListItemButton selected={filter === f.key} onClick={() => setFilter(f.key)}>
                      <ListItemText primary={f.label} />
                      {f.count ? <Chip size="small" label={f.count} /> : null}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Messages list with toolbar */}
          <Card>
            <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: { md: 'calc(100vh - 140px)' } }}>
              <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Checkbox
                  indeterminate={selectedIds.size > 0 && selectedIds.size < paged.length}
                  checked={paged.length > 0 && selectedIds.size === paged.length}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
                <TextField size="small" placeholder="Search messages..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ flex: 1 }} />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Category</InputLabel>
                  <Select value={'all'} label="Category" onChange={() => {}}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="inquiry">Inquiries</MenuItem>
                    <MenuItem value="offer">Offers</MenuItem>
                    <MenuItem value="complaint">Complaints</MenuItem>
                    <MenuItem value="support">Support</MenuItem>
                  </Select>
                </FormControl>
                <Tooltip title="Mark as read"><span><IconButton disabled={selectedIds.size === 0} onClick={bulkMarkRead}><MarkReadIcon /></IconButton></span></Tooltip>
                <Tooltip title="Delete"><span><IconButton disabled={selectedIds.size === 0} onClick={bulkDelete} color="error"><DeleteIcon /></IconButton></span></Tooltip>
              </Box>
              <Box sx={{ overflowY: 'auto' }}>
                <List>
                  {paged.map((message, index) => (
                    <React.Fragment key={message.id}>
                      <ListItem
                        secondaryAction={<Checkbox edge="end" onChange={() => toggleSelectOne(message.id)} checked={selectedIds.has(message.id)} />}
                        disablePadding
                        sx={{ alignItems: 'flex-start' }}
                      >
                        <ListItemButton
                          onClick={() => handleMessageClick(message)}
                          sx={{
                            bgcolor: !message.read ? 'action.hover' : 'transparent',
                            '&:hover': { bgcolor: 'action.selected' },
                            alignItems: 'flex-start'
                          }}
                        >
                          <ListItemAvatar>
                            <Badge color="error" variant="dot" invisible={message.read}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {message.sender.name.charAt(0)}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primaryTypographyProps={{ component: 'div' }}
                            secondaryTypographyProps={{ component: 'div' }}
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" component="span" fontWeight={message.read ? 400 : 600} noWrap>
                                  {message.sender.name}
                                </Typography>
                                <Chip label={message.category} size="small" color={getCategoryColor(message.category) as any} />
                                <Chip label={message.priority} size="small" color={getPriorityColor(message.priority) as any} />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span" color="text.primary" noWrap>
                                  {message.subject}
                                </Typography>
                                <Typography variant="caption" component="span" color="text.secondary" sx={{ ml: 1 }}>
                                  {new Date(message.timestamp).toLocaleDateString()} {new Date(message.timestamp).toLocaleTimeString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < paged.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
              <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                <Pagination page={page} onChange={(_, p) => setPage(p)} count={Math.max(1, Math.ceil(filteredMessages.length / rowsPerPage))} color="primary" />
              </Box>
            </CardContent>
          </Card>

          {/* Detail pane */}
          <Card sx={{ display: { xs: selectedMessage ? 'block' : 'none', lg: 'block' } }}>
            <CardContent sx={{ height: { md: 'calc(100vh - 140px)' }, display: 'flex', flexDirection: 'column' }}>
              {selectedMessage ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{selectedMessage.sender.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="h6">{selectedMessage.sender.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedMessage.subject}</Typography>
                    </Box>
                  </Box>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, flex: 1, overflowY: 'auto' }}>
                    {thread.map((msg) => (
                      <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.sender.type === 'seller' ? 'flex-end' : 'flex-start', mb: 1.5, px: { xs: 0.5, sm: 0 } }}>
                        <Box sx={{ maxWidth: { xs: '92%', sm: '80%' }, position: 'relative', '&:hover .msg-actions': { opacity: 1 } }}>
                          {/* Per-message actions (show on hover, responsive) */}
                          <Box className="msg-actions" sx={{ position: 'absolute', top: -8, right: msg.sender.type === 'seller' ? -8 : 'auto', left: msg.sender.type !== 'seller' ? -8 : 'auto', display: 'flex', gap: 0.5, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1, p: 0.25, opacity: 0, transition: 'opacity 120ms ease' }}>
                            <Tooltip title="Forward"><IconButton size="small" onClick={handleForward}><ForwardIcon fontSize="small" /></IconButton></Tooltip>
                            {msg.sender.type !== 'seller' && (
                              <Tooltip title="Reply to this message"><IconButton size="small" onClick={() => setReplyTo(msg)}><ReplyIcon fontSize="small" /></IconButton></Tooltip>
                            )}
                            {msg.sender.type === 'seller' && (
                              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteThreadMessage(msg.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                            )}
                          </Box>
                          <Paper sx={{ p: 1, bgcolor: msg.sender.type === 'seller' ? 'primary.light' : 'background.paper' }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.message}</Typography>
                          </Paper>
                          {msg.sender.type === 'seller' && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                              Sent • Not seen
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                  <Box>
                    {/* Reply context (quote) */}
                    {replyTo && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip size="small" label={`Replying to ${replyTo.sender.name}`} onDelete={() => setReplyTo(null)} />
                        <Typography variant="caption" color="text.secondary" noWrap maxWidth={240}>
                          {replyTo.message}
                        </Typography>
                      </Box>
                    )}
                    {/* Reply box with in-field attach icon */}
                    <Box sx={{ position: 'relative', mb: 1.5 }}>
                      <TextField fullWidth multiline rows={3} placeholder={`Reply to ${selectedMessage.sender.name}...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                      <IconButton size="small" component="label" sx={{ position: 'absolute', right: 8, bottom: 8 }}>
                        <AttachIcon />
                        <input hidden multiple type="file" onChange={handleAttach} />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {attachments.map((f) => (
                        <Chip key={f.name} label={f.name} onDelete={() => removeAttachment(f.name)} />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button variant="outlined" onClick={() => setSelectedMessage(null)}>Close</Button>
                      {pendingSend && (
                        <Button variant="text" startIcon={<UndoIcon />} onClick={handleUndoSend}>Undo</Button>
                      )}
                      <Button variant="contained" startIcon={<SendIcon />} onClick={handleSendReply} disabled={!replyText.trim()}>Send</Button>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'grid', placeItems: 'center', height: '100%', color: 'text.secondary' }}>
                  <Typography variant="body2">Select a conversation to view details</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SellerLayout>
  );
};

export default SellerMessages;
