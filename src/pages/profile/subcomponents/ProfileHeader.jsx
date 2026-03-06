import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";

const ProfileHeader = ({ userProfile }) => {
  const user = useSelector(selectUser);
  console.log("User Profile",userProfile)

  // Use real data from API with fallback placeholders
  const profileData = {
    name: userProfile ? `${userProfile.firstname || "First"} ${userProfile.lastname || "Last"}` : "Loading...",
    username: userProfile?.username || "username",
    email: userProfile?.email || "email@example.com",
    profileImage: userProfile?.profilePicture || null,
    verse: userProfile?.verse || '"Add your favorite verse here"',
    bio: userProfile?.bio || "Tell us about your faith journey...",
    streak: 21, // This might come from a different endpoint
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-3/4 mx-auto rounded-xl shadow-md overflow-hidden mb-6 max-md:w-[98%]">
      {/* Main Profile Section */}
      <div className="relative px-6 pt-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex md:items-center space-x-6 w-full max-md:flex-col">
            {/* Profile Image */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg max-md:mb-2">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {profileData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              )}
            </div>

            <div className="flex flex-col flex-1">
              {/* Name and Username */}
              <div className="mb-3">
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {profileData.name}
                </h1>
                <div className="flex items-center space-x-3">
                  <p className="text-gray-600 text-sm">
                    @{profileData.username} 
                  </p>
                  <span className="text-gray-400 text-sm">|</span>
                  {/* Streak */}
                  <div className="flex items-center space-x-1">
                    <span className="text-orange-500">🔥</span>
                    <span className="text-sm font-medium text-gray-700">
                      {profileData.streak}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verse Banner */}
              <div className="btn-blue-gradient cursor-pointer text-white px-4 py-1.5 mb-4 rounded-md">
                <p className={`text-sm font-medium italic ${!userProfile?.verse ? 'opacity-70' : ''}`}>
                  {profileData.verse}
                </p>
              </div>

              {/* Bio */}
              <div className="mb-4">
                <p className={`text-gray-700 text-sm leading-relaxed ${!userProfile?.bio ? 'italic opacity-70' : ''}`}>
                  {profileData.bio}
                </p>
              </div>
            </div>
          </div>

          {/* Action Icons */}
        </div>
        <div className="absolute top-4 right-3 flex items-center space-x-3">
          {/* Support Button */}
          <div className="flex justify-center align-center ">
            <button className="btn-blue-gradient cursor-pointer text-white text-sm font-medium rounded-full transition-transform flex items-center space-x-2 py-2 px-4 ">
              <span>🤍</span>
              <span>Support</span>
            </button>
          </div>
          {/* Share Icon */}
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer ">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>

          {/* Edit Icon */}
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* Settings Icon */}
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
