import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  MenuItem,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Save as SaveIcon, RestartAlt as ResetIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';
import { useDispatch } from 'react-redux';
import { updateCar as updateCarInStore } from '../store/sellerSlice';
import PhotoUpload from '../../../shared/components/PhotoUpload';
import { toast } from 'react-hot-toast';

type CarFormData = {
  title: string;
  brand: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  quantity: string;
  total: string;
  number_of_seats: string;
  car_condition: 'new' | 'used' | 'certified';
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'cng';
  transmission: 'automatic' | 'manual' | 'cvt' | 'semi-automatic';
  body_type: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible' | 'wagon' | 'pickup' | 'van';
  color: string;
  location: string;
  description: string;
  images: string[];
};

const SellerEditCar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CarFormData>({
    title: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    quantity: '1',
    total: '',
    number_of_seats: '5',
    car_condition: 'used',
    fuel_type: 'petrol',
    transmission: 'automatic',
    body_type: 'sedan',
    color: '',
    location: '',
    description: '',
    images: [],
  });

  // Auto-calculate total when quantity or price changes
  const calculatedTotal = useMemo(() => {
    const qty = parseInt(formData.quantity) || 0;
    const price = parseFloat(formData.price) || 0;
    return (qty * price).toString();
  }, [formData.quantity, formData.price]);

  useEffect(() => {
    if (calculatedTotal && calculatedTotal !== '0') {
      setFormData(prev => ({ ...prev, total: calculatedTotal }));
    }
  }, [calculatedTotal]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const car = await sellerApi.cars.getCar(id);
        // Map API car shape to form fields
        const price = (car as any).price || '';
        const quantity = (car as any).quantity?.toString() || '1';
        const total = (car as any).total_price?.toString() || '';
        
        setFormData({
          title: (car as any).title || `${(car as any).year || ''} ${(car as any).brand || ''} ${(car as any).model || ''}`.trim(),
          brand: (car as any).brand || (car as any).make || '',
          model: (car as any).model || '',
          year: (car as any).year?.toString() || '',
          price: price.toString(),
          mileage: (car as any).mileage?.toString() || '',
          quantity: quantity,
          total: total,
          number_of_seats: (car as any).number_of_seats?.toString() || '5',
          car_condition: (car as any).car_condition || (car as any).condition || 'used',
          fuel_type: (car as any).fuel_type || 'petrol',
          transmission: (car as any).transmission || 'automatic',
          body_type: (car as any).body_type || 'sedan',
          color: (car as any).color || '',
          location: (car as any).location || '',
          description: (car as any).description || '',
          images: (car as any).images || [],
        });
      } catch (e: any) {
        console.error('Failed to load car:', e);
        toast.error(e?.response?.data?.message || 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleInputChange = (field: keyof CarFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Validate required fields
    if (!formData.title || !formData.brand || !formData.model || !formData.year || 
        !formData.price || !formData.mileage || !formData.transmission || 
        !formData.body_type || !formData.color || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate quantity is at least 1
    if (parseInt(formData.quantity) < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    setSaving(true);
    try {
      // Filter out base64 data URLs, only keep file paths (uploaded images)
      const imagePaths = (formData.images || []).filter((img: string) => 
        img && !img.startsWith('data:') && (img.startsWith('/uploads/') || img.startsWith('http'))
      );

      const payload: any = {
        title: formData.title,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        mileage: parseInt(formData.mileage),
        quantity: parseInt(formData.quantity),
        total_price: parseFloat(formData.total || calculatedTotal),
        number_of_seats: parseInt(formData.number_of_seats),
        car_condition: formData.car_condition,
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        body_type: formData.body_type,
        color: formData.color,
        location: formData.location,
        description: formData.description || '',
        images: imagePaths,
      };

      const updated = await sellerApi.cars.updateCar(id, payload);
      dispatch(updateCarInStore(updated as any));
      toast.success('Car listing updated successfully!');
      navigate('/seller/cars');
    } catch (e: any) {
      console.error('Failed to update car:', e);
      toast.error(e?.response?.data?.message || 'Failed to update car listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <Typography>Loading car details...</Typography>
        </Box>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <Box sx={{ width: '100%', maxWidth: '100%', p: { xs: 2, sm: 3 } }}>
        <Card>
          <CardHeader 
            title="Edit Car Listing" 
            subheader={`Update your car details (${id})`}
            sx={{
              '& .MuiCardHeader-title': {
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }
            }}
          />
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Car Title"
                    value={formData.title}
                    onChange={handleInputChange('title')}
                    placeholder="e.g., 2020 Toyota Camry LE"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Brand"
                    value={formData.brand}
                    onChange={handleInputChange('brand')}
                    placeholder="e.g., Toyota"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Model"
                    value={formData.model}
                    onChange={handleInputChange('model')}
                    placeholder="e.g., Camry"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange('year')}
                    placeholder="2020"
                    required
                    inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Price ($)"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange('price')}
                    placeholder="25000"
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={handleInputChange('mileage')}
                    placeholder="35000"
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange('quantity')}
                    placeholder="1"
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Total Price ($)"
                    type="number"
                    value={formData.total || calculatedTotal}
                    disabled
                    InputProps={{
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    helperText="Auto-calculated from quantity × price"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Car Condition"
                    value={formData.car_condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, car_condition: e.target.value as any }))}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="used">Used</MenuItem>
                    <MenuItem value="certified">Certified Pre-owned</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Fuel Type"
                    value={formData.fuel_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuel_type: e.target.value as any }))}
                  >
                    <MenuItem value="petrol">Petrol</MenuItem>
                    <MenuItem value="diesel">Diesel</MenuItem>
                    <MenuItem value="electric">Electric</MenuItem>
                    <MenuItem value="hybrid">Hybrid</MenuItem>
                    <MenuItem value="lpg">LPG</MenuItem>
                    <MenuItem value="cng">CNG</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Transmission"
                    value={formData.transmission}
                    onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value as any }))}
                    required
                  >
                    <MenuItem value="automatic">Automatic</MenuItem>
                    <MenuItem value="manual">Manual</MenuItem>
                    <MenuItem value="cvt">CVT</MenuItem>
                    <MenuItem value="semi-automatic">Semi-Automatic</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number of Seats"
                    type="number"
                    value={formData.number_of_seats}
                    onChange={handleInputChange('number_of_seats')}
                    inputProps={{ min: 2, max: 16 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Body Type"
                    value={formData.body_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, body_type: e.target.value as any }))}
                    required
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
                    label="Color"
                    value={formData.color}
                    onChange={handleInputChange('color')}
                    placeholder="e.g., White, Black, Silver"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location}
                    onChange={handleInputChange('location')}
                    placeholder="e.g., New York, NY"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    placeholder="Describe the car's condition, features, and history..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <PhotoUpload
                    images={formData.images || []}
                    onImagesChange={(imageUrls) => {
                      setFormData(prev => ({ ...prev, images: imageUrls }));
                    }}
                    maxImages={10}
                    maxFileSize={5}
                    entityType="car"
                    entityId={id}
                    uploadEndpoint={id ? `/api/cars/${id}/images` : undefined}
                    label="Car Images"
                    description="Upload clear photos of the car. New uploads will replace existing images."
                    aspectRatio="16/9"
                    hideOverlayActions={false}
                    replaceOnUpload={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 2 }, 
                    justifyContent: { xs: 'center', sm: 'flex-end' }, 
                    mt: 2,
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/seller/cars')} 
                      startIcon={<ResetIcon />}
                      fullWidth={isSmall}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      startIcon={<SaveIcon />} 
                      disabled={saving}
                      fullWidth={isSmall}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default SellerEditCar;
