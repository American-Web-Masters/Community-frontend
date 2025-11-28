import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import { IoPersonOutline, IoArrowBackOutline } from "react-icons/io5";
import { PiChatText , PiBellLight} from "react-icons/pi";
import { FaRegHeart } from "react-icons/fa";
import { IoShareSocialOutline } from "react-icons/io5";
import { fetchCommunityById } from "../../api";
import { About, Members } from "./subcomponents";

const CommunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Feed");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCommunityDetails();
  }, [id]);

  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchCommunityById(id, user);
      
      if (response.success) {
        setCommunity(response?.data);
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error fetching community details:', err);
      setError('Failed to load community details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/communities");
  };

  const handleInviteClick = async () => {
    if (!community?.inviteLink) {
      console.error('No invite link available');
      return;
    }

    try {
      // Create the full invite URL (you might need to adjust the domain based on your app's URL structure)
      const inviteUrl = `${window.location.origin}/invite/${community.inviteLink}`;
      
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite link:', err);
      
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = `${window.location.origin}/invite/${community.inviteLink}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen light-background flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading community...</div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen light-background flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="mb-2">{error || "Community not found"}</p>
          <button 
            onClick={handleBackClick}
            className="text-blue-600 underline hover:no-underline"
          >
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen light-background overflow-x-hidden">
      {/* Header with back button */}
      <div className="ml-3 px-4 pt-4 pb-2">
        <button 
          onClick={handleBackClick}
          className="flex items-center space-x-2 bg-white text-gray-800 px-4 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
        >
          <IoArrowBackOutline className="w-5 h-5" />
          <span className="text-sm font-medium">Back to communities</span>
        </button>
      </div>

      {/* Community Header */}
      <div className="px-6 py-6 w-[96%] mx-auto bg-white/60 backdrop-blur-sm border-b border-white/50 mb-4 rounded-3xl">
        <div className="flex items-center space-x-4">
        
          {/* Community Avatar */}
          <div className="w-36 h-36 rounded-full overflow-hidden flex-shrink-0">
            {community.coverPhoto ? (
              <img 
                src={community.coverPhoto} 
                alt={community.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {community.name && community.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Community Info */}
          <div className="flex-1">
            <h1 className="text-xl font-medium text-gray-900">
              {community.name}
            </h1>
            <p className="text-gray-900 text-sm mb-1">{community.affiliatedOrganization}</p>
            <p className="text-gray-500 mb-1">
              {community.description}
            </p>

            {/* Member count and tags */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <IoPersonOutline className="w-4 h-4" />
                <span>{community.memberCount} members</span>
              </div>
              {community.tags && community.tags.length > 0 && (
                <div className="flex items-center">
                  {community.tags.slice(0, 1).map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-[#007FD4] text-white text-xs font-medium rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                        {community.tags.length > 1 && ( 
                        <span className="px-1.5 py-1 relative right-[10px] bg-[#007FD4] text-white text-xs rounded-full">
                      +{community.tags.length - 1}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex md:items-center space-x-3">
              <button className="btn-blue-gradient px-3 md:px-6 py-1.5 rounded-2xl text-xs font-medium flex items-center space-x-2">
                <span><PiChatText className="w-4 h-4" /></span>
                <span>Chat</span>
              </button>
              <button className="btn-blue-gradient px-3 md:px-6 py-1.5 rounded-2xl text-xs font-medium flex items-center space-x-2">
                <span><FaRegHeart className="w-4 h-4" /></span>
                <span>Support</span>
              </button>
              <button className="btn-blue-gradient px-3 md:px-6 py-1.5 rounded-2xl text-xs font-medium flex items-center space-x-2">
                <span><PiBellLight className="w-4 h-4" /></span>
                <span>Notifications</span>
              </button>
              <button 
                onClick={handleInviteClick}
                className={`px-3 md:px-6 py-1.5 rounded-2xl text-xs font-medium flex items-center space-x-2 transition-all duration-200 ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'btn-blue-gradient hover:opacity-90'
                }`}
              >
                <span>
                  {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <IoShareSocialOutline className="w-4 h-4" />
                  )}
                </span>
                <span>{copied ? 'Copied!' : 'Invite'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-white/90 rounded-full p-0.5 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("Feed")}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === "Feed"
                  ? "btn-blue-gradient text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/30"
              }`}
            >
              Feed
            </button>
                        <button
              onClick={() => setActiveTab("Members")}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === "Members"
                  ? "btn-blue-gradient text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/30"
              }`}
            >
                Members
            </button>
            <button
              onClick={() => setActiveTab("Event")}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === "Event"
                  ? "btn-blue-gradient text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/30"
              }`}
            >
              Event
            </button>
            <button
              onClick={() => setActiveTab("About")}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === "About"
                  ? "btn-blue-gradient text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/30"
              }`}
            >
              About
            </button>
          </div>

          {/* Create New Post Button */}
          <button className="btn-blue-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-200 flex items-center space-x-2 shadow-lg">
            <span className="hidden sm:inline">Create New Post</span>
            <span className="inline sm:hidden">Post</span>
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg font-bold relative -top-0.5">+</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-24">
        {activeTab === "Feed" && (
          <div className="text-center py-12 text-gray-500">
            <p>No posts available yet</p>
            <p className="text-sm mt-2">Be the first to share something with the community!</p>
          </div>
        )}

        {activeTab === "Members" && (
          <Members community={community} currentUser={user} />
        )}

        {activeTab === "Event" && (
          <div className="text-center py-12 text-gray-500">
            <p>No events scheduled</p>
          </div>
        )}

        {activeTab === "About" && (
          <About community={community} />
        )}
      </div>
    </div>
  );
};

export default CommunityDetails;