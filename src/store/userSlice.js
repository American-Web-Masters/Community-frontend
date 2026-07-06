import { createSlice } from '@reduxjs/toolkit';

// Simplified user slice that relies on cookies instead of localStorage
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    isLoggedIn: false,
    token: localStorage.getItem('token') || null
  },
  reducers: {
    setUser: (state, action) => {
      // Handle both { user, token } payload and just user payload
      const payload = action.payload;
      const user = payload.user || payload;
      const token = payload.token;

      state.user = user;
      state.isLoggedIn = true;
      if (token) {
        state.token = token;
        localStorage.setItem('token', token);
      }
      console.log('User authenticated:', user);
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.token = null;
      localStorage.removeItem('token');
      console.log('User logged out');
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        console.log('User data updated:', state.user);
      }
    }
  },
});

// Export actions
export const { setUser, clearUser, updateUser } = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectIsLoggedIn = (state) => state.user.isLoggedIn;
export const selectToken = (state) => state.user.token;
export const selectUserId = (state) => state.user.user?._id;

// Export reducer
export default userSlice.reducer;