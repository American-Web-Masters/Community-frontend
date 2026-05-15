import React, { useState, useEffect } from 'react';
import {  FaCalendarAlt} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import CreateEventModal from './CreateEventModal';
import DeleteEventModal from '../../../components/ui/DeleteEventModal';
import apiClient from '../../../api/client';
import { startInnerCircle, joinInnerCircle } from '../../../api/innerCircle';
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

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
      console.log('Fetch events response:', response);
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
    window.location.reload();
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
    try {
      setLoading(true);
      const response = await apiClient.delete(`/events/community/${community._id}/${eventId}`);
      if (response.status == 204) {
        setEvents(prev => prev.filter(event => event._id !== eventId));
        toast.success('Event deleted successfully!');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      handleDeleteEvent(eventToDelete._id);
      setEventToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const refreshEvents = async () => {
    try {
      const response = await apiClient.get(`/events/community/${community._id}`);
      console.log('Refresh events response:', response);  
      if (response.data.status === 'success') {
        const eventsWithLocalTime = response.data?.data?.events?.map(event => {
          return parseBackendDateTime(event, userTimeZone);
        }) || [];

        setEvents(eventsWithLocalTime);
      }
    } catch (error) {
      console.error('Error refreshing events:', error);
    }
  };

  const handleStartInnerCircle = async (event) => {
    try {
      const response = await startInnerCircle(event._id);

      if (response?.status === 'success') {
        toast.success(response.message || 'Inner Circle started successfully!');
        await refreshEvents();
        return;
      }

      toast.error(response?.message || 'Failed to start Inner Circle.');
    } catch (error) {
      console.error('Error starting Inner Circle:', error);
      toast.error(error?.response?.data?.message || 'Failed to start Inner Circle.');
    }
  };

  const handleJoinInnerCircle = async (event) => {
    try {
      const response = await joinInnerCircle(event._id);

      if (response?.status === 'success') {
        toast.success(response.message || 'Joined Inner Circle successfully!');
        await refreshEvents();
        return;
      }

      toast.error(response?.message || 'Failed to join Inner Circle.');
    } catch (error) {
      console.error('Error joining Inner Circle:', error);
      toast.error(error?.response?.data?.message || 'Failed to join Inner Circle.');
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
    <div className="p-2">
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
          handleDeleteEvent={handleDeleteClick} 
          handleStartInnerCircle={handleStartInnerCircle}
          handleJoinInnerCircle={handleJoinInnerCircle}
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

      {/* Delete Event Modal */}
      <DeleteEventModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        eventName={eventToDelete?.eventName || ''}
      />
    </div>
  );
};

export default Events;