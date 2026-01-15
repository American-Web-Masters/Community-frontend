import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import BottomNavBar from "../../components/ui/BottomNavBar";
import Header from "../../components/ui/Header";

const Profile = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout();
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

  const profileMenuItems = [
    {
      title: "My Subscriptions",
      description: "Manage your recurring payments",
      icon: "💳",
      onClick: () => navigate('/my-subscriptions')
    },
    {
      title: "Logout",
      description: "Sign out of your account",
      icon: "🚪",
      onClick: handleLogout,
      isDestructive: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-16 pb-20">
        <div className="max-w-md mx-auto p-4">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.username || 'User'
                }
              </h2>
              {user.email && (
                <p className="text-gray-600 text-sm">{user.email}</p>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {profileMenuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full p-4 bg-white rounded-lg shadow-lg text-left hover:shadow-xl transition-shadow ${
                  item.isDestructive ? 'hover:bg-red-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-4">{item.icon}</span>
                  <div>
                    <h3 className={`font-medium ${
                      item.isDestructive ? 'text-red-600' : 'text-gray-800'
                    }`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <BottomNavBar />
    </div>
  );
};

export default Profile;