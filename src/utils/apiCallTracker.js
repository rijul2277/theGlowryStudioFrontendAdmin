// Utility to track API calls and prevent duplicate requests
class ApiCallTracker {
  constructor() {
    this.activeCalls = new Set();
  }

  isCallActive(key) {
    return this.activeCalls.has(key);
  }

  startCall(key) {
    this.activeCalls.add(key);
  }

  endCall(key) {
    this.activeCalls.delete(key);
  }

  // Helper method to wrap async functions
  async trackCall(key, asyncFunction) {
    if (this.isCallActive(key)) {
      console.log(`API call ${key} already in progress, skipping...`);
      return null;
    }

    this.startCall(key);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      this.endCall(key);
    }
  }
}

// Create a singleton instance
export const apiCallTracker = new ApiCallTracker();

// Helper function to create unique keys for different API calls
export const createApiKey = (action, params = {}) => {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${action}${paramString ? `_${paramString}` : ''}`;
};
