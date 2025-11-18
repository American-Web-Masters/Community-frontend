import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn, clearUser } from "../../store/userSlice";
import PrayerPageLayout from "../../components/ui/PrayerPageLayout";
import { apiClient } from "../../api";

const UpdatePrayers = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    dispatch(clearUser());
  };

  // Function to fetch prayer updates from API
  const fetchPrayerUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/prayers/recent-activity/${user._id}`);
      console.log(response?.data?.data?.recentActivity);
      const prayersData = [...response?.data?.data?.recentActivity?.comments, ...response?.data?.data?.recentActivity?.prayed, ...response?.data?.data?.recentActivity?.shares];
      console.log(prayersData);
      if (response.data.success) {
        setPrayers(prayersData || []);
      } else {
        throw new Error('Failed to fetch prayer updates');
      }
    } catch (err) {
      console.error('Error fetching prayer updates:', err);
      setError('Failed to load prayer updates. Please try again.');
      // Fallback to mock data if API fails
      setPrayers(mockUpdatePrayers);
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

  const handlePrayerCreated = (newPrayer) => {
    console.log('New prayer created:', newPrayer);
    // Refresh prayers list after creating new prayer
    fetchPrayerUpdates();
  };

  // Mock data for prayer updates - used as fallback
  const mockUpdatePrayers = [
    {
      id: 1,
      user: { name: "Sarah Johnson" },
      timeAgo: "30 minutes ago",
      urgency: "Normal",
      prayerText: "UPDATE: Thank you all for praying for my job interview! I got the job! God is so good and faithful. Your prayers mean the world to me.",
      status: null,
      communities: ["Youth Group", "Career Ministry"],
      mood: "🎉",
      timeline: [
        { user: "Pastor Mike", action: "Read", time: "15m ago" },
        { user: "Lisa K.", action: "Read", time: "20m ago" },
        { user: "Sarah Johnson", action: "Updated", time: "30m ago" }
      ],
      comments: [
        { 
          user: "Pastor Mike", 
          text: "Praise God! So excited to hear this wonderful news. God's timing is perfect!", 
          time: "20 minutes ago",
          reactions: { "🙏": 12, "♥️": 8, "🎉": 15 }
        },
        { 
          user: "Lisa K.", 
          text: "Amazing! I'm so happy for you. This is such a testimony of God's faithfulness.", 
          time: "15 minutes ago",
          reactions: { "🙏": 6, "♥️": 4, "🎉": 8 }
        }
      ]
    },
    {
      id: 2,
      user: { name: "Mark Thompson" },
      timeAgo: "2 hours ago",
      urgency: "Urgent",
      prayerText: "UPDATE: My son's recovery is going even better than expected! The doctors are amazed at how quickly he's healing. Thank you for all your prayers - they are working!",
      status: null,
      communities: ["Church Group", "Family Prayer"],
      mood: "🙏",
      timeline: [
        { user: "Dr. Williams", action: "Read", time: "1h ago" },
        { user: "Emma R.", action: "Read", time: "1h ago" },
        { user: "Mark Thompson", action: "Updated", time: "2h ago" }
      ],
      comments: [
        { 
          user: "Dr. Williams", 
          text: "As his doctor, I can confirm the recovery is remarkable. Continued prayers for complete healing.", 
          time: "1 hour ago",
          reactions: { "🙏": 20, "♥️": 12, "🩺": 5 }
        },
        { 
          user: "Emma Rodriguez", 
          text: "This brings tears of joy to my eyes! God is the ultimate healer. Praise Him!", 
          time: "45 minutes ago",
          reactions: { "🙏": 15, "♥️": 10, "😭": 3 }
        }
      ]
    },
    {
      id: 3,
      user: { name: "Jennifer Adams" },
      timeAgo: "4 hours ago",
      urgency: "Low",
      prayerText: "UPDATE: My husband and I had a great meeting with our financial advisor today. We feel much more confident about our decisions now. Thank you for praying for wisdom!",
      status: null,
      communities: ["Marriage Ministry", "Financial Peace"],
      mood: "😊",
      timeline: [
        { user: "Financial Counselor Tom", action: "Read", time: "2h ago" },
        { user: "Pastor John", action: "Read", time: "3h ago" },
        { user: "Jennifer Adams", action: "Updated", time: "4h ago" }
      ],
      comments: [
        { 
          user: "Financial Counselor Tom", 
          text: "So glad the meeting went well! Praying for continued wisdom as you implement these decisions.", 
          time: "3 hours ago",
          reactions: { "🙏": 8, "♥️": 5, "💰": 2 }
        }
      ]
    },
    {
      id: 4,
      user: { name: "David Park" },
      timeAgo: "6 hours ago",
      urgency: "Normal",
      prayerText: "UPDATE: Grandmother is stable now and responding well to treatment. The doctors are optimistic. Please continue to pray for her complete recovery.",
      status: null,
      communities: ["Church Group", "Prayer Group", "Family Prayer"],
      mood: "🤗",
      timeline: [
        { user: "Nurse Mary", action: "Read", time: "3h ago" },
        { user: "Pastor John", action: "Read", time: "4h ago" },
        { user: "David Park", action: "Updated", time: "6h ago" }
      ],
      comments: [
        { 
          user: "Nurse Mary", 
          text: "As her nurse, I can see she's getting stronger each day. Keep trusting in God's healing power.", 
          time: "4 hours ago",
          reactions: { "🙏": 18, "♥️": 12, "👩‍⚕️": 4 }
        },
        { 
          user: "Pastor John", 
          text: "Continuing to lift your grandmother in prayer. God's healing touch is upon her.", 
          time: "3 hours ago",
          reactions: { "🙏": 22, "♥️": 15 }
        }
      ]
    }
  ];

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
      pageType="updates"
      onLogout={handleLogout}
      showTabs={false}
      prayers={prayers}
      loading={loading}
      error={error}
      onRefresh={fetchPrayerUpdates}
      onCreatePrayer={handlePrayerCreated}
    />
  );
};

export default UpdatePrayers;
