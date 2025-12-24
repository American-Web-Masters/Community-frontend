import React, { useState, useEffect } from 'react';
import {  FaCalendarAlt} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import CreateEventModal from './CreateEventModal';
import apiClient from '../../../api/client';
import EventCard from './EventCard';
import toast from 'react-hot-toast';
import { 
  getUserTimeZone, 
  convertUTCToLocal, 
  formatLocalDate, 
  formatLocalTime,
  parseBackendDateTime 
} from '../../../utils/timezoneUtils';
import { DateTime } from 'luxon';

const Events = ({ community, isOwnerOrModerator }) => {
  const user = useSelector(selectUser);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [userTimeZone, setUserTimeZone] = useState('');

  // Get user timezone
  useEffect(() => {
    const timeZone = getUserTimeZone();
    setUserTimeZone(timeZone);
  }, []);

  useEffect(() => {
    if (userTimeZone && community?._id) {
      fetchEvents();
    }
  }, [community?._id, userTimeZone]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/events/community/${community._id}`);
      if (response.data.status === 'success') {
        // Parse and convert UTC times to local timezone for display
        const eventsWithLocalTime = response.data?.data?.events?.map(event => {
          return parseBackendDateTime(event, userTimeZone);
        }) || [];
        
        setEvents(eventsWithLocalTime);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventCreated = (newEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleEventUpdated = (updatedEvent) => {
    setEvents(prev => prev.map(event => 
      event._id === updatedEvent._id ? updatedEvent : event
    ));
    setEditingEvent(null);
    toast.success('Event updated successfully!');
  };

  const handleEditEvent = (event) => {
    console.log('=== EDIT EVENT DEBUG ===');
    console.log('Original event object:', event);
    
    // Pass the original UTC values for editing, not the local display values
    let editEventData = { ...event };
    
    // Handle different data formats for editing
    if (event.originalDateTime) {
      console.log('Using originalDateTime:', event.originalDateTime);
      // If we have original ISO datetime, extract UTC date and time from it
      try {
        const utcDateTime = DateTime.fromISO(event.originalDateTime);
        console.log('Parsed UTC datetime:', utcDateTime.toISO());
        console.log('UTC is valid:', utcDateTime.isValid);
        
        editEventData.eventDate = utcDateTime.toFormat('yyyy-MM-dd');
        editEventData.eventTime = utcDateTime.toFormat('HH:mm');
        
        console.log('Extracted for editing - Date:', editEventData.eventDate, 'Time:', editEventData.eventTime);
      } catch (error) {
        console.error('Error parsing original datetime for editing:', error);
        // Fallback to event's current values
        editEventData.eventDate = event.eventDate;
        editEventData.eventTime = event.eventTime;
      }
    } else if (event.originalEventDate && event.originalEventTime) {
      console.log('Using original separate fields:', event.originalEventDate, event.originalEventTime);
      // If we have separate original date/time fields
      editEventData.eventDate = event.originalEventDate;
      editEventData.eventTime = event.originalEventTime;
    } else {
      console.log('Using fallback to current values:', event.eventDate, event.eventTime);
      // Fallback to current values (these might be local, but CreateEventModal will handle conversion)
      editEventData.eventDate = event.eventDate;
      editEventData.eventTime = event.eventTime;
    }
    
    console.log('Final edit event data:', editEventData);
    setEditingEvent(editEventData);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/events/community/${community._id}/${eventId}`);
      if (response.data.success) {
        setEvents(prev => prev.filter(event => event._id !== eventId));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const formatDate = (dateString, timeString = null) => {
    if (!userTimeZone || !dateString) return 'Loading...';
    return formatLocalDate(dateString, timeString, userTimeZone);
  };

  const formatTime = (timeString, dateString = null) => {
    if (!userTimeZone || !timeString) return 'Loading...';
    return formatLocalTime(timeString, dateString, userTimeZone);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-40 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Events Yet</h3>
          <p className="text-gray-500">
            {isOwnerOrModerator 
              ? "Create the first event for your community!" 
              : "No events have been scheduled yet."}
          </p>
        </div>
      ) : (
        <EventCard 
          events={events} 
          isOwnerOrModerator={isOwnerOrModerator} 
          handleEditEvent={handleEditEvent} 
          handleDeleteEvent={handleDeleteEvent} 
          formatDate={formatDate} 
          formatTime={formatTime}
          userTimeZone={userTimeZone}
        />
      )}

      {/* Create/Edit Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen || editingEvent !== null}
        onClose={handleCloseModal}
        onSuccess={editingEvent ? handleEventUpdated : handleEventCreated}
        community={community}
        editMode={editingEvent !== null}
        initialData={editingEvent}
      />
    </div>
  );
};

export default Events;