import {
  CREATE_ORDER_REQUEST,
  CREATE_ORDER_SUCCESS,
  CREATE_ORDER_FAILURE,
  FETCH_ORDERS_REQUEST,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_FAILURE,
  FETCH_ORDER_DETAILS_REQUEST,
  FETCH_ORDER_DETAILS_SUCCESS,
  FETCH_ORDER_DETAILS_FAILURE,
  CANCEL_ORDER_REQUEST,
  CANCEL_ORDER_SUCCESS,
  CANCEL_ORDER_FAILURE,
  VERIFY_PAYMENT_REQUEST,
  VERIFY_PAYMENT_SUCCESS,
  VERIFY_PAYMENT_FAILURE,
  CLEAR_ORDER_ERRORS,
  RESET_ORDER_STATE
} from '../Actions/orderActions.js';

const initialState = {
  // Order creation
  creatingOrder: false,
  createOrderError: null,
  currentOrder: null,
  
  // Order listing
  orders: [],
  loadingOrders: false,
  ordersError: null,
  ordersPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  
  // Order details
  orderDetails: null,
  loadingOrderDetails: false,
  orderDetailsError: null,
  
  // Order actions
  cancellingOrder: false,
  cancelOrderError: null,
  
  // Payment verification
  verifyingPayment: false,
  verifyPaymentError: null,
  
  // General
  loading: false,
  error: null
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    // Create Order
    case CREATE_ORDER_REQUEST:
      return {
        ...state,
        creatingOrder: true,
        createOrderError: null,
        loading: true
      };

    case CREATE_ORDER_SUCCESS:
      return {
        ...state,
        creatingOrder: false,
        createOrderError: null,
        currentOrder: action.payload,
        loading: false
      };

    case CREATE_ORDER_FAILURE:
      return {
        ...state,
        creatingOrder: false,
        createOrderError: action.payload,
        loading: false
      };

    // Fetch Orders
    case FETCH_ORDERS_REQUEST:
      return {
        ...state,
        loadingOrders: true,
        ordersError: null,
        loading: true
      };

    case FETCH_ORDERS_SUCCESS:
      return {
        ...state,
        loadingOrders: false,
        ordersError: null,
        orders: action.payload.orders,
        ordersPagination: action.payload.pagination,
        loading: false
      };

    case FETCH_ORDERS_FAILURE:
      return {
        ...state,
        loadingOrders: false,
        ordersError: action.payload,
        loading: false
      };

    // Fetch Order Details
    case FETCH_ORDER_DETAILS_REQUEST:
      return {
        ...state,
        loadingOrderDetails: true,
        orderDetailsError: null,
        loading: true
      };

    case FETCH_ORDER_DETAILS_SUCCESS:
      return {
        ...state,
        loadingOrderDetails: false,
        orderDetailsError: null,
        orderDetails: action.payload,
        loading: false
      };

    case FETCH_ORDER_DETAILS_FAILURE:
      return {
        ...state,
        loadingOrderDetails: false,
        orderDetailsError: action.payload,
        loading: false
      };

    // Cancel Order
    case CANCEL_ORDER_REQUEST:
      return {
        ...state,
        cancellingOrder: true,
        cancelOrderError: null,
        loading: true
      };

    case CANCEL_ORDER_SUCCESS:
      return {
        ...state,
        cancellingOrder: false,
        cancelOrderError: null,
        // Update the order in the list
        orders: state.orders.map(order => 
          order._id === action.payload._id 
            ? { ...order, status: action.payload.status }
            : order
        ),
        // Update order details if it's the same order
        orderDetails: state.orderDetails && state.orderDetails._id === action.payload._id
          ? { ...state.orderDetails, status: action.payload.status }
          : state.orderDetails,
        loading: false
      };

    case CANCEL_ORDER_FAILURE:
      return {
        ...state,
        cancellingOrder: false,
        cancelOrderError: action.payload,
        loading: false
      };

    // Verify Payment
    case VERIFY_PAYMENT_REQUEST:
      return {
        ...state,
        verifyingPayment: true,
        verifyPaymentError: null,
        loading: true
      };

    case VERIFY_PAYMENT_SUCCESS:
      return {
        ...state,
        verifyingPayment: false,
        verifyPaymentError: null,
        // Update order details with payment status
        orderDetails: state.orderDetails
          ? { ...state.orderDetails, ...action.payload }
          : state.orderDetails,
        loading: false
      };

    case VERIFY_PAYMENT_FAILURE:
      return {
        ...state,
        verifyingPayment: false,
        verifyPaymentError: action.payload,
        loading: false
      };

    // Clear Errors
    case CLEAR_ORDER_ERRORS:
      return {
        ...state,
        createOrderError: null,
        ordersError: null,
        orderDetailsError: null,
        cancelOrderError: null,
        verifyPaymentError: null,
        error: null
      };

    // Reset State
    case RESET_ORDER_STATE:
      return {
        ...initialState
      };

    default:
      return state;
  }
};

export default orderReducer;




