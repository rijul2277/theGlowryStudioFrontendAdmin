'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders, fetchOrderDetails, cancelOrder } from '../../Redux/Actions/orderActions';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { api } from '@/lib/api';

const OrdersPage = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    orders, 
    loadingOrders, 
    ordersError, 
    ordersPagination,
    cancellingOrder 
  } = useSelector(state => state.order);
  
  // Local state
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    page: 1,
    limit: 10
  });
  
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [refundingOrderId, setRefundingOrderId] = useState(null);

  // Fetch orders on component mount and when filters change
  useEffect(() => {
    dispatch(fetchOrders(filters));
  }, [dispatch, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  // Handle order details - navigate to order details page
  const handleViewOrderDetails = (orderId) => {
    window.location.href = `/order/${orderId}`;
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId, reason) => {
    if (!reason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    
    setCancellingOrderId(orderId);
    try {
      await dispatch(cancelOrder(orderId, reason))
      // Refresh orders list
      dispatch(fetchOrders(filters));
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order: ' + error.message);
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Handle refund request
  const handleRefundRequest = async (orderId, reason, amount) => {
    if (!reason.trim()) {
      alert('Please provide a reason for refund');
      return;
    }
    
    setRefundingOrderId(orderId);
    try {
      const response = await api.post(`/orders/${orderId}/refund-request`, {
        reason,
        amount
      });

      if (response.data.success) {
        alert('Refund request submitted successfully!');
        // Refresh orders list
        dispatch(fetchOrders(filters));
      } else {
        alert('Failed to submit refund request: ' + response.data.message);
      }
    } catch (error) {
      console.error('Failed to submit refund request:', error);
      alert('Failed to submit refund request: ' + (error.response?.data?.message || error.message));
    } finally {
      setRefundingOrderId(null);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reserved: 'bg-blue-100 text-blue-800',
      payment_pending: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      authorized: 'bg-blue-100 text-blue-800',
      captured: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
      partial_refund: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get refund status badge color
  const getRefundStatusBadgeColor = (status) => {
    const colors = {
      none: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h1>
          <p className="text-gray-600 mb-6">{ordersError}</p>
          <button
            onClick={() => dispatch(fetchOrders(filters))}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reserved">Reserved</option>
                  <option value="payment_pending">Payment Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Payment Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="authorized">Authorized</option>
                  <option value="captured">Captured</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items Per Page
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white shadow-sm rounded-lg">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeColor(order.paymentStatus)}`}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                          {order.refundRequest && order.refundRequest.status !== 'none' && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRefundStatusBadgeColor(order.refundRequest.status)}`}>
                              Refund: {order.refundRequest.status.replace('_', ' ').charAt(0).toUpperCase() + order.refundRequest.status.replace('_', ' ').slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center space-x-6">
                          <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-lg font-medium text-gray-900">{formatCurrency(order.total)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Items</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          
                          {order.shippingAddress && (
                            <div>
                              <p className="text-sm text-gray-500">Shipping to</p>
                              <p className="text-sm font-medium text-gray-900">
                                {order.shippingAddress.city}, {order.shippingAddress.state}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrderDetails(order._id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                      >
                        View Details
                      </button>
                      
                      {['pending', 'reserved', 'payment_pending', 'paid'].includes(order.status) && (
                        <button
                          onClick={() => {
                            const reason = prompt('Please provide a reason for cancellation:');
                            if (reason) {
                              handleCancelOrder(order._id, reason);
                            }
                          }}
                          disabled={cancellingOrderId === order._id}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                      
                      {/* Refund Request Button */}
                      {['paid', 'shipped', 'completed'].includes(order.status) && 
                       (!order.refundRequest || order.refundRequest.status === 'none') && (
                        <button
                          onClick={() => {
                            const reason = prompt('Please provide a reason for refund:');
                            if (reason) {
                              const amount = prompt('Enter refund amount (leave empty for full refund):');
                              const refundAmount = amount ? parseFloat(amount) : null;
                              if (refundAmount === null || (refundAmount > 0 && refundAmount <= order.total)) {
                                handleRefundRequest(order._id, reason, refundAmount);
                              } else {
                                alert('Invalid refund amount');
                              }
                            }
                          }}
                          disabled={refundingOrderId === order._id}
                          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {refundingOrderId === order._id ? 'Submitting...' : 'Request Refund'}
                        </button>
                      )}
                      
                      {/* Show refund status if refund request exists */}
                      {order.refundRequest && order.refundRequest.status !== 'none' && (
                        <span className="text-sm text-gray-600">
                          Refund: {order.refundRequest.status.replace('_', ' ').charAt(0).toUpperCase() + order.refundRequest.status.replace('_', ' ').slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {ordersPagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, ordersPagination.total)} of {ordersPagination.total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: ordersPagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium ${
                    page === filters.page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === ordersPagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


export default OrdersPage;



