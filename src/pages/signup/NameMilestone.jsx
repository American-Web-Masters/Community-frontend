import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import Input from '../../components/ui/Input';
import { signupUtils, MILESTONES } from '../../utils/signupUtils';

const NameMilestone = ({ onNext, onDataChange }) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: ''
  });

  const [errors, setErrors] = useState({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = signupUtils.getSignupData();
    setFormData({
      firstname: savedData.firstname || '',
      lastname: savedData.lastname || ''
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
          <FaUser className="w-8 h-8 text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Who's joining the community?
        </h2>
        <p className="text-text-secondary text-sm">
          Share your name to start connecting with our 
          <br />
          community of believers.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          placeholder="First Name"
          value={formData.firstname}
          onChange={(e) => handleInputChange('firstname', e.target.value)}
          error={errors.firstname}
          icon={FaUser}
          required
        />

        <Input
          placeholder="Last Name"
          value={formData.lastname}
          onChange={(e) => handleInputChange('lastname', e.target.value)}
          error={errors.lastname}
          required
        />

        <button
          type="submit"
          disabled={!isFormValid}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
            ${isFormValid
              ? 'btn-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-400 cursor-not-allowed opacity-60'
            }
          `}
        >
          Continue
        </button>
      </form>

      {/* Progress indicator */}
      <div className="flex justify-center mt-8">
        <div className="flex space-x-2">
          <div className="w-8 h-1 bg-primary rounded-full"></div>
          <div className="w-8 h-1 bg-white/20 rounded-full"></div>
          <div className="w-8 h-1 bg-white/20 rounded-full"></div>
          <div className="w-8 h-1 bg-white/20 rounded-full"></div>
          <div className="w-8 h-1 bg-white/20 rounded-full"></div>
          <div className="w-8 h-1 bg-white/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default NameMilestone;