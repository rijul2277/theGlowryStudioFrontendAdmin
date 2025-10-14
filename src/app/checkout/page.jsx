'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { createOrder } from '../../Redux/Actions/orderActions';
import { clearCart } from '../../Redux/Reducers/cartReducer';
// import { formatCurrency } from '../../utils/helpers';
import { formatCurrency } from '../../utils/helpers';
import { useRedirect } from '../../hooks/useRedirect';

const CheckoutPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  
  
  // Redux state
  const { items: Items, total, subtotal, shippingFee } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const { creatingOrder, createOrderError, currentOrder } = useSelector(state => state.order);

  console.log(   "Items",Items);
  
  // Form state
  const [formData, setFormData] = useState({
    // Shipping Address
    shippingFullName: '',
    shippingPhone: '',
    shippingLine1: '',
    shippingLine2: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: '',
    shippingCountry: 'IN',
    
    // Billing Address
    billingFullName: '',
    billingPhone: '',
    billingLine1: '',
    billingLine2: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'IN',
    
    // Guest Checkout
    guestEmail: '',
    guestPhone: '',
    guestFullName: '',
    createAccount: false,
    guestPassword: '',
    
    // Options
    sameAsShipping: true,
    termsAccepted: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const searchParams = useSearchParams();
  
  // Custom redirect hook
  const { redirectTo, isRedirecting: hookRedirecting } = useRedirect();

  // Robust redirect function
  const redirectToPage = async (url, fallbackUrl = '/') => {
    console.log('Attempting redirect to:', url);
    setIsRedirecting(true);
    
    try {
      // Method 1: Try router.push
      await router.push(url);
      console.log('Router.push successful');
      
      // Add a small delay to ensure navigation starts
      setTimeout(() => {
        console.log('Navigation should be in progress');
      }, 100);
      
    } catch (routerError) {
      console.warn('Router.push failed, trying window.location:', routerError);
      
      try {
        // Method 2: Use window.location.href
        window.location.href = url;
        console.log('Window.location redirect initiated');
      } catch (windowError) {
        console.error('All redirect methods failed:', windowError);
        
        // Method 3: Use window.location.replace as last resort
        try {
          window.location.replace(fallbackUrl);
          console.log('Fallback redirect to:', fallbackUrl);
        } catch (replaceError) {
          console.error('Even fallback redirect failed:', replaceError);
          // Show error to user
          setErrors({ submit: 'Redirect failed. Please navigate manually.' });
          setIsRedirecting(false);
        }
      }
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (Items && Items?.length === 0) {
      router.push('/');
    }
  }, [Items, router]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle same as shipping checkbox
  const handleSameAsShippingChange = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      sameAsShipping: isChecked,
      // Copy shipping to billing if checked
      ...(isChecked && {
        billingFullName: prev.shippingFullName,
        billingPhone: prev.shippingPhone,
        billingLine1: prev.shippingLine1,
        billingLine2: prev.shippingLine2,
        billingCity: prev.shippingCity,
        billingState: prev.shippingState,
        billingPostalCode: prev.shippingPostalCode,
        billingCountry: prev.shippingCountry
      })
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Shipping address validation
    if (!formData.shippingFullName.trim()) newErrors.shippingFullName = 'Full name is required';
    if (!formData.shippingPhone.trim()) newErrors.shippingPhone = 'Phone number is required';
    if (!formData.shippingLine1.trim()) newErrors.shippingLine1 = 'Address line 1 is required';
    if (!formData.shippingCity.trim()) newErrors.shippingCity = 'City is required';
    if (!formData.shippingState.trim()) newErrors.shippingState = 'State is required';
    if (!formData.shippingPostalCode.trim()) newErrors.shippingPostalCode = 'Postal code is required';
    
    // Billing address validation (if not same as shipping)
    if (!formData.sameAsShipping) {
      if (!formData.billingFullName.trim()) newErrors.billingFullName = 'Full name is required';
      if (!formData.billingPhone.trim()) newErrors.billingPhone = 'Phone number is required';
      if (!formData.billingLine1.trim()) newErrors.billingLine1 = 'Address line 1 is required';
      if (!formData.billingCity.trim()) newErrors.billingCity = 'City is required';
      if (!formData.billingState.trim()) newErrors.billingState = 'State is required';
      if (!formData.billingPostalCode.trim()) newErrors.billingPostalCode = 'Postal code is required';
    }
    
    // Guest checkout validation
    if (!user) {
      if (!formData.guestEmail.trim()) newErrors.guestEmail = 'Email is required';
      if (!formData.guestPhone.trim()) newErrors.guestPhone = 'Phone number is required';
      if (!formData.guestFullName.trim()) newErrors.guestFullName = 'Full name is required';
      
      if (formData.createAccount && !formData.guestPassword.trim()) {
        newErrors.guestPassword = 'Password is required for account creation';
      }
    }
    
    // Terms acceptance
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Debug: Log cart items structure
      console.log('Cart Items:', Items);
      console.log('First item structure:', Items[0]);
      
      // Prepare order data
      const orderData = {
        items: Items.map(item => {
          // Ensure we have the product ID
          const productId = item.product?._id || item.product;
          const variantSku = item.variant?.sku || item.variantSku;
          
          if (!productId) {
            throw new Error(`Product ID missing for item: ${JSON.stringify(item)}`);
          }
          if (!variantSku) {
            throw new Error(`Variant SKU missing for item: ${JSON.stringify(item)}`);
          }
          
          return {
            product: productId,
            variantSku: variantSku,
          quantity: item.quantity
          };
        }),
        shippingAddress: {
          fullName: formData.shippingFullName,
          phone: formData.shippingPhone,
          line1: formData.shippingLine1,
          line2: formData.shippingLine2,
          city: formData.shippingCity,
          state: formData.shippingState,
          postalCode: formData.shippingPostalCode,
          country: formData.shippingCountry
        },
        billingAddress: formData.sameAsShipping ? null : {
          fullName: formData.billingFullName,
          phone: formData.billingPhone,
          line1: formData.billingLine1,
          line2: formData.billingLine2,
          city: formData.billingCity,
          state: formData.billingState,
          postalCode: formData.billingPostalCode,
          country: formData.billingCountry
        },
        // Note: Backend will calculate totals from validated items for security
        // Frontend totals are for display only
        subtotal: subtotal || 0,
        shippingFee: shippingFee || 0,
        discount: 0,
        tax: 0,
        currency: 'INR',
        ...(user ? {} : {
          guestCheckout: {
            email: formData.guestEmail,
            phone: formData.guestPhone,
            fullName: formData.guestFullName,
            createAccount: formData.createAccount
          }
        })
      };
      
      // Debug: Log final order data
      console.log('Order Data being sent:', orderData);
      
      // Create order
      const response = await dispatch(createOrder(orderData));

      console.log('Response:   i got here', response);
      
      // Clear cart
      dispatch(clearCart());

      console.log("response.data.paymentSessionId", response.data.paymentSessionId);
      
      // Redirect to payment
      if (response.data.paymentSessionId) {
        // Redirect to payment page that uses Cashfree SDK
        console.log('Redirecting to payment page with sessionId:', response.data.paymentSessionId);
        
        const paymentUrl = `/payment?sessionId=${response.data.paymentSessionId}`;
        console.log('Payment URL:', paymentUrl);
        
        // Use robust redirect function with fallback to custom hook
        try {
          await redirectToPage(paymentUrl, '/checkout');
        } catch (redirectError) {
          console.warn('Primary redirect failed, trying custom hook:', redirectError);
          try {
            await redirectTo(paymentUrl, { fallbackUrl: '/checkout' });
          } catch (hookError) {
            console.error('All redirect methods failed:', hookError);
            setErrors({ submit: 'Redirect failed. Please navigate manually.' });
          }
        }
        
      } else {
        // Fallback redirect
        console.log('No paymentSessionId, redirecting to success page');
        const successUrl = `/order/success?order_id=${response.data.orderId}`;
        console.log('Success URL:', successUrl);
        
        // Use robust redirect function with fallback to custom hook
        try {
          await redirectToPage(successUrl, '/checkout');
        } catch (redirectError) {
          console.warn('Primary redirect failed, trying custom hook:', redirectError);
          try {
            await redirectTo(successUrl, { fallbackUrl: '/checkout' });
          } catch (hookError) {
            console.error('All redirect methods failed:', hookError);
            setErrors({ submit: 'Redirect failed. Please navigate manually.' });
          }
        }
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      setErrors({ submit: error.message || 'Failed to create order' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (Items && Items?.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Address */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="shippingFullName"
                      value={formData.shippingFullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.shippingFullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.shippingFullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.shippingFullName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="shippingPhone"
                      value={formData.shippingPhone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.shippingPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.shippingPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.shippingPhone}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="shippingLine1"
                      value={formData.shippingLine1}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.shippingLine1 ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Street address, P.O. box, company name, c/o"
                    />
                    {errors.shippingLine1 && (
                      <p className="text-red-500 text-sm mt-1">{errors.shippingLine1}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="shippingLine2"
                      value={formData.shippingLine2}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.shippingCity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.shippingCity && (
                      <p className="text-red-500 text-sm mt-1">{errors.shippingCity}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="shippingState"
                      value={formData.shippingState}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.shippingState ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter state"
                    />
                    {errors.shippingState && (
                      <p className="text-red-500 text-sm mt-1">{errors.shippingState}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="shippingPostalCode"
                      value={formData.shippingPostalCode}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.shippingPostalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter postal code"
                    />
                    {errors.shippingPostalCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.shippingPostalCode}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      name="shippingCountry"
                      value={formData.shippingCountry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="IN">India</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="sameAsShipping"
                    name="sameAsShipping"
                    checked={formData.sameAsShipping}
                    onChange={handleSameAsShippingChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sameAsShipping" className="ml-2 text-sm text-gray-700">
                    Billing address is the same as shipping address
                  </label>
                </div>
                
                {!formData.sameAsShipping && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="billingFullName"
                          value={formData.billingFullName}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.billingFullName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {errors.billingFullName && (
                          <p className="text-red-500 text-sm mt-1">{errors.billingFullName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="billingPhone"
                          value={formData.billingPhone}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.billingPhone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your phone number"
                        />
                        {errors.billingPhone && (
                          <p className="text-red-500 text-sm mt-1">{errors.billingPhone}</p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          name="billingLine1"
                          value={formData.billingLine1}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.billingLine1 ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Street address, P.O. box, company name, c/o"
                        />
                        {errors.billingLine1 && (
                          <p className="text-red-500 text-sm mt-1">{errors.billingLine1}</p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          name="billingLine2"
                          value={formData.billingLine2}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Apartment, suite, unit, building, floor, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.billingCity ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter city"
                        />
                        {errors.billingCity && (
                          <p className="text-red-500 text-sm mt-1">{errors.billingCity}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          name="billingState"
                          value={formData.billingState}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.billingState ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter state"
                        />
                        {errors.billingState && (
                          <p className="text-red-500 text-sm mt-1">{errors.billingState}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          name="billingPostalCode"
                          value={formData.billingPostalCode}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.billingPostalCode ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter postal code"
                        />
                        {errors.billingPostalCode && (
                          <p className="text-red-500 text-sm mt-1">{errors.billingPostalCode}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          name="billingCountry"
                          value={formData.billingCountry}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="IN">India</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Guest Checkout */}
              {!user && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Guest Checkout</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="guestEmail"
                        value={formData.guestEmail}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.guestEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                      />
                      {errors.guestEmail && (
                        <p className="text-red-500 text-sm mt-1">{errors.guestEmail}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="guestPhone"
                        value={formData.guestPhone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.guestPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your phone number"
                      />
                      {errors.guestPhone && (
                        <p className="text-red-500 text-sm mt-1">{errors.guestPhone}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="guestFullName"
                        value={formData.guestFullName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.guestFullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.guestFullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.guestFullName}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="createAccount"
                          name="createAccount"
                          checked={formData.createAccount}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="createAccount" className="ml-2 text-sm text-gray-700">
                          Create an account for future orders
                        </label>
                      </div>
                    </div>
                    
                    {formData.createAccount && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          name="guestPassword"
                          value={formData.guestPassword}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.guestPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter a password"
                        />
                        {errors.guestPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.guestPassword}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-2">
                  {Items && Items?.map((item) => (
                    <div key={`${item.product._id}-${item.variant?.sku || item.variantSku || 'default'}`} className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.product.title}</p>
                        <p className="text-sm text-gray-500">
                          {item.variant?.attributes?.size && item.variant?.attributes?.color 
                            ? `${item.variant.attributes.size} - ${item.variant.attributes.color}`
                            : item.variant?.sku || 'Standard'
                          }
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency((item.variant?.price || item.priceAtAdd || 0) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shipping</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(shippingFee)}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1 ${
                      errors.termsAccepted ? 'border-red-500' : ''
                    }`}
                  />
                  <label htmlFor="termsAccepted" className="ml-2 text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-red-500 text-sm mt-1">{errors.termsAccepted}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || creatingOrder || isRedirecting || hookRedirecting}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isRedirecting || hookRedirecting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Redirecting to Payment...
                    </>
                  ) : isSubmitting || creatingOrder ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>

              {/* Error Messages */}
              {createOrderError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{createOrderError}</p>
                </div>
              )}
              
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{errors.submit}</p>
                  {errors.submit.includes('Redirect failed') && (
                    <div className="mt-2">
                      <p className="text-sm text-red-600">Please try one of these options:</p>
                      <div className="mt-2 space-y-2">
                        <button
                          onClick={() => window.location.reload()}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                        >
                          Refresh Page
                        </button>
                        <button
                          onClick={() => router.push('/')}
                          className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 ml-2"
                        >
                          Go to Home
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;


