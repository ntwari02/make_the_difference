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
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import BuyerLayout from '../components/layout/BuyerLayout';
import { useNavigate } from 'react-router-dom';
import { vehicleApi } from '../services/buyerApi';
import { getImageUrl } from '../../../shared/utils/imageUtils';

// Image sources by brand/body with a solid fallback
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1600&auto=format&fit=crop';
const IMAGE_MAP: Record<string, string[]> = {
  tesla: [
    'https://images.unsplash.com/photo-1549921296-3ecf9a1f1bda?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1600&auto=format&fit=crop',
  ],
  toyota: [
    'https://images.unsplash.com/photo-1541443131876-b76fe6b3c59b?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584345604476-8ec0f33c2b9e?q=80&w=1600&auto=format&fit=crop',
  ],
  bmw: [
    'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1600&auto=format&fit=crop',
  ],
  honda: [
    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571607388063-6730f31c439b?q=80&w=1600&auto=format&fit=crop',
  ],
  sedan: [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop',
  ],
  suv: [
    'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92f?q=80&w=1600&auto=format&fit=crop',
  ],
  hatchback: [
    'https://images.unsplash.com/photo-1517940310602-75f38f447b04?q=80&w=1600&auto=format&fit=crop',
  ],
  pickup: [
    'https://images.unsplash.com/photo-1607374858067-87e1a71012f8?q=80&w=1600&auto=format&fit=crop',
  ],
};

const chooseImageFor = (title: string, body: string, seed: number): string => {
  const t = title.toLowerCase();
  const b = (body || '').toLowerCase();
  const pick = (arr: string[]) => arr[(seed + arr.length) % arr.length] || FALLBACK_IMAGE;
  if (t.includes('tesla')) return pick(IMAGE_MAP.tesla);
  if (t.includes('toyota')) return pick(IMAGE_MAP.toyota);
  if (t.includes('bmw')) return pick(IMAGE_MAP.bmw);
  if (t.includes('honda')) return pick(IMAGE_MAP.honda);
  if (b.includes('sedan')) return pick(IMAGE_MAP.sedan);
  if (b.includes('suv')) return pick(IMAGE_MAP.suv);
  if (b.includes('hatch')) return pick(IMAGE_MAP.hatchback);
  if (b.includes('pickup')) return pick(IMAGE_MAP.pickup);
  return FALLBACK_IMAGE;
};

