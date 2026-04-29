import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appointmentReducer from './slices/appointmentSlice';
import facilityReducer from './slices/facilitySlice';
import bookingReducer from './slices/bookingSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    facility: facilityReducer,
    booking: bookingReducer
  },
});
