import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { NotificationCard, PrayerModal } from "./subcomponents";
import { apiClient } from "../../api";
import PrayerPageLayout from "../../components/ui/PrayerPageLayout";
import { useLogout } from "../../hooks/useLogout";

const UpdatePrayers = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const { logout } = useLogout();
  const [activities, setActivities] = useState({ comments: [], prayed: [], shares: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Function to fetch prayer updates from API
  const fetchPrayerUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/prayers/recent-activity/${user._id}`);
      console.log(response?.data?.data?.recentActivity);
      
      if (response.data.success) {
        const recentActivity = response.data.data.recentActivity;
        setActivities({
          comments: recentActivity.comments || [],
          prayed: recentActivity.prayed || [],
          shares: recentActivity.shares || []
        });
      } else {
        throw new Error('Failed to fetch prayer updates');
      }
    } catch (err) {
      console.error('Error fetching prayer updates:', err);
      setError('Failed to load prayer updates. Please try again.');
      // Set empty activities on error
      setActivities({ comments: [], prayed: [], shares: [] });
    } finally {
      setLoading(false);
    }
  };

  // Fetch prayers on component mount
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchPrayerUpdates();
    }
  }, [isLoggedIn, user]);

  const handleCardClick = (prayer) => {
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

  // Custom function to get filtered prayers based on tab
  const getFilteredPrayers = (tab) => {
    switch (tab) {
      case 'Comments':
        return activities.comments.map(prayer => ({ ...prayer, activityType: 'comment' }));
      case 'Prayed':
        return activities.prayed.map(prayer => ({ ...prayer, activityType: 'prayed' }));
      case 'Shares':
        return activities.shares.map(prayer => ({ ...prayer, activityType: 'share' }));
      default:
        return [
          ...activities.comments.map(prayer => ({ ...prayer, activityType: 'comment' })),
          ...activities.prayed.map(prayer => ({ ...prayer, activityType: 'prayed' })),
          ...activities.shares.map(prayer => ({ ...prayer, activityType: 'share' }))
        ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
  };

  const customTabs = ["All", "Comments", "Prayed", "Shares"];

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
            prayer={activity}
            activityType={activity.activityType}
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
