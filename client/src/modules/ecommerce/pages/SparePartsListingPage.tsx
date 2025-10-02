import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  useTheme,
  alpha,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Badge,
} from '@mui/material';
import {
  Build,
  Search,
  FilterList,
  FavoriteBorder,
  LocationOn,
  Inventory,
  Star,
  Visibility,
  Share,
  Compare,
  LocalShipping,
  Verified,
  Schedule,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import SparePartsApiService, { SparePart, SparePartFilters } from '../../../core/services/api/sparePartsApiService';

const SparePartsListingPage: React.FC = () => {
  const theme = useTheme();
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SparePartFilters>({
    page: 1,
    limit: 12,
    sort_by: 'created_at',
    sort_order: 'DESC'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Load spare parts on component mount and when filters change
  useEffect(() => {
    loadSpareParts();
  }, [filters]);

  // Load available brands and categories on component mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const brands = await SparePartsApiService.getBrands();
        const categories = SparePartsApiService.getCategories();

        setAvailableBrands(brands.slice(0, 20)); // Limit to first 20 brands
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error loading filters:', error);
        // Use static fallback data if API fails
        setAvailableBrands([
          'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
          'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus',
          'Acura', 'Infiniti', 'Cadillac', 'Lincoln', 'Buick', 'GMC'
        ]);
        setAvailableCategories(SparePartsApiService.getCategories());
      }
    };

    loadFilters();
  }, []);

  const loadSpareParts = async () => {
    try {
      setLoading(true);
      setError(null);

      let sparePartsData;
      if (searchQuery.trim()) {
        sparePartsData = await SparePartsApiService.searchSpareParts(searchQuery, filters);
      } else {
        sparePartsData = await SparePartsApiService.listSpareParts(filters);
      }

      setSpareParts(sparePartsData);
      // For now, we'll calculate pagination based on the limit
      // In a real implementation, the backend should return total count
      const totalParts = sparePartsData.length;
      const calculatedPages = Math.max(1, Math.ceil(totalParts / (filters.limit || 12)));
      setTotalPages(calculatedPages);
    } catch (err) {
      console.error('Error loading spare parts:', err);
      setError('Failed to load spare parts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    loadSpareParts();
  };

  const handleFilterChange = (key: keyof SparePartFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Function to get appropriate spare part image based on category
  const getSparePartImage = (sparePart: SparePart) => {
    // Sample high-quality spare part images from reliable sources
    const partImages: { [key: string]: string } = {
      'Engine Parts': 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'Brake System': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'Electrical System': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'Suspension & Steering': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'Body Parts': 'https://images.unsplash.com/photo-1580414155534-57fe7737c3d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    };

    // Try exact category match first
    if (partImages[sparePart.category]) {
      return partImages[sparePart.category];
    }

    // Try partial category match
    const categoryImages = Object.keys(partImages).filter(key =>
      sparePart.category.toLowerCase().includes(key.toLowerCase())
    );
    if (categoryImages.length > 0) {
      return partImages[categoryImages[0]];
    }

    // Default fallback to a generic automotive part image
    return 'https://images.unsplash.com/photo-1486754735734-325b5831c3d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
  };

  const handleImageLoad = (partId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [partId]: false }));
  };

  const handleImageLoadStart = (partId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [partId]: true }));
  };

  // Render enhanced spare part card
  const renderSparePartCard = (part: SparePart, index: number) => (
    <Box
      key={part.id}
      sx={{
        width: { xs: '100%', sm: '50%', lg: '33.333%' },
        p: 1
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            '&:hover': {
              transform: 'translateY(-12px)',
              boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
              borderColor: alpha(theme.palette.primary.main, 0.3),
            },
          }}
        >
          {/* Image Section with Overlay Actions */}
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            {imageLoadingStates[part.id] && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(theme.palette.background.default, 0.8),
                  zIndex: 2,
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}

            <CardMedia
              component="img"
              height="220"
              image={getSparePartImage(part)}
              alt={part.name}
              sx={{
                objectFit: 'cover',
                transition: 'transform 0.3s ease-in-out',
                borderRadius: '8px 8px 0 0',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
              onLoad={() => handleImageLoad(part.id)}
              onLoadStart={() => handleImageLoadStart(part.id)}
              onError={(e) => {
                handleImageLoad(part.id);
                // Fallback to a default image if the main image fails to load
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486754735734-325b5831c3d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
              }}
            />

            {/* Overlay Actions */}
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Tooltip title="Add to Favorites">
                <IconButton
                  sx={{
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: theme.palette.error.main,
                      color: 'white',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <FavoriteBorder />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Status Badges */}
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Chip
                label={part.condition?.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: alpha(
                    part.condition === 'new' ? theme.palette.success.main :
                    part.condition === 'refurbished' ? theme.palette.info.main :
                    part.condition === 'used' ? theme.palette.warning.main :
                    theme.palette.secondary.main, 0.9
                  ),
                  color: 'white',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(10px)',
                }}
              />

              {part.is_featured && (
                <Chip
                  label="FEATURED"
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.9),
                    color: 'white',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}

              {part.stock_quantity <= 5 && part.stock_quantity > 0 && (
                <Chip
                  label={`Only ${part.stock_quantity} left`}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.error.main, 0.9),
                    color: 'white',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}
            </Box>
          </Box>

          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            {/* Title and Part Number */}
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {part.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  Part #: {part.part_number}
                </Typography>
              </Box>

              {part.rating && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Star fontSize="small" sx={{ color: '#ffc107' }} />
                  <Typography variant="body2" fontWeight="bold">
                    {part.rating.toFixed(1)}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Price and Stock */}
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {formatPrice(Number(part.price))}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Part Details */}
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Build fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Brand
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  {part.brand}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Inventory fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Stock
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  {part.stock_quantity} available
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  {part.location}
                </Typography>
              </Box>

              {part.warranty_months && (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Verified fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Warranty
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="medium">
                    {part.warranty_months} months
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Compatibility */}
            {part.compatibility.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Compatible with:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {part.compatibility.slice(0, 3).map((vehicle, idx) => (
                    <Chip
                      key={idx}
                      label={vehicle}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                  {part.compatibility.length > 3 && (
                    <Chip
                      label={`+${part.compatibility.length - 3} more`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}
            >
              {part.description}
            </Typography>
          </CardContent>

          <CardActions sx={{ p: 3, pt: 0 }}>
            <Stack direction="row" spacing={1} width="100%">
              <Button
                variant="contained"
                fullWidth
                startIcon={<Visibility />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                }}
              >
                View Details
              </Button>

              <Tooltip title="Share">
                <IconButton
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Share />
                </IconButton>
              </Tooltip>

              <Tooltip title="Compare">
                <IconButton
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Compare />
                </IconButton>
              </Tooltip>
            </Stack>
          </CardActions>
        </Card>
      </motion.div>
    </Box>
  );

  // Show loading state
  if (loading && spareParts.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h3"
          component="h1"
          fontWeight="bold"
          gutterBottom
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4,
          }}
        >
          Spare Parts
        </Typography>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              fullWidth
              placeholder="Search spare parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ minWidth: 120 }}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterList />}
            >
              Filters
            </Button>
          </Box>

          {showFilters && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mt: 2
              }}
            >
              <Box sx={{ width: { xs: '100%', sm: '48%', md: '23%' } }}>
                <FormControl fullWidth>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={filters.brand || ''}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    label="Brand"
                  >
                    <MenuItem value="">All Brands</MenuItem>
                    {availableBrands.map(brand => (
                      <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ width: { xs: '100%', sm: '48%', md: '23%' } }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {availableCategories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ width: { xs: '100%', sm: '48%', md: '23%' } }}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={filters.condition || ''}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    label="Condition"
                  >
                    <MenuItem value="">All Conditions</MenuItem>
                    {SparePartsApiService.getConditions().map(condition => (
                      <MenuItem key={condition} value={condition}>{condition}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ width: { xs: '100%', sm: '48%', md: '23%' } }}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={`${filters.sort_by || 'created_at'}_${filters.sort_order || 'DESC'}`}
                    onChange={(e) => {
                      const [sort_by, sort_order] = e.target.value.split('_');
                      handleFilterChange('sort_by', sort_by);
                      handleFilterChange('sort_order', sort_order);
                    }}
                    label="Sort By"
                  >
                    <MenuItem value="created_at_DESC">Newest First</MenuItem>
                    <MenuItem value="price_ASC">Price: Low to High</MenuItem>
                    <MenuItem value="price_DESC">Price: High to Low</MenuItem>
                    <MenuItem value="name_ASC">Name: A to Z</MenuItem>
                    <MenuItem value="rating_DESC">Highest Rated</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}
        </Paper>
      </motion.div>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Spare Parts Grid */}
      {spareParts.length > 0 ? (
        <>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              mt: 2
            }}
          >
            {spareParts.map((part, index) => renderSparePartCard(part, index))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={filters.page || 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : !loading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Build sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No spare parts found
          </Typography>
          <Typography color="text.secondary">
            Try adjusting your search criteria or filters.
          </Typography>
        </Paper>
      )}

      {/* Loading overlay for subsequent loads */}
      {loading && spareParts.length > 0 && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(255, 255, 255, 0.8)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default SparePartsListingPage;
