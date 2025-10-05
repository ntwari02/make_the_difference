import React from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  Avatar,
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

// Mock dataset for listings
const MOCK_LISTINGS = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: ['Tesla Model 3', 'Toyota Camry', 'BMW 3 Series', 'Honda Civic'][i % 4],
  year: 2020 + (i % 4),
  price: 15000 + i * 2500,
  mileage: 5000 + i * 1200,
  location: ['New York, NY', 'Austin, TX', 'Miami, FL', 'Seattle, WA'][i % 4],
  fuel: ['Electric', 'Gasoline', 'Hybrid'][i % 3],
  transmission: ['Automatic', 'Manual'][i % 2],
  body: ['Sedan', 'SUV', 'Hatchback'][i % 3],
  // thumbnail assigned after object creation using chooseImageFor
}));

// Assign thumbnails deterministically based on title/body
MOCK_LISTINGS.forEach((item, idx) => {
  (item as any).thumbnail = chooseImageFor(item.title, item.body, idx);
});

const BrowsePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [favoriteIds, setFavoriteIds] = React.useState<number[]>([]);
  const [compareIds, setCompareIds] = React.useState<number[]>([]);
  const [compareOpen, setCompareOpen] = React.useState(false);

  // Filters state
  const [query, setQuery] = React.useState('');
  const [priceRange, setPriceRange] = React.useState<number[]>([10000, 60000]);
  const [brand, setBrand] = React.useState('');
  const [fuel, setFuel] = React.useState('');
  const [transmission, setTransmission] = React.useState('');
  const [sortBy, setSortBy] = React.useState('relevance');

  const toggleFavorite = (id: number) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filtered = MOCK_LISTINGS.filter((item) => {
    const matchesQuery = query
      ? item.title.toLowerCase().includes(query.toLowerCase()) || `${item.year}`.includes(query)
      : true;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesBrand = brand ? item.title.toLowerCase().includes(brand.toLowerCase()) : true;
    const matchesFuel = fuel ? item.fuel === fuel : true;
    const matchesTransmission = transmission ? item.transmission === transmission : true;
    return matchesQuery && matchesPrice && matchesBrand && matchesFuel && matchesTransmission;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'mileage_low':
        return a.mileage - b.mileage;
      case 'year_new':
        return b.year - a.year;
      default:
        return 0;
    }
  });

  const FilterPanel = (
    <Card sx={{ position: 'sticky', top: 88 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <TuneIcon />
          <Typography variant="h6" fontWeight={700}>Filters</Typography>
        </Stack>

        <TextField
          fullWidth
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by model, year, keyword..."
          sx={{ mb: 2 }}
        />

        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Price Range
        </Typography>
        <Slider
          value={priceRange}
          min={1000}
          max={100000}
          step={1000}
          onChange={(_, val) => setPriceRange(val as number[])}
          valueLabelDisplay="auto"
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
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

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="fuel-label">Fuel</InputLabel>
          <Select labelId="fuel-label" label="Fuel" value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="Electric">Electric</MenuItem>
            <MenuItem value="Gasoline">Gasoline</MenuItem>
            <MenuItem value="Hybrid">Hybrid</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
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

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Coupe'].map((type) => (
            <Chip key={type} label={type} variant="outlined" clickable />
          ))}
        </Box>

        <Button fullWidth variant="outlined" onClick={() => {
          setQuery('');
          setPriceRange([10000, 60000]);
          setBrand('');
          setFuel('');
          setTransmission('');
        }}>
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );

  const toggleCompare = (id: number) => {
    setCompareIds((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // limit to 3 items
      return [...prev, id];
    });
  };

  const ListingCard: React.FC<{ item: (typeof MOCK_LISTINGS)[number]; view: 'grid' | 'list' }> = ({ item, view }) => (
    <Card sx={{ height: '100%' }}>
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={item.thumbnail}
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
            ${item.price.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`${item.year}`} size="small" />
          <Chip label={`${item.mileage.toLocaleString()} mi`} size="small" />
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
        {/* Title and Controls */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4" fontWeight={700}>Browse Cars</Typography>
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

        <Grid container spacing={2}>
          {/* Filters Sidebar */}
          <Grid item xs={12} md={3} lg={3}>
            {FilterPanel}
          </Grid>

          {/* Results */}
          <Grid item xs={12} md={9} lg={9}>
            <Grid container spacing={2}>
              {filtered.map((item) => (
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
                    const v = MOCK_LISTINGS.find((x) => x.id === id)!;
                    return (
                      <Grid key={id} item xs={12} md={4}>
                        <Card variant="outlined">
                          <Box component="img" src={(v as any).thumbnail} alt={v.title} sx={{ width: '100%', height: 140, objectFit: 'cover' }} />
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight={700}>{v.title}</Typography>
                            <Typography variant="body2" color="text.secondary">${v.price.toLocaleString()}</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: 14 }}>
                              <span>Year</span><span>{v.year}</span>
                              <span>Mileage</span><span>{v.mileage.toLocaleString()} mi</span>
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


