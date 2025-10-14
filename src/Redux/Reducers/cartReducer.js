import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import { apiCallTracker, createApiKey } from "@/utils/apiCallTracker";
// import { saveCartPersistenceData } from "../utils/cartPersistence";

// ✅ ENHANCED: Guest cart localStorage management
const GUEST_CART_KEY = 'guest_cart';

// Get guest cart from localStorage
export const getGuestCart = () => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : { items: [], count: 0, total: 0 };
  } catch (error) {
    console.error('Error getting guest cart:', error);
    return { items: [], count: 0, total: 0 };
  }
};

// Save guest cart to localStorage
export const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
};

// Clear guest cart
export const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error('Error clearing guest cart:', error);
  }
};

// Calculate cart totals
const calculateCartTotals = (items) => {
  const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const total = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.priceAtAdd || 0)), 0);
  return { count, total };
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, thunkAPI) => {
  const apiKey = createApiKey('fetchCart');
  
  return await apiCallTracker.trackCall(apiKey, async () => {
    try {
      const res = await api.get("carts/cart-current", { signal: thunkAPI.signal, withCredentials: true });
      const cartData = res.data?.data || { items: [] };
      
      // Ensure items have proper structure for frontend
      const processedItems = cartData.items?.map(item => ({
        ...item,
        product: item.product && typeof item.product === 'object' ? item.product : { _id: item.product, title: 'Unknown Product' },
        variant: item.variant || { 
          sku: item.variantSku, 
          price: item.priceAtAdd,
          attributes: {} 
        }
      })) || [];
      
      return {
        ...cartData,
        items: processedItems
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to load cart");
    }
  });
});

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, variantSku, unitPrice, quantity = 1 }, thunkAPI) => {
    const state = thunkAPI.getState();
    const isAuthenticated = state.auth.isAuthenticated;
    
    if (isAuthenticated) {
      // ✅ User is logged in - use API
      try {
        const res = await api.post(
          "carts/cart-add",
          { productId, variantSku, unitPrice, quantity },
          { withCredentials: true, signal: thunkAPI.signal }
        );
        const cartData = res.data?.data || { items: [] };
        
        // Ensure items have proper structure for frontend
        const processedItems = cartData.items?.map(item => ({
          ...item,
          product: item.product && typeof item.product === 'object' ? item.product : { _id: item.product, title: 'Unknown Product' },
          variant: item.variant || { 
            sku: item.variantSku, 
            price: item.priceAtAdd,
            attributes: {} 
          }
        })) || [];
        
        return {
          ...cartData,
          items: processedItems
        };
      } catch (err) {
        return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to add to cart");
      }
    } else {
      // ✅ Guest user - use localStorage
      try {
        const guestCart = getGuestCart();
        
        const existingItem = guestCart.items.find(
          item => item.product === productId && item.variantSku === variantSku
        );
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          guestCart.items.push({
            product: productId,
            variantSku,
            quantity,
            priceAtAdd: unitPrice,
            addedAt: new Date().toISOString()
          });
        }
        
        // Update totals
        const totals = calculateCartTotals(guestCart.items);
        guestCart.count = totals.count;
        guestCart.total = totals.total;
        
        // Save to localStorage
        saveGuestCart(guestCart);
        
        return guestCart;
      } catch (error) {
        return thunkAPI.rejectWithValue("Failed to add to guest cart");
      }
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ productId, variantSku, quantity }, thunkAPI) => {
    const state = thunkAPI.getState();
    const isAuthenticated = state.auth.isAuthenticated;
    
    if (isAuthenticated) {
      // ✅ User is logged in - use API
      try {
        const res = await api.post(
          "carts/cart-update",
          { productId, variantSku, quantity },
          { withCredentials: true, signal: thunkAPI.signal }
        );
        return res.data?.data || { items: [] };
      } catch (err) {
        return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to update cart");
      }
    } else {
      // ✅ Guest user - use localStorage
      try {
        const guestCart = getGuestCart();
        
        const existingItemIndex = guestCart.items.findIndex(
          item => item.product === productId && item.variantSku === variantSku
        );
        
        if (existingItemIndex !== -1) {
          if (quantity <= 0) {
            // Remove item if quantity is 0
            guestCart.items.splice(existingItemIndex, 1);
          } else {
            // Update quantity
            guestCart.items[existingItemIndex].quantity = quantity;
          }
        }
        
        // Update totals
        const totals = calculateCartTotals(guestCart.items);
        guestCart.count = totals.count;
        guestCart.total = totals.total;
        
        // Save to localStorage
        saveGuestCart(guestCart);
        
        return guestCart;
      } catch (error) {
        return thunkAPI.rejectWithValue("Failed to update guest cart");
      }
    }
  }
);

