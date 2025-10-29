import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';
import PhotoUpload from '../../../shared/components/PhotoUpload';

// Mock data with proper UUIDs
const mockCategories = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Brake System', description: 'Brake pads, rotors, calipers, and related components' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Engine & Lubrication', description: 'Engine oil, filters, and lubrication systems' },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Air & Fuel System', description: 'Air filters, fuel filters, and intake systems' },
  { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Electrical System', description: 'Batteries, alternators, and electrical components' },
  { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Suspension & Steering', description: 'Shocks, struts, and steering components' },
  { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Exhaust System', description: 'Mufflers, catalytic converters, and exhaust pipes' },
];

const mockBrands = [
  { id: '550e8400-e29b-41d4-a716-446655440011', name: 'Bosch', logo_url: 'https://logos-world.net/wp-content/uploads/2021/08/Bosch-Logo.png' },
  { id: '550e8400-e29b-41d4-a716-446655440012', name: 'Mobil 1', logo_url: 'https://logos-world.net/wp-content/uploads/2021/08/Mobil-1-Logo.png' },
  { id: '550e8400-e29b-41d4-a716-446655440013', name: 'K&N', logo_url: 'https://logos-world.net/wp-content/uploads/2021/08/KN-Logo.png' },
  { id: '550e8400-e29b-41d4-a716-446655440014', name: 'ACDelco', logo_url: 'https://logos-world.net/wp-content/uploads/2021/08/ACDelco-Logo.png' },
  { id: '550e8400-e29b-41d4-a716-446655440015', name: 'NGK', logo_url: 'https://logos-world.net/wp-content/uploads/2021/08/NGK-Logo.png' },
];

interface SparePartFormData {
  // Essential Fields Only
  name: string;
  description: string;
  category_id: string;
  brand_id: string;
  price: number;
  quantity_available: number;
  status: 'active' | 'inactive';
  images: string[];
}

const SellerSparePartForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<SparePartFormData>({
    name: '',
    description: '',
    category_id: '',
    brand_id: '',
    price: 0,
    quantity_available: 0,
    status: 'active',
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadPart = async () => {
      if (!isEdit || !id) return;
      setLoading(true);
      try {
        const response = await sellerApi.spareParts.getById(id);
        const data = response.data || response; // some APIs return { data }
        // Safely parse images which may arrive as JSON string from DB
        const parsedImages = Array.isArray(data.images)
          ? data.images
          : (typeof data.images === 'string'
              ? (() => { try { const arr = JSON.parse(data.images); return Array.isArray(arr) ? arr : []; } catch { return []; } })()
              : []);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          category_id: data.category_id || '',
          brand_id: data.brand_id || '',
          price: Number(data.price) || 0,
          quantity_available: Number(data.quantity_available) || 0,
          status: (data.status === 'inactive' ? 'inactive' : 'active'),
          images: parsedImages,
        });
      } catch (e: any) {
        console.error('Failed to load spare part', e);
        toast.error(e?.response?.data?.message || 'Failed to load spare part');
      } finally {
        setLoading(false);
      }
    };
    loadPart();
  }, [isEdit, id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate all fields at once
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.brand_id) newErrors.brand_id = 'Brand is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.quantity_available < 0) newErrors.quantity_available = 'Quantity cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix all validation errors before saving');
      return;
    }

    // Simple authentication check
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to create spare parts');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Prepare the data for API call
      const apiData = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        brand_id: formData.brand_id,
        price: formData.price,
        currency: 'USD',
        quantity_available: formData.quantity_available,
        status: formData.status,
        // Add required fields with default values
        sku: `SP-${Date.now()}`, // Generate a simple SKU
        seller_id: 'current-seller-id', // This will be set by the backend
        quantity_reserved: 0,
        reorder_point: 10,
        vehicle_compatibility: [],
        images: isEdit ? formData.images : [], // For new parts, start with empty images array
        is_featured: false,
        requires_installation: false,
        warranty_period_months: 12,
        keywords: [],
      };

      // Use sellerApi which has proper authentication handling
      console.log('Sending API request:', apiData);
      console.log('Token from localStorage:', localStorage.getItem('access_token'));
      
      if (isEdit) {
        console.log('Updating spare part with ID:', id);
        await sellerApi.spareParts.update(id!, apiData);
        toast.success('Spare part updated successfully!');
      } else {
        console.log('Creating new spare part');
        const response = await sellerApi.spareParts.create(apiData);
        const newPartId = response.data?.id || response.id;
        
        // Upload any base64 images that were selected
        const base64Images = formData.images.filter(img => img.startsWith('data:'));
        if (base64Images.length > 0 && newPartId) {
          try {
            // Convert base64 to files and upload
            const files = await Promise.all(base64Images.map(async (base64) => {
              const response = await fetch(base64);
              const blob = await response.blob();
              return new File([blob], 'image.png', { type: 'image/png' });
            }));
            
            const uploadFormData = new FormData();
            files.forEach(file => {
              uploadFormData.append('images', file);
            });
            
            await sellerApi.spareParts.uploadImages(newPartId, uploadFormData);
            toast.success('Images uploaded successfully!');
          } catch (error: any) {
            console.error('Failed to upload images:', error);
            toast.error('Part created but failed to upload images');
          }
        }
        
        toast.success('Spare part created successfully!');
      }
      
      // Show success message and redirect after a short delay
      setTimeout(() => {
        navigate('/seller/spare-parts');
      }, 1500); // 1.5 second delay to show the success message
    } catch (error: any) {
      console.error('Error saving spare part:', error);
      toast.error(error.message || 'Failed to save spare part. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getFormContent = () => {
    return (
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {/* Left Column - Form Inputs */}
        <Box sx={{ flex: '1 1 75%', minWidth: '300px' }}>
          <Box sx={{ pr: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Spare Part Information
            </Typography>
            
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Part Name */}
            <TextField
              fullWidth
              label="Part Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
              placeholder="e.g., Front Brake Pads Set"
              required
              variant="outlined"
              size="medium"
            />
            
            {/* Description */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={Boolean(errors.description)}
              helperText={errors.description}
              placeholder="Brief description of the spare part..."
              required
              variant="outlined"
              size="medium"
            />
            
            {/* Category and Brand */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <FormControl fullWidth error={Boolean(errors.category_id)} required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category_id}
                    label="Category"
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    variant="outlined"
                    size="medium"
                  >
                    {mockCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        <Box>
                          <Typography variant="body1">{category.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {category.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <FormControl fullWidth error={Boolean(errors.brand_id)} required>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={formData.brand_id}
                    label="Brand"
                    onChange={(e) => handleInputChange('brand_id', e.target.value)}
                    variant="outlined"
                    size="medium"
                  >
                    {mockBrands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        <Typography variant="body1">{brand.name}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            {/* Pricing & Inventory Section */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
              Pricing & Inventory
            </Typography>
            
            {/* Pricing Fields */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <TextField
                  fullWidth
                  label="Selling Price (USD)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  error={Boolean(errors.price)}
                  helperText={errors.price}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  required
                  variant="outlined"
                  size="medium"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <TextField
                  fullWidth
                  label="Quantity Available"
                  type="number"
                  value={formData.quantity_available}
                  onChange={(e) => handleInputChange('quantity_available', parseInt(e.target.value) || 0)}
                  error={Boolean(errors.quantity_available)}
                  helperText={errors.quantity_available}
                  inputProps={{ min: 0 }}
                  required
                  variant="outlined"
                  size="medium"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    variant="outlined"
                    size="medium"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            {/* Images */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
              Product Images
            </Typography>
            <PhotoUpload
              images={formData.images}
              onImagesChange={(images) => handleInputChange('images', images)}
              maxImages={1}
              maxFileSize={15}
              entityType="spare-part"
              entityId={id}
              uploadEndpoint={isEdit && id ? `/api/seller/spare-parts/${id}/images` : undefined}
              label="Product Images"
              description="Upload clear photos of the spare part from different angles"
              aspectRatio="4/3"
              hideOverlayActions={true}
              replaceOnUpload={true}
            />
          </Box>
          </Box>
        </Box>

        {/* Right Column - Preview */}
        <Box sx={{ flex: '1 1 25%', minWidth: '300px' }}>
          <Box sx={{ pl: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Preview
            </Typography>
            
            <Card sx={{ 
              p: 3, 
              backgroundColor: 'grey.50', 
              border: '1px solid', 
              borderColor: 'grey.300',
              position: 'sticky',
              top: 20
            }}>
              <CardContent sx={{ p: 0 }}>
                {/* Product Preview */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {formData.name || 'Part Name'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {formData.description || 'Description will appear here...'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip 
                      label={mockCategories.find(c => c.id === formData.category_id)?.name || 'Category'} 
                      color="primary" 
                      variant="outlined" 
                      size="small"
                    />
                    <Chip 
                      label={mockBrands.find(b => b.id === formData.brand_id)?.name || 'Brand'} 
                      color="secondary" 
                      variant="outlined" 
                      size="small"
                    />
                  </Box>
                  
                  <Chip 
                    label={formData.status === 'active' ? 'Active' : 'Inactive'} 
                    color={formData.status === 'active' ? 'success' : 'default'} 
                    size="small"
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Pricing Summary */}
                <Typography variant="h6" gutterBottom>
                  Pricing Summary
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Selling Price:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatPrice(formData.price)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Quantity Available:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formData.quantity_available}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight={600}>Total Inventory Value:</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {formatPrice(formData.price * formData.quantity_available)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button 
            onClick={() => navigate('/seller/spare-parts')} 
            sx={{ mr: 2 }}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              {isEdit ? 'Edit Spare Part' : 'Create New Spare Part'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEdit ? 'Update your spare part information' : 'Add a new spare part to your inventory'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/seller/spare-parts')}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
          </Box>
        </Box>

        {/* Form Content */}
        <Card>
          <CardContent>
            {getFormContent()}
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/seller/spare-parts')}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                startIcon={<SaveIcon />}
                size="large"
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Spare Part' : 'Create Spare Part')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default SellerSparePartForm;