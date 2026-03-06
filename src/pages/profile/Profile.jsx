import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import BottomNavBar from "../../components/ui/BottomNavBar";
import Header from "../../components/ui/Header";
import { getUserProfile } from "../../api";
import { ProfileHeader, Posts, Communities, Testimony, Journal, SubscriptionMgt } from "./subcomponents";

const Profile = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();
  const { logout } = useLogout();
  const [activeTab, setActiveTab] = useState("Posts");
  const postsRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const result = await getUserProfile();
        if (result.success) {
          setUserProfile(result.data);
        } else {
          console.error('Error fetching user profile:', result.error);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn && user) {
      fetchUserProfile();
    }
  }, [isLoggedIn, user]);

  const handleLogout = () => {
    logout();
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Please log in to access this page.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { 
      name: "Posts", 
      component: Posts,
      buttonText: "Create New Post",
      buttonAction: () => {
        // Trigger the create modal in the Posts component
        if (postsRef.current?.openCreateModal) {
          postsRef.current.openCreateModal();
        }
      }
    },
    { 
      name: "Communities", 
      component: Communities,
      buttonText: "Create Community",
      buttonAction: () => console.log('Create Community') // Add your logic here
    },
    { 
      name: "Testimonies", 
      component: Testimony,
      buttonText: "Share Your Story",
      buttonAction: () => console.log('Share Story') // Add your logic here
    },
    { 
      name: "Journal", 
      component: Journal,
      buttonText: "Create New Entry",
      buttonAction: () => console.log('Create Entry') // Add your logic here
    },
    { 
      name: "Subscriptions", 
      component: SubscriptionMgt,
      buttonText: null, // No button for subscriptions
      buttonAction: null
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component || Posts;
  const activeTabData = tabs.find(tab => tab.name === activeTab);

  return (
    <div className="min-h-screen light-background overflow-x-hidden">
      <Header />
      
      <div className="pt-10 pb-20">
        {/* Profile Header - Always visible */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ProfileHeader userProfile={userProfile} />
        )}

        {/* Tabs Navigation */}
        <div className="mt-6 w-full md:w-3/4 mx-auto">
          {/* Header with tabs and create button */}
          <div className="mb-6 px-4 lg:px-0">
            {/* Large Desktop (>=lg) - tabs and button on same line */}
            <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
              {/* Tab Navigation */}
              <div className="flex items-center bg-white/90 rounded-full p-0.5 backdrop-blur-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`px-6 py-3 rounded-full cursor-pointer text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.name
                        ? "btn-blue-gradient text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/30"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Create Button - Large Desktop */}
              {activeTabData?.buttonText && (
                <button
                  onClick={activeTabData.buttonAction}
                  className="btn-blue-gradient cursor-pointer text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-200 flex items-center space-x-3 shadow-lg whitespace-nowrap"
                >
                  <span>{activeTabData.buttonText}</span>
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xl font-bold relative -top-0.5">+</span>
                  </div>
                </button>
              )}
            </div>

            {/* Medium layout (sm to lg) - tabs full width, button below and right-aligned */}
            <div className="hidden sm:flex lg:hidden flex-col items-stretch space-y-3">
              <div className="flex items-center bg-white/90 rounded-full p-1 backdrop-blur-sm w-full">
                <div className="flex w-full">
                  {tabs.map((tab) => (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={`flex-1 py-2.5 px-3 rounded-full cursor-pointer text-xs sm:text-sm font-medium transition-all duration-200 text-center ${
                        activeTab === tab.name
                          ? "btn-blue-gradient text-white shadow-lg"
                          : "text-gray-700 hover:bg-white/30"
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button sits below tabs and aligned to the right on sm..lg */}
              {activeTabData?.buttonText && (
                <div className="w-full flex justify-end">
                  <button
                    onClick={activeTabData.buttonAction}
                    className="btn-blue-gradient cursor-pointer text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-200 flex items-center space-x-3 shadow-lg"
                  >
                    <span>{activeTabData.buttonText}</span>
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xl font-bold relative -top-0.5">+</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Tab Navigation - Mobile (full width, centered) */}
            <div className="flex sm:hidden w-full">
              <div className="flex items-center bg-white/90 rounded-full p-1 backdrop-blur-sm w-full">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex-1 py-2.5 px-2 rounded-full cursor-pointer text-xs font-medium transition-all duration-200 text-center ${
                      activeTab === tab.name
                        ? "btn-blue-gradient text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/30"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile action button: full-width under tabs */}
            {activeTabData?.buttonText && (
              <div className="w-full sm:hidden mt-3">
                <button
                  onClick={activeTabData.buttonAction}
                  className="w-full btn-blue-gradient text-white px-4 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
                >
                  <span>{activeTabData.buttonText}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-sm:min-w-[95%] sm:w-3/4 mx-auto max-sm:mx-4">
          {activeTab === "Posts" ? (
            <Posts ref={postsRef} />
          ) : (
            <ActiveComponent />
          )}
        </div>

        {/* Logout Button - Fixed at bottom of content */}
        <div className="max-w-6xl mx-auto px-6 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                <p className="text-sm text-gray-600">Manage your account preferences</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Profile;