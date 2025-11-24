import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
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
      // TODO: Implement community creation API
      console.log('Community Data:', formData);
      console.log('Community Photo:', communityPhoto);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSuccess) onSuccess({ message: 'Community created successfully' });
      onClose();
    } catch (err) {
      console.error('Community creation error:', err);
      setError('Failed to create community. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!formData.name.trim()) {
      setError('Community name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement save as draft API
      console.log('Saving community draft:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onSuccess) onSuccess({ message: 'Community draft saved' });
      onClose();
    } catch (err) {
      console.error('Draft save error:', err);
      setError('Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
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
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[200px]"
              rows={4}
              required
            />
          </div>

          {/* Privacy Level */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Privacy Level</h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 bg-white rounded-4xl cursor-pointer">
                <input
                  type="radio"
                  name="communityPrivacy"
                  value="public"
                  checked={formData.privacy === 'public'}
                  onChange={(e) => handleInputChange('privacy', e.target.value)}
                  className="appearance-none h-4 w-4 rounded-full border border-gray-400 checked:bg-blue-500 checked:border-gray-700 focus:outline-none focus:ring-0"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-800">Public</div>
                  <div className="text-sm text-gray-500">Anyone can join</div>
                </div>
              </label>
              <label className="flex items-center p-3 bg-white rounded-4xl cursor-pointer">
                <input
                  type="radio"
                  name="communityPrivacy"
                  value="private"
                  checked={formData.privacy === 'private'}
                  onChange={(e) => handleInputChange('privacy', e.target.value)}
                  className="appearance-none h-4 w-4 rounded-full border border-gray-400 checked:bg-blue-500 checked:border-gray-700 focus:outline-none focus:ring-0"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-800">Private</div>
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
            <div className="border-2 border-dashed bg-white border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
              <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Upload a community cover</p>
              {communityPhoto && (
                <p className="text-sm text-green-600 mb-2">File selected: {communityPhoto.name}</p>
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
                className="text-sm inline-block px-2 py-1 bg-gray-400 text-white rounded-3xl cursor-pointer hover:bg-blue-700 transition-colors"
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
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              value={formData.rules}
              onChange={(e) => handleInputChange('rules', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
          className="flex-1 py-3 px-6 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-200 disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Save as Draft'}
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
  );
};

export default CommunityTab;