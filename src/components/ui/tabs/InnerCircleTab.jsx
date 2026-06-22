import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import apiClient from '../../../api/client';
import { checkCalendarConnection, connectCalendar } from '../../../api/calendar';
import { fetchCommunities } from '../../../api/communities';
import { 
  getUserTimeZone, 
  getMinDate,
} from '../../../utils/timezoneUtils';
import toast from 'react-hot-toast';

const InnerCircleTab = ({ onClose, onSuccess }) => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userTimeZone, setUserTimeZone] = useState('');
  
  // Calendar connection state
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [connectingCalendar, setConnectingCalendar] = useState(false);
  
  // Communities state
  const [availableCommunities, setAvailableCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  const [formData, setFormData] = useState({
    communityId: '',
    eventName: '',
    eventDate: '',
    eventTime: '',
    description: ''
  });

  // Get user timezone
  useEffect(() => {
    const timeZone = getUserTimeZone();
    setUserTimeZone(timeZone);
  }, []);

  // Fetch communities and calendar connection
  useEffect(() => {
    const checkUserCalendarConnection = async () => {
      try {
        setCalendarLoading(true);
        const response = await checkCalendarConnection();
        
        if (response.success) {
          setIsCalendarConnected(response.data.isConnected);
        } else {
          console.error('Failed to check calendar connection:', response.error);
        }
      } catch (err) {
        console.error('Calendar connection check error:', err);
      } finally {
        setCalendarLoading(false);
      }
    };

    const fetchCommunitiesData = async () => {
      if (user?._id) {
        setLoadingCommunities(true);
        try {
          const result = await fetchCommunities(user);
          if (result.success) {
            const modCommunities = (result.data || []).filter(c => {
              const isOwner = c.isOwner || c.createdBy?._id === user._id || c.createdBy === user._id;
              const isMod = c.members?.some(m => (m.user?._id === user._id || m.user === user._id) && m.role === 'moderator');
              return isOwner || isMod;
            });
            setAvailableCommunities(modCommunities);
            if (modCommunities.length === 1) {
              setFormData(prev => ({ ...prev, communityId: modCommunities[0]._id || modCommunities[0].communityId }));
            }
          }
        } catch (err) {
          console.error('Failed to fetch communities:', err);
        } finally {
          setLoadingCommunities(false);
        }
      }
    };

    checkUserCalendarConnection();
    fetchCommunitiesData();
  }, [user?._id]);

  const handleConnectCalendar = async () => {
    try {
      setConnectingCalendar(true);
      const response = await connectCalendar();
      
      if (response.success) {
        toast.success('Redirecting to Google Calendar...');
      } else {
        toast.error(response.error || 'Failed to connect calendar');
      }
    } catch (err) {
      console.error('Calendar connection error:', err);
      toast.error('Failed to connect calendar');
    } finally {
      setConnectingCalendar(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isCalendarConnected) {
      setError('Please connect your Google Calendar before creating an event.');
      toast.error('Google Calendar connection required');
      return;
    }

    if (!formData.communityId) {
      setError('Please select a community');
      return;
    }
    
    if (!formData.eventName.trim()) {
      setError('Event name is required');
      return;
    }

    if (!formData.eventDate) {
      setError('Event date is required');
      return;
    }

    if (!formData.eventTime) {
      setError('Event time is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Event description is required');
      return;
    }

    setLoading(true);
    setError('');
    const toastId = toast.loading('Creating inner circle event...');

    try {
      const payload = {
        eventName: formData.eventName.trim(),
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        timezone: userTimeZone,
        description: formData.description.trim()
      };

      const response = await apiClient.post(`/events/community/${formData.communityId}`, payload);
      
      if (response.data.status === 'success') {
        toast.success('Inner circle event created successfully!', { id: toastId });
        if (onSuccess) onSuccess(response.data.data);
        if (onClose) onClose();
      } else {
        const msg = response.data.message || 'Failed to create event';
        setError(msg);
        toast.error(msg, { id: toastId });
      }
    } catch (err) {
      console.error('Event operation error:', err);
      let msg = err.response?.data?.message || 'Failed to create event. Please try again.';
      
      // Handle expired/invalid Google Calendar token
      const errString = JSON.stringify(err.response?.data || {});
      if (msg.includes('invalid_grant') || errString.includes('invalid_grant')) {
        msg = 'Your Google Calendar connection has expired. Please reconnect your calendar above.';
        setIsCalendarConnected(false); // Reset connection state to show the connect button
      }
      
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const getMinDateForInput = () => {
    return getMinDate(userTimeZone);
  };

  if (loadingCommunities) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-10 h-10 border-4 border-[color:var(--color-primary-500)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Checking community access...</p>
      </div>
    );
  }

  if (availableCommunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
        <FaExclamationCircle className="w-16 h-16 text-amber-500 mb-2" />
        <h3 className="text-xl font-bold text-gray-800">Moderator Access Required</h3>
        <p className="text-gray-600 max-w-md">
          You are not a moderator of any community. Moderator status is required to create an inner circle event.
        </p>
        <button
          onClick={onClose}
          className="mt-6 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Calendar Connection Section */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        {calendarLoading ? (
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-[color:var(--color-primary-500)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Checking calendar connection...</span>
          </div>
        ) : isCalendarConnected ? (
          <div className="flex items-center space-x-3 text-green-600">
            <FaCheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Google Calendar Connected</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-amber-600">
              <FaCalendarAlt className="w-4 h-4" />
              <span className="text-sm font-medium">Google Calendar Required</span>
            </div>
            <button 
              type="button"
              className={`py-2 px-4 btn-blue-gradient text-sm rounded-lg text-white transition-all cursor-pointer ${
                connectingCalendar ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              }`}
              onClick={handleConnectCalendar}
              disabled={connectingCalendar}
            >
              {connectingCalendar ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                'Connect Google Calendar'
              )}
            </button>
            <p className="text-xs text-gray-500">
              Connect your Google Calendar to create and sync events automatically.
            </p>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Select Community */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
              Community *
            </label>
            <select
              value={formData.communityId}
              onChange={(e) => handleInputChange('communityId', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-500)] focus:border-transparent transition-all duration-200 cursor-pointer"
              required
            >
              <option value="" disabled>Select a community to host the event</option>
              {availableCommunities.map(c => (
                <option key={c._id || c.communityId} value={c._id || c.communityId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
              Event Name *
            </label>
            <input
              type="text"
              placeholder="Enter event name..."
              value={formData.eventName}
              onChange={(e) => handleInputChange('eventName', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-500)] focus:border-transparent transition-all duration-200 cursor-text"
              required
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                <FaCalendarAlt className="inline w-4 h-4 mr-2 text-[color:var(--color-primary-500)]" />
                Event Date *
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                min={getMinDateForInput()}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-500)] focus:border-transparent transition-all duration-200 cursor-pointer"
                required
              />
            </div>

            {/* Event Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                <FaClock className="inline w-4 h-4 mr-2 text-[color:var(--color-primary-500)]" />
                Event Time * {userTimeZone && <span className="text-xs text-gray-500">({userTimeZone})</span>}
              </label>
              <input
                type="time"
                value={formData.eventTime}
                onChange={(e) => handleInputChange('eventTime', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-500)] focus:border-transparent transition-all duration-200 cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Event Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Description *
            </label>
            <textarea
              placeholder="Describe your event..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-500)] focus:border-transparent transition-all duration-200 min-h-[120px]"
              rows={4}
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isCalendarConnected || !formData.communityId || !formData.eventName.trim() || !formData.eventDate || !formData.eventTime || !formData.description.trim()}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                !isCalendarConnected 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'btn-blue-gradient text-white hover:opacity-95 cursor-pointer'
              } disabled:opacity-50`}
              title={!isCalendarConnected ? 'Please connect Google Calendar first' : ''}
            >
              {loading ? 'Creating...' : 'Create Inner Circle Event'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InnerCircleTab;