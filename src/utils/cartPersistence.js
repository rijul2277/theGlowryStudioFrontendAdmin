// Cart persistence utility to handle cart state across sessions
import { getGuestCart, saveGuestCart } from '../Redux/Reducers/cartReducer';

const CART_PERSISTENCE_KEY = 'cart_persistence_data';
const CART_LAST_SYNC_KEY = 'cart_last_sync';

// Save cart persistence data
export const saveCartPersistenceData = (cartData, userId = null) => {
  try {
    const persistenceData = {
      cartData,
      userId,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    localStorage.setItem(CART_PERSISTENCE_KEY, JSON.stringify(persistenceData));
    localStorage.setItem(CART_LAST_SYNC_KEY, Date.now().toString());
    
    console.log('Cart persistence data saved:', persistenceData);
  } catch (error) {
    console.error('Error saving cart persistence data:', error);
  }
};

// Get cart persistence data
export const getCartPersistenceData = () => {
  try {
    const data = localStorage.getItem(CART_PERSISTENCE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cart persistence data:', error);
    return null;
  }
};

// Clear cart persistence data
export const clearCartPersistenceData = () => {
  try {
    localStorage.removeItem(CART_PERSISTENCE_KEY);
    localStorage.removeItem(CART_LAST_SYNC_KEY);
    console.log('Cart persistence data cleared');
  } catch (error) {
    console.error('Error clearing cart persistence data:', error);
  }
};

// Check if cart data is stale (older than 10 minutes)
export const isCartDataStale = () => {
  try {
    const lastSync = localStorage.getItem(CART_LAST_SYNC_KEY);
    if (!lastSync) return true;
    
    const lastSyncTime = parseInt(lastSync);
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    return (now - lastSyncTime) > tenMinutes;
  } catch (error) {
    console.error('Error checking cart staleness:', error);
    return true;
  }
};

// Get fallback cart data (from localStorage guest cart)
export const getFallbackCartData = () => {
  try {
    const guestCart = getGuestCart();
    if (guestCart && guestCart.items && guestCart.items.length > 0) {
      return {
        items: guestCart.items,
        count: guestCart.count || 0,
        total: guestCart.total || 0
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting fallback cart data:', error);
    return null;
  }
};

// Merge cart data with fallback
export const mergeCartWithFallback = (apiCartData, fallbackCartData) => {
  try {
    // If API cart has items, use it
    if (apiCartData && apiCartData.items && apiCartData.items.length > 0) {
      return apiCartData;
    }
    
    // If API cart is empty but fallback has items, use fallback
    if (fallbackCartData && fallbackCartData.items && fallbackCartData.items.length > 0) {
      console.log('Using fallback cart data:', fallbackCartData);
      return fallbackCartData;
    }
    
    // Return empty cart
    return { items: [], count: 0, total: 0 };
  } catch (error) {
    console.error('Error merging cart data:', error);
    return { items: [], count: 0, total: 0 };
  }
};

// Enhanced cart fetch with fallback
export const fetchCartWithFallback = async (fetchCartAction, dispatch) => {
  try {
    console.log('Fetching cart with fallback mechanism...');
    
    // First, try to get the cart from API
    const result = await dispatch(fetchCartAction);
    
    // Check if the result is a rejected action or has no payload
    const isRejected = result && result.type && result.type.endsWith('/rejected');
    const hasEmptyPayload = result && result.payload && (!result.payload.items || result.payload.items.length === 0);
    const hasNoPayload = !result || !result.payload;
    
    // If API call failed or returned empty cart, try fallback
    if (isRejected || hasEmptyPayload || hasNoPayload) {
      console.log('API cart is empty or failed, trying fallback...');
      const fallbackData = getFallbackCartData();
      
      if (fallbackData) {
        console.log('Using fallback cart data:', fallbackData);
        // Dispatch a custom action to set the fallback cart data
        dispatch({
          type: 'cart/setFallbackCart',
          payload: fallbackData
        });
        return fallbackData;
      }
    }
    
    // Return the API result payload if it exists and has items
    return result && result.payload ? result.payload : { items: [], count: 0, total: 0 };
  } catch (error) {
    console.error('Error in fetchCartWithFallback:', error);
    
    // Try fallback on error
    const fallbackData = getFallbackCartData();
    if (fallbackData) {
      dispatch({
        type: 'cart/setFallbackCart',
        payload: fallbackData
      });
      return fallbackData;
    }
    
    return { items: [], count: 0, total: 0 };
  }
};
