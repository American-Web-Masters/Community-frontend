import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn, clearUser } from "../../store/userSlice";
import PrayerPageLayout from "../../components/ui/PrayerPageLayout";
import { apiClient } from "../../api";

const MyPrayers = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    dispatch(clearUser());
  };

  // Function to fetch user's prayers from API
  console.log("User ID:", user?._id);
  const fetchMyPrayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/prayers/user/${user?._id}`);

      if (response.data.success) {
        console.log("Fetched My Prayers:", response.data.data.prayers);
        setPrayers(response.data.data.prayers || []);
      } else {
        throw new Error('Failed to fetch prayers');
      }
    } catch (err) {
      console.error('Error fetching my prayers:', err);
      setError('Failed to load your prayers. Please try again.');
      // Fallback to mock data if API fails
      setPrayers(mockMyPrayers);
    } finally {
      setLoading(false);
    }
  };

  // Fetch prayers on component mount
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchMyPrayers();
    }
  }, [isLoggedIn, user]);

  const handlePrayerCreated = (newPrayer) => {
    console.log('New prayer created:', newPrayer);
    // Refresh prayers list after creating new prayer
    fetchMyPrayers();
  };

  // Mock data for my prayers - used as fallback
  const mockMyPrayers = [
    {
      id: 1,
      user: { name: user?.name || "You" },
      timeAgo: "2 hours ago",
      urgency: "Normal",
      prayerText: "Please pray for my upcoming job interview. I've been preparing for weeks and I'm feeling nervous but hopeful.",
      status: "Draft",
      communities: ["Career Ministry", "Personal"],
      mood: "😰",
      timeline: [
        { user: "You", action: "Created", time: "2h ago" }
      ],
      comments: []
    },
    {
      id: 2,
      user: { name: user?.name || "You" },
      timeAgo: "1 day ago",
      urgency: "Urgent",
      prayerText: "Thank you all for your prayers! My grandmother's surgery went well and she's recovering nicely. God is faithful!",
      status: "Submitted",
      communities: ["Family Prayer", "Church Group"],
      mood: "🙏",
      timeline: [
        { user: "Pastor Mike", action: "Read", time: "1h ago" },
        { user: "Sarah K.", action: "Read", time: "3h ago" },
        { user: "You", action: "Submitted", time: "1d ago" }
      ],
      comments: [
        { 
          user: "Pastor Mike", 
          text: "Praise God! So wonderful to hear this testimony of His faithfulness.", 
          time: "20 hours ago",
          reactions: { "🙏": 8, "♥️": 5, "🎉": 3 }
        }
      ]
    },
    {
      id: 3,
      user: { name: user?.name || "You" },
      timeAgo: "3 days ago",
      urgency: "Low",
      prayerText: "Please pray for wisdom in making some important financial decisions for our family. We want to honor God with our choices.",
      status: "Scheduled",
      communities: ["Financial Peace", "Marriage Ministry"],
      mood: "🤔",
      timeline: [
        { user: "Financial Counselor", action: "Read", time: "2d ago" },
        { user: "You", action: "Scheduled", time: "3d ago" }
      ],
      comments: [
        { 
          user: "Financial Counselor Tom", 
          text: "Happy to pray for you both. Feel free to reach out if you need guidance.", 
          time: "2 days ago",
          reactions: { "🙏": 4, "♥️": 2 }
        }
      ]
    }
  ];

  // Function to determine prayer status based on schema
  const getPrayerStatus = (prayer) => {
    if (prayer.isDraft) return "Draft";
    if (prayer.isScheduled) return "Scheduled";
    if (prayer.isPrayed && prayer.isPrayed.includes(user?._id)) return "Answered";
    if (!prayer.isDraft && !prayer.isScheduled) return "Submitted";
    return "Submitted"; // Default fallback
  };

  // Function to filter prayers based on active tab
  const getFilteredPrayers = (prayers, activeTab) => {
    if (!activeTab || activeTab === "All") return prayers;

    return prayers.filter(prayer => {
      const status = getPrayerStatus(prayer);
      return status === activeTab;
    });
  };

  const myPrayersTabs = ["All", "Draft", "Scheduled", "Submitted", "Answered"];

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
      pageType="my-prayers"
      onLogout={handleLogout}
      showTabs={true}
      customTabs={myPrayersTabs}
      prayers={prayers}
      loading={loading}
      error={error}
      onRefresh={fetchMyPrayers}
      onCreatePrayer={handlePrayerCreated}
      getPrayerStatus={getPrayerStatus}
      getFilteredPrayers={getFilteredPrayers}
      user={user}
    />
  );
};

export default MyPrayers;
