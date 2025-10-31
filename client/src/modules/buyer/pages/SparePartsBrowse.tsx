import React from 'react';
import { Box, GridLegacy as Grid, Card, CardContent, Typography, TextField, InputAdornment, IconButton, Chip, Avatar, Button, LinearProgress } from '@mui/material';
import { Search as SearchIcon, Tune as TuneIcon, Build as PartIcon } from '@mui/icons-material';
import BuyerLayout from '../components/layout/BuyerLayout';

interface SparePartItem {
  id: string;
  name: string;
  title?: string;
  price?: number;
  currency?: string;
  images?: string[] | string;
  seller_name?: string;
  brand?: string;
}

const SparePartsBrowse: React.FC = () => {
  const [items, setItems] = React.useState<SparePartItem[]>([]);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const imgFrom = (p: SparePartItem) => {
    try {
      if (!p.images) return '';
      if (Array.isArray(p.images)) {
        const firstImg = p.images[0] || '';
        // Convert relative URLs to absolute if needed
        if (firstImg && firstImg.startsWith('/uploads/')) {
          const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001';
          return `${base}${firstImg}`;
        }
        return firstImg;
      }
      if (typeof p.images === 'string') {
        const parsed = JSON.parse(p.images);
        if (Array.isArray(parsed)) {
          const firstImg = parsed[0] || '';
          if (firstImg && firstImg.startsWith('/uploads/')) {
            const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001';
            return `${base}${firstImg}`;
          }
          return firstImg;
        }
      }
      return '';
    } catch {
      return '';
    }
  };

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api';
      const searchParam = query ? `&q=${encodeURIComponent(query)}` : '';
      const res = await fetch(`${base}/spare-parts/public?limit=24${searchParam}`);
      const data = await res.json();
      
      // The public endpoint returns { success: true, data: [...], pagination: {...} }
      const list = (data?.data || data?.spare_parts || data?.parts || []) as any[];
      
      setItems(list.map((x) => ({
        id: x.id || x.part_id || x._id || Math.random().toString(36).slice(2),
        name: x.name || x.title || 'Spare Part',
        title: x.title || x.name,
        price: Number(x.price ?? x.unit_price ?? 0),
        currency: x.currency || 'USD',
        images: x.images,
        seller_name: x.seller_name || x.seller || x.seller_name || '',
        brand: x.brand || x.brand_name || ''
      })));
    } catch (error) {
      console.error('Failed to load spare parts:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <BuyerLayout>
      <Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h5" fontWeight={800} sx={{ mr: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PartIcon sx={{ fontSize: 24 }} /> Spare Parts
          </Typography>
          <TextField
            placeholder="Search spare parts..."
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ endAdornment: (<InputAdornment position="end"><SearchIcon fontSize="small" /></InputAdornment>) }}
          />
          <IconButton><TuneIcon /></IconButton>
        </Box>

        {loading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
        )}
        {!loading && (
          <Grid container spacing={2}>
            {items.map((p) => (
              <Grid key={p.id} item xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    component="img"
                    src={imgFrom(p) || 'https://images.unsplash.com/photo-1519121782843-87c5bf29e526?q=80&w=1600&auto=format&fit=crop'}
                    alt={p.name}
                    sx={{ width: '100%', height: 160, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>{p.title || p.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
                      <Avatar sx={{ width: 24, height: 24 }}>{(p.brand || p.seller_name || 'S')[0]}</Avatar>
                      <Typography variant="caption" color="text.secondary">{p.seller_name || p.brand || 'Seller'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                      <Chip label={`${p.currency || 'USD'} ${Number(p.price || 0).toLocaleString()}`} color="primary" variant="outlined" size="small" />
                      <Button size="small" variant="text">View</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {items.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">No spare parts found.</Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </BuyerLayout>
  );
};

export default SparePartsBrowse;


