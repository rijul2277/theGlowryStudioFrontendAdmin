'use client';

import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../Redux/Actions/authAction';

export default function LogoutDebug() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  const handleTestLogout = async () => {
    console.log('=== LOGOUT DEBUG START ===');
    console.log('Current auth state:', { isAuthenticated, user, isLoading });
    console.log('Current cookies:', document.cookie);
    console.log('Current localStorage:', Object.keys(localStorage));
    console.log('Current sessionStorage:', Object.keys(sessionStorage));
    
    try {
      await dispatch(logoutUser());
      console.log('Logout dispatch completed');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Check state after logout
    setTimeout(() => {
      console.log('Auth state after logout:', { isAuthenticated, user, isLoading });
      console.log('Cookies after logout:', document.cookie);
      console.log('localStorage after logout:', Object.keys(localStorage));
      console.log('sessionStorage after logout:', Object.keys(sessionStorage));
      console.log('=== LOGOUT DEBUG END ===');
    }, 1000);
  };

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="p-4 border border-red-500 bg-red-50 m-4">
      <h3 className="font-bold text-red-800">Logout Debug Panel</h3>
      <p className="text-sm text-red-700">User: {user?.name || user?.email || 'Unknown'}</p>
      <p className="text-sm text-red-700">Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <button
        onClick={handleTestLogout}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Test Logout
      </button>
    </div>
  );
}
