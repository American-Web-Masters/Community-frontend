import React, { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import PrayerPageLayout from "../../components/ui/PrayerPageLayout";
import { apiClient } from "../../api";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { mockPrayerCards } from "../../data/mockData";

const Home = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  // Function to fetch prayers from API with pagination
  const fetchPrayers = useCallback(async (page, limit) => {
    try {
      const response = await apiClient.get(`/prayers?page=${page}&limit=${limit}`);
      console.log('Fetched prayers:', response);
      return response.data;
    } catch (err) {
      console.error('Error fetching prayers:', err);
      
      // Fallback to mock data only on first page for development
      if (page === 1) {
        return {
          success: true,
          data: {
            prayers: mockPrayerCards,
            pagination: {
              currentPage: 1,
              hasNextPage: false,
              totalCount: mockPrayerCards.length
            }
          }
        };
      }
      
      throw new Error('Failed to fetch prayers');
    }
  }, []);

  // Use infinite scroll hook
  const {
    items: prayers,
    hasMore,
    loading,
    error,
    fetchMoreItems,
    refresh
  } = useInfiniteScroll(fetchPrayers, {
    limit: 20,
    enabledCondition: isLoggedIn && user
  });

  const handlePrayerCreated = (newPrayer) => {
    console.log('New prayer created:', newPrayer);
    // Refresh prayers list after creating new prayer
    refresh();
  };

  // Fetch prayers on component mount
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchPrayers();
    }
  }, [isLoggedIn, user]);



  // Mock data for prayer cards - used as fallback


  const tabs = ["All", "Drafts", "Scheduled", "Submitted"];

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
      pageType="prayer-wall"
      onLogout={handleLogout}
      showTabs={false}
      customTabs={tabs}
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

export default Home;
