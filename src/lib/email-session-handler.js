// Utility to create NextAuth session for email OTP users
export function createEmailOtpSession(userData, tokens) {
  // Create a mock session object that NextAuth can understand
  const session = {
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      image: userData.avatarUrl || null,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    provider: 'email',
    providerId: userData.id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };

  return session;
}

// Function to store session data in localStorage for NextAuth
export function storeEmailOtpSession(session) {
  try {
    // Store session data that NextAuth can read
    const sessionData = {
      user: session.user,
      expires: session.expires,
      provider: session.provider,
      providerId: session.providerId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    };

    // Store in localStorage with NextAuth key format
    localStorage.setItem('nextauth.session', JSON.stringify(sessionData));
    
    // Also store in a custom key for our use
    localStorage.setItem('email-otp-session', JSON.stringify(sessionData));
    
    console.log('Email OTP session stored successfully');
    return true;
  } catch (error) {
    console.error('Failed to store email OTP session:', error);
    return false;
  }
}

// Function to get stored email OTP session
export function getEmailOtpSession() {
  try {
    const sessionData = localStorage.getItem('email-otp-session');
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  } catch (error) {
    console.error('Failed to get email OTP session:', error);
    return null;
  }
}

// Function to clear email OTP session
export function clearEmailOtpSession() {
  try {
    localStorage.removeItem('nextauth.session');
    localStorage.removeItem('email-otp-session');
    console.log('Email OTP session cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear email OTP session:', error);
    return false;
  }
}
