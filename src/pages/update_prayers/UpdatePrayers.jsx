import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { NotificationCard, PrayerModal } from "./subcomponents";
import { apiClient } from "../../api";
import { fetchUserBookmarks } from "../../api/prayer";
import PrayerPageLayout from "../../components/ui/PrayerPageLayout";
import { useLogout } from "../../hooks/useLogout";

const UpdatePrayers = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const { logout } = useLogout();
  const [activities, setActivities] = useState([]);
  const [bookmarkedPrayers, setBookmarkedPrayers] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Function to fetch prayer updates from API
  const fetchPrayerUpdates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/prayers/recent-activity/${user._id}`);
      console.log(response?.data?.data?.recentActivity);
      
      if (response.data.success) {
        const recentPrayers = response.data.data.prayers || [];
        let allActivities = [];
        
        recentPrayers.forEach(prayer => {
          if (prayer.timeline && prayer.timeline.length > 0) {
            prayer.timeline.forEach(activity => {
              allActivities.push({
                ...activity,
                prayer: prayer // Attach parent prayer for the modal
              });
            });
          }
        });
        
        // Sort by newest activity first
        allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setActivities(allActivities);
      } else {
        throw new Error('Failed to fetch prayer updates');
      }
    } catch (err) {
      console.error('Error fetching prayer updates:', err);
      setError('Failed to load prayer updates. Please try again.');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Fetch bookmarks
  const fetchBookmarks = useCallback(async () => {
    try {
      setLoadingBookmarks(true);
      if (!user?._id) {
        setBookmarkedPrayers([]);
        return;
      }
      const response = await fetchUserBookmarks(user._id);
      if (response.success) {
        setBookmarkedPrayers(response.data.prayers || []);
      }
    } catch (err) {
      console.error('Error fetching bookmarked prayers:', err);
      setBookmarkedPrayers([]);
    } finally {
      setLoadingBookmarks(false);
    }
  }, [user?._id]);

  // Fetch prayers on component mount
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchPrayerUpdates();
      fetchBookmarks();
    }
  }, [isLoggedIn, user]);

  const handleBookmarkRemoved = (prayerId) => {
    setBookmarkedPrayers(prev => prev.filter(prayer => prayer._id !== prayerId && prayer.id !== prayerId));
  };

  const handleCardClick = (activityOrPrayer) => {
    // If it's a timeline activity, it has the parent prayer attached as .prayer
    const prayer = activityOrPrayer.prayer || activityOrPrayer;
    setSelectedPrayer(prayer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrayer(null);
  };

  const handlePrayerCreated = (newPrayer) => {
    console.log('New prayer created:', newPrayer);
    // Refresh prayers list after creating new prayer
    fetchPrayerUpdates();
  };

  // Custom function to get filtered activities based on tab
  const getFilteredPrayers = (tab) => {
    switch (tab) {
      case 'Comments':
        return activities.filter(a => a.activityType === 'prayer_commented');
      case 'Prayed':
        return activities.filter(a => a.activityType === 'prayer_prayed');
      case 'Shares':
        return activities.filter(a => a.activityType === 'prayer_shared');
      case 'Edits':
        return activities.filter(a => a.activityType === 'prayer_edited');
      case 'Mood/Urgency':
        return activities.filter(a => a.activityType === 'prayer_mood_urgency_changed');
      case 'Answered':
        return activities.filter(a => a.activityType === 'prayer_answered');
      case 'Bookmarks':
        return bookmarkedPrayers.map(prayer => ({ prayer, activityType: 'prayer_bookmarked', user: prayer.user }));
      default:
        return activities;
    }
  };

  const customTabs = ["All", "Comments", /* "Prayed", "Shares", */ "Bookmarks", "Edits", "Mood/Urgency", "Answered"];

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Custom render function for notification cards
  const renderNotificationCards = (filteredPrayers) => {
    if (filteredPrayers.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🙏</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No updates yet</h3>
          <p className="text-gray-600">
            When people interact with your prayers, you'll see updates here.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 w-[95%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredPrayers.map((activity, index) => (
          <NotificationCard
            key={`${activity._id}-${activity.activityType}-${index}`}
            activity={activity}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <PrayerPageLayout
        pageType="updates"
        onLogout={handleLogout}
        showTabs={true}
        customTabs={customTabs}
        prayers={[]} // Empty array to avoid default prayer card rendering
        loading={loading}
        error={error}
        onRefresh={fetchPrayerUpdates}
        onCreatePrayer={handlePrayerCreated}
        getFilteredPrayers={getFilteredPrayers}
        customRenderer={renderNotificationCards}
        bookmarkedPrayers={bookmarkedPrayers}
        loadingBookmarks={loadingBookmarks}
        onRefreshBookmarks={fetchBookmarks}
        onRemoveBookmark={handleBookmarkRemoved}
      />

      {/* Prayer Modal */}
      <PrayerModal
        prayer={selectedPrayer}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default UpdatePrayers;
