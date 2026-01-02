import { createSlice } from '@reduxjs/toolkit';

// Simplified user slice that relies on cookies instead of localStorage
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    isLoggedIn: false
  },
  reducers: {
    setUser: (state, action) => {
      const user = action.payload;
      state.user = user;
      state.isLoggedIn = true;
      console.log('User authenticated:', user);
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
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
export const selectUserId = (state) => state.user.user?._id;

// Export reducer
export default userSlice.reducer;