import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { fetchPendingPosts, handlePendingPost, fetchJoinRequests, handleJoinRequest } from "../../../api/communities";
import { formatTimestamp , getFilteredItems} from "../../../utils/communityUtils";
import { getTimeAgo } from "../../../utils/prayerUtils";
import { mockModeratorQueue } from "../../../data/mockData";
import { deletePrayer } from "../../../api/prayer";
import PrayerCard from "../../../components/ui/PrayerCard";
import FlaggedPosts from "./FlaggedPosts";

const ModeratorQueue = ({ community, currentUser, feedPrayers = [], onPrayerDeleted, onCommunityRefresh }) => {
  const [activeTab, setActiveTab] = useState("Pending Posts"); // Default changed from "All"
  const [selectedItems, setSelectedItems] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [visibleFeedPrayers, setVisibleFeedPrayers] = useState(feedPrayers);
  const [removedPrayerIds, setRemovedPrayerIds] = useState(() => new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [prayerToDelete, setPrayerToDelete] = useState(null);
  const [isDeletingPrayer, setIsDeletingPrayer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is owner or moderator
  const isOwnerOrModerator = community?.isOwner || 
    (community?.moderators && community.moderators.some(mod => mod.id === currentUser?.id));

  useEffect(() => {
    setVisibleFeedPrayers(feedPrayers);
  }, [feedPrayers]);

  const loadPendingPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchPendingPosts(community._id);
        const transformedPosts = response.data.pendingPosts.map(post => ({
          id: post.prayer?._id,
          type: "pending",
          title: post.title,
          content: post.prayer?.content,
          author: {
            name: post.submittedBy?.firstname || post.author?.username || "Unknown",
            avatar: community?.coverPhoto || "/api/placeholder/32/32"
          },
          timestamp: formatTimestamp(post.createdAt),
          status: post.status || "pending"
        }));
        setPendingPosts(transformedPosts);
    } catch {
      setError('Failed to load pending posts');
    } finally {
      setLoading(false);
    }
  }, [community?._id, community?.coverPhoto]);

  const loadJoinRequests = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchJoinRequests(community._id);
      if (response.success && response.data) {
        const transformedJoinRequests = response.data?.joinRequests.map((request, index) => ({
          id: `join_request_${request._id}_${index}`, // Unique ID for the request item in UI
          type: "joinRequest",         
          userId: request._id, // This is the user ID of the person requesting to join
          user: {
            name: (request?.firstname && request?.lastname) 
              ? `${request.firstname} ${request.lastname}` 
              : "Unknown User",
            avatar: request?.profilePicture || "",
            role: "Member"
          },
          requestType: "Join Request",
          timestamp: formatTimestamp(request.createdAt),
          status: request.status || "pending"
        }));
        setJoinRequests(transformedJoinRequests);
        console.log('Loaded join requests:', transformedJoinRequests);
      } else {
        setJoinRequests([]);
      }
    } catch {
      setJoinRequests([]);
    }
  }, [community?._id]);

  // Fetch pending posts and join requests on component mount and when community changes
  useEffect(() => {
    if (community?._id && isOwnerOrModerator) {
      loadPendingPosts();
      loadJoinRequests();
    }
  }, [community?._id, isOwnerOrModerator, loadPendingPosts, loadJoinRequests]);

  const allItems = useMemo(() => [
    ...pendingPosts,
    ...joinRequests
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)), [pendingPosts, joinRequests]);

  const displayedFeedPrayers = useMemo(() => {
    return visibleFeedPrayers.filter((prayer) => {
      const prayerId = prayer?._id || prayer?.id;
      return prayerId && !removedPrayerIds.has(prayerId);
    });
  }, [visibleFeedPrayers, removedPrayerIds]);


  const filteredItems = getFilteredItems(activeTab, mockModeratorQueue, pendingPosts, joinRequests, allItems);
  const pendingCount = allItems.length;

  const openDeleteModal = (prayer) => {
    setPrayerToDelete(prayer);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (isDeletingPrayer) return;
    setShowDeleteModal(false);
    setPrayerToDelete(null);
  };

  const handleModeratorDelete = async () => {
    const prayerId = prayerToDelete?._id || prayerToDelete?.id;
    if (!prayerId || isDeletingPrayer) return;

    try {
      setIsDeletingPrayer(true);
      await deletePrayer(prayerId);
      setRemovedPrayerIds((prev) => new Set(prev).add(prayerId));
      setVisibleFeedPrayers((prev) => prev.filter((prayer) => (prayer?._id || prayer?.id) !== prayerId));
      if (onPrayerDeleted) {
        onPrayerDeleted(prayerId);
      }
      toast.success("Post deleted successfully.");
      setShowDeleteModal(false);
      setPrayerToDelete(null);
    } catch {
      toast.error("Failed to delete post.");
    } finally {
      setIsDeletingPrayer(false);
    }
  };

  const handleApprove = async (itemId = null) => {
    try {
      const itemsToApprove = itemId ? [itemId] : selectedItems;
      let shouldRefreshCommunity = false;
      
      if (itemsToApprove.length === 0) {
        toast.error('No items selected');
        return;
      }

      // Handle each item individually
      for (const id of itemsToApprove) {
        const item = allItems.find(item => item.id === id);
        
        if (item && item.type === 'pending') {
          // Handle pending posts with existing API
          const response = await handlePendingPost(community._id, id, 'approve');
          
          if (response.success) {
            // Remove from pending posts
            setPendingPosts(prev => prev.filter(post => post.id !== id));
            toast.success(`Post approved successfully!`);
            shouldRefreshCommunity = true;
          } else {
            toast.error(response.error);
          }
        } else if (item && item.type === 'joinRequest') {
          // Handle join requests with new API
          const response = await handleJoinRequest(community._id, item.userId, 'approve');
          
          if (response.success) {
            // Remove from join requests
            setJoinRequests(prev => prev.filter(request => request.id !== id));
            toast.success(`Join request approved successfully!`);
          } else {
            toast.error(response.error);
          }
        } else if (item) {
          // For other mock data items, just log for now
          console.log(`Approved ${item.type} item ${id}`);
        }
      }

      if (shouldRefreshCommunity && onCommunityRefresh) {
        await onCommunityRefresh();
      }
      
      setSelectedItems([]);
    } catch (error) {
      console.error('Error approving items:', error);
      toast.error('Failed to approve items');
    }
  };

  const handleReject = async (itemId = null) => {
    try {
      const itemsToReject = itemId ? [itemId] : selectedItems;
      
      if (itemsToReject.length === 0) {
        toast.error('No items selected');
        return;
      }

      // Handle each item individually
      for (const id of itemsToReject) {
        const item = allItems.find(item => item.id === id);
        
        if (item && item.type === 'pending') {
          // Handle pending posts with existing API
          const response = await handlePendingPost(community._id, id, 'reject');
          
          if (response.success) {
            // Remove from pending posts
            setPendingPosts(prev => prev.filter(post => post.id !== id));
            toast.success(`Post rejected successfully!`);
          } else {
            toast.error(response.error);
          }
        } else if (item && item.type === 'joinRequest') {
          // Handle join requests with new API
          const response = await handleJoinRequest(community._id, item.userId, 'reject');
          
          if (response.success) {
            // Remove from join requests
            setJoinRequests(prev => prev.filter(request => request.id !== id));
            toast.success(`Join request rejected successfully!`);
          } else {
            toast.error(response.error);
          }
        } else if (item) {
          // For other mock data items, just log for now
          console.log(`Rejected ${item.type} item ${id}`);
        }
      }
      
      setSelectedItems([]);
    } catch (error) {
      console.error('Error rejecting items:', error);
      toast.error('Failed to reject items');
    }
  };

  if (!isOwnerOrModerator) {
    return null;
  }

  return (
    <div className="relative flex w-full flex-col gap-8">
      {isDeletingPrayer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="rounded-2xl bg-white px-6 py-5 shadow-2xl border border-white/70 max-w-sm w-full text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900">Deleting post</h3>
            <p className="mt-1 text-sm text-gray-500">Please wait while we remove this prayer.</p>
          </div>
        </div>
      )}

      {showDeleteModal && prayerToDelete && (
        <div className="fixed inset-0 z-[59] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">Delete post</p>
              <h3 className="mt-1 text-xl font-semibold text-gray-900">Remove this prayer?</h3>
              <p className="mt-2 text-sm text-gray-600">
                This action will permanently delete the post from the community feed.
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {prayerToDelete.title || "Prayer post"}
                </p>
                {prayerToDelete.content && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                    {prayerToDelete.content}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this post? This cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={closeDeleteModal}
                  disabled={isDeletingPrayer}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModeratorDelete}
                  disabled={isDeletingPrayer}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moderator Queue */}
      <div className="w-full max-w-6xl mx-auto bg-white rounded-[2rem] shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Moderator Queue</h2>
            <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
              {pendingCount} Pending
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1.5">
            {/* "All" tab commented out for now as per request */}
            {[/* "All", */ "Flagged Posts", "Pending Posts", "Join Request"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 cursor-pointer py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? "btn-blue-gradient text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {/* {filteredItems.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between btn-blue-gradient text-white p-1 py-2 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredItems.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-2 border-white bg-transparent text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-sm font-medium">
                  Select all ({filteredItems.length} Items)
                </span>
              </label>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove()}
                  disabled={selectedItems.length === 0}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded-3xl text-xs font-medium transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject()}
                  disabled={selectedItems.length === 0}
                  className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded-3xl text-xs font-medium transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Queue Items */}
        <div className="max-h-[560px] overflow-y-auto">
          {activeTab === "Flagged Posts" ? (
            /* Render FlaggedPosts component for flagged posts tab */
            <div className="p-4">
              <FlaggedPosts
                community={community}
                currentUser={currentUser}
                onCommunityRefresh={onCommunityRefresh}
              />
            </div>
          ) : loading ? (
            <div className="text-center py-10 text-gray-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-base font-medium">Loading moderator queue...</p>
            </div>
          ) : error && activeTab === "Pending Posts" ? (
            <div className="text-center py-10 text-red-500">
              <p className="text-base">{error}</p>
              <button 
                onClick={loadPendingPosts}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                Try again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-base font-medium">No items in queue</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
                {item.type === "joinRequest" ? (
                  /* Join Request Item */
                  <div className="flex items-center gap-3 py-1">
                    {item.user.avatar && item.user.avatar !== "/api/placeholder/32/32" ? (
                      <img 
                        src={item.user.avatar} 
                        alt={item.user.name}
                        className="w-12 h-12 rounded-full flex-shrink-0 object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.user.name) + '&background=random';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-white">
                        <span className="text-white font-bold text-sm tracking-wide">
                          {item.user.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 ml-1">
                      <p className="font-semibold text-gray-900 text-base truncate">
                        {item.user.name}
                      </p>
                      <p className="text-sm text-gray-500 font-medium">{item.requestType} • {item.user.role}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.timestamp}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Post Item (Pending/Flagged) - Card Design */
                  <div className={`rounded-3xl p-5 border border-blue-100 ${
                        item.type === "flagged" ? "bg-red-50" : "bg-blue-50 "
                      }`}>
                    {/* Header with badge and timestamp */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        item.type === "flagged" ? "bg-red-600 text-white" : "bg-[#03045E] text-white"
                      }`}>
                        {item.type === "flagged" ? "Flagged" : "Pending"}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">{item.timestamp}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {item.title || "New Post"}
                    </h3>

                    {/* Author */}
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      by {item.author.name}
                    </p>

                    {/* Content */}
                    {item.content && (
                      <p className="text-gray-800 text-sm mb-3 leading-relaxed">
                        {item.content}
                      </p>
                    )}

                    {/* Flagged post additional info */}
                    {item.type === "flagged" && (
                      <p className="text-sm text-red-600 mb-4 font-medium">
                        Reason: {item.reason} • {item.flags} Flags
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-3xl text-sm font-semibold transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-3xl text-sm font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Prayer Feed */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {displayedFeedPrayers && displayedFeedPrayers.length > 0 ? (
            displayedFeedPrayers.map((prayer) => (
              <PrayerCard
                key={prayer._id || prayer.id}
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
                communities={prayer.communities || []}
                mood={prayer.moodEmoji || prayer.mood}
                comments={prayer.comments ? prayer.comments.map(comment => {
                  const reactionsCount = {};
                  let userReaction = null;

                  if (comment.reactions && Array.isArray(comment.reactions)) {
                    comment.reactions.forEach(reaction => {
                      const emoji = reaction.emoji || reaction.type;
                      reactionsCount[emoji] = (reactionsCount[emoji] || 0) + 1;
                      if (reaction.user === currentUser?._id) {
                        userReaction = emoji;
                      }
                    });
                  }

                  return {
                    _id: comment._id,
                    user: comment.user?.firstname + " " + (comment.user?.lastname || "") || "Community Member",
                    text: comment.commentText || comment.text,
                    time: comment.createdAt ? getTimeAgo(comment.createdAt) : comment.time,
                    reactions: reactionsCount,
                    userReaction: userReaction,
                    userId: comment.user?._id
                  };
                }) : []}
                isCommunityPrayer={true}
                isOwnerOrModerator={false}
                isModeratorContext={true}
                onModeratorDelete={openDeleteModal}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-500 shadow-sm border border-gray-100 sm:col-span-2">
              No posts found in this community yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeratorQueue;