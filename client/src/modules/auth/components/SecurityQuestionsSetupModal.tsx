import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

const SecurityQuestionsSetupModal: React.FC<Props> = ({ open, onClose, onSaved }) => {
  const [question1, setQuestion1] = useState('');
  const [answer1, setAnswer1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = question1.trim() && answer1.trim() && question2.trim() && answer2.trim();

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      // TODO: Integrate with real API endpoint when available
      // await api.post('/security-questions', { questions: [...] })
      await new Promise((res) => setTimeout(res, 600));
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Set up security questions</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add two security questions to help verify your identity if you ever need account recovery.
        </Typography>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Question 1" value={question1} onChange={(e) => setQuestion1(e.target.value)} fullWidth />
          <TextField label="Answer 1" value={answer1} onChange={(e) => setAnswer1(e.target.value)} type="password" fullWidth />
          <TextField label="Question 2" value={question2} onChange={(e) => setQuestion2(e.target.value)} fullWidth />
          <TextField label="Answer 2" value={answer2} onChange={(e) => setAnswer2(e.target.value)} type="password" fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Not now</Button>
        <Button onClick={handleSave} variant="contained" disabled={!canSave || saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SecurityQuestionsSetupModal;


