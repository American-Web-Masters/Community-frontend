import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import InfiniteScroll from 'react-infinite-scroll-component';
import BottomNavBar from "./BottomNavBar";
import Header from "./Header";
import PrayerCard from "./PrayerCard";
import CreatePrayerModal from "./CreatePrayerModal";
import { selectUser } from "../../store/userSlice";
import { isSharedByUser } from "../../api/prayer";
import { useStableMasonry } from "../../hooks/useStableMasonry";

const PrayerPageLayout = ({ 
  pageType = "prayer-wall", // prayer-wall, my-prayers, updates, answered
  onLogout,
  showTabs = false,
  customTabs = [],
  prayers = [],
  loading = false,
  error = null,
  hasMore = false,
  fetchMoreItems = null,
  useInfiniteScroll = false,
  onRefresh,
  onCreatePrayer,
  getPrayerStatus = null,
  getFilteredPrayers = null,
  user = null,
  bookmarkedPrayers = [],
  loadingBookmarks = false,
  onRefreshBookmarks,
  onRemoveBookmark = null,
  customRenderer = null,
  onPublishDraft = null, // New callback for publishing draft prayers
  highlightedPrayerId = null
}) => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const [activeTab, setActiveTab] = useState(customTabs.length > 0 ? customTabs[0] : "All");
  
  // Initialize expanded cards with highlighted prayer if present
  const [expandedCards, setExpandedCards] = useState(() => {
    const initialSet = new Set();
    if (highlightedPrayerId) {
      initialSet.add(highlightedPrayerId);
    }
    return initialSet;
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    urgency: [],
    mood: [],
    tags: [],
    anonymous: null
  });

  // Effect to fetch bookmarks when switching to bookmarks tab
  useEffect(() => {
    if (activeTab === "Bookmarks" && onRefreshBookmarks) {
      onRefreshBookmarks();
    }
  }, []);

  const handleToggleExpand = (cardId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleCreatePrayerClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handlePrayerCreated = (newPrayer) => {
    if (onCreatePrayer) {
      onCreatePrayer(newPrayer);
    }
    handleCloseModal();
  };

  // Search and Filter handlers
  const handleSearchClick = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery(""); // Clear search when closing
    }
  };

  const handleFilterClick = () => {
    setShowFilter(!showFilter);
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'anonymous') {
        newFilters.anonymous = newFilters.anonymous === value ? null : value;
      } else {
        const currentValues = newFilters[filterType];
        if (currentValues.includes(value)) {
          newFilters[filterType] = currentValues.filter(v => v !== value);
        } else {
          newFilters[filterType] = [...currentValues, value];
        }
      }
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      urgency: [],
      mood: [],
      tags: [],
      anonymous: null
    });
    setSearchQuery("");
  };

  // Apply search and filters to prayers
  const applySearchAndFilters = (prayersToFilter) => {
    let filtered = [...prayersToFilter];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prayer => {
        const content = (prayer.content || prayer.prayerText || "").toLowerCase();
        const userName = (prayer.user?.firstname || prayer.user?.username || "").toLowerCase();
        const tags = (prayer.tags || []).join(" ").toLowerCase();
        
        return content.includes(query) || userName.includes(query) || tags.includes(query);
      });
    }

    // Apply urgency filter
    if (activeFilters.urgency.length > 0) {
      filtered = filtered.filter(prayer => 
        activeFilters.urgency.includes(prayer.urgency)
      );
    }

    // Apply mood filter
    if (activeFilters.mood.length > 0) {
      filtered = filtered.filter(prayer => 
        activeFilters.mood.includes(prayer.moodEmoji || prayer.mood)
      );
    }

    // Apply tags filter
    if (activeFilters.tags.length > 0) {
      filtered = filtered.filter(prayer => {
        const prayerTags = prayer.tags || [];
        return activeFilters.tags.some(tag => 
          prayerTags.some(prayerTag => 
            prayerTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
      });
    }

    // Apply anonymous filter
    if (activeFilters.anonymous !== null) {
      filtered = filtered.filter(prayer => 
        prayer.anonymous === activeFilters.anonymous
      );
    }

    return filtered;
  };

  // Calculate filtered prayers at component top level
  const getFilteredPrayersForRendering = () => {
    let filteredPrayers;
    
    if (pageType === "updates" && getFilteredPrayers) {
      filteredPrayers = getFilteredPrayers(activeTab);
    } else if (pageType === "my-prayers" && getFilteredPrayers) {
      filteredPrayers = getFilteredPrayers(prayers, activeTab);
    } else {
      filteredPrayers = prayers;
    }
    
    // Apply search and filters (skip for updates page with custom renderer)
    if (!(pageType === "updates" && customRenderer)) {
      filteredPrayers = applySearchAndFilters(filteredPrayers);
    }
    
    return filteredPrayers;
  };

  const filteredPrayers = getFilteredPrayersForRendering();
  
  // Use stable masonry hook at top level with filtered prayers
  const masonryColumns = useStableMasonry(filteredPrayers, 2);

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

  // Page specific configurations
  // Scroll to highlighted prayer
  useEffect(() => {
    if (highlightedPrayerId && filteredPrayers.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`prayer-card-${highlightedPrayerId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500); // Give masonry a moment to render
    }
  }, [highlightedPrayerId, filteredPrayers.length]);


  const pageConfigs = {
    "prayer-wall": {
      title: "Prayer Wall",
      subtitle: "Explore prayers",
      activeButton: 0,
      showStats: true
    },
    "my-prayers": {
      title: "My Prayers", 
      subtitle: "Recent Activity",
      activeButton: 1,
      showStats: false
    },
    "updates": {
      title: "Updates",
      subtitle: "Recent Activity", 
      activeButton: 2,
      showStats: false
    },
    "answered": {
      title: "Answered",
      subtitle: "Fulfilled Prayers",
      activeButton: 3,
      showStats: false
    }
  };

  const config = pageConfigs[pageType] || pageConfigs["prayer-wall"];

  return (
    <div className="min-h-screen light-background overflow-hidden">
      {/* Header */}
      <Header
        onFilterClick={handleFilterClick}
        onSearchClick={handleSearchClick}
        onLogoutClick={onLogout}
        isSearchActive={showSearch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isFilterActive={showFilter}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
      />

      {/* Statistics - only show for prayer wall */}
        <div className="px-2 py-2 md:px-6 md:py-4 mt-2">
          <div className="flex justify-between">
            <div className="flex items-center space-x-6 md:space-x-12 text-sm">
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
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                      <stop stopColor="#03045E" />
                      <stop offset="1" stopColor="#007FD4" />
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
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.90625 10.6562L11.3438 14.0938L19.5938 5.15625"
                    stroke="url(#paint1_linear_2373_1187)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                      <stop stopColor="#03045E" />
                      <stop offset="1" stopColor="#007FD4" />
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear_2373_1187"
                      x1="13.75"
                      y1="5.15625"
                      x2="13.75"
                      y2="14.0938"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#03045E" />
                      <stop offset="1" stopColor="#007FD4" />
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
              onClick={handleCreatePrayerClick}
              className="btn-blue-gradient cursor-pointer text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 pb-1"
            >
              <span className="text-2xl">+</span>
            </button>
          </div>
        </div>

      {/* Main Navigation Section */}
      <div className="bg-white/35 backdrop-blur-sm mx-4 rounded-full shadow-sm border border-white/35 p-1 mb-6 overflow-x-auto">
        <div className="flex items-center min-w-max h-16 gap-2 md:gap-5">
          {/* Prayer Wall Button */}
          <button 
            onClick={() => navigate('/')}
            className={`${config.activeButton === 0 ? 'btn-blue-gradient text-white' : 'bg-white/10 text-gray-700 border border-[#03045E33]'} px-3 md:px-6 h-full rounded-full text-sm font-medium flex items-center space-x-2 md:space-x-3 shadow-sm whitespace-nowrap hover:opacity-90 transition-opacity cursor-pointer`}>
            <svg width="32" height="32" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.0013 20.8333C29.6037 20.8333 33.3346 17.1024 33.3346 12.5C33.3346 7.89762 29.6037 4.16666 25.0013 4.16666C20.3989 4.16666 16.668 7.89762 16.668 12.5C16.668 17.1024 20.3989 20.8333 25.0013 20.8333Z" stroke={config.activeButton === 0 ? "#ffffff" : "#03045E"} strokeWidth="3"/>
              <path d="M41.6673 36.4583C41.6673 41.6354 41.6673 45.8333 25.0007 45.8333C8.33398 45.8333 8.33398 41.6354 8.33398 36.4583C8.33398 31.2812 15.7965 27.0833 25.0007 27.0833C34.2048 27.0833 41.6673 31.2812 41.6673 36.4583Z" stroke={config.activeButton === 0 ? "#ffffff" : "#03045E"} strokeWidth="3"/>
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-xs md:text-sm">Prayer Wall</span>
              <span className="text-xs opacity-70">Explore prayers</span>
            </div>
          </button>

          {/* My Prayers Button */}
          <button 
            onClick={() => navigate('/my-prayers')}
            className={`${config.activeButton === 1 ? 'btn-blue-gradient text-white' : 'bg-white/10 text-gray-700 border border-[#03045E33]'} px-3 md:px-6 h-full rounded-full text-sm font-medium flex items-center space-x-2 md:space-x-3 shadow-sm whitespace-nowrap hover:opacity-90 transition-opacity cursor-pointer`}>
            <svg width="32" height="32" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.0013 20.8333C29.6037 20.8333 33.3346 17.1024 33.3346 12.5C33.3346 7.89762 29.6037 4.16666 25.0013 4.16666C20.3989 4.16666 16.668 7.89762 16.668 12.5C16.668 17.1024 20.3989 20.8333 25.0013 20.8333Z" stroke={config.activeButton === 1 ? "#ffffff" : "#03045E"} strokeWidth="3"/>
              <path d="M41.6673 36.4583C41.6673 41.6354 41.6673 45.8333 25.0007 45.8333C8.33398 45.8333 8.33398 41.6354 8.33398 36.4583C8.33398 31.2812 15.7965 27.0833 25.0007 27.0833C34.2048 27.0833 41.6673 31.2812 41.6673 36.4583Z" stroke={config.activeButton === 1 ? "#ffffff" : "#03045E"} strokeWidth="3"/>
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-xs md:text-sm">My Prayers</span>
              <span className="text-xs opacity-70">Your Requests</span>
            </div>
          </button>

          {/* Updates Button */}
          <button 
            onClick={() => navigate('/updates')}
            className={`${config.activeButton === 2 ? 'btn-blue-gradient text-white' : 'bg-white/10 text-gray-700 border border-[#03045E33]'} px-3 md:px-6 h-full rounded-full text-sm font-medium flex items-center space-x-2 md:space-x-3 shadow-sm whitespace-nowrap hover:opacity-90 transition-opacity cursor-pointer`}>
            <svg width="32" height="32" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.7649 20.7792L15.9378 18.3688C16.0563 18.2993 16.1874 18.2539 16.3235 18.2353C16.4596 18.2167 16.5981 18.2252 16.7309 18.2603C16.8637 18.2954 16.9883 18.3565 17.0974 18.4399C17.2065 18.5234 17.2981 18.6276 17.3668 18.7465C17.4354 18.8655 17.4799 18.9969 17.4976 19.1331C17.5153 19.2693 17.5059 19.4077 17.4699 19.5403C17.4339 19.6729 17.3721 19.797 17.2879 19.9056C17.2037 20.0142 17.0989 20.105 16.9795 20.1729L10.667 23.8188C10.5484 23.8875 10.4175 23.9321 10.2817 23.9502C10.1458 23.9682 10.0078 23.9592 9.87539 23.9238C9.74301 23.8884 9.61893 23.8272 9.51024 23.7438C9.40155 23.6603 9.3104 23.5562 9.242 23.4375L5.59616 17.1229C5.52669 17.0044 5.48134 16.8733 5.46273 16.7372C5.44412 16.6011 5.45261 16.4627 5.48773 16.3299C5.52284 16.197 5.58388 16.0725 5.66732 15.9634C5.75077 15.8542 5.85498 15.7627 5.97395 15.694C6.09292 15.6253 6.2243 15.5808 6.36053 15.5631C6.49676 15.5454 6.63514 15.5548 6.76772 15.5908C6.90029 15.6268 7.02444 15.6887 7.13301 15.7729C7.24158 15.857 7.33243 15.9618 7.40033 16.0813L9.77116 20.1792C10.8343 16.4182 13.1117 13.1146 16.2485 10.7833C19.3853 8.45189 23.2053 7.22374 27.113 7.29022C31.0208 7.35671 34.7967 8.71409 37.8524 11.1508C40.9081 13.5875 43.0719 16.9667 44.0064 20.7616C44.941 24.5566 44.5938 28.554 43.0191 32.1311C41.4443 35.7081 38.7305 38.6637 35.3005 40.5372C31.8705 42.4106 27.917 43.0968 24.0563 42.4886C20.1956 41.8805 16.6445 40.0122 13.9566 37.175C13.7665 36.9744 13.6639 36.7066 13.6713 36.4303C13.6787 36.1541 13.7956 35.8922 13.9962 35.7021C14.1967 35.512 14.4646 35.4094 14.7408 35.4168C15.017 35.4243 15.279 35.5411 15.4691 35.7417C17.8418 38.2463 20.9767 39.8952 24.3848 40.4311C27.7929 40.9671 31.2826 40.3601 34.3096 38.7047C37.3365 37.0492 39.7304 34.4386 41.1179 31.2799C42.5054 28.1212 42.8085 24.592 41.9799 21.243C41.1513 17.894 39.2375 14.9134 36.5372 12.7661C33.8368 10.6188 30.5017 9.42565 27.0521 9.37269C23.6025 9.31973 20.2324 10.41 17.4674 12.4733C14.7024 14.5367 12.696 17.4572 11.7649 20.7792Z" fill={config.activeButton === 2 ? "#ffffff" : "#03045E"}/>
              <path d="M26.8112 15.625C27.0875 15.625 27.3524 15.7347 27.5478 15.9301C27.7431 16.1254 27.8529 16.3904 27.8529 16.6667V24.5688L31.7154 28.4292C31.911 28.6245 32.021 28.8895 32.0212 29.1659C32.0213 29.4424 31.9117 29.7075 31.7164 29.9031C31.5211 30.0987 31.2561 30.2087 30.9796 30.2089C30.7032 30.2091 30.438 30.0995 30.2424 29.9042L26.0758 25.7375C25.9787 25.6408 25.9017 25.5258 25.8492 25.3993C25.7966 25.2727 25.7696 25.137 25.7695 25V16.6667C25.7695 16.3904 25.8793 16.1254 26.0746 15.9301C26.27 15.7347 26.5349 15.625 26.8112 15.625Z" fill={config.activeButton === 2 ? "#ffffff" : "#03045E"}/>
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-xs md:text-sm">Updates</span>
              <span className="text-xs opacity-70">Recent Activity</span>
            </div>
          </button>

          {/* Answered Button */}
          <button 
            onClick={() => navigate('/answered')}
            className={`${config.activeButton === 3 ? 'btn-blue-gradient text-white' : 'bg-white/10 text-gray-700 border border-[#03045E33]'} px-3 md:px-6 h-full rounded-full text-sm font-medium flex items-center space-x-2 md:space-x-3 shadow-sm whitespace-nowrap hover:opacity-90 transition-opacity cursor-pointer`}>
            <IoMdCheckmarkCircleOutline className={`w-3 h-3 md:w-8 md:h-8 ${config.activeButton === 3 ? 'text-white' : 'text-gray-600'}`} />
            <div className="flex flex-col items-start">
              <span className="text-xs md:text-sm">Answered</span>
              <span className="text-xs opacity-70">Fulfilled Prayers</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs Section - only show if showTabs is true */}
      {showTabs && customTabs.length > 0 && (
        <div className="px-4 md:px-6 mb-6 md:w-[70%] lg:w-[55%]">
          <div className="bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-white/50 p-1 overflow-x-auto">
            <div className="flex min-w-max">
              {customTabs.map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-2 cursor-pointer text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab
                      ? "btn-blue-gradient text-white rounded-full shadow-sm"
                      : "text-gray-600 hover:bg-white/30 rounded-full"
                  } ${index === 0 ? 'rounded-l-full' : ''} ${index === customTabs.length - 1 ? 'rounded-r-full' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prayer Cards Grid */}
      <div className="flex-1 px-6 pb-24">
        {/* Handle loading state for different tabs */}
        {(loading || (activeTab === "Bookmarks" && loadingBookmarks)) ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {activeTab === "Bookmarks" ? "Loading bookmarked prayers..." : "Loading prayers..."}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={onRefresh}
                className="btn-blue-gradient text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredPrayers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {activeTab === "Bookmarks" 
                  ? "No bookmarked prayers found" 
                  : pageType === "my-prayers" && activeTab !== "All" 
                    ? `No ${activeTab.toLowerCase()} prayers found`
                    : "No prayers found"
                }
              </p>
              {activeTab === "Bookmarks" ? (
                <p className="text-sm text-gray-500">
                  Bookmark prayers by clicking the bookmark icon on any prayer card.
                </p>
              ) : prayers.length === 0 && (
                <button 
                  onClick={handleCreatePrayerClick}
                  className="btn-blue-gradient text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Create First Prayer
                </button>
              )}
            </div>
          </div>
        ) : useInfiniteScroll && fetchMoreItems ? (
          <InfiniteScroll
            dataLength={filteredPrayers.length}
            next={fetchMoreItems}
            hasMore={hasMore}
            loader={
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading more prayers...</p>
                </div>
              </div>
            }
            endMessage={
              <div className="flex items-center justify-center py-6">
                <p className="text-gray-500 text-sm">
                  {pageType === "answered" 
                    ? "You've reached the end of answered prayers" 
                    : "You've reached the end of prayers"
                  }
                </p>
              </div>
            }
            style={{ overflow: 'visible' }}
          >
            {customRenderer ? customRenderer(filteredPrayers) : (
              <div className="stable-masonry-container">
                {masonryColumns.map((columnItems, columnIndex) => (
                  <div key={columnIndex} className="masonry-column">
                    {columnItems.map((prayer) => {
                      // Process isPrayed array to get count and check if current user has prayed
                      const prayerCount = prayer.isPrayed ? prayer.isPrayed.length : 0;
                      const userHasPrayed = prayer.isPrayed?.some(prayedUser => {
                        const userId = prayedUser.user?._id || prayedUser._id || prayedUser;
                        return userId === currentUser?._id;
                      }) || false;

                      // Process shares array to get count and check if current user has shared
                      const shareCount = prayer.shares ? prayer.shares.length : 0;
                      const userHasShared = isSharedByUser(prayer, currentUser?._id);

                      return (
                        <div 
                          key={prayer._id || prayer.id} 
                          id={`prayer-card-${prayer._id || prayer.id}`}
                          className={`masonry-item rounded-xl transition-all duration-700 ${
                            highlightedPrayerId === (prayer._id || prayer.id) 
                              ? 'ring-4 ring-blue-400 ring-offset-2 shadow-2xl scale-[1.02]' 
                              : ''
                          }`}
                        >
                          <PrayerCard
                            prayer={prayer}
                            prayerId={prayer._id || prayer.id}
                            user={prayer.anonymous ? { name: "Anonymous" } : { name: prayer.user?.firstname || prayer.user?.username || "User" }}
                            timeAgo={prayer.createdAt ? getTimeAgo(prayer.createdAt) : prayer.timeAgo}
                            urgency={prayer.urgency}
                            prayerText={prayer.content || prayer.prayerText}
                            status={getPrayerStatus ? getPrayerStatus(prayer) : prayer.status}
                            communities={prayer.communities || ["Prayer Community"]}
                            mood={prayer.moodEmoji || prayer.mood}
                            comments={prayer.comments ? prayer.comments.map(comment => {
                              const reactionsCount = {};
                              let userReaction = null;
                              
                              if (comment.reactions && Array.isArray(comment.reactions)) {
                                comment.reactions.forEach(reaction => {
                                  reactionsCount[reaction.emoji] = (reactionsCount[reaction.emoji] || 0) + 1;
                                  if (reaction.user?._id === currentUser?._id || reaction.user === currentUser?._id) {
                                    userReaction = reaction.emoji;
                                  }
                                });
                              }

                              return {
                                _id: comment._id,
                                user: comment.user?.firstname || comment.user?.username || "Community Member",
                                text: comment.commentText || comment.text,
                                time: comment.createdAt ? getTimeAgo(comment.createdAt) : comment.time,
                                reactions: reactionsCount,
                                userReaction: userReaction,
                                userId: comment.user?._id
                              };
                            }) : []}
                            tags={prayer.tags}
                            isExpanded={expandedCards.has(prayer._id || prayer.id)}
                            isPrayed={userHasPrayed}
                            prayerCount={prayerCount}
                            isShared={userHasShared}
                            shareCount={shareCount}
                            onToggleExpand={() => handleToggleExpand(prayer._id || prayer.id)}
                            onPray={() => console.log("Pray clicked", prayer._id || prayer.id)}
                            onBookmark={() => {
                              console.log("Bookmark clicked", prayer._id || prayer.id);
                            }}
                            onComment={() => console.log("Comment clicked", prayer._id || prayer.id)}
                            onShare={() => console.log("Share clicked", prayer._id || prayer.id)}
                            onMore={() => console.log("More clicked", prayer._id || prayer.id)}
                            onPrayedStateChange={(newState) => {
                              console.log("Prayer state changed:", prayer._id || prayer.id, newState);
                            }}
                            onSharedStateChange={(newState) => {
                              console.log("Share state changed:", prayer._id || prayer.id, newState);
                            }}
                            onCommentsUpdate={(updatedComments) => {
                              console.log("Comments updated:", prayer._id || prayer.id, updatedComments);
                            }}
                            onBookmarkStateChange={(newState) => {
                              console.log("Bookmark state changed:", prayer._id || prayer.id, newState);
                              if (!newState && activeTab === "Bookmarks" && onRemoveBookmark) {
                                onRemoveBookmark(prayer._id || prayer.id);
                              }
                            }}
                            showStatusPill={pageType === "my-prayers" && activeTab === "All"}
                            isDraft={prayer.isDraft === true}
                            onPublishDraft={onPublishDraft}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </InfiniteScroll>
        ) : (
          customRenderer ? customRenderer(filteredPrayers) : (
            <div className="stable-masonry-container">
              {masonryColumns.map((columnItems, columnIndex) => (
                <div key={columnIndex} className="masonry-column">
                  {columnItems.map((prayer) => {
                    const prayerCount = prayer.isPrayed ? prayer.isPrayed.length : 0;
                    const userHasPrayed = prayer.isPrayed?.some(prayedUser => {
                      const userId = prayedUser.user?._id || prayedUser._id || prayedUser;
                      return userId === currentUser?._id;
                    }) || false;

                    const shareCount = prayer.shares ? prayer.shares.length : 0;
                    const userHasShared = isSharedByUser(prayer, currentUser?._id);

                    return (
                      <div key={prayer._id || prayer.id} className="masonry-item">
                        <PrayerCard
                          prayer={prayer}
                          prayerId={prayer._id || prayer.id}
                          user={prayer.anonymous ? { name: "Anonymous" } : { name: prayer.user?.firstname || prayer.user?.username || "User" }}
                          timeAgo={prayer.createdAt ? getTimeAgo(prayer.createdAt) : prayer.timeAgo}
                          urgency={prayer.urgency}
                          prayerText={prayer.content || prayer.prayerText}
                          status={getPrayerStatus ? getPrayerStatus(prayer) : prayer.status}
                          communities={prayer.communities || ["Prayer Community"]}
                          mood={prayer.moodEmoji || prayer.mood}
                          comments={prayer.comments ? prayer.comments.map(comment => {
                            const reactionsCount = {};
                            let userReaction = null;
                            
                            if (comment.reactions && Array.isArray(comment.reactions)) {
                              comment.reactions.forEach(reaction => {
                                reactionsCount[reaction.emoji] = (reactionsCount[reaction.emoji] || 0) + 1;
                                if (reaction.user?._id === currentUser?._id || reaction.user === currentUser?._id) {
                                  userReaction = reaction.emoji;
                                }
                              });
                            }

                            return {
                              _id: comment._id,
                              user: comment.user?.firstname || comment.user?.username || "Community Member",
                              text: comment.commentText || comment.text,
                              time: comment.createdAt ? getTimeAgo(comment.createdAt) : comment.time,
                              reactions: reactionsCount,
                              userReaction: userReaction,
                              userId: comment.user?._id
                            };
                          }) : []}
                          tags={prayer.tags}
                          isExpanded={expandedCards.has(prayer._id || prayer.id)}
                          isPrayed={userHasPrayed}
                          prayerCount={prayerCount}
                          isShared={userHasShared}
                          shareCount={shareCount}
                          onToggleExpand={() => handleToggleExpand(prayer._id || prayer.id)}
                          onPray={() => console.log("Pray clicked", prayer._id || prayer.id)}
                          onBookmark={() => {
                            console.log("Bookmark clicked", prayer._id || prayer.id);
                          }}
                          onComment={() => console.log("Comment clicked", prayer._id || prayer.id)}
                          onShare={() => console.log("Share clicked", prayer._id || prayer.id)}
                          onMore={() => console.log("More clicked", prayer._id || prayer.id)}
                          onPrayedStateChange={(newState) => {
                            console.log("Prayer state changed:", prayer._id || prayer.id, newState);
                          }}
                          onSharedStateChange={(newState) => {
                            console.log("Share state changed:", prayer._id || prayer.id, newState);
                          }}
                          onCommentsUpdate={(updatedComments) => {
                            console.log("Comments updated:", prayer._id || prayer.id, updatedComments);
                          }}
                          onBookmarkStateChange={(newState) => {
                            console.log("Bookmark state changed:", prayer._id || prayer.id, newState);
                            if (!newState && activeTab === "Bookmarks" && onRemoveBookmark) {
                              onRemoveBookmark(prayer._id || prayer.id);
                            }
                          }}
                          showStatusPill={pageType === "my-prayers" && activeTab === "All"}
                          isDraft={prayer.isDraft === true}
                          onPublishDraft={onPublishDraft}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )
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

export default PrayerPageLayout;
