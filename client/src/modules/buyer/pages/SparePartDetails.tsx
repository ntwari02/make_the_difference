import React, { useEffect, useState, useCallback, memo } from 'react';
import { Box, Card, CardContent, Chip, Typography, Button, TextField, Tabs, Tab, IconButton, Avatar } from '@mui/material';
import { Close as CloseIcon, Share as ShareIcon, FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import RoleAwareLayout from '../../../shared/components/layout/RoleAwareLayout';
import { buyerApi } from '../services/buyerApi';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

type SparePartLite = {
  id: string;
  name: string;
  title?: string;
  brand?: string;
  category?: string;
  sku?: string;
  price?: number;
  currency?: string;
  images?: string[];
  description?: string;
  seller_id?: string;
  seller_name?: string;
  seller_email?: string;
  quantity_available?: number;
};

// Isolated, memoized contact form to prevent focus loss on parent re-renders
const ContactForm: React.FC<{ price?: number; partId: string; sellerId?: string; sellerName?: string; sellerEmail?: string; image?: string }> = memo(({ price, partId, sellerId, sellerName, sellerEmail, image }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [quantityDisplay, setQuantityDisplay] = useState<string>('1');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Fire-and-forget order request to seller's orders list (as 'pending')
    (async () => {
      try {
        if (!sellerId) throw new Error('Missing seller');
        const unitPrice = price || 0;
        const totalPrice = unitPrice * quantity;
        await buyerApi.orders.create({
          seller_id: sellerId,
          item_type: 'spare_part',
          total_amount: totalPrice,
          currency: 'USD',
          payment_method: 'cash',
          delivery_method: 'pickup',
          buyer_notes: message || `Inquiry about spare part ${partId}`,
          items: [
            {
              item_id: partId,
              item_type: 'spare_part',
              quantity: quantity,
              unit_price: unitPrice,
              total_price: totalPrice,
              item_name: sellerName ? `Spare Part from ${sellerName}` : 'Spare Part',
              item_image: image || undefined,
            },
          ],
        });
        toast.success('Request sent. The seller will contact you soon.');
        // Clear form
        setName('');
        setEmail('');
        setQuantity(1);
        setQuantityDisplay('1');
        setMessage('');
      } catch (err: any) {
        // Surface useful error info for debugging while keeping a friendly message for users
        const apiMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
        console.error('Order create failed:', err?.response || err);
        toast.error(apiMsg ? `Failed to send request: ${apiMsg}` : 'Failed to send request.');
      }
    })();
  }, [name, email, quantity, message, price, partId, sellerId, sellerName, image]);

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
        <TextField 
          size="small" 
          label="Quantity" 
          type="number" 
          value={quantityDisplay} 
          onFocus={(e) => {
            if (quantityDisplay === '1') {
              setQuantityDisplay('');
              e.target.select();
            }
          }}
          onChange={(e) => {
            const val = e.target.value;
            setQuantityDisplay(val);
            const numVal = parseInt(val);
            if (val === '') {
              setQuantity(1);
            } else if (!isNaN(numVal) && numVal >= 1) {
              setQuantity(numVal);
            }
          }} 
          onBlur={(e) => {
            const val = e.target.value;
            if (val === '' || isNaN(parseInt(val)) || parseInt(val) < 1) {
              setQuantityDisplay('1');
              setQuantity(1);
            } else {
              setQuantityDisplay(val);
            }
          }}
          required 
          inputProps={{ min: 1, step: 1 }}
        />
        <TextField size="small" label="Message" multiline minRows={3} value={message} onChange={(e) => setMessage(e.target.value)} required />
        <Button type="submit" variant="contained" fullWidth>Contact Seller</Button>
      </Box>
    </>
  );
});

const SparePartDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Use a role-aware wrapper to select layout (buyer, seller, dealer, admin)
  const Layout = (props: { children: React.ReactNode }) => <RoleAwareLayout>{props.children}</RoleAwareLayout>;
  const [part, setPart] = useState<SparePartLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tab, setTab] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [similar, setSimilar] = useState<SparePartLite[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const handleAddToCart = () => {
    if (!part) return;
    if (!part.seller_id) {
      toast.error('Seller information is missing');
      return;
    }
    if (!part.price) {
      toast.error('Price information is missing');
      return;
    }
    
    const firstImage = part.images && part.images.length > 0 ? part.images[0] : '';
    
    dispatch(addToCart({
      id: `${part.id}-${Date.now()}`,
      item_id: part.id,
      item_type: 'spare_part',
      name: part.name,
      title: part.title,
      price: part.price,
      currency: part.currency || 'USD',
      quantity: 1,
      seller_id: part.seller_id,
      seller_name: part.seller_name,
      image: firstImage,
      sku: part.sku,
      brand: part.brand,
      category: part.category,
    }));
    toast.success(`${part.title || part.name} added to cart!`);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!id) return;
        
        // Fetch spare part by ID
        const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api';
        const response = await fetch(`${base}/spare-parts/${id}`);
        const data = await response.json();
        
        if (!data.success || !data.data) {
          throw new Error('Spare part not found');
        }
        
        const apiPart = data.data;
        const mapped: SparePartLite = {
          id,
          name: apiPart.name || 'Spare Part',
          title: apiPart.name || 'Spare Part',
          brand: apiPart.brand_name || apiPart.brand || '',
          category: apiPart.category_name || apiPart.category || '',
          sku: apiPart.sku || '',
          price: apiPart.price ? Number(apiPart.price) : undefined,
          currency: apiPart.currency || 'USD',
          images: apiPart.images ? (Array.isArray(apiPart.images) ? apiPart.images : typeof apiPart.images === 'string' ? JSON.parse(apiPart.images) : []) : [],
          description: apiPart.description || '',
          seller_id: apiPart.seller_id,
          seller_name: apiPart.seller_name || '',
          seller_email: apiPart.seller_email || '',
          quantity_available: apiPart.quantity_available ? Number(apiPart.quantity_available) : undefined,
        };
        setPart(mapped);
      } catch (e) {
        console.error('Failed to load spare part:', e);
        toast.error('Failed to load spare part');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Load similar listings by brand/category
  useEffect(() => {
    const loadSimilar = async () => {
      if (!part?.brand && !part?.category) {
        setSimilar([]);
        return;
      }
      try {
        const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api';
        const brandParam = part.brand ? `&brand=${encodeURIComponent(part.brand)}` : '';
        const categoryParam = part.category ? `&category=${encodeURIComponent(part.category)}` : '';
        const res = await fetch(`${base}/spare-parts/public?limit=6${brandParam}${categoryParam}`);
        const data = await res.json();
        const list: any[] = data?.data || data?.spare_parts || data?.parts || [];
        const mapped: SparePartLite[] = list
          .filter((p) => String(p.id) !== String(part.id))
          .slice(0, 6)
          .map((p) => ({
            id: String(p.id),
            name: p.name || 'Spare Part',
            title: p.name || 'Spare Part',
            brand: p.brand_name || p.brand || '',
            category: p.category_name || p.category || '',
            price: p.price ? Number(p.price) : undefined,
            images: p.images ? (Array.isArray(p.images) ? p.images : typeof p.images === 'string' ? JSON.parse(p.images) : []) : [],
          }));
        setSimilar(mapped);
      } catch (e) {
        setSimilar([]);
      }
    };
    loadSimilar();
  }, [part?.brand, part?.category, part?.id]);

  // Handle share functionality
  const handleShare = async () => {
    if (!part || !id) return;

    const shareData = {
      title: part.title || part.name,
      text: `Check out this ${part.title || part.name} - ${part.price ? `${part.currency || 'USD'} ${part.price.toLocaleString()}` : 'Contact for price'}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Link copied to clipboard!');
        } catch (clipboardErr) {
          toast.error('Failed to share. Please copy the URL manually.');
        }
      }
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!id) return;

    const token = localStorage.getItem('access_token');
    if (!token || token.trim() === '') {
      toast.error('Please login to add favorites');
      navigate('/');
      return;
    }

    setFavoriteLoading(true);
    try {
      // Note: Spare parts favorites might need a separate endpoint
      // For now, we'll just toggle the UI state
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (err: any) {
      console.error('Failed to toggle favorite:', err);
      toast.error('Failed to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>Loading…</Box>
      </Layout>
    );
  }

  if (!part) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Spare part not found</Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/spare-parts')}>Back to Browse</Button>
        </Box>
      </Layout>
    );
  }

  const primaryImage = part.images && part.images.length > 0 ? part.images[activeIndex] || part.images[0] : null;

  return (
    <Layout>
      <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <Button size="small" onClick={() => navigate('/spare-parts')}>Browse</Button> / {part.brand || 'Spare Parts'} / {part.category || 'Parts'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleShare} title="Share this part">
              <ShareIcon />
            </IconButton>
            <IconButton 
              onClick={handleToggleFavorite} 
              disabled={favoriteLoading}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              sx={{ color: isFavorite ? 'error.main' : 'inherit' }}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 0.9fr' }, gap: { xs: 1.5, md: 2 } }}>
          <Box>
            <Card>
              {primaryImage ? (
                <Box onClick={() => setLightboxOpen(true)} component="img" src={getImageUrl(primaryImage)} alt={part.title || part.name} sx={{ width: '100%', height: { xs: 220, sm: 300, md: 420 }, objectFit: 'cover', cursor: 'zoom-in' }} />
              ) : (
                <Box sx={{ width: '100%', height: { xs: 220, sm: 300, md: 420 }, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No Image</Typography>
                </Box>
              )}
              <CardContent>
                <Typography variant="h5" fontWeight={700}>{part.title || part.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {part.brand && <Chip label={part.brand} size="small" />}
                  {part.category && <Chip label={part.category} size="small" color="primary" variant="outlined" />}
                  {part.sku && <Chip label={`SKU: ${part.sku}`} size="small" variant="outlined" />}
                </Box>
                {/* Thumbnails */}
                {part.images && part.images.length > 1 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
                    {part.images.map((src, idx) => (
                      <Box key={idx} onClick={() => setActiveIndex(idx)} sx={{ width: 72, height: 48, borderRadius: 1, overflow: 'hidden', cursor: 'pointer', outline: idx === activeIndex ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.12)' }}>
                        <img src={getImageUrl(src)} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ))}
                  </Box>
                )}
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 2 }}>
                  <Tab label="Overview" />
                  <Tab label="Details" />
                </Tabs>
                <Box sx={{ mt: 2 }}>
                  {tab === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{part.description || 'No description provided.'}</Typography>
                  )}
                  {tab === 1 && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' }, rowGap: 1, columnGap: { xs: 1.5, md: 2 }, fontSize: 14 }}>
                      <span>Brand</span><span>{part.brand || '—'}</span>
                      <span>Category</span><span>{part.category || '—'}</span>
                      <span>SKU</span><span>{part.sku || '—'}</span>
                      <span>Quantity Available</span><span>{part.quantity_available !== undefined ? part.quantity_available : '—'}</span>
                      <span>Seller</span><span>{part.seller_name || '—'}</span>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ position: { xs: 'static', md: 'sticky' }, top: { md: 16 } }}>
              <CardContent>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                  {part.price ? `${part.currency || 'USD'} ${part.price.toLocaleString()}` : 'Contact for price'}
                </Typography>
                {part.quantity_available !== undefined && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {part.quantity_available > 0 ? `${part.quantity_available} available` : 'Out of stock'}
                  </Typography>
                )}
                {/* Add to Cart Button */}
                {part.price && part.seller_id && part.quantity_available !== undefined && part.quantity_available > 0 && (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                    sx={{ mb: 2 }}
                  >
                    Add to Cart
                  </Button>
                )}
                {/* Contact Form - hidden for sellers */}
                {(((localStorage.getItem('user_data') && JSON.parse(localStorage.getItem('user_data') || '{}')?.role?.toLowerCase?.()) !== 'seller')) && (
                  <ContactForm 
                    price={part.price} 
                    partId={part.id} 
                    sellerId={part.seller_id} 
                    sellerName={part.seller_name} 
                    sellerEmail={part.seller_email} 
                    image={part.images?.[0]} 
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
        {lightboxOpen && primaryImage && (
          <Box onClick={() => setLightboxOpen(false)} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.85)', display: 'grid', placeItems: 'center', zIndex: 1300 }}>
            <IconButton onClick={() => setLightboxOpen(false)} sx={{ position: 'fixed', top: 12, right: 12, color: 'common.white' }}>
              <CloseIcon />
            </IconButton>
            <Box component="img" src={getImageUrl(primaryImage)} alt="zoom" sx={{ maxWidth: '92vw', maxHeight: '82vh', objectFit: 'contain' }} />
          </Box>
        )}
        {/* Similar Listings */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Similar parts</Typography>
          {similar.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No similar parts found.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {similar.map((s) => (
                <Card key={s.id} onClick={() => navigate(`/spare-parts/${s.id}`)} sx={{ cursor: 'pointer' }}>
                  {s.images && s.images[0] ? (
                    <Box component="img" src={getImageUrl(s.images[0])} alt={s.title || s.name} sx={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ width: '100%', height: 140, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">No Image</Typography>
                    </Box>
                  )}
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700}>{s.title || s.name}</Typography>
                    {s.price != null && (
                      <Typography variant="body2" color="text.secondary">{s.currency || 'USD'} {Number(s.price).toLocaleString()}</Typography>
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

export default SparePartDetails;

