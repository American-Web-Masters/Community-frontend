import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn, clearUser } from "../../store/userSlice";
import PrayerPageLayout from "../../components/ui/PrayerPageLayout";
import { apiClient } from "../../api";

const AnsweredPrayers = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    dispatch(clearUser());
  };

  // Function to fetch answered prayers from API
  const fetchAnsweredPrayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/prayers/answered');
      console.log(response);
      if (response.data.success) {
        setPrayers(response.data.data.prayers || []);
      } else {
        throw new Error('Failed to fetch answered prayers');
      }
    } catch (err) {
      console.error('Error fetching answered prayers:', err);
      setError('Failed to load answered prayers. Please try again.');
      // Fallback to mock data if API fails
      setPrayers(mockAnsweredPrayers);
    } finally {
      setLoading(false);
    }
  };

  // Fetch prayers on component mount
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchAnsweredPrayers();
    }
  }, [isLoggedIn, user]);

  const handlePrayerCreated = (newPrayer) => {
    console.log('New prayer created:', newPrayer);
    // Refresh prayers list after creating new prayer
    fetchAnsweredPrayers();
  };

  // Mock data for answered prayers - used as fallback
  const mockAnsweredPrayers = [
    {
      id: 1,
      user: { name: "Maria Rodriguez" },
      timeAgo: "1 week ago",
      urgency: "Answered",
      prayerText: "ANSWERED PRAYER: My daughter got accepted into her dream college with a full scholarship! Thank you everyone for your prayers over the past year. God's timing is perfect!",
      status: "Answered",
      communities: ["Youth Group", "Education Ministry", "Family Prayer"],
      mood: "🎉",
      timeline: [
        { user: "College Advisor", action: "Celebrated", time: "1w ago" },
        { user: "Youth Pastor", action: "Celebrated", time: "1w ago" },
        { user: "Maria Rodriguez", action: "Marked Answered", time: "1w ago" }
      ],
      comments: [
        { 
          user: "Youth Pastor Mike", 
          text: "This is incredible! We've been praying for this for months. God is so faithful!", 
          time: "6 days ago",
          reactions: { "🙏": 25, "♥️": 18, "🎉": 20, "🎓": 12 }
        },
        { 
          user: "College Advisor Sarah", 
          text: "As someone who helped with applications, I can say this is truly a miracle. Praise God!", 
          time: "5 days ago",
          reactions: { "🙏": 15, "♥️": 10, "🎉": 8 }
        },
        { 
          user: "Community Member Lisa", 
          text: "I'm crying tears of joy! Your daughter deserves this blessing. So happy for your family!", 
          time: "4 days ago",
          reactions: { "🙏": 12, "♥️": 15, "😭": 6 }
        }
      ]
    },
    {
      id: 2,
      user: { name: "Robert Kim" },
      timeAgo: "2 weeks ago",
      urgency: "Answered",
      prayerText: "ANSWERED PRAYER: My father's heart surgery was successful and he's made a full recovery! The doctors said it was one of the smoothest operations they've performed. Thank you for all your emergency prayers!",
      status: "Answered",
      communities: ["Prayer Group", "Emergency Prayer Team", "Medical Ministry"],
      mood: "🙏",
      timeline: [
        { user: "Dr. Johnson", action: "Confirmed", time: "2w ago" },
        { user: "Prayer Team Lead", action: "Celebrated", time: "2w ago" },
        { user: "Robert Kim", action: "Marked Answered", time: "2w ago" }
      ],
      comments: [
        { 
          user: "Dr. Johnson", 
          text: "As his surgeon, I can attest that this recovery has been remarkable. Truly blessed.", 
          time: "12 days ago",
          reactions: { "🙏": 30, "♥️": 22, "🩺": 8, "👨‍⚕️": 5 }
        },
        { 
          user: "Prayer Team Lead", 
          text: "Our entire prayer team mobilized for this. Seeing God's healing power is always amazing!", 
          time: "10 days ago",
          reactions: { "🙏": 28, "♥️": 18, "✨": 10 }
        }
      ]
    },
    {
      id: 3,
      user: { name: "Jennifer and Michael Adams" },
      timeAgo: "3 weeks ago",
      urgency: "Answered",
      prayerText: "ANSWERED PRAYER: We found the perfect house within our budget after months of searching! The whole process went smoothly and we close next week. Thank you for praying for God's provision and wisdom!",
      status: "Answered",
      communities: ["Marriage Ministry", "Financial Peace", "New Beginnings"],
      mood: "🏠",
      timeline: [
        { user: "Real Estate Agent", action: "Celebrated", time: "3w ago" },
        { user: "Financial Counselor", action: "Celebrated", time: "3w ago" },
        { user: "Jennifer Adams", action: "Marked Answered", time: "3w ago" }
      ],
      comments: [
        { 
          user: "Real Estate Agent Tom", 
          text: "In 20 years of real estate, I've rarely seen everything fall into place so perfectly. Blessed!", 
          time: "18 days ago",
          reactions: { "🙏": 18, "♥️": 14, "🏠": 12, "✨": 6 }
        },
        { 
          user: "Financial Counselor Mary", 
          text: "Your patience and faith throughout this process has been inspiring. So happy for you both!", 
          time: "16 days ago",
          reactions: { "🙏": 15, "♥️": 12, "💰": 4 }
        }
      ]
    },
    {
      id: 4,
      user: { name: "Pastor John Mitchell" },
      timeAgo: "1 month ago",
      urgency: "Answered",
      prayerText: "ANSWERED PRAYER: Our church's mission trip to Honduras was incredibly successful! We built 3 homes, held 5 medical clinics, and saw 50 people accept Christ. Thank you for your prayers for safety, resources, and hearts to be opened!",
      status: "Answered",
      communities: ["Mission Ministry", "Global Outreach", "Church Leadership"],
      mood: "✝️",
      timeline: [
        { user: "Mission Team", action: "Celebrated", time: "1m ago" },
        { user: "Honduras Partner", action: "Celebrated", time: "1m ago" },
        { user: "Pastor John", action: "Marked Answered", time: "1m ago" }
      ],
      comments: [
        { 
          user: "Mission Team Leader Sarah", 
          text: "This trip exceeded all our expectations. God moved in mighty ways through our church family!", 
          time: "25 days ago",
          reactions: { "🙏": 35, "♥️": 28, "✝️": 20, "🌍": 15 }
        },
        { 
          user: "Honduras Partner Carlos", 
          text: "Your church blessed our community beyond measure. The families you helped will never forget this.", 
          time: "22 days ago",
          reactions: { "🙏": 40, "♥️": 32, "🏠": 12, "❤️‍🔥": 8 }
        }
      ]
    },
    {
      id: 5,
      user: { name: "Sarah Williams" },
      timeAgo: "5 weeks ago",
      urgency: "Answered",
      prayerText: "ANSWERED PRAYER: After 2 years of struggling with infertility, we're pregnant! The doctors said it was unlikely, but God had other plans. We're overwhelmed with gratitude for all your prayers and support!",
      status: "Answered",
      communities: ["Women's Ministry", "Family Prayer", "Couples Support"],
      mood: "👶",
      timeline: [
        { user: "Dr. Martinez", action: "Confirmed", time: "5w ago" },
        { user: "Women's Ministry", action: "Celebrated", time: "5w ago" },
        { user: "Sarah Williams", action: "Marked Answered", time: "5w ago" }
      ],
      comments: [
        { 
          user: "Dr. Martinez", 
          text: "After following Sarah's journey, this is truly a miracle. So happy to share this joy with you!", 
          time: "30 days ago",
          reactions: { "🙏": 45, "♥️": 38, "👶": 25, "✨": 18 }
        },
        { 
          user: "Women's Ministry Leader Anna", 
          text: "We've prayed over you so many times. This baby is already so loved by our entire community!", 
          time: "28 days ago",
          reactions: { "🙏": 40, "♥️": 35, "👶": 22, "😭": 15 }
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
      pageType="answered"
      onLogout={handleLogout}
      showTabs={false}
      prayers={prayers}
      loading={loading}
      error={error}
      onRefresh={fetchAnsweredPrayers}
      onCreatePrayer={handlePrayerCreated}
    />
  );
};

export default AnsweredPrayers;
