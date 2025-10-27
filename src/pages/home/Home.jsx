import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn, clearUser } from "../../store/userSlice";
import { FaRegUser } from "react-icons/fa";
import {
  PiHandsPrayingThin,
  PiUsersThree,
  PiCross,
  PiChatCircleDots,
} from "react-icons/pi";

const Home = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUser());
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
      {/* <button
            onClick={handleLogout}
            className="px-6 py-2 h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 "
          >
            Logout
          </button> */}

      <div className="btn-blue-gradient w-[350px] md:min-w-[450px] h-14 rounded-full flex items-center justify-center ml-6 fixed bottom-5 left-[48%] transform -translate-x-1/2 overflow-hidden">
        <button className="flex flex-col items-center justify-center flex-1 h-full text-white hover:bg-white/10 transition-colors duration-200">
          <PiHandsPrayingThin className="w-5 h-5 md:w-7 md:h-7 mb-1" />
          <span className="text-xs">Prayer Wall</span>
        </button>
        <button className="flex flex-col items-center justify-center flex-1 h-full text-white hover:bg-white/10 transition-colors duration-200">
          <PiUsersThree className="w-5 h-5 md:w-7 md:h-7 mb-1" />
          <span className="text-xs">Communities</span>
        </button>
        <button className="flex flex-col items-center justify-center flex-1 h-full text-white hover:bg-white/10 transition-colors duration-200 relative">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-1">
            <PiCross className="w-5 h-5 md:w-8 md:h-8 mb-1 text-transparent stroke-primary-500 fill-primary-600 stroke-[2]" />
          </div>
        </button>
        <button className="flex flex-col items-center justify-center flex-1 h-full text-white hover:bg-white/10 transition-colors duration-200">
          <PiChatCircleDots className="w-5 h-5 md:w-7 md:h-7 mb-1" />
          <span className="text-xs">Messages</span>
        </button>
        <button className="flex flex-col items-center justify-center flex-1 h-full text-white hover:bg-white/10 transition-colors duration-200">
          <svg
            width="25"
            height="25"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24.9974 20.8334C29.5998 20.8334 33.3307 17.1024 33.3307 12.5C33.3307 7.89765 29.5998 4.16669 24.9974 4.16669C20.395 4.16669 16.6641 7.89765 16.6641 12.5C16.6641 17.1024 20.395 20.8334 24.9974 20.8334Z"
              stroke="white"
              stroke-width="3.5"
            />
            <path
              d="M41.6654 36.4584C41.6654 41.6355 41.6654 45.8334 24.9987 45.8334C8.33203 45.8334 8.33203 41.6355 8.33203 36.4584C8.33203 31.2813 15.7945 27.0834 24.9987 27.0834C34.2029 27.0834 41.6654 31.2813 41.6654 36.4584Z"
              stroke="white"
              stroke-width="3.5"
            />
          </svg>
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
