import React, { useState, useEffect, useRef } from 'react';
import { FaShieldAlt, FaChevronLeft, FaRedo } from 'react-icons/fa';
import { apiClient } from '../../api';
import { signupUtils, MILESTONES } from '../../utils/signupUtils';

const VerificationMilestone = ({ onNext, onDataChange, onPrev }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [userId, setUserId] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  
  const inputRefs = useRef([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = signupUtils.getSignupData();
    setUserId(savedData.userId || '');
    
    // Display contact info based on method
    if (savedData.contactMethod === 'phone') {
      setContactInfo(savedData.phone || '');
    } else {
      setContactInfo(savedData.email || '');
    }
  }, []);

  // Handle countdown for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error when user types

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Save to localStorage
    const updatedData = signupUtils.updateSignupData({ otp: newOtp.join('') });
    onDataChange && onDataChange(updatedData);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
    
    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Save to localStorage
    const updatedData = signupUtils.updateSignupData({ otp: newOtp.join('') });
    onDataChange && onDataChange(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/users/register/phase2/verify-otp', {
        userId,
        otp: otpValue
      });

      if (response.data.status === 'success') {
        // Update phase in localStorage
        const updatedData = signupUtils.updateSignupData({ 
          registrationPhase: 2,
          otpVerified: true 
        });
        onDataChange && onDataChange(updatedData);
        
        // Move to next milestone
        onNext(MILESTONES.USERNAME);
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/users/register/resend-otp', {
        userId
      });

      if (response.data.status === 'success') {
        setCountdown(60); // Start 60-second countdown
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBack = () => {
    onPrev && onPrev(MILESTONES.CONTACT);
  };

  const handleChangeContactInfo = () => {
    onPrev && onPrev(MILESTONES.CONTACT);
  };

  const isFormValid = otp.every(digit => digit !== '') && !loading;

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
          <FaShieldAlt className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Verify your {contactInfo.includes('@') ? 'email' : 'phone'}
        </h2>
        <p className="text-gray-600 text-sm">
          We'll send a one time password to your {contactInfo.includes('@') ? 'Email' : 'mobile number'}.
        </p>
      </div>

      {/* OTP Input Boxes */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-lg font-semibold bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              disabled={loading}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">
            {error}
          </div>
        )}

        {/* Resend OTP */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-sm mb-2">
            Resend code in{' '}
            <span className="inline-flex items-center gap-1">
              {countdown > 0 ? (
                <span className="font-medium text-primary-500">{countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200 flex items-center gap-1"
                >
                  <FaRedo className={`w-3 h-3 ${resendLoading ? 'animate-spin' : ''}`} />
                  Resend
                </button>
              )}
            </span>
          </p>
          <button
            type="button"
            onClick={handleChangeContactInfo}
            className="text-gray-600 hover:text-gray-800 text-sm underline transition-colors duration-200"
          >
            Change {contactInfo.includes('@') ? 'email address' : 'phone number'}
          </button>
        </div>

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
            disabled={!isFormValid}
            className={`
              flex-1 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
              ${isFormValid
                ? 'bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
              }
            `}
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerificationMilestone;