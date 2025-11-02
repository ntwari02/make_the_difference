import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Divider,
  Chip,
  GridLegacy as Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  ShoppingBag as CheckoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  updateQuantity,
  removeFromCart,
  clearCart,
} from '../store/cartSlice';
import { buyerApi } from '../services/buyerApi';
import BuyerLayout from '../components/layout/BuyerLayout';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import toast from 'react-hot-toast';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const itemCount = useSelector(selectCartItemCount);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    payment_method: 'cash',
    delivery_method: 'pickup',
    buyer_notes: '',
  });

  // Group items by seller
  const itemsBySeller: { [sellerId: string]: typeof cartItems } = {};
  cartItems.forEach((item) => {
    if (!itemsBySeller[item.seller_id]) {
      itemsBySeller[item.seller_id] = [];
    }
    itemsBySeller[item.seller_id].push(item);
  });

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
  };

  const handleRemove = (itemId: string) => {
    dispatch(removeFromCart(itemId));
    toast.success('Item removed from cart');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setCheckoutLoading(true);
    try {
      // Group items by seller and create orders for each seller
      const orders: Promise<any>[] = [];

      Object.entries(itemsBySeller).forEach(([sellerId, items]) => {
        const sellerItems = items;
        const itemTypes = new Set(sellerItems.map((item) => item.item_type));
        const itemType = itemTypes.size === 1 ? sellerItems[0].item_type : 'mixed';
        const sellerTotal = sellerItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const currency = sellerItems[0]?.currency || 'USD';

        // Create order items array
        const orderItems = sellerItems.map((item) => ({
          item_id: item.item_id,
          item_type: item.item_type,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          item_name: item.title || item.name,
          item_image: item.image,
          item_sku: item.sku,
        }));

        const order = buyerApi.orders.create({
          seller_id: sellerId,
          item_type: itemType,
          total_amount: sellerTotal,
          currency: currency,
          payment_method: checkoutData.payment_method,
          delivery_method: checkoutData.delivery_method,
          buyer_notes: checkoutData.buyer_notes || `Order for ${sellerItems.length} item(s)`,
          items: orderItems,
        });

        orders.push(order);
      });

      // Create all orders
      await Promise.all(orders);

      // Clear cart after successful checkout
      dispatch(clearCart());
      setCheckoutOpen(false);
      toast.success(`Successfully placed ${orders.length} order(s)!`);
      navigate('/buyer/orders');
    } catch (error: any) {
      console.error('Checkout error:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to place order. Please try again.';
      toast.error(message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <BuyerLayout>
        <Box sx={{ py: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <CartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Start shopping to add items to your cart
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/spare-parts')}
                sx={{ mr: 2 }}
              >
                Browse Spare Parts
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/browse')}
              >
                Browse Cars
              </Button>
            </CardContent>
          </Card>
        </Box>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Shopping Cart
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            {Object.entries(itemsBySeller).map(([sellerId, items]) => {
              const sellerName = items[0]?.seller_name || 'Seller';
              return (
                <Card key={sellerId} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip label={`Seller: ${sellerName}`} color="primary" size="small" />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {items.map((item) => (
                      <Box key={item.id}>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            mb: 2,
                            pb: 2,
                            '&:not(:last-child)': {
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                            },
                          }}
                        >
                          {/* Item Image */}
                          <Box
                            component="img"
                            src={
                              item.image
                                ? getImageUrl(item.image)
                                : 'https://images.unsplash.com/photo-1549921296-3fdc4a3fa5d8?q=80&w=1200&auto=format&fit=crop'
                            }
                            alt={item.name}
                            sx={{
                              width: 120,
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          />

                          {/* Item Details */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                              {item.title || item.name}
                            </Typography>
                            {item.sku && (
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                                SKU: {item.sku}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                              {item.brand && <Chip label={item.brand} size="small" />}
                              {item.category && (
                                <Chip label={item.category} size="small" color="primary" variant="outlined" />
                              )}
                              <Chip
                                label={item.item_type === 'car' ? 'Car' : 'Spare Part'}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="h6" fontWeight={800} color="primary">
                              {item.currency || 'USD'} {Number(item.price).toLocaleString()} each
                            </Typography>
                          </Box>

                          {/* Quantity Controls */}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <TextField
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  if (val >= 1) {
                                    handleQuantityChange(item.id, val);
                                  }
                                }}
                                inputProps={{
                                  style: {
                                    textAlign: 'center',
                                    width: '60px',
                                    padding: '8px',
                                  },
                                  min: 1,
                                }}
                                variant="standard"
                                type="number"
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Subtotal: {item.currency || 'USD'}{' '}
                              {(item.price * item.quantity).toLocaleString()}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemove(item.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 80 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Items ({itemCount})</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {cartItems[0]?.currency || 'USD'} {cartTotal.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    To be determined
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="primary">
                    {cartItems[0]?.currency || 'USD'} {cartTotal.toLocaleString()}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<CheckoutIcon />}
                  onClick={() => setCheckoutOpen(true)}
                  disabled={checkoutLoading}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/spare-parts')}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onClose={() => !checkoutLoading && setCheckoutOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body1" fontWeight={600}>
              Order Total: {cartItems[0]?.currency || 'USD'} {cartTotal.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Object.keys(itemsBySeller).length} seller(s), {itemCount} item(s)
            </Typography>
            <Divider />
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={checkoutData.payment_method}
                label="Payment Method"
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, payment_method: e.target.value })
                }
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="mobile_money">Mobile Money</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Delivery Method</InputLabel>
              <Select
                value={checkoutData.delivery_method}
                label="Delivery Method"
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, delivery_method: e.target.value })
                }
              >
                <MenuItem value="pickup">Pickup</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
                <MenuItem value="ship">Ship</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={checkoutData.buyer_notes}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, buyer_notes: e.target.value })
              }
              placeholder="Any special instructions or notes for the seller..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutOpen(false)} disabled={checkoutLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCheckout}
            variant="contained"
            disabled={checkoutLoading}
            startIcon={checkoutLoading ? <CircularProgress size={16} /> : <CheckoutIcon />}
          >
            {checkoutLoading ? 'Placing Order...' : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </BuyerLayout>
  );
};

export default Cart;

