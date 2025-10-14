import { api } from "@/lib/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiCallTracker, createApiKey } from "@/utils/apiCallTracker";

/* ----------------------------- API THUNKS ----------------------------- */

export const fetchCatalogSections = createAsyncThunk(
  "catalog/fetchCatalogSections",
  async (params = {}, thunkAPI) => {
    try {
      const {
        categoryPage = 1,
        categoryLimit = 5,
        perCategoryLimit = 8,
        categoryIds, // optional CSV "id1,id2"
      } = params;

      const res = await api.get("products/catalog/sections", {
        params: {
          categoryPage,
          categoryLimit,
          perCategoryLimit,
          ...(categoryIds ? { categoryIds } : {}),
        },
        signal: thunkAPI.signal,
      });

      const data = res.data;
      if (res.status >= 400 || data?.success === false) {
        return thunkAPI.rejectWithValue(data?.message || `HTTP ${res.status}`);
      }
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Network error";
      return thunkAPI.rejectWithValue(message);
    }
  }
);


/* ------------------------- PRODUCTS LIST (all) ------------------------- */
/** Endpoint: products/get-products
 *  Returns: { success, source, data:[product], pagination:{ total,page,limit,totalPages } }
 */
export const fetchProducts = createAsyncThunk(
  "catalog/fetchProducts",
  async (params = {}, thunkAPI) => {
    try {
      const { page = 1, limit = 20, search = "" } = params;
      const res = await api.get("products/get-products", {
        params: { page, limit, ...(search ? { search } : {}) },
        signal: thunkAPI.signal,
      });

      const data = res.data;
      if (res.status >= 400 || data?.success === false) {
        return thunkAPI.rejectWithValue(data?.message || `HTTP ${res.status}`);
      }
      return data; // { success, source, data, pagination }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Network error";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// fetch all categories

export const fetchAllCategories = createAsyncThunk(
  "catalog/fetchAllCategories",
  async (_, thunkAPI) => {
    const apiKey = createApiKey('fetchAllCategories');
    
    return await apiCallTracker.trackCall(apiKey, async () => {
      try {
        const res = await api.get("category/get-categories", {
          signal: thunkAPI.signal,
        });
        const data = res.data;
        if (res.status >= 400 || data?.success === false) {
          return thunkAPI.rejectWithValue(data?.message || `HTTP ${res.status}`);
        }
        // expected: { success, source, data: [ { name, slug, description, bannerImageUrl, sortOrder } ] }
        return data;
      } catch (err) {
        const message =
          err?.response?.data?.message || err?.message || "Network error";
        return thunkAPI.rejectWithValue(message);
      }
    });
  }
);




/** Get a single product by slug
 *  Endpoint: /get-product-by-slug/:slug
 *  Expects: { success, source, data: { ...product } }
 */
export const fetchProductBySlug = createAsyncThunk(
  "catalog/fetchProductBySlug",
  async (slug, thunkAPI) => {
    try {
      const safeSlug = encodeURIComponent(slug);
      const res = await api.get(`products/get-product-by-slug/${safeSlug}`, {
        signal: thunkAPI.signal,
      });

      const data = res.data;
      if (res.status >= 400 || data?.success === false || !data?.data) {
        return thunkAPI.rejectWithValue(data?.message || `HTTP ${res.status}`);
      }

      // return server payload as-is; UI/selectors will read first variant/images
      return data; // { success, source, data: <product> }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Network error";
      return thunkAPI.rejectWithValue(message);
    }
  }
);


/* ------------------ PRODUCTS BY CATEGORY (Collections detail) ------------------ */
/** Endpoint: products/get-product-by-category/:categoryId
 *  Returns: { success, source, data: { category:{_id,name,slug}, products:[...] }, meta:{...} }
 */
export const fetchProductsByCategoryId = createAsyncThunk(
  "catalog/fetchProductsByCategoryId",
  async (
    { categoryId, page = 1, limit = 20, sort, fields },
    thunkAPI
  ) => {
    try {
      const safeId = encodeURIComponent(categoryId);
      const res = await api.get(`products/get-product-by-category/${safeId}`, {
        params: { page, limit, ...(sort ? { sort } : {}), ...(fields ? { fields } : {}) },
        signal: thunkAPI.signal,
      });
      const data = res.data;
      if (res.status >= 400 || data?.success === false || !data?.data) {
        return thunkAPI.rejectWithValue(data?.message || `HTTP ${res.status}`);
      }
      return data; // { success, source, data:{category,products}, meta }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Network error";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/* -------------------------------- STATE ------------------------------- */

const initialState = {
  sections: [],
  pagination: null,
  source: null,
  params: {
    categoryPage: 1,
    categoryLimit: 5,
    perCategoryLimit: 8,
    categoryIds: null,
  },
  isLoading: false,
  error: null,

  // single product detail
  product: null,
  productSource: null,
  productLoading: false,
  productError: null,


    /* NEW: categories listing */
    categories: [],
    categoriesSource: null,
    categoriesLoading: false,
    categoriesError: null,

     /* NEW: single category listing page */
  categoryView: {
    category: null,   // { _id, name, slug }
    products: [],     // Product[]
    meta: null,       // { page, limit, total, ... }
    source: null,
    loading: false,
    error: null,
  },

  /* NEW: products list page (all) */
  productsList: {
    items: [],
    pagination: null,
    loading: false,
    error: null,
    source: null,
    params: { page: 1, limit: 20, search: "" },
  },
};

/* -------------------------------- SLICE ------------------------------- */

const productSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    setParams: (state, action) => {
      state.params = { ...state.params, ...action.payload };
    },
    setCategoryPage: (state, action) => {
      state.params.categoryPage = action.payload || 1;
    },
    clearCatalogError: (state) => {
      state.error = null;
    },
    clearCatalog: (state) => {
      state.sections = [];
      state.pagination = null;
      state.source = null;
      state.error = null;
    },
    clearCategories: (state) => {
      state.categories = [];
      state.categoriesSource = null;
      state.categoriesLoading = false;
      state.categoriesError = null;
    },

    // optionally clear product detail
    clearProduct: (state) => {
      state.product = null;
      state.productSource = null;
      state.productError = null;
      state.productLoading = false;
    },

    clearCategoryView: (state) => {
      state.categoryView = { category: null, products: [], meta: null, source: null, loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      /* -------- catalog sections -------- */
      .addCase(fetchCatalogSections.pending, (state, action) => {
        const p = action.meta?.arg;
        if (p && typeof p === "object") {
          state.params = { ...state.params, ...p };
        }
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCatalogSections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        const payload = action.payload || {};
        state.sections = Array.isArray(payload.data) ? payload.data : [];
        state.pagination = payload.pagination || null;
        state.source = payload.source || null;

        if (payload.pagination) {
          state.params.categoryPage =
            payload.pagination.page ?? state.params.categoryPage;
          state.params.categoryLimit =
            payload.pagination.limit ?? state.params.categoryLimit;
        }
      })
      .addCase(fetchCatalogSections.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to load catalog";
      })

      /* -------- single product by slug -------- */
      .addCase(fetchProductBySlug.pending, (state) => {
        state.productLoading = true;
        state.productError = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.productLoading = false;
        state.productError = null;

        const payload = action.payload || {};
        state.product = payload.data || null; // server's product object
        state.productSource = payload.source || null;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.productLoading = false;
        state.productError =
          action.payload ||
          action.error?.message ||
          "Failed to load product";
      }) .addCase(fetchAllCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = null;
        const payload = action.payload || {};
        state.categories = Array.isArray(payload.data) ? payload.data : [];
        state.categoriesSource = payload.source || null;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError =
          action.payload || action.error?.message || "Failed to load categories";
      })

       /* -------- products by category -------- */
    builder
    .addCase(fetchProductsByCategoryId.pending, (state) => {
      state.categoryView.loading = true;
      state.categoryView.error = null;
    })
    .addCase(fetchProductsByCategoryId.fulfilled, (state, action) => {
      state.categoryView.loading = false;
      state.categoryView.error = null;

      const payload = action.payload || {};
      const { page = 1 } = action.meta?.arg || {};
      
      state.categoryView.category = payload.data?.category || null;
      state.categoryView.meta = payload.meta || null;
      state.categoryView.source = payload.source || null;
      
      // For infinite scroll: accumulate products for page > 1, replace for page 1
      const newProducts = Array.isArray(payload.data?.products) ? payload.data.products : [];
      if (page === 1) {
        // First page: replace all products
        state.categoryView.products = newProducts;
      } else {
        // Subsequent pages: append products (avoid duplicates)
        const existingIds = new Set(state.categoryView.products.map(p => p._id));
        const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p._id));
        state.categoryView.products = [...state.categoryView.products, ...uniqueNewProducts];
      }
    })
    .addCase(fetchProductsByCategoryId.rejected, (state, action) => {
      state.categoryView.loading = false;
      state.categoryView.error =
        action.payload || action.error?.message || "Failed to load category products";
    })

    /* -------- products list (all) -------- */
    .addCase(fetchProducts.pending, (state, action) => {
      const p = action.meta?.arg;
      if (p && typeof p === "object") {
        state.productsList.params = { ...state.productsList.params, ...p };
      }
      state.productsList.loading = true;
      state.productsList.error = null;
    })
    .addCase(fetchProducts.fulfilled, (state, action) => {
      state.productsList.loading = false;
      state.productsList.error = null;
      const payload = action.payload || {};
      state.productsList.items = Array.isArray(payload.data) ? payload.data : [];
      state.productsList.pagination = payload.pagination || null;
      state.productsList.source = payload.source || null;
    })
    .addCase(fetchProducts.rejected, (state, action) => {
      state.productsList.loading = false;
      state.productsList.error = action.payload || action.error?.message || "Failed to load products";
    });
  },
});

export const {
  setParams,
  setCategoryPage,
  clearCatalogError,
  clearCatalog,
  clearProduct,
  clearCategories,
} = productSlice.actions;

export default productSlice.reducer;

/* ------------------------------ SELECTORS ----------------------------- */
export const selectCatalogSections = (state) => state.catalog.sections;
export const selectCatalogPagination = (state) => state.catalog.pagination;
export const selectCatalogParams = (state) => state.catalog.params;
export const selectCatalogLoading = (state) => state.catalog.isLoading;
export const selectCatalogError = (state) => state.catalog.error;

/* single product */
export const selectProduct = (state) => state.catalog.product;
export const selectProductLoading = (state) => state.catalog.productLoading;
export const selectProductError = (state) => state.catalog.productError;
export const selectProductSource = (state) => state.catalog.productSource;

export const selectAllCategories = (state) => state.catalog.categories;
export const selectCategoriesLoading = (state) => state.catalog.categoriesLoading;
export const selectCategoriesError = (state) => state.catalog.categoriesError;

export const selectCategoryView = (s) => s.catalog.categoryView;
export const selectCategoryProducts = (s) => s.catalog.categoryView.products;
export const selectCategoryMeta = (s) => s.catalog.categoryView.meta;
export const selectCategoryHeader = (s) => s.catalog.categoryView.category; // { _id, name, slug }
export const selectCategoryLoading = (s) => s.catalog.categoryView.loading;
export const selectCategoryError = (s) => s.catalog.categoryView.error;

/** First variant (if present) */
export const selectFirstVariant = (state) =>
  state.catalog.product?.variants?.[0] || null;

/** Images from the first variant (fallback to mainImageUrl if variants missing) */
export const selectFirstVariantImages = (state) => {
  const v0 = state.catalog.product?.variants?.[0];
  if (v0?.images?.length) return v0.images; 
  const main = state.catalog.product?.mainImageUrl;
  return main ? [main] : [];
};

/* products list selectors */
export const selectProducts = (s) => s.catalog.productsList.items;
export const selectProductsPagination = (s) => s.catalog.productsList.pagination;
export const selectProductsLoading = (s) => s.catalog.productsList.loading;
export const selectProductsError = (s) => s.catalog.productsList.error;
export const selectProductsParams = (s) => s.catalog.productsList.params;
