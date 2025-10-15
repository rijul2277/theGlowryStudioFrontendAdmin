import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { handleOAuthCallback, createMockUserSession } from './oauth-handler';
import { getEmailOtpSession } from './email-session-handler';

const API_URL = 'http://localhost:4000';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ,
    }),
  ],
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('NextAuth signIn event:', { user, account, profile, isNewUser });
    },
    async signOut({ token, session }) {
      console.log('NextAuth signOut event:', { token, session });
    },
    async error({ error, message }) {
      console.error('NextAuth error event:', { error, message });
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('OAuth signIn callback triggered:', { user, account, profile });
      
      try {
        // For now, let's allow the sign-in to proceed without backend call
        // We'll handle the backend integration in the session callback
        console.log('OAuth signIn successful for:', user.email);
        return true;
      } catch (error) {
        console.error('OAuth callback error:', error);
        // Don't block the sign-in, let it proceed
        return true;
      }
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback triggered:', { token, user, account });
      
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account && user) {
        console.log('Creating JWT token for user:', user.email);
        return {
          ...token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          },
          provider: account.provider,
          providerId: account.providerAccountId,
        };
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback triggered:', { session, token });
      
      // Check for email OTP session first
      if (typeof window !== 'undefined') {
        const emailOtpSession = getEmailOtpSession();
        if (emailOtpSession) {
          console.log('Email OTP session found, using it');
          return {
            user: emailOtpSession.user,
            expires: emailOtpSession.expires,
            provider: emailOtpSession.provider,
            providerId: emailOtpSession.providerId,
            accessToken: emailOtpSession.accessToken,
            refreshToken: emailOtpSession.refreshToken,
          };
        }
      }
      
      // Handle OAuth sessions
      if (token.user && token.provider) {
        // Send properties to the client
        session.user = token.user;
        session.provider = token.provider;
        session.providerId = token.providerId;
        
        // Try to get tokens from backend if available
        try {
          console.log('Attempting to get tokens from backend for:', token.user.email);
          
          const result = await handleOAuthCallback({
            provider: token.provider,
            id: token.providerId,
            email: token.user.email,
            name: token.user.name,
            avatarUrl: token.user.image,
          });

          if (result.success) {
            session.accessToken = result.tokens.accessToken;
            session.refreshToken = result.tokens.refreshToken;
            console.log('Backend tokens received successfully');
          } else {
            console.log('Backend unavailable, using fallback session');
            const mockSession = createMockUserSession({
              provider: token.provider,
              id: token.providerId,
              email: token.user.email,
              name: token.user.name,
              avatarUrl: token.user.image,
            });
            session.accessToken = mockSession.accessToken;
            session.refreshToken = mockSession.refreshToken;
          }
        } catch (error) {
          console.error('Failed to handle OAuth callback:', error);
          // Use fallback session
          const mockSession = createMockUserSession({
            provider: token.provider,
            id: token.providerId,
            email: token.user.email,
            name: token.user.name,
            avatarUrl: token.user.image,
          });
          session.accessToken = mockSession.accessToken;
          session.refreshToken = mockSession.refreshToken;
        }
      }
      
      return session;
    },
  },
  pages: {
    signIn: '/accounts/login',
    error: '/accounts/error',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
