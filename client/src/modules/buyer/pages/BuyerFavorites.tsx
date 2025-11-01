import React from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import { buyerApi } from '../services/buyerApi';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import { STORAGE_KEYS } from '../../../core/config/constants';

// Fallback image for when real image fails to load
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1600&auto=format&fit=crop';

// Robustly extract a primary image from various backend shapes (same as BrowsePage)
const extractPrimaryImage = (car: any): string | null => {
  const tryParseArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val as any[];
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed as any[];
      } catch {}
      // comma-separated paths
      if (val.includes(',')) return val.split(',').map((s) => s.trim());
      // Single string path
      if (val.trim()) return [val.trim()];
    }
    return [];
  };

  const candidatesRaw: any[] = [];

  // Priority 1: Check images field (most common)
  if (car.images) {
    candidatesRaw.push(...tryParseArray(car.images));
  }

  // Priority 2: Check photos field
  if (car.photos) {
    candidatesRaw.push(...tryParseArray(car.photos));
  }

  // Priority 3: Check images_json field
  if (car.images_json) {
    candidatesRaw.push(...tryParseArray(car.images_json));
  }

  // Priority 4: Check single image fields
  const singleFields = [car.image, car.photo, car.thumbnail, car.main_image, car.mainImage, car.cover, car.cover_image, car.imageUrl, car.photoUrl];
  for (const f of singleFields) {
    if (typeof f === 'string' && f.trim()) {
      candidatesRaw.push(f.trim());
    }
  }

  // Priority 5: Heuristic scan for image-related fields
  try {
    Object.keys(car || {}).forEach((k) => {
      const lk = k.toLowerCase();
      if ((lk.includes('image') || lk.includes('photo') || lk.includes('thumbnail') || lk.includes('thumb')) && !candidatesRaw.some(c => c === (car as any)[k])) {
        const v = (car as any)[k];
        const arr = tryParseArray(v);
        if (arr.length > 0) {
          candidatesRaw.push(...arr);
        } else if (typeof v === 'string' && v.trim()) {
          candidatesRaw.push(v.trim());
        } else if (v && typeof v === 'object') {
          // nested url/path
          if (v.url) candidatesRaw.push(String(v.url));
          if (v.path) candidatesRaw.push(String(v.path));
          if (v.src) candidatesRaw.push(String(v.src));
        }
      }
    });
  } catch {}

  // Normalize to string URLs - filter out empty and convert to proper URLs
  const normalized: string[] = candidatesRaw
    .map((item) => {
      if (!item) return '';
      if (typeof item === 'string') return item.trim();
      if (typeof item === 'object') {
        // common object shapes { url } or { path }
        if (item.url) return String(item.url).trim();
        if (item.path) return String(item.path).trim();
        if (item.src) return String(item.src).trim();
      }
      return '';
    })
    .filter((s) => typeof s === 'string' && s.trim().length > 0) as string[];

  if (normalized.length > 0) {
    const first = normalized[0];
    
    // If it's already a full path, use it
    if (first.startsWith('/uploads/cars/')) {
      return getImageUrl(first);
    }
    
    // If it's a full path with /uploads/, use it
    if (first.startsWith('/uploads/')) {
      return getImageUrl(first);
    }
    
    // If it's already an absolute URL, return it
    if (first.startsWith('http://') || first.startsWith('https://')) {
      return first;
    }
    
    // If it's just a filename (like "1761820541820-8688-car-image-1.webp"), 
    // try to reconstruct the path using car ID
    if (first && car.id && !first.includes('/')) {
      // Try to reconstruct: /uploads/cars/{carId}/{filename}
      const reconstructed = `/uploads/cars/${car.id}/${first}`;
      return getImageUrl(reconstructed);
    }
    
    // Otherwise, try getImageUrl which handles relative paths
    const url = getImageUrl(first);
    if (url && !url.includes('images.unsplash.com')) {
      return url;
    }
  }

  // Return null instead of fallback - let the component handle it
  return null;
};

type FavoriteItem = {
  id: string;
  car_id: string;
  title: string;
  price: number;
  year?: number;
  mileage?: number;
  location?: string;
  thumbnail?: string;
};

