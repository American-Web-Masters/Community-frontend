import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { selectUser } from "../../../store/userSlice";
import { updateUserProfile, getUserStripeAccountStatus } from "../../../api/profile";
import { MdCheck, MdClose, MdCameraAlt, MdSettings, MdShare } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import useBiblePassageLookup from "../../../hooks/useBiblePassageLookup";
import ShareModal from "../../../components/ui/ShareModal";

const ProfileHeader = ({
  userProfile,
  isLoading = false,
  onProfileUpdate,
  isOwnProfile = false,
}) => {
  const user = useSelector(selectUser);
  const location = useLocation();
  const navigate = useNavigate();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [headerLoading, setHeaderLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [verseBook, setVerseBook] = useState("");
  const [verseNumber, setVerseNumber] = useState("");
  const [fetchedVerseReference, setFetchedVerseReference] = useState("");
  const [editData, setEditData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    bio: "",
    verse: "",
    profilePicture: null,
    profilePicturePreview: null,
  });

  const [paymentAvailable, setPaymentAvailable] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);

  const verseQuery = useMemo(() => {
    const book = String(verseBook || "").trim();
    const num = String(verseNumber || "").trim();
    return book && num ? `${book} ${num}` : "";
  }, [verseBook, verseNumber]);

  const verseLookup = useBiblePassageLookup(verseQuery, {
    enabled: Boolean(isEditing && verseQuery),
    debounceMs: 450,
  });

  useEffect(() => {
    if (!isEditing) return;
    if (!verseLookup.data) return;

    setEditData((prev) => ({
      ...prev,
      verse: verseLookup.data.text,
    }));
    setFetchedVerseReference(verseLookup.data.reference || "");
  }, [isEditing, verseLookup.data]);

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

  useEffect(() => {
    const checkPayment = async () => {
      const usernameToCheck = location.pathname.split("/profile/")[1] || userProfile?.username;
      if (!usernameToCheck) return;
      
      try {
        setCheckingPayment(true);
        const response = await getUserStripeAccountStatus(usernameToCheck);
        setPaymentAvailable(response?.data?.chargesEnabled || false);
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentAvailable(false);
      } finally {
        setCheckingPayment(false);
      }
    };
    
    checkPayment();
  }, [location.pathname, userProfile?.username]);

  // Keep the header container visible while loading, but show skeleton content
  // until we have a populated userProfile and have checked payment status.
  const showSkeleton = Boolean(isLoading && !userProfile) || checkingPayment;

  const handleEditClick = () => {
    if (!isOwnProfile) return;
    setEditData({
      firstname: userProfile?.firstname || "",
      lastname: userProfile?.lastname || "",
      username: userProfile?.username || "",
      bio: userProfile?.bio || "",
      verse: userProfile?.verse || "",
      profilePicture: null,
      profilePicturePreview: userProfile?.profilePicture || null,
    });
    setVerseBook("");
    setVerseNumber("");
    setFetchedVerseReference("");
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
    setVerseBook("");
    setVerseNumber("");
    setFetchedVerseReference("");
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
    if (!isOwnProfile) return;
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
    setShareUrl(url);
    setIsShareModalOpen(true);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-4/6 mx-auto rounded-xl shadow-md overflow-hidden mb-6 max-md:w-[98%]">
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        title="Share Profile"
        shareText="Check out this profile: "
      />
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
                  disabled={headerLoading || verseLookup.loading}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
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
                  className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
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
                  <div className="flex gap-3 max-sm:flex-col">
                    <input
                      type="text"
                      value={verseBook}
                      onChange={(e) => {
                        setVerseBook(e.target.value);
                        setFetchedVerseReference("");
                      }}
                      disabled={headerLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="Book (e.g., Psalm)"
                      autoComplete="off"
                    />
                    <input
                      type="text"
                      value={verseNumber}
                      onChange={(e) => {
                        setVerseNumber(e.target.value);
                        setFetchedVerseReference("");
                      }}
                      disabled={headerLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="Chapter:Verse (e.g., 118:24)"
                      autoComplete="off"
                    />
                  </div>

                  {verseLookup.loading ? (
                    <p className="mt-2 text-xs text-gray-600">Fetching verse…</p>
                  ) : null}

                  {verseLookup.error ? (
                    <p className="mt-2 text-xs text-red-600">{verseLookup.error}</p>
                  ) : null}

                  {fetchedVerseReference ? (
                    <p className="mt-2 text-xs text-gray-600">Fetched: {fetchedVerseReference}</p>
                  ) : null}

                  <textarea
                    value={editData.verse}
                    readOnly
                    disabled={headerLoading}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none disabled:opacity-50 resize-none"
                    rows={3}
                    placeholder="Verse text will appear here after lookup"
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
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg max-md:mb-2 flex-shrink-0 overflow-hidden">
                  {showSkeleton ? (
                    <div className="w-full h-full bg-gray-200 animate-pulse" />
                  ) : profileData.profileImage ? (
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
                    {showSkeleton ? (
                      <>
                        <div className="h-6 w-48 bg-gray-200/70 rounded-md animate-pulse mb-2" />
                        <div className="flex items-center space-x-3">
                          <div className="h-4 w-32 bg-gray-200/70 rounded-md animate-pulse" />
                          <span className="text-gray-300 text-sm">|</span>
                          <div className="h-4 w-10 bg-gray-200/70 rounded-md animate-pulse" />
                        </div>
                      </>
                    ) : (
                      <>
                        <h1 className="text-xl font-bold text-gray-900 mb-1">
                          {profileData.name}
                        </h1>
                        <div className="flex items-center space-x-3">
                          <p className="text-gray-600 text-sm">@{profileData.username}</p>
                          
                        </div>
                      </>
                    )}
                  </div>

                  {/* Verse Banner */}
                  <div className="btn-blue-gradient cursor-pointer text-white px-4 py-1.5 mb-4 rounded-md">
                    {showSkeleton ? (
                      <div className="space-y-2 py-1">
                        <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                        <div className="h-4 w-5/6 bg-gray-200 rounded-md animate-pulse" />
                      </div>
                    ) : (
                      <p
                        className={`text-sm font-medium italic ${
                          !userProfile?.verse ? "opacity-70" : ""
                        }`}
                      >
                        {profileData.verse}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    {showSkeleton ? (
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200/70 rounded-md animate-pulse" />
                        <div className="h-4 w-11/12 bg-gray-200/70 rounded-md animate-pulse" />
                        <div className="h-4 w-3/4 bg-gray-200/70 rounded-md animate-pulse" />
                      </div>
                    ) : (
                      <p
                        className={`text-gray-700 text-sm leading-relaxed ${
                          !userProfile?.bio ? "italic opacity-70" : ""
                        }`}
                      >
                        {profileData.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Icons */}
            </div>
            <div
              className={`absolute top-4 right-3 flex items-center lg:gap-2 pb-4 ${
                isOwnProfile ? "max-lg:flex-col-reverse" : ""
              }`}
            >
              {/* Chat Button (Only for other profiles) */}
              {!isOwnProfile && (
                <div className="mr-2">
                  <div className="flex justify-center align-center">
                    <button
                      onClick={() =>
                        navigate(`/messages?chat=direct&user=${userProfile?.user?._id || userProfile?.user}`, {
                          state: { newUser: { ...userProfile?.user, profilePicture: userProfile?.profilePicture } }
                        })
                      }
                      disabled={showSkeleton}
                      className={`btn-blue-gradient cursor-pointer text-white text-sm font-medium rounded-full transition-transform flex items-center space-x-2 py-1.5 px-4 hover:scale-105 ${
                        showSkeleton ? "opacity-60 cursor-not-allowed hover:scale-100" : ""
                      }`}
                    >
                      <span>💬</span>
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Support Button */}
              {!showSkeleton && paymentAvailable && (
                <div>
                  <div className="flex justify-center align-center">
                  <button
                    onClick={() =>
                      navigate(
                        `/profile/${
                          userProfile?.username || location.pathname.split("/profile/")[1]
                        }/support`
                      )
                    }
                    className={`btn-blue-gradient cursor-pointer text-white text-sm font-medium rounded-full transition-transform flex items-center space-x-2 py-1.5 px-4 hover:scale-105`}
                   >
                    <span>🤍</span>
                    <span>Support</span>
                  </button>
                  </div>
                </div>
              )}
              <div>

              {/* Share Icon */}
              <button
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                onClick={handleShareProfile}
                disabled={showSkeleton}
                title="Share Profile"
              >
                <MdShare className="w-5 h-5" />
              </button>

              {/* Edit + Settings should only be visible on own profile */}
              {isOwnProfile && (
                <>
                  {/* Edit Icon */}
                  <button
                    onClick={handleEditClick}
                    disabled={showSkeleton}
                    className={`p-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer ${
                      showSkeleton ? "opacity-60 cursor-not-allowed hover:text-gray-600" : ""
                    }`}
                    title="Edit Profile"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>

                  {/* Settings Icon */}
                  <button
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/profile/${
                          userProfile?.username || location.pathname.split("/profile/")[1]
                        }/settings`
                      )
                    }
                    disabled={showSkeleton}
                    title="Settings"
                  >
                    <MdSettings className="w-5 h-5" />
                  </button>
                </>
              )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
