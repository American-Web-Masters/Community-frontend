import React, { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn, clearUser } from "../../store/userSlice";
import PrayerPageLayout from "../../components/ui/PrayerPageLayout";
import { apiClient } from "../../api";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";

const Home = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUser());
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
    limit: 5,
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
  const mockPrayerCards = [
    {
      id: 1,
      user: { name: "David Park" },
      timeAgo: "2 min",
      urgency: "Urgent",
      prayerText:
        "Please pray for my grandmother who is in the hospital. She has been struggling with her health and the doctors are running more tests. Our family is really worried and we could use all the prayers we can get during this difficult time. The doctors say the next 48 hours are critical.",
      status: null,
      communities: ["Church Group", "Prayer Group", "Family Prayer"],
      mood: "😢",
      timeline: [
        { user: "Micheal R.", action: "Read", time: "3h ago" },
        { user: "John Ray", action: "Read", time: "3h ago" }
      ],
      comments: [
        { 
          user: "Michael Chen", 
          text: "Praying for your grandmother and your whole family. May God grant her healing and peace.", 
          time: "2 hours ago",
          reactions: { "🙏": 5, "♥️": 3 }
        },
        { 
          user: "Sarah Williams", 
          text: "Sending love and prayers your way. God is faithful and will see you through this difficult time.", 
          time: "1 hour ago",
          reactions: { "🙏": 8, "♥️": 2, "😇": 1 }
        },
        { 
          user: "Pastor John", 
          text: "Our whole church is praying for your grandmother's healing. Trust in the Lord's plan.", 
          time: "45 minutes ago",
          reactions: { "🙏": 12, "♥️": 5, "🎉": 1 }
        }
      ]
    }
  ];

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
