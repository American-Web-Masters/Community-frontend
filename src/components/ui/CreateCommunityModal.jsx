import React, { useState } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { apiClient } from '../../api';

const CreateCommunityModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacyLevel: 'public',
    welcomeMessage: '',
    affiliatedOrganization: '',
    communityRules: '',
    wallAssociation: '',
    tags: []
  });
  
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Community name and description are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create FormData for multipart/form-data
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('privacyLevel', formData.privacyLevel);
      submitData.append('welcomeMessage', formData.welcomeMessage.trim());
      submitData.append('affiliatedOrganization', formData.affiliatedOrganization.trim());
      submitData.append('communityRules', formData.communityRules.trim());
      submitData.append('wallAssociation', formData.wallAssociation.trim());
      
      // Add tags as comma-separated string
      submitData.append('tags', formData.tags.join(','));
      
      // Add cover photo if selected
      if (coverPhoto) {
        submitData.append('coverPhoto', coverPhoto);
      }

      const response = await apiClient.post('/communities/create', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        console.log('Community created successfully:', response.data.data);
        resetForm();
        if (onSuccess) onSuccess(response.data.data);
        onClose();
      } else {
        throw new Error(response.data?.message || 'Failed to create community');
      }
    } catch (err) {
      console.error('Community creation error:', err);
      setError(err.response?.data?.message || 'Failed to create community. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      privacyLevel: 'public',
      welcomeMessage: '',
      affiliatedOrganization: '',
      communityRules: '',
      wallAssociation: '',
      tags: []
    });
    setCoverPhoto(null);
    setNewTag('');
    setError('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Create Community</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            disabled={loading}
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form - Using same structure as CommunityTab */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Community Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter community name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Describe your community..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows={4}
                  required
                />
              </div>

              {/* Privacy Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('privacyLevel', 'public')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      formData.privacyLevel === 'public'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('privacyLevel', 'private')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      formData.privacyLevel === 'private'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    Private
                  </button>
                </div>
              </div>

              {/* Welcome Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Message
                </label>
                <textarea
                  placeholder="Welcome new members..."
                  value={formData.welcomeMessage}
                  onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows={3}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Cover Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="coverPhoto"
                  />
                  <label
                    htmlFor="coverPhoto"
                    className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    {coverPhoto ? coverPhoto.name : 'Choose Photo'}
                  </label>
                  <p className="text-gray-500 text-xs mt-2">PNG, JPG up to 10MB</p>
                </div>
              </div>

              {/* Affiliated Organization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Affiliated Organization
                </label>
                <input
                  type="text"
                  placeholder="Organization name"
                  value={formData.affiliatedOrganization}
                  onChange={(e) => handleInputChange('affiliatedOrganization', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Community Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Rules
                </label>
                <textarea
                  placeholder="Community guidelines..."
                  value={formData.communityRules}
                  onChange={(e) => handleInputChange('communityRules', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows={3}
                />
              </div>

              {/* Wall Association */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wall Association
                </label>
                <input
                  type="text"
                  placeholder="Wall association"
                  value={formData.wallAssociation}
                  onChange={(e) => handleInputChange('wallAssociation', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-3">
                  {/* Display existing tags */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Add new tag */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.description.trim()}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;