const BuyerFavorites: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [items, setItems] = React.useState<FavoriteItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Check authentication before making API calls
  React.useEffect(() => {
    // Check if user is authenticated and has a token
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || localStorage.getItem('access_token');
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA) || localStorage.getItem('user_data');
    
    if (!token || !userData) {
      console.warn('⚠️ No token or user data found, redirecting to login');
      setError('Please login to view your favorites');
      setLoading(false);
      // Redirect will be handled by ProtectedRoute
      return;
    }

    // Verify token is not empty
    if (token.trim() === '') {
      console.warn('⚠️ Token is empty, redirecting to login');
      setError('Invalid authentication token. Please login again.');
      setLoading(false);
      return;
    }
  }, []);

  // Fetch favorites from API
  React.useEffect(() => {
    const fetchFavorites = async () => {
      // Check authentication first
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || localStorage.getItem('access_token');
      if (!token || token.trim() === '') {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await buyerApi.getFavorites(1, 100);
        
        // Backend returns cars directly as an array (from the join query)
        // The API extracts data.data which gives us the array of cars
        // Response format: { favorites: Favorite[] } or direct array
        let favoritesData: any[] = [];
        
        if (Array.isArray(response)) {
          // Direct array
          favoritesData = response;
        } else if (Array.isArray(response.favorites)) {
          // Wrapped in favorites property
          favoritesData = response.favorites;
        } else if (Array.isArray(response.data)) {
          // Wrapped in data property
          favoritesData = response.data;
        } else {
          // Try to extract from any nested structure
          favoritesData = [];
        }
        
        console.log('🔍 Favorites response:', response);
        console.log('🔍 Parsed favorites data:', favoritesData);
        
        const mapped: FavoriteItem[] = favoritesData.map((car: any, idx: number) => {
          // Backend returns car data directly from the join (c.*)
          // The car ID is in the 'id' field from the cars table
          const carId = car.id || car.car_id || String(idx);
          const title = car.title || [car.brand, car.model].filter(Boolean).join(' ') || 'Vehicle';
          const image = extractPrimaryImage(car);
          
          return {
            id: carId,
            car_id: carId,
            title,
            price: car.price ? Number(car.price) : 0,
            year: car.year ? Number(car.year) : undefined,
            mileage: car.mileage ? Number(car.mileage) : undefined,
            location: car.location || car.city || car.region,
            thumbnail: image || undefined,
          };
        });
        
        console.log('✅ Mapped favorites:', mapped);
        setItems(mapped);
      } catch (e: any) {
        console.error('Failed to fetch favorites:', e);
        
        // Handle 401 Unauthorized - token expired or invalid
        if (e?.response?.status === 401) {
          setError('Your session has expired. Please login again.');
          // Clear invalid tokens
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem('access_token');
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem('refresh_token');
          // Redirect will be handled by ProtectedRoute or we can redirect manually
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else if (e?.response?.status === 403) {
          setError('You do not have permission to view favorites. Please ensure you are logged in as a buyer.');
        } else {
          setError(e?.response?.data?.message || e?.response?.data?.error || 'Failed to load favorites. Please try again.');
        }
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a token
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || localStorage.getItem('access_token');
    if (token && token.trim() !== '') {
      fetchFavorites();
    } else {
      setLoading(false);
      setError('Authentication required. Please login.');
    }
  }, []);

  const remove = async (carId: string) => {
    // Check authentication before making API call
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || localStorage.getItem('access_token');
    if (!token || token.trim() === '') {
      setError('Authentication required. Please login again.');
      return;
    }

    try {
      await buyerApi.removeFromFavorites(carId);
      // Remove from local state
      setItems((prev) => prev.filter((x) => x.car_id !== carId && x.id !== carId));
    } catch (e: any) {
      console.error('Failed to remove favorite:', e);
      
      if (e?.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem('access_token');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setError(e?.response?.data?.message || e?.response?.data?.error || 'Failed to remove favorite');
      }
    }
  };

  const clearAll = async () => {
    // Check authentication before making API call
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || localStorage.getItem('access_token');
    if (!token || token.trim() === '') {
      setError('Authentication required. Please login again.');
      return;
    }

    // Remove all favorites one by one
    const removePromises = items.map(item => buyerApi.removeFromFavorites(item.car_id || item.id));
    try {
      await Promise.all(removePromises);
      setItems([]);
    } catch (e: any) {
      console.error('Failed to clear favorites:', e);
      
      if (e?.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem('access_token');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setError(e?.response?.data?.message || e?.response?.data?.error || 'Failed to clear favorites');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && items.length === 0) {
    return (
      <Box>
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom color="error">
                Error loading favorites
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Button variant="contained" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight={700}>My Favorites</Typography>
        {items.length > 0 && (
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={clearAll}>
            Clear All
          </Button>
        )}
        </Box>

      {error && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </CardContent>
        </Card>
      )}

        {items.length === 0 ? (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  No favorites yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Browse cars and tap the heart to save them here.
                </Typography>
              <Button variant="contained" onClick={() => navigate('/browse')}>Start Browsing</Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid key={item.id} item xs={12} sm={6} md={4}>
                <Card>
                  <Box sx={{ position: 'relative' }}>
                  {item.thumbnail ? (
                    <Box
                      component="img"
                      src={item.thumbnail}
                      alt={item.title}
                      sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                      onError={(e: any) => { 
                        e.currentTarget.src = FALLBACK_IMAGE; 
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
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
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }} 
                    onClick={() => remove(item.car_id || item.id)}
                  >
                      <FavoriteIcon color="error" />
                    </IconButton>
                  </Box>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CarIcon fontSize="small" /> {item.title}
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="primary">
                      {item.price > 0 ? `$${item.price.toLocaleString()}` : '—'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {item.year && <Chip label={`${item.year}`} size="small" />}
                    {item.mileage && <Chip label={`${item.mileage.toLocaleString()} mi`} size="small" />}
                    {item.location && <Chip label={item.location} size="small" />}
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={() => navigate(`/cars/${item.car_id || item.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      fullWidth 
                      onClick={() => remove(item.car_id || item.id)} 
                      startIcon={<FavoriteBorderIcon />}
                    >
                        Remove
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
  );
};

export default BuyerFavorites;


