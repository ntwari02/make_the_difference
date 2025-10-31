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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { useLocation, useNavigate } from 'react-router-dom';
import { sellerApi } from '../services/sellerApi';
import toast from 'react-hot-toast';
import { LinearProgress } from '@mui/material';

// Conversation in list view (mapped from backend)
interface ConversationListItem {
  id: string;
  subject: string;
  buyer: {
    id: string;
    name: string;
    avatar: string;
  } | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    isFromSeller: boolean;
    timestamp: string;
    read: boolean;
  } | null;
  unreadCount: number;
  category: string;
  priority: string;
  archived: boolean;
  timestamp: string;
}

// Message in thread view
interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    type: 'buyer' | 'seller' | 'admin';
  };
  content: string;
  messageType: string;
  fileUrl: string | null;
  read: boolean;
  category: string;
  priority: string;
  timestamp: string;
}

const SellerMessages: React.FC = () => {
  const profile = useSelector((state: RootState) => state.seller.profile);
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationListItem | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [filter, setFilter] = useState<'inbox' | 'sent' | 'archived'>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>(
    { open: false, message: '', severity: 'success' }
  );
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  // Compose dialog (start new conversation)
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [inlineCompose, setInlineCompose] = useState(false);

  // Load conversations list
  const loadConversations = async () => {
    try {
      setLoading(true);
      const result = await sellerApi.messages.getConversations({
        page,
        limit: rowsPerPage,
        folder: filter,
        search: searchTerm || undefined,
        category: categoryFilter !== 'all' ? categoryFilter as any : undefined,
      });
      
      setConversations(result.conversations || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
      toast.error(error?.response?.data?.message || 'Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter, searchTerm, categoryFilter, rowsPerPage]);

  // Open compose from query params (?compose=email&subject=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const to = params.get('compose');
    const subject = params.get('subject') || '';
    const body = params.get('body') || '';
    if (to) {
      setComposeTo(to);
      setComposeSubject(subject);
      setComposeBody(body);
      // Show inline compose on the detail pane
      setInlineCompose(true);
      // Clean URL once opened
      navigate('/seller/messages', { replace: true });
    }
  }, [location.search, navigate]);

  // Load conversation thread when a conversation is selected
  useEffect(() => {
    if (selectedConversation?.id && !selectedConversation.id.startsWith('temp')) {
      loadThread(selectedConversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id]);

  const loadThread = async (conversationId: string) => {
    if (conversationId.startsWith('temp')) return;
    try {
      setLoadingThread(true);
      const result = await sellerApi.messages.getConversationMessages(conversationId);
      setThread(result.messages || []);
      
      // Reload conversations to update unread counts
      await loadConversations();
    } catch (error: any) {
      console.error('Failed to load thread:', error);
      toast.error(error?.response?.data?.message || 'Failed to load conversation');
      setThread([]);
    } finally {
      setLoadingThread(false);
    }
  };

  // Convert conversations to messages format for display
  const messagesForList = conversations.map(conv => ({
    id: conv.id,
    sender: {
      name: conv.buyer?.name || 'Unknown',
      avatar: (conv as any).carImage || conv.buyer?.avatar || '',
      type: (conv.buyer ? 'buyer' : 'admin') as 'buyer' | 'seller' | 'admin'
    },
    subject: (conv as any).carTitle || conv.subject,
    message: conv.lastMessage?.content || '',
    timestamp: conv.lastMessage?.timestamp || conv.timestamp,
    read: conv.lastMessage?.read ?? true,
    priority: (conv.priority || 'normal') as 'low' | 'normal' | 'high',
    category: (conv.category || 'inquiry') as 'inquiry' | 'offer' | 'complaint' | 'support',
    unreadCount: conv.unreadCount
  }));

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleMessageClick = async (conversationId: string) => {
    if (conversationId.startsWith('temp')) {
      await loadConversations();
      toast.error('Conversation is not ready yet. Please try again.');
      return;
    }
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setSelectedConversation(conv);
      // Thread will load automatically via useEffect
    }
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;
    if (selectedConversation.id.startsWith('temp')) {
      toast.error('Conversation is not ready yet. Please start a new one.');
      await loadConversations();
      setSelectedConversation(null);
      return;
    }
    
    try {
      setSending(true);
      const sentMessage = await sellerApi.messages.sendMessage(selectedConversation.id, {
        content: replyText.trim(),
        category: categoryFilter !== 'all' ? categoryFilter : 'support',
        priority: 'normal'
      });
      
      // Add to thread optimistically
      const newMessage: Message = {
        id: sentMessage.id,
        sender: {
          id: sentMessage.sender.id,
          name: sentMessage.sender.name,
          avatar: sentMessage.sender.avatar,
          type: 'seller'
        },
        content: sentMessage.content,
        messageType: sentMessage.messageType,
        fileUrl: sentMessage.fileUrl,
        read: sentMessage.read || false,
        category: sentMessage.category,
        priority: sentMessage.priority,
        timestamp: sentMessage.timestamp
      };
      
      setThread((prev) => [...prev, newMessage]);
      setReplyText('');
      setAttachments([]);
      setReplyTo(null);
      
      // Reload conversations to update last message
      await loadConversations();
      
      toast.success('Reply sent successfully');
    } catch (error: any) {
      console.error('Failed to send reply:', error);
      toast.error(error?.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
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

  const handleDeleteThreadMessage = async (messageId: string) => {
    if (!selectedConversation) return;
    
    try {
      await sellerApi.messages.deleteMessages(selectedConversation.id, [messageId]);
      setThread((prev) => prev.filter((m) => m.id !== messageId));
      toast.success('Message deleted');
      await loadThread(selectedConversation.id);
    } catch (error: any) {
      console.error('Failed to delete message:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete message');
    }
  };

  const handleForward = async () => {
    if (thread.length === 0) return;
    try {
      const text = thread.map(m => `${m.sender.name}: ${m.content}`).join('\n\n');
      await navigator.clipboard.writeText(text);
      toast.success('Conversation copied to clipboard');
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleArchive = async (conversationId: string, archived: boolean) => {
    try {
      await sellerApi.messages.archiveConversation(conversationId, archived);
      toast.success(archived ? 'Conversation archived' : 'Conversation unarchived');
      await loadConversations();
    } catch (error: any) {
      console.error('Failed to archive:', error);
      toast.error(error?.response?.data?.message || 'Failed to archive conversation');
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
    return messagesForList;
  }, [messagesForList]);

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
      const promises = Array.from(selectedIds).map(id => 
        sellerApi.messages.markAsRead(id)
      );
      await Promise.all(promises);
      toast.success('Messages marked as read');
      setSelectedIds(new Set());
      await loadConversations();
    } catch (error: any) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark messages as read');
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      const ids = Array.from(selectedIds).filter(id => !id.startsWith('temp'));
      if (filter === 'archived') {
        // In archived folder, permanently remove (leave) conversations
        await Promise.all(ids.map((id) => sellerApi.messages.deleteConversation(id)));
      } else {
        // In inbox/sent, archive them
        await Promise.all(ids.map((id) => sellerApi.messages.archiveConversation(id, true)));
      }
      // Optimistically remove from UI
      setConversations((prev) => prev.filter((c) => !ids.includes(c.id)));
      toast.success('Conversation(s) deleted');
      setSelectedIds(new Set());
      // Refresh in background to stay in sync
      loadConversations();
      if (selectedConversation && ids.includes(selectedConversation.id)) {
        setSelectedConversation(null);
        setThread([]);
      }
    } catch (error: any) {
      console.error('Bulk delete failed:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete conversations');
    }
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
                  { key: 'inbox', label: 'Inbox', count: totalUnreadCount },
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
                <TextField 
                  size="small" 
                  placeholder="Search messages..." 
                  value={searchTerm} 
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} 
                  onKeyDown={(e) => { if (e.key === 'Enter') loadConversations(); }}
                  InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} 
                  sx={{ flex: 1 }} 
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Category</InputLabel>
                  <Select value={categoryFilter} label="Category" onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="inquiry">Inquiries</MenuItem>
                    <MenuItem value="offer">Offers</MenuItem>
                    <MenuItem value="complaint">Complaints</MenuItem>
                    <MenuItem value="support">Support</MenuItem>
                  </Select>
                </FormControl>
                <Tooltip title="Mark as read"><span><IconButton disabled={selectedIds.size === 0} onClick={bulkMarkRead}><MarkReadIcon /></IconButton></span></Tooltip>
                <Tooltip title="Delete"><span><IconButton disabled={selectedIds.size === 0} onClick={bulkDelete} color="error"><DeleteIcon /></IconButton></span></Tooltip>
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<ForwardIcon />} 
                  onClick={() => { 
                    setComposeTo(''); 
                    setComposeSubject(''); 
                    setComposeBody(''); 
                    setSelectedConversation(null); 
                    setInlineCompose(true); 
                  }}
                >
                  New Chat
                </Button>
              </Box>
              {loading && <LinearProgress />}
              <Box sx={{ overflowY: 'auto' }}>
                {!loading && paged.length === 0 && (
                  <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>No conversations found</Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<ForwardIcon />} 
                      onClick={() => { 
                        setComposeTo(''); 
                        setComposeSubject(''); 
                        setComposeBody(''); 
                        setSelectedConversation(null); 
                        setInlineCompose(true); 
                      }}
                    >
                      Start a New Chat
                    </Button>
                  </Box>
                )}
                <List>
                  {paged.map((message, index) => (
                    <React.Fragment key={message.id}>
                      <ListItem
                        secondaryAction={<Checkbox edge="end" onChange={() => toggleSelectOne(message.id)} checked={selectedIds.has(message.id)} />}
                        disablePadding
                        sx={{ alignItems: 'flex-start' }}
                      >
                        <ListItemButton
                          onClick={() => handleMessageClick(message.id)}
                          sx={{
                            bgcolor: !message.read ? 'action.hover' : 'transparent',
                            '&:hover': { bgcolor: 'action.selected' },
                            alignItems: 'flex-start'
                          }}
                        >
                          <ListItemAvatar>
                            <Badge color="error" variant="dot" invisible={message.unreadCount === 0}>
                              <Avatar src={message.sender.avatar || undefined} sx={{ bgcolor: 'primary.main' }}>
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
                <Pagination page={page} onChange={(_, p) => setPage(p)} count={totalPages} color="primary" />
              </Box>
            </CardContent>
          </Card>

          {/* Detail pane */}
          <Card sx={{ display: { xs: selectedConversation ? 'block' : 'none', lg: 'block' } }}>
            <CardContent sx={{ height: { md: 'calc(100vh - 140px)' }, display: 'flex', flexDirection: 'column' }}>
              {selectedConversation ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar src={(selectedConversation as any).carImage || selectedConversation.buyer?.avatar || undefined} sx={{ bgcolor: 'primary.main' }}>
                      {selectedConversation.buyer?.name.charAt(0) || '?'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">
                        {selectedConversation.buyer?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(selectedConversation as any).carTitle || selectedConversation.subject}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => handleArchive(selectedConversation.id, !selectedConversation.archived)}>
                      <ArchiveIcon />
                    </IconButton>
                  </Box>
                  {loadingThread && <LinearProgress />}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, flex: 1, overflowY: 'auto' }}>
                    {!loadingThread && thread.length === 0 && (
                      <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 3 }}>
                        <Typography variant="body2">No messages yet</Typography>
                      </Box>
                    )}
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
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
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
                          {replyTo.content}
                        </Typography>
                      </Box>
                    )}
                    {/* Reply box with in-field attach icon */}
                    <Box sx={{ position: 'relative', mb: 1.5 }}>
                      <TextField 
                        fullWidth 
                        multiline 
                        rows={3} 
                        placeholder={`Reply to ${selectedConversation.buyer?.name || 'buyer'}...`} 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && replyText.trim()) {
                            handleSendReply();
                          }
                        }}
                      />
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
                      <Button 
                        variant="contained" 
                        startIcon={<SendIcon />} 
                        onClick={handleSendReply} 
                        disabled={!replyText.trim() || sending}
                      >
                        {sending ? 'Sending...' : 'Send'}
                      </Button>
                    </Box>
                  </Box>
                </>
              ) : inlineCompose ? (
                <>
                  <Typography variant="h6" sx={{ mb: 2 }}>New Message</Typography>
                  <TextField fullWidth label="To (email or name)" value={composeTo} onChange={(e) => setComposeTo(e.target.value)} sx={{ mb: 2 }} />
                  <TextField fullWidth label="Subject" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} sx={{ mb: 2 }} />
                  <TextField fullWidth multiline rows={10} placeholder="Type your message..." value={composeBody} onChange={(e) => setComposeBody(e.target.value)} sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={() => setInlineCompose(false)}>Cancel</Button>
                    <Button variant="contained" startIcon={<SendIcon />} onClick={async () => {
                      try {
                        const created = await sellerApi.messages.startConversation({ to: composeTo, subject: composeSubject, content: composeBody });
                        if (created?.id) {
                          if (created.existed) {
                            toast.success('Existing conversation found. Opening it.');
                          } else {
                            toast.success('Message sent');
                          }
                          const conv: any = {
                            id: created.id,
                            subject: composeSubject || 'No Subject',
                            buyer: { id: created?.buyer_id || '', name: composeTo, avatar: '' },
                            lastMessage: {
                              id: `m-${Date.now()}`,
                              content: composeBody,
                              senderId: 'me',
                              isFromSeller: true,
                              timestamp: new Date().toISOString(),
                              read: true,
                            },
                            unreadCount: 0,
                            category: 'support',
                            priority: 'normal',
                            archived: false,
                            timestamp: new Date().toISOString(),
                          };
                          // If it existed, refresh and select to avoid duplicates
                          if (created.existed) {
                            await loadConversations();
                            const after = (prev => prev);
                            const found = conversations.find(c => c.id === created.id);
                            setSelectedConversation(found || conv);
                          } else {
                            setConversations((prev) => [conv, ...prev]);
                            setSelectedConversation(conv);
                          }
                        } else {
                          await loadConversations();
                        }
                        setInlineCompose(false);
                      } catch {
                        toast.error('Failed to send message');
                      }
                    }}>
                      Send
                    </Button>
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
      {/* Compose Dialog */}
      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="To (email or name)" value={composeTo} onChange={(e) => setComposeTo(e.target.value)} sx={{ mb: 2, mt: 1 }} />
          <TextField fullWidth label="Subject" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth multiline rows={8} placeholder="Type your message..." value={composeBody} onChange={(e) => setComposeBody(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SendIcon />} onClick={async () => {
            try {
              const created = await sellerApi.messages.startConversation({ to: composeTo, subject: composeSubject, content: composeBody });
              if (created?.id) {
                if (created.existed) {
                  toast.success('Existing conversation found. Opening it.');
                } else {
                  toast.success('Message sent');
                }
                const conv: any = {
                  id: created.id,
                  subject: composeSubject || 'No Subject',
                  buyer: { id: created?.buyer_id || '', name: composeTo, avatar: '' },
                  lastMessage: {
                    id: `m-${Date.now()}`,
                    content: composeBody,
                    senderId: 'me',
                    isFromSeller: true,
                    timestamp: new Date().toISOString(),
                    read: true,
                  },
                  unreadCount: 0,
                  category: 'support',
                  priority: 'normal',
                  archived: false,
                  timestamp: new Date().toISOString(),
                };
                if (created.existed) {
                  await loadConversations();
                  const found = conversations.find(c => c.id === created.id);
                  setSelectedConversation(found || conv);
                } else {
                  setConversations((prev) => [conv, ...prev]);
                  setSelectedConversation(conv);
                }
              } else {
                await loadConversations();
              }
              setComposeOpen(false);
              setInlineCompose(false);
            } catch (err) {
              toast.error('Failed to send message');
            }
          }}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </SellerLayout>
  );
};

export default SellerMessages;
