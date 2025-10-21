import React, { useState, useEffect, useCallback } from 'react';
import { FaUserTag, FaChevronLeft, FaCheck, FaTimes, FaQuestion } from 'react-icons/fa';
import Input from '../../components/ui/Input';
import { apiClient } from '../../api';
import { signupUtils, MILESTONES } from '../../utils/signupUtils';

const UsernameMilestone = ({ onNext, onDataChange, onPrev }) => {
  const [formData, setFormData] = useState({
    username: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // 'available', 'taken', 'invalid', null
  const [allUsers, setAllUsers] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = signupUtils.getSignupData();
    setFormData({
      username: savedData.username || ''
    });
  }, []);

  // Fetch all users for real-time checking
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/users/allusers');
        if (response.data && Array.isArray(response.data?.data?.users)) {
          setAllUsers(response.data?.data?.users);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const updatedData = signupUtils.updateSignupData(formData);
    onDataChange && onDataChange(updatedData);
  }, [formData, onDataChange]);

  // Debounced username validation
  const checkUsernameAvailability = useCallback(
    debounce((username) => {
      if (!username || username.length < 3) {
        setUsernameStatus(null);
        return;
      }

      setCheckingAvailability(true);
      
      // Check against local users list first for instant feedback
      const isUsernameTaken = allUsers.some(
        user => user.username && user.username.toLowerCase() === username.toLowerCase()
      );

      setTimeout(() => {
        if (isUsernameTaken) {
          setUsernameStatus('taken');
        } else if (isValidUsername(username)) {
          setUsernameStatus('available');
        } else {
          setUsernameStatus('invalid');
        }
        setCheckingAvailability(false);
      }, 500); // Small delay to show checking state
    }, 300),
    [allUsers]
  );

  // Username validation rules
  const isValidUsername = (username) => {
    // Username should be 3-24 characters, alphanumeric + underscore, start with letter
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,24}$/;
    return usernameRegex.test(username);
  };

  const handleInputChange = (field, value) => {
    // Convert to lowercase and remove spaces
    const cleanValue = value.toLowerCase().replace(/\s/g, '');
    
    setFormData(prev => ({
      ...prev,
      [field]: cleanValue
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Check username availability
    if (field === 'username') {
      setUsernameStatus(null);
      checkUsernameAvailability(cleanValue);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 24) {
      newErrors.username = 'Username must be less than 24 characters';
    } else if (!isValidUsername(formData.username)) {
      newErrors.username = 'Username must start with a letter and contain only letters, numbers, and underscores';
    } else if (usernameStatus === 'taken') {
      newErrors.username = 'This username is already taken';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && usernameStatus === 'available') {
      onNext(MILESTONES.PASSWORD);
    }
  };

  const handleBack = () => {
    onPrev && onPrev(MILESTONES.VERIFICATION);
  };

  // Generate username suggestions
  const generateSuggestions = () => {
    const savedData = signupUtils.getSignupData();
    const firstName = savedData.firstname || '';
    const lastName = savedData.lastname || '';
    
    const suggestions = [];
    if (firstName && lastName) {
      suggestions.push(
        `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}${lastName.toLowerCase()}123`,
        `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`
      );
    }
    
    return suggestions.filter(suggestion => 
      isValidUsername(suggestion) && 
      !allUsers.some(user => user.username && user.username.toLowerCase() === suggestion.toLowerCase())
    ).slice(0, 3);
  };

  const isFormValid = formData.username.trim() && usernameStatus === 'available' && !loading;

  const renderUsernameStatus = () => {
    if (checkingAvailability) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (usernameStatus === 'available') {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <FaCheck className="w-5 h-5 text-green-500" />
        </div>
      );
    }

    if (usernameStatus === 'taken') {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <FaTimes className="w-5 h-5 text-red-500" />
        </div>
      );
    }

    if (usernameStatus === 'invalid') {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <FaTimes className="w-5 h-5 text-orange-500" />
        </div>
      );
    }

    return (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <FaQuestion className="w-5 h-5 text-gray-400" />
      </div>
    );
  };

  const suggestions = generateSuggestions();

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
          <FaUserTag className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Pick a username
        </h2>
        <p className="text-gray-600 text-sm">
          This is how fellow believers will find and recognize you.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Input with Status Icon */}
        <div className="relative">
          <Input
            placeholder="Enter username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            error={errors.username}
            icon={FaUserTag}
            required
            className="pr-12"
          />
          {renderUsernameStatus()}
        </div>

        {/* URL Preview */}
        {formData.username && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Your username will be part of your profile URL:{' '}
              <span className="font-medium text-primary-500">
                ao1-community/{formData.username}
              </span>
            </p>
          </div>
        )}

        {/* Username Status Messages */}
        {usernameStatus === 'available' && (
          <div className="text-center text-green-600 text-sm font-medium">
            ✓ Username is available!
          </div>
        )}

        {usernameStatus === 'taken' && (
          <div className="text-center text-red-600 text-sm">
            This username is already taken. Try another one.
          </div>
        )}

        {/* Username Suggestions */}
        {suggestions.length > 0 && (usernameStatus === 'taken' || !formData.username) && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">Suggestions:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleInputChange('username', suggestion)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:shadow-md transition-all duration-200"
            disabled={loading}
          >
            <FaChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            type="submit"
            disabled={!isFormValid}
            className={`
              flex-1 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
              ${isFormValid
                ? 'bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
              }
            `}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default UsernameMilestone;