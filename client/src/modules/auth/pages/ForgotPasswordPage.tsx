import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Stack, InputAdornment, Card, CardContent, Divider, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Email, Send } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { api } from '../../../core/services/api/apiClient';
import { securityQuestionsApi } from '../services/securityQuestionsApi';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

type FormData = yup.InferType<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [options, setOptions] = useState<Array<{ method: string; name: string; description: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState<string>('');
  const [open, setOpen] = useState(true);
  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: FormData) => {
    setError(null);
    try {
      // Fetch available reset options for this email
      const resp = await api.get(`/password-reset/options/${encodeURIComponent(email)}`);
      const available = resp?.data?.data?.options || [];
      setOptions(available);
      setSubmitted(true);
      setEmailValue(email);
      reset();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to initiate password reset');
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700}>Forgot Password</Typography>
        <IconButton onClick={() => setOpen(false)} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter your email to receive password reset instructions.
      </Typography>

      {submitted && options.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            We found reset options for your account. Choose how you want to reset.
          </Alert>
          <Stack spacing={1.5}>
            {options.map((opt) => (
              <Card key={opt.method} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700}>{opt.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {opt.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" gap={1}>
                    {opt.method === 'email' && (
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            await api.post('/password-reset/email', { email: emailValue });
                            alert('If an account exists, a reset email has been sent.');
                          } catch (e: any) {
                            alert(e?.response?.data?.error || 'Failed to send email reset link');
                          }
                        }}
                      >
                        Send OTP to email
                      </Button>
                    )}
                    {opt.method === 'security_questions' && (
                      <Button
                        variant="outlined"
                        href={`/auth/security-questions`}
                      >
                        Use security questions
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={1.5}>
          <TextField
            {...register('email')}
            label="Email address"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid}
            startIcon={<Send />}
          >
            Send reset link
          </Button>
        </Stack>
      </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordPage;
