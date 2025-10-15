import axios from 'axios';

const API_URL =  'http://localhost:4000/api/v1';

export async function handleOAuthCallback(userData) {
  console.log('Handling OAuth callback for:', userData);
  
  try {
    // Try to send user data to backend
    const response = await axios.post(`${API_URL}/auth/oauth/callback`, userData, {
      timeout: 5000, // 5 second timeout
    });

    console.log('Backend OAuth callback successful:', response.data);
    return {
      success: true,
      tokens: response.data,
      user: response.data.user
    };
  } catch (error) {
    console.error('Backend OAuth callback failed:', error);
    
    // If backend is not available, create a local user session
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
}

export function createMockUserSession(userData) {
  console.log('Creating mock user session for:', userData);
  
  const mockUser = {
    id: userData.id || `oauth_${userData.provider}_${Date.now()}`,
    email: userData.email,
    name: userData.name,
    avatarUrl: userData.avatarUrl,
    provider: userData.provider,
    isEmailVerified: true, // OAuth emails are pre-verified
    isPhoneVerified: false,
  };

  const mockTokens = {
    accessToken: `oauth_${userData.provider}_${Date.now()}`,
    refreshToken: `oauth_refresh_${userData.provider}_${Date.now()}`,
  };

  return {
    user: mockUser,
    ...mockTokens
  };
}
