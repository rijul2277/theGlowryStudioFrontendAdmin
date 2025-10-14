import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

// ✅ Fetch user's wishlist
export const fetchWishlist = createAsyncThunk("wishlist/fetchWishlist", async (_, thunkAPI) => {
  try {
    const res = await api.get("wishlist", { signal: thunkAPI.signal, withCredentials: true });
    return res.data?.data?.products || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to load wishlist");
  }
});

// ✅ Add product to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (productId, thunkAPI) => {
    try {
      const res = await api.post(
        "wishlist/add",
        { productId },
        { withCredentials: true, signal: thunkAPI.signal }
      );
      return res.data?.data?.product || productId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to add to wishlist");
    }
  }
);

// ✅ Remove product from wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, thunkAPI) => {
    try {
      const res = await api.post(
        "wishlist/remove",
        { productId },
        { withCredentials: true, signal: thunkAPI.signal }
      );
      return productId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to remove from wishlist");
    }
  }
);

// ✅ OPTIMIZED: Toggle wishlist status using new backend endpoint
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggleWishlist",
  async (productId, thunkAPI) => {
    try {
      const res = await api.post(
        "wishlist/toggle",
        { productId },
        { withCredentials: true, signal: thunkAPI.signal }
      );
      return {
        productId,
        isInWishlist: res.data?.data?.isInWishlist,
        action: res.data?.data?.action
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to toggle wishlist");
    }
  }
);

// ✅ Clear entire wishlist
export const clearWishlist = createAsyncThunk("wishlist/clearWishlist", async (_, thunkAPI) => {
  try {
    await api.post("wishlist/clear", {}, { withCredentials: true, signal: thunkAPI.signal });
    return [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to clear wishlist");
  }
});

// ✅ Fetch wishlist count
export const fetchWishlistCount = createAsyncThunk("wishlist/fetchWishlistCount", async (_, thunkAPI) => {
  try {
    const res = await api.get("wishlist/count", { signal: thunkAPI.signal, withCredentials: true });
    return res.data?.data?.count || 0;
  } catch (err) {
    return thunkAPI.rejectWithValue(err?.response?.data?.message || err?.message || "Failed to fetch wishlist count");
  }
});

// ✅ REMOVED: fetchCartCount from wishlist reducer - this should be in cart reducer
// Cart count fetching should be handled by the cart reducer, not wishlist reducer

const initialState = {
  items: [],
  loading: false,
  error: null,
  count: 0,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
    // Optimistic update for better UX
    optimisticAddToWishlist: (state, action) => {
      const productId = action.payload;
      if (!state.items.some(item => item._id === productId)) {
        state.items.push({ _id: productId, isOptimistic: true });
        state.count = state.items.length;
      }
    },
    optimisticRemoveFromWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item._id !== productId);
      state.count = state.items.length;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.count = state.items.length;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to load wishlist";
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const product = action.payload;
        if (!state.items.some(item => item._id === product._id || item._id === product)) {
          state.items.push(typeof product === 'string' ? { _id: product } : product);
          state.count = state.items.length;
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to add to wishlist";
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const productId = action.payload;
        state.items = state.items.filter(item => item._id !== productId);
        state.count = state.items.length;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to remove from wishlist";
      })
      
      // ✅ OPTIMIZED: Toggle wishlist
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, isInWishlist } = action.payload;
        
        if (isInWishlist) {
          // Add to wishlist
          if (!state.items.some(item => item._id === productId)) {
            state.items.push({ _id: productId });
            state.count = state.items.length;
          }
        } else {
          // Remove from wishlist
          state.items = state.items.filter(item => item._id !== productId);
          state.count = state.items.length;
        }
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to toggle wishlist";
      })
      
      // Clear wishlist
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = [];
        state.count = 0;
        state.loading = false;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to clear wishlist";
      })
      
      // Fetch wishlist count
      .addCase(fetchWishlistCount.fulfilled, (state, action) => {
        state.count = action.payload;
      });
  },
});

export default wishlistSlice.reducer;

export const { 
  clearWishlistError, 
  optimisticAddToWishlist, 
  optimisticRemoveFromWishlist 
} = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.count;
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectWishlistError = (state) => state.wishlist.error;
export const selectIsInWishlist = (productId) => (state) => 
  state.wishlist.items.some(item => item._id === productId);