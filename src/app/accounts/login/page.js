'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuthSync } from '../../../hooks/useAuthSync';
import { 
  startPhoneOtp, 
  verifyPhoneOtp, 
  startSmsOtp,
  verifySmsOtp,
  startEmailOtp, 
  verifyEmailOtp,
  loginWithEmail,
  clearAuthError 
} from '../../../Redux/Actions/authAction';
import { loginSuccess } from '../../../Redux/Reducers/authReducer';
import ProtectedRoute from '../../../Components/ProtectedRoute';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error, session } = useAuthSync();

  const [loginMethod, setLoginMethod] = useState('sms'); // 'sms', 'phone', 'email', 'password', 'google', 'facebook'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle NextAuth session - redirect only, session sync is handled by useAuthSync
  useEffect(() => {
    if (session?.user && isAuthenticated) {
      console.log('OAuth session detected and user is authenticated, redirecting to home');
      router.push('/');
    }
  }, [session, isAuthenticated]);


  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handlePhoneOtpStart = async (e) => {
    e.preventDefault();
    if (!phone) return;

    try {
      await dispatch(startPhoneOtp(phone));
      setOtpSent(true);
      setCountdown(60);
    } catch (error) {
      console.error('OTP send failed:', error);
    }
  };

  const handlePhoneOtpVerify = async (e) => {
    e.preventDefault();
    if (!phone || !otp) return;

    try {
      await dispatch(verifyPhoneOtp(phone, otp));
      router.push('/');
    } catch (error) {
      console.error('OTP verify failed:', error);
    }
  };

  const handleSmsOtpStart = async (e) => {
    e.preventDefault();
    if (!phone) return;

    try {
      await dispatch(startSmsOtp(phone));
      setOtpSent(true);
      setCountdown(60);
    } catch (error) {
      console.error('SMS OTP send failed:', error);
    }
  };

  const handleSmsOtpVerify = async (e) => {
    e.preventDefault();
    if (!phone || !otp) return;

    try {
      await dispatch(verifySmsOtp(phone, otp));
      router.push('/');
    } catch (error) {
      console.error('SMS OTP verify failed:', error);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const handleFacebookLogin = () => {
    signIn('facebook', { callbackUrl: '/' });
  };

  const handleEmailOtpStart = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const result = await dispatch(startEmailOtp(email));
      if (result && result.success) {
        // Redirect to verification page with email
        router.push(`/accounts/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error('Email OTP send failed:', error);
    }
  };


  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await dispatch(loginWithEmail(email, password));
      router.push('/');
    } catch (error) {
      console.error('Email/Password login failed:', error);
    }
  };

  const handleResendOtp = async () => {
    if (loginMethod === 'phone') {
      await handlePhoneOtpStart({ preventDefault: () => {} });
    } else if (loginMethod === 'sms') {
      await handleSmsOtpStart({ preventDefault: () => {} });
    }
  };

  // Show loading while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your preferred login method
          </p>
        </div>

        {/* Login Method Selector */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setLoginMethod('sms')}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              loginMethod === 'sms'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            SMS OTP
          </button>
          <button
            onClick={() => setLoginMethod('email')}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              loginMethod === 'email'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Email OTP
          </button>
          <button
            onClick={() => setLoginMethod('phone')}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              loginMethod === 'phone'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Phone OTP
          </button>
          <button
            onClick={() => setLoginMethod('password')}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              loginMethod === 'password'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Password
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* SMS OTP Form */}
        {loginMethod === 'sms' && (
          <form className="space-y-6">
            {!otpSent ? (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your phone number (e.g., +91 9876543210)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>
                <button
                  onClick={handleSmsOtpStart}
                  disabled={isLoading || !phone}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Sending SMS...' : 'Send SMS OTP'}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Enter SMS OTP
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    SMS OTP sent to {phone}
                  </p>
                </div>
                <button
                  onClick={handleSmsOtpVerify}
                  disabled={isLoading || !otp}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify SMS OTP'}
                </button>
                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={countdown > 0}
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                  >
                    {countdown > 0 ? `Resend SMS OTP in ${countdown}s` : 'Resend SMS OTP'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Phone OTP Form */}
        {loginMethod === 'phone' && (
          <form className="space-y-6">
            {!otpSent ? (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>
                <button
                  onClick={handlePhoneOtpStart}
                  disabled={isLoading || !phone}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    OTP sent to {phone}
                  </p>
                </div>
                <button
                  onClick={handlePhoneOtpVerify}
                  disabled={isLoading || !otp}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={countdown > 0}
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Email OTP Form */}
        {loginMethod === 'email' && (
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
            <button
              onClick={handleEmailOtpStart}
              disabled={isLoading || !email}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending OTP...' : 'Send Email OTP'}
            </button>
            <p className="text-sm text-gray-600 text-center">
              We'll send a verification code to your email address
            </p>
          </form>
        )}

        {/* Email/Password Form */}
        {loginMethod === 'password' && (
          <form className="space-y-6" onSubmit={handleEmailPasswordLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  // TODO: Implement forgot password
                  alert('Forgot password functionality coming soon!');
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        )}

        {/* OAuth Buttons */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="ml-2">Google</span>
            </button>

            <button
              onClick={handleFacebookLogin}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="ml-2">Facebook</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/accounts/register')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
