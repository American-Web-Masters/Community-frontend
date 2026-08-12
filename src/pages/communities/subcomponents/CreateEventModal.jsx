import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import apiClient from '../../../api/client';
import { checkCalendarConnection, connectCalendar } from '../../../api/calendar';
import { 
  getUserTimeZone, 
  convertLocalToUTC, 
  convertUTCToLocal, 
  getMinDate,
  parseBackendDateTime 
} from '../../../utils/timezoneUtils';
import toast from 'react-hot-toast';

const CreateEventModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  community,
  editMode = false, 
  initialData = null
}) => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userTimeZone, setUserTimeZone] = useState('');
  
  // Calendar connection state
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [connectingCalendar, setConnectingCalendar] = useState(false);
  
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    description: ''
  });

  // Get user timezone only once when component mounts
  useEffect(() => {
    const timeZone = getUserTimeZone();
    setUserTimeZone(timeZone);
  }, []);

  // Check calendar connection when modal opens
  useEffect(() => {
    if (isOpen) {
      checkUserCalendarConnection();
    }
  }, [isOpen]);

  const checkUserCalendarConnection = async () => {
    try {
      setCalendarLoading(true);
      const response = await checkCalendarConnection();
      
      if (response.success) {
        setIsCalendarConnected(response.data.isConnected);
      } else {
        console.error('Failed to check calendar connection:', response.error);
        toast.error('Failed to check calendar connection');
      }
    } catch (err) {
      console.error('Calendar connection check error:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

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

  // Effect to populate form data when editing
  useEffect(() => {
    if (editMode && initialData && isOpen && userTimeZone) {
      
      // For editing, use the localEventDate and localEventTime which are already in local timezone
      // These are prepared by Events.jsx and are ready for form display
      const eventDate = initialData.localEventDate || initialData.eventDate || '';
      const eventTime = initialData.localEventTime || initialData.eventTime || '';
      
      console.log('Using local values - Date:', eventDate, 'Time:', eventTime);
      
      setFormData({
        eventName: initialData.eventName || '',
        eventDate: eventDate,
        eventTime: eventTime,
        description: initialData.description || ''
      });
    } else if (!editMode && isOpen) {
      // Reset form for new event
      setFormData({
        eventName: '',
        eventDate: '',
        eventTime: '',
        description: ''
      });
    }
  }, [editMode, initialData, isOpen, userTimeZone]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if calendar is connected before submitting
    if (!isCalendarConnected) {
      setError('Please connect your Google Calendar before creating an event.');
      toast.error('Google Calendar connection required');
      return;
    }
    
    // Validation
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

    try {
      const payload = {
        eventName: formData.eventName.trim(),
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        timezone: userTimeZone,
        description: formData.description.trim()
      };

      let response;
      if (editMode && initialData) {
        response = await apiClient.patch(`/events/community/${community._id}/${initialData._id}`, payload);
      } else {
        response = await apiClient.post(`/events/community/${community._id}`, payload);
      }
      
      if (response.data.status === 'success') {
        onSuccess(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || `Failed to ${editMode ? 'update' : 'create'} event`);
      }
    } catch (err) {
      console.error('Event operation error:', err);
      let msg = err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} event. Please try again.`;
      
      // Handle expired/invalid Google Calendar token
      const errString = JSON.stringify(err.response?.data || {});
      if (msg.includes('invalid_grant') || errString.includes('invalid_grant')) {
        msg = 'Your Google Calendar connection has expired. Please reconnect your calendar above.';
        setIsCalendarConnected(false); // Reset connection state to show the connect button
      }
      
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      eventName: '',
      eventDate: '',
      eventTime: '',
      description: ''
    });
    setError('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  // Get minimum date (today) for date input
  const getMinDateForInput = () => {
    return getMinDate(userTimeZone);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in ease-out cursor-pointer"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 ease-out w-full max-w-2xl max-h-[90vh] overflow-y-auto cursor-default">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {editMode ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full hover:rotate-90 hover:shadow-sm active:scale-90 transition-all duration-300 cursor-pointer"
            disabled={loading}
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Connection Section */}
        <div className="px-6 py-4 border-b border-gray-100">
          {calendarLoading ? (
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                className={`py-2 px-4 btn-blue-gradient text-sm rounded-lg text-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
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
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none bg-white/70 backdrop-blur-sm shadow-inner focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 cursor-text"
                required
              />
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                  <FaCalendarAlt className="inline w-4 h-4 mr-2" />
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  min={getMinDateForInput()}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none bg-white/70 backdrop-blur-sm shadow-inner focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 cursor-pointer"
                  required
                />
              </div>

              {/* Event Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                  <FaClock className="inline w-4 h-4 mr-2" />
                  Event Time * {userTimeZone && <span className="text-xs text-gray-500">({userTimeZone})</span>}
                </label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => handleInputChange('eventTime', e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none bg-white/70 backdrop-blur-sm shadow-inner focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Event Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                Event Description *
              </label>
              <textarea
                placeholder="Describe your event..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 resize-none focus:outline-none bg-white/70 backdrop-blur-sm shadow-inner focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 min-h-[120px] cursor-text"
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
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 hover:shadow-sm transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isCalendarConnected || !formData.eventName.trim() || !formData.eventDate || !formData.eventTime || !formData.description.trim()}
                className={`flex-1 py-3 px-6 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 ${
                  !isCalendarConnected 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                } disabled:opacity-50`}
                title={!isCalendarConnected ? 'Please connect Google Calendar first' : ''}
              >
                {loading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Event' : 'Create Event')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;