import React from 'react';
import { useSelector } from 'react-redux';
import { getCartPersistenceData, isCartDataStale } from '../utils/cartPersistence';

const CartDebug = () => {
  const cartState = useSelector((state) => state.cart);
  const authState = useSelector((state) => state.auth);
  
  const persistenceData = getCartPersistenceData();
  const isStale = isCartDataStale();
  
  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>🛒 Cart Debug</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Auth Status:</strong> {authState.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>User:</strong> {authState.user?.email || 'None'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Cart Items:</strong> {cartState.items?.length || 0}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Cart Count:</strong> {cartState.count || 0}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Loading:</strong> {cartState.loading ? '⏳ Yes' : '✅ No'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Error:</strong> {cartState.error || 'None'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Persistence Data:</strong> {persistenceData ? '✅ Available' : '❌ None'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Data Stale:</strong> {isStale ? '⚠️ Yes' : '✅ No'}
      </div>
      
      {persistenceData && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Last Sync:</strong> {new Date(persistenceData.timestamp).toLocaleTimeString()}
        </div>
      )}
      
      <div style={{ fontSize: '10px', color: '#ccc', marginTop: '10px' }}>
        This debug panel only shows in development mode
      </div>
    </div>
  );
};

export default CartDebug;
