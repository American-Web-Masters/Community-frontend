import React, { useState, useEffect, useMemo, act } from "react";
import { toast } from "react-hot-toast";
import { fetchPendingPosts, handlePendingPost, fetchJoinRequests, handleJoinRequest } from "../../../api/communities";
import { formatTimestamp , getFilteredItems} from "../../../utils/communityUtils";
import { mockModeratorQueue, mockPrayerCards } from "../../../data/mockData";
import PrayerCard from "../../../components/ui/PrayerCard";
import FlaggedPosts from "./FlaggedPosts";

const ModeratorQueue = ({ community, currentUser }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedItems, setSelectedItems] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is owner or moderator
  const isOwnerOrModerator = community?.isOwner || 
    (community?.moderators && community.moderators.some(mod => mod.id === currentUser?.id));

  // Fetch pending posts and join requests on component mount and when community changes
  useEffect(() => {
    if (community?._id && isOwnerOrModerator) {
      loadPendingPosts();
      loadJoinRequests();
    }
  }, [community?._id, isOwnerOrModerator]);

  const loadPendingPosts = async () => {
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
    } catch (err) {
      setError('Failed to load pending posts');
    } finally {
      setLoading(false);
    }
  };

  const loadJoinRequests = async () => {
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
            avatar: community?.coverPhoto || "/api/placeholder/32/32",
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
    } catch (err) {
      console.error('Failed to load join requests:', err);
      setJoinRequests([]);
    }
  };

  if (!isOwnerOrModerator) {
    return null;
  }

  const allItems = useMemo(() => [
    ...pendingPosts,
    ...mockModeratorQueue.flaggedPosts, 
    ...joinRequests
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)), [pendingPosts, joinRequests]);


  const filteredItems = getFilteredItems(activeTab, mockModeratorQueue, pendingPosts, joinRequests, allItems);
  const pendingCount = allItems.length;

  // Handle item selection
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleApprove = async (itemId = null) => {
    try {
      const itemsToApprove = itemId ? [itemId] : selectedItems;
      
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

  return (
    <div className="flex gap-6 max-md:flex-col w-full">
      {/* Left Content Area - Prayer Feed */}
      <div className="flex-1 space-y-4 max-md:hidden">
        {mockPrayerCards.slice(0, 2).map((prayer) => (
          <PrayerCard
            key={prayer.id}
            prayer={prayer}
            prayerId={prayer.id}
            user={prayer.user}
            timeAgo={prayer.timeAgo}
            urgency={prayer.urgency}
            prayerText={prayer.prayerText}
            status={prayer.status}
            communities={prayer.communities}
            mood={prayer.mood}
            comments={prayer.comments}
          />
        ))}
      </div>

      {/* Right Sidebar - Moderator Queue */}
      <div className="w-full md:w-[50%]  bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Moderator Queue</h2>
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {pendingCount} Pending
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {["All", "Flagged Posts", "Pending Posts", "Join Request"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
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
        <div className="max-h-[480px] md:max-h-96 overflow-y-auto">
          {activeTab === "Flagged Posts" ? (
            /* Render FlaggedPosts component for flagged posts tab */
            <div className="p-4">
              <FlaggedPosts community={community} currentUser={currentUser} />
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm">Loading moderator queue...</p>
            </div>
          ) : error && activeTab === "Pending Posts" ? (
            <div className="text-center py-8 text-red-500">
              <p className="text-sm">{error}</p>
              <button 
                onClick={loadPendingPosts}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Try again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No items in queue</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                {item.type === "joinRequest" ? (
                  /* Join Request Item */
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemSelect(item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <img 
                      src={item.user.avatar} 
                      alt={item.user.name}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {item.user.name} • {item.requestType}
                      </p>
                      <p className="text-xs text-gray-500">{item.user.role}</p>
                      <p className="text-xs text-gray-700 mt-1">
                        Requested at: {item.timestamp}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Post Item (Pending/Flagged) - Card Design */
                  <div className={`rounded-2xl p-4 border border-blue-100 ${
                        item.type === "flagged" ? "bg-red-50" : "bg-blue-50 "
                      }`}>
                    {/* Header with badge and timestamp */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.type === "flagged" ? "bg-red-600 text-white" : "bg-[#03045E] text-white"
                      }`}>
                        {item.type === "flagged" ? "Flagged" : "Pending"}
                      </span>
                      <span className="text-sm text-gray-600">{item.timestamp}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 mb-1">
                      {item.title || "New Post"}
                    </h3>

                    {/* Author */}
                    <p className="text-sm text-gray-700 mb-2">
                      by {item.author.name}
                    </p>

                    {/* Content */}
                    {item.content && (
                      <p className="text-gray-800 text-sm mb-2 leading-relaxed">
                        {item.content}
                      </p>
                    )}

                    {/* Flagged post additional info */}
                    {item.type === "flagged" && (
                      <p className="text-sm text-red-600 mb-4">
                        Reason: {item.reason} • {item.flags} Flags
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-3xl text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-3xl text-xs font-medium transition-colors"
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
    </div>
  );
};

export default ModeratorQueue;