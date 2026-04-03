import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import BottomNavBar from "../../components/ui/BottomNavBar";
import Header from "../../components/ui/Header";
import CreateCommunityModal from "../../components/ui/CreateCommunityModal";
import { getUserProfile } from "../../api";
import { ProfileHeader, Posts, Communities, Testimony, Journal, SubscriptionMgt } from "./subcomponents";

const Profile = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();
  const { username } = useParams();
  const { logout } = useLogout();
  const [activeTab, setActiveTab] = useState("Posts");
  const postsRef = useRef(null);
  const communitiesRef = useRef(null);
  const testimonyRef = useRef(null);
  const journalRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const result = await getUserProfile(username);
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

    if (isLoggedIn && user && username) {
      fetchUserProfile();
    }
  }, [isLoggedIn, user, username]);

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
  buttonAction: () => setIsCreateCommunityModalOpen(true)
    },
    { 
      name: "Testimonies", 
      component: Testimony,
      buttonText: "Share Your Story",
      buttonAction: () => {
        if (testimonyRef.current?.openCreateModal) {
          testimonyRef.current.openCreateModal();
        }
      }
    },
    { 
      name: "Journal", 
      component: Journal,
      buttonText: "Create New Entry",
      buttonAction: () => {
        // Keep the same "parent triggers child" pattern when possible.
        // Journal doesn't expose a modal yet, so we fall back to the create route.
        if (journalRef.current?.openCreateModal) {
          journalRef.current.openCreateModal();
          return;
        }
        navigate('/create');
      }
    },
    { 
      name: "Subscriptions", 
      component: SubscriptionMgt,
      buttonText: null, // No button for subscriptions
      buttonAction: null
    },
  ];

  const filterTabs = tabs.filter(tab => !(tab.name === "Subscriptions" && user?.username !== username));

  const ActiveComponent = filterTabs.find(tab => tab.name === activeTab)?.component || Posts;
  const activeTabData = filterTabs.find(tab => tab.name === activeTab);

  return (
    <div className="min-h-screen light-background overflow-x-hidden">
      <Header
        showNotification={true}
        showFilter={false}
        showSearch={false}
        onLogoutClick={handleLogout}
      />
      
      <div className="pt-10 pb-20">
        {/* Profile Header - Keep visible while loading; show skeleton content inside */}
        <ProfileHeader
          userProfile={userProfile}
          isLoading={loading}
          onProfileUpdate={(updated) =>
            setUserProfile((prev) => ({ ...prev, ...updated }))
          }
        />

        {/* Tabs Navigation */}
        <div className="mt-6 w-full md:w-4/6 mx-auto">
          {/* Header with tabs and create button */}
          <div className="mb-6 px-4 md:px-0">
            {/* Large Desktop (>=lg) - tabs and button on same line */}
            <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
              {/* Tab Navigation */}
              <div className="flex items-center bg-white/90 rounded-full p-0.5 backdrop-blur-sm">
                {filterTabs.map((tab) => (
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
              <div className="flex items-center bg-white/90 rounded-full p-1 backdrop-blur-sm w-full overflow-x-hidden">
                <div className="flex w-full">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={`flex-1 py-2.5 px-4 rounded-full cursor-pointer text-sm sm:text-sm font-medium transition-all duration-200 text-center ${
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
              <div className="flex items-center bg-white/90 rounded-full p-1 backdrop-blur-sm w-full overflow-x-auto">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex-1 py-2.5 px-4 rounded-full cursor-pointer text-sm font-medium transition-all duration-200 text-center ${
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
        <div className="max-sm:min-w-[95%] md:w-4/6 mx-auto overflow-x-hidden">
          {activeTab === "Posts" ? (
            <Posts ref={postsRef} userProfile={userProfile} />
          ) : activeTab === "Communities" ? (
            <Communities ref={communitiesRef} userProfile={userProfile} />
          ) : activeTab === "Testimonies" ? (
            <Testimony ref={testimonyRef} userProfile={userProfile} />
          ) : activeTab === "Journal" ? (
            <Journal
              ref={journalRef}
              userProfile={userProfile}
              onOpenLinkedPrayer={(prayerId) => {
                setActiveTab('Posts');
                // Wait for Posts tab to render, then focus the card.
                window.setTimeout(() => postsRef.current?.focusPrayerById?.(prayerId), 180);
              }}
            />
          ) : (
            <ActiveComponent userProfile={userProfile} />
          )}
        </div>

        {/* Create Community Modal (reuses same component as Communities page) */}
        <CreateCommunityModal
          isOpen={isCreateCommunityModalOpen}
          onClose={() => setIsCreateCommunityModalOpen(false)}
          onSuccess={() => {
            // Close modal then refresh profile communities list if available
            setIsCreateCommunityModalOpen(false);
            communitiesRef.current?.refresh?.();
          }}
        />
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Profile;