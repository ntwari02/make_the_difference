import React from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Chip,
  Divider,
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon, Refresh as RefreshIcon, Bolt as BoltIcon } from '@mui/icons-material';
import BuyerLayout from '../components/layout/BuyerLayout';
import aiChatApi from '../services/aiChatApi';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

const BuyerAIChat: React.FC = () => {
  const [sessionId, setSessionId] = React.useState<string | undefined>(undefined);
  const [draft, setDraft] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { id: 'm0', role: 'assistant', text: 'Hi! I can help you find the perfect car. Ask me anything 🚗', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [loading, setLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  const normalizeSuggestions = (raw: any): string[] => {
    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr
      .map((s) => {
        if (typeof s === 'string') return s;
        if (s && typeof s === 'object') {
          return s.title || s.text || s.description || s.action || '';
        }
        return '';
      })
      .filter((x) => typeof x === 'string' && x.trim().length > 0);
  };

  const loadSuggestions = React.useCallback(async () => {
    try {
      const data = await aiChatApi.getSuggestions();
      const normalized = normalizeSuggestions(data?.suggestions ?? data);
      setSuggestions(normalized);
    } catch (e) {
      setSuggestions(['Show me electric cars under $30k', 'What are the best SUVs for families?', 'Compare Tesla Model 3 vs Toyota Camry']);
    }
  }, []);

  React.useEffect(() => { loadSuggestions(); }, [loadSuggestions]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? draft).trim();
    if (!content) return;
    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: 'user', text: content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((m) => [...m, userMsg]);
    setDraft('');
    setLoading(true);
    try {
      const res = await aiChatApi.sendMessage({ message: content, sessionId });
      setSessionId(res.sessionId || sessionId);
      const botMsg: ChatMessage = { id: `${Date.now()}-a`, role: 'assistant', text: res.response || '...', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages((m) => [...m, botMsg]);
      if (res.suggestions) {
        const normalized = normalizeSuggestions(res.suggestions);
        if (normalized.length) setSuggestions(normalized);
      }
    } catch (e) {
      const botMsg: ChatMessage = { id: `${Date.now()}-e`, role: 'assistant', text: 'Sorry, I ran into an issue. Please try again.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages((m) => [...m, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BuyerLayout>
      <Box>
        <Box sx={{ mb: 3, p: 3, borderRadius: 2, background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h4" fontWeight={800}>AI Car Assistant</Typography>
          <Typography variant="body2" color="text.secondary">Chat with our AI to discover vehicles, compare models, and get recommendations</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: { md: 'calc(100vh - 260px)' } }}>
              <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
                {messages.map((m) => (
                  <Box key={m.id} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', mb: 1.5 }}>
                    {m.role === 'assistant' && <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}><BotIcon fontSize="small" /></Avatar>}
                    <Box sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: m.role === 'user' ? 'primary.main' : (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', color: m.role === 'user' ? '#fff' : 'text.primary', maxWidth: '75%' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{m.text}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>{m.time}</Typography>
                    </Box>
                    {m.role === 'user' && <Avatar sx={{ ml: 1 }}>U</Avatar>}
                  </Box>
                ))}
                {loading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption">Thinking…</Typography>
                  </Box>
                )}
              </CardContent>
              <Divider />
              <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" placeholder="Ask about cars, comparisons, prices…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
                <IconButton color="primary" onClick={() => sendMessage()} disabled={loading}>
                  <SendIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>Suggestions</Typography>
                  <IconButton size="small" onClick={loadSuggestions}><RefreshIcon /></IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {suggestions.map((s, i) => (
                    <Chip key={i} label={s} onClick={() => sendMessage(s)} icon={<BoltIcon />} clickable />
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>What I can do</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Find deals" />
                  <Chip label="Compare models" />
                  <Chip label="Explain specs" />
                  <Chip label="Estimate price" />
                  <Chip label="Suggest alternatives" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </BuyerLayout>
  );
};

export default BuyerAIChat;


