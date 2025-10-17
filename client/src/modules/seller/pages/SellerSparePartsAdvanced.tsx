import React, { useState, useEffect, useMemo } from 'react';
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
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Build as BuildIcon,
  Category as CategoryIcon,
  BrandingWatermark as BrandIcon,
} from '@mui/icons-material';

const SellerSparePartsAdvanced: React.FC = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const sellerId = (authUser as any)?.id || (authUser as any)?._id;
  
  const [partsLoading, setPartsLoading] = useState(false);
  const [parts, setPartsState] = useState<Array<any>>([]);
  const [partSearch, setPartSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingPart, setEditingPart] = useState<any | null>(null);
  const [selectedPart, setSelectedPart] = useState<any | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [lastDataHash, setLastDataHash] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParts, setTotalParts] = useState(0);
  
  // Client-side pagination for filtered results
  const [filteredCurrentPage, setFilteredCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 parts per page

  // Enhanced table features
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Filter menu state
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    status: '',
    priceMin: '',
    priceMax: '',
    condition: '',
    stockMin: '',
    stockMax: ''
  });

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(partSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [partSearch]);

  // Load parts function
  const loadParts = async (page: number = 1) => {
    if (!sellerId) return;
    
    setPartsLoading(true);
    try {
      const response = await sellerApi.parts.getMyParts({
        page,
        limit: 20,
        search: debouncedSearch,
        status: filterStatus === 'all' ? '' : filterStatus,
        sort_by: sortField,
        sort_order: sortOrder
      });
      
      setPartsState(response.parts || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalParts(response.pagination?.total || 0);
      setCurrentPage(page);
      setLastRefreshTime(new Date());
      setLastDataHash(generateDataHash(response.parts || []));
    } catch (error) {
      console.error('Error loading spare parts:', error);
      toast.error('Failed to load spare parts');
      // Fallback to empty state on error
      setPartsState([]);
      setTotalPages(1);
      setTotalParts(0);
    } finally {
      setPartsLoading(false);
    }
  };

  // Generate hash for data change detection
  const generateDataHash = (data: any[]) => {
    if (!data || data.length === 0) return '';
    return data.map(part => `${part.id}-${part.updated_at || part.created_at}`).join('|');
  };

  // Load parts on component mount and when dependencies change
  useEffect(() => {
    loadParts(currentPage);
  }, [sellerId, debouncedSearch, sortField, sortOrder, filterStatus]);

  // Filter and sort parts
  const filteredAndSortedParts = useMemo(() => {
    let filtered = parts.filter(part => {
      // Apply filters
      if (filters.category && part.category_name !== filters.category) return false;
      if (filters.brand && part.brand_name !== filters.brand) return false;
      if (filters.status && part.status !== filters.status) return false;
      if (filters.condition && part.condition !== filters.condition) return false;
      if (filters.priceMin && part.price < parseFloat(filters.priceMin)) return false;
      if (filters.priceMax && part.price > parseFloat(filters.priceMax)) return false;
      if (filters.stockMin && part.stock_quantity < parseInt(filters.stockMin)) return false;
      if (filters.stockMax && part.stock_quantity > parseInt(filters.stockMax)) return false;
      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'price' || sortField === 'stock_quantity') {
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
  }, [parts, filters, sortField, sortOrder]);

  // Pagination for filtered results
  const paginatedParts = useMemo(() => {
    const startIndex = (filteredCurrentPage - 1) * itemsPerPage;
    return filteredAndSortedParts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedParts, filteredCurrentPage, itemsPerPage]);

  // Helper functions
  const getUniqueCategories = () => {
    const categories = [...new Set(parts.map(part => part.category_name).filter(Boolean))];
    return categories.sort();
  };

  const getUniqueBrands = () => {
    const brands = [...new Set(parts.map(part => part.brand_name).filter(Boolean))];
    return brands.sort();
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

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'success';
      case 'used': return 'warning';
      case 'refurbished': return 'info';
      case 'remanufactured': return 'primary';
      default: return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
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

  const handleEditPart = (part: any) => {
    setEditingPart(part);
    // Navigate to edit page or open edit modal
    console.log('Edit part:', part);
  };

  const handleDeletePart = async (part: any) => {
    if (!part?.id) return;
    
    if (!window.confirm(`Are you sure you want to delete "${part.name}"?`)) {
      return;
    }
    
    try {
      await sellerApi.parts.deletePart(part.id);
      toast.success('Part deleted successfully');
      await loadParts(currentPage);
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const handleViewPart = (part: any) => {
    setSelectedPart(part);
    console.log('View part:', part);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      status: '',
      priceMin: '',
      priceMax: '',
      condition: '',
      stockMin: '',
      stockMax: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            My Spare Parts Listings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => loadParts(currentPage)}
              disabled={partsLoading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                window.location.href = '/seller/parts/add';
              }}
            >
              Add New Part
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search parts..."
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
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

        {/* Parts List */}
        <Card>
          <CardContent>
            {partsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : paginatedParts.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <BuildIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {sellerId ? 'You haven\'t created any spare part listings yet.' : 'Please log in to view your listings.'}
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => {
                    window.location.href = '/seller/parts/add';
                  }}
                  sx={{ mt: 1 }}
                >
                  Create Your First Part Listing
                </Button>
              </Box>
            ) : (
              <>
                {/* Table Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {totalParts} part{totalParts !== 1 ? 's' : ''} found
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
                      startIcon={<InventoryIcon />}
                      onClick={() => handleSort('stock_quantity')}
                      variant={sortField === 'stock_quantity' ? 'contained' : 'outlined'}
                    >
                      Stock
                    </Button>
                  </Box>
                </Box>

                {/* Parts Grid */}
                <Grid container spacing={2}>
                  {paginatedParts.map((part) => (
                    <Grid item xs={12} sm={6} md={4} key={part.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardActionArea onClick={() => handleViewPart(part)}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={part.images?.[0] || '/placeholder-part.jpg'}
                            alt={part.name}
                            sx={{ objectFit: 'cover' }}
                          />
                        </CardActionArea>
                        
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                              {part.name}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Chip
                                icon={getStatusIcon(part.status)}
                                label={part.status}
                                color={getStatusColor(part.status) as any}
                                size="small"
                              />
                              {part.is_featured && (
                                <Chip
                                  label="Featured"
                                  color="primary"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <CategoryIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {part.category_name} • <BrandIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {part.brand_name}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <Chip
                              label={part.condition}
                              color={getConditionColor(part.condition) as any}
                              size="small"
                              variant="outlined"
                            />
                          </Typography>
                          
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                            {formatPrice(part.price || 0)}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <InventoryIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            Stock: {part.stock_quantity}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Listed on {formatDate(part.created_at)}
                          </Typography>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                          <Box>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => handleViewPart(part)}>
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditPart(part)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDeletePart(part)}>
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
                {filteredAndSortedParts.length > itemsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={Math.ceil(filteredAndSortedParts.length / itemsPerPage)}
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
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <MenuItem value="">All Categories</MenuItem>
            {getUniqueCategories().map((category, index) => (
              <MenuItem key={`category-${index}-${category}`} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Brand</InputLabel>
          <Select
            value={filters.brand}
            label="Brand"
            onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
          >
            <MenuItem value="">All Brands</MenuItem>
            {getUniqueBrands().map((brand, index) => (
              <MenuItem key={`brand-${index}-${brand}`} value={brand}>{brand}</MenuItem>
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
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Condition</InputLabel>
          <Select
            value={filters.condition}
            label="Condition"
            onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
          >
            <MenuItem value="">All Conditions</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="used">Used</MenuItem>
            <MenuItem value="refurbished">Refurbished</MenuItem>
            <MenuItem value="remanufactured">Remanufactured</MenuItem>
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
            label="Min Stock"
            type="number"
            value={filters.stockMin}
            onChange={(e) => setFilters(prev => ({ ...prev, stockMin: e.target.value }))}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="Max Stock"
            type="number"
            value={filters.stockMax}
            onChange={(e) => setFilters(prev => ({ ...prev, stockMax: e.target.value }))}
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

export default SellerSparePartsAdvanced;
