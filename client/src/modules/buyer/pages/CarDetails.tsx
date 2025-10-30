import React, { useEffect, useMemo, useState, useCallback, memo } from 'react';
import { Box, Card, CardContent, Chip, Divider, Typography, Button, TextField, Tabs, Tab, IconButton, Avatar } from '@mui/material';
import { Close as CloseIcon, Share as ShareIcon, FavoriteBorder as FavoriteIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import BuyerLayout from '../components/layout/BuyerLayout';
import RoleAwareLayout from '../../../shared/components/layout/RoleAwareLayout';
import { sellerApi } from '../../seller/services/sellerApi';
import { buyerApi, vehicleApi } from '../services/buyerApi';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import toast from 'react-hot-toast';

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
  seller_id?: string;
  seller_name?: string;
  seller_email?: string;
};

// Isolated, memoized contact form to prevent focus loss on parent re-renders
const ContactForm: React.FC<{ price?: number; carId: string; sellerId?: string; sellerName?: string; sellerEmail?: string; image?: string }> = memo(({ price, carId, sellerId, sellerName, sellerEmail, image }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Fire-and-forget order request to seller's orders list (as 'pending')
    (async () => {
      try {
        if (!sellerId) throw new Error('Missing seller');
        await buyerApi.orders.create({
          seller_id: sellerId,
          item_type: 'car',
          total_amount: price || 0,
          currency: 'USD',
          payment_method: 'cash',
          delivery_method: 'pickup',
          buyer_notes: message || `Inquiry about car ${carId}`,
          items: [
            {
              item_id: carId,
              item_type: 'car',
              quantity: 1,
              unit_price: price || 0,
              total_price: price || 0,
              item_name: sellerName ? `Car from ${sellerName}` : 'Car',
              item_image: image || undefined,
            },
          ],
        });
        toast.success('Request sent. The seller will contact you soon.');
        // Clear form
        setName('');
        setEmail('');
        setMessage('');
      } catch (err: any) {
        // Surface useful error info for debugging while keeping a friendly message for users
        const apiMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
        console.error('Order create failed:', err?.response || err);
        toast.error(apiMsg ? `Failed to send request: ${apiMsg}` : 'Failed to send request.');
      }
    })();
  }, [name, email, message, price, carId, sellerId, sellerName, image]);

  return (
    <>
      {sellerId && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Avatar sx={{ width: 36, height: 36 }}>{(sellerName || 'S').charAt(0)}</Avatar>
          <Box sx={{ lineHeight: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>{sellerName || 'Seller'}</Typography>
            {sellerEmail && (
              <Typography variant="caption" color="text.secondary">{sellerEmail}</Typography>
            )}
          </Box>
        </Box>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
        <TextField size="small" label="Your name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        <TextField size="small" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <TextField size="small" label="Message" multiline minRows={3} value={message} onChange={(e) => setMessage(e.target.value)} required />
        <Button type="submit" variant="contained" fullWidth>Contact Seller</Button>
      </Box>
    </>
  );
});

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Use a role-aware wrapper to select layout (buyer, seller, dealer, admin)
  const Layout = (props: { children: React.ReactNode }) => <RoleAwareLayout>{props.children}</RoleAwareLayout>;
  const [car, setCar] = useState<CarLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tab, setTab] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [similar, setSimilar] = useState<CarLite[]>([]);

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
          seller_id: apiCar.seller_id || apiCar.sellerId || apiCar.seller?.id,
          seller_name: [apiCar.seller_name, apiCar.seller_last_name].filter(Boolean).join(' ') || apiCar.dealer_name,
          seller_email: apiCar.seller_email,
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

  // Load similar listings by brand once the car is loaded
  useEffect(() => {
    const loadSimilar = async () => {
      if (!car?.brand) {
        setSimilar([]);
        return;
      }
      try {
        const res: any = await vehicleApi.getVehicles({ brand: car.brand, limit: 6 });
        const list: any[] = Array.isArray(res?.vehicles) ? res.vehicles : (Array.isArray(res) ? res : res?.data || []);
        const mapped: CarLite[] = list
          .filter((c) => String(c.id) !== String(car.id))
          .map((c) => ({
            id: String(c.id),
            title: c.title || `${c.year || ''} ${c.brand || c.make || ''} ${c.model || ''}`.trim(),
            brand: c.brand || c.make || '',
            model: c.model || '',
            year: c.year || 0,
            price: c.price,
            images: Array.isArray(c.images) ? c.images : (typeof c.images === 'string' ? [c.images] : []),
          }));
        setSimilar(mapped);
      } catch (e) {
        setSimilar([]);
      }
    };
    loadSimilar();
  }, [car?.brand, car?.id]);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>Loading…</Box>
      </Layout>
    );
  }

  if (!car) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Car not found</Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/browse')}>Back to Browse</Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <Button size="small" onClick={() => navigate('/browse')}>Browse</Button> / {car.brand} / {car.model}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Seller-specific action */}
            {/* RoleAwareLayout ensures layout; use a simple check for seller-only action */}
            {((localStorage.getItem('user_data') && JSON.parse(localStorage.getItem('user_data') || '{}')?.role?.toLowerCase?.()) === 'seller') && (
              <Button size="small" variant="outlined" onClick={() => navigate(`/seller/cars/${car.id}/edit`)}>
                Edit Listing
              </Button>
            )}
            <IconButton><ShareIcon /></IconButton>
            <IconButton><FavoriteIcon /></IconButton>
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 0.9fr' }, gap: { xs: 1.5, md: 2 } }}>
          <Box>
            <Card>
              <Box onClick={() => setLightboxOpen(true)} component="img" src={getImageUrl((car.images && car.images[activeIndex]) || car.images?.[0])} alt={car.title} sx={{ width: '100%', height: { xs: 220, sm: 300, md: 420 }, objectFit: 'cover', cursor: 'zoom-in' }} />
              <CardContent>
                <Typography variant="h5" fontWeight={700}>{car.title}</Typography>
                <Typography variant="body2" color="text.secondary">{car.year} · {car.brand} · {car.model}</Typography>
                {/* Thumbnails */}
                {car.images && car.images.length > 1 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
                    {car.images.map((src, idx) => (
                      <Box key={idx} onClick={() => setActiveIndex(idx)} sx={{ width: 72, height: 48, borderRadius: 1, overflow: 'hidden', cursor: 'pointer', outline: idx === activeIndex ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.12)' }}>
                        <img src={getImageUrl(src)} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' }, rowGap: 1, columnGap: { xs: 1.5, md: 2 }, fontSize: 14 }}>
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
            <Card sx={{ position: { xs: 'static', md: 'sticky' }, top: { md: 16 } }}>
              <CardContent>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>{car.price ? `$${car.price.toLocaleString()}` : 'Contact for price'}</Typography>
                {/* Contact Form - hidden for sellers */}
                {(((localStorage.getItem('user_data') && JSON.parse(localStorage.getItem('user_data') || '{}')?.role?.toLowerCase?.()) !== 'seller')) && (
                  <ContactForm price={car.price} carId={car.id} sellerId={car.seller_id} sellerName={car.seller_name} sellerEmail={car.seller_email} image={car.images?.[0]} />
                )}
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
          {similar.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No similar cars found.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {similar.map((s) => (
                <Card key={s.id} onClick={() => navigate(`/cars/${s.id}`)} sx={{ cursor: 'pointer' }}>
                  <Box component="img" src={getImageUrl(s.images?.[0])} alt={s.title} sx={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700}>{s.title}</Typography>
                    {s.price != null && (
                      <Typography variant="body2" color="text.secondary">${Number(s.price).toLocaleString()}</Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default CarDetails;


