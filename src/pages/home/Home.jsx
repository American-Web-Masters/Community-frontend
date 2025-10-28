import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn, clearUser } from "../../store/userSlice";
import BottomNavBar from "../../components/ui/BottomNavBar";
import Header from "../../components/ui/Header";
import PrayerCard from "./PrayerCard";

const Home = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("All");

  const handleLogout = () => {
    dispatch(clearUser());
  };

  // Mock data for prayer cards - matches the image
  const prayerCards = [
    {
      id: 1,
      user: { name: "David Park" },
      timeAgo: "2 min",
      urgency: "Urgent",
      prayerText:
        "Please pray for my grandmother who is in the hospital. She has been struggling with her health lately, and the doctors are running several tests to figure out what's going on. It's been a difficult tim...",
      status: null,
    },
    {
      id: 2,
      user: { name: "David Park" },
      timeAgo: "2 min",
      urgency: "Urgent",
      prayerText:
        "Please pray for my grandmother who is in the hospital. She has been struggling with her health lately, and the doctors are running several tests to figure out what's going on. It's been a difficult tim...",
      status: null,
    },
    {
      id: 3,
      user: { name: "David Park" },
      timeAgo: "2 min",
      urgency: "Low",
      prayerText:
        "Please pray for my grandmother who is in the hospital. She has been struggling with her health lately, and the doctors are running several tests to figure out what's going on. It's been a difficult tim...",
      status: "Draft",
    },
    {
      id: 4,
      user: { name: "David Park" },
      timeAgo: "2 min",
      urgency: "Normal",
      prayerText:
        "Please pray for my grandmother who is in the hospital. She has been struggling with her health lately, and the doctors are running several tests to figure out what's going on. It's been a difficult tim...",
      status: "Draft",
    },
    {
      id: 5,
      user: { name: "David Park" },
      timeAgo: "2 min",
      urgency: "Urgent",
      prayerText:
        "Please pray for my grandmother who is in the hospital. She has been struggling with her health lately, and the doctors are running several tests to figure out what's going on. It's been a difficult tim...",
      status: "Scheduled",
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
          <button className="btn-blue-gradient text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200">
            <span className="text-2xl">+</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Section */}
      <div className="bg-white/35 backdrop-blur-sm mx-4 rounded-full shadow-sm border border-white/35 p-1 mb-6 overflow-x-auto">
          <div className="flex items-center min-w-max h-16 gap-2 md:gap-5">
            {/* My Prayers Button */}
            <button className="btn-blue-gradient text-white px-3 md:px-6 h-full rounded-full text-sm font-medium flex items-center space-x-2 md:space-x-3 shadow-sm whitespace-nowrap">
              <div className="w-3 h-3 md:w-6 md:h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs">👤</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs md:text-sm">My Prayers</span>
                <span className="text-xs opacity-90">Our Request</span>
              </div>
            </button>

            {/* Updates Button */}
            <button className="bg-white/10 text-gray-700 px-3 md:px-6 h-full rounded-full text-sm font-medium flex items-center space-x-2 md:space-x-3 shadow-sm border border-[#03045E33] whitespace-nowrap">
              <div className="w-3 h-3 md:w-6 md:h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-xs">🔄</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs md:text-sm">Updates</span>
                <span className="text-xs text-gray-500">Recent Activity</span>
              </div>
            </button>

            {/* Answered Button */}
            <button className="bg-white/10 text-gray-700 px-3 md:px-6 h-full rounded-full text-sm font-medium flex items-center space-x-2 md:space-x-3 shadow-sm border border-[#03045E33] whitespace-nowrap">
              <div className="w-3 h-3 md:w-6 md:h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-xs">✓</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs md:text-sm">Answered</span>
                <span className="text-xs text-gray-500">Fulfilled Prayers</span>
              </div>
            </button>
          </div>
      </div>

      {/* Tabs Section */}
      <div className="px-4 md:px-6 mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-white/50 p-1 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-blue-600 text-white rounded-full shadow-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto">
          {prayerCards.map((prayer) => (
            <PrayerCard
              key={prayer.id}
              user={prayer.user}
              timeAgo={prayer.timeAgo}
              urgency={prayer.urgency}
              prayerText={prayer.prayerText}
              status={prayer.status}
              onPray={() => console.log("Pray clicked", prayer.id)}
              onBookmark={() => console.log("Bookmark clicked", prayer.id)}
              onComment={() => console.log("Comment clicked", prayer.id)}
              onShare={() => console.log("Share clicked", prayer.id)}
              onMore={() => console.log("More clicked", prayer.id)}
            />
          ))}
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Home;
