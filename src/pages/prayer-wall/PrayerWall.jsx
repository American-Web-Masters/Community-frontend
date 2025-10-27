import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";

const PrayerWall = () => {
  const user = useSelector(selectUser);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Prayer Wall</h1>
        <p className="text-xl text-gray-600 mb-4">Welcome back, {user?.firstName || 'User'}!</p>
        <p className="text-lg text-gray-500">Coming Soon</p>
      </div>
    </div>
  );
};

export default PrayerWall;