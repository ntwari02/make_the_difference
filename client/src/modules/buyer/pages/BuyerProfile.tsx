import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  Avatar,
  Button,
  TextField,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
} from '@mui/material';
import { buyerApi } from '../services/buyerApi';
import authApi from '../../auth/services/authApi';
import type { BuyerProfile as BuyerProfileType } from '../types';
import { Alert, CircularProgress, Snackbar } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../core/store';
import { updateUser } from '../../../core/store/auth/authSlice';
import PhotoUpload from '../../../shared/components/PhotoUpload';

const BuyerProfile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('buyer@example.com');
  const [phone, setPhone] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [bio, setBio] = React.useState('Car enthusiast exploring the best deals.');
  const [favoritesCount, setFavoritesCount] = React.useState<number | null>(null);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [avatar, setAvatar] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [profileTab, setProfileTab] = React.useState<number>(0);

  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [priceAlerts, setPriceAlerts] = React.useState(true);
  const [savedSearchesPref, setSavedSearchesPref] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const profile: BuyerProfileType = await buyerApi.getProfile();
        if (!mounted) return;
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setEmail(profile.email);
        setPhone(profile.phone || '');
        setAvatar(profile.avatar);
        setBio(profile.bio || '');
        const addr = (profile.address as any) || {};
        setLocation(addr?.location || addr?.city || '');
        const prefs = profile.preferences || { notifications: true, priceAlerts: true, savedSearches: true };
        setEmailAlerts(!!prefs.notifications);
        setPriceAlerts(!!prefs.priceAlerts);
        setSavedSearchesPref(!!prefs.savedSearches);
        
        // Update Redux auth state with latest profile data, especially avatar
        if (profile.avatar) {
          dispatch(updateUser({ 
            profile_image: profile.avatar,
            avatar: profile.avatar 
          }));
        }
        
        // Fetch favorites count
        try {
          const { favorites } = await buyerApi.getFavorites(1, 500);
          setFavoritesCount(Array.isArray(favorites) ? favorites.length : (favorites?.length ?? 0));
        } catch {
          setFavoritesCount(null);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [dispatch]);

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const updated = await buyerApi.updateProfile({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        avatar,
        bio,
        address: location ? { location } : undefined,
        preferences: {
          notifications: emailAlerts,
          priceAlerts: priceAlerts,
          savedSearches: savedSearchesPref,
        },
      });
      setFirstName(updated.firstName || '');
      setLastName(updated.lastName || '');
      setEmail(updated.email);
      setPhone(updated.phone || '');
      setAvatar(updated.avatar);
      // Update Redux auth state so header shows updated profile
      dispatch(updateUser({ 
        first_name: updated.firstName,
        last_name: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        profile_image: updated.avatar,
        avatar: updated.avatar 
      }));
      setSuccess('Profile updated');
      // Refresh favorites count lightly
      try {
        const { favorites } = await buyerApi.getFavorites(1, 200);
        setFavoritesCount(Array.isArray(favorites) ? favorites.length : (favorites?.length ?? 0));
      } catch {}
    } finally {
      setSaving(false);
    }
  };

  const onSavePreferences = async () => {
    try {
      setSaving(true);
      setError(null);
      await buyerApi.updateProfile({
        preferences: {
          notifications: emailAlerts,
          priceAlerts: priceAlerts,
          savedSearches: savedSearchesPref,
        },
      });
      setSuccess('Preferences updated');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
      <Box>
        <Grid container spacing={2}>
          {/* Left column - Avatar and quick stats */}
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                <PhotoUpload
                  images={avatar ? [avatar] : []}
                  onImagesChange={(newImages) => {
                    const newAvatar = newImages.length > 0 ? newImages[0] : undefined;
                    setAvatar(newAvatar);
                    // Auto-save avatar when uploaded
                    if (newAvatar) {
                      buyerApi.updateProfile({ avatar: newAvatar }).then((updated) => {
                        setAvatar(updated.avatar);
                        // Update Redux auth state so header shows the new image
                        dispatch(updateUser({ 
                          profile_image: updated.avatar,
                          avatar: updated.avatar 
                        }));
                        setSuccess('Avatar updated successfully');
                      }).catch((e: any) => {
                        setError(e?.response?.data?.message || 'Failed to update avatar');
                      });
                    } else if (newImages.length === 0) {
                      // Image was deleted
                      buyerApi.updateProfile({ avatar: undefined }).then((updated) => {
                        setAvatar(updated.avatar);
                        // Update Redux auth state to clear the image
                        dispatch(updateUser({ 
                          profile_image: null,
                          avatar: undefined 
                        }));
                        setSuccess('Avatar removed successfully');
                      }).catch((e: any) => {
                        setError(e?.response?.data?.message || 'Failed to remove avatar');
                      });
                    }
                  }}
                  maxImages={1}
                  maxFileSize={5}
                  uploadEndpoint="/api/buyer/profile/images"
                  entityId={user?.id || ''}
                  entityType="profile"
                  disabled={saving || loading}
                  profileMode={true}
                  avatarSize={96}
                  showLabel={false}
                  fallbackText={(firstName || lastName || 'B')[0].toUpperCase()}
                />
                <Typography variant="h6" fontWeight={700}>
                  {firstName || lastName ? `${firstName} ${lastName}`.trim() : email}
                </Typography>
                <Typography variant="body2" color="text.secondary">{email}</Typography>
                <Divider sx={{ width: '100%', my: 1.5 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip label={`${favoritesCount ?? '—'} Favorites`} color="primary" variant="outlined" />
                  <Chip label="— Viewed" variant="outlined" />
                  <Chip label="— Saved Searches" variant="outlined" />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Notifications</Typography>
                <FormControlLabel control={<Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />} label="Email notifications" />
                <FormControlLabel control={<Switch checked={priceAlerts} onChange={(e) => setPriceAlerts(e.target.checked)} />} label="Price drop alerts" />
                <FormControlLabel control={<Switch checked={savedSearchesPref} onChange={(e) => setSavedSearchesPref(e.target.checked)} />} label="Saved searches alerts" />
              </CardContent>
            </Card>
          </Grid>

          {/* Right column - Forms */}
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Tabs value={profileTab} onChange={(_, v) => setProfileTab(v)} sx={{ mb: 2 }}>
                  <Tab label="Personal Information" />
                  <Tab label="Security" />
                </Tabs>

                {/* Fixed-height content area to prevent layout shift when switching tabs */}
                <Box sx={{ minHeight: 420 }}>
                {profileTab === 0 && (
                  <Box>
                    {loading && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2">Loading profile...</Typography>
                      </Box>
                    )}
                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    )}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Bio" multiline rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
                      </Grid>
                      <Grid item xs={12}>
                        <Button variant="contained" onClick={onSave} disabled={saving || loading}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {profileTab === 1 && (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth type="password" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth type="password" label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      </Grid>
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={onChangePassword} disabled={saving}>{saving ? 'Saving...' : 'Update Password'}</Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSuccess(null)} severity="success" variant="filled">{success}</Alert>
        </Snackbar>
      </Box>
  );
};

export default BuyerProfile;


