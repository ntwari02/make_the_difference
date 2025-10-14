import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Card, CardContent, TextField, Button, Alert } from '@mui/material';
import { api } from '../../../core/services/api/apiClient';

const SecurityQuestionsPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState<Array<{ id: string; question_text: string }>>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setError(null);
      const resp = await api.post('/password-reset/initiate', { email });
      const qs = resp?.data?.data?.questions || [];
      setQuestions(qs);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Could not fetch questions');
    }
  };

  const verifyAnswers = async () => {
    try {
      setError(null);
      const payload = { email, answers: Object.keys(answers).map((id) => ({ questionId: id, answer: answers[id] })) };
      const resp = await api.post('/password-reset/initiate', payload);
      const t = resp?.data?.data?.resetToken;
      if (t) {
        setToken(t);
        window.location.href = `/auth/reset-password/${t}`;
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Security Questions</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Answer your security questions to reset your password.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!questions.length ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
          <TextField value={email} onChange={(e) => setEmail(e.target.value)} label="Account email" fullWidth />
          <Button variant="contained" onClick={fetchQuestions} disabled={!email}>Get questions</Button>
        </Stack>
      ) : (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              {questions.map((q) => (
                <TextField key={q.id} label={q.question_text} fullWidth value={answers[q.id] || ''} onChange={(e) => setAnswers((v) => ({ ...v, [q.id]: e.target.value }))} />
              ))}
              <Button variant="contained" onClick={verifyAnswers}>Verify and continue</Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SecurityQuestionsPage;
