import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/userSlice';
import { apiClient } from '../../api';
import Input from './Input';
import { FaTimes, FaExclamationCircle, FaTag, FaUserSecret } from 'react-icons/fa';
import { MdPriorityHigh } from 'react-icons/md';

const CreatePrayerModal = ({ isOpen, onClose, onSuccess }) => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  
  const [formData, setFormData] = useState({
    content: '',
    urgency: 'normal',
    anonymous: false,
    moodEmoji: '😔',
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');

  const moodOptions = [
    { emoji: '😄', label: 'Happy' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😔', label: 'Sad' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '😢', label: 'Crying' }
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' },
    { value: 'normal', label: 'Normal', color: 'text-blue-600 bg-blue-100' },
    { value: 'high', label: 'High', color: 'text-red-600 bg-red-100' }
  ];

  const handleInputChange = (field, value) => {
    if (field === 'content') {
      setCharCount(value.length);
      if (value.length <= 500) {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    setError('');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setError('Prayer content is required');
      return;
    }

    if (formData.content.length > 500) {
      setError('Prayer content must be 500 characters or less');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate random IDs for communities and userProfile as requested
      const payload = {
        user: user._id,
        communities: ["68ff93765db352ca01d2a16b", "68ff93765db352ca01d2a16b"],
        userProfile: user._id,
        content: formData.content.trim(),
        urgency: formData.urgency,
        anonymous: formData.anonymous,
        moodEmoji: formData.moodEmoji,
        tags: formData.tags
      };

      const response = await apiClient.post('/prayers/create', payload);
      if (response.data.success) {
        console.log('Prayer created successfully:', response.data.data);
        
        // Reset form
        setFormData({
          content: '',
          urgency: 'normal',
          anonymous: false,
          moodEmoji: '😔',
          tags: []
        });
        setCharCount(0);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response.data.data);
        }
        
        // Close modal
        onClose();
      } else {
        throw new Error(response.data?.message || 'Failed to create prayer');
      }
    } catch (err) {
      console.error('Prayer creation error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create prayer. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isNearLimit = charCount >= 450;
  const isOverLimit = charCount > 500;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="light-background border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-gray-800">Create Prayer Request</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
            disabled={loading}
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Prayer Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prayer Text <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                placeholder="Write your prayer request…"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className={`
                  w-full px-4 py-4 bg-white/80 backdrop-blur-sm border rounded-xl
                  text-gray-800 placeholder-gray-400 resize-none
                  focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                  transition-all duration-200 shadow-sm min-h-[120px]
                  ${isOverLimit ? 'border-red-400 focus:ring-red-500/50' : 'border-white/30'}
                `}
                rows={4}
                maxLength={500}
                required
              />
              <div className={`absolute bottom-3 right-3 text-xs font-medium ${
                isNearLimit 
                  ? isOverLimit 
                    ? 'text-red-500' 
                    : 'text-orange-500'
                  : 'text-gray-400'
              }`}>
                {charCount}/500
              </div>
            </div>
            {isNearLimit && (
              <div className={`mt-1 text-xs flex items-center gap-1 ${
                isOverLimit ? 'text-red-500' : 'text-orange-500'
              }`}>
                <FaExclamationCircle className="w-3 h-3" />
                {isOverLimit 
                  ? 'Character limit exceeded' 
                  : `${(500 - charCount)} characters remaining`
                }
              </div>
            )}
          </div>

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Mood</label>
            <div className="flex gap-3 flex-wrap">
              {moodOptions.map((mood) => (
                <button
                  key={mood.emoji}
                  type="button"
                  onClick={() => handleInputChange('moodEmoji', mood.emoji)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
                    ${formData.moodEmoji === mood.emoji
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white/80'
                    }
                  `}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <MdPriorityHigh className="inline w-4 h-4 mr-1" />
              Urgency Level
            </label>
            <div className="flex gap-3 flex-wrap">
              {urgencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('urgency', option.value)}
                  className={`
                    px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200
                    ${formData.urgency === option.value
                      ? `${option.color} border-current`
                      : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white/80'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <FaTag className="inline w-4 h-4 mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-primary-900 transition-colors"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 !py-2"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaUserSecret className="w-4 h-4 text-gray-600" />
              <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                Post anonymously
              </label>
            </div>
            <button
              type="button"
              id="anonymous"
              onClick={() => handleInputChange('anonymous', !formData.anonymous)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                ${formData.anonymous ? 'bg-primary-500' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                  ${formData.anonymous ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <FaExclamationCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.content.trim() || isOverLimit}
              className="flex-1 py-3 px-6 btn-blue-gradient rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Prayer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePrayerModal;