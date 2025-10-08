import React, { useState } from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Paper,
  Divider,
  Autocomplete,
  Switch,
  FormControlLabel,
  Alert,
  Stack,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Save as SaveIcon,
  DirectionsCar as CarIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon,
  Build as BuildIcon,
  Palette as ColorIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addVehicle } from '../store/dealerSlice';
import DealerLayout from '../components/layout/DealerLayout';
import type { Vehicle } from '../types';
import toast from 'react-hot-toast';

const steps = ['Basic Information', 'Technical Details', 'Pricing & Location', 'Features & Images', 'Review & Publish'];

const carBrands = [
  'Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Lexus',
  'Mazda', 'Mercedes-Benz', 'Nissan', 'Porsche', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

const colors = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow',
  'Orange', 'Brown', 'Beige', 'Purple', 'Gold', 'Pearl White', 'Midnight Blue'
];

const commonFeatures = [
  'Navigation System', 'Backup Camera', 'Parking Sensors', 'Bluetooth', 'Apple CarPlay',
  'Android Auto', 'Leather Seats', 'Heated Seats', 'Ventilated Seats', 'Sunroof',
  'Panoramic Roof', 'Cruise Control', 'Adaptive Cruise Control', 'Lane Departure Warning',
  'Blind Spot Monitoring', 'Keyless Entry', 'Push Button Start', 'Remote Start',
  'Premium Audio', 'Alloy Wheels', 'LED Headlights', 'Fog Lights', 'Power Seats',
  'Memory Seats', 'Third Row Seating', 'AWD/4WD', 'Tow Package', 'Roof Rack'
];

