import React, { useState, useEffect } from 'react';
import { FaPhone, FaEnvelope, FaChevronLeft } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import Input from '../../components/ui/Input';
import { apiClient } from '../../api';
import { signupUtils, MILESTONES } from '../../utils/signupUtils';

const ContactMilestone = ({ onNext, onDataChange, onPrev }) => {
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    contactMethod: 'phone' // 'phone' or 'email'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = signupUtils.getSignupData();
    setFormData({
      phone: savedData.phone || '',
      email: savedData.email || '',
      contactMethod: savedData.contactMethod || 'phone'
    });
  }, []);

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

  const toggleContactMethod = (method) => {
    setFormData(prev => ({
      ...prev,
      contactMethod: method,
      // Clear the other field when switching
      ...(method === 'phone' ? { email: '' } : { phone: '' })
    }));
    setErrors({}); // Clear all errors when switching
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.contactMethod === 'phone') {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!signupUtils.isValidPhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!signupUtils.isValidEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Get all signup data for Phase 1 API call
      const savedData = signupUtils.getSignupData();
      
      // Prepare payload for Phase 1 API
      const payload = {
        firstname: savedData.firstname,
        lastname: savedData.lastname,
      };

      // Add contact method
      if (formData.contactMethod === 'phone') {
        payload.phone = formData.phone;
      } else {
        payload.email = formData.email;
      }

      // Call Phase 1 API
      const response = await apiClient.post('/users/register/phase1', payload);

      if (response.data.status === 'success') {
        // Save userId and registration phase to localStorage
        const updatedData = signupUtils.updateSignupData({
          userId: response.data.data.userId,
          registrationPhase: 1,
          contactMethod: response.data.data.contactMethod
        });
        
        // Also store userId separately for easy access during final registration
        localStorage.setItem('registrationUserId', response.data.data.userId);
        
        onDataChange && onDataChange(updatedData);

        // Move to verification milestone
        onNext(MILESTONES.VERIFICATION);
      }
    } catch (err) {
      console.error('Phase 1 registration error:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    onPrev && onPrev(MILESTONES.NAME);
  };

  const isFormValid = formData.contactMethod === 'phone' 
    ? formData.phone.trim() 
    : formData.email.trim();

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
          {formData.contactMethod === 'phone' ? (
            <FaPhone className="w-8 h-8 text-white" />
          ) : (
            <FaEnvelope className="w-8 h-8 text-white" />
          )}
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          How can we connect?
        </h2>
        <p className="text-gray-600 text-sm">
          Choose your preferred contact method.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Method Input with Toggle */}
        <div className="flex items-center justify-center gap-1">
          {formData.contactMethod === 'phone' ? (
            <Input
              className="!rounded-3xl"
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={errors.phone}
              icon={FaPhone}
              required
            />
          ) : (
            <Input
              className=" !rounded-3xl"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              icon={FaEnvelope}
              required
            />
          )}

        <button
            type="button"
            onClick={() => toggleContactMethod(formData.contactMethod === 'phone' ? 'email' : 'phone')}
            className="cursor-pointer p-3.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors duration-200"
          >
            {formData.contactMethod === 'phone' ? (
              <FaEnvelope className="w-6 h-6" />
            ) : (
              <FaPhone className="w-6 h-6" />
            )}
        </button>

    </div>



        {/* Or Continue With */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 text-gray-500">or Continue with</span>
          </div>
        </div>

        {/* OAuth Options */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            type="button"
            className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:shadow-md transition-shadow duration-200"
            onClick={() => {/* TODO: Implement Google OAuth */}}
          >
            <FcGoogle className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:shadow-md transition-shadow duration-200"
            onClick={() => {/* TODO: Implement Apple OAuth */}}
          >
            <FaApple className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="text-red-500 text-sm text-center mb-4">
            {errors.submit}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
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
            disabled={!isFormValid || loading}
            className={`
              flex-1 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
              ${isFormValid && !loading
                ? 'bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
              }
            `}
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactMilestone;