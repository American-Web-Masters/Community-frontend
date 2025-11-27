import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn, clearUser } from "../../store/userSlice";
import Header from "../../components/ui/Header";
import BottomNavBar from "../../components/ui/BottomNavBar";
import { CommunityCard } from "./subcomponents";
import { myCommunities, discoveryCommunitiesRow1, discoveryCommunitiesRow2 } from "../../data/mockData";

const Communities = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("My Communities");

  const handleLogout = () => {
    dispatch(clearUser());
  };

  const handleJoinCommunity = (communityId) => {
    console.log("Joining community:", communityId);
    // TODO: Implement join community API call
  };

  const handleViewCommunity = (communityId) => {
    console.log("Viewing community:", communityId);
    // TODO: Implement view community navigation
  };

  const handleCreateCommunity = () => {
    console.log("Creating new community");
    // TODO: Implement create community modal/navigation
  };

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
    <div className="min-h-screen light-background overflow-x-hidden">
      {/* Header */}
      <div className="mt-2">
        <Header
          showNotification={true}
          showFilter={true}
          showSearch={true}
          onLogoutClick={handleLogout}
          onNotificationClick={() => console.log("Notification clicked")}
          onFilterClick={() => console.log("Filter clicked")}
          onSearchClick={() => console.log("Search clicked")}
        />
      </div>

      {/* Communities Section */}
      <div className="px-4 mt-6">
          {/* Header with tabs and create button in same row */}
          <div className="flex items-center justify-between mb-6">
            {/* Tab Navigation */}
            <div className="flex items-center bg-white/90 rounded-full p-0.5 backdrop-blur-sm">
              <button
                onClick={() => setActiveTab("My Communities")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === "My Communities"
                    ? "btn-blue-gradient text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/30"
                }`}
              >
                My Communities
              </button>
              <button
                onClick={() => setActiveTab("Discovery Communities")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === "Discovery Communities"
                    ? "btn-blue-gradient text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/30"
                }`}
              >
                Discovery Communities
              </button>
            </div>

            {/* Create New Community Button */}
            <button
              onClick={handleCreateCommunity}
              className="btn-blue-gradient cursor-pointer text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-200 flex items-center space-x-3 shadow-lg"
            >
              <span>Create New Community</span>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl font-bold relative -top-0.5">+</span>
              </div>
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === "My Communities" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  {...community}
                  onJoinClick={handleJoinCommunity}
                  onViewClick={handleViewCommunity}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* First row of discovery communities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoveryCommunitiesRow1.map((community) => (
                  <CommunityCard
                    key={community.id}
                    {...community}
                    onJoinClick={handleJoinCommunity}
                    onViewClick={handleViewCommunity}
                  />
                ))}
              </div>
              
              {/* Second row of discovery communities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoveryCommunitiesRow2.map((community) => (
                  <CommunityCard
                    key={community.id}
                    {...community}
                    onJoinClick={handleJoinCommunity}
                    onViewClick={handleViewCommunity}
                  />
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Bottom padding for bottom navigation */}
      <div className="pb-24"></div>
      
      <BottomNavBar />
    </div>
  );
};

export default Communities;