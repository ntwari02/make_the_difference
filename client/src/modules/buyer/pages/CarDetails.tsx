import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Chip, Divider, Typography, Button, TextField, Tabs, Tab, IconButton } from '@mui/material';
import { Close as CloseIcon, Share as ShareIcon, FavoriteBorder as FavoriteIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import BuyerLayout from '../components/layout/BuyerLayout';
import { sellerApi } from '../../seller/services/sellerApi';

type CarLite = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage?: number;
  price?: number;
  images?: string[];
  fuel?: string;
  transmission?: string;
  body?: string;
  location?: string;
  features?: string[];
  description?: string;
};

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<CarLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tab, setTab] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [contact, setContact] = useState({ name: '', email: '', message: '' });

  const mockById = useMemo<Record<string, CarLite>>(
    () => ({
      m1: { id: 'm1', title: '2019 Toyota Corolla LE', brand: 'Toyota', model: 'Corolla', year: 2019, mileage: 38500, price: 15900, fuel: 'Petrol', transmission: 'Automatic', body: 'Sedan', location: 'Chicago, IL', images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop'], features: ['Bluetooth','Backup camera'], description: 'Reliable daily driver with great fuel economy.' },
      m2: { id: 'm2', title: '2020 Honda Civic Sport', brand: 'Honda', model: 'Civic', year: 2020, mileage: 24000, price: 18750, fuel: 'Petrol', transmission: 'Automatic', body: 'Sedan', location: 'Austin, TX', images: ['https://images.unsplash.com/photo-1549921296-3fdc4a3fa5d8?q=80&w=1200&auto=format&fit=crop'], features: ['CarPlay','Heated seats'], description: 'Sport trim with modern tech features.' },
      m3: { id: 'm3', title: '2018 Ford Focus SE', brand: 'Ford', model: 'Focus', year: 2018, mileage: 52500, price: 12990, fuel: 'Petrol', transmission: 'Automatic', body: 'Hatchback', location: 'Miami, FL', images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop'] },
    }),
    []
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const apiCar: any = await sellerApi.cars.getCar(id);
        const mapped: CarLite = {
          id,
          title: apiCar.title || `${apiCar.year || ''} ${apiCar.brand || apiCar.make || ''} ${apiCar.model || ''}`.trim(),
          brand: apiCar.brand || apiCar.make || '',
          model: apiCar.model || '',
          year: apiCar.year || 0,
          mileage: apiCar.mileage,
          price: apiCar.price,
          images: apiCar.images || [],
          fuel: apiCar.fuel_type,
          transmission: apiCar.transmission,
          body: apiCar.body_type,
          location: apiCar.location,
          features: apiCar.features || [],
          description: apiCar.description,
        };
        setCar(mapped);
      } catch (e) {
        // Use mock when API not available
        if (id && mockById[id]) setCar(mockById[id]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, mockById]);

  if (loading) {
    return (
      <BuyerLayout>
        <Box sx={{ p: 3 }}>Loading…</Box>
      </BuyerLayout>
    );
  }

  if (!car) {
    return (
      <BuyerLayout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Car not found</Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/browse')}>Back to Browse</Button>
        </Box>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <Button size="small" onClick={() => navigate('/browse')}>Browse</Button> / {car.brand} / {car.model}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton><ShareIcon /></IconButton>
            <IconButton><FavoriteIcon /></IconButton>
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 0.9fr' }, gap: 2 }}>
          <Box>
            <Card>
              <Box onClick={() => setLightboxOpen(true)} component="img" src={(car.images && car.images[activeIndex]) || car.images?.[0] || 'https://images.unsplash.com/photo-1517059224940-d4af9eec41e5?q=80&w=1200&auto=format&fit=crop'} alt={car.title} sx={{ width: '100%,', height: 420, objectFit: 'cover', cursor: 'zoom-in' }} />
              <CardContent>
                <Typography variant="h5" fontWeight={700}>{car.title}</Typography>
                <Typography variant="body2" color="text.secondary">{car.year} · {car.brand} · {car.model}</Typography>
                {/* Thumbnails */}
                {car.images && car.images.length > 1 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
                    {car.images.map((src, idx) => (
                      <Box key={idx} onClick={() => setActiveIndex(idx)} sx={{ width: 72, height: 48, borderRadius: 1, overflow: 'hidden', cursor: 'pointer', outline: idx === activeIndex ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.12)' }}>
                        <img src={src} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ))}
                  </Box>
                )}
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 2 }}>
                  <Tab label="Overview" />
                  <Tab label="Specs" />
                  <Tab label="Features" />
                </Tabs>
                <Box sx={{ mt: 2 }}>
                  {tab === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{car.description || 'No description provided.'}</Typography>
                  )}
                  {tab === 1 && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 1, columnGap: 2, fontSize: 14 }}>
                      <span>Year</span><span>{car.year || '—'}</span>
                      <span>Mileage</span><span>{car.mileage ? `${car.mileage.toLocaleString()} km` : '—'}</span>
                      <span>Fuel</span><span>{car.fuel || '—'}</span>
                      <span>Transmission</span><span>{car.transmission || '—'}</span>
                      <span>Body</span><span>{car.body || '—'}</span>
                      <span>Location</span><span>{car.location || '—'}</span>
                    </Box>
                  )}
                  {tab === 2 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {(car.features && car.features.length > 0) ? car.features.map((f) => <Chip key={f} label={f} />) : <Typography variant="body2" color="text.secondary">No features listed</Typography>}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ position: 'sticky', top: 16 }}>
              <CardContent>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>{car.price ? `$${car.price.toLocaleString()}` : 'Contact for price'}</Typography>
                {/* Contact Form */}
                <Box component="form" onSubmit={(e) => { e.preventDefault(); alert(`Message sent!\nName: ${contact.name}\nEmail: ${contact.email}\n${contact.message}`); }} sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                  <TextField size="small" label="Your name" value={contact.name} onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))} required />
                  <TextField size="small" label="Email" type="email" value={contact.email} onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))} required />
                  <TextField size="small" label="Message" multiline minRows={3} value={contact.message} onChange={(e) => setContact((p) => ({ ...p, message: e.target.value }))} required />
                  <Button type="submit" variant="contained" fullWidth>Contact Seller</Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Monthly payment estimate</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <TextField size="small" type="number" label="Down ($)" defaultValue={3000} />
                  <TextField size="small" type="number" label="APR (%)" defaultValue={5.5} />
                  <TextField size="small" type="number" label="Term (mo)" defaultValue={60} />
                  <Box sx={{ display: 'grid', placeItems: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2">
                      ≈ ${(Math.max(0, (car.price || 0) - 3000) * (0.055/12) / (1 - Math.pow(1 + (0.055/12), -60)) || 0).toFixed(0)}/mo
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
        {lightboxOpen && (
          <Box onClick={() => setLightboxOpen(false)} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.85)', display: 'grid', placeItems: 'center', zIndex: 1300 }}>
            <IconButton onClick={() => setLightboxOpen(false)} sx={{ position: 'fixed', top: 12, right: 12, color: 'common.white' }}>
              <CloseIcon />
            </IconButton>
            <Box component="img" src={(car.images && car.images[activeIndex]) || car.images?.[0]} alt="zoom" sx={{ maxWidth: '92vw', maxHeight: '82vh', objectFit: 'contain' }} />
          </Box>
        )}
        {/* Similar Listings */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Similar listings</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {[ 'm2', 'm3' ].map((sid) => mockById[sid]).filter(Boolean).map((s) => (
              <Card key={s!.id} onClick={() => navigate(`/cars/${s!.id}`)} sx={{ cursor: 'pointer' }}>
                <Box component="img" src={s!.images?.[0] || ''} alt={s!.title} sx={{ width: '100%', height: 140, objectFit: 'cover' }} />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700}>{s!.title}</Typography>
                  <Typography variant="body2" color="text.secondary">${s!.price?.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </BuyerLayout>
  );
};

export default CarDetails;


