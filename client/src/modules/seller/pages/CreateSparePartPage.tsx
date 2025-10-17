import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { sellerApi } from '../services/sellerApi';
import SellerLayout from '../components/layout/SellerLayout';
import { toast } from 'react-hot-toast';
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
  Autocomplete,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  AttachMoney as MoneyIcon,
  Build as BuildIcon,
  LocationOn as LocationIcon,
  Speed as SpeedIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  LocalGasStation as FuelIcon,
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  BrandingWatermark as BrandIcon,
  Inventory as InventoryIcon,
  DirectionsCar as CarIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface SparePartFormData {
  name: string;
  description: string;
  short_description: string;
  category_id: string;
  brand_id: string;
  part_number: string;
  oem_number: string;
  price: number | '';
  currency: string;
  cost_price: number | '';
  msrp: number | '';
  discount_percentage: number | '';
  discount_expires_at: string;
  weight: number | '';
  dimensions: {
    length: number | '';
    width: number | '';
    height: number | '';
  };
  images: File[];
  specifications: { [key: string]: string };
  features: string[];
  warranty_period: number | '';
  warranty_type: string;
  condition: string;
  stock_quantity: number | '';
  min_stock_level: number | '';
  max_stock_level: number | '';
  is_installable: boolean;
  installation_difficulty: string;
  estimated_installation_time: number | '';
  installation_cost: number | '';
  shipping_weight: number | '';
  shipping_dimensions: {
    length: number | '';
    width: number | '';
    height: number | '';
  };
  vehicle_compatibility: Array<{
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year_from: number | '';
    vehicle_year_to: number | '';
    engine_type: string;
    engine_size: string;
    fuel_type: string;
    transmission_type: string;
    body_type: string;
    trim_level: string;
    notes: string;
    compatibility_confidence: number | '';
  }>;
  is_featured: boolean;
}

