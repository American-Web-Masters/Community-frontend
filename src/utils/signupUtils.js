// Utility functions for signup flow management

export const STORAGE_KEYS = {
  SIGNUP_DATA: 'signupData',
  SIGNUP_PROGRESS: 'signupProgress'
};

export const MILESTONES = {
  NAME: 'name',
  CONTACT: 'contact',
  VERIFICATION: 'verification',
  USERNAME: 'username',
  PASSWORD: 'password',
  REVIEW: 'review'
};

// LocalStorage utilities
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SIGNUP_DATA);
      localStorage.removeItem(STORAGE_KEYS.SIGNUP_PROGRESS);
    } catch (error) {
      console.error('Error clearing signup data from localStorage:', error);
    }
  }
};

// Signup data utilities
export const signupUtils = {
  getSignupData: () => storage.get(STORAGE_KEYS.SIGNUP_DATA) || {},
  
  updateSignupData: (newData) => {
    const existingData = signupUtils.getSignupData();
    const updatedData = { ...existingData, ...newData };
    storage.set(STORAGE_KEYS.SIGNUP_DATA, updatedData);
    return updatedData;
  },

  getProgress: () => storage.get(STORAGE_KEYS.SIGNUP_PROGRESS) || {
    currentMilestone: MILESTONES.NAME,
    completedMilestones: []
  },

  updateProgress: (currentMilestone, completedMilestones) => {
    const progressData = { currentMilestone, completedMilestones };
    storage.set(STORAGE_KEYS.SIGNUP_PROGRESS, progressData);
    return progressData;
  },

  resetSignup: () => {
    storage.clear();
  },

  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone: (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  },

  isValidPassword: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
};