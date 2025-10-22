import { createSlice } from '@reduxjs/toolkit';

// Helper functions for localStorage
const loadUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('authenticatedUser');
    const authToken = localStorage.getItem('authToken');
    
    if (userData && authToken) {
      return {
        user: JSON.parse(userData),
        isLoggedIn: true,
        token: authToken
      };
    }
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('authenticatedUser');
    localStorage.removeItem('authToken');
  }
  
  return {
    user: null,
    isLoggedIn: false,
    token: null
  };
};

const saveUserToStorage = (user, token) => {
  try {
    localStorage.setItem('authenticatedUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

const clearUserFromStorage = () => {
  try {
    localStorage.removeItem('authenticatedUser');
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error clearing user from localStorage:', error);
  }
};

// User slice with authentication persistence
const userSlice = createSlice({
  name: 'user',
  initialState: loadUserFromStorage(),
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isLoggedIn = true;
      
      // Save to localStorage for persistence
      saveUserToStorage(user, token);
      
      console.log('User authenticated and saved:', user);
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      
      // Clear from localStorage
      clearUserFromStorage();
      
      console.log('User logged out and cleared from storage');
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        saveUserToStorage(state.user, state.token);
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
export const selectAuthToken = (state) => state.user.token;

// Export reducer
export default userSlice.reducer;