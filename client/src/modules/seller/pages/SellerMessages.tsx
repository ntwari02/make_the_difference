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
import { messagingApi, type SellerConversation, type SellerMessage, sellerMessaging } from '../services/sellerApi';
import { STORAGE_KEYS } from '../../../core/config/constants';

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
  const [serverConversations, setServerConversations] = useState<SellerConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<SellerConversation | null>(null);
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshConversations = async (folderOverride?: string) => {
    try {
      setIsRefreshing(true);
      const rawUser = localStorage.getItem(STORAGE_KEYS.USER_DATA) || localStorage.getItem('user') || '{}';
      const me = JSON.parse(rawUser);
      const sellerId = me?.id;
      if (!sellerId) return;
      const result = await messagingApi.getConversations(sellerId, { page: 1, limit: 20, folder: (folderOverride || filter) as any });
      setServerConversations(result.conversations || []);
    } catch (err) {
      console.error('Failed to refresh conversations', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // --- Minimal backend wiring: load conversations for current seller ---
  useEffect(() => {
    refreshConversations();
  }, [filter]);

  const loadConversationMessages = async (conversation: SellerConversation) => {
    try {
      const result = await messagingApi.getConversationMessages(conversation.id, { page: 1, limit: 100 });
      const msgs: SellerMessage[] = result.messages || [];
      // Map backend messages to local Message shape just for rendering in existing thread UI
      const mapped: Message[] = msgs.map((m) => ({
        id: m.id,
        sender: {
          name: m.sender_id === (JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA) || localStorage.getItem('user') || '{}') || {}).id
            ? (profile?.business_name || 'You')
            : `${m.first_name || ''} ${m.last_name || ''}`.trim(),
          avatar: '',
          type: (m.sender_id === (JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA) || localStorage.getItem('user') || '{}') || {}).id) ? 'seller' : 'buyer',
        },
        subject: conversation.subject || conversation.title || '',
        message: m.content,
        timestamp: m.created_at,
        read: !!m.is_read,
        priority: 'normal',
        category: 'inquiry',
        seen: false,
      }));
      setSelectedConversation(conversation);
      setThread(mapped);
      // Also update messages list to keep existing unread counters roughly meaningful
      setMessages(mapped);
    } catch (err: any) {
      // If server returns 403 for not a participant, clear selection and refresh list
      const status = err?.response?.status;
      if (status === 403) {
        setSelectedConversation(null);
        setThread([]);
        setSnackbar({ open: true, message: 'This conversation is no longer available.', severity: 'info' });
        await refreshConversations();
        return;
      }
      console.error('Failed to load messages', err);
    }
  };

  // Remove mock: rely only on live data loaded via serverConversations + thread

  const filteredConversations = serverConversations.filter(c => {
    if (!searchTerm) return true;
    const name = `${c.first_name || ''} ${c.last_name || ''}`.trim().toLowerCase();
    const subject = (c.subject || c.title || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || subject.includes(searchTerm.toLowerCase());
  });

  const unreadCount = serverConversations.reduce((acc, c) => acc + (Number(c.unread_count || 0) || 0), 0);

  const isThreadValid = useMemo(() => {
    if (!selectedConversation) return false;
    return !!serverConversations.find((c) => c.id === selectedConversation.id);
  }, [selectedConversation, serverConversations]);

  const handleConversationClick = (conv: SellerConversation) => {
    loadConversationMessages(conv);
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;
    try {
    const content = replyText;
      await messagingApi.sendMessage(selectedConversation.id, { content });
    setReplyText('');
    setAttachments([]);
    setReplyTo(null);
      await loadConversationMessages(selectedConversation);
      setSnackbar({ open: true, message: 'Reply sent', severity: 'success' });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 403) {
        setSnackbar({ open: true, message: 'You are no longer a participant. Thread closed.', severity: 'info' });
        setSelectedConversation(null);
        setThread([]);
        await refreshConversations();
        return;
      }
      setSnackbar({ open: true, message: 'Failed to send reply', severity: 'error' });
    }
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

  const pagedConversations = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredConversations.slice(start, start + rowsPerPage);
  }, [filteredConversations, page, rowsPerPage]);

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

  const bulkMarkRead = async () => {
    try {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      await sellerMessaging.bulkAction({ conversationIds: ids, action: 'mark_read' });
      // Refresh list
      const rawUser = localStorage.getItem(STORAGE_KEYS.USER_DATA) || localStorage.getItem('user') || '{}';
      const me = JSON.parse(rawUser);
      const sellerId = me?.id;
      if (sellerId) {
        const result = await messagingApi.getConversations(sellerId, { page: 1, limit: 20, folder: filter as any });
        setServerConversations(result.conversations || []);
      }
      setSelectedIds(new Set());
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const bulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      await sellerMessaging.bulkAction({ conversationIds: ids, action: 'delete' });
      const rawUser = localStorage.getItem(STORAGE_KEYS.USER_DATA) || localStorage.getItem('user') || '{}';
      const me = JSON.parse(rawUser);
      const sellerId = me?.id;
      if (sellerId) {
        const result = await messagingApi.getConversations(sellerId, { page: 1, limit: 20, folder: filter as any });
        setServerConversations(result.conversations || []);
      }
      setSelectedIds(new Set());
    } catch (e) {
      console.error('Failed to delete', e);
    }
  };

  const bulkArchive = async (archive: boolean) => {
    try {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      await sellerMessaging.bulkAction({ conversationIds: ids, action: archive ? 'archive' : 'unarchive' });
      const rawUser = localStorage.getItem(STORAGE_KEYS.USER_DATA) || localStorage.getItem('user') || '{}';
      const me = JSON.parse(rawUser);
      const sellerId = me?.id;
      if (sellerId) {
        const result = await messagingApi.getConversations(sellerId, { page: 1, limit: 20, folder: filter as any });
        setServerConversations(result.conversations || []);
      }
      setSelectedIds(new Set());
    } catch (e) {
      console.error('Failed to archive/unarchive', e);
    }
  };

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Minimal backend conversation list (temporary) */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
          <Typography variant="overline" color="text.secondary">Server Conversations</Typography>
          <List>
            {(serverConversations || []).map((c) => (
              <ListItem key={c.id} disablePadding>
                <ListItemButton onClick={() => loadConversationMessages(c)} selected={selectedConversation?.id === c.id}>
                  <ListItemText
                    primary={(c.first_name || '') + ' ' + (c.last_name || '')}
                    secondary={(c.subject || c.title || '') + (c.last_message_created_at ? ` • ${new Date(c.last_message_created_at).toLocaleString()}` : '')}
                  />
                  {Number(c.unread_count || 0) > 0 && <Chip size="small" label={c.unread_count} color="primary" />}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
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
                  indeterminate={selectedIds.size > 0 && selectedIds.size < pagedConversations.length}
                  checked={pagedConversations.length > 0 && selectedIds.size === pagedConversations.length}
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
                <Tooltip title="Archive"><span><IconButton disabled={selectedIds.size === 0} onClick={() => bulkArchive(true)}><ArchiveIcon /></IconButton></span></Tooltip>
                <Tooltip title="Unarchive"><span><IconButton disabled={selectedIds.size === 0} onClick={() => bulkArchive(false)}><UndoIcon /></IconButton></span></Tooltip>
                <Tooltip title="Mark as read"><span><IconButton disabled={selectedIds.size === 0} onClick={bulkMarkRead}><MarkReadIcon /></IconButton></span></Tooltip>
                <Tooltip title="Delete"><span><IconButton disabled={selectedIds.size === 0} onClick={bulkDelete} color="error"><DeleteIcon /></IconButton></span></Tooltip>
              </Box>
              <Box sx={{ overflowY: 'auto' }}>
                <List>
                  {pagedConversations.map((c, index) => (
                    <React.Fragment key={c.id}>
                      <ListItem
                        secondaryAction={<Checkbox edge="end" onChange={() => toggleSelectOne(c.id)} checked={selectedIds.has(c.id)} />}
                        disablePadding
                        sx={{ alignItems: 'flex-start' }}
                      >
                        <ListItemButton
                          onClick={() => handleConversationClick(c)}
                          selected={selectedConversation?.id === c.id}
                          sx={{
                            bgcolor: Number(c.unread_count || 0) > 0 ? 'action.hover' : 'transparent',
                            '&:hover': { bgcolor: 'action.selected' },
                            alignItems: 'flex-start'
                          }}
                        >
                          <ListItemAvatar>
                            <Badge color="error" variant="dot" invisible={!Number(c.unread_count || 0)}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {(c.first_name || '?').charAt(0)}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primaryTypographyProps={{ component: 'div' }}
                            secondaryTypographyProps={{ component: 'div' }}
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" component="span" fontWeight={Number(c.unread_count || 0) > 0 ? 600 : 400} noWrap>
                                  {(c.first_name || '') + ' ' + (c.last_name || '')}
                                </Typography>
                                {c.status && <Chip label={c.status} size="small" />}
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span" color="text.primary" noWrap>
                                  {c.subject || c.title || ''}
                                </Typography>
                                <Typography variant="caption" component="span" color="text.secondary" sx={{ ml: 1 }}>
                                  {c.last_message_created_at ? (new Date(c.last_message_created_at).toLocaleDateString() + ' ' + new Date(c.last_message_created_at).toLocaleTimeString()) : ''}
                                </Typography>
                              </>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < pagedConversations.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
              <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                <Pagination page={page} onChange={(_, p) => setPage(p)} count={Math.max(1, Math.ceil(filteredConversations.length / rowsPerPage))} color="primary" />
              </Box>
            </CardContent>
          </Card>

          {/* Detail pane */}
          <Card sx={{ display: { xs: selectedConversation ? 'block' : 'none', lg: 'block' } }}>
            <CardContent sx={{ height: { md: 'calc(100vh - 140px)' }, display: 'flex', flexDirection: 'column' }}>
              {selectedConversation ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{(selectedConversation.first_name || '?').charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="h6">{(selectedConversation.first_name || '') + ' ' + (selectedConversation.last_name || '')}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedConversation.subject || selectedConversation.title || ''}</Typography>
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
                      <TextField fullWidth multiline rows={3} placeholder={`Reply to ${(selectedConversation.first_name || '')}...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} disabled={!isThreadValid || isRefreshing} />
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
                      <Button variant="outlined" onClick={() => setSelectedConversation(null)}>Close</Button>
                      {pendingSend && (
                        <Button variant="text" startIcon={<UndoIcon />} onClick={handleUndoSend}>Undo</Button>
                      )}
                      <Button variant="contained" startIcon={<SendIcon />} onClick={handleSendReply} disabled={!replyText.trim() || !isThreadValid || isRefreshing}>Send</Button>
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
