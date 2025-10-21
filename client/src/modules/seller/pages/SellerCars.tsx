import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Fab,
  Checkbox,
  TableSortLabel,
  Pagination,
  Grid,
  Alert,
  Snackbar,
  
} from '@mui/material';
//
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../core/store';
import type { Car } from '../types';
import { setCars, removeCar, setLoading, setError, setViewMode } from '../store/sellerSlice';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';

interface CarFilters {
  search: string;
  status: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  category?: 'vehicles' | 'parts' | '';
}

const SellerCars: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Removed unused localLoading
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState<CarFilters>({
    search: '',
    status: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    category: '',
  });
  const [categoryView, setCategoryView] = useState<'vehicles' | 'parts'>('vehicles');

  const [page, setPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(12);
  const [total, setTotal] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'created_at' | 'price' | 'year' | 'status'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState<string>('');
  const [inventoryStats, setInventoryStats] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const cars = useSelector((state: RootState) => state.seller.cars);
  const viewMode = useSelector((state: RootState) => state.seller.viewMode);
  // Removed unused profile selector

  // Mock data used when API has no data or during development (all car-specific images)
  const mockCars = useMemo<any[]>(() => ([
    { id: 'm1', brand: 'Toyota', model: 'Corolla', year: 2019, mileage: 38500, price: 15900, status: 'active', images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop'] },
    { id: 'm2', brand: 'Honda', model: 'Civic', year: 2020, mileage: 24000, price: 18750, status: 'active', images: ['https://images.unsplash.com/photo-1549921296-3fdc4a3fa5d8?q=80&w=1200&auto=format&fit=crop'] },
    { id: 'm3', brand: 'Ford', model: 'Focus', year: 2018, mileage: 52500, price: 12990, status: 'pending', images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop'] },
    { id: 'm4', brand: 'BMW', model: '3 Series', year: 2017, mileage: 61000, price: 23400, status: 'draft', images: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop'] },
    { id: 'm5', brand: 'Mercedes', model: 'C-Class', year: 2019, mileage: 41000, price: 26800, status: 'active', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop'] },
    { id: 'm6', brand: 'Audi', model: 'A4', year: 2018, mileage: 57000, price: 21950, status: 'sold', images: ['https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=1200&auto=format&fit=crop'] },
    { id: 'm7', brand: 'Hyundai', model: 'Elantra', year: 2021, mileage: 15000, price: 17200, status: 'active', images: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1b?q=80&w=1200&auto=format&fit=crop'] },
    { id: 'm8', brand: 'Kia', model: 'Forte', year: 2020, mileage: 23000, price: 16500, status: 'active', images: ['https://images.unsplash.com/photo-1606666431364-82bd6f4d5226?q=80&w=1200&auto=format&fit=crop'] },
    { id: 'm9', brand: 'Tesla', model: 'Model 3', year: 2021, mileage: 12000, price: 34900, status: 'active', images: ['https://images.unsplash.com/photo-1511390428939-6b0f04096b4a?q=80&w=1200&auto=format&fit=crop'] },
    { id: 'm10', brand: 'Nissan', model: 'Altima', year: 2019, mileage: 42000, price: 15800, status: 'rejected', images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop'] },
    { id: 'm11', brand: 'Chevrolet', model: 'Malibu', year: 2018, mileage: 64000, price: 13900, status: 'sold', images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop'] },
    { id: 'm12', brand: 'Volkswagen', model: 'Jetta', year: 2017, mileage: 72000, price: 11800, status: 'pending', images: ['https://images.unsplash.com/photo-1605559424843-9e4c4d2ad1c1?q=80&w=1200&auto=format&fit=crop'] },
    // Spare parts examples
    { id: 'p1', brand: 'Brake Pads', model: 'Front set', year: 0, mileage: 0, price: 120, status: 'active', images: ['https://images.unsplash.com/photo-1617531653332-bd20c53000de?q=80&w=1200&auto=format&fit=crop'], itemType: 'part' },
    { id: 'p2', brand: 'Engine Oil', model: '5W-30 4L', year: 0, mileage: 0, price: 45, status: 'active', images: ['https://images.unsplash.com/photo-1608222351212-38e24a92c4a5?q=80&w=1200&auto=format&fit=crop'], itemType: 'part' },
  ]), []);

  const brandImageMap: Record<string, string> = useMemo(() => ({
    toyota: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=1200&auto=format&fit=crop',
    honda: 'https://images.unsplash.com/photo-1556665453-1f4deabe35f4?q=80&w=1200&auto=format&fit=crop',
    ford: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop',
    bmw: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop',
    mercedes: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    audi: 'https://images.unsplash.com/photo-1549921296-3fdc4a3fa5d8?q=80&w=1200&auto=format&fit=crop',
    hyundai: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1b?q=80&w=1200&auto=format&fit=crop',
    kia: 'https://images.unsplash.com/photo-1606666431364-82bd6f4d5226?q=80&w=1200&auto=format&fit=crop',
    tesla: 'https://images.unsplash.com/photo-1511390428939-6b0f04096b4a?q=80&w=1200&auto=format&fit=crop',
    nissan: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop',
    chevrolet: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop',
    volkswagen: 'https://images.unsplash.com/photo-1605559424843-9e4c4d2ad1c1?q=80&w=1200&auto=format&fit=crop',
  }), []);

  const defaultCarImage = 'https://images.unsplash.com/photo-1517059224940-d4af9eec41e5?q=80&w=1200&auto=format&fit=crop';

  const getCarImage = (car: any) => {
    if (car?.images?.[0]) return car.images[0];
    const brandKey = String(car?.brand || '').toLowerCase();
    return brandImageMap[brandKey] || defaultCarImage;
  };

  // Debounce search input into filters.search
  useEffect(() => {
    const id = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    fetchCars();
    fetchInventoryStats();
  }, [filters, page, rowsPerPage]);

  const fetchInventoryStats = async () => {
    try {
      console.log('📊 Fetching inventory stats from backend...');
      const stats = await sellerApi.cars.getInventoryStats();
      console.log('📊 Inventory stats response:', stats);
      setInventoryStats(stats);
    } catch (error) {
      console.error('❌ Failed to fetch inventory stats:', error);
      setSnackbar({ open: true, message: 'Failed to load inventory statistics', severity: 'error' });
    }
  };

  // When category tab changes, reflect in filters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: categoryView }));
    setPage(1);
  }, [categoryView]);

  const toCar = (item: any): Car => {
    const now = new Date().toISOString();
    return {
      id: String(item.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)),
      seller_id: String(item.seller_id ?? 'mock-seller'),
      title: String(item.title ?? `${item.brand || 'Vehicle'} ${item.model || ''}`.trim()),
      brand: String(item.brand ?? 'Unknown'),
      model: String(item.model ?? 'Unknown'),
      year: Number(item.year ?? 0),
      mileage: Number(item.mileage ?? 0),
      price: Number(item.price ?? 0),
      car_condition: (item.car_condition ?? 'used') as Car['car_condition'],
      fuel_type: String(item.fuel_type ?? 'petrol'),
      transmission: String(item.transmission ?? 'manual'),
      body_type: String(item.body_type ?? 'sedan'),
      color: String(item.color ?? 'Unknown'),
      location: String(item.location ?? 'Unknown'),
      images: Array.isArray(item.images) ? item.images : [],
      features: Array.isArray(item.features) ? item.features : [],
      specifications: item.specifications ?? {},
      description: item.description,
      vin: item.vin,
      engine_size: item.engine_size,
      horsepower: typeof item.horsepower === 'number' ? item.horsepower : undefined,
      torque: item.torque,
      status: (item.status ?? 'draft') as Car['status'],
      created_at: String(item.created_at ?? now),
      updated_at: String(item.updated_at ?? now),
    };
  };

  const normalizeToCars = (list: any[]): Car[] => {
    return list.map((it) => (it && (it as any).seller_id && (it as any).created_at ? (it as Car) : toCar(it)));
  };

  const fetchCars = async () => {
    try {
      dispatch(setLoading(true));
      console.log('🚗 Fetching cars from backend...');

      const queryParams = {
        page,
        limit: rowsPerPage,
        ...filters,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      };

      console.log('📡 API call params:', queryParams);
      const response = await sellerApi.cars.getMyCars(queryParams);
      console.log('📡 API response:', response);
      
      // Backend returns cars array directly, not wrapped in {cars: []}
      const fetched = Array.isArray(response) ? response : (response.cars || []);
      console.log('🚗 Fetched cars count:', fetched.length);
      
      // Use real data if available, otherwise show empty state
      if (fetched.length > 0) {
        console.log('✅ Using real backend data');
        dispatch(setCars(normalizeToCars(fetched)));
        // Handle pagination - backend might return array directly or wrapped object
        const paginationTotal = Array.isArray(response) ? fetched.length : (response as any)?.pagination?.total;
        setTotal(paginationTotal || fetched.length);
      } else {
        console.log('⚠️ No cars found in backend, showing empty state');
        dispatch(setCars([]));
        setTotal(0);
      }

    } catch (error) {
      console.error('❌ Failed to fetch cars:', error);
      dispatch(setError('Failed to load cars'));
      // Show empty state instead of mock data
      dispatch(setCars([]));
      setTotal(0);
      setSnackbar({ open: true, message: 'Failed to load cars from backend', severity: 'error' });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddCar = () => {
    navigate('/seller/cars/add');
  };

  const handleEditCar = (carId: string) => {
    navigate(`/seller/cars/${carId}/edit`);
    setMenuAnchor(null);
  };

  const handleViewCar = (carId: string) => {
    navigate(`/cars/${carId}`);
    setMenuAnchor(null);
  };

  const handleDeleteCar = (car: any) => {
    setSelectedCar(car);
    setDeleteDialog(true);
    setMenuAnchor(null);
  };

  const confirmDelete = async () => {
    if (!selectedCar) return;

    try {
      await sellerApi.cars.deleteCar(selectedCar.id);
      dispatch(removeCar(selectedCar.id));
      setDeleteDialog(false);
      setSelectedCar(null);
      setSnackbar({ open: true, message: 'Car deleted successfully', severity: 'success' });
      fetchInventoryStats(); // Refresh stats after deletion
    } catch (error) {
      console.error('Failed to delete car:', error);
      dispatch(setError('Failed to delete car'));
      setSnackbar({ open: true, message: 'Failed to delete car', severity: 'error' });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, car: any) => {
    setSelectedCar(car);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedCar(null);
  };

  const handleFilterChange = (field: keyof CarFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      category: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'sold': return 'info';
      case 'draft': return 'default';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(cars.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectOne = (carId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(carId)) next.delete(carId); else next.add(carId);
      return next;
    });
  };

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      for (const id of ids) {
        await sellerApi.cars.deleteCar(id);
        dispatch(removeCar(id));
      }
      setSelectedIds(new Set());
      setSnackbar({ open: true, message: `${ids.length} cars deleted successfully`, severity: 'success' });
      fetchInventoryStats(); // Refresh stats after deletion
    } catch (e) {
      console.error('Failed to delete cars', e);
      setSnackbar({ open: true, message: 'Failed to delete some cars', severity: 'error' });
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    const ids = Array.from(selectedIds);
    try {
      await sellerApi.cars.bulkUpdateStatus(ids, status);
      setSelectedIds(new Set());
      setSnackbar({ open: true, message: `${ids.length} cars updated to ${status}`, severity: 'success' });
      fetchCars(); // Refresh cars list
      fetchInventoryStats(); // Refresh stats
    } catch (e) {
      console.error('Failed to update car status', e);
      setSnackbar({ open: true, message: 'Failed to update car status', severity: 'error' });
    }
  };

  const sortedCars = useMemo(() => {
    const copy = [...cars];
    copy.sort((a: any, b: any) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const av = a[sortBy];
      const bv = b[sortBy];
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
    return copy;
  }, [cars, sortBy, sortDir]);

  const pagedCars = useMemo(() => {
    // When server pagination isn't available, paginate client-side for grid view
    const start = (page - 1) * rowsPerPage;
    return sortedCars.slice(start, start + rowsPerPage);
  }, [sortedCars, page, rowsPerPage]);

  const handleRequestSort = (column: 'price' | 'year' | 'status' | 'created_at') => {
    if (sortBy === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const isPart = (c: any) => (c as any)?.itemType === 'part';

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            My Listings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchCars();
                fetchInventoryStats();
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCar}
            >
              {categoryView === 'parts' ? 'Add Part' : 'Create Listing'}
            </Button>
          </Box>
        </Box>

        {/* Inventory Statistics */}
        {inventoryStats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">Total Cars</Typography>
                  <Typography variant="h4" fontWeight={800} color="primary.main">
                    {inventoryStats.total_cars || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">Active Listings</Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main">
                    {inventoryStats.active_cars || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">Sold Cars</Typography>
                  <Typography variant="h4" fontWeight={800} color="info.main">
                    {inventoryStats.sold_cars || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">Total Revenue</Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main">
                    {formatPrice(parseFloat(inventoryStats.total_revenue || '0'))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Category Tabs */}
        <Box sx={{ display: 'none' }} />

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(6, minmax(0, 1fr))',
                },
                gap: 2,
                alignItems: 'center',
              }}
            >
              {/* Category tabs inline before search */}
              <Box sx={{ gridColumn: { md: 'span 3' } }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant={categoryView === 'vehicles' ? 'contained' : 'outlined'} onClick={() => setCategoryView('vehicles')}>Vehicles</Button>
                  <Button size="small" variant={categoryView === 'parts' ? 'contained' : 'outlined'} onClick={() => setCategoryView('parts')}>Spare Parts</Button>
                </Box>
              </Box>
              <Box sx={{ gridColumn: { md: 'span 3' } }}>
                <TextField
                  fullWidth
                  placeholder="Search listings..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>
              <Box sx={{ gridColumn: { md: 'span 2' } }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="sold">Sold</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ gridColumn: { md: 'span 2' } }}>
                <TextField
                  fullWidth
                  placeholder="Min Price"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </Box>
              <Box sx={{ gridColumn: { md: 'span 2' } }}>
                <TextField
                  fullWidth
                  placeholder="Max Price"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </Box>
              <Box sx={{ gridColumn: { md: 'span 3' } }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={clearFilters}
                  >
                    Clear
                  </Button>
                  <Tooltip title={`Switch to ${viewMode === 'grid' ? 'List' : 'Grid'} View`}>
                    <IconButton
                      onClick={() => dispatch(setViewMode(viewMode === 'grid' ? 'list' : 'grid'))}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                      }}
                    >
                      {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <Card sx={{ mb: 2, borderLeft: 4, borderColor: 'primary.main' }}>
            <CardContent sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">{selectedIds.size} selected</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  color="success" 
                  variant="outlined" 
                  size="small"
                  onClick={() => bulkUpdateStatus('active')}
                >
                  Mark Active
                </Button>
                <Button 
                  color="warning" 
                  variant="outlined" 
                  size="small"
                  onClick={() => bulkUpdateStatus('pending')}
                >
                  Mark Pending
                </Button>
                <Button 
                  color="info" 
                  variant="outlined" 
                  size="small"
                  onClick={() => bulkUpdateStatus('sold')}
                >
                  Mark Sold
                </Button>
                <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={bulkDelete}>Delete</Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Cars Display */}
        {viewMode === 'grid' ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
            {pagedCars.map((car) => (
              <Card
                key={car.id}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    variant="rounded"
                    src={getCarImage(car)}
                    sx={{
                      width: '100%',
                      height: 200,
                      bgcolor: 'grey.200',
                    }}
                  >
                    {car.brand} {car.model}
                  </Avatar>
                  <Checkbox
                    checked={selectedIds.has(car.id)}
                    onChange={() => toggleSelectOne(car.id)}
                    sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'background.paper', borderRadius: 1 }}
                  />
                  <Chip
                    label={car.status}
                    color={getStatusColor(car.status) as any}
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {car.brand} {car.model}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {isPart(car) ? 'Spare part' : `${car.year} • ${car.mileage?.toLocaleString()} miles`}
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    {formatPrice(car.price)}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewCar(car.id)}
                    >
                      View
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, car)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedIds.size > 0 && selectedIds.size < cars.length}
                      checked={cars.length > 0 && selectedIds.size === cars.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>Car Details</TableCell>
                  <TableCell sortDirection={sortBy === 'price' ? sortDir : false as any}>
                    <TableSortLabel
                      active={sortBy === 'price'}
                      direction={sortBy === 'price' ? sortDir : 'asc'}
                      onClick={() => handleRequestSort('price')}
                    >
                      Price
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'status'}
                      direction={sortBy === 'status' ? sortDir : 'asc'}
                      onClick={() => handleRequestSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedCars.map((car) => (
                  <TableRow key={car.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedIds.has(car.id)} onChange={() => toggleSelectOne(car.id)} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          variant="rounded"
                          src={getCarImage(car)}
                          sx={{ width: 60, height: 60, bgcolor: 'grey.200' }}
                        >
                          {car.brand}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {car.brand} {car.model}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {car.year} • {car.mileage?.toLocaleString()} miles
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" fontWeight={700}>
                        {formatPrice(car.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={car.status}
                        color={getStatusColor(car.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {Math.floor(Math.random() * 100)} views
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewCar(car.id)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Car">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCar(car.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Car">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCar(car)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            page={page}
            onChange={(_, p) => setPage(p)}
            count={Math.max(1, Math.ceil((total || cars.length) / rowsPerPage))}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>

        {/* Floating Action Button for Mobile */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
          onClick={handleAddCar}
        >
          <AddIcon />
        </Fab>

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleViewCar(selectedCar?.id)}>
            <ViewIcon sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => handleEditCar(selectedCar?.id)}>
            <EditIcon sx={{ mr: 1 }} />
            Edit Car
          </MenuItem>
          <MenuItem onClick={() => handleDeleteCar(selectedCar)} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete Car
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Car</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{selectedCar?.brand} {selectedCar?.model}"?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </SellerLayout>
  );
};

export default SellerCars;
