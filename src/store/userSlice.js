import { createSlice } from '@reduxjs/toolkit';

// Helper functions for localStorage
const loadUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('authenticatedUser');
    
    if (userData) {
      const user = JSON.parse(userData);
      console.log('Loaded user from storage:', user);
      
      return {
        user: user,
        isLoggedIn: true
      };
    }
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('authenticatedUser');
  }
  
  console.log('No authenticated user found in storage');
  return {
    user: null,
    isLoggedIn: false
  };
};

const saveUserToStorage = (user) => {
  try {
    localStorage.setItem('authenticatedUser', JSON.stringify(user));
    console.log('User saved to localStorage');
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

const clearUserFromStorage = () => {
  try {
    localStorage.removeItem('authenticatedUser');
    console.log('User data cleared from localStorage');
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
      const user = action.payload;
      state.user = user;
      state.isLoggedIn = true;
      
      // Save to localStorage for persistence
      saveUserToStorage(user);
      
      console.log('User authenticated and saved:', user);
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      
      // Clear from localStorage
      clearUserFromStorage();
      
      console.log('User logged out and cleared from storage');
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        saveUserToStorage(state.user);
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