export const clearCart = createAsyncThunk("cart/clearCart", async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const isAuthenticated = state.auth.isAuthenticated;
  
  if (isAuthenticated) {
    // ✅ User is logged in - use API
    try {
      await api.post("carts/cart-clear", {}, { withCredentials: true, signal: thunkAPI.signal });
      return { items: [] };
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to clear cart");
    }
  } else {
    // ✅ Guest user - clear localStorage
    try {
      clearGuestCart();
      return { items: [], count: 0, total: 0 };
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to clear guest cart");
    }
  }
});

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, variantSku }, thunkAPI) => {
    const state = thunkAPI.getState();
    const isAuthenticated = state.auth.isAuthenticated;
    
    if (isAuthenticated) {
      // ✅ User is logged in - use API
      try {
        const res = await api.post(
          "carts/cart-remove",
          { productId, variantSku },
          { withCredentials: true, signal: thunkAPI.signal }
        );
        return res.data?.data || { items: [] };
      } catch (err) {
        return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to remove from cart");
      }
    } else {
      // ✅ Guest user - use localStorage
      try {
        const guestCart = getGuestCart();
        
        guestCart.items = guestCart.items.filter(
          item => !(item.product === productId && item.variantSku === variantSku)
        );
        
        // Update totals
        const totals = calculateCartTotals(guestCart.items);
        guestCart.count = totals.count;
        guestCart.total = totals.total;
        
        // Save to localStorage
        saveGuestCart(guestCart);
        
        return guestCart;
      } catch (error) {
        return thunkAPI.rejectWithValue("Failed to remove from guest cart");
      }
    }
  }
);

export const fetchCartCount = createAsyncThunk("cart/fetchCartCount", async (_, thunkAPI) => {
  try {
    const res = await api.get("carts/cart-count", { signal: thunkAPI.signal, withCredentials: true });
    return res.data?.count || 0;
  } catch (err) {
    return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to fetch cart count");
  }
});

export const mergeGuestCart = createAsyncThunk("cart/mergeGuestCart", async (_, thunkAPI) => {
  try {
    const res = await api.post("carts/cart-merge", {}, { withCredentials: true, signal: thunkAPI.signal });
    return res.data?.data || { items: [] };
  } catch (err) {
    return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to merge cart");
  }
});

// ✅ ENHANCED: Merge guest cart on login
export const mergeGuestCartOnLogin = createAsyncThunk(
  "cart/mergeGuestCartOnLogin",
  async (_, thunkAPI) => {
    try {
      const guestCart = getGuestCart();
      
      if (guestCart.items.length > 0) {
        const res = await api.post(
          "carts/cart-merge",
          { guestCartItems: guestCart.items },
          { withCredentials: true, signal: thunkAPI.signal }
        );
        
        // Clear guest cart after successful merge
        clearGuestCart();
        
        return res.data?.data || { items: [] };
      }
      
      return { items: [] };
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to merge cart");
    }
  }
);

// export const fetchCartCount = createAsyncThunk("cart/fetchCartCount", async (_, thunkAPI) => {
//   try {
//     const res = await api.get("cart/count", { signal: thunkAPI.signal, withCredentials: true });
//     return res.data?.count || 0;
//   } catch (err) {
//     return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to fetch cart count");
//   }
// });

const initialState = {
  items: [],
  loading: false,
  error: null,
  isOpen: false,
  count: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    openCart: (state) => { state.isOpen = true; },
    closeCart: (state) => { state.isOpen = false; },
    // ✅ FIX: Add action to clear cart state
    clearCartState: (state) => {
      state.items = [];
      state.count = 0;
      state.loading = false;
      state.error = null;
    },
    // ✅ FIX: Add action to reset cart fetch tracking
    resetCartFetchTracking: (state) => {
      // This will be used to reset the cartFetchedRef in useAuthSync
      state._resetFetchTracking = Date.now();
    },
    // ✅ FIX: Add action to set fallback cart data
    setFallbackCart: (state, action) => {
      state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
      state.count = action.payload?.count || state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        // ✅ FIX: Update cart count when fetching cart
        state.count = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        // ✅ FIX: Save cart persistence data
        // if (action.payload) {
        //   saveCartPersistenceData(action.payload);
        // }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to load cart";
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.count = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        state.isOpen = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.count = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.count = 0;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.count = state.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
      })
      .addCase(fetchCartCount.fulfilled, (state, action) => {
        state.count = action.payload;
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.count = state.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
      })
      .addCase(mergeGuestCartOnLogin.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.count = state.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
      });
  },
});

export default cartSlice.reducer;

export const { openCart, closeCart, clearCartState, resetCartFetchTracking, setFallbackCart } = cartSlice.actions;

export const selectCartItems = (s) => s.cart.items;
export const selectCartCount = (s) => s.cart.count || (s.cart.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0);
export const selectCartLoading = (s) => s.cart.loading;
export const selectCartError = (s) => s.cart.error;


