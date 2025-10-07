import React from 'react';
import { Fab, Drawer, Box, Typography, TextField, Button, Stack, Tooltip } from '@mui/material';
import { SmartToy as AIIcon, Close as CloseIcon } from '@mui/icons-material';

const VisaAIFab: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');
  const [messages, setMessages] = React.useState<Array<{role: 'user'|'ai'; text: string}>>([
    { role: 'ai', text: 'Hi! I can help with visa questions. Try: "What documents are needed for a student visa?"' }
  ]);

  const send = () => {
    if (!prompt.trim()) return;
    setMessages((m) => [...m, { role: 'user', text: prompt }, { role: 'ai', text: 'Thanks! I will get back to you with guidance (mock response).' }]);
    setPrompt('');
  };

  return (
    <>
      <Tooltip title="AI Assistant" placement="left">
        <Fab color="primary" onClick={() => setOpen(true)} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
          <AIIcon />
        </Fab>
      </Tooltip>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: { xs: 320, sm: 380 }, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6">AI Assistant</Typography>
            <Button onClick={() => setOpen(false)} size="small" startIcon={<CloseIcon />}>Close</Button>
          </Box>
          <Stack spacing={1} sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
            {messages.map((m, i) => (
              <Box key={i} sx={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', bgcolor: m.role === 'user' ? 'primary.main' : 'background.paper', color: m.role === 'user' ? 'primary.contrastText' : 'text.primary', p: 1.2, borderRadius: 2, maxWidth: '85%' }}>
                <Typography variant="body2">{m.text}</Typography>
              </Box>
            ))}
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField fullWidth size="small" placeholder="Ask something..." value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
            <Button variant="contained" onClick={send}>Send</Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default VisaAIFab;


