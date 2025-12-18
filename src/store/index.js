import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice.js';

// Simple store setup
const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Make store globally accessible for API client error handling
window.__REDUX_STORE__ = store;

export default store;