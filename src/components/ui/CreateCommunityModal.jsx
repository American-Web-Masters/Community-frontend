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
        const community = response.data.data;
        if (onSuccess) onSuccess(community);
        resetForm();
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
          <h2 className="text-lg font-semibold text-gray-800">
            Create Community
          </h2>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-300 cursor-pointer hover:rotate-90 hover:shadow-sm"
            disabled={loading}
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        </div>

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
                  className="w-full px-5 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 shadow-inner"
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
                  className="w-full px-5 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 shadow-inner min-h-[140px]"
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
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 ${
                      formData.privacyLevel === 'public'
                        ? 'bg-blue-100 text-blue-700 shadow-md ring-2 ring-blue-400 ring-offset-1'
                        : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('privacyLevel', 'private')}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 ${
                      formData.privacyLevel === 'private'
                        ? 'bg-blue-100 text-blue-700 shadow-md ring-2 ring-blue-400 ring-offset-1'
                        : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm'
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
                  className="w-full px-5 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 shadow-inner"
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
                <div className="group border-2 border-dashed border-gray-300 bg-white/50 rounded-2xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer min-h-[140px] flex flex-col items-center justify-center">
                  <FaUpload className="mx-auto h-10 w-10 text-gray-400 mb-3 group-hover:text-blue-500 transition-colors duration-300 group-hover:-translate-y-1 transform" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="coverPhoto"
                  />
                  <label
                    htmlFor="coverPhoto"
                    className="cursor-pointer btn-blue-gradient text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {coverPhoto ? coverPhoto.name : 'Choose Photo'}
                  </label>
                  <p className="text-gray-500 text-xs mt-3 font-medium">PNG, JPG up to 10MB</p>
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
                  className="w-full px-5 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 shadow-inner"
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
                  className="w-full px-5 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 shadow-inner"
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
                  className="w-full px-5 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 shadow-inner"
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
                          className="inline-flex items-center btn-blue-gradient text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-white hover:text-red-200 cursor-pointer transform hover:scale-110 transition-all"
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
                      className="flex-1 px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      className="px-5 py-2 btn-blue-gradient text-white rounded-xl text-sm font-semibold hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed"
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
              className="flex-1 py-3.5 px-6 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.description.trim()}
              className="flex-1 py-3.5 px-6 btn-blue-gradient text-white rounded-xl font-semibold shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0"
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