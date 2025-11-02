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
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
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

