# OAuth Setup Guide - Fixing redirect_uri_mismatch Error

## Problem
You're getting `Error 400: redirect_uri_mismatch` when trying to sign in with Google OAuth.

## Root Cause
The redirect URI in your Google Console doesn't match the URL your application is running on.

## Solution Steps

### 1. Update Google Console Configuration

Go to [Google Cloud Console](https://console.cloud.google.com/):
1. Navigate to "APIs & Services" → "Credentials"
2. Find your OAuth 2.0 Client ID
3. Update the following settings:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://theglowrystudiofrontendadmin.onrender.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
https://theglowrystudiofrontendadmin.onrender.com/api/auth/callback/google
```

### 2. Environment Configuration

Create a `.env.local` file in your project root with:

```env
# NextAuth Configuration (REQUIRED)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth Configuration (REQUIRED)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Facebook OAuth Configuration (REQUIRED)
FACEBOOK_CLIENT_ID=your_facebook_client_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Production Environment

For production deployment, update your environment variables:

```env
NEXTAUTH_URL=https://theglowrystudiofrontendadmin.onrender.com
NEXT_PUBLIC_API_URL=https://theglowrystudiofrontendadmin.onrender.com/api/v1
```

### 4. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

### 5. Test the Configuration

1. Restart your development server
2. Clear browser cache
3. Try signing in with Google

## Common Issues & Solutions

### Issue: Still getting redirect_uri_mismatch
**Solution:** Make sure both localhost and production URLs are added to Google Console

### Issue: OAuth works locally but not in production
**Solution:** Ensure production URL is added to Google Console and NEXTAUTH_URL is set correctly

### Issue: Environment variables not loading
**Solution:** Restart your development server after adding environment variables

## Verification Checklist

- [ ] Google Console has both localhost and production URLs
- [ ] NEXTAUTH_URL is set correctly in environment
- [ ] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- [ ] NEXTAUTH_SECRET is generated and set
- [ ] Development server restarted
- [ ] Browser cache cleared

## Next Steps

1. Copy the example environment file: `cp env.local.example .env.local`
2. Fill in your actual Google OAuth credentials
3. Generate and set NEXTAUTH_SECRET
4. Update Google Console with both URLs
5. Test the OAuth flow
