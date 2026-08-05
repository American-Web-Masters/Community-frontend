import React, { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import PrayerPageLayout from "../../components/ui/PrayerPageLayout";
import { apiClient } from "../../api";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { mockAnsweredPrayers } from "../../data/mockData";

const AnsweredPrayers = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  // Function to fetch answered prayers from API with pagination
  const fetchAnsweredPrayers = useCallback(async (page, limit) => {
    try {
      const response = await apiClient.get(`/prayers/answered?page=${page}&limit=${limit}`);
      console.log('Fetched answered prayers:', response);
      return response.data;
    } catch (err) {
      console.error('Error fetching answered prayers:', err);
      
      // Fallback to mock data only on first page for development
      if (page === 1) {
        return {
          success: true,
          data: {
            prayers: mockAnsweredPrayers,
            pagination: {
              currentPage: 1,
              hasNextPage: false,
              totalCount: mockAnsweredPrayers.length
            }
          }
        };
      }
      
      throw new Error('Failed to fetch answered prayers');
    }
  }, []);

  // Use infinite scroll hook
  const {
    items: prayers,
    hasMore,
    loading,
    error,
    fetchMoreItems,
    refresh,
    setItems
  } = useInfiniteScroll(fetchAnsweredPrayers, {
    limit: 20,
    enabledCondition: isLoggedIn && user
  });

  const handlePrayerCreated = (newPrayer) => {
    console.log('New prayer created:', newPrayer);
    // Refresh prayers list after creating new prayer
    refresh();
  };

  useEffect(() => {
    const handleUnanswered = (e) => {
      const { prayerId } = e.detail;
      setItems((prevItems) => 
        prevItems.filter(p => (p._id || p.id) !== prayerId)
      );
    };

    window.addEventListener('prayer:unanswered', handleUnanswered);
    return () => {
      window.removeEventListener('prayer:unanswered', handleUnanswered);
    };
  }, [setItems]);


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
    <PrayerPageLayout
      pageType="answered"
      onLogout={handleLogout}
      showTabs={false}
      prayers={prayers}
      loading={loading}
      error={error}
      hasMore={hasMore}
      fetchMoreItems={fetchMoreItems}
      onRefresh={refresh}
      onCreatePrayer={handlePrayerCreated}
      useInfiniteScroll={true}
    />
  );
};

export default AnsweredPrayers;
