import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const useRedirect = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectTo = useCallback(async (url, options = {}) => {
    const { 
      fallbackUrl = '/', 
      method = 'auto', // 'auto', 'router', 'window', 'replace'
      timeout = 5000 
    } = options;

    console.log('Redirecting to:', url, 'Method:', method);
    setIsRedirecting(true);

    try {
      let redirectPromise;

      switch (method) {
        case 'router':
          redirectPromise = router.push(url);
          break;
        case 'window':
          redirectPromise = new Promise((resolve) => {
            window.location.href = url;
            resolve();
          });
          break;
        case 'replace':
          redirectPromise = new Promise((resolve) => {
            window.location.replace(url);
            resolve();
          });
          break;
        case 'auto':
        default:
          // Try router first, fallback to window
          try {
            redirectPromise = router.push(url);
          } catch (routerError) {
            console.warn('Router.push failed, using window.location:', routerError);
            redirectPromise = new Promise((resolve) => {
              window.location.href = url;
              resolve();
            });
          }
          break;
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Redirect timeout')), timeout);
      });

      await Promise.race([redirectPromise, timeoutPromise]);
      console.log('Redirect successful');

    } catch (error) {
      console.error('Redirect failed:', error);
      setIsRedirecting(false);
      
      // Try fallback
      if (fallbackUrl && fallbackUrl !== url) {
        console.log('Trying fallback redirect to:', fallbackUrl);
        try {
          window.location.href = fallbackUrl;
        } catch (fallbackError) {
          console.error('Fallback redirect also failed:', fallbackError);
          throw new Error('All redirect methods failed');
        }
      } else {
        throw error;
      }
    }
  }, [router]);

  const redirectWithRetry = useCallback(async (url, options = {}) => {
    const { maxRetries = 3, retryDelay = 1000 } = options;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await redirectTo(url, options);
        return; // Success
      } catch (error) {
        console.warn(`Redirect attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error; // Final attempt failed
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }, [redirectTo]);

  return {
    redirectTo,
    redirectWithRetry,
    isRedirecting,
    setIsRedirecting
  };
};
