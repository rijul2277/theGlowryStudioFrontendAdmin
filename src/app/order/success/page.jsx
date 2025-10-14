'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderDetails, verifyPayment } from '../../../Redux/Actions/orderActions';
import { formatCurrency, formatDate } from '../../../utils/helpers';

const OrderSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  
  // Redux state
  const { orderDetails, loadingOrderDetails, orderDetailsError } = useSelector(state => state.order);
  const { verifyingPayment, verifyPaymentError } = useSelector(state => state.order);
  
  // Local state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Get order ID from URL - handle both MongoDB ObjectId and orderNumber
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const orderNumber = searchParams.get('order_number');
  
  // Get Cashfree payment status from URL parameters
  const cfStatus = searchParams.get('cf_status');
  const cfPaymentId = searchParams.get('cf_payment_id');
  const cfOrderId = searchParams.get('cf_order_id');
  
  // Determine which identifier to use for fetching order details
  const orderIdentifier = orderId || orderNumber;

  // Handle payment status from Cashfree
  useEffect(() => {
    if (cfStatus) {
      console.log('Payment status from Cashfree:', cfStatus);
      
      if (cfStatus === 'FAILED' || cfStatus === 'CANCELLED') {
        // Show failure UI instead of redirecting
        setVerificationStatus({
          orderStatus: 'failed',
          paymentStatus: 'failed',
          cashfreeStatus: cfStatus,
          paymentDetails: {
            paymentId: cfPaymentId || paymentId,
            method: 'Unknown',
            bank: 'Cashfree',
            amount: 0,
            currency: 'INR',
            paymentTime: new Date().toISOString(),
            isCaptured: false,
            bankReference: null,
            gatewayOrderId: cfOrderId,
            gatewayPaymentId: cfPaymentId || paymentId
          }
        });
      }
    }
  }, [cfStatus, cfPaymentId, paymentId, cfOrderId]);

  // Fetch order details on component mount
  useEffect(() => {
    if (orderIdentifier) {
      dispatch(fetchOrderDetails(orderIdentifier));
    }
  }, [orderIdentifier, dispatch]);

  // Verify payment status
  const handleVerifyPayment = async () => {
    if (!orderIdentifier) return;
    
    setIsVerifying(true);
    try {
      const result = await dispatch(verifyPayment(orderIdentifier))
      setVerificationStatus(result.data);
    } catch (error) {
      console.error('Payment verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-verify payment on mount
  useEffect(() => {
    if (orderIdentifier && !verificationStatus) {
      handleVerifyPayment();
    }
  }, [orderIdentifier]);

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

  // Determine if this is a failure case
  const isPaymentFailed = cfStatus === 'FAILED' || cfStatus === 'CANCELLED' || 
                         (verificationStatus && verificationStatus.cashfreeStatus === 'FAILED');

  if (orderDetailsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find the order you're looking for.</p>
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


  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
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
        {/* Payment Result Header */}
        <div className="text-center mb-8">
          {isPaymentFailed ? (
            <>
              <div className="bg-red-50 border border-red-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
              <p className="text-lg text-gray-600">
                We're sorry, but your payment could not be processed at this time.
              </p>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-lg text-gray-600">
                Thank you for your purchase. Your order has been successfully placed.
              </p>
            </>
          )}
        </div>

         {console.log("orderDetails", orderDetails)}

     

        {/* Order Details Card */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Information</h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Order Number:</span> {orderDetails.orderNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Order Date:</span> {formatDate(orderDetails.createdAt)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                      orderDetails.orderStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {orderDetails?.orderStatus?.charAt(0).toUpperCase() + orderDetails?.orderStatus?.slice(1)}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Payment Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                      orderDetails.paymentStatus === 'captured' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {orderDetails.paymentStatus.charAt(0).toUpperCase() + orderDetails.paymentStatus.slice(1)}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Total Amount:</span> {formatCurrency(orderDetails.total)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Payment Method:</span> {orderDetails.payment?.method || 'Cashfree'}
                  </p>
                  {orderDetails.payment?.bank && (
                    <p className="text-sm">
                      <span className="font-medium">Bank:</span> {orderDetails.payment.bank}
                    </p>
                  )}
                  {orderDetails.payment?.capturedAt && (
                    <p className="text-sm">
                      <span className="font-medium">Payment Date:</span> {formatDate(orderDetails.payment.capturedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      {item.variant?.attributes?.size} - {item.variant?.attributes?.color}
                    </p>
                    <p className="text-sm text-gray-500">SKU: {item.variantSku}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total: {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
          </div>
          <div className="px-6 py-4">
            <div className="text-sm text-gray-700">
              <p className="font-medium">{orderDetails.shippingAddress.fullName}</p>
              <p>{orderDetails.shippingAddress.line1}</p>
              {orderDetails.shippingAddress.line2 && <p>{orderDetails.shippingAddress.line2}</p>}
              <p>
                {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postalCode}
              </p>
              <p>{orderDetails.shippingAddress.country}</p>
              <p className="mt-2">Phone: {orderDetails.shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(orderDetails.subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Shipping</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(orderDetails.shippingFee)}</span>
              </div>
              
              {orderDetails.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount</span>
                  <span className="text-sm font-medium text-green-600">-{formatCurrency(orderDetails.discount)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(orderDetails.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Account Creation */}
        {orderDetails.guestCheckout?.createAccount && !orderDetails.guestCheckout?.accountCreated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Account Creation</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your account is being created. You will receive an email with your login credentials shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isPaymentFailed ? (
            <>
              <button
                onClick={() => router.push(`/checkout?retry_order=${orderId}`)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Retry Payment
              </button>
              
              <button
                onClick={() => router.push('/cart')}
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
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/orders')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                View All Orders
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-50 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                </svg>
                Continue Shopping
              </button>
            </>
          )}
        </div>

        {/* Payment Failure Information */}
        {isPaymentFailed && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-900 mb-4">Payment Failed</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-red-700">Error Details</h4>
                <p className="text-sm text-red-600">
                  Status: {cfStatus || 'Unknown'} | 
                  Payment ID: {cfPaymentId || paymentId || 'N/A'}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-red-700">Common Reasons</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• Insufficient funds in your account</li>
                  <li>• Incorrect card details or CVV</li>
                  <li>• Card expired or blocked by bank</li>
                  <li>• Network connectivity issues</li>
                  <li>• Payment gateway timeout</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Payment Verification Status */}
        {verificationStatus && !isPaymentFailed && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <p className="text-sm font-medium text-gray-900">{verificationStatus.orderStatus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="text-sm font-medium text-gray-900">{verificationStatus.paymentStatus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cashfree Status</p>
                <p className="text-sm font-medium text-gray-900">{verificationStatus.cashfreeStatus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="text-sm font-medium text-gray-900">{verificationStatus.method || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessPage;


