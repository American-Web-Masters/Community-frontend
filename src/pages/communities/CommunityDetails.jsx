import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import { useStableMasonry } from "../../hooks/useStableMasonry";
import PrayerCard from "../../components/ui/PrayerCard";
import { IoPersonOutline, IoArrowBackOutline } from "react-icons/io5";
import { PiChatText , PiBellLight} from "react-icons/pi";
import { FaRegHeart } from "react-icons/fa";
import { IoShareSocialOutline } from "react-icons/io5";
import { fetchCommunityById } from "../../api";
import toast from 'react-hot-toast';
import { About, Members, ModeratorQueue } from "./subcomponents";
import CreatePrayerModal from "../../components/ui/CreatePrayerModal";

const CommunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Feed");
  const [copied, setCopied] = useState(false);
  const [isCreatePrayerModalOpen, setIsCreatePrayerModalOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());

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

  // Check if user is owner or moderator
  const isOwnerOrModerator = community?.isOwner || 
    (community?.moderators && community.moderators.some(mod => mod.id === user?.id));

  const handleCreatePost = () => {
    setIsCreatePrayerModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreatePrayerModalOpen(false);
  };

  const handlePrayerCreated = (newPrayer) => {
    console.log('Prayer created successfully:', newPrayer);
    setIsCreatePrayerModalOpen(false);
    // Only refresh when new content is created
    fetchCommunityDetails();
    toast.success('Prayer posted successfully!'); 
  };

  const handleCommunityUpdate = (updatedCommunity) => {
    setCommunity(prevCommunity => ({
      ...prevCommunity,
      ...updatedCommunity
    }));
  };

  const handleToggleExpand = (cardId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // Helper function to calculate time ago - memoized to prevent recreation
  const getTimeAgo = useMemo(() => {
    return (dateString) => {
      const now = new Date();
      const createdAt = new Date(dateString);
      const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} min`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
      return `${Math.floor(diffInMinutes / 10080)}w`;
    };
  }, []); 

  // Get feed prayers - memoized to prevent unnecessary re-renders
  const feedPrayers = useMemo(() => {
    return community?.feed?.map(feedItem => ({
      ...feedItem.prayer,
      feedItemId: feedItem._id,
      addedBy: feedItem.addedBy,
      addedAt: feedItem.addedAt
    })) || [];
  }, [community?.feed]);

  // Apply masonry layout - hook must be called at top level
  const masonryColumns = useStableMasonry(feedPrayers, 2);

  // Prayer interaction handlers - these are callback functions that PrayerCard expects
  // PrayerCard handles all the actual API calls and state management internally
  const handlePray = (prayerId, currentState) => {
    console.log('Prayer action:', prayerId, !currentState);
  };

  const handleBookmark = (prayerId, currentState) => {
    console.log('Bookmark action:', prayerId, !currentState);
  };

  const handleShare = (prayerId, currentState) => {
    console.log('Share action:', prayerId, !currentState);
  };

  const handleComment = (prayerId) => {
    console.log('Comment action:', prayerId);
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
          {toast.error(error || "Community not found")}
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
            {isOwnerOrModerator && (
              <button
                onClick={() => setActiveTab("Moderator Queue")}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === "Moderator Queue"
                    ? "btn-blue-gradient text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/30"
                }`}
              >
                Moderator Queue
              </button>
            )}
          </div>

          {/* Create New Post Button */}
          {activeTab === "Feed" && (
            <button 
            onClick={handleCreatePost}
            className="btn-blue-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-200 flex items-center space-x-2 shadow-lg"
          >
            <span className="hidden sm:inline">Create New Post</span>
            <span className="inline sm:hidden">Post</span>
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg font-bold relative -top-0.5">+</span>
            </div>
          </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-24">
        {activeTab === "Feed" && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading feed...</p>
                </div>
              </div>
            ) : feedPrayers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No posts available yet</p>
                <p className="text-sm mt-2">Be the first to share something with the community!</p>
              </div>
            ) : (
              <div className="stable-masonry-container">
                {masonryColumns.map((columnItems, columnIndex) => (
                  <div key={columnIndex} className="masonry-column">
                    {columnItems.map((prayer) => {
                      // Process isPrayed array to get count and check if current user has prayed
                      const prayerCount = prayer.isPrayed ? prayer.isPrayed.length : 0;
                      const userHasPrayed = prayer.isPrayed?.some(prayedUser => {
                        const userId = prayedUser.user?._id || prayedUser._id || prayedUser;
                        return userId === user?._id;
                      }) || false;

                      // Process shares array to get count and check if current user has shared
                      const shareCount = prayer.shares ? prayer.shares.length : 0;
                      const userHasShared = prayer.shares?.some(share => {
                        const userId = share.user?._id || share._id || share;
                        return userId === user?._id;
                      }) || false;

                      // Process bookmarks
                      const isBookmarked = prayer.bookmarks?.some(bookmark => {
                        const userId = bookmark.user?._id || bookmark._id || bookmark;
                        return userId === user?._id;
                      }) || false;

                      return (
                        <div key={prayer._id || prayer.id} className="masonry-item">
                          <PrayerCard
                            prayer={prayer}
                            prayerId={prayer._id || prayer.id}
                            user={prayer.anonymous ? { name: "Anonymous" } : { 
                              name: `${prayer.addedBy?.firstname || ''} ${prayer.addedBy?.lastname || ''}`.trim() || 
                                     prayer.addedBy?.username || "User" 
                            }}
                            timeAgo={prayer.createdAt ? getTimeAgo(prayer.createdAt) : "Unknown"}
                            urgency={prayer.urgency}
                            prayerText={prayer.content}
                            status={prayer.status}
                            communities={prayer.communities}
                            mood={prayer.moodEmoji}
                            comments={prayer.comments ? prayer.comments.map(comment => {
                              const reactionsCount = {};
                              let userReaction = null;
                              
                              if (comment.reactions && Array.isArray(comment.reactions)) {
                                comment.reactions.forEach(reaction => {
                                  const emoji = reaction.emoji || reaction.type;
                                  reactionsCount[emoji] = (reactionsCount[emoji] || 0) + 1;
                                  if (reaction.user === user?._id) {
                                    userReaction = emoji;
                                  }
                                });
                              }

                              return {
                                _id: comment._id,
                                user: comment.user?.firstname || comment.user?.username || "Community Member",
                                text: comment.commentText || comment.text,
                                time: comment.createdAt ? getTimeAgo(comment.createdAt) : comment.time,
                                reactions: reactionsCount,
                                userReaction: userReaction,
                                userId: comment.user?._id
                              };
                            }) : []}
                            tags={prayer.tags}
                            isExpanded={expandedCards.has(prayer._id || prayer.id)}
                            isPrayed={userHasPrayed}
                            prayerCount={prayerCount}
                            isShared={userHasShared}
                            shareCount={shareCount}
                            isBookmarked={isBookmarked}
                            onToggleExpand={() => handleToggleExpand(prayer._id || prayer.id)}
                            onPray={() => handlePray(prayer._id || prayer.id, userHasPrayed)}
                            onBookmark={() => handleBookmark(prayer._id || prayer.id, isBookmarked)}
                            onComment={() => handleComment(prayer._id || prayer.id)}
                            onShare={() => handleShare(prayer._id || prayer.id, userHasShared)}
                            onMore={() => {
                              console.log("More clicked", prayer._id || prayer.id);
                              // You can implement the more options functionality here
                            }}
                            onPrayedStateChange={(newState) => {
                              // PrayerCard handles the state internally
                            }}
                            onSharedStateChange={(newState) => {
                              // PrayerCard handles the state internally
                            }}
                            onCommentsUpdate={(updatedComments) => {
                              // PrayerCard handles the state internally
                            }}
                            onBookmarkStateChange={(newState) => {
                              // PrayerCard handles the state internally
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
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
          <About community={community} onCommunityUpdate={handleCommunityUpdate} />
        )}

        {activeTab === "Moderator Queue" && isOwnerOrModerator && (
          <ModeratorQueue community={community} currentUser={user} />
        )}
      </div>
      
      {/* Create Prayer Modal */}
      <CreatePrayerModal
        isOpen={isCreatePrayerModalOpen}
        onClose={handleCloseModal}
        onSuccess={handlePrayerCreated}
        communityMode={true}
        communityId={id}
        community={community}
      />
    </div>
  );
};

export default CommunityDetails;