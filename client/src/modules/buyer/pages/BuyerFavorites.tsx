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
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';

// Reuse simple brand/body mapping from Browse for consistent images
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1600&auto=format&fit=crop';
const IMAGE_MAP: Record<string, string[]> = {
  tesla: [
    'https://images.unsplash.com/photo-1549921296-3ecf9a1f1bda?q=80&w=1600&auto=format&fit=crop',
  ],
  toyota: [
    'https://images.unsplash.com/photo-1541443131876-b76fe6b3c59b?q=80&w=1600&auto=format&fit=crop',
  ],
  bmw: [
    'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1600&auto=format&fit=crop',
  ],
  honda: [
    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=1600&auto=format&fit=crop',
  ],
};

const chooseImageFor = (title: string, idx: number): string => {
  const t = title.toLowerCase();
  const pick = (arr: string[]) => arr[(idx + arr.length) % arr.length] || FALLBACK_IMAGE;
  if (t.includes('tesla')) return pick(IMAGE_MAP.tesla);
  if (t.includes('toyota')) return pick(IMAGE_MAP.toyota);
  if (t.includes('bmw')) return pick(IMAGE_MAP.bmw);
  if (t.includes('honda')) return pick(IMAGE_MAP.honda);
  return FALLBACK_IMAGE;
};

// Mock favorites
const MOCK_FAVORITES = [
  { id: '1', title: 'Tesla Model 3', price: 38990, year: 2022, mileage: 8200, location: 'Austin, TX' },
  { id: '2', title: 'Toyota Camry XSE', price: 27950, year: 2021, mileage: 15200, location: 'Miami, FL' },
  { id: '3', title: 'BMW 330i', price: 35900, year: 2020, mileage: 24000, location: 'Seattle, WA' },
  { id: '4', title: 'Honda Civic Sport', price: 22900, year: 2023, mileage: 4500, location: 'New York, NY' },
].map((v, i) => ({ ...v, thumbnail: chooseImageFor(v.title, i) }));

const BuyerFavorites: React.FC = () => {
  const [items, setItems] = React.useState(MOCK_FAVORITES);

  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight={700}>My Favorites</Typography>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setItems([])}>
            Clear All
          </Button>
        </Box>

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
                <Button variant="contained" href="/browse">Start Browsing</Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid key={item.id} item xs={12} sm={6} md={4}>
                <Card>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={item.thumbnail}
                      alt={item.title}
                      sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                      onError={(e: any) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    />
                    <IconButton sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }} onClick={() => remove(item.id)}>
                      <FavoriteIcon color="error" />
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
                      <Chip label={item.location} size="small" />
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" fullWidth>View Details</Button>
                      <Button variant="outlined" color="error" fullWidth onClick={() => remove(item.id)} startIcon={<FavoriteBorderIcon />}>
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


