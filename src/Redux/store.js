import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './Reducers/authReducer';
import productReducer from "./Reducers/catalogReducer"
import cartReducer from "./Reducers/cartReducer"
import wishlistReducer from "./Reducers/wishlistReducer"
import orderReducer from "./Reducers/orderReducer"

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    catalog : productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);









