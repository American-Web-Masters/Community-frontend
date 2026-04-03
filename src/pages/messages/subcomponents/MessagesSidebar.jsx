import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearchOutline, IoChevronBack, IoMenu } from 'react-icons/io5';
import { MdOutlinePushPin } from 'react-icons/md';
import CommunityCard from '../../communities/subcomponents/CommunityCard';

const MessagesSidebar = ({
  isSidebarOpen,
  activeChat,
  chatMode,
  setChatMode,
  searchQuery,
  setSearchQuery,
  searchDebounceRef,
  setDebouncedSearch,
  activeTab,
  setActiveTab,
  loading,
  users,
  debouncedSearch,
  sortUsers,
  pinnedUserIds,
  setActiveChat,
  onlineUsers,
  handlePinUser,
  pinningUserId,
  groupConversations,
  loadingGroupConversations,
  groupOnlineMemberCountMap,
  loadingCommunities,
  discoverCommunities
}) => {
  const navigate = useNavigate();
  const isGroupMode = chatMode === 'group';
  const showDiscoverOnly = !isGroupMode && activeTab === 'Communities';
  const [isModeMenuOpen, setIsModeMenuOpen] = React.useState(false);

  const handleModeSwitch = (mode) => {
    if (mode === chatMode) return;
    setChatMode(mode);
    setActiveChat(null);
    setActiveTab('All');
    setIsModeMenuOpen(false);
  };

  const filteredUsers = users.filter(u => {
    const q = debouncedSearch.toLowerCase();
    return !q || `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const filteredGroupConversations = groupConversations.filter((community) => {
    const q = debouncedSearch.toLowerCase();
    const matchesSearch = !q || community.name?.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (activeTab === 'Unread') {
      return (community.unreadCount || 0) > 0;
    }
    return true;
  });

  return (
    <>
      {/* Fixed back button - desktop only, shown when sidebar open */}
      {isSidebarOpen && (
        <div className="hidden sm:block fixed top-4.5 left-3">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-[#03045E] flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-sm flex-shrink-0"
          >
            <IoChevronBack className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      <div className={`flex-col mt-4 mb-3 w-full sm:w-auto px-3 sm:px-0 ${!activeChat ? 'flex' : 'hidden'} ${isSidebarOpen ? 'sm:flex' : 'sm:hidden'} ${isGroupMode ? 'sm:h-[calc(100vh-125px)]' : ''} ${showDiscoverOnly ? 'h-[calc(100vh-190px)] sm:h-[calc(100vh-125px)]' : ''}`}>
        {/* Search Input */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 " />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = setTimeout(() => setDebouncedSearch(val), 300);
              }}
              placeholder="search"
              className="w-full h-11 pl-9 pr-3 py-2 rounded-full bg-white/70 border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-[16px] placeholder:pl-2"
            />
          </div>

          {/* Mobile-only mode menu */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setIsModeMenuOpen((prev) => !prev)}
              className="w-11 h-11 rounded-full bg-white/70 border border-gray-200 flex items-center justify-center text-[#03045E]"
              aria-label="Open chat mode menu"
              aria-expanded={isModeMenuOpen}
            >
              <IoMenu className="w-5 h-5" />
            </button>

            {isModeMenuOpen && (
              <div className="absolute right-0 top-12 z-20 w-36 rounded-xl border border-gray-200 bg-white shadow-lg p-1.5">
                <button
                  onClick={() => handleModeSwitch('direct')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    !isGroupMode
                      ? 'bg-blue-50 text-[#03045E]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Direct Chats
                </button>
                <button
                  onClick={() => handleModeSwitch('group')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isGroupMode
                      ? 'bg-blue-50 text-[#03045E]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Group Chats
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-3 ">
          {["All", "Unread", "Communities"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "btn-blue-gradient text-white shadow-sm"
                  : "bg-white/70 text-gray-700 hover:bg-white/90"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Chats Container */}
        {!showDiscoverOnly && (
          <div
            className={`w-full sm:w-90 bg-white/50 backdrop-blur-sm flex flex-col overflow-hidden rounded-2xl sm:rounded-tr-2xl sm:rounded-br-2xl shadow-sm ${isGroupMode ? 'sm:flex-1 sm:min-h-0' : ''}`}
            style={isGroupMode ? undefined : { maxHeight: '48%' }}
          >
            <div className="flex-1 overflow-y-auto px-4 pt-3 thin-scrollbar">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {isGroupMode ? 'Group Chats' : 'Chats'}
              </h3>
              {!isGroupMode && loading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : !isGroupMode && filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-xs">{debouncedSearch ? 'No users found' : 'No users available'}</div>
              ) : isGroupMode && loadingGroupConversations ? (
                <div className="text-center py-4 text-gray-500 text-xs">Loading...</div>
              ) : isGroupMode && filteredGroupConversations.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-xs">
                  {debouncedSearch ? 'No communities found' : 'No unread messages in group chats'}
                </div>
              ) : (
                <div className="space-y-1">
                  {!isGroupMode && sortUsers(filteredUsers).map((chat) => {
                    const isPinned = pinnedUserIds.has(chat._id);
                    return (
                      <div
                        key={chat._id}
                        onClick={() => setActiveChat(chat)}
                        className={`flex items-start space-x-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative ${
                          activeChat?._id === chat._id
                            ? "bg-white shadow-sm"
                            : "hover:bg-white/50"
                        } ${
                          isPinned ? "border-l-2 border-blue-500" : ""
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={chat.profilePicture || "https://i.pravatar.cc/150?img=12"}
                            alt={`${chat.firstname} ${chat.lastname}`}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                          {onlineUsers.has(chat._id) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {chat.firstname} {chat.lastname}
                              </h4>
                              {isPinned && (
                                <MdOutlinePushPin className="w-3 h-3 text-blue-500 flex-shrink-0" title="Pinned" />
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">
                              @{chat.username}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate leading-tight">
                            {chat.email}
                          </p>
                        </div>
                        {/* Pin Button - shows on hover */}
                        <button
                          onClick={(e) => handlePinUser(chat._id, e)}
                          disabled={pinningUserId === chat._id}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                          title={isPinned ? 'Unpin conversation' : 'Pin conversation'}
                        >
                          {pinningUserId === chat._id ? (
                            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : isPinned ? (
                            <MdOutlinePushPin className="w-4 h-4 text-blue-500" />
                          ) : (
                            <MdOutlinePushPin className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {isGroupMode && filteredGroupConversations.map((community) => {
                    const communityId = community._id || community.communityId;
                    const unreadCount = community.unreadCount || 0;
                    const onlineCount = groupOnlineMemberCountMap[communityId] || 0;

                    return (
                      <div
                        key={communityId}
                        onClick={() => setActiveChat(community)}
                        className={`flex items-start space-x-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative ${
                          activeChat?._id === communityId
                            ? 'bg-white shadow-sm'
                            : 'hover:bg-white/50'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={community.coverPhoto || community.profilePicture || 'https://i.pravatar.cc/150?img=32'}
                            alt={community.name}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                          {onlineCount > 0 && (
                            <div className="absolute -bottom-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-green-500 border-2 border-white text-[9px] text-white flex items-center justify-center">
                              {onlineCount > 9 ? '9+' : onlineCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5 gap-2">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {community.name}
                            </h4>
                            {unreadCount > 0 && (
                              <span className="inline-flex min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] items-center justify-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate leading-tight">
                            {community.lastMessage?.content || 'Start the conversation'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Discover Communities Container */}
        {!isGroupMode && (
          <div className={`w-full sm:w-90 bg-white/50 backdrop-blur-sm flex flex-col overflow-hidden rounded-2xl sm:rounded-tr-2xl sm:rounded-br-2xl shadow-sm ${showDiscoverOnly ? 'flex-1 min-h-0 mt-0' : 'mt-3'}`} style={showDiscoverOnly ? undefined : { maxHeight: '48%' }}>
            <div className="flex-1 overflow-y-auto px-4 pt-3 thin-scrollbar">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Discover</h3>
              {loadingCommunities ? (
                <div className="text-center py-4 text-gray-500 text-xs">Loading...</div>
              ) : discoverCommunities.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-xs">No communities to discover</div>
              ) : (
                <div className="space-y-3">
                  {discoverCommunities.map((community) => (
                    <CommunityCard
                      key={community._id || community.id}
                      id={community._id || community.id}
                      name={community.name}
                      wallAssociation={community.wallAssociation}
                      category={community.tags || []}
                      members={community.memberCount}
                      avatar={community.coverPhoto}
                      privacyLevel={community.privacyLevel}
                      status={community.privacyLevel === 'private' ? 'Private' : 'Public'}
                      isJoined={false}
                      onJoinClick={() => navigate('/communities')}
                      onViewClick={() => navigate('/communities')}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MessagesSidebar;
