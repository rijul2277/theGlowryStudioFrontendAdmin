'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderDetails, cancelOrder } from '../../../Redux/Actions/orderActions';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import Image from 'next/image';
import Link from 'next/link';

const BROWN = "#7A5C49";
const CREAM = "#F6EFE7";

const OrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const orderId = params.orderId;
  
  // Redux state
  const { 
    orderDetails, 
    loadingOrderDetails, 
    orderDetailsError,
    cancellingOrder 
  } = useSelector(state => state.order);
  
  // Local state
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch order details on component mount
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
  }, [dispatch, orderId]);

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    
    setCancellingOrderId(orderId);
    try {
      await dispatch(cancelOrder(orderId, cancelReason))
      setShowCancelModal(false);
      setCancelReason('');
      // Optionally redirect back to orders page
      router.push('/orders');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order: ' + error.message);
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reserved: 'bg-blue-100 text-blue-800 border-blue-200',
      payment_pending: 'bg-orange-100 text-orange-800 border-orange-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      expired: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      authorized: 'bg-blue-100 text-blue-800 border-blue-200',
      captured: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-purple-100 text-purple-800 border-purple-200',
      partial_refund: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Loading state
  if (loadingOrderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-4 mx-auto mb-6" style={{ borderTopColor: BROWN }}></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Order Details</h2>
          <p className="text-gray-600">Please wait while we fetch your order information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (orderDetailsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">{orderDetailsError}</p>
          <div className="space-y-4">
            <button
              onClick={() => dispatch(fetchOrderDetails(orderId))}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/orders')}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No order details
  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/orders')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600">Order #{orderDetails.orderNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(orderDetails.status)}`}>
                {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1).replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusBadgeColor(orderDetails.paymentStatus)}`}>
                {orderDetails.paymentStatus.charAt(0).toUpperCase() + orderDetails.paymentStatus.slice(1).replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {item.product?.mainImageUrl ? (
                          <Image
                            src={item.product.mainImageUrl}
                            alt={item.title}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.product?.description}</p>
                        
                        {item.variant?.attributes && (
                          <div className="flex items-center space-x-4 mb-2">
                            {item.variant.attributes.size && (
                              <span className="text-sm text-gray-500">
                                Size: <span className="font-medium text-gray-900">{item.variant.attributes.size}</span>
                              </span>
                            )}
                            {item.variant.attributes.color && (
                              <span className="text-sm text-gray-500">
                                Color: <span className="font-medium text-gray-900">{item.variant.attributes.color}</span>
                              </span>
                            )}
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-500">SKU: {item.variantSku}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(item.price)}
                        </p>
                        <p className="text-sm text-gray-500">× {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          Total: {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {orderDetails.shippingAddress && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="text-gray-700">
                    <p className="text-lg font-medium text-gray-900 mb-2">{orderDetails.shippingAddress.fullName}</p>
                    <p className="text-gray-600 mb-1">{orderDetails.shippingAddress.line1}</p>
                    {orderDetails.shippingAddress.line2 && (
                      <p className="text-gray-600 mb-1">{orderDetails.shippingAddress.line2}</p>
                    )}
                    <p className="text-gray-600 mb-1">
                      {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postalCode}
                    </p>
                    <p className="text-gray-600 mb-3">{orderDetails.shippingAddress.country}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <span>{orderDetails.shippingAddress.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Address */}
            {orderDetails.billingAddress && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="text-gray-700">
                    <p className="text-lg font-medium text-gray-900 mb-2">{orderDetails.billingAddress.fullName}</p>
                    <p className="text-gray-600 mb-1">{orderDetails.billingAddress.line1}</p>
                    {orderDetails.billingAddress.line2 && (
                      <p className="text-gray-600 mb-1">{orderDetails.billingAddress.line2}</p>
                    )}
                    <p className="text-gray-600 mb-1">
                      {orderDetails.billingAddress.city}, {orderDetails.billingAddress.state} {orderDetails.billingAddress.postalCode}
                    </p>
                    <p className="text-gray-600 mb-3">{orderDetails.billingAddress.country}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <span>{orderDetails.billingAddress.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(orderDetails.subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">{formatCurrency(orderDetails.shippingFee)}</span>
                </div>
                
                {orderDetails.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-{formatCurrency(orderDetails.discount)}</span>
                  </div>
                )}
                
                {orderDetails.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">{formatCurrency(orderDetails.tax)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span style={{ color: BROWN }}>{formatCurrency(orderDetails.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Order Information</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="text-sm font-medium text-gray-900">{orderDetails.orderNumber}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(orderDetails.createdAt)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Currency</p>
                  <p className="text-sm font-medium text-gray-900">{orderDetails.currency}</p>
                </div>
                
                {orderDetails.payment?.method && (
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{orderDetails.payment.method}</p>
                  </div>
                )}
                
                {orderDetails.payment?.bank && (
                  <div>
                    <p className="text-sm text-gray-500">Bank</p>
                    <p className="text-sm font-medium text-gray-900">{orderDetails.payment.bank}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {['pending', 'reserved', 'payment_pending', 'paid'].includes(orderDetails.status) && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancellingOrderId === orderId}
                  className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {cancellingOrderId === orderId ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
              
              <Link
                href="/orders"
                className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center block"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for cancelling this order:</p>
            
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows="3"
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || cancellingOrderId === orderId}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancellingOrderId === orderId ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
