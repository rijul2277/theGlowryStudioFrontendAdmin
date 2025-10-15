import { api } from '@/lib/api';
import axios from 'axios';

// Action Types
export const CREATE_ORDER_REQUEST = 'CREATE_ORDER_REQUEST';
export const CREATE_ORDER_SUCCESS = 'CREATE_ORDER_SUCCESS';
export const CREATE_ORDER_FAILURE = 'CREATE_ORDER_FAILURE';

export const FETCH_ORDERS_REQUEST = 'FETCH_ORDERS_REQUEST';
export const FETCH_ORDERS_SUCCESS = 'FETCH_ORDERS_SUCCESS';
export const FETCH_ORDERS_FAILURE = 'FETCH_ORDERS_FAILURE';

export const FETCH_ORDER_DETAILS_REQUEST = 'FETCH_ORDER_DETAILS_REQUEST';
export const FETCH_ORDER_DETAILS_SUCCESS = 'FETCH_ORDER_DETAILS_SUCCESS';
export const FETCH_ORDER_DETAILS_FAILURE = 'FETCH_ORDER_DETAILS_FAILURE';

export const CANCEL_ORDER_REQUEST = 'CANCEL_ORDER_REQUEST';
export const CANCEL_ORDER_SUCCESS = 'CANCEL_ORDER_SUCCESS';
export const CANCEL_ORDER_FAILURE = 'CANCEL_ORDER_FAILURE';

export const VERIFY_PAYMENT_REQUEST = 'VERIFY_PAYMENT_REQUEST';
export const VERIFY_PAYMENT_SUCCESS = 'VERIFY_PAYMENT_SUCCESS';
export const VERIFY_PAYMENT_FAILURE = 'VERIFY_PAYMENT_FAILURE';

export const CLEAR_ORDER_ERRORS = 'CLEAR_ORDER_ERRORS';
export const RESET_ORDER_STATE = 'RESET_ORDER_STATE';

// API Base URL
const API_BASE_URL = 'https://theglowrystudiofrontendadmin.onrender.com/api/v1';

// Note: Authentication is handled automatically by the API interceptor
// which adds the accessToken from cookies to all requests

// Action Creators

// Create Order
export const createOrder = (orderData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_ORDER_REQUEST });

    console.log('Creating order with data:', orderData);
    console.log('Access token from cookies:', document.cookie.includes('accessToken'));

    const response = await api.post(
      `/orders/initiate`,
      orderData
    );

    console.log('Response:', response);
    alert(response.data.message);

    dispatch({
      type: CREATE_ORDER_SUCCESS,
      payload: response.data.data
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create order';
    
    dispatch({
      type: CREATE_ORDER_FAILURE,
      payload: errorMessage
    });

    throw new Error(errorMessage);
  }
};

// Fetch Orders
export const fetchOrders = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_ORDERS_REQUEST });

    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const response = await api.get(
      `/orders/user/me?${queryParams.toString()}`
    );

    dispatch({
      type: FETCH_ORDERS_SUCCESS,
      payload: response.data.data
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
    
    dispatch({
      type: FETCH_ORDERS_FAILURE,
      payload: errorMessage
    });

    throw new Error(errorMessage);
  }
};

// Fetch Order Details
export const fetchOrderDetails = (orderId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_ORDER_DETAILS_REQUEST });

    const response = await api.get(
      `/orders/${orderId}`
    );

    dispatch({
      type: FETCH_ORDER_DETAILS_SUCCESS,
      payload: response.data.data
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch order details';
    
    dispatch({
      type: FETCH_ORDER_DETAILS_FAILURE,
      payload: errorMessage
    });

    throw new Error(errorMessage);
  }
};

// Cancel Order
export const cancelOrder = (orderId, reason) => async (dispatch) => {
  try {
    dispatch({ type: CANCEL_ORDER_REQUEST });

    const response = await api.post(
      `/orders/${orderId}/cancel`,
      { reason }
    );

    dispatch({
      type: CANCEL_ORDER_SUCCESS,
      payload: response.data.data
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel order';
    
    dispatch({
      type: CANCEL_ORDER_FAILURE,
      payload: errorMessage
    });

    throw new Error(errorMessage);
  }
};

// Verify Payment
export const verifyPayment = (orderId) => async (dispatch) => {
  try {
    dispatch({ type: VERIFY_PAYMENT_REQUEST });

    const response = await api.get(
      `/orders/${orderId}/verify-payment`
    );

    dispatch({
      type: VERIFY_PAYMENT_SUCCESS,
      payload: response.data.data
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to verify payment';
    
    dispatch({
      type: VERIFY_PAYMENT_FAILURE,
      payload: errorMessage
    });

    throw new Error(errorMessage);
  }
};

// Get Payment Status
export const getPaymentStatus = (orderId) => async (dispatch) => {
  try {
    dispatch({ type: VERIFY_PAYMENT_REQUEST });

    const response = await api.get(
      `/payments/${orderId}/status`
    );

    dispatch({
      type: VERIFY_PAYMENT_SUCCESS,
      payload: response.data.data
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get payment status';
    
    dispatch({
      type: VERIFY_PAYMENT_FAILURE,
      payload: errorMessage
    });

    throw new Error(errorMessage);
  }
};

// Clear Errors
export const clearOrderErrors = () => ({
  type: CLEAR_ORDER_ERRORS
});

// Reset State
export const resetOrderState = () => ({
  type: RESET_ORDER_STATE
});


