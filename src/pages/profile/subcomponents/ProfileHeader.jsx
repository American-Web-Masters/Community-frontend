import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { selectUser } from "../../../store/userSlice";
import { updateUserProfile } from "../../../api/profile";
import { MdCheck, MdClose, MdCameraAlt } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

const ProfileHeader = ({ userProfile, onProfileUpdate }) => {
  const user = useSelector(selectUser);
  const location = useLocation();
  const navigate = useNavigate();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [headerLoading, setHeaderLoading] = useState(false);
  const [editData, setEditData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    bio: "",
    verse: "",
    profilePicture: null,
    profilePicturePreview: null,
  });

  // Use real data from API with fallback placeholders
  const profileData = {
    name: userProfile
      ? `${userProfile.firstname || "First"} ${userProfile.lastname || "Last"}`
      : "Loading...",
    username: userProfile?.username || "username",
    email: userProfile?.email || "email@example.com",
    profileImage: userProfile?.profilePicture || null,
    verse: userProfile?.verse || '"Add your favorite verse here"',
    bio: userProfile?.bio || "Tell us about your faith journey...",
    streak: 21,
  };

  const handleEditClick = () => {
    setEditData({
      firstname: userProfile?.firstname || "",
      lastname: userProfile?.lastname || "",
      username: userProfile?.username || "",
      bio: userProfile?.bio || "",
      verse: userProfile?.verse || "",
      profilePicture: null,
      profilePicturePreview: userProfile?.profilePicture || null,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      firstname: "",
      lastname: "",
      username: "",
      bio: "",
      verse: "",
      profilePicture: null,
      profilePicturePreview: null,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData((prev) => ({
        ...prev,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = async () => {
    setHeaderLoading(true);
    try {
      const payload = {
        firstname: editData.firstname,
        lastname: editData.lastname,
        username: editData.username,
        bio: editData.bio,
        verse: editData.verse,
      };
      if (editData.profilePicture) {
        payload.profilePicture = editData.profilePicture;
      }

      const result = await updateUserProfile(payload);

      if (result.success) {
        toast.success(result.message || "Profile updated successfully!");
        setIsEditing(false);
        if (onProfileUpdate) {
          onProfileUpdate(result.data);
        }
      } else {
        toast.error(result.error || "Failed to update profile.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setHeaderLoading(false);
    }
  };

  const handleShareProfile = async () => {
    // Use the username from the current URL so sharing always reflects
    // the profile that is actually being viewed.
    const usernameToShare =
      location.pathname.split("/profile/")[1] || userProfile?.username || user?.username;

    if (!usernameToShare) {
      toast.error("Could not determine profile URL.");
      return;
    }

    const url = `${window.location.origin}/profile/${usernameToShare}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard!", { duration: 3000 });
    } catch {
      // Clipboard API may be blocked (e.g. non-HTTPS or permissions denied)
      // Fall back to the legacy execCommand approach
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Profile link copied to clipboard! 🔗", { duration: 3000 });
      } catch {
        toast.error("Failed to copy link. Please copy it manually: " + url, {
          duration: 6000,
        });
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-4/6 mx-auto rounded-xl shadow-md overflow-hidden mb-6 max-md:w-[98%]">
      {/* Main Profile Section */}
      <div className="relative px-6 pt-6 pb-4">
        {isEditing ? (
          /* ── EDIT MODE ── */
          <div className="relative space-y-5">
            {/* Edit mode header row */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-blue-900">Edit Profile</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  disabled={headerLoading}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-1"
                  title="Save changes"
                >
                  {headerLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <MdCheck size={18} />
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={headerLoading}
                  className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                  title="Cancel editing"
                >
                  <MdClose size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-6 max-sm:flex-col">
              {/* Avatar with upload */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300">
                  {editData.profilePicturePreview ? (
                    <img
                      src={editData.profilePicturePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {(editData.firstname?.[0] || "?").toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profileImageInput"
                  className={`absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-200 shadow-lg ${
                    headerLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <MdCameraAlt size={14} />
                </label>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={headerLoading}
                  className="hidden"
                />
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex gap-3 max-sm:flex-col">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editData.firstname}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, firstname: e.target.value }))
                      }
                      disabled={headerLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="First name"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editData.lastname}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, lastname: e.target.value }))
                      }
                      disabled={headerLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, username: e.target.value }))
                    }
                    disabled={headerLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Favourite Verse
                  </label>
                  <input
                    type="text"
                    value={editData.verse}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, verse: e.target.value }))
                    }
                    disabled={headerLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="Add your favourite verse"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    disabled={headerLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                    rows={3}
                    placeholder="Tell us about your faith journey..."
                  />
                </div>
              </div>
            </div>

            {/* Loading overlay */}
            {headerLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium text-sm">Updating profile...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── VIEW MODE ── */
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex md:items-center space-x-6 w-full max-sm:flex-col">
                {/* Profile Image */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg max-md:mb-2 flex-shrink-0">
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
                    <p
                      className={`text-sm font-medium italic ${
                        !userProfile?.verse ? "opacity-70" : ""
                      }`}
                    >
                      {profileData.verse}
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <p
                      className={`text-gray-700 text-sm leading-relaxed ${
                        !userProfile?.bio ? "italic opacity-70" : ""
                      }`}
                    >
                      {profileData.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Icons */}
            </div>
            <div className="absolute top-4 right-3 flex items-center space-x-3 max-lg:flex-col-reverse pb-4">
              {/* Support Button */}
              <div>
              <div className="flex justify-center align-center ">
                <button
                  onClick={() => navigate(`/profile/${userProfile?.username || location.pathname.split('/profile/')[1]}/support`)}
                  className="btn-blue-gradient cursor-pointer text-white text-sm font-medium rounded-full transition-transform flex items-center space-x-2 py-1.5 px-4">
                  <span>🤍</span>
                  <span>Support</span>
                </button>
              </div>
              </div>
              <div>

              {/* Share Icon */}
              <button
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                onClick={handleShareProfile}
                title="Share Profile"
              >
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
              <button
                onClick={handleEditClick}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                title="Edit Profile"
              >
                <FaEdit className="w-5 h-5" />
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
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