const AddVehicle: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    car_condition: 'used',
    body_type: 'sedan',
    description: '',

    // Technical Details
    fuel_type: 'petrol',
    transmission: 'automatic',
    engine_size: '',
    horsepower: '',
    mileage: '',
    color: '',
    vin: '',

    // Pricing & Location
    price: '',
    currency: 'USD',
    location: '',
    latitude: '',
    longitude: '',

    // Features & Images
    is_featured: false,
    has_3d_model: false,
    model_3d_url: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${files.length} image(s) uploaded`);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
      setSelectedFeatures((prev) => [...prev, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const handleNext = () => {
    // Basic validation
    if (activeStep === 0) {
      if (!formData.title || !formData.brand || !formData.model) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (activeStep === 1) {
      if (!formData.mileage || !formData.color) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (activeStep === 2) {
      if (!formData.price || !formData.location) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = (status: 'active' | 'draft') => {
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
      mileage: parseInt(formData.mileage) || 0,
      price: parseFloat(formData.price) || 0,
      currency: formData.currency,
      car_condition: formData.car_condition as any,
      fuel_type: formData.fuel_type as any,
      transmission: formData.transmission as any,
      body_type: formData.body_type as any,
      color: formData.color,
      engine_size: formData.engine_size,
      horsepower: formData.horsepower ? parseInt(formData.horsepower) : undefined,
      vin: formData.vin,
      location: formData.location,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      images: images,
      features: selectedFeatures,
      model_3d_url: formData.model_3d_url,
      has_3d_model: formData.has_3d_model,
      status: status,
      is_featured: formData.is_featured,
      views_count: 0,
      seller_id: '1',
      dealer_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dispatch(addVehicle(newVehicle));
    toast.success(`Vehicle ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
    navigate('/dealer/vehicles');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<InfoIcon />}>
                Start by providing the basic information about your vehicle
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Vehicle Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., 2023 Tesla Model 3 Long Range"
                helperText="Create a descriptive title for your listing"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={carBrands}
                value={formData.brand}
                onChange={(_, newValue) => handleChange('brand', newValue || '')}
                renderInput={(params) => (
                  <TextField {...params} required label="Brand" placeholder="Select or type brand" />
                )}
                freeSolo
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="e.g., Camry, Mustang, Civic"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                type="number"
                label="Year"
                value={formData.year}
                onChange={(e) => handleChange('year', parseInt(e.target.value))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={formData.car_condition}
                  label="Condition"
                  onChange={(e) => handleChange('car_condition', e.target.value)}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="certified">Certified Pre-Owned</MenuItem>
                  <MenuItem value="used">Used</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Body Type</InputLabel>
                <Select
                  value={formData.body_type}
                  label="Body Type"
                  onChange={(e) => handleChange('body_type', e.target.value)}
                >
                  <MenuItem value="sedan">Sedan</MenuItem>
                  <MenuItem value="suv">SUV</MenuItem>
                  <MenuItem value="hatchback">Hatchback</MenuItem>
                  <MenuItem value="coupe">Coupe</MenuItem>
                  <MenuItem value="convertible">Convertible</MenuItem>
                  <MenuItem value="wagon">Wagon</MenuItem>
                  <MenuItem value="pickup">Pickup Truck</MenuItem>
                  <MenuItem value="van">Van</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Provide a detailed description of the vehicle, its condition, and any special features..."
                helperText={`${formData.description.length} characters`}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<BuildIcon />}>
                Add technical specifications and mechanical details
              </Alert>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  value={formData.fuel_type}
                  label="Fuel Type"
                  onChange={(e) => handleChange('fuel_type', e.target.value)}
                >
                  <MenuItem value="petrol">Petrol/Gasoline</MenuItem>
                  <MenuItem value="diesel">Diesel</MenuItem>
                  <MenuItem value="electric">Electric</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                  <MenuItem value="lpg">LPG</MenuItem>
                  <MenuItem value="cng">CNG</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Transmission</InputLabel>
                <Select
                  value={formData.transmission}
                  label="Transmission"
                  onChange={(e) => handleChange('transmission', e.target.value)}
                >
                  <MenuItem value="automatic">Automatic</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="semi-automatic">Semi-Automatic</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Mileage"
                value={formData.mileage}
                onChange={(e) => handleChange('mileage', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SpeedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">miles</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={colors}
                value={formData.color}
                onChange={(_, newValue) => handleChange('color', newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Exterior Color"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <ColorIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                freeSolo
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Engine Size"
                value={formData.engine_size}
                onChange={(e) => handleChange('engine_size', e.target.value)}
                placeholder="e.g., 2.0L, 3.5L V6, Electric"
                helperText="Optional"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Horsepower"
                value={formData.horsepower}
                onChange={(e) => handleChange('horsepower', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">HP</InputAdornment>,
                }}
                helperText="Optional"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="VIN (Vehicle Identification Number)"
                value={formData.vin}
                onChange={(e) => handleChange('vin', e.target.value)}
                placeholder="17-character VIN"
                inputProps={{ maxLength: 17 }}
                helperText="Optional - Adds credibility to your listing"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<MoneyIcon />}>
                Set your price and specify the vehicle location
              </Alert>
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                required
                type="number"
                label="Price"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  label="Currency"
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="CAD">CAD ($)</MenuItem>
                  <MenuItem value="AUD">AUD ($)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
                {formData.currency === 'USD' && '$'}
                {formData.currency === 'EUR' && '€'}
                {formData.currency === 'GBP' && '£'}
                {formData.price ? parseFloat(formData.price).toLocaleString() : '0'}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Location
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Los Angeles, CA or New York, NY"
                helperText="City and state/province"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Latitude"
                value={formData.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                placeholder="e.g., 34.0522"
                helperText="Optional - For map display"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Longitude"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                placeholder="e.g., -118.2437"
                helperText="Optional - For map display"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_featured}
                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>Feature this listing</Typography>
                    <Chip label="Premium" size="small" color="warning" />
                  </Box>
                }
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<UploadIcon />}>
                Add images and features to make your listing stand out
              </Alert>
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Vehicle Images
              </Typography>
              <Paper
                sx={{
                  p: 3,
                  border: `2px dashed ${theme.palette.divider}`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: theme.palette.action.hover,
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PNG, JPG or WEBP (max. 5MB each)
                </Typography>
              </Paper>
            </Grid>

            {/* Image Preview */}
            {images.length > 0 && (
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {images.map((image, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Paper
                        sx={{
                          position: 'relative',
                          paddingTop: '75%',
                          overflow: 'hidden',
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          component="img"
                          src={image}
                          alt={`Vehicle ${index + 1}`}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        {index === 0 && (
                          <Chip
                            label="Main"
                            size="small"
                            color="primary"
                            sx={{ position: 'absolute', top: 8, left: 8 }}
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Features & Equipment
              </Typography>
            </Grid>

            {/* Feature Selection */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={commonFeatures}
                value={selectedFeatures}
                onChange={(_, newValue) => setSelectedFeatures(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Features" placeholder="Choose features" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} color="primary" />
                  ))
                }
              />
            </Grid>

            {/* Custom Feature */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add Custom Feature"
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddFeature}>
                  Add
                </Button>
              </Box>
            </Grid>

            {/* 3D Model */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.has_3d_model}
                    onChange={(e) => handleChange('has_3d_model', e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>Add 3D Model</Typography>
                    <Chip label="Premium" size="small" color="secondary" />
                  </Box>
                }
              />
            </Grid>

            {formData.has_3d_model && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="3D Model URL"
                  value={formData.model_3d_url}
                  onChange={(e) => handleChange('model_3d_url', e.target.value)}
                  placeholder="https://example.com/model.glb"
                  helperText="URL to your 3D model file (GLB, GLTF formats)"
                />
              </Grid>
            )}
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="success" icon={<CheckIcon />}>
                Review your listing before publishing
              </Alert>
            </Grid>

            {/* Preview Card */}
            <Grid item xs={12}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
                }}
              >
                <CardContent>
                  <Grid container spacing={3}>
                    {/* Main Image */}
                    <Grid item xs={12} md={5}>
                      {images.length > 0 ? (
                        <Box
                          component="img"
                          src={images[0]}
                          alt={formData.title}
                          sx={{
                            width: '100%',
                            height: 300,
                            objectFit: 'cover',
                            borderRadius: 2,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: 300,
                            bgcolor: 'action.hover',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CarIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                        </Box>
                      )}
                    </Grid>

                    {/* Details */}
                    <Grid item xs={12} md={7}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={formData.car_condition} color="primary" />
                        <Chip label={formData.body_type} variant="outlined" />
                        {formData.is_featured && <Chip label="Featured" color="warning" />}
                      </Box>

                      <Typography variant="h4" fontWeight={700} gutterBottom>
                        {formData.title || 'Untitled Vehicle'}
                      </Typography>

                      <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
                        {formData.currency === 'USD' && '$'}
                        {formData.currency === 'EUR' && '€'}
                        {formData.currency === 'GBP' && '£'}
                        {formData.price ? parseFloat(formData.price).toLocaleString() : '0'}
                      </Typography>

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Brand
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formData.brand || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Model
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formData.model || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Year
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formData.year}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Mileage
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formData.mileage ? parseInt(formData.mileage).toLocaleString() : 'N/A'} mi
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Fuel Type
                          </Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {formData.fuel_type}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Transmission
                          </Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {formData.transmission}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Color
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formData.color || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Location
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formData.location || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>

                      {selectedFeatures.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Features ({selectedFeatures.length})
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selectedFeatures.slice(0, 5).map((feature, index) => (
                              <Chip key={index} label={feature} size="small" />
                            ))}
                            {selectedFeatures.length > 5 && (
                              <Chip label={`+${selectedFeatures.length - 5} more`} size="small" />
                            )}
                          </Box>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Description */}
            {formData.description && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Additional Info */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Additional Information
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Images
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {images.length} uploaded
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Features
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedFeatures.length} selected
                      </Typography>
                    </Box>
                    {formData.vin && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          VIN
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formData.vin}
                        </Typography>
                      </Box>
                    )}
                    {formData.has_3d_model && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          3D Model
                        </Typography>
                        <Chip label="Included" size="small" color="success" />
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <DealerLayout>
      <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Add New Vehicle
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create a detailed listing for your vehicle
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('/dealer/vehicles')}>
            Back to Vehicles
          </Button>
        </Box>

        {/* Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            {renderStepContent(activeStep)}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<BackIcon />}
            size="large"
          >
            Back
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep === steps.length - 1 && (
              <Button
                variant="outlined"
                onClick={() => handleSubmit('draft')}
                startIcon={<SaveIcon />}
                size="large"
              >
                Save as Draft
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => handleSubmit('active')}
                startIcon={<CheckIcon />}
                size="large"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  minWidth: 150,
                }}
              >
                Publish
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ForwardIcon />}
                size="large"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  minWidth: 150,
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </DealerLayout>
  );
};

export default AddVehicle;

