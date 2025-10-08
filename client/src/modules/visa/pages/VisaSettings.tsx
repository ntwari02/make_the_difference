import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Stack,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from '@mui/material';
import { Save as SaveIcon, FileDownload as FileDownloadIcon, FileUpload as FileUploadIcon, VpnKey as VpnKeyIcon, Sync as SyncIcon } from '@mui/icons-material';
import VisaLayout from '../components/layout/VisaLayout';

const VisaSettings: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  // Organization
  const [orgName, setOrgName] = React.useState('Visa Office');
  const [contactEmail, setContactEmail] = React.useState('visa@office.com');
  const [contactPhone, setContactPhone] = React.useState('+1 (555) 123-4567');
  const [timezone, setTimezone] = React.useState('UTC');
  // Notifications
  const [emailUpdates, setEmailUpdates] = React.useState(true);
  const [smsUpdates, setSmsUpdates] = React.useState(false);
  const [pushUpdates, setPushUpdates] = React.useState(true);
  const [digestFreq, setDigestFreq] = React.useState<'weekly' | 'monthly' | 'off'>('weekly');
  // Security
  const [twoFA, setTwoFA] = React.useState(false);
  const [sessionTimeout, setSessionTimeout] = React.useState('30');
  const [ipWhitelist, setIpWhitelist] = React.useState('');
  // API & Webhooks
  const [apiKey, setApiKey] = React.useState('sk_live_********');
  const [webhookUrl, setWebhookUrl] = React.useState('');
  const [webhookSecret, setWebhookSecret] = React.useState('whsec_********');
  // Compliance
  const [piiRetentionDays, setPiiRetentionDays] = React.useState('365');
  const [anonymizeAfter, setAnonymizeAfter] = React.useState(true);
  // Payments
  const [defaultCurrency, setDefaultCurrency] = React.useState('USD');
  const [gateway, setGateway] = React.useState<'stripe' | 'mpesa' | 'none'>('stripe');
  const [sandbox, setSandbox] = React.useState(true);
  // Branding
  const [logoUrl, setLogoUrl] = React.useState('');
  const [primaryColor, setPrimaryColor] = React.useState('#1976d2');
  // Access & Roles (display only stub)
  const [roles, setRoles] = React.useState<Array<{id:string; name:string; permissions:string[]}>>([
    { id: 'r1', name: 'Admin', permissions: ['all'] },
    { id: 'r2', name: 'Officer', permissions: ['read','write','decide'] },
    { id: 'r3', name: 'Viewer', permissions: ['read'] },
  ]);
  // Localization
  const [languages, setLanguages] = React.useState<string[]>(['en']);
  const [rtl, setRtl] = React.useState(false);
  // Integrations
  const [recaptchaSite, setRecaptchaSite] = React.useState('');
  const [recaptchaSecret, setRecaptchaSecret] = React.useState('');
  const [rateLimit, setRateLimit] = React.useState('1000');
  // Backups
  const [autoBackup, setAutoBackup] = React.useState(true);
  const [backupFreq, setBackupFreq] = React.useState<'daily'|'weekly'|'monthly'>('weekly');
  const [retentionBackups, setRetentionBackups] = React.useState('12');
  // Audit logs
  const [audit, setAudit] = React.useState<Array<{ts:string; actor:string; action:string}>>([
    { ts: '2025-10-08 09:12', actor: 'admin', action: 'Updated payment gateway to Stripe' },
    { ts: '2025-10-07 16:45', actor: 'officer1', action: 'Changed PII retention to 365 days' },
  ]);
  // Data
  const [snackbar, setSnackbar] = React.useState<{open:boolean; message:string; severity:'success'|'error'|'info'|'warning'}>({open:false,message:'',severity:'success'});
  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSnackbar({ open: true, message: 'Settings saved', severity: 'success' });
  };

  return (
    <VisaLayout>
      <Box mb={2}>
        <Typography variant="h5" fontWeight={700}>Settings</Typography>
      </Box>
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Account" />
            <Tab label="Notifications" />
            <Tab label="Security" />
            <Tab label="Privacy" />
            <Tab label="Payments" />
            <Tab label="Data" />
          </Tabs>
        </Box>
        <CardContent>
          <Box component="form" onSubmit={handleSave}>
            {tab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Office Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Contact Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Contact Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                      {['UTC','Africa/Nairobi','Europe/London','America/New_York','Asia/Dubai'].map((z) => (
                        <MenuItem key={z} value={z}>{z}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {tab === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel control={<Switch checked={emailUpdates} onChange={(e) => setEmailUpdates(e.target.checked)} />} label="Email Updates" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel control={<Switch checked={smsUpdates} onChange={(e) => setSmsUpdates(e.target.checked)} />} label="SMS Updates" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel control={<Switch checked={pushUpdates} onChange={(e) => setPushUpdates(e.target.checked)} />} label="Push Notifications" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Digest Frequency</InputLabel>
                    <Select label="Digest Frequency" value={digestFreq} onChange={(e) => setDigestFreq(e.target.value as any)}>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="off">Off</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {tab === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel control={<Switch checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} />} label="Require 2FA" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Session Timeout (minutes)" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="IP Whitelist (comma separated)" value={ipWhitelist} onChange={(e) => setIpWhitelist(e.target.value)} placeholder="e.g., 192.168.1.1, 10.0.0.0/24" />
                </Grid>
              </Grid>
            )}

            {tab === 3 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700}>Privacy Preferences</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel control={<Switch defaultChecked />} label="Show profile to other users" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel control={<Switch />} label="Share activity insights" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel control={<Switch defaultChecked />} label="Receive marketing emails" />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">You can export your personal data or request deletion from the Data tab.</Alert>
                </Grid>
              </Grid>
            )}

            {tab === 4 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700}>Saved Payment Methods</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip label="Visa •••• 4242" onDelete={() => setSnackbar({open:true,message:'Card removed (stub)',severity:'info'})} />
                    <Chip label="M-Pesa +2547••• •••" onDelete={() => setSnackbar({open:true,message:'Number removed (stub)',severity:'info'})} />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Add card (16 digits)" placeholder="4111 1111 1111 1111" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Add mobile money number" placeholder="+254 7XX XXX XXX" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Default Currency</InputLabel>
                    <Select label="Default Currency" value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)}>
                      {['USD','EUR','GBP','KES','TZS','UGX'].map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {tab === 5 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Button fullWidth variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => setSnackbar({open:true,message:'Export scheduled (stub)',severity:'info'})}>Export Settings</Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button fullWidth variant="outlined" startIcon={<FileUploadIcon />} onClick={() => setImportOpen(true)}>Import Settings</Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<SyncIcon />} onClick={() => setSnackbar({open:true,message:'Data export & preferences sync started (stub)',severity:'success'})}>Sync Now</Button>
                </Grid>
              </Grid>
            )}

            {tab === 7 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://.../logo.png" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth type="color" label="Primary Color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">Branding changes may require application reload to fully apply.</Alert>
                </Grid>
              </Grid>
            )}

            {tab === 8 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700}>Roles</Typography>
                  <Stack spacing={1}>
                    {roles.map((r) => (
                      <Card key={r.id} variant="outlined">
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">{r.name}</Typography>
                            <Stack direction="row" spacing={1}>
                              {r.permissions.map((p, i) => (<Chip key={i} size="small" label={p} />))}
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Audit Log</Typography>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {audit.map((a, i) => (<Typography key={i} variant="body2">[{a.ts}] {a.actor}: {a.action}</Typography>))}
                  </Stack>
                </Grid>
              </Grid>
            )}

            {tab === 9 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <FormControl fullWidth>
                    <InputLabel>Supported Languages</InputLabel>
                    <Select label="Supported Languages" multiple value={languages} onChange={(e) => setLanguages(e.target.value as string[])}>
                      {['en','fr','sw','ar','es'].map((lng) => (
                        <MenuItem key={lng} value={lng}>{lng.toUpperCase()}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel control={<Switch checked={rtl} onChange={(e) => setRtl(e.target.checked)} />} label="Enable RTL Layout" />
                </Grid>
              </Grid>
            )}

            {tab === 10 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="reCAPTCHA Site Key" value={recaptchaSite} onChange={(e) => setRecaptchaSite(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="reCAPTCHA Secret Key" value={recaptchaSecret} onChange={(e) => setRecaptchaSecret(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="API Rate Limit (req/day)" value={rateLimit} onChange={(e) => setRateLimit(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">Use integrations to reduce fraud and protect forms.</Alert>
                </Grid>
              </Grid>
            )}

            {tab === 11 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Backup Frequency</InputLabel>
                    <Select label="Backup Frequency" value={backupFreq} onChange={(e) => setBackupFreq(e.target.value as any)}>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Retention (backups)" value={retentionBackups} onChange={(e) => setRetentionBackups(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel control={<Switch checked={autoBackup} onChange={(e) => setAutoBackup(e.target.checked)} />} label="Enable Auto Backup" />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" onClick={() => setSnackbar({open:true,message:'Backup started (stub)',severity:'success'})}>Run Backup Now</Button>
                </Grid>
              </Grid>
            )}

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />}>Save Changes</Button>
              <Button type="button" variant="text" onClick={() => setSnackbar({ open: true, message: 'Reverted (stub)', severity: 'info' })}>Revert</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Import dialog */}
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Paste JSON settings to import.</Typography>
          <TextField fullWidth multiline minRows={6} value={importText} onChange={(e) => setImportText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { try { JSON.parse(importText); setSnackbar({open:true,message:'Imported (stub)',severity:'success'}); setImportOpen(false);} catch { setSnackbar({open:true,message:'Invalid JSON',severity:'error'});} }}>Import</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </VisaLayout>
  );
};

export default VisaSettings;


