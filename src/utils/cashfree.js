/**
 * Cashfree SDK Loader and Utilities
 * Handles loading and initialization of Cashfree SDK
 */

// Load Cashfree SDK dynamically
export const loadCashfreeSDK = () => {
  return new Promise((resolve, reject) => {
    // Check if SDK is already loaded
    if (window.Cashfree) {
      resolve(window.Cashfree);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject(new Error('Cashfree SDK failed to load'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Cashfree SDK'));
    };

    // Add to document head
    document.head.appendChild(script);
  });
};

// Initialize Cashfree instance
export const initializeCashfree = (mode = 'sandbox') => {
  if (!window.Cashfree) {
    throw new Error('Cashfree SDK not loaded');
  }

  return new window.Cashfree({
    mode: mode // 'sandbox' or 'production'
  });
};

// Open Cashfree checkout
export const openCashfreeCheckout = async (paymentSessionId, mode = 'sandbox') => {
  try {
    // Load SDK if not already loaded
    await loadCashfreeSDK();
    
    // Initialize Cashfree
    const cashfree = initializeCashfree(mode);
    
    // Open checkout
    cashfree.checkout({
      paymentSessionId: paymentSessionId,
      redirectTarget: '_self' // Opens in the same tab
    });
    
    return true;
  } catch (error) {
    console.error('Cashfree checkout error:', error);
    throw error;
  }
};

// Check if Cashfree SDK is available
export const isCashfreeAvailable = () => {
  return typeof window !== 'undefined' && window.Cashfree;
};
