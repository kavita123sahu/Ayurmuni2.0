import { configureStore } from '@reduxjs/toolkit';
import internetReducer from '../reduxfile/reducer/InternetReducer';
import cartReducer from './slices/cartSlice';
import homeReducer from './slices/homeSlice';

export const store = configureStore({
  reducer: {
    nointernet: internetReducer,
    cart: cartReducer,
    home: homeReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
