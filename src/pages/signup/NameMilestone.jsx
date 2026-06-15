import React, { useState, useEffect } from 'react';
import { FaRegUser  } from 'react-icons/fa';
import Input from '../../components/ui/Input';
import { signupUtils, MILESTONES } from '../../utils/signupUtils';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import { apiClient } from '../../api';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../store/userSlice';

const NameMilestone = ({ onNext, onDataChange }) => {
  const [formData, setFormData] = useState(() => {
    const savedData = signupUtils.getSignupData();
    return {
      firstname: savedData.firstname || '',
      lastname: savedData.lastname || ''
    };
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const response = await apiClient.post('/users/google-login', {
        access_token: tokenResponse.access_token
      });
      
      if (response.data.status === 'success') {
        const { user } = response.data.data;
        dispatch(setUser(user));
        
        const pendingInvite = localStorage.getItem('pendingInvite');
        if (pendingInvite) {
          navigate(`/invite/${pendingInvite}`);
        } else {
          const target = user?.role === 'admin' ? '/dashboard' : '/';
          navigate(target, { replace: true });
        }
      } else {
        throw new Error(response.data?.message || 'Google Signup failed');
      }
    } catch (err) {
      console.error('Google signup error:', err);
      let errorMessage = 'Google Signup failed. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setSubmitError('Google Signup was cancelled or failed.')
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    const updatedData = signupUtils.updateSignupData(formData);
    onDataChange && onDataChange(updatedData);
  }, [formData, onDataChange]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    } else if (formData.firstname.length < 2) {
      newErrors.firstname = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    } else if (formData.lastname.length < 2) {
      newErrors.lastname = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(MILESTONES.CONTACT);
    }
  };

  const isFormValid = formData.firstname.trim() && formData.lastname.trim();

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-22 h-22 bg-primary-500 rounded-full mb-4">
          <FaRegUser  className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          Who's joining the community?
        </h2>
        <p className="text-text-primary text-sm">
          Share your name to start connecting with our 
          <br />
          community of believers.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          className="rounded-4xl"
          placeholder="First Name"
          value={formData.firstname}
          onChange={(e) => handleInputChange('firstname', e.target.value)}
          error={errors.firstname}
          required
        />

        <Input
          className="rounded-4xl"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={(e) => handleInputChange('lastname', e.target.value)}
          error={errors.lastname}
          required
        />
{/* Google Signup Button */}
        <div className="my-5">
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300" />
            <div className="mx-4 text-sm text-gray-500 whitespace-nowrap">or Continue with</div>
            <div className="flex-1 border-t border-gray-300" />
          </div>
          
          <div className="flex justify-center">
            <button
              type="button"
              className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => googleLogin()}
              disabled={loading}
            >
              <FcGoogle className="w-6 h-6" />
            </button>
          </div>
          
          {submitError && (
            <div className="text-red-500 text-sm text-center mt-4">
              {submitError}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
            ${isFormValid && !loading
              ? 'shadow-lg bg-primary-500 hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed opacity-60 text-gray-700'
            }
          `}
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>

        
      </form>

    </div>
  );
};

export default NameMilestone;