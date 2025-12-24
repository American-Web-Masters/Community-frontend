import  { useState, useEffect } from 'react';
import {  FaCalendarAlt} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import CreateEventModal from './CreateEventModal';
import apiClient from '../../../api/client';
import EventCard from './EventCard';
import toast from 'react-hot-toast';

const Events = ({ community, isOwnerOrModerator }) => {
  const user = useSelector(selectUser);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [community?._id]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/events/community/${community._id}`);
      console.log('Fetch Events Response:', response);
      if (response.data.status === 'success') {
        setEvents(response.data?.data?.events);
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
    setEditingEvent(event);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
        <EventCard events={events} isOwnerOrModerator={isOwnerOrModerator} handleEditEvent={handleEditEvent} handleDeleteEvent={handleDeleteEvent} formatDate={formatDate} formatTime={formatTime} />
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