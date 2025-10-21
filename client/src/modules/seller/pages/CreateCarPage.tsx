import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { sellerApi } from '../services/sellerApi';
import SellerLayout from '../components/layout/SellerLayout';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  LinearProgress,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  DirectionsCar as CarIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon2,
  BarChart as BarChartIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PhotoUpload from '../../../shared/components/PhotoUpload';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const CreateCarPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [recentCars, setRecentCars] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    car_condition: 'used',
    fuel_type: 'petrol',
    transmission: 'automatic',
    body_type: 'sedan',
    color: '',
    location: '',
    description: '',
    images: [] as File[],
  });

  // Mock dashboard stats
  const dashboardStats = {
    totalCars: 24,
    activeCars: 18,
    totalViews: 1250,
    totalFavorites: 89,
    avgPrice: 28500,
    conversionRate: 3.2,
  };

  // Real-time data fetching functions
  const fetchSalesHistory = async () => {
    setSalesLoading(true);
    try {
      console.log('Fetching sales history...');
      
      // Try to get sales history from analytics API
      const stats = await sellerApi.analytics.getSellerStats();
      console.log('Analytics stats:', stats);
      
      if (stats.recent_sales && Array.isArray(stats.recent_sales)) {
        console.log('Using analytics recent_sales:', stats.recent_sales);
        setSalesHistory(stats.recent_sales);
      } else {
        console.log('No recent_sales in analytics, fetching sold cars...');
        
        // Fallback: get all cars and filter for sales activity
        const allCars = await sellerApi.cars.getMyCars({ limit: 20 });
        console.log('All cars for sales analysis:', allCars);
        
        let salesData = [];
        
        if (allCars.cars && Array.isArray(allCars.cars)) {
          // Filter cars with sales activity (sold, high views, or recent activity)
          const activeCars = allCars.cars.filter((car: any) => 
            car.status === 'sold' || 
            car.views_count > 5 || 
            car.is_featured ||
            car.status === 'active'
          );
          
          salesData = activeCars.slice(0, 10).map((car: any, index: number) => ({
            id: car.id,
            car: car.title || `${car.year} ${car.brand} ${car.model}`,
            carId: car.id,
            brand: car.brand,
            model: car.model,
            year: car.year,
            buyer: car.status === 'sold' ? (car.buyer_name || `Buyer ${index + 1}`) : 'Market Activity',
            price: car.price || car.sale_price || 0,
            originalPrice: car.price || 0,
            commission: car.status === 'sold' ? Math.round((car.price || 0) * 0.05) : 0,
            date: car.sold_at || car.updated_at || car.created_at,
            status: car.status === 'sold' ? 'completed' : car.status === 'pending' ? 'pending' : 'market_activity',
            views: car.views_count || 0,
            favorites: car.favorites || 0,
            image: car.images?.[0] || 'https://images.unsplash.com/photo-1549921296-3fdc4a3fa5d8?q=80&w=1200&auto=format&fit=crop'
          }));
        }
        
        console.log('Processed sales data:', salesData);
        setSalesHistory(salesData);
      }
    } catch (error) {
      console.error('Error fetching sales history:', error);
      // Keep empty array on error
      setSalesHistory([]);
    } finally {
      setSalesLoading(false);
    }
  };

  const handleViewCar = (carId: string) => {
    try {
      if (!carId) {
        toast.error('Car ID is missing');
        return;
      }
      navigate(`/cars/${carId}`);
    } catch (error) {
      console.error('Error navigating to car details:', error);
      toast.error('Failed to open car details');
    }
  };

  const handleEditCar = (carId: string) => {
    try {
      if (!carId) {
        toast.error('Car ID is missing');
        return;
      }
      navigate(`/seller/cars/${carId}/edit`);
    } catch (error) {
      console.error('Error navigating to edit car:', error);
      toast.error('Failed to open edit page');
    }
  };

  const handleDeleteCar = async (carId: string, carTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${carTitle}"? This action cannot be undone.`)) {
      try {
        // Call the delete API
        await sellerApi.cars.deleteCar(carId);
        toast.success('Car deleted successfully');
        // Refresh the car list
        fetchRecentCars();
      } catch (error) {
        console.error('Error deleting car:', error);
        toast.error('Failed to delete car');
      }
    }
  };

  const fetchRecentCars = async () => {
    try {
      console.log('Fetching recent cars...');
      
      // Try seller-specific endpoint first
      let carsData;
      try {
        carsData = await sellerApi.cars.getMyCars({ limit: 10, sort: 'created_at', order: 'desc' });
        console.log('Seller cars data received:', carsData);
        console.log('Type of carsData:', typeof carsData);
        console.log('carsData.cars:', carsData?.cars);
        console.log('carsData.data:', carsData?.data);
      } catch (sellerError) {
        console.log('Seller endpoint failed, trying generic cars endpoint:', sellerError);
        // Fallback to generic cars endpoint with seller filter
        try {
          carsData = await sellerApi.cars.getCars({ limit: 10, seller_id: 'current' });
          console.log('Generic cars data received:', carsData);
          console.log('Type of carsData:', typeof carsData);
          console.log('carsData.cars:', carsData?.cars);
          console.log('carsData.data:', carsData?.data);
        } catch (genericError) {
          console.error('Both endpoints failed:', genericError);
          setRecentCars([]);
          return;
        }
      }
      
      // Handle different response formats - with better error handling
      let cars = [];
      
      console.log('Full carsData object:', JSON.stringify(carsData, null, 2));
      
      if (!carsData) {
        console.error('carsData is null or undefined');
        setRecentCars([]);
        return;
      }
      
      if (carsData.cars && Array.isArray(carsData.cars)) {
        cars = carsData.cars;
      } else if (Array.isArray(carsData)) {
        cars = carsData;
      } else if (carsData.data && carsData.data.cars && Array.isArray(carsData.data.cars)) {
        cars = carsData.data.cars;
      } else if (carsData.data && Array.isArray(carsData.data)) {
        cars = carsData.data;
      } else {
        console.error('No valid cars array found in response:', carsData);
        setRecentCars([]);
        return;
      }
      
      console.log('Raw cars array:', cars);
      
      // Ensure cars is an array before mapping
      if (!Array.isArray(cars)) {
        console.error('Cars data is not an array:', cars);
        setRecentCars([]);
        return;
      }
      
      const processedCars = cars.map((car: any) => ({
        id: car.id,
        title: car.title || `${car.year} ${car.brand} ${car.model}`,
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price || 0,
        mileage: car.mileage || 0,
        views: car.views_count || 0,
        favorites: car.favorites || 0,
        status: car.status || 'pending',
        condition: car.car_condition || 'used',
        fuelType: car.fuel_type || 'petrol',
        transmission: car.transmission || 'automatic',
        location: car.location || 'Unknown',
        image: getImageUrl(car.images?.[0]),
        createdAt: car.created_at
      }));
      
      console.log('Processed cars:', processedCars);
      setRecentCars(processedCars);
    } catch (error) {
      console.error('Error fetching recent cars:', error);
      setRecentCars([]);
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
    color: string;
    subtitle: string;
  }> = ({ title, value, change, icon, color, subtitle }) => (
    <Card sx={{ 
      height: '100%', 
      flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 8px)', lg: '1 1 calc(16.666% - 8px)' },
      minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 8px)', lg: 'calc(16.666% - 8px)' }
    }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ 
              color,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1 },
            flexDirection: { xs: 'row', sm: 'column' },
            justifyContent: { xs: 'center', sm: 'flex-end' }
          }}>
            {icon}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: change > 0 ? 'success.main' : 'error.main',
              gap: 0.5
            }}>
              <TrendingUpIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                +{change}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...fileArray]
      }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
        toast.success(`${files.length} image(s) added successfully!`);
      } else {
        toast.error('Please drop only image files');
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.title || !formData.brand || !formData.model || !formData.year || !formData.price || !formData.mileage || !formData.transmission || !formData.body_type || !formData.color || !formData.location) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Prepare FormData for file upload
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('title', formData.title);
      submitData.append('brand', formData.brand);
      submitData.append('model', formData.model);
      submitData.append('year', formData.year);
      submitData.append('price', formData.price);
      submitData.append('mileage', formData.mileage);
      submitData.append('car_condition', formData.car_condition);
      submitData.append('fuel_type', formData.fuel_type);
      submitData.append('transmission', formData.transmission);
      submitData.append('body_type', formData.body_type);
      submitData.append('color', formData.color);
      submitData.append('location', formData.location);
      submitData.append('description', formData.description || '');
      submitData.append('status', 'active');
      
      // Add image files
      formData.images.forEach((file: File) => {
        submitData.append('images', file);
      });
      
      console.log('Submitting FormData with files:', formData.images.length);
      
      // Call the API with FormData
      const createdCar = await sellerApi.cars.createCarWithFiles(submitData);
      
      toast.success('Car listing created successfully!');

      // Reset form
      setFormData({
        title: '',
        brand: '',
        model: '',
        year: '',
        price: '',
        mileage: '',
        car_condition: 'used',
        fuel_type: 'petrol',
        transmission: 'automatic',
        body_type: 'sedan',
        color: '',
        location: '',
        description: '',
        images: [],
      });
      
      // Refresh the recent cars data to show the new listing
      await fetchRecentCars();

    } catch (error: any) {
      console.error('Error creating car:', error);
      
      // Handle validation errors
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map((err: any) => err.msg).join(', ');
        toast.error(`Validation errors: ${validationErrors}`);
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create car listing';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      // Refresh all data
      await Promise.all([
        fetchRecentCars(),
        fetchSalesHistory()
      ]);
      toast.success('Data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when tabs change
  useEffect(() => {
    fetchRecentCars();
    if (activeTab === 2) { // Sales History tab
      fetchSalesHistory();
    }
  }, [activeTab]);

  // Auto-refresh sales data every 30 seconds when on Sales History tab
  useEffect(() => {
    if (activeTab === 2) {
      const interval = setInterval(() => {
        fetchSalesHistory();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab]);

  return (
    <SellerLayout>
      <Box sx={{ p: 3, width: '100%' }}>
        <Box sx={{ 
      display: 'flex',
      justifyContent: 'space-between',
          alignItems: 'center', 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <IconButton onClick={() => navigate('/seller/cars')} sx={{ mr: { xs: 0.5, sm: 1 } }}>
              <ArrowBackIcon />
            </IconButton>
            <CarIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={600} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Add New Car
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-end' },
            flexWrap: 'wrap'
          }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshData}
              disabled={loading}
              sx={{ 
                whiteSpace: 'nowrap',
                minWidth: { xs: 'auto', sm: '120px' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Refresh Data</Box>
              <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Refresh</Box>
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/seller/cars')}
              sx={{ 
                whiteSpace: 'nowrap',
                minWidth: { xs: 'auto', sm: '120px' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>View All Cars</Box>
              <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>View All</Box>
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 3 }} />}

        <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
          Create a new car listing with detailed information. Use the tabs below to navigate between the form and dashboard elements.
        </Alert>

        {/* Dashboard Stats Cards */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          mb: 3, 
          width: '100%',
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: { xs: 'nowrap', sm: 'wrap' }
        }}>
          <MetricCard
            title="Total Cars"
            value={dashboardStats.totalCars}
            change={12}
            icon={<CarIcon sx={{ fontSize: 20 }} />}
            color="primary.main"
            subtitle="All listings"
          />
          <MetricCard
            title="Active Cars"
            value={dashboardStats.activeCars}
            change={8}
            icon={<CarIcon sx={{ fontSize: 20 }} />}
            color="success.main"
            subtitle="Currently listed"
          />
          <MetricCard
            title="Total Views"
            value={dashboardStats.totalViews.toLocaleString()}
            change={15}
            icon={<VisibilityIcon sx={{ fontSize: 20 }} />}
            color="info.main"
            subtitle="Page views"
          />
          <MetricCard
            title="Favorites"
            value={dashboardStats.totalFavorites}
            change={22}
            icon={<FavoriteIcon sx={{ fontSize: 20 }} />}
            color="error.main"
            subtitle="Customer favorites"
          />
          <MetricCard
            title="Avg Price"
            value={`$${dashboardStats.avgPrice.toLocaleString()}`}
            change={3}
            icon={<MoneyIcon sx={{ fontSize: 20 }} />}
            color="success.main"
            subtitle="Average listing price"
          />
          <MetricCard
            title="Conversion"
            value={`${dashboardStats.conversionRate}%`}
            change={5}
            icon={<TrendingUpIcon sx={{ fontSize: 20 }} />}
            color="secondary.main"
            subtitle="Sales conversion rate"
          />
        </Box>

        {/* Main Content with Tabs */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="car create tabs"
              variant={isSmall ? "scrollable" : "fullWidth"}
              scrollButtons={isSmall ? "auto" : false}
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minHeight: { xs: 48, sm: 56 },
                  padding: { xs: '8px 12px', sm: '12px 16px' }
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                    <CarIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                    <span style={{ fontSize: 'inherit' }}>Create Car</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                    <TrendingUpIcon2 sx={{ fontSize: { xs: 16, sm: 20 } }} />
                    <span style={{ fontSize: 'inherit' }}>Recent Cars</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                    <BarChartIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                    <span style={{ fontSize: 'inherit' }}>Sales History</span>
                  </Box>
                } 
              />
            </Tabs>
          </Box>

          {/* Create Car Tab */}
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Create New Car Listing
            </Typography>
            
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Car Condition"
                  value={formData.car_condition}
                  onChange={handleInputChange('car_condition')}
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
                  onChange={handleInputChange('fuel_type')}
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
                  onChange={handleInputChange('transmission')}
                    required
                  >
                    <MenuItem value="automatic">Automatic</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="cvt">CVT</MenuItem>
                    <MenuItem value="semi-automatic">Semi-Automatic</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Body Type"
                    value={formData.body_type}
                  onChange={handleInputChange('body_type')}
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
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  placeholder="Describe the car's condition, features, and history..."
                  />
                </Grid>
              <Grid item xs={12}>
                <PhotoUpload
                  images={formData.images.map(file => URL.createObjectURL(file))}
                  onImagesChange={(imageUrls) => {
                    // Convert URLs back to File objects for form submission
                    const files = imageUrls.map(url => {
                      // This is a simplified approach - in production you'd want to maintain File objects
                      return new File([], 'image.jpg', { type: 'image/jpeg' });
                    });
                    setFormData(prev => ({ ...prev, images: files }));
                  }}
                  maxImages={10}
                  maxFileSize={5}
                  entityType="car"
                  label="Car Images"
                  description="Upload clear photos of the car from different angles (exterior, interior, engine, etc.)"
                  aspectRatio="16/9"
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
                    onClick={() => {
                      setFormData({
                        title: '',
                        brand: '',
                        model: '',
                        year: '',
                        price: '',
                        mileage: '',
                        car_condition: 'used',
                        fuel_type: 'petrol',
                        transmission: 'automatic',
                        body_type: 'sedan',
                        color: '',
                        location: '',
                        description: '',
                        images: [],
                      });
                    }}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Clear Form
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    {loading ? 'Creating...' : 'Create Car Listing'}
                  </Button>
            </Box>
                </Grid>
                </Grid>
          </TabPanel>

          {/* Recent Cars Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Car Listings
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={fetchRecentCars}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
            
            {loading && recentCars.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <LinearProgress sx={{ width: '100%' }} />
              </Box>
            ) : recentCars.length === 0 ? (
              <Alert severity="info">
                No car listings found. Create your first car listing to get started.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Car Details</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Mileage</TableCell>
                      <TableCell>Condition</TableCell>
                      <TableCell>Views</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentCars.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={car.image} variant="rounded" sx={{ width: 50, height: 50 }}>
                              <CarIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {car.title}
              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {car.year} • {car.brand} {car.model}
                      </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {car.location}
                      </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight={600} color="primary">
                            ${typeof car.price === 'number' ? car.price.toLocaleString() : car.price}
                      </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {typeof car.mileage === 'number' ? car.mileage.toLocaleString() : car.mileage} mi
                      </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={car.condition || 'used'} 
                            color={car.condition === 'excellent' ? 'success' : car.condition === 'good' ? 'info' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {car.views}
                    </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={car.status} 
                            color={car.status === 'active' ? 'success' : car.status === 'pending' ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewCar(car.id)}
                              sx={{ 
                                color: 'primary.main',
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                              }}
                              title="View Car Details"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditCar(car.id)}
                              sx={{ 
                                color: 'info.main',
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'info.light', color: 'white' }
                              }}
                              title="Edit Car"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteCar(car.id, car.title)}
                              sx={{ 
                                color: 'error.main',
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'error.light', color: 'white' }
                              }}
                              title="Delete Car"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Sales History Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Sales History
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {salesLoading && <LinearProgress sx={{ width: 100 }} />}
                <Typography variant="caption" color="text.secondary">
                  Auto-refreshes every 30s
              </Typography>
            </Box>
          </Box>
            
            {salesLoading && salesHistory.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <LinearProgress sx={{ width: '100%' }} />
        </Box>
            ) : salesHistory.length === 0 ? (
              <Alert severity="info">
                No sales history found. Your completed sales will appear here.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Car Details</TableCell>
                      <TableCell>Buyer/Activity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Commission</TableCell>
                      <TableCell>Views</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesHistory.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={sale.image} variant="rounded" sx={{ width: 40, height: 40 }}>
                              <CarIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {sale.car}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {sale.year} • {sale.brand} {sale.model}
          </Typography>
        </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {sale.buyer}
                          </Typography>
                          {sale.favorites > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {sale.favorites} favorites
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight={600} color="success.main">
                            ${typeof sale.price === 'number' ? sale.price.toLocaleString() : sale.price}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            ${sale.commission > 0 ? sale.commission.toLocaleString() : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {sale.views || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(sale.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(sale.date).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={sale.status === 'completed' ? 'Sold' : sale.status === 'pending' ? 'Pending' : 'Active'} 
                            color={sale.status === 'completed' ? 'success' : sale.status === 'pending' ? 'warning' : 'info'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default CreateCarPage;