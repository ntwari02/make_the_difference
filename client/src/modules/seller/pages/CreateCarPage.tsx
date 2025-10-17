import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { sellerApi } from '../services/sellerApi';
import SellerLayout from '../components/layout/SellerLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  AttachMoney as MoneyIcon,
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
  Speed as SpeedIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  LocalGasStation as FuelIcon,
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

interface CarFormData {
  title: string;
  description: string;
  brand: string;
  model: string;
  year: number | '';
  mileage: number | '';
  price: number | '';
  currency: string;
  quantity: number | '';
  unitPrice: number | '';
  totalPrice: number | '';
  number_of_seats: number | '';
  car_condition: string;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  engine_size: string;
  horsepower: number | '';
  vin: string;
  location: string;
  latitude: number | '';
  longitude: number | '';
  images: File[];
  features: string[];
  is_featured: boolean;
}

const CreateCarPage: React.FC = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const sellerId = (authUser as any)?.id || (authUser as any)?._id;
  
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'success'
  });

  const [formData, setFormData] = useState<CarFormData>({
    title: '',
    description: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    price: '',
    currency: 'USD',
    quantity: 1,
    unitPrice: '',
    totalPrice: '',
    number_of_seats: 5,
    car_condition: 'used',
    fuel_type: 'petrol',
    transmission: 'automatic',
    body_type: 'sedan',
    color: '',
    engine_size: '',
    horsepower: '',
    vin: '',
    location: '',
    latitude: '',
    longitude: '',
    images: [],
    features: [],
    is_featured: false,
  });

  const steps = [
    'Basic Information',
    'Specifications',
    'Pricing & Details',
    'Images & Features',
    'Review & Submit'
  ];

  const handleInputChange = (field: keyof CarFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate total price when quantity or unit price changes
      if (field === 'quantity' || field === 'unitPrice' || field === 'price') {
        const quantity = Number(newData.quantity) || 1;
        const unitPrice = Number(newData.unitPrice) || Number(newData.price) || 0;
        newData.totalPrice = quantity * unitPrice;
      }
      
      return newData;
    });
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!sellerId) {
      setFeedback({
        open: true,
        message: 'Please log in to create a car listing',
        severity: 'error'
      });
      return;
    }

    setSaving(true);
    try {
      // Convert File objects to base64 strings for backend
      const processImages = async (files: File[]) => {
        const processedImages = [];
        for (const file of files) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          processedImages.push({
            name: file.name,
            type: file.type,
            data: base64,
            size: file.size
          });
        }
        return processedImages;
      };

      // Prepare data for backend
      const carData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        price: Number(formData.price),
        currency: formData.currency,
        quantity: Number(formData.quantity) || 1,
        unitPrice: Number(formData.unitPrice) || Number(formData.price),
        totalPrice: Number(formData.totalPrice) || Number(formData.price),
        number_of_seats: Number(formData.number_of_seats) || 5,
        car_condition: formData.car_condition,
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        body_type: formData.body_type,
        color: formData.color.trim(),
        engine_size: formData.engine_size?.trim() || undefined,
        horsepower: formData.horsepower ? Number(formData.horsepower) : undefined,
        vin: formData.vin?.trim() || undefined,
        location: formData.location.trim(),
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        images: await processImages(formData.images),
        features: formData.features,
        is_featured: formData.is_featured,
      };

      // Remove undefined values to avoid validation issues
      const cleanCarData = Object.fromEntries(
        Object.entries(carData).filter(([_, value]) => value !== undefined)
      );

      console.log('Sending car data:', cleanCarData); // Debug log
      const response = await sellerApi.cars.createCar(cleanCarData);
      
      setFeedback({
        open: true,
        message: 'Car listing created successfully!',
        severity: 'success'
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        brand: '',
        model: '',
        year: '',
        mileage: '',
        price: '',
        currency: 'USD',
        quantity: 1,
        unitPrice: '',
        totalPrice: '',
        number_of_seats: 5,
        car_condition: 'used',
        fuel_type: 'petrol',
        transmission: 'automatic',
        body_type: 'sedan',
        color: '',
        engine_size: '',
        horsepower: '',
        vin: '',
        location: '',
        latitude: '',
        longitude: '',
        images: [],
        features: [],
        is_featured: false,
      });
      setActiveStep(0);

    } catch (error: any) {
      console.error('Error creating car:', error);
      
      // Extract validation errors from response
      let errorMessage = 'Failed to create car listing';
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        errorMessage = validationErrors.map((err: any) => err.msg).join(', ');
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setFeedback({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = (step: number) => {
    const stepContentStyle = {
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 3,
    };

    const inputStyle = {
      '& .MuiInputBase-root': {
        height: '56px', // Equal height for all inputs
      },
    };

    switch (step) {
      case 0:
        return (
          <Box sx={stepContentStyle}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <TextField
                fullWidth
                label="Listing Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Clean 2018 Honda Civic"
                required
                helperText="5-255 characters"
                sx={inputStyle}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    required
                    sx={inputStyle}
                  >
                    <MenuItem value="">Select Brand</MenuItem>
                    {['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Nissan', 'Hyundai', 'Kia', 'Volkswagen', 'Audi', 'Chevrolet', 'Mazda', 'Subaru', 'Lexus', 'Infiniti'].map(brand => (
                      <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Model"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="e.g., Civic"
                    required
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Year"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                    required
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Mileage (km)"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange('mileage', e.target.value)}
                    inputProps={{ min: 0 }}
                    required
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                rows={6}
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the car's condition, history, features..."
                helperText="Optional, max 2000 characters"
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '120px', // Equal height for multiline
                  },
                }}
              />
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Step 1 of 5: Basic Information
              </Typography>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={stepContentStyle}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Fuel Type"
                    value={formData.fuel_type}
                    onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                    required
                    sx={inputStyle}
                  >
                    <MenuItem value="petrol">Petrol</MenuItem>
                    <MenuItem value="diesel">Diesel</MenuItem>
                    <MenuItem value="electric">Electric</MenuItem>
                    <MenuItem value="hybrid">Hybrid</MenuItem>
                    <MenuItem value="lpg">LPG</MenuItem>
                    <MenuItem value="cng">CNG</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Transmission"
                    value={formData.transmission}
                    onChange={(e) => handleInputChange('transmission', e.target.value)}
                    required
                    sx={inputStyle}
                  >
                    <MenuItem value="manual">Manual</MenuItem>
                    <MenuItem value="automatic">Automatic</MenuItem>
                    <MenuItem value="semi-automatic">Semi-Automatic</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Body Type"
                    value={formData.body_type}
                    onChange={(e) => handleInputChange('body_type', e.target.value)}
                    required
                    sx={inputStyle}
                  >
                    <MenuItem value="sedan">Sedan</MenuItem>
                    <MenuItem value="suv">SUV</MenuItem>
                    <MenuItem value="hatchback">Hatchback</MenuItem>
                    <MenuItem value="coupe">Coupe</MenuItem>
                    <MenuItem value="convertible">Convertible</MenuItem>
                    <MenuItem value="wagon">Wagon</MenuItem>
                    <MenuItem value="pickup">Pickup</MenuItem>
                    <MenuItem value="van">Van</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Condition"
                    value={formData.car_condition}
                    onChange={(e) => handleInputChange('car_condition', e.target.value)}
                    required
                    sx={inputStyle}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="used">Used</MenuItem>
                    <MenuItem value="certified">Certified</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="e.g., Red"
                    required
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Number of Seats"
                    value={formData.number_of_seats}
                    onChange={(e) => handleInputChange('number_of_seats', e.target.value)}
                    inputProps={{ min: 1, max: 50 }}
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Engine Size"
                    value={formData.engine_size}
                    onChange={(e) => handleInputChange('engine_size', e.target.value)}
                    placeholder="e.g., 2.0L"
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Horsepower"
                    value={formData.horsepower}
                    onChange={(e) => handleInputChange('horsepower', e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="VIN (Vehicle Identification Number)"
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value)}
                placeholder="17-character VIN"
                inputProps={{ maxLength: 17 }}
                helperText="Optional, must be exactly 17 characters"
                sx={inputStyle}
              />
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Step 2 of 5: Specifications
              </Typography>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={stepContentStyle}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price (USD)"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    required
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    inputProps={{ min: 1 }}
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Unit Price (USD)"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Price (USD)"
                    value={formData.totalPrice}
                    InputProps={{ readOnly: true }}
                    helperText="Calculated automatically"
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., New York, NY"
                required
                helperText="5-255 characters"
                sx={inputStyle}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Latitude"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    inputProps={{ min: -90, max: 90, step: 0.000001 }}
                    helperText="Optional"
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Longitude"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    inputProps={{ min: -180, max: 180, step: 0.000001 }}
                    helperText="Optional"
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    />
                  }
                  label="Featured Listing"
                />
              </Box>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Step 3 of 5: Pricing & Details
              </Typography>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={stepContentStyle}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhotoCameraIcon /> Upload Images
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCameraIcon />}
                    fullWidth
                    sx={{ mb: 2, height: '56px' }} // Equal height with inputs
                  >
                    Upload Images
                  </Button>
                </label>
                
                {formData.images.length > 0 && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
                    {formData.images.map((file, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removeImage(index)}
                          sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5 }}
                        >
                          ×
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon /> Features
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Enter features separated by commas (e.g., Air Conditioning, Bluetooth, Navigation)"
                  onChange={(e) => {
                    const features = e.target.value.split(',').map(f => f.trim()).filter(f => f);
                    handleInputChange('features', features);
                  }}
                  helperText="Separate features with commas"
                  sx={{
                    '& .MuiInputBase-root': {
                      minHeight: '120px', // Equal height for multiline
                    },
                  }}
                />
                {formData.features.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.features.map((feature, index) => (
                      <Chip key={index} label={feature} size="small" />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Step 4 of 5: Images & Features
              </Typography>
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box sx={stepContentStyle}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CarIcon /> Review Your Listing
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon /> Basic Information
                      </Typography>
                      <Typography variant="body2"><strong>Title:</strong> {formData.title}</Typography>
                      <Typography variant="body2"><strong>Brand:</strong> {formData.brand}</Typography>
                      <Typography variant="body2"><strong>Model:</strong> {formData.model}</Typography>
                      <Typography variant="body2"><strong>Year:</strong> {formData.year}</Typography>
                      <Typography variant="body2"><strong>Mileage:</strong> {formData.mileage} km</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsIcon /> Specifications
                      </Typography>
                      <Typography variant="body2"><strong>Fuel:</strong> {formData.fuel_type}</Typography>
                      <Typography variant="body2"><strong>Transmission:</strong> {formData.transmission}</Typography>
                      <Typography variant="body2"><strong>Body:</strong> {formData.body_type}</Typography>
                      <Typography variant="body2"><strong>Condition:</strong> {formData.car_condition}</Typography>
                      <Typography variant="body2"><strong>Color:</strong> {formData.color}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MoneyIcon /> Pricing
                      </Typography>
                      <Typography variant="body2"><strong>Price:</strong> ${formData.price}</Typography>
                      <Typography variant="body2"><strong>Quantity:</strong> {formData.quantity}</Typography>
                      <Typography variant="body2"><strong>Total:</strong> ${formData.totalPrice}</Typography>
                      <Typography variant="body2"><strong>Location:</strong> {formData.location}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon /> Additional Info
                      </Typography>
                      <Typography variant="body2"><strong>Images:</strong> {formData.images.length} uploaded</Typography>
                      <Typography variant="body2"><strong>Features:</strong> {formData.features.length} listed</Typography>
                      <Typography variant="body2"><strong>Featured:</strong> {formData.is_featured ? 'Yes' : 'No'}</Typography>
                      <Typography variant="body2"><strong>Seats:</strong> {formData.number_of_seats}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {formData.description && (
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon /> Description
                    </Typography>
                    <Typography variant="body2">{formData.description}</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Step 5 of 5: Review & Submit
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => window.history.back()}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Create New Car Listing
          </Typography>
        </Box>

        {/* Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep} orientation={isSmall ? 'vertical' : 'horizontal'}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent>
            {renderStepContent(activeStep)}
            
            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Create Listing'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Feedback Snackbar */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={() => setFeedback(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setFeedback(prev => ({ ...prev, open: false }))} 
          severity={feedback.severity} 
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </SellerLayout>
  );
};

export default CreateCarPage;
