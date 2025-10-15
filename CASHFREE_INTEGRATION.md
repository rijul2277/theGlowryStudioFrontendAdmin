# Cashfree Payment Gateway Integration

## Overview

This implementation uses the Cashfree JavaScript SDK to provide a seamless payment experience. Instead of redirecting to external URLs, the payment gateway opens within the application using the official Cashfree SDK.

## Architecture

### Frontend Flow
1. **Checkout Page** → User fills form and clicks "Proceed to Payment"
2. **Order Creation** → Backend creates order and returns `paymentSessionId`
3. **Payment Page** → Frontend redirects to `/payment?sessionId={paymentSessionId}`
4. **SDK Integration** → Payment page loads Cashfree SDK and opens checkout
5. **Payment Processing** → User completes payment on Cashfree's secure interface
6. **Return Handling** → User is redirected back to success/failure pages

### Backend Flow
1. **Order Initiation** → `/api/v1/orders/initiate` creates order with Cashfree
2. **Stock Reservation** → Items are reserved for 30 minutes
3. **Payment Session** → Cashfree returns `payment_session_id`
4. **Webhook Processing** → Cashfree sends payment status updates
5. **Order Completion** → Stock is deducted and order is confirmed

## Key Files

### Frontend Files
- **`src/app/checkout/page.jsx`** - Checkout form and order creation
- **`src/app/payment/page.jsx`** - Payment page with Cashfree SDK integration
- **`src/utils/cashfree.js`** - Cashfree SDK utilities and loader

### Backend Files
- **`src/routes/v1/order.routes.js`** - Order creation endpoint
- **`src/routes/v1/payment.routes.js`** - Webhook handling
- **`src/services/cashfree.service.js`** - Cashfree SDK integration

## Implementation Details

### 1. Cashfree SDK Loading
```javascript
// Dynamic SDK loading
export const loadCashfreeSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve(window.Cashfree);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    // ... error handling
  });
};
```

### 2. Payment Initialization
```javascript
// Initialize and open checkout
export const openCashfreeCheckout = async (paymentSessionId, mode = 'sandbox') => {
  await loadCashfreeSDK();
  const cashfree = new window.Cashfree({ mode });
  cashfree.checkout({
    paymentSessionId: paymentSessionId,
    redirectTarget: '_self'
  });
};
```

### 3. Checkout Redirect
```javascript
// Redirect to payment page instead of external URL
if (response.data.paymentSessionId) {
  router.push(`/payment?sessionId=${response.data.paymentSessionId}`);
}
```

## Environment Configuration

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
NEXT_PUBLIC_CASHFREE_ENVIRONMENT=sandbox
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_SUCCESS_URL=http://localhost:3000/order/success
NEXT_PUBLIC_FAILURE_URL=http://localhost:3000/order/failure
```

### Backend (.env)
```bash
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENVIRONMENT=sandbox
BACKEND_URL=http://localhost:4000
FRONTEND_SUCCESS_URL=http://localhost:3000/order/success
FRONTEND_FAILURE_URL=http://localhost:3000/order/failure
```

## Security Features

### 1. Backend Total Calculation
- Frontend totals are for display only
- Backend recalculates totals from validated items
- Prevents price manipulation attacks

### 2. Stock Reservation
- Items are reserved for 30 minutes
- Automatic stock release on payment failure
- Prevents overselling

### 3. Webhook Security
- Signature verification for all webhooks
- Secure payment status updates
- Audit trail for all transactions

## Error Handling

### Frontend Error States
- **Loading State** - Shows spinner while initializing payment
- **Error State** - Shows retry button and error message
- **Fallback** - Redirects to checkout if payment fails

### Backend Error Handling
- **API Failures** - Comprehensive error logging
- **Stock Issues** - Automatic stock release on errors
- **Webhook Failures** - Retry mechanism with exponential backoff

## Testing

### Sandbox Testing
1. Use sandbox credentials in environment
2. Test with Cashfree test cards
3. Verify webhook handling
4. Test error scenarios

### Production Deployment
1. Update environment variables
2. Configure production URLs
3. Set up webhook endpoints
4. Test with real payment methods

## Best Practices Implemented

✅ **Security** - Backend validates all data and calculates totals
✅ **User Experience** - Seamless payment flow with proper loading states
✅ **Error Handling** - Comprehensive error handling and retry mechanisms
✅ **Performance** - Dynamic SDK loading to reduce initial bundle size
✅ **Reliability** - Multiple fallback mechanisms and proper error recovery
✅ **Monitoring** - Comprehensive logging for debugging and monitoring

## Troubleshooting

### Common Issues
1. **SDK Loading Failed** - Check network connectivity and CDN availability
2. **Payment Session Invalid** - Verify session ID and expiry
3. **Webhook Not Received** - Check webhook URL configuration
4. **Stock Not Released** - Check webhook processing and error handling

### Debug Steps
1. Check browser console for SDK errors
2. Verify environment variables
3. Check backend logs for API errors
4. Test webhook endpoints manually
