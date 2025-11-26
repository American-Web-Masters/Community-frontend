import React, { useState, useEffect } from 'react';
import { FaLock, FaChevronLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { RiQuestionMark } from "react-icons/ri";
import Input from '../../components/ui/Input';
import { signupUtils, MILESTONES, calculatePasswordStrength } from '../../utils/signupUtils';

const PasswordMilestone = ({ onNext, onDataChange, onPrev }) => {
  const [formData, setFormData] = useState({
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Weak',
    color: '#FF6B6B'
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = signupUtils.getSignupData();
    setFormData({
      password: savedData.password || ''
    });
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const updatedData = signupUtils.updateSignupData(formData);
    onDataChange && onDataChange(updatedData);
  }, [formData, onDataChange]);

  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({
        score: 0,
        label: 'Weak',
        color: '#FF6B6B'
      });
    }
  }, [formData.password]);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!signupUtils.isValidPassword(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, lowercase letter, number, and special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && passwordStrength.score >= 50) { // Require at least medium strength
      setLoading(true);
      // Simulate loading
      setTimeout(() => {
        setLoading(false);
        onNext(MILESTONES.REVIEW);
      }, 500);
    }
  };

  const handleBack = () => {
    onPrev && onPrev(MILESTONES.USERNAME);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid = formData.password.trim() && 
                     formData.password.length >= 8 && 
                     passwordStrength.score >= 50 && 
                     !loading;

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
          <FaLock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Create a secure password
        </h2>
        <p className="text-gray-600 text-sm">
          Your password helps keep your account safe.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password Input with Show/Hide Toggle and Question Mark */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              icon={FaLock}
              required
              className="pr-12 !rounded-3xl"
            />
            {/* Show/Hide Password Button */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              tabIndex={-1}
            >
              {showPassword ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Help Icon in White Circle */}
          <div className="relative group flex-shrink-0">
            <div className="w-14 h-14 bg-white border-gray-300 border-4 rounded-full flex items-center justify-center cursor-help shadow-sm">
              <RiQuestionMark className="w-6 h-6 text-black rounded-full" />
            </div>
            <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="font-medium mb-1">Password must contain:</div>
              <ul className="space-y-1">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter (A-Z)</li>
                <li>• One lowercase letter (a-z)</li>
                <li>• One number (0-9)</li>
                <li>• One special character (@$!%*?&)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Password Requirements Text */}
        <div className="text-start">
          <p className="text-sm text-gray-600">
            Minimum of 8 characters in length
          </p>
        </div>

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Password Strength
              </span>
              <span 
                className="text-sm font-medium"
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.label}
              </span>
            </div>
            
            {/* Strength Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${passwordStrength.score}%`,
                  backgroundColor: passwordStrength.color
                }}
              />
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
              flex-1 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 relative
              ${isFormValid
                ? 'bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordMilestone;