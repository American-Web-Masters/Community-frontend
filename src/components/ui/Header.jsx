import React from "react";
import { IoNotificationsOutline, IoSearchOutline } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";

const Header = ({ 
  showNotification = true, 
  showFilter = true, 
  showSearch = true,
  onNotificationClick,
  onLogoutClick,
  onFilterClick,
  onSearchClick 
}) => {
  return (
    <div className="w-[98vw] bg-white/35 backdrop-blur-sm px-2 py-2 rounded-full shadow-sm relative top-2 mx-2">
      <div className="flex items-center justify-between max-w-full">
        {/* Left side - Notification */}
        <div className="flex-1">
          {showNotification && (
            <button
              onClick={onNotificationClick}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <IoNotificationsOutline className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
        
        {/* Right side - Filter and Search */}
        <div className="flex items-center space-x-3">

          <button
            onClick={onLogoutClick}
            className="px-4 py-2 md:px-6 text-xs cursor-pointer bg-red-500 text-white rounded-full shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            Logout
          </button>

          <button  className="px-4 py-2 md:px-6 text-xs cursor-pointer btn-blue-gradient rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
            Donate Now
          </button>


          {showFilter && (
            <button
              onClick={onFilterClick}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <CiFilter className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          {showSearch && (
            <button
              onClick={onSearchClick}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <IoSearchOutline className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;