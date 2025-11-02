import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  item_id: string;
  item_type: 'car' | 'spare_part';
  name: string;
  title?: string;
  price: number;
  currency: string;
  quantity: number;
  seller_id: string;
  seller_name?: string;
  image?: string;
  sku?: string;
  brand?: string;
  category?: string;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem & { clearCartIfDifferentSeller?: boolean }>) => {
      const newItem = action.payload;
      
      // Get current seller ID from existing cart items
      const currentSellerId = state.items.length > 0 ? state.items[0].seller_id : null;
      
      // If cart has items from different seller and clearCartIfDifferentSeller is true, clear cart
      if (currentSellerId && currentSellerId !== newItem.seller_id && action.payload.clearCartIfDifferentSeller) {
        state.items = [];
      }
      
      // Check if item already exists in cart (same item_id and seller_id)
      const existingIndex = state.items.findIndex(
        (item) => item.item_id === newItem.item_id && item.seller_id === newItem.seller_id
      );
      
      if (existingIndex >= 0) {
        // Update quantity if item exists
        state.items[existingIndex].quantity += newItem.quantity;
      } else {
        // Add new item
        state.items.push(newItem);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter((item) => item.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartItemCount = (state: { cart: CartState }) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) => 
  state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
export const selectCartItemsBySeller = (state: { cart: CartState }) => {
  const itemsBySeller: { [sellerId: string]: CartItem[] } = {};
  state.cart.items.forEach((item) => {
    if (!itemsBySeller[item.seller_id]) {
      itemsBySeller[item.seller_id] = [];
    }
    itemsBySeller[item.seller_id].push(item);
  });
  return itemsBySeller;
};

// Get current seller ID from cart (returns null if cart is empty)
export const selectCartSellerId = (state: { cart: CartState }): string | null => {
  return state.cart.items.length > 0 ? state.cart.items[0].seller_id : null;
};

// Check if item can be added to cart (same seller or empty cart)
export const selectCanAddToCart = (state: { cart: CartState }, sellerId: string | null | undefined): boolean => {
  if (!sellerId) return false;
  const currentSellerId = selectCartSellerId(state);
  return !currentSellerId || currentSellerId === sellerId;
};

// Check if cart is empty
export const selectIsCartEmpty = (state: { cart: CartState }): boolean => {
  return state.cart.items.length === 0;
};

// Check if an item is already in the cart (by item_id and seller_id)
export const selectIsItemInCart = (state: { cart: CartState }, itemId: string, sellerId?: string): boolean => {
  return state.cart.items.some(
    (item) => item.item_id === itemId && (!sellerId || item.seller_id === sellerId)
  );
};

