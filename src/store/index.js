import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice.js';

// Simple store setup
const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;