import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import PrayerPageLayout from "../../components/ui/PrayerPageLayout";
import CreatePrayerModal from "../../components/ui/CreatePrayerModal";
import { apiClient } from "../../api";
import { fetchUserBookmarks } from "../../api/prayer";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { mockMyPrayers } from "../../data/mockData";

const MyPrayers = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const { logout } = useLogout();
  const [bookmarkedPrayers, setBookmarkedPrayers] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedDraftPrayer, setSelectedDraftPrayer] = useState(null);

  const handleLogout = () => {
    logout();
  };

  // Function to fetch user's prayers from API with pagination
  console.log("User ID:", user?._id);
  const fetchMyPrayers = useCallback(async (page, limit) => {
    try {
      const response = await apiClient.get(`/prayers/user/${user?._id}?page=${page}&limit=${limit}`);
      console.log('Fetched my prayers:', response);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch prayers');
      }
    } catch (err) {
      console.error('Error fetching my prayers:', err);
      
      // Fallback to mock data only on first page for development
      if (page === 1) {
        return {
          success: true,
          data: {
            prayers: mockMyPrayers,
            pagination: {
              currentPage: 1,
              hasNextPage: false,
              totalCount: mockMyPrayers.length
            }
          }
        };
      }
      
      throw new Error('Failed to fetch my prayers');
    }
  }, [user?._id]);

  // Use infinite scroll hook for prayers
  const {
    items: prayers,
    hasMore,
    loading,
    error,
    fetchMoreItems,
    refresh
  } = useInfiniteScroll(fetchMyPrayers, {
    limit: 20,
    enabledCondition: isLoggedIn && user
  });

  // Function to fetch bookmarked prayers
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
      } else {
        throw new Error('Failed to fetch bookmarked prayers');
      }
    } catch (err) {
      console.error('Error fetching bookmarked prayers:', err);
      setBookmarkedPrayers([]);
    } finally {
      setLoadingBookmarks(false);
    }
  }, [user?._id]);

  // Fetch bookmarks on component mount
  useEffect(() => {
    fetchBookmarks(); 
  }, []);

  const handleBookmarkRemoved = (prayerId) => {
    setBookmarkedPrayers(prev => prev.filter(prayer => prayer._id !== prayerId && prayer.id !== prayerId));
  };

  const handlePrayerCreated = (newPrayer) => {
    console.log('New prayer created:', newPrayer);
    // Refresh prayers list after creating new prayer
    refresh();
  };

  // Handle publish draft prayer
  const handlePublishDraft = (draftPrayer) => {
    console.log('Publishing draft prayer:', draftPrayer);
    setSelectedDraftPrayer(draftPrayer);
    setIsPublishModalOpen(true);
  };

  // Handle publish modal close
  const handlePublishModalClose = () => {
    setIsPublishModalOpen(false);
    setSelectedDraftPrayer(null);
  };

  // Handle successful publish
  const handlePublishSuccess = (updatedPrayer) => {
    console.log('Prayer published successfully:', updatedPrayer);
    // Refresh prayers list after publishing
    refresh();
    handlePublishModalClose();
  };

  // Function to determine prayer status based on schema
  const getPrayerStatus = (prayer) => {
    if (prayer.isDraft) return "Draft";
    if (prayer.isScheduled) return "Scheduled";
    // Check if user has prayed - handle both array formats
    const userHasPrayed = prayer.isPrayed?.some(prayedUser => {
      const userId = prayedUser.user?._id || prayedUser._id || prayedUser;
      return userId === user?._id;
    }) || false;
    if (userHasPrayed) return "Answered";
    if (!prayer.isDraft && !prayer.isScheduled) return "Submitted";
    return "Submitted"; // Default fallback
  };

  // Function to filter prayers based on active tab
  const getFilteredPrayers = (prayers, activeTab) => {
    if (!activeTab || activeTab === "All") return prayers;
    if (activeTab === "Bookmarks") return bookmarkedPrayers;

    return prayers.filter(prayer => {
      const status = getPrayerStatus(prayer);
      if (activeTab === "Submitted") {
        const isBookmarked = bookmarkedPrayers.some(bookmarked => 
          bookmarked._id === prayer._id || bookmarked.id === prayer.id
        );
        return (
          status === "Submitted" || 
          status === "Answered" || 
          (isBookmarked && status !== "Draft" && status !== "Scheduled")
        );
      }
      return status === activeTab;
    });
  };

  const myPrayersTabs = ["All", "Draft", "Scheduled", "Submitted", "Answered", "Bookmarks"];

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

  return (
    <>
      <PrayerPageLayout
        pageType="my-prayers"
        onLogout={handleLogout}
        showTabs={true}
        customTabs={myPrayersTabs}
        prayers={prayers}
        loading={loading}
        error={error}
        hasMore={hasMore}
        fetchMoreItems={fetchMoreItems}
        onRefresh={refresh}
        onCreatePrayer={handlePrayerCreated}
        getPrayerStatus={getPrayerStatus}
        getFilteredPrayers={getFilteredPrayers}
        user={user}
        bookmarkedPrayers={bookmarkedPrayers}
        loadingBookmarks={loadingBookmarks}
        onRefreshBookmarks={fetchBookmarks}
        onRemoveBookmark={handleBookmarkRemoved}
        useInfiniteScroll={true}
        onPublishDraft={handlePublishDraft}
      />
      
      {/* Publish Modal */}
      <CreatePrayerModal
        isOpen={isPublishModalOpen}
        onClose={handlePublishModalClose}
        onSuccess={handlePublishSuccess}
        editMode={true}
        initialData={selectedDraftPrayer}
        editPrayerId={selectedDraftPrayer?._id}
      />
    </>
  );
};

export default MyPrayers;
