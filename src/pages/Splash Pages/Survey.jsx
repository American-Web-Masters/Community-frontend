import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHashtag, FaUsers, FaMicrophone, FaCalendarAlt, FaEllipsisH, FaTimes } from 'react-icons/fa';
import { apiClient } from '../../api';
import { selectUserId } from '../../store/userSlice';

const Survey = () => {
  const navigate = useNavigate();
  const userId = useSelector(selectUserId);
  
  const [selectedOption, setSelectedOption] = useState('');
  const [otherText, setOtherText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const options = [
    {
      id: 'social_media',
      label: 'Social Media',
      icon: FaHashtag
    },
    {
      id: 'friend_family',
      label: 'Friend or Family',
      icon: FaUsers
    },
    {
      id: 'podcast_blog',
      label: 'Podcast or Blog',
      icon: FaMicrophone
    },
    {
      id: 'event_workshop',
      label: 'Event / Workshop',
      icon: FaCalendarAlt
    },
    {
      id: 'other',
      label: 'Other',
      icon: FaEllipsisH
    }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setError('');
    // Clear other text if a different option is selected
    if (optionId !== 'other') {
      setOtherText('');
    }
  };

  const handleContinue = async () => {
    if (!selectedOption) {
      setError('Please select an option to continue');
      return;
    }

    // Validate "Other" option requires text input
    if (selectedOption === 'other' && !otherText.trim()) {
      setError('Please specify what "Other" means');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!userId) {
        setError('User ID not found. Please log in again.');
        return;
      }

      const payload = {
        userId: userId,
        surveyData: selectedOption === 'other' ? otherText.trim() : selectedOption
      };

      const response = await apiClient.post('/users/survey', payload);
      
      if (response.data.status === 'success') {
        // Navigate to tour page
        navigate('/tour');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save response. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/background.png)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-5">
        <div className="w-full max-w-md min-h-[90vh]">
          {/* Glass morphism container */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl relative h-full">
            {/* Close button
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors duration-200"
            >
              <FaTimes className="w-4 h-4 text-gray-600" />
            </button> */}

            {/* Header */}
            <div className="text-center mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                How did you hear about AO1 Community?
              </h2>
              <p className="text-gray-600 text-sm">
                Help us understand how you discover us
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2 mb-2">
              {options.map((option) => {
                const IconComponent = option.icon;
                const isSelected = selectedOption === option.id;
                const isOtherAndSelected = option.id === 'other' && isSelected;
                
                return (
                  <div key={option.id}>
                    {isOtherAndSelected ? (
                      // Show input field when "Other" is selected
                      <div className="w-full p-4 rounded-xl border-2 border-primary-500 bg-primary-50/50 shadow-md
                        flex items-center gap-3 h-[58px]">
                        <IconComponent className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Please specify..."
                          value={otherText}
                          onChange={(e) => setOtherText(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 font-medium"
                          autoFocus
                        />
                      </div>
                    ) : (
                      // Show regular button
                      <button
                        onClick={() => handleOptionSelect(option.id)}
                        className={`
                          w-full p-4 rounded-xl border-2 transition-all duration-200
                          flex items-center gap-3 text-left h-[58px]
                          ${isSelected 
                            ? 'border-primary-500 bg-primary-50/50 shadow-md' 
                            : 'border-white/30 bg-white/20 hover:bg-white/30 hover:border-white/50'
                          }
                        `}
                      >
                        <IconComponent className={`w-5 h-5 ${isSelected ? 'text-primary-600' : 'text-gray-600'}`} />
                        <span className={`font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                          {option.label}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Remove the separate input field section */}

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center mb-4">
                {error}
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedOption || loading || (selectedOption === 'other' && !otherText.trim())}
              className={`
                w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
                ${selectedOption && !loading && (selectedOption !== 'other' || otherText.trim())
                  ? 'bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-400 cursor-not-allowed opacity-60'
                }
              `}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;
