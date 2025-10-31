import React from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	GridLegacy as Grid,
	Switch,
	FormControlLabel,
	Divider,
	Button,
	TextField,
	Chip,
	List,
	ListItem,
	ListItemText,
	RadioGroup,
	Radio,
	Alert,
	Snackbar,
} from '@mui/material';
import BuyerLayout from '../components/layout/BuyerLayout';
import { buyerApi } from '../services/buyerApi';
import authApi from '../../auth/services/authApi';

const BuyerSettings: React.FC = () => {
	const [emailAlerts, setEmailAlerts] = React.useState(true);
	const [priceAlerts, setPriceAlerts] = React.useState(true);
	const [marketingEmails, setMarketingEmails] = React.useState(false);
	const [pushAlerts, setPushAlerts] = React.useState(true);

	const [location, setLocation] = React.useState('');
	const [themePref, setThemePref] = React.useState<'system' | 'light' | 'dark'>('system');
	const [topicFav, setTopicFav] = React.useState(true);
	const [topicNew, setTopicNew] = React.useState(true);
	const [topicPrice, setTopicPrice] = React.useState(true);
	const [topicDealer, setTopicDealer] = React.useState(true);

	const [sessions, setSessions] = React.useState<Array<{ id: string; created_at?: string; expires_at?: string }>>([]);
	const [showAllSessions, setShowAllSessions] = React.useState(false);
	const [saving, setSaving] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [success, setSuccess] = React.useState<string | null>(null);

	// 2FA state
	const [twoFASecret, setTwoFASecret] = React.useState<string | null>(null);
	const [twoFAOtpAuth, setTwoFAOtpAuth] = React.useState<string | null>(null);
	const [twoFACode, setTwoFACode] = React.useState('');

	React.useEffect(() => {
		let active = true;
		const load = async () => {
			try {
				setLoading(true);
				setError(null);
				const profile = await buyerApi.getProfile();
				const prefs: any = profile.preferences || {};
				if (!active) return;
				setEmailAlerts(!!prefs.notifications);
				setPriceAlerts(!!prefs.priceAlerts);
				setMarketingEmails(!!prefs.marketingEmails);
				setPushAlerts(!!prefs.pushAlerts);
				if (prefs.theme === 'light' || prefs.theme === 'dark' || prefs.theme === 'system') setThemePref(prefs.theme);
				const topics = prefs.topics || {};
				setTopicFav(topics.favorites !== false);
				setTopicNew(topics.newListings !== false);
				setTopicPrice(topics.priceChanges !== false);
				setTopicDealer(topics.dealerReplies !== false);
				const addr = (profile.address as any) || {};
				setLocation(addr?.location || '');
				try {
					const sess = await authApi.getSessions();
					if (active) setSessions(sess?.data || sess || []);
				} catch {}
			} catch (e: any) {
				if (active) setError(e?.response?.data?.message || 'Failed to load settings');
			} finally {
				if (active) setLoading(false);
			}
		};
		load();
		return () => { active = false; };
	}, []);

	const saveSettings = async () => {
		try {
			setSaving(true);
			setError(null);
			await buyerApi.updateProfile({
				address: location ? { location } : undefined,
				preferences: {
					notifications: emailAlerts,
					priceAlerts: priceAlerts,
					marketingEmails,
					pushAlerts,
					theme: themePref,
					topics: {
						favorites: !!topicFav,
						newListings: !!topicNew,
						priceChanges: !!topicPrice,
						dealerReplies: !!topicDealer,
					},
				} as any,
			});
			setSuccess('Settings saved');
		} catch (e: any) {
			setError(e?.response?.data?.message || 'Failed to save settings');
		} finally {
			setSaving(false);
		}
	};

	const revokeSession = async (id: string) => {
		try {
			await authApi.revokeSession(id);
			setSessions((prev) => prev.filter((s) => s.id !== id));
		} catch {}
	};

	const revokeAll = async () => {
		try {
			await authApi.revokeAllSessions();
			setSessions([]);
			setSuccess('Logged out from all devices');
		} catch {}
	};

	const setup2FA = async () => {
		try {
			setSaving(true);
			const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/2fa/setup`, {
				method: 'GET',
				headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
			});
			const data = await res.json();
			setTwoFASecret(data?.data?.secret || null);
			setTwoFAOtpAuth(data?.data?.otpauth_url || null);
			setSuccess('2FA secret generated');
		} finally {
			setSaving(false);
		}
	};

	const enable2FA = async () => {
		try {
			setSaving(true);
			await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/2fa/enable`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
				body: JSON.stringify({ code: twoFACode })
			});
			setSuccess('2FA enabled');
			setTwoFACode('');
		} finally {
			setSaving(false);
		}
	};

	const disable2FA = async () => {
		try {
			setSaving(true);
			await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/2fa/disable`, {
				method: 'POST',
				headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
			});
			setSuccess('2FA disabled');
		} finally {
			setSaving(false);
		}
	};

	const formatDate = (iso?: string) => {
		if (!iso) return '';
		try {
			const d = new Date(iso);
			return d.toLocaleString();
		} catch {
			return iso;
		}
	};

	const deleteAccount = async () => {
		try {
			setSaving(true);
			setError(null);
			await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/delete-account`, {
				method: 'DELETE',
				headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
			});
      setSuccess('Account deactivated');
      // Clear auth and redirect to home after a short delay
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } catch {}
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
		} finally {
			setSaving(false);
		}
	};

	return (
		<BuyerLayout>
			<Box>
				{/* Header */}
				<Box sx={{ mb: 3, p: 3, borderRadius: 2, background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', border: (theme) => `1px solid ${theme.palette.divider}` }}>
					<Typography variant="h4" fontWeight={800}>Settings</Typography>
					<Typography variant="body2" color="text.secondary">Control notifications, privacy, security, and preferences</Typography>
				</Box>

				<Grid container spacing={2}>
					{/* Left column */}
					<Grid item xs={12} md={6}>
						{/* Notifications */}
						<Card sx={{ mb: 2 }}>
							<CardContent>
								<Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Notifications</Typography>
								{error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
								<FormControlLabel control={<Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />} label="Email notifications" />
								<FormControlLabel control={<Switch checked={pushAlerts} onChange={(e) => setPushAlerts(e.target.checked)} />} label="Push notifications" />
								<FormControlLabel control={<Switch checked={priceAlerts} onChange={(e) => setPriceAlerts(e.target.checked)} />} label="Price drop alerts" />
								<FormControlLabel control={<Switch checked={marketingEmails} onChange={(e) => setMarketingEmails(e.target.checked)} />} label="Marketing emails" />
								<Divider sx={{ my: 1.5 }} />
								<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
									<Chip label="Favorites" color={topicFav ? 'primary' : undefined} variant={topicFav ? 'filled' : 'outlined'} onClick={() => setTopicFav((v)=>!v)} />
									<Chip label="New listings" color={topicNew ? 'primary' : undefined} variant={topicNew ? 'filled' : 'outlined'} onClick={() => setTopicNew((v)=>!v)} />
									<Chip label="Price changes" color={topicPrice ? 'primary' : undefined} variant={topicPrice ? 'filled' : 'outlined'} onClick={() => setTopicPrice((v)=>!v)} />
									<Chip label="Dealer replies" color={topicDealer ? 'primary' : undefined} variant={topicDealer ? 'filled' : 'outlined'} onClick={() => setTopicDealer((v)=>!v)} />
								</Box>
								<Box sx={{ mt: 2 }}>
									<Button variant="contained" onClick={saveSettings} disabled={saving || loading}>{saving ? 'Saving...' : 'Save Settings'}</Button>
								</Box>
							</CardContent>
						</Card>

						{/* Privacy */}
						<Card sx={{ mb: 2 }}>
							<CardContent>
								<Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Privacy</Typography>
								<FormControlLabel control={<Switch defaultChecked />} label="Show profile to dealers" />
								<FormControlLabel control={<Switch />} label="Allow messages from all dealers" />
								<FormControlLabel control={<Switch defaultChecked />} label="Share approximate location" />
								<Divider sx={{ my: 1.5 }} />
								<Button variant="outlined" onClick={async () => {
									try {
										const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/export`, {
											method: 'GET',
											headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
										});
										const blob = await res.blob();
										const url = URL.createObjectURL(blob);
										const a = document.createElement('a');
										a.href = url; a.download = 'account-export.json'; a.click();
										URL.revokeObjectURL(url);
									} catch {}
								}}>Export My Data</Button>
							</CardContent>
						</Card>

						{/* Danger Zone */}
						<Card>
							<CardContent>
								<Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: 'error.main' }}>Danger Zone</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Deleting your account is irreversible. Your data will be permanently removed.</Typography>
								<Button variant="outlined" color="error" sx={{ mr: 1 }} onClick={deleteAccount} disabled={saving}>Deactivate Account</Button>
								<Button variant="contained" color="error" onClick={deleteAccount} disabled={saving}>Delete Account</Button>
							</CardContent>
						</Card>
					</Grid>

					{/* Right column */}
					<Grid item xs={12} md={6}>
						{/* Preferences */}
						<Card sx={{ mb: 2 }}>
							<CardContent>
								<Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Preferences</Typography>
								<TextField fullWidth label="Preferred Location" value={location} onChange={(e) => setLocation(e.target.value)} sx={{ mb: 2 }} />
								<Typography variant="subtitle2" sx={{ mb: 1 }}>Theme</Typography>
								<RadioGroup row value={themePref} onChange={(e) => setThemePref(e.target.value as any)}>
									<FormControlLabel value="system" control={<Radio />} label="System" />
									<FormControlLabel value="light" control={<Radio />} label="Light" />
									<FormControlLabel value="dark" control={<Radio />} label="Dark" />
								</RadioGroup>
								<Divider sx={{ my: 1.5 }} />
								<Button variant="contained" onClick={saveSettings} disabled={saving || loading}>{saving ? 'Saving...' : 'Save Preferences'}</Button>
							</CardContent>
						</Card>

						{/* Security */}
						<Card sx={{ mb: 2 }}>
							<CardContent>
								<Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Security</Typography>
								<FormControlLabel control={<Switch onChange={(e) => e.target.checked ? setup2FA() : disable2FA()} />} label="Two-factor authentication (2FA)" />
								{twoFASecret && (
									<Box sx={{ mt: 1 }}>
										<Typography variant="body2">Secret: {twoFASecret}</Typography>
										{twoFAOtpAuth && <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{twoFAOtpAuth}</Typography>}
										<Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
											<TextField size="small" label="Enter 6-digit code" value={twoFACode} onChange={(e) => setTwoFACode(e.target.value)} />
											<Button variant="contained" onClick={enable2FA} disabled={saving || !twoFACode}>Enable 2FA</Button>
										</Box>
									</Box>
								)}
								<Divider sx={{ my: 1.5 }} />
								<Button variant="outlined" sx={{ mr: 1 }} onClick={saveSettings} disabled={saving || loading}>Change Password</Button>
							</CardContent>
						</Card>

						{/* Sessions */}
						<Card>
							<CardContent>
								<Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Active Sessions</Typography>
								<List>
									{(showAllSessions ? sessions : sessions.slice(0, 5)).map((s) => (
										<ListItem key={s.id} divider secondaryAction={<Button size="small" onClick={() => revokeSession(s.id)}>Sign out</Button>}>
											<ListItemText primary={`Session`} secondary={`Created: ${formatDate(s.created_at)} · Expires: ${formatDate(s.expires_at)}`} />
										</ListItem>
									))}
								</List>
								<Divider sx={{ my: 1.5 }} />
								<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
									<Button variant="outlined" onClick={revokeAll}>Sign out of all devices</Button>
									<Button variant="text" onClick={() => setShowAllSessions((v) => !v)}>{showAllSessions ? 'Show less' : 'Show all'}</Button>
								</Box>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Box>
			<Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
				<Alert onClose={() => setSuccess(null)} severity="success" variant="filled">{success}</Alert>
			</Snackbar>
		</BuyerLayout>
	);
};

export default BuyerSettings;


