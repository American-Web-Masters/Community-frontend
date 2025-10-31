import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { selectUser, selectIsLoggedIn, clearUser } from "../../store/userSlice";
import BottomNavBar from "../../components/ui/BottomNavBar";
import Header from "../../components/ui/Header";
import PrayerCard from "./PrayerCard";
import CreatePrayerModal from "../../components/ui/CreatePrayerModal";
import { apiClient } from "../../api";

const Home = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("All");
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    dispatch(clearUser());
  };

  const handleToggleExpand = (cardId) => {
    console.log("Toggling card with ID:", cardId);
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
        console.log("Card collapsed:", cardId);
      } else {
        newSet.add(cardId);
        console.log("Card expanded:", cardId);
      }
      console.log("Current expanded cards:", Array.from(newSet));
      return newSet;
    });
  };

  const handleCreatePrayer = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
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

  // Helper function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const createdAt = new Date(dateString);
    const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return `${Math.floor(diffInMinutes / 10080)}w`;
  };

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
    <div className="min-h-screen light-background overflow-hidden">
      {/* Header */}
      <Header
        onNotificationClick={() => console.log("Notification clicked")}
        onFilterClick={() => console.log("Filter clicked")}
        onSearchClick={() => console.log("Search clicked")}
        onLogoutClick={handleLogout}
      />
      {/* Statistics */}
      <div className="px-6 py-4 mt-5">
        <div className="flex justify-between">
        <div className="flex items-center space-x-6 md:space-x-12 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-semibold text-xs md:text-sm text-gray-900">
              247 praying together
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <svg
              width="22"
              height="22"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.8327 12.5L14.166 5.20833V8.85416C10.8327 8.85416 4.16602 11.0417 4.16602 19.7917C4.16602 18.576 6.16602 16.1458 14.166 16.1458V19.7917L20.8327 12.5Z"
                stroke="url(#paint0_linear_2373_1183)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_2373_1183"
                  x1="12.4993"
                  y1="5.20833"
                  x2="12.4993"
                  y2="19.7917"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#03045E" />
                  <stop offset="1" stop-color="#007FD4" />
                </linearGradient>
              </defs>
            </svg>

            <span className="font-semibold text-xs md:text-sm text-gray-900">
              100 Shared Prayers
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.5939 12.0313C18.9064 15.4688 16.3146 18.705 12.6767 19.4286C9.03872 20.1523 5.34701 18.4601 3.5205 15.2317C1.694 12.0034 2.14491 7.96749 4.63887 5.22187C7.13284 2.47623 11.3439 1.71877 14.7814 3.09377"
                stroke="url(#paint0_linear_2373_1187)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7.90625 10.6562L11.3438 14.0938L19.5938 5.15625"
                stroke="url(#paint1_linear_2373_1187)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_2373_1187"
                  x1="11.0001"
                  y1="2.4239"
                  x2="11.0001"
                  y2="19.5943"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#03045E" />
                  <stop offset="1" stop-color="#007FD4" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_2373_1187"
                  x1="13.75"
                  y1="5.15625"
                  x2="13.75"
                  y2="14.0938"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#03045E" />
                  <stop offset="1" stop-color="#007FD4" />
                </linearGradient>
              </defs>
            </svg>

            <span className="font-semibold text-xs md:text-sm text-gray-900">
              120 Prayers Answered
            </span>
          </div>
          </div>
          {/* Add Prayer Button */}
          <button 
            onClick={handleCreatePrayer}
            className="btn-blue-gradient text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="text-2xl">+</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Section */}
      <div className="bg-white/35 backdrop-blur-sm mx-4 rounded-full shadow-sm border border-white/35 p-1 mb-6 overflow-x-auto">
          <div className="flex items-center min-w-max h-16 gap-2 md:gap-5">
            {/* My Prayers Button */}
            <button className="btn-blue-gradient text-white px-3 md:px-6 h-full rounded-full text-sm font-medium flex items-center space-x-2 md:space-x-3 shadow-sm whitespace-nowrap">
                <svg width="32" height="32" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25.0013 20.8333C29.6037 20.8333 33.3346 17.1024 33.3346 12.5C33.3346 7.89762 29.6037 4.16666 25.0013 4.16666C20.3989 4.16666 16.668 7.89762 16.668 12.5C16.668 17.1024 20.3989 20.8333 25.0013 20.8333Z" stroke="#ffffff" stroke-width="3"/>
                  <path d="M41.6673 36.4583C41.6673 41.6354 41.6673 45.8333 25.0007 45.8333C8.33398 45.8333 8.33398 41.6354 8.33398 36.4583C8.33398 31.2812 15.7965 27.0833 25.0007 27.0833C34.2048 27.0833 41.6673 31.2812 41.6673 36.4583Z" stroke="#ffffff" stroke-width="3"/>
                </svg>
              <div className="flex flex-col items-start">
                <span className="text-xs md:text-sm">My Prayers</span>
                <span className="text-xs opacity-70">Our Request</span>
              </div>
            </button>

            {/* Updates Button */}
            <button className="bg-white/10 text-gray-700 px-3 md:px-6 h-full rounded-full text-sm font-medium flex items-center space-x-2 md:space-x-3 shadow-sm border border-[#03045E33] whitespace-nowrap">
                <svg width="32" height="32" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.7649 20.7792L15.9378 18.3688C16.0563 18.2993 16.1874 18.2539 16.3235 18.2353C16.4596 18.2167 16.5981 18.2252 16.7309 18.2603C16.8637 18.2954 16.9883 18.3565 17.0974 18.4399C17.2065 18.5234 17.2981 18.6276 17.3668 18.7465C17.4354 18.8655 17.4799 18.9969 17.4976 19.1331C17.5153 19.2693 17.5059 19.4077 17.4699 19.5403C17.4339 19.6729 17.3721 19.797 17.2879 19.9056C17.2037 20.0142 17.0989 20.105 16.9795 20.1729L10.667 23.8188C10.5484 23.8875 10.4175 23.9321 10.2817 23.9502C10.1458 23.9682 10.0078 23.9592 9.87539 23.9238C9.74301 23.8884 9.61893 23.8272 9.51024 23.7438C9.40155 23.6603 9.3104 23.5562 9.242 23.4375L5.59616 17.1229C5.52669 17.0044 5.48134 16.8733 5.46273 16.7372C5.44412 16.6011 5.45261 16.4627 5.48773 16.3299C5.52284 16.197 5.58388 16.0725 5.66732 15.9634C5.75077 15.8542 5.85498 15.7627 5.97395 15.694C6.09292 15.6253 6.2243 15.5808 6.36053 15.5631C6.49676 15.5454 6.63514 15.5548 6.76772 15.5908C6.90029 15.6268 7.02444 15.6887 7.13301 15.7729C7.24158 15.857 7.33243 15.9618 7.40033 16.0813L9.77116 20.1792C10.8343 16.4182 13.1117 13.1146 16.2485 10.7833C19.3853 8.45189 23.2053 7.22374 27.113 7.29022C31.0208 7.35671 34.7967 8.71409 37.8524 11.1508C40.9081 13.5875 43.0719 16.9667 44.0064 20.7616C44.941 24.5566 44.5938 28.554 43.0191 32.1311C41.4443 35.7081 38.7305 38.6637 35.3005 40.5372C31.8705 42.4106 27.917 43.0968 24.0563 42.4886C20.1956 41.8805 16.6445 40.0122 13.9566 37.175C13.7665 36.9744 13.6639 36.7066 13.6713 36.4303C13.6787 36.1541 13.7956 35.8922 13.9962 35.7021C14.1967 35.512 14.4646 35.4094 14.7408 35.4168C15.017 35.4243 15.279 35.5411 15.4691 35.7417C17.8418 38.2463 20.9767 39.8952 24.3848 40.4311C27.7929 40.9671 31.2826 40.3601 34.3096 38.7047C37.3365 37.0492 39.7304 34.4386 41.1179 31.2799C42.5054 28.1212 42.8085 24.592 41.9799 21.243C41.1513 17.894 39.2375 14.9134 36.5372 12.7661C33.8368 10.6188 30.5017 9.42565 27.0521 9.37269C23.6025 9.31973 20.2324 10.41 17.4674 12.4733C14.7024 14.5367 12.696 17.4572 11.7649 20.7792Z" fill="#03045E"/>
                  <path d="M26.8112 15.625C27.0875 15.625 27.3524 15.7347 27.5478 15.9301C27.7431 16.1254 27.8529 16.3904 27.8529 16.6667V24.5688L31.7154 28.4292C31.911 28.6245 32.021 28.8895 32.0212 29.1659C32.0213 29.4424 31.9117 29.7075 31.7164 29.9031C31.5211 30.0987 31.2561 30.2087 30.9796 30.2089C30.7032 30.2091 30.438 30.0995 30.2424 29.9042L26.0758 25.7375C25.9787 25.6408 25.9017 25.5258 25.8492 25.3993C25.7966 25.2727 25.7696 25.137 25.7695 25V16.6667C25.7695 16.3904 25.8793 16.1254 26.0746 15.9301C26.27 15.7347 26.5349 15.625 26.8112 15.625Z" fill="#03045E"/>
                </svg>
              <div className="flex flex-col items-start">
                <span className="text-xs md:text-sm">Updates</span>
                <span className="text-xs opacity-70">Recent Activity</span>
              </div>
            </button>

            {/* Answered Button */}
            <button className="bg-white/10 text-gray-700 px-3 md:px-6 h-full rounded-full text-sm font-medium flex items-center space-x-2 md:space-x-3 shadow-sm border border-[#03045E33] whitespace-nowrap">
              <IoMdCheckmarkCircleOutline className="w-3 h-3 md:w-8 md:h-8 text-gray-600" />
              <div className="flex flex-col items-start">
                <span className="text-xs md:text-sm">Answered</span>
                <span className="text-xs text-gray-500">Fulfilled Prayers</span>
              </div>
            </button>
          </div>
      </div>

      {/* Tabs Section */}
      <div className="px-4 md:px-6 mb-6 md:w-[60%] lg:w-[40%]">
        <div className="bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-white/50 p-1 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab
                    ? "btn-blue-gradient text-white rounded-full shadow-sm"
                    : "text-gray-600 hover:bg-white/30 rounded-full"
                } ${index === 0 ? 'rounded-l-full' : ''} ${index === tabs.length - 1 ? 'rounded-r-full' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prayer Cards Grid */}
      <div className="flex-1 px-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading prayers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchPrayers}
                className="btn-blue-gradient text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          </div>
        ) : prayers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-600 mb-4">No prayers found</p>
              <button 
                onClick={handleCreatePrayer}
                className="btn-blue-gradient text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Create First Prayer
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto items-start">
            {prayers.map((prayer) => (
              <div key={prayer._id} className="w-full">
                <PrayerCard
                  user={prayer.anonymous ? { name: "Anonymous" } : { name: "User" }}
                  timeAgo={getTimeAgo(prayer.createdAt)}
                  urgency={prayer.urgency}
                  prayerText={prayer.content}
                  status={null} // Keep hardcoded for now
                  communities={["Prayer Community"]} // Keep hardcoded for now
                  mood={prayer.moodEmoji}
                  timeline={[
                    { user: "Someone", action: "Read", time: "1h ago" },
                    { user: "Another", action: "Read", time: "2h ago" }
                  ]} // Keep hardcoded for now
                  comments={prayer.comments.map(comment => ({
                    user: "Community Member",
                    text: comment.commentText,
                    time: getTimeAgo(comment.createdAt),
                    reactions: { "🙏": 5, "♥️": 3 } // Keep hardcoded for now
                  }))}
                  tags={prayer.tags}
                  isExpanded={expandedCards.has(prayer._id)}
                  onToggleExpand={() => handleToggleExpand(prayer._id)}
                  onPray={() => console.log("Pray clicked", prayer._id)}
                  onBookmark={() => console.log("Bookmark clicked", prayer._id)}
                  onComment={() => console.log("Comment clicked", prayer._id)}
                  onShare={() => console.log("Share clicked", prayer._id)}
                  onMore={() => console.log("More clicked", prayer._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavBar />

      {/* Create Prayer Modal */}
      <CreatePrayerModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSuccess={handlePrayerCreated}
      />
    </div>
  );
};

export default Home;