const CreateSparePartPage: React.FC = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const sellerId = (authUser as any)?.id || (authUser as any)?._id;
  
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'success'
  });

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);

  const [formData, setFormData] = useState<SparePartFormData>({
    name: '',
    description: '',
    short_description: '',
    category_id: '',
    brand_id: '',
    part_number: '',
    oem_number: '',
    price: '',
    currency: 'USD',
    cost_price: '',
    msrp: '',
    discount_percentage: '',
    discount_expires_at: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
    images: [],
    specifications: {},
    features: [],
    warranty_period: '',
    warranty_type: 'manufacturer',
    condition: 'new',
    stock_quantity: '',
    min_stock_level: 5,
    max_stock_level: 1000,
    is_installable: true,
    installation_difficulty: 'medium',
    estimated_installation_time: '',
    installation_cost: '',
    shipping_weight: '',
    shipping_dimensions: {
      length: '',
      width: '',
      height: '',
    },
    vehicle_compatibility: [{
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year_from: '',
      vehicle_year_to: '',
      engine_type: '',
      engine_size: '',
      fuel_type: '',
      transmission_type: '',
      body_type: '',
      trim_level: '',
      notes: '',
      compatibility_confidence: 1.0,
    }],
    is_featured: false,
  });

  const steps = [
    'Basic Information',
    'Specifications & Features',
    'Pricing & Inventory',
    'Vehicle Compatibility',
    'Images & Review'
  ];

  // Load categories and brands
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [categoriesData, brandsData] = await Promise.all([
          sellerApi.parts.getCategories(),
          sellerApi.parts.getBrands()
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error('Error loading data:', error);
        setFeedback({
          open: true,
          message: 'Failed to load categories and brands',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof SparePartFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parentField: keyof SparePartFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [field]: value
      }
    }));
  };

  const handleCompatibilityChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      vehicle_compatibility: prev.vehicle_compatibility.map((comp, i) => 
        i === index ? { ...comp, [field]: value } : comp
      )
    }));
  };

  const addCompatibility = () => {
    setFormData(prev => ({
      ...prev,
      vehicle_compatibility: [...prev.vehicle_compatibility, {
        vehicle_make: '',
        vehicle_model: '',
        vehicle_year_from: '',
        vehicle_year_to: '',
        engine_type: '',
        engine_size: '',
        fuel_type: '',
        transmission_type: '',
        body_type: '',
        trim_level: '',
        notes: '',
        compatibility_confidence: 1.0,
      }]
    }));
  };

  const removeCompatibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vehicle_compatibility: prev.vehicle_compatibility.filter((_, i) => i !== index)
    }));
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
        message: 'Please log in to create a spare part listing',
        severity: 'error'
      });
      return;
    }

    setSaving(true);
    try {
      // Validate warranty period
      if (formData.warranty_period !== '' && (Number(formData.warranty_period) < 0 || Number(formData.warranty_period) > 120)) {
        toast.error('Warranty period must be between 0 and 120 months');
        setFeedback({
          open: true,
          message: 'Warranty period must be between 0 and 120 months',
          severity: 'error'
        });
        return;
      }

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

      // Helper function to convert undefined to null for SQL compatibility
      const toNull = (value: any) => value === undefined ? null : value;

      // Validate required fields before sending
      if (!formData.name.trim()) {
        toast.error('Part name is required');
        setFeedback({
          open: true,
          message: 'Part name is required',
          severity: 'error'
        });
        return;
      }

      if (!formData.category_id) {
        toast.error('Category is required');
        setFeedback({
          open: true,
          message: 'Category is required',
          severity: 'error'
        });
        return;
      }

      if (!formData.brand_id) {
        toast.error('Brand is required');
        setFeedback({
          open: true,
          message: 'Brand is required',
          severity: 'error'
        });
        return;
      }

      if (!formData.price || Number(formData.price) <= 0) {
        toast.error('Price must be greater than 0');
        setFeedback({
          open: true,
          message: 'Price must be greater than 0',
          severity: 'error'
        });
        return;
      }

      // Prepare data for backend
      const partData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        short_description: formData.short_description.trim() || null,
        category_id: formData.category_id,
        brand_id: formData.brand_id,
        part_number: formData.part_number.trim() || null,
        oem_number: formData.oem_number.trim() || null,
        price: Number(formData.price),
        currency: formData.currency,
        cost_price: formData.cost_price ? Number(formData.cost_price) : null,
        msrp: formData.msrp ? Number(formData.msrp) : null,
        discount_percentage: formData.discount_percentage ? Number(formData.discount_percentage) : null,
        discount_expires_at: formData.discount_expires_at || null,
        weight: formData.weight ? Number(formData.weight) : null,
        dimensions: formData.dimensions.length || formData.dimensions.width || formData.dimensions.height ? {
          length: formData.dimensions.length ? Number(formData.dimensions.length) : null,
          width: formData.dimensions.width ? Number(formData.dimensions.width) : null,
          height: formData.dimensions.height ? Number(formData.dimensions.height) : null,
        } : null,
        images: await processImages(formData.images),
        specifications: formData.specifications,
        features: formData.features,
        warranty_period: formData.warranty_period ? Number(formData.warranty_period) : null,
        warranty_type: formData.warranty_type,
        condition: formData.condition,
        stock_quantity: Number(formData.stock_quantity) || 0,
        min_stock_level: Number(formData.min_stock_level) || 5,
        max_stock_level: Number(formData.max_stock_level) || 1000,
        is_installable: formData.is_installable,
        installation_difficulty: formData.installation_difficulty,
        estimated_installation_time: formData.estimated_installation_time ? Number(formData.estimated_installation_time) : null,
        installation_cost: formData.installation_cost ? Number(formData.installation_cost) : null,
        shipping_weight: formData.shipping_weight ? Number(formData.shipping_weight) : null,
        shipping_dimensions: formData.shipping_dimensions.length || formData.shipping_dimensions.width || formData.shipping_dimensions.height ? {
          length: formData.shipping_dimensions.length ? Number(formData.shipping_dimensions.length) : null,
          width: formData.shipping_dimensions.width ? Number(formData.shipping_dimensions.width) : null,
          height: formData.shipping_dimensions.height ? Number(formData.shipping_dimensions.height) : null,
        } : null,
        vehicle_compatibility: formData.vehicle_compatibility.filter(comp => 
          comp.vehicle_make && comp.vehicle_model && comp.vehicle_year_from && comp.vehicle_year_to
        ).map(comp => ({
          vehicle_make: comp.vehicle_make,
          vehicle_model: comp.vehicle_model,
          vehicle_year_from: Number(comp.vehicle_year_from),
          vehicle_year_to: Number(comp.vehicle_year_to),
          engine_type: comp.engine_type && comp.engine_type.trim() ? comp.engine_type.trim() : null,
          engine_size: comp.engine_size && comp.engine_size.trim() ? comp.engine_size.trim() : null,
          fuel_type: comp.fuel_type && comp.fuel_type.trim() ? comp.fuel_type.trim() : null,
          transmission_type: comp.transmission_type && comp.transmission_type.trim() ? comp.transmission_type.trim() : null,
          body_type: comp.body_type && comp.body_type.trim() ? comp.body_type.trim() : null,
          trim_level: comp.trim_level && comp.trim_level.trim() ? comp.trim_level.trim() : null,
          notes: comp.notes && comp.notes.trim() ? comp.notes.trim() : null,
          compatibility_confidence: Number(comp.compatibility_confidence) || 1.0,
        })),
        is_featured: formData.is_featured,
      };

      // Remove undefined values and convert empty strings to null for optional fields
      const cleanPartData = Object.fromEntries(
        Object.entries(partData).map(([key, value]) => {
          if (value === undefined) return [key, null];
          if (value === '') return [key, null];
          return [key, value];
        }).filter(([_, value]) => value !== undefined)
      );

      console.log('Sending spare part data:', cleanPartData);
      console.log('Vehicle compatibility data:', cleanPartData.vehicle_compatibility);
      const response = await sellerApi.parts.createPart(cleanPartData);
      
      toast.success('Spare part listing created successfully!');
      setFeedback({
        open: true,
        message: 'Spare part listing created successfully!',
        severity: 'success'
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        short_description: '',
        category_id: '',
        brand_id: '',
        part_number: '',
        oem_number: '',
        price: '',
        currency: 'USD',
        cost_price: '',
        msrp: '',
        discount_percentage: '',
        discount_expires_at: '',
        weight: '',
        dimensions: {
          length: '',
          width: '',
          height: '',
        },
        images: [],
        specifications: {},
        features: [],
        warranty_period: '',
        warranty_type: 'manufacturer',
        condition: 'new',
        stock_quantity: '',
        min_stock_level: 5,
        max_stock_level: 1000,
        is_installable: true,
        installation_difficulty: 'medium',
        estimated_installation_time: '',
        installation_cost: '',
        shipping_weight: '',
        shipping_dimensions: {
          length: '',
          width: '',
          height: '',
        },
        vehicle_compatibility: [{
          vehicle_make: '',
          vehicle_model: '',
          vehicle_year_from: '',
          vehicle_year_to: '',
          engine_type: '',
          engine_size: '',
          fuel_type: '',
          transmission_type: '',
          body_type: '',
          trim_level: '',
          notes: '',
          compatibility_confidence: 1.0,
        }],
        is_featured: false,
      });
      setActiveStep(0);

    } catch (error: any) {
      console.error('Error creating spare part:', error);
      console.error('Error response:', error.response?.data);
      
      // Extract validation errors from response
      let errorMessage = 'Failed to create spare part listing';
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        errorMessage = validationErrors.map((err: any) => err.msg).join(', ');
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
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
        height: '56px',
      },
    };

    switch (step) {
      case 0:
        return (
          <Box sx={stepContentStyle}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <TextField
                fullWidth
                label="Part Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Brake Pad Set Front"
                required
                helperText="5-255 characters"
                sx={inputStyle}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={categories}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.id}
                    value={categories.find(cat => cat.id === formData.category_id) || null}
                    onChange={(_, newValue) => handleInputChange('category_id', newValue?.id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        required
                        sx={inputStyle}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={brands}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.id}
                    value={brands.find(brand => brand.id === formData.brand_id) || null}
                    onChange={(_, newValue) => handleInputChange('brand_id', newValue?.id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Brand"
                        required
                        sx={inputStyle}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Part Number"
                    value={formData.part_number}
                    onChange={(e) => handleInputChange('part_number', e.target.value)}
                    placeholder="e.g., BP12345"
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="OEM Number"
                    value={formData.oem_number}
                    onChange={(e) => handleInputChange('oem_number', e.target.value)}
                    placeholder="e.g., 1234567890"
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Short Description"
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                placeholder="Brief description for search results..."
                helperText="Optional, max 500 characters"
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '120px',
                  },
                }}
              />

              <TextField
                fullWidth
                multiline
                rows={6}
                label="Detailed Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the part, its features, and benefits..."
                helperText="Optional, max 2000 characters"
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '120px',
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
                    label="Condition"
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    required
                    sx={inputStyle}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="used">Used</MenuItem>
                    <MenuItem value="refurbished">Refurbished</MenuItem>
                    <MenuItem value="remanufactured">Remanufactured</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Weight (kg)"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon /> Dimensions (cm)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Length"
                    value={formData.dimensions.length}
                    onChange={(e) => handleNestedInputChange('dimensions', 'length', e.target.value)}
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Width"
                    value={formData.dimensions.width}
                    onChange={(e) => handleNestedInputChange('dimensions', 'width', e.target.value)}
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Height"
                    value={formData.dimensions.height}
                    onChange={(e) => handleNestedInputChange('dimensions', 'height', e.target.value)}
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon /> Specifications
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {Object.entries(formData.specifications).map(([key, value], index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      label="Specification Name"
                      value={key}
                      onChange={(e) => {
                        const newSpecs = { ...formData.specifications };
                        delete newSpecs[key];
                        newSpecs[e.target.value] = value;
                        handleInputChange('specifications', newSpecs);
                      }}
                      sx={inputStyle}
                    />
                    <TextField
                      fullWidth
                      label="Value"
                      value={value}
                      onChange={(e) => {
                        const newSpecs = { ...formData.specifications };
                        newSpecs[key] = e.target.value;
                        handleInputChange('specifications', newSpecs);
                      }}
                      sx={inputStyle}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        const newSpecs = { ...formData.specifications };
                        delete newSpecs[key];
                        handleInputChange('specifications', newSpecs);
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const newSpecs = { ...formData.specifications };
                    newSpecs[`Specification ${Object.keys(newSpecs).length + 1}`] = '';
                    handleInputChange('specifications', newSpecs);
                  }}
                  fullWidth
                >
                  Add Specification
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon /> Features
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Enter features separated by commas (e.g., High Performance, Corrosion Resistant, Easy Installation)"
                onChange={(e) => {
                  const features = e.target.value.split(',').map(f => f.trim()).filter(f => f);
                  handleInputChange('features', features);
                }}
                helperText="Separate features with commas"
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '80px',
                  },
                }}
              />
              {formData.features.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.features.map((feature, index) => (
                    <Chip key={index} label={feature} size="small" />
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon /> Warranty
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Warranty Period (months)"
                    value={formData.warranty_period}
                    onChange={(e) => handleInputChange('warranty_period', e.target.value)}
                    inputProps={{ min: 0, max: 120 }}
                    helperText="Enter warranty period in months (0-120)"
                    error={formData.warranty_period !== '' && (Number(formData.warranty_period) < 0 || Number(formData.warranty_period) > 120)}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Warranty Type"
                    value={formData.warranty_type}
                    onChange={(e) => handleInputChange('warranty_type', e.target.value)}
                    sx={inputStyle}
                  >
                    <MenuItem value="manufacturer">Manufacturer</MenuItem>
                    <MenuItem value="seller">Seller</MenuItem>
                    <MenuItem value="extended">Extended</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Step 2 of 5: Specifications & Features
              </Typography>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={stepContentStyle}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon /> Pricing
              </Typography>
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
                    label="Cost Price (USD)"
                    value={formData.cost_price}
                    onChange={(e) => handleInputChange('cost_price', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="MSRP (USD)"
                    value={formData.msrp}
                    onChange={(e) => handleInputChange('msrp', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Discount Percentage"
                    value={formData.discount_percentage}
                    onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon /> Inventory
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Stock Quantity"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    inputProps={{ min: 0 }}
                    required
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Min Stock Level"
                    value={formData.min_stock_level}
                    onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Stock Level"
                    value={formData.max_stock_level}
                    onChange={(e) => handleInputChange('max_stock_level', e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon /> Installation
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_installable}
                        onChange={(e) => handleInputChange('is_installable', e.target.checked)}
                      />
                    }
                    label="Installable"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Installation Difficulty"
                    value={formData.installation_difficulty}
                    onChange={(e) => handleInputChange('installation_difficulty', e.target.value)}
                    disabled={!formData.is_installable}
                    sx={inputStyle}
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                    <MenuItem value="professional">Professional Only</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Estimated Installation Time (hours)"
                    value={formData.estimated_installation_time}
                    onChange={(e) => handleInputChange('estimated_installation_time', e.target.value)}
                    inputProps={{ min: 0, step: 0.5 }}
                    disabled={!formData.is_installable}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Installation Cost (USD)"
                    value={formData.installation_cost}
                    onChange={(e) => handleInputChange('installation_cost', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    disabled={!formData.is_installable}
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
                Step 3 of 5: Pricing & Inventory
              </Typography>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={stepContentStyle}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CarIcon /> Vehicle Compatibility
              </Typography>
              
              {formData.vehicle_compatibility.map((comp, index) => (
                <Card key={index} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Compatibility {index + 1}</Typography>
                    {formData.vehicle_compatibility.length > 1 && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeCompatibility(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Vehicle Make"
                        value={comp.vehicle_make}
                        onChange={(e) => handleCompatibilityChange(index, 'vehicle_make', e.target.value)}
                        placeholder="e.g., Toyota"
                        required
                        sx={inputStyle}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Vehicle Model"
                        value={comp.vehicle_model}
                        onChange={(e) => handleCompatibilityChange(index, 'vehicle_model', e.target.value)}
                        placeholder="e.g., Camry"
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
                        label="Year From"
                        value={comp.vehicle_year_from}
                        onChange={(e) => handleCompatibilityChange(index, 'vehicle_year_from', e.target.value)}
                        inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                        required
                        sx={inputStyle}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Year To"
                        value={comp.vehicle_year_to}
                        onChange={(e) => handleCompatibilityChange(index, 'vehicle_year_to', e.target.value)}
                        inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                        required
                        sx={inputStyle}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Engine Type"
                        value={comp.engine_type}
                        onChange={(e) => handleCompatibilityChange(index, 'engine_type', e.target.value)}
                        placeholder="e.g., 2.0L I4"
                        sx={inputStyle}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Fuel Type"
                        value={comp.fuel_type}
                        onChange={(e) => handleCompatibilityChange(index, 'fuel_type', e.target.value)}
                        sx={inputStyle}
                      >
                        <MenuItem value="">Select Fuel Type</MenuItem>
                        <MenuItem value="gasoline">Gasoline</MenuItem>
                        <MenuItem value="diesel">Diesel</MenuItem>
                        <MenuItem value="hybrid">Hybrid</MenuItem>
                        <MenuItem value="electric">Electric</MenuItem>
                        <MenuItem value="lpg">LPG</MenuItem>
                        <MenuItem value="cng">CNG</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Notes"
                    value={comp.notes}
                    onChange={(e) => handleCompatibilityChange(index, 'notes', e.target.value)}
                    placeholder="Additional compatibility notes..."
                    sx={{ mt: 2 }}
                  />
                </Card>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addCompatibility}
                fullWidth
              >
                Add Another Vehicle Compatibility
              </Button>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Step 4 of 5: Vehicle Compatibility
              </Typography>
            </Box>
          </Box>
        );

      case 4:
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
                    sx={{ mb: 2, height: '56px' }}
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
                  <BuildIcon /> Review Your Listing
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CategoryIcon /> Basic Information
                        </Typography>
                        <Typography variant="body2"><strong>Name:</strong> {formData.name}</Typography>
                        <Typography variant="body2"><strong>Category:</strong> {categories.find(cat => cat.id === formData.category_id)?.name || 'Not selected'}</Typography>
                        <Typography variant="body2"><strong>Brand:</strong> {brands.find(brand => brand.id === formData.brand_id)?.name || 'Not selected'}</Typography>
                        <Typography variant="body2"><strong>Part Number:</strong> {formData.part_number || 'Not provided'}</Typography>
                        <Typography variant="body2"><strong>Condition:</strong> {formData.condition}</Typography>
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
                        <Typography variant="body2"><strong>Stock:</strong> {formData.stock_quantity}</Typography>
                        <Typography variant="body2"><strong>Installable:</strong> {formData.is_installable ? 'Yes' : 'No'}</Typography>
                        <Typography variant="body2"><strong>Featured:</strong> {formData.is_featured ? 'Yes' : 'No'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CarIcon /> Compatibility
                        </Typography>
                        <Typography variant="body2"><strong>Vehicles:</strong> {formData.vehicle_compatibility.filter(comp => comp.vehicle_make && comp.vehicle_model).length}</Typography>
                        <Typography variant="body2"><strong>Images:</strong> {formData.images.length} uploaded</Typography>
                        <Typography variant="body2"><strong>Features:</strong> {formData.features.length} listed</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SettingsIcon /> Additional Info
                        </Typography>
                        <Typography variant="body2"><strong>Warranty:</strong> {formData.warranty_period ? `${formData.warranty_period} months` : 'Not specified'}</Typography>
                        <Typography variant="body2"><strong>Weight:</strong> {formData.weight ? `${formData.weight} kg` : 'Not specified'}</Typography>
                        <Typography variant="body2"><strong>Installation:</strong> {formData.installation_difficulty}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {formData.description && (
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon /> Description
                      </Typography>
                      <Typography variant="body2">{formData.description}</Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Step 5 of 5: Images & Review
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </SellerLayout>
    );
  }

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
            Create New Spare Part Listing
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

export default CreateSparePartPage;
