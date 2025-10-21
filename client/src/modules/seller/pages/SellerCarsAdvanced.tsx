import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import SellerLayout from '../components/layout/SellerLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Pagination,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Grid,
  CardMedia,
  CardActions,
  CardActionArea,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  CarRepair as CarIcon,
} from '@mui/icons-material';

const SellerCarsAdvanced: React.FC = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const sellerId = (authUser as any)?.id || (authUser as any)?._id;
  
  const [carsLoading, setCarsLoading] = useState(false);
  const [cars, setCarsState] = useState<Array<any>>([]);
  const [carSearch, setCarSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingCar, setEditingCar] = useState<any | null>(null);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [lastDataHash, setLastDataHash] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  
  // Client-side pagination for filtered results
  const [filteredCurrentPage, setFilteredCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 cars per page

  // Enhanced table features
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Filter menu state
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState({
    brand: '',
    year: '',
    status: '',
    priceMin: '',
    priceMax: '',
    mileageMin: '',
    mileageMax: ''
  });

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(carSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [carSearch]);

  // Load cars function
  const loadCars = async (page: number = 1) => {
    if (!sellerId) return;
    
    setCarsLoading(true);
    try {
      const response = await sellerApi.getCars({
        page,
        limit: 10,
        search: debouncedSearch,
        sortField,
        sortOrder,
        status: filterStatus === 'all' ? '' : filterStatus
      });
      
      if (response.success) {
        setCarsState(response.data.cars || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCars(response.data.totalCars || 0);
        setCurrentPage(page);
        setLastRefreshTime(new Date());
        setLastDataHash(generateDataHash(response.data.cars || []));
      }
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setCarsLoading(false);
    }
  };

  // Generate hash for data change detection
  const generateDataHash = (data: any[]) => {
    if (!data || data.length === 0) return '';
    return data.map(car => `${car.id}-${car.updated_at || car.created_at}`).join('|');
  };

  // Load cars on component mount and when dependencies change
  useEffect(() => {
    loadCars(currentPage);
  }, [sellerId, debouncedSearch, sortField, sortOrder, filterStatus]);

  // Filter and sort cars
  const filteredAndSortedCars = useMemo(() => {
    let filtered = cars.filter(car => {
      // Apply filters
      if (filters.brand && car.make !== filters.brand) return false;
      if (filters.year && car.year !== parseInt(filters.year)) return false;
      if (filters.status && car.status !== filters.status) return false;
      if (filters.priceMin && car.price < parseFloat(filters.priceMin)) return false;
      if (filters.priceMax && car.price > parseFloat(filters.priceMax)) return false;
      if (filters.mileageMin && car.mileage < parseInt(filters.mileageMin)) return false;
      if (filters.mileageMax && car.mileage > parseInt(filters.mileageMax)) return false;
      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'price' || sortField === 'mileage') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [cars, filters, sortField, sortOrder]);

  // Pagination for filtered results
  const paginatedCars = useMemo(() => {
    const startIndex = (filteredCurrentPage - 1) * itemsPerPage;
    return filteredAndSortedCars.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCars, filteredCurrentPage, itemsPerPage]);

  // Helper functions
  const getUniqueBrands = () => {
    const brands = [...new Set(cars.map(car => car.make).filter(Boolean))];
    return brands.sort();
  };

  const getUniqueYears = () => {
    const years = [...new Set(cars.map(car => car.year).filter(Boolean))];
    return years.sort((a, b) => b - a);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'sold': return 'info';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      case 'sold': return <CheckCircleIcon />;
      case 'inactive': return <CancelIcon />;
      default: return <InfoIcon />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage) + ' km';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleEditCar = (car: any) => {
    setEditingCar(car);
    // Navigate to edit page or open edit modal
    console.log('Edit car:', car);
  };

  const handleDeleteCar = async (car: any) => {
    if (!car?.id) return;
    
    try {
      const response = await sellerApi.deleteCar(car.id);
      if (response.success) {
        await loadCars(currentPage);
      }
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  const handleViewCar = (car: any) => {
    setSelectedCar(car);
    console.log('View car:', car);
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      year: '',
      status: '',
      priceMin: '',
      priceMax: '',
      mileageMin: '',
      mileageMax: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            My Car Listings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => loadCars(currentPage)}
              disabled={carsLoading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                // Navigate to create car page
                console.log('Navigate to create car page');
              }}
            >
              Add New Car
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search cars..."
                value={carSearch}
                onChange={(e) => setCarSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
              
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                sx={{ position: 'relative' }}
              >
                Filters
                {hasActiveFilters && (
                  <Badge
                    badgeContent={Object.values(filters).filter(v => v !== '').length}
                    color="primary"
                    sx={{ position: 'absolute', top: -8, right: -8 }}
                  />
                )}
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="text"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  size="small"
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Cars List */}
        <Card>
          <CardContent>
            {carsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : paginatedCars.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <CarIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {sellerId ? 'You haven\'t created any car listings yet.' : 'Please log in to view your listings.'}
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => {
                    // Navigate to create car page
                    console.log('Navigate to create car page');
                  }}
                  sx={{ mt: 1 }}
                >
                  Create Your First Listing
                </Button>
              </Box>
            ) : (
              <>
                {/* Table Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {totalCars} car{totalCars !== 1 ? 's' : ''} found
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<SortIcon />}
                      onClick={() => handleSort('created_at')}
                      variant={sortField === 'created_at' ? 'contained' : 'outlined'}
                    >
                      Date
                    </Button>
                    <Button
                      size="small"
                      startIcon={<MoneyIcon />}
                      onClick={() => handleSort('price')}
                      variant={sortField === 'price' ? 'contained' : 'outlined'}
                    >
                      Price
                    </Button>
                    <Button
                      size="small"
                      startIcon={<SpeedIcon />}
                      onClick={() => handleSort('mileage')}
                      variant={sortField === 'mileage' ? 'contained' : 'outlined'}
                    >
                      Mileage
                    </Button>
                  </Box>
                </Box>

                {/* Cars Grid */}
                <Grid container spacing={2}>
                  {paginatedCars.map((car) => (
                    <Grid item xs={12} sm={6} md={4} key={car.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardActionArea onClick={() => handleViewCar(car)}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={getImageUrl(car.images?.[0])}
                            alt={car.title || `${car.make} ${car.model}`}
                            sx={{ objectFit: 'cover' }}
                          />
                        </CardActionArea>
                        
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                              {car.title || `${car.make} ${car.model}`}
                            </Typography>
                            <Chip
                              icon={getStatusIcon(car.status)}
                              label={car.status}
                              color={getStatusColor(car.status) as any}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {car.year} • {formatMileage(car.mileage || 0)}
                          </Typography>
                          
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                            {formatPrice(car.price || 0)}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Listed on {formatDate(car.created_at)}
                          </Typography>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                          <Box>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => handleViewCar(car)}>
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditCar(car)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDeleteCar(car)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {filteredAndSortedCars.length > itemsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={Math.ceil(filteredAndSortedCars.length / itemsPerPage)}
                      page={filteredCurrentPage}
                      onChange={(_, page) => setFilteredCurrentPage(page)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 300, p: 2 } }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Brand</InputLabel>
          <Select
            value={filters.brand}
            label="Brand"
            onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
          >
            <MenuItem value="">All Brands</MenuItem>
            {getUniqueBrands().map(brand => (
              <MenuItem key={brand} value={brand}>{brand}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={filters.year}
            label="Year"
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
          >
            <MenuItem value="">All Years</MenuItem>
            {getUniqueYears().map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="sold">Sold</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small"
            label="Min Price"
            type="number"
            value={filters.priceMin}
            onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="Max Price"
            type="number"
            value={filters.priceMax}
            onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
            sx={{ flex: 1 }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small"
            label="Min Mileage"
            type="number"
            value={filters.mileageMin}
            onChange={(e) => setFilters(prev => ({ ...prev, mileageMin: e.target.value }))}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="Max Mileage"
            type="number"
            value={filters.mileageMax}
            onChange={(e) => setFilters(prev => ({ ...prev, mileageMax: e.target.value }))}
            sx={{ flex: 1 }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{ flex: 1 }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={() => setFilterMenuAnchor(null)}
            sx={{ flex: 1 }}
          >
            Apply
          </Button>
        </Box>
      </Menu>
    </SellerLayout>
  );
};

export default SellerCarsAdvanced;