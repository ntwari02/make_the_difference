import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { ENV } from '../config/environment';
import authSlice from './auth/authSlice';
import dealerSlice from '../../modules/dealer/store/dealerSlice';
import buyerSlice from '../../modules/buyer/store/buyerSlice';
import instructorSlice from '../../modules/instructor/store/instructorSlice';

// Configure the store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    dealer: dealerSlice,
    buyer: buyerSlice,
    instructor: instructorSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: ENV.ENABLE_REDUX_DEVTOOLS && ENV.IS_DEVELOPMENT,
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store
export default store;
