import { createSlice } from '@reduxjs/toolkit';

// User slice - simple state for logged-in user
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    isLoggedIn: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
  },
});

// Export actions
export const { setUser, clearUser } = userSlice.actions;

// Export reducer
export default userSlice.reducer;