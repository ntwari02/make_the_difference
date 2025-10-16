import React, { useState, useEffect } from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  useTheme,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Star as StarIcon,
  DirectionsCar as CarIcon,
  LocalGasStation as FuelIcon,
  Speed as SpeedIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../core/store';
import { setVehicles, removeVehicle, setViewMode, toggleVehicleSelection, clearSelection, selectAllVehicles } from '../store/dealerSlice';
import DealerLayout from '../components/layout/DealerLayout';
import type { Vehicle } from '../types';
import toast from 'react-hot-toast';

const DealerVehicles: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const vehicles = useSelector((state: RootState) => state.dealer.vehicles);
  const selectedVehicles = useSelector((state: RootState) => state.dealer.selectedVehicles);
  const viewMode = useSelector((state: RootState) => state.dealer.viewMode);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Mock vehicles data
  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      title: '2023 Tesla Model 3 Long Range',
      description: 'Excellent condition, low mileage, full autopilot',
      brand: 'Tesla',
      model: 'Model 3',
      year: 2023,
      mileage: 15000,
      price: 45000,
      currency: 'USD',
      car_condition: 'used',
      fuel_type: 'electric',
      transmission: 'automatic',
      body_type: 'sedan',
      color: 'Pearl White',
      engine_size: 'Electric',
      horsepower: 346,
      vin: '5YJ3E1EA1KF123456',
      location: 'Los Angeles, CA',
      images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400'],
      features: ['Autopilot', 'Premium Audio', 'Glass Roof'],
      has_3d_model: false,
      status: 'active',
      is_featured: true,
      views_count: 1234,
      seller_id: '1',
      dealer_id: '1',
      created_at: '2024-09-01T00:00:00Z',
      updated_at: '2024-10-04T00:00:00Z',
    },
    {
      id: '2',
      title: '2024 BMW X5 xDrive40i',
      description: 'Brand new, luxury SUV with premium package',
      brand: 'BMW',
      model: 'X5',
      year: 2024,
      mileage: 0,
      price: 72000,
      currency: 'USD',
      car_condition: 'new',
      fuel_type: 'petrol',
      transmission: 'automatic',
      body_type: 'suv',
      color: 'Alpine White',
      engine_size: '3.0L',
      horsepower: 335,
      location: 'Los Angeles, CA',
      images: ['https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400'],
      features: ['Navigation', 'Leather Seats', 'Panoramic Roof'],
      has_3d_model: true,
      status: 'active',
      is_featured: true,
      views_count: 892,
      seller_id: '1',
      dealer_id: '1',
      created_at: '2024-09-15T00:00:00Z',
      updated_at: '2024-10-04T00:00:00Z',
    },
    {
      id: '3',
      title: '2022 Toyota Camry Hybrid XLE',
      description: 'Certified pre-owned, excellent fuel economy',
      brand: 'Toyota',
      model: 'Camry',
      year: 2022,
      mileage: 28000,
      price: 28500,
      currency: 'USD',
      car_condition: 'certified',
      fuel_type: 'hybrid',
      transmission: 'automatic',
      body_type: 'sedan',
      color: 'Silver',
      engine_size: '2.5L',
      horsepower: 208,
      location: 'Los Angeles, CA',
      images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'],
      features: ['Adaptive Cruise', 'Lane Assist', 'Backup Camera'],
      has_3d_model: false,
      status: 'active',
      is_featured: false,
      views_count: 456,
      seller_id: '1',
      dealer_id: '1',
      created_at: '2024-08-20T00:00:00Z',
      updated_at: '2024-10-04T00:00:00Z',
    },
    {
      id: '4',
      title: '2021 Mercedes-Benz C-Class C300',
      description: 'Luxury sedan in pristine condition',
      brand: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2021,
      mileage: 32000,
      price: 38900,
      currency: 'USD',
      car_condition: 'used',
      fuel_type: 'petrol',
      transmission: 'automatic',
      body_type: 'sedan',
      color: 'Black',
      engine_size: '2.0L',
      horsepower: 255,
      location: 'Los Angeles, CA',
      images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400'],
      features: ['Premium Sound', 'Heated Seats', 'Sunroof'],
      has_3d_model: false,
      status: 'pending',
      is_featured: false,
      views_count: 234,
      seller_id: '1',
      dealer_id: '1',
      created_at: '2024-10-01T00:00:00Z',
      updated_at: '2024-10-04T00:00:00Z',
    },
    {
      id: '5',
      title: '2023 Honda Civic Type R',
      description: 'Performance hatchback, track ready',
      brand: 'Honda',
      model: 'Civic',
      year: 2023,
      mileage: 8500,
      price: 42000,
      currency: 'USD',
      car_condition: 'used',
      fuel_type: 'petrol',
      transmission: 'manual',
      body_type: 'hatchback',
      color: 'Championship White',
      engine_size: '2.0L',
      horsepower: 315,
      location: 'Los Angeles, CA',
      images: ['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400'],
      features: ['Sport Mode', 'Brembo Brakes', 'Performance Tires'],
      has_3d_model: false,
      status: 'sold',
      is_featured: false,
      views_count: 678,
      seller_id: '1',
      dealer_id: '1',
      created_at: '2024-09-05T00:00:00Z',
      updated_at: '2024-09-25T00:00:00Z',
    },
    {
      id: '6',
      title: '2024 Audi Q8 Premium Plus',
      description: 'Draft listing - awaiting final details',
      brand: 'Audi',
      model: 'Q8',
      year: 2024,
      mileage: 0,
      price: 75000,
      currency: 'USD',
      car_condition: 'new',
      fuel_type: 'petrol',
      transmission: 'automatic',
      body_type: 'suv',
      color: 'Glacier White',
      engine_size: '3.0L',
      horsepower: 335,
      location: 'Los Angeles, CA',
      images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400'],
      features: ['Virtual Cockpit', 'Matrix LED', 'Air Suspension'],
      has_3d_model: false,
      status: 'draft',
      is_featured: false,
      views_count: 0,
      seller_id: '1',
      dealer_id: '1',
      created_at: '2024-10-03T00:00:00Z',
      updated_at: '2024-10-04T00:00:00Z',
    },
  ];

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        // In production, fetch from API
        // const data = await vehicleApi.getVehicles();
        dispatch(setVehicles(mockVehicles));
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast.error('Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [dispatch]);

  // Filter and sort vehicles
  const filteredVehicles = vehicles
    .filter((vehicle) => {
      const matchesSearch =
        vehicle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      const matchesCondition = conditionFilter === 'all' || vehicle.car_condition === conditionFilter;

      return matchesSearch && matchesStatus && matchesCondition;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_high':
          return b.price - a.price;
        case 'price_low':
          return a.price - b.price;
        case 'views':
          return b.views_count - a.views_count;
        default:
          return 0;
      }
    });

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: 'grid' | 'list' | null) => {
    if (newMode !== null) {
      dispatch(setViewMode(newMode));
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, vehicleId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedVehicleId(vehicleId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedVehicleId(null);
  };

  const handleDeleteClick = (vehicleId: string) => {
    setVehicleToDelete(vehicleId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (vehicleToDelete) {
      dispatch(removeVehicle(vehicleToDelete));
      toast.success('Vehicle deleted successfully');
    }
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleSelectAll = () => {
    if (selectedVehicles.length === filteredVehicles.length) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAllVehicles());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'sold':
        return 'default';
      case 'pending':
        return 'warning';
      case 'draft':
        return 'info';
      default:
        return 'default';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'success';
      case 'certified':
        return 'primary';
      case 'used':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <DealerLayout>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      </DealerLayout>
    );
  }

  return (
    <DealerLayout>
      <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              My Vehicles
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your inventory ({filteredVehicles.length} vehicles)
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/dealer/vehicles/add')}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            Add Vehicle
          </Button>
        </Box>

        {/* Stats Bar */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {vehicles.filter(v => v.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {vehicles.filter(v => v.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight={700} color="text.secondary">
                  {vehicles.filter(v => v.status === 'sold').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sold
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {vehicles.filter(v => v.status === 'draft').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drafts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Toolbar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <TextField
                placeholder="Search vehicles..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="sold">Sold</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>

              {/* Condition Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={conditionFilter}
                  label="Condition"
                  onChange={(e) => setConditionFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="certified">Certified</MenuItem>
                  <MenuItem value="used">Used</MenuItem>
                </Select>
              </FormControl>

              {/* Sort */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="price_high">Price: High to Low</MenuItem>
                  <MenuItem value="price_low">Price: Low to High</MenuItem>
                  <MenuItem value="views">Most Viewed</MenuItem>
                </Select>
              </FormControl>

              {/* View Mode Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
              >
                <ToggleButton value="grid">
                  <GridViewIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ListViewIcon />
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Bulk Actions */}
              {selectedVehicles.length > 0 && (
                <Chip
                  label={`${selectedVehicles.length} selected`}
                  onDelete={() => dispatch(clearSelection())}
                  color="primary"
                />
              )}
            </Box>

            {/* Select All */}
            {filteredVehicles.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={selectedVehicles.length === filteredVehicles.length && filteredVehicles.length > 0}
                  indeterminate={selectedVehicles.length > 0 && selectedVehicles.length < filteredVehicles.length}
                  onChange={handleSelectAll}
                />
                <Typography variant="body2" color="text.secondary">
                  Select All
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Vehicles Grid/List */}
        {filteredVehicles.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <CarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No vehicles found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchQuery || statusFilter !== 'all' || conditionFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first vehicle'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/dealer/vehicles/add')}
              >
                Add Vehicle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredVehicles.map((vehicle) => (
              <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={vehicle.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: viewMode === 'list' ? 'row' : 'column',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  {/* Selection Checkbox */}
                  <Checkbox
                    checked={selectedVehicles.includes(vehicle.id)}
                    onChange={() => dispatch(toggleVehicleSelection(vehicle.id))}
                    sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1 }}
                  />

                  {/* Featured Badge */}
                  {vehicle.is_featured && (
                    <Chip
                      icon={<StarIcon />}
                      label="Featured"
                      size="small"
                      color="warning"
                      sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                    />
                  )}

                  {/* Image */}
                  <CardMedia
                    component="img"
                    sx={{
                      width: viewMode === 'list' ? 250 : '100%',
                      height: viewMode === 'list' ? '100%' : 200,
                      objectFit: 'cover',
                    }}
                    image={vehicle.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={vehicle.title}
                  />

                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1 }}>
                      {/* Status and Condition Badges */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={vehicle.status}
                          size="small"
                          color={getStatusColor(vehicle.status) as any}
                        />
                        <Chip
                          label={vehicle.car_condition}
                          size="small"
                          color={getConditionColor(vehicle.car_condition) as any}
                          variant="outlined"
                        />
                      </Box>

                      {/* Title */}
                      <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                        {vehicle.title}
                      </Typography>

                      {/* Price */}
                      <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
                        ${vehicle.price.toLocaleString()}
                      </Typography>

                      {/* Details */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {vehicle.year}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <SpeedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {vehicle.mileage.toLocaleString()} mi
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FuelIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {vehicle.fuel_type}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Views */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.views_count} views
                        </Typography>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => navigate(`/cars/${vehicle.id}`)}
                          fullWidth
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/dealer/vehicles/${vehicle.id}/edit`)}
                          fullWidth
                        >
                          Edit
                        </Button>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, vehicle.id)}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Vehicle Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedVehicleId) {
              navigator.clipboard.writeText(`${window.location.origin}/cars/${selectedVehicleId}`);
              toast.success('Link copied to clipboard');
            }
            handleMenuClose();
          }}>
            <ShareIcon sx={{ mr: 1 }} fontSize="small" />
            Share
          </MenuItem>
          <MenuItem onClick={() => {
            toast.success('Vehicle marked as featured');
            handleMenuClose();
          }}>
            <StarIcon sx={{ mr: 1 }} fontSize="small" />
            Toggle Featured
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedVehicleId) {
              handleDeleteClick(selectedVehicleId);
            }
          }} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Vehicle</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DealerLayout>
  );
};

export default DealerVehicles;

