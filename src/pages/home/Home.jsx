import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn, clearUser } from "../../store/userSlice";
import PrayerPageLayout from "../../components/ui/PrayerPageLayout";
import { apiClient } from "../../api";

const Home = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    dispatch(clearUser());
  };

  const handlePrayerCreated = (newPrayer) => {
    console.log('New prayer created:', newPrayer);
    // Refresh prayers list after creating new prayer
    fetchPrayers();
  };

  // Function to fetch prayers from API
  const fetchPrayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/prayers');
      
      if (response.data.success) {
        setPrayers(response.data.data.prayers || []);
      } else {
        throw new Error('Failed to fetch prayers');
      }
    } catch (err) {
      console.error('Error fetching prayers:', err);
      setError('Failed to load prayers. Please try again.');
      // Fallback to mock data if API fails
      setPrayers(mockPrayerCards);
    } finally {
      setLoading(false);
    }
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
    },
    {
      id: 2,
      user: { name: "Sarah Johnson" },
      timeAgo: "5 min",
      urgency: "Normal",
      prayerText:
        "Please pray for my job interview tomorrow. I've been unemployed for 3 months and this opportunity means everything to my family. I'm nervous but trusting God's plan.",
      status: null,
      communities: ["Youth Group", "Career Ministry"],
      mood: "😰",
      timeline: [
        { user: "Pastor Mike", action: "Read", time: "1h ago" },
        { user: "Lisa K.", action: "Read", time: "2h ago" }
      ],
      comments: [
        { 
          user: "Pastor Mike", 
          text: "Praying for God's favor and peace over your interview. Trust in His timing!", 
          time: "1 hour ago",
          reactions: { "🙏": 8, "♥️": 5 }
        }
      ]
    },
    {
      id: 3,
      user: { name: "Mark Thompson" },
      timeAgo: "10 min",
      urgency: "Low",
      prayerText:
        "Thank you all for your prayers! My son's surgery went well and he's recovering beautifully. God is good!",
      status: "Draft",
      communities: ["Church Group"],
      mood: "🙏",
      timeline: [
        { user: "Emma R.", action: "Read", time: "5m ago" },
        { user: "David L.", action: "Read", time: "8m ago" }
      ],
      comments: [
        { 
          user: "Emma Rodriguez", 
          text: "Praise God! So happy to hear the good news. Continued prayers for his recovery.", 
          time: "30 minutes ago",
          reactions: { "🙏": 12, "♥️": 8, "🎉": 6 }
        }
      ]
    },
    {
      id: 4,
      user: { name: "Jennifer Adams" },
      timeAgo: "15 min",
      urgency: "Normal",
      prayerText:
        "Please pray for wisdom as my husband and I make some important financial decisions. We want to honor God with our choices.",
      status: "Draft",
      communities: ["Marriage Ministry", "Financial Peace"],
      mood: "🤔",
      timeline: [
        { user: "Pastor John", action: "Read", time: "10m ago" },
        { user: "Mary S.", action: "Read", time: "12m ago" }
      ],
      comments: [
        { 
          user: "Financial Counselor Tom", 
          text: "Praying for wisdom and discernment in your decisions. Happy to chat if you need guidance.", 
          time: "45 minutes ago",
          reactions: { "🙏": 4, "♥️": 2 }
        }
      ]
    },
    {
      id: 5,
      user: { name: "Robert Kim" },
      timeAgo: "20 min",
      urgency: "Urgent",
      prayerText:
        "Emergency prayer request: My father was just rushed to the hospital with chest pains. Please pray for the doctors and for God's healing touch.",
      status: "Scheduled",
      communities: ["Prayer Group", "Emergency Prayer Team"],
      mood: "😰",
      timeline: [
        { user: "Prayer Team Lead", action: "Read", time: "2m ago" },
        { user: "Dr. Williams", action: "Read", time: "5m ago" }
      ],
      comments: [
        { 
          user: "Prayer Team Lead", 
          text: "Lifting your father up in prayer right now. The whole prayer team is mobilized.", 
          time: "15 minutes ago",
          reactions: { "🙏": 15, "♥️": 10 }
        }
      ]
    },
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
      onRefresh={fetchPrayers}
      onCreatePrayer={handlePrayerCreated}
    />
  );
};

export default Home;
