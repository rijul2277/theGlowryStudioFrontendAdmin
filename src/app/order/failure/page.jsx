'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderDetails } from '../../../Redux/Actions/orderActions';
import { formatCurrency, formatDate } from '../../../utils/helpers';

const OrderFailurePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  
  // Redux state
  const { orderDetails, loadingOrderDetails, orderDetailsError } = useSelector(state => state.order);
  
  // Local state
  const [retryCount, setRetryCount] = useState(0);
  const [reservationExpiry, setReservationExpiry] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  // Get parameters from URL
  const orderId = searchParams.get('order_id');
  const errorCode = searchParams.get('error_code');
  const errorMessage = searchParams.get('error_message');
  const paymentId = searchParams.get('payment_id');

  // Fetch order details on component mount
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
  }, [orderId, dispatch]);

  // Set up reservation expiry timer
  useEffect(() => {
    if (orderDetails?.stockReservation?.expiresAt) {
      const expiryTime = new Date(orderDetails.stockReservation.expiresAt);
      setReservationExpiry(expiryTime);
      
      const timer = setInterval(() => {
        const now = new Date();
        const diff = expiryTime.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeRemaining(null);
          clearInterval(timer);
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [orderDetails]);

  // Handle retry payment
  const handleRetryPayment = () => {
    setRetryCount(prev => prev + 1);
    
    // If we have an order ID, try to retry with existing order
    if (orderId) {
      // Redirect to payment retry with order ID
      router.push(`/checkout?retry_order=${orderId}&retry=${retryCount + 1}`);
    } else {
      // Fallback to new checkout
      router.push(`/checkout?retry=${retryCount + 1}`);
    }
  };

  // Handle modify order
  const handleModifyOrder = () => {
    // Redirect to cart to modify items
    router.push('/cart');
  };

  if (loadingOrderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (orderDetailsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{orderDetailsError}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Failure Header */}
        <div className="text-center mb-8">
          <div className="bg-red-50 border border-red-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-lg text-gray-600">
            We're sorry, but your payment could not be processed at this time.
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Payment Error Details</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {errorCode && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Error Code</h3>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-2 rounded">{errorCode}</p>
                </div>
              )}
              
              {errorMessage && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Error Message</h3>
                  <p className="text-sm text-gray-900">{errorMessage}</p>
                </div>
              )}
              
              {paymentId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment ID</h3>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-2 rounded">{paymentId}</p>
                </div>
              )}
              
              {orderDetails && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Information</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Order Number:</span> {orderDetails.orderNumber}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Order Date:</span> {formatDate(orderDetails.createdAt)}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Amount:</span> {formatCurrency(orderDetails.total)}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Status:</span> 
                      <span className="ml-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Common Reasons */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Common Reasons for Payment Failure</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Insufficient funds in your account
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Incorrect card details or CVV
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Card expired or blocked by bank
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Network connectivity issues
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Payment gateway timeout
            </li>
          </ul>
        </div>

        {/* Stock Reservation Status */}
        {timeRemaining && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Stock Reserved</h3>
                <p className="text-sm text-yellow-700">
                  Your items are reserved for {timeRemaining} more. 
                  Complete payment before this time to secure your order.
                </p>
              </div>
            </div>
          </div>
        )}

        {!timeRemaining && orderDetails?.stockReservation && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Stock Reservation Expired</h3>
                <p className="text-sm text-red-700">
                  Your stock reservation has expired. You'll need to create a new order.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetryPayment}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Retry Payment
          </button>
          
          <button
            onClick={handleModifyOrder}
            className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-50 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Modify Order
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
            </svg>
            Continue Shopping
          </button>
        </div>

        {/* Support Information */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Support</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Email: support@theglowrystudio.com</p>
                <p>Phone: +91 9876543210</p>
                <p>Hours: 9 AM - 6 PM (Mon-Fri)</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Issues</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Check your bank account balance</p>
                <p>• Verify card details are correct</p>
                <p>• Try a different payment method</p>
                <p>• Contact your bank if issues persist</p>
              </div>
            </div>
          </div>
        </div>

        {/* Retry Information */}
        {retryCount > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.5V7.5c0-1.833-.962-3.5-2.502-3.5H5.062c-1.54 0-2.502 1.667-2.502 3.5v9c0 1.833.962 3.5 2.502 3.5z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Retry Attempt #{retryCount}</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  If you continue to experience payment issues, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFailurePage;


