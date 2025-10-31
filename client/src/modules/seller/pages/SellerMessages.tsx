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
import { Tabs, Tab } from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Close as CloseIcon,
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
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import SellerLayout from '../components/layout/SellerLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { sellerApi } from '../services/sellerApi';
import { getAllConversations, saveConversations, saveThread, getThread, upsertConversation, removeConversation } from '../services/messagesDb';
import toast from 'react-hot-toast';
import { LinearProgress } from '@mui/material';
import { getImageUrl } from '../../shared/utils/imageUtils';
import { alpha } from '@mui/material/styles';

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
  
  const [filter, setFilter] = useState<'inbox' | 'sent' | 'archived' | 'all'>(() => {
    const saved = localStorage.getItem('seller:msgFolder');
    return (saved === 'inbox' || saved === 'archived' || saved === 'sent' || saved === 'all') ? (saved as any) : 'all';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTimer, setSearchTimer] = useState<any>(null);
  const [firstLoaded, setFirstLoaded] = useState(false);
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

  // Buyer-style controls
  const [tabValue, setTabValue] = useState<number>(() => {
    const saved = localStorage.getItem('seller:msgTab');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [filterUnread, setFilterUnread] = useState(false);
  const [starredIds, setStarredIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('seller:starredConversations');
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch { return new Set<string>(); }
  });

  // Helpers to persist minimal conversations across sessions
  const cacheKey = 'seller:cachedConversations';
  const cacheFullKey = 'seller:cachedConversationsFull';
  const readCachedConversations = (): any[] => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  };
  const readCachedConversationsFull = (): any[] => {
    try {
      const raw = localStorage.getItem(cacheFullKey);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  };
  const writeCachedConversation = (c: any) => {
    try {
      const list = readCachedConversations().filter((x) => x.id !== c.id);
      list.unshift(c);
      localStorage.setItem(cacheKey, JSON.stringify(list.slice(0, 20)));
    } catch {}
  };
  const writeCachedConversationsFull = (list: any[]) => {
    try { localStorage.setItem(cacheFullKey, JSON.stringify(list.slice(0, 50))); } catch {}
  };

  // Persist last-used folder
  useEffect(() => {
    try { localStorage.setItem('seller:msgFolder', filter); } catch {}
  }, [filter]);
  useEffect(() => {
    try { localStorage.setItem('seller:msgTab', String(tabValue)); } catch {}
  }, [tabValue]);
  useEffect(() => {
    try { localStorage.setItem('seller:starredConversations', JSON.stringify(Array.from(starredIds))); } catch {}
  }, [starredIds]);

  // On first mount, optimistically populate from cache so the list is not empty after login
  useEffect(() => {
    // Prefer IndexedDB (persistent) if available
    (async () => {
      try {
        const persisted = await getAllConversations();
        if (Array.isArray(persisted) && persisted.length > 0 && conversations.length === 0) {
          setConversations(persisted as any);
          setSelectedConversation(persisted[0] as any);
        }
      } catch {}
    })();
    // Prefer full cached list first
    const full = readCachedConversationsFull();
    if (full.length > 0 && conversations.length === 0) {
      setConversations(full as any);
      setSelectedConversation(full[0] as any);
      if (filter !== 'all') setFilter('all');
    }
    const cachedList = readCachedConversations();
    if (cachedList.length > 0 && conversations.length === 0) {
      const mapped: ConversationListItem[] = cachedList.map((head: any) => ({
        id: head.id,
        subject: head.subject || 'No Subject',
        buyer: { id: '', name: head.to || 'Unknown', avatar: '' },
        lastMessage: {
          id: `m-${Date.now()}`,
          content: head.body || '',
          senderId: 'me',
          isFromSeller: true,
          timestamp: head.timestamp || new Date().toISOString(),
          read: true,
        },
        unreadCount: 0,
        category: 'support',
        priority: 'normal',
        archived: false,
        timestamp: head.timestamp || new Date().toISOString(),
      } as any));
      setConversations(mapped);
      setSelectedConversation(mapped[0]);
      if (filter !== 'sent') setFilter('sent');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load conversations list
  const loadConversations = async () => {
    try {
      setLoading(true);
      const result = await sellerApi.messages.getConversations({
        page,
        limit: rowsPerPage,
        folder: firstLoaded ? filter : 'all',
        search: searchTerm || undefined,
        category: categoryFilter !== 'all' ? categoryFilter as any : undefined,
      });
      
      setConversations(result.conversations || []);
      setTotalPages(result.pagination?.totalPages || 1);
      if (Array.isArray(result.conversations) && result.conversations.length > 0) {
        // Persist a full copy to avoid empty UI on next login
        writeCachedConversationsFull(result.conversations);
        // Also persist permanently in IndexedDB
        try { await saveConversations(result.conversations); } catch {}
      }

      // Fallback: if nothing returned, try a broad fetch (folder=all, no search) to avoid empty UI
      if ((!result.conversations || result.conversations.length === 0)) {
        try {
          const broad = await sellerApi.messages.getConversations({ page: 1, limit: rowsPerPage, folder: 'all' });
          if (Array.isArray(broad.conversations) && broad.conversations.length > 0) {
            setConversations(broad.conversations);
            setTotalPages(broad.pagination?.totalPages || 1);
            writeCachedConversationsFull(broad.conversations);
            if (filter !== 'all') setFilter('all');
          }
        } catch {}
      }
      if (!firstLoaded) setFirstLoaded(true);

      // Fallback: if API returns empty, try to restore the most recent conversation from session storage
      if ((!result.conversations || result.conversations.length === 0) && !selectedConversation) {
        // Check persistent cache first (survives logout)
        const cachedList = readCachedConversations();
        if (cachedList.length > 0) {
          const mapped: ConversationListItem[] = cachedList.map((head: any) => ({
            id: head.id,
            subject: head.subject || 'No Subject',
            buyer: { id: '', name: head.to || 'Unknown', avatar: '' },
            lastMessage: {
              id: `m-${Date.now()}`,
              content: head.body || '',
              senderId: 'me',
              isFromSeller: true,
              timestamp: head.timestamp || new Date().toISOString(),
              read: true,
            },
            unreadCount: 0,
            category: 'support',
            priority: 'normal',
            archived: false,
            timestamp: head.timestamp || new Date().toISOString(),
          } as any));
          setConversations(mapped);
          setSelectedConversation(mapped[0]);
          setTotalPages(1);
          if (filter !== 'sent') setFilter('sent');
          return;
        }
        const cached = sessionStorage.getItem('seller:lastConversation');
        if (cached) {
          try {
            const data = JSON.parse(cached);
            const tempConv: ConversationListItem = {
              id: data.id,
              subject: data.subject || 'No Subject',
              buyer: { id: '', name: data.to || 'Unknown', avatar: '' },
              lastMessage: {
                id: `m-${Date.now()}`,
                content: data.body || '',
                senderId: 'me',
                isFromSeller: true,
                timestamp: data.timestamp || new Date().toISOString(),
                read: true,
              },
              unreadCount: 0,
              category: 'support',
              priority: 'normal',
              archived: false,
              timestamp: data.timestamp || new Date().toISOString(),
            } as any;
            setConversations([tempConv]);
            setSelectedConversation(tempConv);
            // Also switch to Sent to keep UX consistent
            if (filter !== 'sent') setFilter('sent');
          } catch {}
        }
      }
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

  // Lightweight realtime: refresh on window focus and every 12s
  useEffect(() => {
    const onFocus = () => { loadConversations(); };
    window.addEventListener('focus', onFocus);
    const interval = setInterval(() => { loadConversations(); }, 12000);
    return () => { window.removeEventListener('focus', onFocus); clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SSE live updates
  useEffect(() => {
    // Find token from common places
    const token = (localStorage.getItem('authToken') || localStorage.getItem('token') || '') as string;
    const base = (import.meta as any)?.env?.VITE_PUBLIC_API_BASE_URL || (import.meta as any)?.env?.VITE_API_BASE_URL || (import.meta as any)?.env?.VITE_API_URL || '';
    const apiBase = String(base || '').replace(/\/$/, '');
    if (!apiBase) return;
    const url = `${apiBase}/seller/messages/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    let es: EventSource | null = null;
    try {
      es = new EventSource(url, { withCredentials: false });
      const onAny = () => { loadConversations(); if (selectedConversation?.id) loadThread(selectedConversation.id); };
      es.addEventListener('message.new', onAny as any);
      es.addEventListener('conversation.updated', onAny as any);
      es.addEventListener('conversation.deleted', onAny as any);
      es.addEventListener('update', onAny as any);
      es.onerror = () => { /* silently ignore; polling still active */ };
    } catch {}
    return () => { try { es && es.close(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id]);

  // Debounced search - mirrors buyer UX
  useEffect(() => {
    if (searchTimer) clearTimeout(searchTimer);
    const t = setTimeout(() => {
      setPage(1);
      loadConversations();
    }, 350);
    setSearchTimer(t);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryFilter, filter]);

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
      try { await saveThread(conversationId, result.messages || []); } catch {}
      
      // Reload conversations to update unread counts
      await loadConversations();
    } catch (error: any) {
      console.error('Failed to load thread:', error);
      const status = error?.response?.status;
      // If conversation was deleted or no longer accessible, clear selection gracefully
      if (status === 400 || status === 404 || status === 401) {
        setThread([]);
        setSelectedConversation((prev) => {
          if (!prev || prev.id !== conversationId) return prev;
          return null;
        });
        // Remove from local list to keep UI consistent
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        try { await removeConversation(conversationId); } catch {}
        toast.info('Conversation is no longer available');
      } else {
        toast.error(error?.response?.data?.message || 'Failed to load conversation');
        setThread([]);
      }
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
      try {
        await upsertConversation({
          id: selectedConversation.id,
          subject: selectedConversation.subject,
          buyer: selectedConversation.buyer,
          lastMessage: {
            id: newMessage.id,
            content: newMessage.content,
            senderId: newMessage.sender.id,
            isFromSeller: true,
            timestamp: newMessage.timestamp,
            read: true,
          },
          unreadCount: 0,
          category: selectedConversation.category,
          priority: selectedConversation.priority,
          archived: selectedConversation.archived,
          timestamp: newMessage.timestamp,
        });
        await saveThread(selectedConversation.id, [...thread, newMessage]);
      } catch {}
      
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
      // Prefer single-message deletion to avoid removing entire chat
      if ((sellerApi as any).messages.deleteSingleMessage) {
        await sellerApi.messages.deleteSingleMessage(selectedConversation.id, messageId);
      } else {
        await sellerApi.messages.deleteMessages(selectedConversation.id, [messageId]);
      }
      let nextLength = 0;
      setThread((prev) => {
        const filtered = prev.filter((m) => m.id !== messageId);
        nextLength = filtered.length;
        return filtered;
      });
      toast.success('Message deleted');
      // If no messages remain, the backend may have deleted the conversation as well
      if (nextLength === 0 && selectedConversation) {
        setConversations((prev) => prev.filter((c) => c.id !== selectedConversation.id));
        setSelectedConversation(null);
        try { await removeConversation(selectedConversation.id); } catch {}
        return;
      }
      // Otherwise, try to refresh thread but ignore 400/404 gracefully
      try {
        await loadThread(selectedConversation.id);
        const msgs = await getThread(selectedConversation.id);
        if (msgs) await saveThread(selectedConversation.id, msgs);
      } catch {}
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

  const fallbackList = useMemo(() => {
    if (conversations.length === 0 && selectedConversation) {
      const conv = selectedConversation as any;
      return [{
        id: selectedConversation.id,
        sender: {
          name: selectedConversation.buyer?.name || 'Unknown',
          avatar: conv.carImage || selectedConversation.buyer?.avatar || '',
          type: (selectedConversation.buyer ? 'buyer' : 'admin') as 'buyer' | 'seller' | 'admin'
        },
        subject: conv.carTitle || selectedConversation.subject,
        message: selectedConversation.lastMessage?.content || '',
        timestamp: selectedConversation.lastMessage?.timestamp || selectedConversation.timestamp,
        read: selectedConversation.lastMessage?.read ?? true,
        priority: (selectedConversation.priority || 'normal') as 'low' | 'normal' | 'high',
        category: (selectedConversation.category || 'support') as 'inquiry' | 'offer' | 'complaint' | 'support',
        unreadCount: selectedConversation.unreadCount || 0,
      }];
    }
    return [] as any[];
  }, [conversations.length, selectedConversation]);

  const paged = useMemo(() => {
    let list = messagesForList.length > 0 ? messagesForList : fallbackList;
    // Apply buyer-like tabs
    if (tabValue === 1) {
      // Sent: where lastMessage is from seller, or we lack info – keep as is but filter by isFromSeller if present
      list = list.filter((c: any) => c.lastMessage ? c.lastMessage.isFromSeller : true);
    } else if (tabValue === 2) {
      // Starred
      list = list.filter((c: any) => starredIds.has(c.id));
    }
    if (filterUnread) {
      list = list.filter((c: any) => (c.unreadCount || 0) > 0);
    }
    return list;
  }, [messagesForList, fallbackList, tabValue, filterUnread, starredIds]);

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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 1.4fr' }, gap: 2 }}>
          {/* Messages list with buyer-like toolbar */}
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
                          <Paper sx={{ 
                            p: 1, 
                            bgcolor: (t) => {
                              const secondary = (t.palette as any).secondary?.main || t.palette.grey[500];
                              const lightBuyer = alpha(secondary, 0.12);
                              const darkBuyer = alpha(secondary, 0.18);
                              // Seller bubbles: neutral background; Buyer bubbles: tinted
                              if (msg.sender.type === 'seller') {
                                return 'background.paper';
                              }
                              return t.palette.mode === 'light' ? lightBuyer : darkBuyer;
                            }
                          }}>
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
                          // Persist last conversation so it survives reload
                          sessionStorage.setItem('seller:lastConversation', JSON.stringify({ id: created.id, to: composeTo, subject: composeSubject, body: composeBody, timestamp: new Date().toISOString() }));
                          writeCachedConversation({ id: created.id, to: composeTo, subject: composeSubject, body: composeBody, timestamp: new Date().toISOString() });
                          // Switch to Sent and refresh list so the new conversation appears
                          setFilter('sent');
                          await loadConversations();
                          let found = conversations.find(c => c.id === created.id);
                          if (!found) {
                            setConversations((prev) => [conv, ...prev]);
                            found = conv as any;
                          }
                          setSelectedConversation(found || conv);
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
                // Persist last conversation so it survives reload
                sessionStorage.setItem('seller:lastConversation', JSON.stringify({ id: created.id, to: composeTo, subject: composeSubject, body: composeBody, timestamp: new Date().toISOString() }));
                writeCachedConversation({ id: created.id, to: composeTo, subject: composeSubject, body: composeBody, timestamp: new Date().toISOString() });
                setFilter('sent');
                await loadConversations();
                let found = conversations.find(c => c.id === created.id);
                if (!found) {
                  setConversations((prev) => [conv, ...prev]);
                  found = conv as any;
                }
                setSelectedConversation(found || conv);
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
