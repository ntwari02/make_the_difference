import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Divider, Avatar, Switch, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Chip, Grid, Stack, Alert, Snackbar } from '@mui/material';
import StudentLayout from '../components/layout/StudentLayout';

const StudentSettings: React.FC = () => {
  const [name, setName] = useState('Jane Student');
  const [email, setEmail] = useState('jane@student.edu');
  const [username, setUsername] = useState('janestudent');
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [twoFA, setTwoFA] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [searchable, setSearchable] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({ open: false, message: '', severity: 'success' });

  const canSavePassword = useMemo(() => newPass.length >= 8 && newPass === confirmPass && !!oldPass, [oldPass, newPass, confirmPass]);

  const saveProfile = () => setSnack({ open: true, message: 'Profile updated (demo)', severity: 'success' });
  const savePreferences = () => setSnack({ open: true, message: 'Preferences saved (demo)', severity: 'success' });
  const saveNotifications = () => setSnack({ open: true, message: 'Notifications updated (demo)', severity: 'success' });
  const savePrivacy = () => setSnack({ open: true, message: 'Privacy saved (demo)', severity: 'success' });
  const changePassword = () => setSnack({ open: true, message: 'Password changed (demo)', severity: 'success' });
  const deleteAccount = () => setSnack({ open: true, message: 'Account deletion requested (demo)', severity: 'warning' });

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Settings</Typography>

        {/* Profile */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={800} gutterBottom>Profile</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'grid', placeItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 96, height: 96 }}>{name.substring(0,1)}</Avatar>
                  <Button size="small" variant="outlined">Change Avatar</Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={9}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="lang">Language</InputLabel>
                      <Select labelId="lang" label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button variant="contained" onClick={saveProfile}>Save changes</Button>
              <Button variant="text">Cancel</Button>
            </Box>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={800} gutterBottom>Preferences</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <FormControl fullWidth sx={{ maxWidth: 360 }}>
                <InputLabel id="theme">Theme</InputLabel>
                <Select labelId="theme" label="Theme" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                </Select>
              </FormControl>
              <Chip label={`Current: ${theme}`} />
              <Button variant="outlined" onClick={savePreferences}>Apply</Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={800} gutterBottom>Notifications</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <FormControlLabel control={<Switch checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />} label="Email notifications" />
              <FormControlLabel control={<Switch checked={pushNotif} onChange={(e) => setPushNotif(e.target.checked)} />} label="Push notifications" />
              <FormControlLabel control={<Switch checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />} label="Allow marketing messages" />
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={saveNotifications}>Save</Button>
            </Box>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={800} gutterBottom>Privacy & Security</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormControlLabel control={<Switch checked={publicProfile} onChange={(e) => setPublicProfile(e.target.checked)} />} label="Public profile" />
                  <FormControlLabel control={<Switch checked={searchable} onChange={(e) => setSearchable(e.target.checked)} />} label="Allow search engines to index profile" />
                  <FormControlLabel control={<Switch checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} />} label="Two-factor authentication" />
                </Stack>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" onClick={savePrivacy}>Save</Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Change Password</Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <TextField fullWidth type="password" label="Current password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth type="password" label="New password" value={newPass} onChange={(e) => setNewPass(e.target.value)} helperText="At least 8 characters" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth type="password" label="Confirm new password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} error={!!confirmPass && newPass !== confirmPass} />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" disabled={!canSavePassword} onClick={changePassword}>Change password</Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card variant="outlined" sx={{ borderColor: 'error.light' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} color="error" gutterBottom>Danger Zone</Typography>
            <Divider sx={{ mb: 2 }} />
            <Alert severity="warning" sx={{ mb: 1 }}>Deleting your account is irreversible.</Alert>
            <Button color="error" variant="outlined" onClick={deleteAccount}>Delete account</Button>
          </CardContent>
        </Card>

        <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
        </Snackbar>
      </Box>
    </StudentLayout>
  );
};

export default StudentSettings;


