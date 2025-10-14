import axios from "axios";

export const api = axios.create({
  baseURL: "https://theglowrystudiobackend-2.onrender.com/api/v1" || "",
  timeout: 15000,
  withCredentials: true, // set true for cart functionality
});

// Cookie utility functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function setCookie(name, value, maxAgeMinutes) {
  const maxAge = maxAgeMinutes * 60;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; secure; samesite=lax`;
}

function clearAllCookies() {
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
}

// ✅ ADD: Token refresh debouncing to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshPromise = null;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    // ✅ NEW: Check for auto-refreshed tokens from backend
    const newAccessToken = response.headers['x-new-access-token'];
    const newRefreshToken = response.headers['x-new-refresh-token'];
    const tokenRefreshed = response.headers['x-token-refreshed'];
    
    if (tokenRefreshed === 'true' && newAccessToken && newRefreshToken) {
      console.log('🔄 Backend auto-refreshed tokens, updating frontend...');
      
      // Update cookies with new tokens
      setCookie('accessToken', newAccessToken, 15); // 15 minutes
      setCookie('refreshToken', newRefreshToken, 12 * 24 * 60); // 12 days
      
      console.log('✅ Frontend tokens updated from backend auto-refresh');
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // ✅ FIX: Debounce token refresh to prevent multiple simultaneous calls
      if (isRefreshing) {
        // Wait for the ongoing refresh to complete
        await refreshPromise;
        
        // Retry with the new token
        const token = getCookie('accessToken');
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      }
      
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const refreshToken = getCookie('refreshToken');
          if (refreshToken) {
            console.log('🔄 Frontend refreshing token...');
            const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            
            // Update cookies
            setCookie('accessToken', accessToken, 15); // 15 minutes
            setCookie('refreshToken', newRefreshToken, 12 * 24 * 60); // 12 days
            
            console.log('✅ Token refreshed successfully');
            
            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          console.error('❌ Token refresh failed:', refreshError);
          clearAllCookies();
          window.location.href = '/accounts/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();
      
      return refreshPromise;
    }
    
    return Promise.reject(error);
  }
);

// ✅ Banner API functions
export const bannerAPI = {
  // Get all active banners
  getBanners: async () => {
    try {
      const response = await api.get('/banners');
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  // Create new banner (admin only)
  createBanner: async (bannerData) => {
    try {
      const response = await api.post('/banners', bannerData);
      return response.data;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  },

  // Update banner (admin only)
  updateBanner: async (id, bannerData) => {
    try {
      const response = await api.put(`/banners/${id}`, bannerData);
      return response.data;
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  // Delete banner (admin only)
  deleteBanner: async (id) => {
    try {
      const response = await api.delete(`/banners/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  }
};