// Robustly extract a primary image from various backend shapes
const extractPrimaryImage = (car: any, seed: number, titleHint: string, bodyHint: string): string => {
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
      return [val];
    }
    return [];
  };

  const candidatesRaw: any[] = (
    tryParseArray(car.images) || []
  ).concat(
    tryParseArray(car.photos) || []
  ).concat(
    tryParseArray(car.images_json) || []
  );

  // Also consider common single fields
  const singleFields = [car.image, car.photo, car.thumbnail, car.main_image, car.mainImage, car.cover, car.cover_image, car.imageUrl, car.photoUrl];
  for (const f of singleFields) {
    if (typeof f === 'string' && f.trim()) candidatesRaw.unshift(f.trim());
  }

  // Heuristic: scan all keys that look like they contain image paths
  try {
    Object.keys(car || {}).forEach((k) => {
      const lk = k.toLowerCase();
      if (lk.includes('image') || lk.includes('photo') || lk.includes('thumbnail') || lk.includes('thumb')) {
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

  // Normalize to string URLs
  const normalized: string[] = candidatesRaw
    .map((item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'object') {
        // common object shapes { url } or { path }
        if (item.url) return String(item.url);
        if (item.path) return String(item.path);
        if (item.src) return String(item.src);
      }
      return '';
    })
    .filter((s) => typeof s === 'string' && s.trim().length > 0) as string[];

  if (normalized.length > 0) {
    const first = normalized[0];
    return getImageUrl(first);
  }

  // Fallback to a deterministic stock image by brand/body
  return chooseImageFor(titleHint, bodyHint, seed);
};

type Listing = {
  id: string;
  title: string;
  year?: number;
  price?: number;
  mileage?: number;
  location?: string;
  fuel?: string;
  transmission?: string;
  body?: string;
  thumbnail?: string;
};

const BrowsePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([]);
  const [compareIds, setCompareIds] = React.useState<string[]>([]);
  const [compareOpen, setCompareOpen] = React.useState(false);

  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters state
  const [query, setQuery] = React.useState('');
  const [priceRange, setPriceRange] = React.useState<number[]>([0, 1000000]);
  const [isFullPriceRange, setIsFullPriceRange] = React.useState<boolean>(true);
  const [brand, setBrand] = React.useState('');
  const [fuel, setFuel] = React.useState('');
  const [transmission, setTransmission] = React.useState('');
  const [sortBy, setSortBy] = React.useState('relevance');

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  React.useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await vehicleApi.getVehicles({ page: 1, limit: 200 });
        const vehicles = Array.isArray((res as any)?.vehicles) ? (res as any).vehicles : (Array.isArray(res as any) ? (res as any) : (res as any)?.data || []);
        const mapped: Listing[] = vehicles.map((v: any, idx: number) => {
          const title = v.title || [v.brand, v.model].filter(Boolean).join(' ') || 'Vehicle';
          const image = extractPrimaryImage(v, idx, title, v.body_type || v.body || '');
          return {
            id: String(v.id ?? v._id ?? `${idx}`),
            title,
            year: v.year ? Number(v.year) : undefined,
            price: v.price ? Number(v.price) : undefined,
            mileage: v.mileage ? Number(v.mileage) : undefined,
            location: v.location || v.city || v.region,
            fuel: v.fuel_type || v.fuel,
            transmission: v.transmission,
            body: v.body_type || v.body,
            thumbnail: image,
          };
        });
        if ((import.meta as any).env?.DEV) {
          try {
            console.debug('Browse mapped vehicles (id → thumb):', mapped.slice(0, 6).map(m => ({ id: m.id, thumb: m.thumbnail })));
          } catch {}
        }
        setListings(mapped);
        // Expand price range to cover all loaded vehicles
        // Default UI should show the slider fully expanded
        setPriceRange([0, 1000000]);
        setIsFullPriceRange(true);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load cars');
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = listings.filter((item) => {
    const matchesQuery = query
      ? item.title.toLowerCase().includes(query.toLowerCase()) || `${item.year}`.includes(query)
      : true;
    const price = item.price;
    const matchesPrice = isFullPriceRange || price === undefined || (price >= priceRange[0] && price <= priceRange[1]);
    const matchesBrand = brand ? item.title.toLowerCase().includes(brand.toLowerCase()) : true;
    const matchesFuel = fuel ? item.fuel === fuel : true;
    const matchesTransmission = transmission ? item.transmission === transmission : true;
    return matchesQuery && matchesPrice && matchesBrand && matchesFuel && matchesTransmission;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return (a.price ?? 0) - (b.price ?? 0);
      case 'price_high':
        return (b.price ?? 0) - (a.price ?? 0);
      case 'mileage_low':
        return (a.mileage ?? 0) - (b.mileage ?? 0);
      case 'year_new':
        return (b.year ?? 0) - (a.year ?? 0);
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
                <MenuItem value="mileage_low">Mileage: Low to High</MenuItem>
                <MenuItem value="year_new">Year: Newest</MenuItem>
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
              placeholder="Search by model, year, keyword..."
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
                <MenuItem value="Tesla">Tesla</MenuItem>
                <MenuItem value="Toyota">Toyota</MenuItem>
                <MenuItem value="BMW">BMW</MenuItem>
                <MenuItem value="Honda">Honda</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="fuel-label">Fuel</InputLabel>
              <Select labelId="fuel-label" label="Fuel" value={fuel} onChange={(e) => setFuel(e.target.value)}>
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="Electric">Electric</MenuItem>
                <MenuItem value="Gasoline">Gasoline</MenuItem>
                <MenuItem value="Hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="transmission-label">Transmission</InputLabel>
              <Select
                labelId="transmission-label"
                label="Transmission"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="Automatic">Automatic</MenuItem>
                <MenuItem value="Manual">Manual</MenuItem>
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
              max={1000000}
              step={1000}
              onChange={(_, val) => { setPriceRange(val as number[]); setIsFullPriceRange(false); }}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Button fullWidth variant="outlined" onClick={() => {
              setQuery('');
              setBrand('');
              setFuel('');
              setTransmission('');
              setPriceRange([0, 1000000]);
              setIsFullPriceRange(true);
            }}>
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // limit to 3 items
      return [...prev, id];
    });
  };

  const ListingCard: React.FC<{ item: Listing; view: 'grid' | 'list' }> = ({ item, view }) => (
    <Card sx={{ height: '100%' }}>
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={item.thumbnail || FALLBACK_IMAGE}
          alt={item.title}
          sx={{ width: '100%', height: view === 'grid' ? 180 : 220, objectFit: 'cover' }}
          onError={(e: any) => { e.currentTarget.src = FALLBACK_IMAGE; }}
        />
        <IconButton
          onClick={() => toggleFavorite(item.id)}
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
        >
          {favoriteIds.includes(item.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
      </Box>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CarIcon fontSize="small" /> {item.title}
          </Typography>
          <Typography variant="h6" fontWeight={800} color="primary">
            {item.price ? `$${Number(item.price).toLocaleString()}` : '—'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {item.year && <Chip label={`${item.year}`} size="small" />}
          {typeof item.mileage === 'number' && <Chip label={`${Number(item.mileage).toLocaleString()} mi`} size="small" />}
          <Chip label={item.fuel} size="small" />
          <Chip label={item.transmission} size="small" />
          <Chip label={item.body} size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {item.location}
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" fullWidth onClick={() => navigate(`/cars/${item.id}`)}>View Details</Button>
          <Button
            variant={compareIds.includes(item.id) ? 'contained' : 'outlined'}
            color={compareIds.includes(item.id) ? 'secondary' : 'primary'}
            fullWidth
            onClick={() => toggleCompare(item.id)}
          >
            {compareIds.includes(item.id) ? 'Added' : 'Compare'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <BuyerLayout>
      <Box>
        {/* Title */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4" fontWeight={700}>Browse Cars</Typography>
        </Box>

        {TopFilters}
        <Grid container spacing={2}>
          {/* Results */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {loading && (
                <Box sx={{ p: 2, color: 'text.secondary' }}>Loading cars...</Box>
              )}
              {error && !loading && (
                <Box sx={{ p: 2, color: 'error.main' }}>{error}</Box>
              )}
              {!loading && !error && filtered.map((item) => (
                <Grid key={item.id} item xs={12} sm={view === 'grid' ? 6 : 12} md={view === 'grid' ? 4 : 12}>
                  <ListingCard item={item} view={view} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Compare Bar */}
        {compareIds.length > 0 && (
          <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 16, display: 'flex', justifyContent: 'center', zIndex: 1200 }}>
            <Box sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : '#fff', border: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[6], borderRadius: 999, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" fontWeight={700}>{compareIds.length} selected</Typography>
              <Button size="small" variant="outlined" onClick={() => setCompareIds([])}>Clear</Button>
              <Button size="small" variant="contained" onClick={() => setCompareOpen(true)} disabled={compareIds.length < 2}>Compare Now</Button>
            </Box>
          </Box>
        )}

        {/* Compare Dialog */}
        {compareOpen && (
          <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setCompareOpen(false)}>
            <Card sx={{ width: 'min(1000px, 96vw)', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Compare Vehicles</Typography>
                  <Button onClick={() => setCompareOpen(false)}>Close</Button>
                </Box>
                <Grid container spacing={2}>
                  {compareIds.map((id) => {
                    const v = listings.find((x) => x.id === id)!;
                    return (
                      <Grid key={id} item xs={12} md={4}>
                        <Card variant="outlined">
                          <Box component="img" src={(v as any).thumbnail || FALLBACK_IMAGE} alt={v.title} sx={{ width: '100%', height: 140, objectFit: 'cover' }} />
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight={700}>{v.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{v.price ? `$${Number(v.price).toLocaleString()}` : '—'}</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: 14 }}>
                              <span>Year</span><span>{v.year ?? '—'}</span>
                              <span>Mileage</span><span>{typeof v.mileage === 'number' ? `${Number(v.mileage).toLocaleString()} mi` : '—'}</span>
                              <span>Fuel</span><span>{v.fuel}</span>
                              <span>Transmission</span><span>{v.transmission}</span>
                              <span>Body</span><span>{v.body}</span>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button size="small" variant="outlined" onClick={() => setCompareIds((prev) => prev.filter((x) => x !== id))}>Remove</Button>
                              <Button size="small" variant="contained" onClick={() => navigate(`/cars/${id}`)}>View</Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </BuyerLayout>
  );
};

export default BrowsePage;


