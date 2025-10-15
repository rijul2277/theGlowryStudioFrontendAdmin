import { api } from '../../lib/api'; // ✅ Use centralized API instance
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateTokens,
  clearError,
  clearLoading
} from '../Reducers/authReducer';
import { clearEmailOtpSession } from '../../lib/email-session-handler';

const API_URL =  'https://theglowrystudiobackend-2.onrender.com/api/v1';

// ✅ REMOVED: Duplicate axios instance and interceptors
// Now using the centralized 'api' instance from lib/api.js to prevent duplicate token refresh calls

// Cookie utilities
function setCookie(name, value, maxAgeMinutes) {
  const maxAge = maxAgeMinutes * 60;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; secure; samesite=lax`;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Phone OTP Actions
export const startPhoneOtp = (phone) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post('/auth/phone/start', { phone });
    
    // Clear loading state after successful OTP send
    dispatch(clearLoading());
    
    return response.data;
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Failed to send OTP'));
    throw error;
  }
};

export const verifyPhoneOtp = (phone, otp) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post('/auth/phone/verify', { phone, otp });  
    
    const { accessToken, refreshToken, user } = response.data;
    
    // Store tokens in cookies
    setCookie('accessToken', accessToken, 15); // 15 minutes
    setCookie('refreshToken', refreshToken, 12 * 24 * 60); // 12 days
    
    dispatch(loginSuccess({ user, accessToken, refreshToken }));
    return response.data;
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Invalid OTP'));
    throw error;
  }
};

// SMS OTP Actions
export const startSmsOtp = (phone) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post('/auth/sms/start', { phone });
    
    // Clear loading state after successful OTP send
    dispatch(clearLoading());
    
    return response.data;
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Failed to send SMS OTP'));
    throw error;
  }
};

export const verifySmsOtp = (phone, otp) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post('/auth/sms/verify', { phone, otp });
    
    const { accessToken, refreshToken, user } = response.data;
    
    // Store tokens in cookies
    setCookie('accessToken', accessToken, 15); // 15 minutes
    setCookie('refreshToken', refreshToken, 12 * 24 * 60); // 12 days
    
    dispatch(loginSuccess({ user, accessToken, refreshToken }));
    return response.data;
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Invalid SMS OTP'));
    throw error;
  }
};

// Email OTP Actions
export const startEmailOtp = (email) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post('/auth/email/start', { email });
    
    // Clear loading state after successful OTP send
    dispatch(clearLoading());
    
    return response.data;
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Failed to send OTP'));
    throw error;
  }
};

export const verifyEmailOtp = (email, otp) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post('/auth/email/verify', { email, otp });
    
    const { accessToken, refreshToken, user } = response.data;
    
    // Store tokens in cookies
    setCookie('accessToken', accessToken, 15); // 15 minutes
    setCookie('refreshToken', refreshToken, 12 * 24 * 60); // 12 days
    
    dispatch(loginSuccess({ user, accessToken, refreshToken }));
    return response.data;
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Invalid OTP'));
    throw error;
  }
};

// Email/Password Actions
export const registerWithEmail = (email, password, name) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Registration failed'));
    throw error;
  }
};

export const loginWithEmail = (email, password) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post('/auth/login', { email, password });
    
    const { accessToken, refreshToken, user } = response.data;
    
    // Store tokens in cookies
    setCookie('accessToken', accessToken, 15); // 15 minutes
    setCookie('refreshToken', refreshToken, 12 * 24 * 60); // 12 days
    
    dispatch(loginSuccess({ user, accessToken, refreshToken }));
    return response.data;
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
    throw error;
  }
};

// Password Reset Actions
export const sendPasswordResetEmail = (email) => async (dispatch) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Failed to send reset email'));
    throw error;
  }
};

export const resetPassword = (email, resetToken, newPassword) => async (dispatch) => {
  try {
    const response = await api.post('/auth/reset-password', { 
      email, 
      resetToken, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Password reset failed'));
    throw error;
  }
};

export const changePassword = (currentPassword, newPassword) => async (dispatch) => {
  try {
    const response = await api.post('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Password change failed'));
    throw error;
  }
};

// Token Management
export const refreshTokens = () => async (dispatch, getState) => {
  try {
    const refreshToken = getCookie('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    // Update cookies
    setCookie('accessToken', accessToken, 15); // 15 minutes
    setCookie('refreshToken', newRefreshToken, 12 * 24 * 60); // 12 days
    
    dispatch(updateTokens({ accessToken, refreshToken: newRefreshToken }));
    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    dispatch(logout());
    throw error;
  }
};

// Get current user profile
export const getCurrentUser = () => async (dispatch) => {
  try {
    const response = await api.get('/auth/me');
    const { user } = response.data;
    
    // Update user in Redux state
    dispatch(loginSuccess({ 
      user, 
      accessToken: getCookie('accessToken'),
      refreshToken: getCookie('refreshToken')
    }));
    
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

// Helper function to clear specific cookies
const clearAllCookies = () => {
  try {
    // Get all cookies
    const cookies = document.cookie.split(";");
    
    // Clear each cookie
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      if (name) {
        // Clear cookie for current domain and path
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
        
        // Clear with different security settings
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=strict`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=lax`;
      }
    });
    
    console.log('All cookies cleared successfully');
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }
};

// Helper function to clear all localStorage
const clearAllLocalStorage = () => {
  try {
    // Clear all localStorage items completely
    localStorage.clear();
    
    // Also specifically target the keys from your second image
    const specificKeysToDelete = [
      'nextauth.message',
      'persist:root'
    ];
    
    // Additional common auth keys that might exist
    const commonAuthKeys = [
      'auth', 'user', 'token', 'accessToken', 'refreshToken', 
      'authToken', 'userToken', 'session', 'login', 'authState',
      'redux-persist:auth', 'redux-persist:root',
      'nextauth.message', 'persist:root'
    ];
    
    // Remove specific keys
    specificKeysToDelete.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Remove common auth keys as backup
    commonAuthKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Force clear everything again to be absolutely sure
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// Helper function to clear all sessionStorage
const clearAllSessionStorage = () => {
  try {
    // Clear all sessionStorage items
    sessionStorage.clear();
    
    // Also try to clear specific common auth keys
    const commonAuthKeys = [
      'auth', 'user', 'token', 'accessToken', 'refreshToken', 
      'authToken', 'userToken', 'session', 'login', 'authState'
    ];
    
    commonAuthKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
};

// Logout
export const logoutUser = () => async (dispatch, getState) => {
  console.log('Starting logout process...');
  
  try {
    // First, dispatch logout to clear Redux state immediately
    dispatch(logout());
    
    // Try to logout from server
    const refreshToken = getCookie('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
        console.log('Server logout successful');
      } catch (serverError) {
        console.error('Server logout failed:', serverError);
        // Continue with local logout even if server fails
      }
    }
    
    // Also try to sign out from NextAuth if available
    try {
      if (typeof window !== 'undefined' && window.nextAuthSignOut) {
        await window.nextAuthSignOut({ redirect: false });
        console.log('NextAuth signout successful');
      }
    } catch (nextAuthError) {
      console.error('NextAuth signout failed:', nextAuthError);
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear ALL cookies
    clearAllCookies();
    
    // Clear ALL localStorage
    clearAllLocalStorage();
    
    // Clear ALL sessionStorage
    clearAllSessionStorage();
    
    // Clear email OTP session
    clearEmailOtpSession();
    
    // Clear any other potential storage mechanisms
    try {
      // Clear IndexedDB if used
      if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            indexedDB.deleteDatabase(db.name);
          });
        }).catch(console.error);
      }
      
      // Clear WebSQL if used (deprecated but still might exist)
      if ('openDatabase' in window) {
        // WebSQL is deprecated, but clear if exists
        console.log('WebSQL detected - consider migrating to IndexedDB');
      }
    } catch (error) {
      console.error('Error clearing additional storage:', error);
    }
    
    console.log('Logout process completed');
    
    // Force page reload to ensure complete cleanup
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  }
};

// Clear error
export const clearAuthError = () => (dispatch) => {
  dispatch(clearError());
};









