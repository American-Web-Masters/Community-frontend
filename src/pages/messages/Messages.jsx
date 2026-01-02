import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import BottomNavBar from "../../components/ui/BottomNavBar";

const Messages = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
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

  return (
    <div className="min-h-screen light-background">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Messages</h1>
          <p className="text-xl text-gray-600">Coming Soon</p>
        </div>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default Messages;