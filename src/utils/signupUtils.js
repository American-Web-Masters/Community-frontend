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


  export const calculatePasswordStrength = (password) => {
    let score = 0;
    let label = 'Weak';
    let color = '#FF6B6B'; // Red for weak

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;
    if (/[^a-zA-Z\d@$!%*?&]/.test(password)) score += 1;

    // Determine strength based on score
    if (score >= 6) {
      label = 'Strong';
      color = '#4CAF50'; // Green for strong
    } else if (score >= 4) {
      label = 'Medium';
      color = '#FF9800'; // Orange for medium
    } else if (score >= 2) {
      label = 'Fair';
      color = '#FFC107'; // Yellow for fair
    }

    // Calculate percentage (0-100)
    const percentage = Math.min((score / 6) * 100, 100);

    return {
      score: percentage,
      label,
      color
    };
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
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    // Check for valid international format: + followed by 1-15 digits
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    return phoneRegex.test(cleaned);
  },

  isValidPassword: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  calculatePasswordStrength: (password) => {
    let score = 0;
    let label = 'Weak';
    let color = '#FF6B6B'; // Red for weak

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;
    if (/[^a-zA-Z\d@$!%*?&]/.test(password)) score += 1;

    // Determine strength based on score
    if (score >= 6) {
      label = 'Strong';
      color = '#4CAF50'; // Green for strong
    } else if (score >= 4) {
      label = 'Medium';
      color = '#FF9800'; // Orange for medium
    } else if (score >= 2) {
      label = 'Fair';
      color = '#FFC107'; // Yellow for fair
    }

    // Calculate percentage (0-100)
    const percentage = Math.min((score / 6) * 100, 100);

    return {
      score: percentage,
      label,
      color
    };
  }
};