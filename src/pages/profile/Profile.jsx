import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import BottomNavBar from "../../components/ui/BottomNavBar";
import Header from "../../components/ui/Header";
import { ProfileHeader, Posts, Communities, Testimony, Journal, SubscriptionMgt } from "./subcomponents";

const Profile = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();
  const { logout } = useLogout();
  const [activeTab, setActiveTab] = useState("Posts");

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
      buttonAction: () => navigate('/create')
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
      
      <div className="pt-16 pb-20">
        {/* Profile Header - Always visible */}
        <ProfileHeader />

        {/* Tabs Navigation */}
        <div className="px-4 mt-6 mb-6">
          <div className="max-w-6xl mx-auto">
            {/* Mobile Tab Navigation with Button */}
            <div className="flex sm:hidden items-center justify-between gap-3">
              {/* Tabs - Scrollable */}
              <div className="flex overflow-x-auto scrollbar-hide pb-2 flex-1">
                <div className="flex items-center bg-white/90 rounded-full p-1 backdrop-blur-sm min-w-max">
                  {tabs.map((tab) => (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={`flex items-center space-x-2 py-2.5 px-4 rounded-full cursor-pointer text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        activeTab === tab.name
                          ? "btn-blue-gradient text-white shadow-lg"
                          : "text-gray-700 hover:bg-white/30"
                      }`}
                    >
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {activeTabData?.buttonText && (
                <button
                  onClick={activeTabData.buttonAction}
                  className="btn-blue-gradient text-white px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  <span>{activeTabData.buttonText}</span>
                  <span className="text-lg">+</span>
                </button>
              )}
            </div>

            {/* Desktop Tab Navigation with Button */}
            <div className="hidden sm:flex items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex items-center bg-white/90 rounded-full p-1 backdrop-blur-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full cursor-pointer text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.name
                        ? "btn-blue-gradient text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/30"
                    }`}
                  >
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* Action Button */}
              {activeTabData?.buttonText && (
                <button
                  onClick={activeTabData.buttonAction}
                  className="btn-blue-gradient text-white px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-4 cursor-pointer "
                >
                  <span>{activeTabData.buttonText}</span>
                  <div className="bg-white rounded-full text-black text-3xl  w-8 h-8 flex justify-center items-center pb-1">
                    +
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto px-4">
          <ActiveComponent />
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