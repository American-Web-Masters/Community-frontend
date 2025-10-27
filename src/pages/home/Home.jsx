import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn, clearUser } from "../../store/userSlice";
import BottomNavBar from "../../components/ui/BottomNavBar";
import PrayerWall from "../prayer-wall/PrayerWall";
import Communities from "../communities/Communities";
import Create from "../create/Create";
import Messages from "../messages/Messages";
import Profile from "../profile/Profile";

const Home = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('prayer-wall');

  const handleLogout = () => {
    dispatch(clearUser());
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'prayer-wall':
        return <PrayerWall />;
      case 'communities':
        return <Communities />;
      case 'create':
        return <Create />;
      case 'messages':
        return <Messages />;
      case 'profile':
        return <Profile />;
      default:
        return <PrayerWall />;
    }
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
    <div className="min-h-screen light-background">
      {/* Main content area */}
      {renderTabContent()}
      
      {/* Bottom navigation */}
      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Home;
