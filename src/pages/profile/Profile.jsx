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
    { name: "Posts", icon: "�", component: Posts },
    { name: "Communities", icon: "🏘️", component: Communities },
    { name: "Testimonies", icon: "✨", component: Testimony },
    { name: "Journal", icon: "📔", component: Journal },
    { name: "Subscriptions", icon: "�", component: SubscriptionMgt },
  ];

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component || Posts;

  return (
    <div className="min-h-screen light-background">
      <Header />
      
      <div className="pt-16 pb-20">
        {/* Profile Header - Always visible */}
        <ProfileHeader />

        {/* Tabs Navigation */}
        <div className="sticky top-16 bg-white border-b border-gray-200 z-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.name
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
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