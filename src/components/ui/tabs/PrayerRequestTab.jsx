import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import { apiClient } from '../../../api';
import { fetchApprovedCommunitiesForUser } from '../../../api/communities';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { localInputToUTC } from '../../../utils/prayerUtils';

const PrayerRequestTab = ({ onClose, onSuccess }) => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [availableCommunities, setAvailableCommunities] = useState([]);
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  
  const [formData, setFormData] = useState({
    content: '',
    urgency: 'normal',
    anonymous: false,
    moodEmoji: '',
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');

  const moodOptions = ['😄', '😐', '😔', '😡', '😢'];

  // Fetch user's communities on component mount
  React.useEffect(() => {
    const fetchUserCommunities = async () => {
      if (user?._id) {
        setLoadingCommunities(true);
        try {
          const result = await fetchApprovedCommunitiesForUser(user._id);
          if (result.success) {
            setAvailableCommunities(result.data?.communities || []);
          } else {
            console.error('Failed to fetch communities:', result.error);
          }
        } catch (error) {
          console.error('Error fetching communities:', error);
        } finally {
          setLoadingCommunities(false);
        }
      }
    };

    fetchUserCommunities();
  }, [user?._id]);

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

  const createPrayerPayload = () => {
    return {
      user: user._id,
      communities: selectedCommunities,
      userProfile: user._id,
      content: formData.content.trim(),
      urgency: formData.urgency,
      anonymous: formData.anonymous,
      tags: formData.tags,
      ...(formData.moodEmoji ? { moodEmoji: formData.moodEmoji } : {})
    };
  };

  const handleSaveAsDraft = async () => {
    if (!formData.content.trim()) {
      setError('Prayer content is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = createPrayerPayload();
      const response = await apiClient.post('/prayers/draft/create', payload);
      
      if (response.data.success) {
        console.log('Draft saved successfully:', response.data.data);
        resetForm();
        if (onSuccess) onSuccess(response.data.data);
        onClose();
      } else {
        throw new Error(response.data?.message || 'Failed to save draft');
      }
    } catch (err) {
      console.error('Draft save error:', err);
      setError(err.response?.data?.message || 'Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setError('Prayer content is required');
      return;
    }

    if (showScheduler && !scheduledDate) {
      setError('Please select a schedule date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let payload = createPrayerPayload();
      let endpoint = '/prayers/create';

      if (showScheduler) {
        payload = {
          ...payload,
          scheduledFor: localInputToUTC(scheduledDate)
        };
        endpoint = '/prayers/scheduled/create';
      }

      const response = await apiClient.post(endpoint, payload);
      
      if (response.data.success) {
        console.log('Prayer created successfully:', response.data.data);
        resetForm();
        if (onSuccess) onSuccess(response.data.data);
        onClose();
      } else {
        throw new Error(response.data?.message || 'Failed to create prayer');
      }
    } catch (err) {
      console.error('Prayer creation error:', err);
      setError(err.response?.data?.message || 'Failed to create prayer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      content: '',
      urgency: 'normal',
      anonymous: false,
      moodEmoji: '',
      tags: []
    });
    setNewTag('');
    setScheduledDate('');
    setShowScheduler(false);
    setSelectedCommunities([]);
    setError('');
  };

  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Prayer Content */}
          <div>
            <textarea
              placeholder="Write your prayer request here..."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 min-h-[140px] lg:min-h-[180px] shadow-inner"
              rows={6}
              required
            />
          </div>

          {/* Urgency Level */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Urgency Level</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('urgency', 'low')}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 ${
                  formData.urgency === 'low'
                    ? 'bg-green-100 text-green-700 shadow-md ring-2 ring-green-400 ring-offset-1'
                    : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200 shadow-sm'
                }`}
              >
                Low
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('urgency', 'normal')}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 ${
                  formData.urgency === 'normal'
                    ? 'bg-blue-100 text-blue-700 shadow-md ring-2 ring-blue-400 ring-offset-1'
                    : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('urgency', 'high')}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 ${
                  formData.urgency === 'high'
                    ? 'bg-red-100 text-red-700 shadow-md ring-2 ring-red-400 ring-offset-1'
                    : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200 shadow-sm'
                }`}
              >
                High
              </button>
            </div>
          </div>

          {/* Mood Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">How are you feeling today? (optional) </h3>
            <div className="flex gap-3 justify-center">
              {moodOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInputChange('moodEmoji', emoji)}
                  className={`w-12 h-12 text-2xl rounded-full transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1 hover:shadow-lg ${
                    formData.moodEmoji === emoji
                      ? 'bg-white shadow-md ring-4 ring-blue-400 ring-offset-2 scale-110'
                      : 'bg-white/60 hover:bg-white shadow-sm border border-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Visibility Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Visibility</h3>
            
            {/* Public Option */}
            <div className="group flex items-center justify-between p-4 bg-white/70 hover:bg-white rounded-2xl mb-3 shadow-sm border border-gray-100 transition-all duration-300 cursor-pointer" onClick={() => handleInputChange('anonymous', false)}>
              <div>
                <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Public</div>
                <div className="text-sm text-gray-500">Everyone can see and pray</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={!formData.anonymous}
                  onChange={() => handleInputChange('anonymous', false)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                  !formData.anonymous ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    !formData.anonymous ? 'translate-x-5' : 'translate-x-0'
                  } mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>

            {/* Anonymous Option */}
            <div className="group flex items-center justify-between p-4 bg-white/70 hover:bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 cursor-pointer" onClick={() => handleInputChange('anonymous', true)}>
              <div>
                <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Anonymous</div>
                <div className="text-sm text-gray-500">Hide your identity</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={formData.anonymous}
                  onChange={() => handleInputChange('anonymous', true)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                  formData.anonymous ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    formData.anonymous ? 'translate-x-5' : 'translate-x-0'
                  } mt-0.5 ml-0.5`}></div>
                </div>
              </label>
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
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md ${
                    formData.tags.includes(tag)
                      ? 'btn-blue-gradient text-white shadow-sm ring-2 ring-blue-400 ring-offset-1'
                      : 'bg-white text-gray-600 border border-gray-200 shadow-sm'
                  }`}
                >
                  {tag}
                </button>
              ))}
              
              {/* Custom tags */}
              {formData.tags.filter(tag => !['healing', 'family', 'work'].includes(tag)).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-4 py-1.5 btn-blue-gradient text-white text-sm font-medium rounded-full shadow-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }}
                    className="ml-1 hover:text-red-200 transition-colors transform hover:scale-110 cursor-pointer"
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
                className="flex-1 px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 shadow-inner"
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

          {/* Community Selection - Only for normal prayer requests */}
          {!showScheduler && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Communities (Optional)</h3>
              {loadingCommunities ? (
                <div className="text-sm text-gray-500">Loading communities...</div>
              ) : availableCommunities.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableCommunities.map((community) => (
                    <label
                      key={community.communityId || community._id}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCommunities.includes(community.communityId || community._id)}
                        onChange={(e) => {
                          const communityId = community.communityId || community._id;
                          if (e.target.checked) {
                            setSelectedCommunities(prev => [...prev, communityId]);
                          } else {
                            setSelectedCommunities(prev => prev.filter(id => id !== communityId));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {community.name}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No communities available</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full-width sections */}
      <div className="mt-6 space-y-6">
        {/* Schedule Entry */}
        {showScheduler && (
          <div className="p-4 bg-white rounded-xl border border-blue-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <FaCalendarAlt className="w-4 h-4" />
              Schedule Entry
            </h3>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={showScheduler}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          {!showScheduler && (
            <button
              type="button"
              onClick={() => setShowScheduler(true)}
              disabled={loading}
              className="w-full py-3 px-6 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaCalendarAlt className="w-4 h-4" />
              Schedule Entry
            </button>
          )}

          {showScheduler && (
            <button
              type="button"
              onClick={() => setShowScheduler(false)}
              disabled={loading}
              className="w-full py-3 px-6 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              Remove Schedule
            </button>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={loading || !formData.content.trim()}
              className="flex-1 py-3 px-6 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.content.trim() || (showScheduler && !scheduledDate)}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Share Prayer Request'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PrayerRequestTab;