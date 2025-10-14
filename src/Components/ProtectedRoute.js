'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../Redux/Actions/authAction';

export default function ProtectedRoute({ children, requireAuth = true }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Only check if we have a token but no user data AND we're not already authenticated
      const accessToken = getCookie('accessToken');
      if (accessToken && !user && !isLoading && !isAuthenticated && !hasCheckedAuth.current) {
        hasCheckedAuth.current = true;
        try {
          await dispatch(getCurrentUser());
        } catch (error) {
          console.error('Failed to get current user:', error);
          hasCheckedAuth.current = false; // Reset on error
          // Token might be invalid, redirect to login
          if (requireAuth) {
            router.push('/accounts/login');
          }
        }
      }
    };

    // Only run this effect once when component mounts
    if (!hasCheckedAuth.current) {
      checkAuth();
    }
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/accounts/login');
      } else if (!requireAuth && isAuthenticated) {
        // If user is authenticated but this route doesn't require auth (like login page)
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If route requires auth but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If route doesn't require auth but user is authenticated, don't render children
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return children;
}

// Helper function to get cookie (same as in authAction.js)
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}



