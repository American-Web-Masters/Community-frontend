import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import { apiClient } from '../../../api';

const CommunityTab = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public',
    welcomeMessage: '',
    affiliatedOrganization: '',
    rules: ''
  });
  
  const [communityPhoto, setCommunityPhoto] = useState(null);

  const submitCommunity = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Community name and description are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('privacyLevel', formData.privacy);
      submitData.append('welcomeMessage', formData.welcomeMessage.trim());
      submitData.append('affiliatedOrganization', formData.affiliatedOrganization.trim());
      submitData.append('communityRules', formData.rules.trim());
      submitData.append('wallAssociation', '');
      submitData.append('tags', '');

      if (communityPhoto) {
        submitData.append('coverPhoto', communityPhoto);
      }

      const response = await apiClient.post('/communities/create', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        const createdCommunity = response.data.data;
        if (onSuccess) onSuccess(createdCommunity);
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitCommunity();
  };

  const handleSaveAsDraft = async () => {
    await submitCommunity();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      privacy: 'public',
      welcomeMessage: '',
      affiliatedOrganization: '',
      rules: ''
    });
    setCommunityPhoto(null);
    setError('');
  };

  return (
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
            <label className="block text-sm font-medium text-gray-700 mb-2 ">
              Description *
            </label>
            <textarea
              placeholder="Describe your community purpose"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 min-h-[200px] shadow-inner"
              rows={4}
              required
            />
          </div>

          {/* Privacy Level */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Privacy Level</h3>
            <div className="space-y-3">
              <label className="group flex items-center p-4 bg-white/70 hover:bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 cursor-pointer">
                <input
                  type="radio"
                  name="communityPrivacy"
                  value="public"
                  checked={formData.privacy === 'public'}
                  onChange={(e) => handleInputChange('privacy', e.target.value)}
                  className="appearance-none h-5 w-5 rounded-full border border-gray-300 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all cursor-pointer"
                />
                <div className="ml-3">
                  <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Public</div>
                  <div className="text-sm text-gray-500">Anyone can join</div>
                </div>
              </label>
              <label className="group flex items-center p-4 bg-white/70 hover:bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 cursor-pointer">
                <input
                  type="radio"
                  name="communityPrivacy"
                  value="private"
                  checked={formData.privacy === 'private'}
                  onChange={(e) => handleInputChange('privacy', e.target.value)}
                  className="appearance-none h-5 w-5 rounded-full border border-gray-300 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all cursor-pointer"
                />
                <div className="ml-3">
                  <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Private</div>
                  <div className="text-sm text-gray-500">Invite only</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Cover Photo */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Cover Photo</h3>
            <div className="group border-2 border-dashed bg-white/50 border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[140px]">
              <FaUpload className="w-8 h-8 text-gray-400 mb-3 group-hover:text-blue-500 transition-colors duration-300 group-hover:-translate-y-1 transform" />
              <p className="text-gray-500 mb-2 font-medium">Upload a community cover</p>
              {communityPhoto && (
                <p className="text-sm text-green-600 mb-3 font-semibold bg-green-50 px-3 py-1 rounded-full">File: {communityPhoto.name}</p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCommunityPhoto(e.target.files[0])}
                className="hidden"
                id="community-photo"
              />
              <label
                htmlFor="community-photo"
                className="text-sm inline-block px-5 py-2 btn-blue-gradient text-white font-medium rounded-full cursor-pointer hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Choose File
              </label>
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

          {/* Affiliated Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Affiliated Organization
            </label>
            <input
              type="text"
              placeholder="Enter organization name"
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
              value={formData.rules}
              onChange={(e) => handleInputChange('rules', e.target.value)}
              className="w-full px-5 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 shadow-inner"
              rows={3}
            />
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
          onClick={handleSaveAsDraft}
          disabled={loading || !formData.name.trim()}
          className="flex-1 py-3.5 px-6 bg-white/70 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          type="button"
          onClick={submitCommunity}
          disabled={loading || !formData.name.trim()}
          className="flex-1 py-3.5 px-6 btn-blue-gradient text-white rounded-xl font-semibold shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {loading ? 'Creating...' : 'Create Community'}
        </button>
      </div>
    </form>
  );
};

export default CommunityTab;