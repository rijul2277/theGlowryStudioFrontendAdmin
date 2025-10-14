'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { openCashfreeCheckout, loadCashfreeSDK } from '../../utils/cashfree';

const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSessionId, setPaymentSessionId] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      setError('Payment session ID is missing');
      setLoading(false);
      return;
    }

    setPaymentSessionId(sessionId);
    initializePayment(sessionId);
  }, [searchParams]);

  const initializePayment = async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      // Load Cashfree SDK
      await loadCashfreeSDK();
      
      // Initialize and open checkout
      await openCashfreeCheckout(sessionId, 'sandbox');
      
    } catch (error) {
      console.error('Payment initialization error:', error);
      setError(error.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (paymentSessionId) {
      initializePayment(paymentSessionId);
    }
  };

  const handleCancel = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Initializing Payment Gateway
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your payment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Initialization Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleCancel}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This should not be reached as the checkout should open
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Gateway
        </h2>
        <p className="text-gray-600">
          If you're seeing this, the payment gateway should have opened in a new window.
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
