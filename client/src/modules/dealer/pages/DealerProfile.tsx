import React, { useState } from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Chip,
  Divider,
  IconButton,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
  Alert,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../core/store';
import { updateProfile } from '../store/dealerSlice';
import DealerLayout from '../components/layout/DealerLayout';
import toast from 'react-hot-toast';

const DealerProfile: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.dealer.profile);

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [openBusinessHoursDialog, setOpenBusinessHoursDialog] = useState(false);

  // Mock profile data if none exists
  const currentProfile = profile || {
    id: '1',
    business_name: 'Premium Auto Sales',
    business_type: 'dealership' as const,
    license_number: 'DLR-2023-45678',
    description: 'Your trusted partner for quality pre-owned and new vehicles. We offer a wide selection of cars with competitive pricing and excellent customer service.',
    address: '123 Auto Boulevard',
    city: 'Los Angeles',
    state: 'California',
    country: 'United States',
    postal_code: '90001',
    phone: '+1 (555) 123-4567',
    email: 'contact@premiumautosales.com',
    website: 'https://premiumautosales.com',
    logo: '',
    images: [],
    rating: 4.8,
    review_count: 245,
    is_verified: true,
    status: 'active' as const,
    services: ['Financing', 'Trade-In', 'Warranty', 'Home Delivery', 'Test Drive'],
    business_hours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '10:00', close: '16:00' },
      sunday: { closed: true },
    },
    user_id: '1',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2024-10-04T00:00:00Z',
  };

  const handleEdit = () => {
    setEditedProfile(currentProfile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(currentProfile);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (editedProfile) {
      dispatch(updateProfile(editedProfile));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const businessTypeOptions = [
    { value: 'dealership', label: 'Dealership' },
    { value: 'private_seller', label: 'Private Seller' },
    { value: 'auction_house', label: 'Auction House' },
    { value: 'rental_company', label: 'Rental Company' },
  ];

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <DealerLayout>
      <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Business Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your dealership information and settings
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  }}
                >
                  Save Changes
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={4}>
            {/* Business Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                      margin: '0 auto',
                    }}
                  >
                    {currentProfile.logo ? (
                      <img src={currentProfile.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <BusinessIcon sx={{ fontSize: '3rem' }} />
                    )}
                  </Avatar>
                  {isEditing && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                      size="small"
                    >
                      <UploadIcon sx={{ fontSize: '1rem', color: 'white' }} />
                    </IconButton>
                  )}
                </Box>

                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {currentProfile.business_name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                  <Chip
                    label={businessTypeOptions.find(t => t.value === currentProfile.business_type)?.label}
                    size="small"
                    color="primary"
                  />
                  {currentProfile.is_verified && (
                    <Chip
                      icon={<VerifiedIcon />}
                      label="Verified"
                      size="small"
                      color="success"
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 2 }}>
                  <StarIcon sx={{ color: '#fbbf24', fontSize: 20 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {currentProfile.rating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({currentProfile.review_count} reviews)
                  </Typography>
                </Box>

                {currentProfile.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {currentProfile.description}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Services Offered
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentProfile.services?.map((service, index) => (
                      <Chip key={index} label={service} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Business Hours Card */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Business Hours
                    </Typography>
                  </Box>
                  {isEditing && (
                    <IconButton size="small" onClick={() => setOpenBusinessHoursDialog(true)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Stack spacing={1.5}>
                  {dayNames.map((day) => {
                    const hours = currentProfile.business_hours?.[day as keyof typeof currentProfile.business_hours];
                    return (
                      <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                          {day}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hours?.closed ? 'Closed' : `${hours?.open} - ${hours?.close}`}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={8}>
            {/* Business Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                  Business Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Business Name"
                      value={isEditing ? editedProfile?.business_name : currentProfile.business_name}
                      onChange={(e) => handleChange('business_name', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Business Type"
                      value={isEditing ? editedProfile?.business_type : currentProfile.business_type}
                      onChange={(e) => handleChange('business_type', e.target.value)}
                      disabled={!isEditing}
                    >
                      {businessTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="License Number"
                      value={isEditing ? editedProfile?.license_number : currentProfile.license_number}
                      onChange={(e) => handleChange('license_number', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Status"
                      value={currentProfile.status}
                      disabled
                      InputProps={{
                        endAdornment: (
                          <Chip
                            label={currentProfile.status}
                            size="small"
                            color={currentProfile.status === 'active' ? 'success' : 'default'}
                          />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      value={isEditing ? editedProfile?.description : currentProfile.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      disabled={!isEditing}
                      helperText="Tell customers about your business"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                  Contact Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={isEditing ? editedProfile?.phone : currentProfile.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={isEditing ? editedProfile?.email : currentProfile.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={isEditing ? editedProfile?.website : currentProfile.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WebsiteIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <LocationIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Location
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={isEditing ? editedProfile?.address : currentProfile.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={isEditing ? editedProfile?.city : currentProfile.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      value={isEditing ? editedProfile?.state : currentProfile.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      value={isEditing ? editedProfile?.postal_code : currentProfile.postal_code}
                      onChange={(e) => handleChange('postal_code', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={isEditing ? editedProfile?.country : currentProfile.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Verification Alert */}
        {!currentProfile.is_verified && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={600}>
              Your business is not verified yet
            </Typography>
            <Typography variant="caption">
              Complete the verification process to build trust with customers and unlock premium features.
            </Typography>
            <Button size="small" sx={{ mt: 1 }}>
              Start Verification
            </Button>
          </Alert>
        )}

        {/* Business Hours Dialog */}
        <Dialog open={openBusinessHoursDialog} onClose={() => setOpenBusinessHoursDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Business Hours</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {dayNames.map((day) => {
                const hours = editedProfile?.business_hours?.[day as keyof typeof editedProfile.business_hours];
                return (
                  <Box key={day}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', mb: 1 }}>
                      {day}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        type="time"
                        label="Open"
                        value={hours?.open || '09:00'}
                        size="small"
                        disabled={hours?.closed}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        type="time"
                        label="Close"
                        value={hours?.close || '18:00'}
                        size="small"
                        disabled={hours?.closed}
                        sx={{ flex: 1 }}
                      />
                      <Chip
                        label={hours?.closed ? 'Closed' : 'Open'}
                        color={hours?.closed ? 'default' : 'success'}
                        size="small"
                        onClick={() => {
                          // Toggle closed status
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBusinessHoursDialog(false)}>Cancel</Button>
            <Button onClick={() => setOpenBusinessHoursDialog(false)} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DealerLayout>
  );
};

export default DealerProfile;

