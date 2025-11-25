import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const InnerCircleTab = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    association: '',
    startTime: '6:00',
    endTime: '18:00',
    privacy: 'public',
    recurring: '',
    memberInviteId: '',
    audioOptions: {
      record: false,
      autoRecord: false
    },
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleAudioOptionChange = (option, value) => {
    setFormData(prev => ({
      ...prev,
      audioOptions: {
        ...prev.audioOptions,
        [option]: value
      }
    }));
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
    
    if (!formData.name.trim()) {
      setError('Circle name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement inner circle creation API
      console.log('Inner Circle Data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSuccess) onSuccess({ message: 'Inner Circle created successfully' });
      onClose();
    } catch (err) {
      console.error('Inner circle creation error:', err);
      setError('Failed to create inner circle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!formData.name.trim()) {
      setError('Circle name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement save as draft API
      console.log('Saving inner circle draft:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onSuccess) onSuccess({ message: 'Inner Circle draft saved' });
      onClose();
    } catch (err) {
      console.error('Draft save error:', err);
      setError('Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMemberId = () => {
    const randomId = Math.random().toString(36).substr(2, 9).toUpperCase();
    handleInputChange('memberInviteId', randomId);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Circle Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Circle Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter circle name"
              required
            />
          </div>

          {/* Wall Association */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wall Association
            </label>
            <select
              value={formData.association}
              onChange={(e) => handleInputChange('association', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Community</option>
              <option value="community1">Community 1</option>
              <option value="community2">Community 2</option>
              <option value="community3">Community 3</option>
            </select>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Recurring Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recurring Schedule
            </label>
            <select
              value={formData.recurring}
              onChange={(e) => handleInputChange('recurring', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Privacy */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Privacy</h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 bg-white rounded-3xl cursor-pointer">
                <input
                  type="radio"
                  name="innerCirclePrivacy"
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
              <label className="flex items-center p-3 bg-white rounded-3xl cursor-pointer">
                <input
                  type="radio"
                  name="innerCirclePrivacy"
                  value="private"
                  checked={formData.privacy === 'private'}
                  onChange={(e) => handleInputChange('privacy', e.target.value)}
                   className="appearance-none h-4 w-4 rounded-full border border-gray-400 checked:bg-blue-500 checked:border-gray-700 focus:outline-none focus:ring-0"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-800">Private</div>
                  <div className="text-sm text-gray-500">Only by invitation</div>
                </div>
              </label>
            </div>
          </div>

          {/* Member Invite ID */}
          <div className='md:mt-10'>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Member (Max 12)
              </label>
            </div>
              <button
                type="button"
                // onClick={generateMemberId}
                className="px-3 w-full py-4 btn-blue-gradient text-white text-sm rounded-3xl hover:bg-blue-700 transition-colors"
              >
                Invite Members
              </button>
          </div>

          {/* Audio Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Audio Options</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-3xl">
                <div>
                  <div className="font-medium text-gray-800">Audio Recording</div>
                  <div className="text-sm text-gray-500">Enable session recording</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.audioOptions.record}
                    onChange={(e) => handleAudioOptionChange('record', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                    formData.audioOptions.record ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      formData.audioOptions.record ? 'translate-x-5' : 'translate-x-0'
                    } mt-0.5 ml-0.5`}></div>
                  </div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-3xl">
                <div>
                  <div className="font-medium text-gray-800">Auto Record</div>
                  <div className="text-sm text-gray-500">Automatically start recording</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.audioOptions.autoRecord}
                    onChange={(e) => handleAudioOptionChange('autoRecord', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                    formData.audioOptions.autoRecord ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      formData.audioOptions.autoRecord ? 'translate-x-5' : 'translate-x-0'
                    } mt-0.5 ml-0.5`}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tags (Optional)</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {/* Preset tags */}
              {['healing', 'family', 'work'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (formData.tags.includes(tag)) {
                      handleRemoveTag(tag);
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        tags: [...prev.tags, tag]
                      }));
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                    formData.tags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
              
              {/* Custom tags */}
              {formData.tags.filter(tag => !['healing', 'family', 'work'].includes(tag)).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-blue-200 transition-colors"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tags..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border bg-white border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          disabled={loading || !formData.name.trim()}
          className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Inner Circle'}
        </button>
      </div>
    </form>
  );
};

export default InnerCircleTab;