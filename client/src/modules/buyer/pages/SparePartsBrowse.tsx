import React from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  Chip,
  Divider,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Stack,
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  FilterList as FilterIcon,
  Tune as TuneIcon,
  Build as PartIcon,
} from '@mui/icons-material';
import BuyerLayout from '../components/layout/BuyerLayout';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import { STORAGE_KEYS } from '../../../core/config/constants';
import { api as coreApi } from '../../../core/services/api/apiClient';
import toast from 'react-hot-toast';
import { LinearProgress, CircularProgress } from '@mui/material';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1600&auto=format&fit=crop';

interface SparePartItem {
  id: string;
  name: string;
  title?: string;
  price?: number;
  currency?: string;
  images?: string[] | string;
  seller_name?: string;
  brand?: string;
  category?: string;
  sku?: string;
}

const SparePartsBrowse: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([]);
  const [items, setItems] = React.useState<SparePartItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const searchDebounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filters state
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [priceRange, setPriceRange] = React.useState<number[]>([0, 10000]);
  const [isFullPriceRange, setIsFullPriceRange] = React.useState<boolean>(true);
  const [brand, setBrand] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [sortBy, setSortBy] = React.useState('relevance');

  const imgFrom = (p: SparePartItem) => {
    try {
      if (!p.images) return '';
      if (Array.isArray(p.images)) {
        const firstImg = p.images[0] || '';
        if (firstImg && firstImg.startsWith('/uploads/')) {
          return getImageUrl(firstImg);
        }
        return firstImg;
      }
      if (typeof p.images === 'string') {
        try {
          const parsed = JSON.parse(p.images);
          if (Array.isArray(parsed)) {
            const firstImg = parsed[0] || '';
            if (firstImg && firstImg.startsWith('/uploads/')) {
              return getImageUrl(firstImg);
            }
            return firstImg;
          }
        } catch {
          // If it's a single string path
          if (p.images.startsWith('/uploads/')) {
            return getImageUrl(p.images);
          }
          return p.images;
        }
      }
      return '';
    } catch {
      return '';
    }
  };

  // Debounced search effect
  React.useEffect(() => {
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    searchDebounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500); // 500ms debounce
    
    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [query]);

  const load = React.useCallback(async (retryAttempt = 0): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Use core API client with proper error handling and timeout
      const searchParam = debouncedQuery ? `&q=${encodeURIComponent(debouncedQuery)}` : '';
      
      const response = await coreApi.get(`/spare-parts/public?limit=100${searchParam}`, {
        timeout: 15000, // 15 seconds timeout for slower connections
      });
      
      // Handle different response structures
      const responseData = response.data || {};
      let list: any[] = [];
      
      // Try multiple possible data paths
      if (Array.isArray(responseData)) {
        list = responseData;
      } else if (Array.isArray(responseData.data)) {
        list = responseData.data;
      } else if (Array.isArray(responseData.spare_parts)) {
        list = responseData.spare_parts;
      } else if (Array.isArray(responseData.parts)) {
        list = responseData.parts;
      } else if (responseData.results && Array.isArray(responseData.results)) {
        list = responseData.results;
      }
      
      // Map items with fallbacks for missing fields
      const mappedItems = list.map((x: any) => ({
        id: x.id || x.part_id || x._id || Math.random().toString(36).slice(2),
        name: x.name || x.title || 'Spare Part',
        title: x.title || x.name || 'Spare Part',
        price: Number(x.price ?? x.unit_price ?? x.amount ?? 0),
        currency: x.currency || 'USD',
        images: x.images || x.image || [],
        seller_name: x.seller_name || x.seller?.name || x.seller || '',
        brand: x.brand || x.brand_name || x.brand_id || '',
        category: x.category || x.category_name || x.category_id || '',
        sku: x.sku || x.sku_code || '',
      }));
      
      setItems(mappedItems);
      setRetryCount(0); // Reset retry count on success
      
      // Update price range based on loaded items
      const prices = mappedItems.map(item => item.price).filter(p => p > 0);
      if (prices.length > 0) {
        const maxPrice = Math.max(...prices);
        setPriceRange((prev) => [prev[0], Math.max(maxPrice, 10000)]);
      }
      
    } catch (error: any) {
      console.error('Failed to load spare parts:', error);
      
      // Retry logic for network errors or 5xx errors
      const shouldRetry = retryAttempt < 2 && (
        !error.response || // Network error
        error.response.status >= 500 || // Server error
        error.code === 'ECONNABORTED' || // Timeout
        error.message === 'Network Error'
      );
      
      if (shouldRetry) {
        // Exponential backoff: wait 1s, 2s, etc.
        const delay = Math.min(1000 * Math.pow(2, retryAttempt), 5000);
        console.log(`Retrying after ${delay}ms (attempt ${retryAttempt + 1})...`);
        
        setTimeout(() => {
          load(retryAttempt + 1);
        }, delay);
        
        setRetryCount(retryAttempt + 1);
        return;
      }
      
      // Determine user-friendly error message
      let errorMessage = 'Failed to load spare parts';
      if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Spare parts service not found. Please try again later.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      setItems([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  // Load data when debounced query changes
  React.useEffect(() => { 
    load(); 
  }, [load]);

  const toggleFavorite = async (id: string) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || localStorage.getItem('access_token');
    if (!token || token.trim() === '') {
      navigate('/');
      return;
    }

    const isCurrentlyFavorite = favoriteIds.includes(id);
    
    try {
      // Note: Spare parts favorites might need a separate endpoint
      // For now, we'll just toggle the UI state
      setFavoriteIds((prev) => {
        if (isCurrentlyFavorite) {
          return prev.filter((x) => x !== id);
        } else {
          return [...prev, id];
        }
      });
    } catch (e: any) {
      console.error('Failed to toggle favorite:', e);
    }
  };

  const filtered = items.filter((item) => {
    const matchesQuery = debouncedQuery
      ? item.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
        (item.sku && item.sku.toLowerCase().includes(debouncedQuery.toLowerCase())) ||
        (item.brand && item.brand.toLowerCase().includes(debouncedQuery.toLowerCase()))
      : true;
    const price = item.price;
    const matchesPrice = isFullPriceRange || price === undefined || (price >= priceRange[0] && price <= priceRange[1]);
    const matchesBrand = brand ? (item.brand?.toLowerCase().includes(brand.toLowerCase()) || false) : true;
    const matchesCategory = category ? (item.category?.toLowerCase().includes(category.toLowerCase()) || false) : true;
    return matchesQuery && matchesPrice && matchesBrand && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return (a.price ?? 0) - (b.price ?? 0);
      case 'price_high':
        return (b.price ?? 0) - (a.price ?? 0);
      case 'name_asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name_desc':
        return (b.name || '').localeCompare(a.name || '');
      default:
        return 0;
    }
  });

  const TopFilters = (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TuneIcon />
            <Typography variant="h6" fontWeight={700}>Filters</Typography>
          </Stack>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="sort-label">Sort by</InputLabel>
              <Select labelId="sort-label" label="Sort by" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
                <MenuItem value="name_asc">Name: A-Z</MenuItem>
                <MenuItem value="name_desc">Name: Z-A</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup size="small" value={view} exclusive onChange={(_, val) => val && setView(val)}>
              <ToggleButton value="grid">
                <GridIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button variant="outlined" startIcon={<FilterIcon />}>Filters</Button>
          </Box>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3} lg={3}>
            <TextField
              fullWidth
              label="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, SKU, brand..."
            />
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="brand-label">Brand</InputLabel>
              <Select
                labelId="brand-label"
                label="Brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <MenuItem value="">Any</MenuItem>
                {Array.from(new Set(items.map(i => i.brand).filter(Boolean))).map(b => (
                  <MenuItem key={b} value={b}>{b}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">Any</MenuItem>
                {Array.from(new Set(items.map(i => i.category).filter(Boolean))).map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Price Range
            </Typography>
            <Slider
              value={priceRange}
              min={0}
              max={priceRange[1]}
              step={10}
              onChange={(_, val) => { setPriceRange(val as number[]); setIsFullPriceRange(false); }}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Button fullWidth variant="outlined" onClick={() => {
              setQuery('');
              setBrand('');
              setCategory('');
              setPriceRange([0, priceRange[1]]);
              setIsFullPriceRange(true);
            }}>
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const ListingCard: React.FC<{ item: SparePartItem; view: 'grid' | 'list' }> = ({ item, view }) => {
    const imageUrl = imgFrom(item);
    return (
      <Card 
        sx={{ 
          height: '100%', 
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          }
        }}
        onClick={() => navigate(`/spare-parts/${item.id}`)}
      >
        <Box sx={{ position: 'relative' }}>
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={item.name}
              sx={{ width: '100%', height: view === 'grid' ? 180 : 220, objectFit: 'cover' }}
              onError={(e: any) => { 
                e.currentTarget.src = FALLBACK_IMAGE; 
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: view === 'grid' ? 180 : 220,
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">No Image</Typography>
            </Box>
          )}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
          >
            {favoriteIds.includes(item.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PartIcon fontSize="small" /> {item.title || item.name}
            </Typography>
            <Typography variant="h6" fontWeight={800} color="primary">
              {item.price ? `${item.currency || 'USD'} ${Number(item.price).toLocaleString()}` : '—'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {item.brand && <Chip label={item.brand} size="small" />}
            {item.category && <Chip label={item.category} size="small" color="primary" variant="outlined" />}
            {item.sku && <Chip label={`SKU: ${item.sku}`} size="small" variant="outlined" />}
          </Box>
          {item.seller_name && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Seller: {item.seller_name}
            </Typography>
          )}
          <Divider sx={{ my: 1.5 }} />
          <Button 
            variant="contained" 
            fullWidth 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/spare-parts/${item.id}`);
            }}
          >
            View Details & Order
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <BuyerLayout>
      <Box>
        {/* Title */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PartIcon /> Browse Spare Parts
          </Typography>
        </Box>

        {TopFilters}
        <Grid container spacing={2}>
          {/* Results */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {loading && retryCount === 0 && (
                <Box sx={{ width: '100%', p: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    Loading spare parts...
                  </Typography>
                </Box>
              )}
              {loading && retryCount > 0 && (
                <Box sx={{ width: '100%', p: 2, textAlign: 'center' }}>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary" component="span">
                    Retrying... (Attempt {retryCount + 1})
                  </Typography>
                </Box>
              )}
              {error && !loading && (
                <Box sx={{ width: '100%', p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="error.main" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => {
                      setError(null);
                      setRetryCount(0);
                      load();
                    }}
                  >
                    Retry
                  </Button>
                </Box>
              )}
              {!loading && !error && filtered.length === 0 && (
                <Box sx={{ width: '100%', p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    No spare parts found.
                  </Typography>
                  {debouncedQuery && (
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search or filters.
                    </Typography>
                  )}
                </Box>
              )}
              {!loading && !error && filtered.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                      Found {filtered.length} spare part{filtered.length !== 1 ? 's' : ''}
                    </Typography>
                  </Grid>
                  {filtered.map((item) => (
                    <Grid key={item.id} item xs={12} sm={view === 'grid' ? 6 : 12} md={view === 'grid' ? 4 : 12}>
                      <ListingCard item={item} view={view} />
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </BuyerLayout>
  );
};

export default SparePartsBrowse;
