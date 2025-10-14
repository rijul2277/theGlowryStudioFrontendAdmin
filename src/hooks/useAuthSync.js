import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmailOtpSession } from '../lib/email-session-handler';
import { mergeGuestCartOnLogin, fetchCart, clearCartState, resetCartFetchTracking } from '../Redux/Reducers/cartReducer';
import { fetchCartWithFallback, saveCartPersistenceData, clearCartPersistenceData } from '../utils/cartPersistence';

export function useAuthSync() {
  const { data: session, status: sessionStatus } = useSession();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // ✅ FIX: Single source of truth for cart fetching
  const cartFetchedRef = useRef(false);
  const cartFetchInProgressRef = useRef(false);
  const processedSessionRef = useRef(null);
  const cartMergeDoneRef = useRef(false);

  // ✅ DISABLED: Cart fetching moved to Navbar for better control
  const fetchCartOnce = useCallback(async () => {
    console.log('Cart fetching is now handled by Navbar component');
    return;
  }, []);

  // ✅ FIX: Single effect for session handling
  useEffect(() => {
    console.log('useAuthSync: Session status changed:', sessionStatus, session);
    
    const emailOtpSession = getEmailOtpSession();
    const isCurrentlyAuthenticated = isAuthenticated || sessionStatus === 'authenticated' || !!emailOtpSession;
    
    if (isCurrentlyAuthenticated) {
      // Handle email OTP session
      if (emailOtpSession && !isAuthenticated) {
        console.log('useAuthSync: Email OTP session detected, syncing with Redux');
        
        // Store tokens in cookies
        document.cookie = `accessToken=${emailOtpSession.accessToken}; path=/; max-age=900; secure; samesite=lax`;
        document.cookie = `refreshToken=${emailOtpSession.refreshToken}; path=/; max-age=1036800; secure; samesite=lax`;
        
        // Update Redux state
        dispatch({
          type: 'auth/loginSuccess',
          payload: {
            user: emailOtpSession.user,
            accessToken: emailOtpSession.accessToken,
            refreshToken: emailOtpSession.refreshToken
          }
        });
        
        // Merge cart once
        if (!cartMergeDoneRef.current) {
          cartMergeDoneRef.current = true;
          setTimeout(() => {
            dispatch(mergeGuestCartOnLogin());
          }, 100);
        }
        
        // Fetch cart once
        setTimeout(() => {
          fetchCartOnce();
        }, 200);
        
        return;
      }
      
      // Handle OAuth session
      if (sessionStatus === 'authenticated' && session?.user) {
        const sessionId = `${session.user.email}_${session.user.id}_${session.expires}`;
        
        if (processedSessionRef.current !== sessionId) {
          console.log('useAuthSync: Processing new session:', sessionId);
          processedSessionRef.current = sessionId;
          
          if (!isAuthenticated || (user && user.email !== session.user.email)) {
            console.log('useAuthSync: Updating Redux state with OAuth session');
            
            const accessToken = session.accessToken || `oauth_${session.user.id}_${Date.now()}`;
            const refreshToken = session.refreshToken || `oauth_refresh_${session.user.id}_${Date.now()}`;
            
            document.cookie = `accessToken=${accessToken}; path=/; max-age=900; secure; samesite=lax`;
            document.cookie = `refreshToken=${refreshToken}; path=/; max-age=1036800; secure; samesite=lax`;
            
            dispatch({
              type: 'auth/loginSuccess',
              payload: {
                user: session.user,
                accessToken,
                refreshToken
              }
            });
            
            // Merge cart once
            if (!cartMergeDoneRef.current) {
              cartMergeDoneRef.current = true;
              setTimeout(() => {
                dispatch(mergeGuestCartOnLogin());
              }, 100);
            }
            
            // Fetch cart once
            setTimeout(() => {
              fetchCartOnce();
            }, 200);
          }
        }
      }
    } else if (sessionStatus === 'unauthenticated' && isAuthenticated && !emailOtpSession) {
      console.log('useAuthSync: Session lost, clearing Redux state');
      
      // Reset tracking on logout
      processedSessionRef.current = null;
      cartMergeDoneRef.current = false;
      cartFetchedRef.current = false;
      cartFetchInProgressRef.current = false;
      
      // Clear cart state on logout
      dispatch(clearCartState());
      clearCartPersistenceData();
      
      dispatch({
        type: 'auth/logout'
      });
    }
  }, [session, sessionStatus, isAuthenticated, user?.email, fetchCartOnce]);

  // ✅ DISABLED: Periodic cart refresh moved to Navbar for better control
  useEffect(() => {
    console.log('Periodic cart refresh is now handled by Navbar component');
  }, [isAuthenticated, sessionStatus, dispatch, user?.id]);

  // ✅ DISABLED: Page visibility refresh moved to Navbar for better control
  useEffect(() => {
    console.log('Page visibility cart refresh is now handled by Navbar component');
  }, [isAuthenticated, sessionStatus, dispatch, user?.id]);

  // Check for email OTP session
  const emailOtpSession = getEmailOtpSession();
  
  return {
    isAuthenticated: isAuthenticated || sessionStatus === 'authenticated' || !!emailOtpSession,
    user: user || session?.user || emailOtpSession?.user,
    isLoading: sessionStatus === 'loading',
    session: session || emailOtpSession
  };
}