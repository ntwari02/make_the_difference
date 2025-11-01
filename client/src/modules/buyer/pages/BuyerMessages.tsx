import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { Tabs, Tab } from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  AttachFile as AttachIcon,
  ForwardToInbox as ForwardIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import { buyerMessagesApi } from '../services/messagesApi';
import toast from 'react-hot-toast';
import { LinearProgress } from '@mui/material';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import { alpha } from '@mui/material/styles';

// Conversation in list view
interface ConversationListItem {
  id: string;
  subject: string;
  dealer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    isFromBuyer: boolean;
    timestamp: string;
    read: boolean;
  };
  unreadCount: number;
  category: string;
  priority: string;
  archived: boolean;
  timestamp: string;
  read: boolean;
  hasBuyerMessages?: boolean; // Flag indicating buyer has sent at least one message
}

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    type: 'buyer' | 'seller' | 'admin';
  };
  content: string;
  messageType?: string;
  fileUrl?: string;
  read: boolean;
  category: string;
  priority: string;
  timestamp: string;
  replyTo?: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
      avatar?: string;
      type: 'buyer' | 'seller' | 'admin';
    };
  };
}

const BuyerMessages: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationListItem | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<{ [key: string]: string }>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>(
    { open: false, message: '', severity: 'success' }
  );
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  
  // Compose dialog
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [inlineCompose, setInlineCompose] = useState(false);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  
  // Ref for scrollable message container
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Tabs and filters
  const [tabValue, setTabValue] = useState<number>(() => {
    const saved = localStorage.getItem('buyer:msgTab');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [filterUnread, setFilterUnread] = useState(false);
  const [starredIds, setStarredIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('buyer:starredConversations');
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch { return new Set<string>(); }
  });

  // Persist tab value
  useEffect(() => {
    try { localStorage.setItem('buyer:msgTab', String(tabValue)); } catch {}
  }, [tabValue]);
  useEffect(() => {
    try { localStorage.setItem('buyer:starredConversations', JSON.stringify(Array.from(starredIds))); } catch {}
  }, [starredIds]);

  // Load conversations list
  const loadConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const result = await buyerMessagesApi.getConversations({
        page,
        limit: rowsPerPage,
        search: searchTerm || undefined,
      });
      
      const conversationsData = result.conversations || [];
      const mapped: ConversationListItem[] = conversationsData.map((c: any) => ({
        id: c.id,
        subject: c.subject || 'Conversation',
        dealer: {
          id: c.dealer_id || c.seller_id || '',
          name: c.dealer_name || c.seller_name || 'Dealer',
          avatar: c.dealer_avatar || c.seller_avatar || '',
        },
        lastMessage: c.lastMessage ? {
          id: c.lastMessage.id || c.lastMessage_id || '',
          content: c.lastMessage.content || c.last_message_content || '',
          senderId: c.lastMessage.sender_id || c.last_message_sender_id || '',
          isFromBuyer: c.lastMessage.isFromBuyer !== undefined ? c.lastMessage.isFromBuyer : (c.lastMessage.sender_id === user?.id),
          timestamp: c.lastMessage.timestamp || c.last_message_timestamp || c.last_message_at || new Date().toISOString(),
          read: c.lastMessage.read !== undefined ? c.lastMessage.read : (c.last_message_read !== undefined ? !!c.last_message_read : true),
        } : undefined,
        unreadCount: c.unreadCount || c.unread_count || 0,
        category: c.category || 'inquiry',
        priority: c.priority || 'normal',
        archived: c.archived || false,
        timestamp: c.timestamp || c.lastMessage?.timestamp || c.last_message_at || c.created_at || new Date().toISOString(),
        read: c.read !== undefined ? c.read : true,
        hasBuyerMessages: c.hasBuyerMessages !== undefined ? c.hasBuyerMessages : (c.lastMessage?.isFromBuyer || false),
      }));
      
      setConversations(mapped);
      setTotalPages(result.pagination?.totalPages || 1);
      
      // Auto-select first conversation if none selected
      if (!selectedConversation && mapped.length > 0) {
        setSelectedConversation(mapped[0]);
      }
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
      toast.error(error?.response?.data?.message || 'Failed to load conversations');
      setConversations([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  // Real-time polling: Refresh conversations list every 3 seconds
  useEffect(() => {
    const onFocus = () => { loadConversations(); };
    window.addEventListener('focus', onFocus);
    const interval = setInterval(() => { 
      loadConversations(true); // silent=true to avoid loading flicker during polling
    }, 3000); // Poll every 3 seconds for real-time updates
    return () => { window.removeEventListener('focus', onFocus); clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  // Load conversation thread when a conversation is selected
  useEffect(() => {
    if (selectedConversation?.id) {
      loadThread(selectedConversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id]);

  // Real-time polling: Refresh thread messages every 2 seconds when a conversation is selected
  useEffect(() => {
    if (!selectedConversation?.id) return;
    
    const interval = setInterval(() => {
      loadThread(selectedConversation.id, true); // silent=true to avoid loading flicker
    }, 2000); // Poll thread every 2 seconds for real-time updates
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  };

  // Auto-scroll to bottom when thread changes
  useEffect(() => {
    if (thread.length > 0 && !loadingThread) {
      // Delay to ensure DOM has rendered
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread, loadingThread]);

  const loadThread = async (conversationId: string, silent = false) => {
    try {
      if (!silent) setLoadingThread(true);
      const result = await buyerMessagesApi.getThread(conversationId);
      const messagesData = result.messages || [];
      
      const mapped: Message[] = messagesData.map((m: any) => ({
        id: m.id,
        sender: {
          id: m.sender?.id || m.sender_id || '',
          name: m.sender?.name || 'Unknown',
          avatar: m.sender?.avatar || '',
          type: m.sender?.type || (m.sender_id === user?.id ? 'buyer' : 'seller'),
        },
        content: m.content || '',
        messageType: m.messageType || m.message_type || 'text',
        fileUrl: m.fileUrl || m.file_url || null,
        read: m.read !== false,
        category: m.category || 'inquiry',
        priority: m.priority || 'normal',
        timestamp: m.timestamp || m.created_at || new Date().toISOString(),
        replyTo: m.replyTo || m.reply_to || m.parentMessage ? {
          id: m.replyTo?.id || m.reply_to?.id || m.parentMessage?.id || '',
          content: m.replyTo?.content || m.reply_to?.content || m.parentMessage?.content || '',
          sender: {
            id: m.replyTo?.sender?.id || m.reply_to?.sender_id || m.parentMessage?.sender_id || '',
            name: m.replyTo?.sender?.name || m.reply_to?.sender_name || m.parentMessage?.sender_name || 'Unknown',
            avatar: m.replyTo?.sender?.avatar || m.reply_to?.sender_avatar || m.parentMessage?.sender_avatar || '',
            type: (m.replyTo?.sender?.id || m.reply_to?.sender_id || m.parentMessage?.sender_id) === user?.id ? 'buyer' : 'seller' as 'buyer' | 'seller' | 'admin',
          }
        } : undefined
      }));
      
      setThread(mapped);
      
      // Reload conversations to update unread counts
      await loadConversations();
    } catch (error: any) {
      console.error('Failed to load thread:', error);
      toast.error(error?.response?.data?.message || 'Failed to load conversation');
      setThread([]);
    } finally {
      if (!silent) setLoadingThread(false);
    }
  };

  // Convert conversations to messages format for display
  const messagesForList = conversations.map(conv => ({
    id: conv.id,
    sender: {
      name: conv.dealer?.name || 'Dealer',
      avatar: conv.dealer?.avatar || '',
      type: 'seller' as 'buyer' | 'seller' | 'admin'
    },
    subject: conv.subject,
    message: conv.lastMessage?.content || '',
    timestamp: conv.lastMessage?.timestamp || conv.timestamp,
    read: conv.lastMessage?.read ?? true,
    priority: (conv.priority || 'normal') as 'low' | 'normal' | 'high',
    category: (conv.category || 'inquiry') as 'inquiry' | 'offer' | 'complaint' | 'support',
    unreadCount: conv.unreadCount
  }));

  const handleMessageClick = async (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setSelectedConversation(conv);
    }
  };

  const handleSendReply = async () => {
    if (!selectedConversation || (!replyText.trim() && attachments.length === 0)) return;
    
    try {
      setSending(true);
      
      // Upload attachments first if any
      let fileUrls: string[] = [];
      if (attachments.length > 0) {
        try {
          fileUrls = await buyerMessagesApi.uploadAttachments(selectedConversation.id, attachments);
          if (fileUrls.length === 0 && attachments.length > 0) {
            toast.error('Failed to upload attachments');
            return;
          }
        } catch (uploadError: any) {
          console.error('Failed to upload attachments:', uploadError);
          toast.error(uploadError?.response?.data?.message || 'Failed to upload attachments');
          return;
        }
      }
      
      // Send message with file URLs (if multiple files, use first one or comma-separated)
      const fileUrl = fileUrls.length > 0 ? (fileUrls.length === 1 ? fileUrls[0] : fileUrls.join(',')) : undefined;
      
      // If only attachments (no text), use a default message
      const messageContent = replyText.trim() || (fileUrl ? 'Sent attachment(s)' : '');
      
      if (!messageContent) {
        toast.error('Please enter a message or attach a file');
        setSending(false);
        return;
      }
      
      const sentMessage = await buyerMessagesApi.sendMessage(selectedConversation.id, {
        content: messageContent,
        category: 'inquiry',
        priority: 'normal',
        parentMessageId: replyTo?.id, // Include parent message ID if replying
        fileUrl: fileUrl // Include file URL(s)
      });
      
      // Add to thread optimistically
      const newMessage: Message = {
        id: sentMessage.id || `m-${Date.now()}`,
        sender: {
          id: user?.id || '',
          name: 'You',
          avatar: (user as any)?.profile_image || (user as any)?.avatar || '',
          type: 'buyer'
        },
        content: sentMessage.content || messageContent || replyText.trim(),
        messageType: sentMessage.messageType || 'text',
        fileUrl: sentMessage.fileUrl || fileUrl || null,
        read: true,
        category: sentMessage.category || 'inquiry',
        priority: sentMessage.priority || 'normal',
        timestamp: sentMessage.timestamp || new Date().toISOString(),
        replyTo: replyTo ? {
          id: replyTo.id,
          content: replyTo.content,
          sender: replyTo.sender
        } : undefined
      };
      
      setThread((prev) => [...prev, newMessage]);
      setReplyText('');
      // Clean up object URLs before clearing attachments
      Object.values(attachmentPreviews).forEach(url => {
        URL.revokeObjectURL(url);
      });
      setAttachmentPreviews({});
      setAttachments([]);
      setReplyTo(null);
      
      // Scroll to bottom after adding new message
      setTimeout(() => {
        scrollToBottom();
      }, 50);
      
      // Reload conversations to update last message
      await loadConversations();
      
      toast.success('Message sent successfully');
    } catch (error: any) {
      console.error('Failed to send reply:', error);
      toast.error(error?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }
    
    const newFiles = Array.from(files);
    console.log('Files selected:', newFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    // Create object URLs for image files
    const newPreviews: { [key: string]: string } = {};
    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newPreviews[file.name] = url;
        console.log('Created preview URL for:', file.name, url);
      }
    });
    
    setAttachments((prev) => {
      const updated = [...prev, ...newFiles];
      console.log('Updated attachments:', updated.length, updated.map(f => f.name));
      return updated;
    });
    setAttachmentPreviews((prev) => {
      const updated = { ...prev, ...newPreviews };
      console.log('Updated preview URLs:', Object.keys(updated));
      return updated;
    });
    e.target.value = '';
  };

  const removeAttachment = (fileName: string) => {
    setAttachments((prev) => prev.filter((f) => f.name !== fileName));
    // Clean up object URL if it exists
    setAttachmentPreviews((prev) => {
      if (prev[fileName]) {
        URL.revokeObjectURL(prev[fileName]);
      }
      const newPreviews = { ...prev };
      delete newPreviews[fileName];
      return newPreviews;
    });
  };
  
  // Clean up all object URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(attachmentPreviews).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const paged = useMemo(() => {
    let list = messagesForList;
    // Apply tabs
    if (tabValue === 1) {
      // Sent: where buyer has sent at least one message
      list = list.filter((c: any) => {
        // Check if buyer has sent messages (preferred check)
        if (c.hasBuyerMessages !== undefined) {
          return c.hasBuyerMessages;
        }
        // Fallback: check if last message is from buyer
        return c.lastMessage ? c.lastMessage.isFromBuyer : false;
      });
    } else if (tabValue === 2) {
      // Starred
      list = list.filter((c: any) => starredIds.has(c.id));
    }
    if (filterUnread) {
      list = list.filter((c: any) => (c.unreadCount || 0) > 0);
    }
    return list;
  }, [messagesForList, tabValue, filterUnread, starredIds]);

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

  // Delete conversation handler
  const handleDeleteConversation = (conversationId: string) => {
    setDeleteTargetId(conversationId);
    setDeleteTargetIds([]);
    setIsBulkDelete(false);
    setDeleteDialogOpen(true);
  };

  // Bulk delete handler
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setDeleteTargetId(null);
    setDeleteTargetIds(Array.from(selectedIds));
    setIsBulkDelete(true);
    setDeleteDialogOpen(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    try {
      if (isBulkDelete && deleteTargetIds.length > 0) {
        // Bulk delete
        await Promise.all(deleteTargetIds.map(id => buyerMessagesApi.deleteConversation(id)));
        toast.success(`${deleteTargetIds.length} conversation(s) deleted`);
        setSelectedIds(new Set());
        // Optimistically remove from UI
        setConversations((prev) => prev.filter((c) => !deleteTargetIds.includes(c.id)));
        // Clear selection if deleted conversation was selected
        if (selectedConversation && deleteTargetIds.includes(selectedConversation.id)) {
          setSelectedConversation(null);
          setThread([]);
        }
      } else if (deleteTargetId) {
        // Single delete
        await buyerMessagesApi.deleteConversation(deleteTargetId);
        toast.success('Conversation deleted');
        // Optimistically remove from UI
        setConversations((prev) => prev.filter((c) => c.id !== deleteTargetId));
        // Clear selection if deleted conversation was selected
        if (selectedConversation && selectedConversation.id === deleteTargetId) {
          setSelectedConversation(null);
          setThread([]);
        }
      }
      // Reload conversations to sync with backend
      await loadConversations();
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
      setDeleteTargetIds([]);
    } catch (error: any) {
      console.error('Failed to delete conversation:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete conversation');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Two-pane layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 1.4fr' }, gap: 2 }}>
          {/* Messages list with toolbar */}
          <Card>
            <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: { md: 'calc(100vh - 140px)' } }}>
              <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
                <Checkbox
                  indeterminate={selectedIds.size > 0 && selectedIds.size < paged.length}
                  checked={paged.length > 0 && selectedIds.size === paged.length}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
                {!searchOpen ? (
                  <Tooltip title="Search">
                    <IconButton onClick={() => setSearchOpen(true)}>
                      <SearchIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <TextField 
                    size="small" 
                    placeholder="Search conversations" 
                    value={searchTerm} 
                    autoFocus
                    onBlur={() => { if (!searchTerm) setSearchOpen(false); }}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} 
                    InputProps={{ 
                      startAdornment: <SearchIcon sx={{ mx: 1, color: 'text.secondary' }} />, 
                      endAdornment: (
                        <IconButton size="small" onClick={() => { setSearchTerm(''); setSearchOpen(false); }}><CloseIcon fontSize="small" /></IconButton>
                      )
                    }} 
                    sx={{ 
                      flex: '0 0 auto',
                      width: { xs: 240, sm: 320, md: 360 },
                      mr: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 999,
                        bgcolor: (t) => t.palette.mode === 'dark' ? 'background.default' : '#f3f6fb',
                      }
                    }} 
                  />
                )}
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36 } }}>
                  <Tab label="Inbox" />
                  <Tab label="Sent" />
                  <Tab label="Starred" />
                </Tabs>
                <Chip label="Unread" color={filterUnread ? 'primary' : 'default'} variant={filterUnread ? 'filled' : 'outlined'} size="small" onClick={() => setFilterUnread(!filterUnread)} />
                <Tooltip title="Mark as read"><span><IconButton disabled={selectedIds.size === 0} onClick={async () => {
                  // Mark as read functionality can be added later
                  toast('Mark as read functionality coming soon');
                }}><MarkReadIcon /></IconButton></span></Tooltip>
                <Tooltip title="Delete"><span><IconButton disabled={selectedIds.size === 0} onClick={handleBulkDelete} color="error"><DeleteIcon /></IconButton></span></Tooltip>
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
                                {starredIds.has(message.id) ? <Chip label="★" size="small" color="warning" /> : null}
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
                          <Tooltip title={starredIds.has(message.id) ? 'Unstar' : 'Star'}>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setStarredIds((prev) => { const next = new Set(prev); if (next.has(message.id)) next.delete(message.id); else next.add(message.id); return next; }); }}>
                              {starredIds.has(message.id) ? <StarIcon color="warning" /> : <StarBorderIcon />}
                            </IconButton>
                          </Tooltip>
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
                    <Avatar src={selectedConversation.dealer?.avatar || undefined} sx={{ bgcolor: 'primary.main' }}>
                      {selectedConversation.dealer?.name.charAt(0) || '?'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">
                        {selectedConversation.dealer?.name || 'Dealer'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedConversation.subject}
                      </Typography>
                    </Box>
                    <Tooltip title="Delete conversation">
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDeleteConversation(selectedConversation.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {loadingThread && <LinearProgress />}
                  <Paper 
                    ref={messagesContainerRef}
                    variant="outlined" 
                    sx={{ p: 2, mb: 2, flex: 1, overflowY: 'auto' }}
                  >
                    {!loadingThread && thread.length === 0 && (
                      <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 3 }}>
                        <Typography variant="body2">No messages yet</Typography>
                      </Box>
                    )}
                    {thread.map((msg) => (
                      <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.sender.type === 'buyer' ? 'flex-end' : 'flex-start', mb: 1.5, px: { xs: 0.5, sm: 0 } }}>
                        <Box sx={{ maxWidth: { xs: '92%', sm: '80%' }, position: 'relative', '&:hover .msg-actions': { opacity: msg.sender.type !== 'buyer' ? 1 : 0 } }}>
                          <Paper sx={{ 
                            p: 1, 
                            position: 'relative',
                            bgcolor: (t) => {
                              // Buyer messages (sent): Gray
                              // Seller/Dealer messages (received): System blue (from dark mode)
                              if (msg.sender.type === 'buyer') {
                                return t.palette.mode === 'light' ? '#f5f5f5' : '#424242'; // Light gray / Dark gray
                              }
                              return t.palette.mode === 'light' ? '#e3f2fd' : '#64b5f6'; // Light blue / Dark mode blue
                            }
                          }}>
                            {msg.replyTo && (
                              <Box sx={{ 
                                mb: 1, 
                                pb: 1, 
                                borderLeft: 2, 
                                borderColor: 'primary.main',
                                pl: 1,
                                bgcolor: (t) => alpha(t.palette.primary.main, 0.05)
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <ReplyIcon fontSize="small" sx={{ fontSize: 14, color: 'primary.main' }} />
                                  <Typography variant="caption" color="primary.main" fontWeight={600}>
                                    {msg.replyTo.sender.name}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  fontSize: '0.75rem',
                                  lineHeight: 1.3
                                }}>
                                  {msg.replyTo.content}
                                </Typography>
                              </Box>
                            )}
                            {msg.fileUrl && (
                              <Box sx={{ mb: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {msg.fileUrl.split(',').map((url, idx) => {
                                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                                  const attachmentUrl = getImageUrl(url); // Use shared utility for deployment support
                                  return (
                                    <Box key={idx} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                      {isImage ? (
                                        <Box
                                          component="img"
                                          src={attachmentUrl}
                                          alt={`Attachment ${idx + 1}`}
                                          sx={{
                                            maxWidth: '200px',
                                            maxHeight: '200px',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            '&:hover': { opacity: 0.8 }
                                          }}
                                          onClick={() => window.open(attachmentUrl, '_blank')}
                                        />
                                      ) : (
                                        <Chip
                                          icon={<AttachIcon />}
                                          label={url.split('/').pop() || `File ${idx + 1}`}
                                          onClick={() => window.open(attachmentUrl, '_blank')}
                                          sx={{ cursor: 'pointer' }}
                                        />
                                      )}
                                    </Box>
                                  );
                                })}
                              </Box>
                            )}
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', pr: msg.sender.type !== 'buyer' ? 4 : 1 }}>{msg.content}</Typography>
                            {msg.sender.type !== 'buyer' && (
                              <Tooltip title="Reply">
                                <IconButton
                                  size="small"
                                  className="msg-actions"
                                  onClick={() => {
                                    setReplyTo(msg);
                                    // Scroll to reply input after a short delay
                                    setTimeout(() => {
                                      const replyInput = document.querySelector('textarea[placeholder*="Reply"]') as HTMLTextAreaElement;
                                      if (replyInput) {
                                        replyInput.focus();
                                      }
                                    }, 100);
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    bgcolor: 'background.paper',
                                    '&:hover': {
                                      bgcolor: 'action.hover',
                                    }
                                  }}
                                >
                                  <ReplyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Paper>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, justifyContent: msg.sender.type === 'buyer' ? 'flex-end' : 'flex-start' }}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </Typography>
                            {msg.sender.type !== 'buyer' && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                • {msg.sender.name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                    {/* Invisible element at bottom for scroll target */}
                    <div ref={messagesEndRef} style={{ height: 1 }} />
                  </Paper>
                  <Box>
                    {replyTo && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip size="small" label={`Replying to ${replyTo.sender.name}`} onDelete={() => setReplyTo(null)} />
                        <Typography variant="caption" color="text.secondary" noWrap maxWidth={240}>
                          {replyTo.content}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ position: 'relative', mb: 1.5 }}>
                      <TextField 
                        fullWidth 
                        multiline 
                        rows={3} 
                        placeholder={`Reply to ${selectedConversation.dealer?.name || 'dealer'}...`} 
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
                    {/* File Previews */}
                    {attachments.length > 0 && (
                      <Box 
                        sx={{ 
                          mb: 1.5, 
                          p: 1.5, 
                          bgcolor: 'background.paper', 
                          border: 2, 
                          borderColor: 'primary.main', 
                          borderRadius: 1,
                          minHeight: 80
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                          Attachments ({attachments.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {attachments.map((file, idx) => {
                            const isImage = file.type.startsWith('image/');
                            const objectUrl = isImage ? attachmentPreviews[file.name] : null;
                            
                            console.log(`Rendering file ${idx}:`, file.name, 'isImage:', isImage, 'hasPreview:', !!objectUrl);
                            
                            return (
                              <Box
                                key={`${file.name}-${idx}`}
                                sx={{
                                  position: 'relative',
                                  border: 2,
                                  borderColor: 'primary.main',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  bgcolor: 'background.default',
                                  minWidth: 120,
                                }}
                              >
                                {isImage && objectUrl ? (
                                  <Box
                                    sx={{
                                      width: 120,
                                      height: 120,
                                      position: 'relative',
                                      cursor: 'pointer',
                                      '&:hover': { opacity: 0.8 }
                                    }}
                                    onClick={() => {
                                      const previewWindow = window.open('', '_blank');
                                      if (previewWindow) {
                                        previewWindow.document.write(`
                                          <html>
                                            <head><title>Preview: ${file.name}</title></head>
                                            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000">
                                              <img src="${objectUrl}" style="max-width:100%;max-height:100vh;object-fit:contain" />
                                            </body>
                                          </html>
                                        `);
                                      }
                                    }}
                                  >
                                    <Box
                                      component="img"
                                      src={objectUrl}
                                      alt={file.name}
                                      sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block',
                                      }}
                                      onError={(e) => {
                                        console.error('Failed to load image preview:', file.name, e);
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        bgcolor: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        px: 0.5,
                                        py: 0.25,
                                      }}
                                    >
                                      <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem' }}>
                                        {file.name}
                                      </Typography>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box sx={{ p: 1, minWidth: 120 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <AttachIcon fontSize="small" color="action" />
                                      <Typography variant="caption" noWrap sx={{ flex: 1, fontSize: '0.75rem' }}>
                                        {file.name}
                                      </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      {(file.size / 1024).toFixed(2)} KB
                                    </Typography>
                                  </Box>
                                )}
                                <IconButton
                                  size="small"
                                  onClick={() => removeAttachment(file.name)}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: 'rgba(255,255,255,0.95)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                                    width: 24,
                                    height: 24,
                                    zIndex: 1,
                                  }}
                                >
                                  <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button variant="outlined" onClick={() => setSelectedConversation(null)}>Close</Button>
                      <Button 
                        variant="contained" 
                        startIcon={<SendIcon />} 
                        onClick={handleSendReply} 
                        disabled={(!replyText.trim() && attachments.length === 0) || sending}
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
                        toast.success('Message functionality coming soon');
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
              toast.success('Message functionality coming soon');
              setComposeOpen(false);
            } catch (err) {
              toast.error('Failed to send message');
            }
          }}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Conversation{isBulkDelete ? 's' : ''}?</DialogTitle>
        <DialogContent>
          <Typography>
            {isBulkDelete 
              ? `Are you sure you want to delete ${deleteTargetIds.length} conversation(s)? This action cannot be undone.`
              : 'Are you sure you want to delete this conversation? This action cannot be undone.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={confirmDelete}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerMessages;