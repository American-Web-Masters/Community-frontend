import React, { useState } from "react";
import { mockModeratorQueue, mockPrayerCards } from "../../../data/mockData";
import PrayerCard from "../../../components/ui/PrayerCard";

const ModeratorQueue = ({ community, currentUser }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedItems, setSelectedItems] = useState([]);

  // Check if user is owner or moderator
  const isOwnerOrModerator = community?.isOwner || 
    (community?.moderators && community.moderators.some(mod => mod.id === currentUser?.id));

  if (!isOwnerOrModerator) {
    return null; // Don't render if user doesn't have permissions
  }

  // Get all items for "All" tab
  const allItems = [
    ...mockModeratorQueue.pendingPosts,
    ...mockModeratorQueue.flaggedPosts, 
    ...mockModeratorQueue.joinRequests
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Filter items based on active tab
  const getFilteredItems = () => {
    switch (activeTab) {
      case "Flagged Posts":
        return mockModeratorQueue.flaggedPosts;
      case "Pending Posts":
        return mockModeratorQueue.pendingPosts;
      case "Join Request":
        return mockModeratorQueue.joinRequests;
      default:
        return allItems;
    }
  };

  const filteredItems = getFilteredItems();
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

  const handleApprove = (itemId = null) => {
    if (itemId) {
      console.log(`Approved item ${itemId}`);
    } else {
      console.log(`Approved items: ${selectedItems}`);
      setSelectedItems([]);
    }
  };

  const handleReject = (itemId = null) => {
    if (itemId) {
      console.log(`Rejected item ${itemId}`);
    } else {
      console.log(`Rejected items: ${selectedItems}`);
      setSelectedItems([]);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Left Content Area - Prayer Feed */}
      <div className="flex-1 space-y-4">
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
      <div className="w-[50%] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {filteredItems.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between bg-blue-600 text-white p-3 rounded-lg">
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
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject()}
                  disabled={selectedItems.length === 0}
                  className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Queue Items */}
        <div className="max-h-96 overflow-y-auto">
          {filteredItems.length === 0 ? (
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
                  /* Post Item (Pending/Flagged) */
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemSelect(item.id)}
                        className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                      />
                      <img 
                        src={item.author.avatar} 
                        alt={item.author.name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.type === "flagged" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                          }`}>
                            {item.type === "flagged" ? "Flagged" : "Pending"}
                          </span>
                          <span className="text-xs text-gray-500">{item.timestamp}</span>
                        </div>
                        <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-600 mb-1">by {item.author.name}</p>
                        
                        {item.type === "flagged" && (
                          <p className="text-xs text-red-600 mb-2">
                            Reason: {item.reason} • {item.flags} Flags
                          </p>
                        )}
                        
                        {item.content && (
                          <p className="text-xs text-gray-700 mb-2 line-clamp-2">{item.content}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-11">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
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