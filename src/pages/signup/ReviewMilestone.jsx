import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaUser, FaEnvelope, FaUserTag } from 'react-icons/fa';
import { apiClient } from '../../api';
import { signupUtils, MILESTONES } from '../../utils/signupUtils';
import { setUser } from '../../store/userSlice';

const ReviewMilestone = ({ onNext, onDataChange, onPrev }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    fullname: '',
    email: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedData = signupUtils.getSignupData();
    
    const loadedData = {
      firstname: savedData.firstname || '',
      lastname: savedData.lastname || '',
      fullname: `${savedData.firstname || ''} ${savedData.lastname || ''}`.trim(),
      email: savedData.email || savedData.phone || '',
      username: savedData.username || ''
    };
    setFormData(loadedData);
  }, []);

  const validateForm = () => {
    return formData.firstname.trim() && 
           formData.lastname.trim() && 
           formData.username.trim() && 
           formData.email.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please complete all previous steps before joining the community.');
      return;
    }

    setLoading(true);
    
    try {
      // Get the stored userId and password from localStorage
      const savedData = signupUtils.getSignupData();
      const storedUserId = localStorage.getItem('registrationUserId') || savedData.userId;
      
      if (!storedUserId) {
        throw new Error('User ID not found. Please restart the registration process.');
      }

      if (!savedData.password) {
        throw new Error('Password not found. Please complete the password step.');
      }

      // Make API call to complete registration
      const response = await apiClient.post('/users/register/phase3/complete', {
        userId: storedUserId,
        username: formData.username,
        password: savedData.password
      });

      if (response.data && response.data.status === 'success') {
        const userData = response.data.data.user;
        
        // Save user data to Redux store (cookies are automatically handled)
        dispatch(setUser(userData));
        
        // Clear registration data from localStorage
        signupUtils.resetSignup();
        localStorage.removeItem('registrationUserId');
        
        
      } else {
        throw new Error(response.data?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field, icon, prefix = '') => {
    return (
      <div className="relative">
        <div className={`
          flex items-center px-4 py-4 
          bg-white/80 backdrop-blur-sm 
          border border-white/30 rounded-xl 
          text-gray-800 transition-all duration-200 shadow-sm
          ${field === 'email' ? 'opacity-80' : ''}
        `}>
          <div className="flex items-center text-gray-400 mr-3">
            {React.createElement(icon, { className: "h-5 w-5" })}
          </div>
          <span className="flex-1">{prefix}{formData[field] || 'Not provided'}</span>
        </div>
      </div>
    );
  };

  const isFormValid = validateForm() && !loading;

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
          <FaCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Almost done!
        </h2>
        <p className="text-gray-600 text-sm">
          Make sure everything looks right before you join the community.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name (First + Last) */}
        {renderField('fullname', FaUser)}

        {/* Email */}
        {renderField('email', FaEnvelope)}

        {/* Username */}
        {renderField('username', FaUserTag, '@')}

        {/* Join Button - Full Width */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 relative
              ${isFormValid
                ? 'bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Joining...
              </div>
            ) : (
              'Join the community'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewMilestone;