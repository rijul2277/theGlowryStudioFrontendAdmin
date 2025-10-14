'use client';

import { useAuthSync } from '../hooks/useAuthSync';

export default function AuthStatus() {
  const { isAuthenticated, user, isLoading, session } = useAuthSync();

  return (
    <div className="fixed top-4 right-4 bg-white p-4 border rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-lg mb-2">Auth Status</h3>
      <div className="space-y-1 text-sm">
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user?.name || user?.email || 'None'}</p>
        <p><strong>Session:</strong> {session ? 'Active' : 'Inactive'}</p>
        <p><strong>Session Status:</strong> {session ? 'authenticated' : 'unauthenticated'}</p>
      </div>
    </div>
  );
}
