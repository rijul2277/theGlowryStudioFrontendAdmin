'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function OAuthDebug() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('Starting Google sign in...');
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: false 
      });
      console.log('Google sign in result:', result);
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('Starting Facebook sign in...');
      const result = await signIn('facebook', { 
        callbackUrl: '/',
        redirect: false 
      });
      console.log('Facebook sign in result:', result);
    } catch (error) {
      console.error('Facebook sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out...');
      await signOut({ redirect: false });
      console.log('Sign out completed');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="p-4 border border-blue-500 bg-blue-50 m-4">
      <h3 className="font-bold text-blue-800">OAuth Debug Panel</h3>
      
      <div className="mt-4 space-y-2">
        <p className="text-sm">
          <strong>Status:</strong> {status}
        </p>
        
        {session ? (
          <div>
            <p className="text-sm">
              <strong>User:</strong> {session.user?.name || session.user?.email}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {session.user?.email}
            </p>
            <p className="text-sm">
              <strong>Provider:</strong> {session.provider || 'Unknown'}
            </p>
            <p className="text-sm">
              <strong>Has Access Token:</strong> {session.accessToken ? 'Yes' : 'No'}
            </p>
            <p className="text-sm">
              <strong>Has Refresh Token:</strong> {session.refreshToken ? 'Yes' : 'No'}
            </p>
          </div>
        ) : (
          <p className="text-sm">No active session</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Test Google Sign In'}
        </button>
        
        <button
          onClick={handleFacebookSignIn}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Test Facebook Sign In'}
        </button>
        
        {session && (
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Sign Out
          </button>
        )}
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-sm">Session Data:</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
