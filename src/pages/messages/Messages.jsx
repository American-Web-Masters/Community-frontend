import React, { useEffect, useRef } from "react";
import BottomNavBar from "../../components/ui/BottomNavBar";
import { IoMenu } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";
import { useSearchParams, useLocation } from "react-router-dom";
import { scrollbarStyles } from "../../utils/MessageUtils";
import { useMessagesController } from "./hooks/useMessagesController";

// Import subcomponents
import MessagesSidebar from './subcomponents/MessagesSidebar';
import ChatHeader from './subcomponents/ChatHeader';
import MessageList from './subcomponents/MessageList';
import MessageInput from './subcomponents/MessageInput';
import InnerCircleRoom from './subcomponents/InnerCircleRoom';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const {
    user,
    isLoggedIn,
    activeChat,
    setActiveChat,
    chatMode,
    setChatMode,
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    users,
    setUsers,
    messages,
    messageInput,
    loading,
    sendingMessage,
    groupConversations,
    liveInnerCircles,
    loadingGroupConversations,
    groupOnlineMemberCountMap,
    onlineGroupMemberIds,
    discoverCommunities,
    loadingCommunities,
    innerCircleToken,
    innerCircleRoomId,
    joiningInnerCircleId,
    handleJoinInnerCircle,
    resetInnerCircleSession,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    setDebouncedSearch,
    searchDebounceRef,
    hasMoreMessages,
    loadingMore,
    messageListRef,
    onlineUsers,
    isConnected,
    isTyping,
    showReactionPickerFor,
    setShowReactionPickerFor,
    reactionPickerRef,
    commonEmojis,
    replyingTo,
    setReplyingTo,
    deletingMessage,
    pinnedUserIds,
    pinningUserId,
    loadMoreMessages,
    handleTyping,
    handleSendMessage,
    handleToggleReaction,
    handleDeleteForEveryone,
    handleCopyMessage,
    handlePinUser,
    sortUsers,
    formatTimestamp,
    handleJoinCommunity,
    joiningCommunityId,
  } = useMessagesController();

  const justClosedRef = useRef(false);

  const handleCloseInnerCircle = () => {
    justClosedRef.current = true;
    resetInnerCircleSession();
    setActiveChat(null);
    setChatMode('inner-circle');
    setSearchParams(new URLSearchParams({ chat: 'inner-circle' }), { replace: true });
    
    // Allow react-router to finish its update before re-enabling URL sync
    setTimeout(() => {
      justClosedRef.current = false;
    }, 100);
  };

  useEffect(() => {
    const chat = searchParams.get('chat');
    const targetUserId = searchParams.get('user');
    const targetCommunityId = searchParams.get('community');
    const autoJoin = searchParams.get('join') === 'true';

    if (chat === 'direct' && targetUserId && !loading) {
      let targetUser = users.find((item) => item._id === targetUserId);
      
      // If user not in existing conversations, check if passed via navigation state
      if (!targetUser && location.state?.newUser) {
        targetUser = location.state.newUser;
        // Prepend to users array so it shows in the sidebar
        setUsers(prev => {
          if (!prev.find(u => u._id === targetUser._id)) {
            return [targetUser, ...prev];
          }
          return prev;
        });
      }

      if (targetUser) {
        if (chatMode !== 'direct') setChatMode('direct');
        if (activeChat?._id !== targetUser._id) setActiveChat(targetUser);
      }
      return;
    }

    if (chat === 'group' && targetCommunityId && groupConversations.length > 0) {
      const targetCommunity = groupConversations.find(
        (item) => item._id === targetCommunityId || item.communityId === targetCommunityId
      );
      if (targetCommunity) {
        if (chatMode !== 'group') setChatMode('group');
        if (activeChat?._id !== targetCommunity._id && activeChat?.communityId !== targetCommunity.communityId) {
          setActiveChat(targetCommunity);
        }
      }
      return;
    }

    if (chat === 'inner-circle') {
      setChatMode('inner-circle');
      
      // Ignore URL sync if we just clicked "Leave" to prevent stale searchParams from restoring the chat
      if (justClosedRef.current) return;

      if (targetCommunityId && liveInnerCircles.length > 0) {
        const targetCommunity = liveInnerCircles.find(
          (item) => item._id === targetCommunityId || item.communityId === targetCommunityId
        );
        if (targetCommunity) {
          if (autoJoin && targetCommunity.event?._id !== innerCircleRoomId && targetCommunity.event?._id !== joiningInnerCircleId) {
            handleJoinInnerCircle(targetCommunity);
            setSearchParams((prev) => {
              const p = new URLSearchParams(prev);
              p.delete('join');
              return p;
            }, { replace: true });
          } else if (!autoJoin) {
            if (activeChat?._id !== targetCommunity._id && activeChat?.communityId !== targetCommunity.communityId) {
              setActiveChat(targetCommunity);
            }
          }
        }
      }
    }
  }, [
    searchParams,
    users,
    groupConversations,
    liveInnerCircles,
    setChatMode,
    setActiveChat,
    innerCircleRoomId,
    joiningInnerCircleId,
    setSearchParams,
    chatMode,
    activeChat?._id,
    loading
  ]);

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
    <>
      <style>{scrollbarStyles}</style>
      <div className="min-h-screen light-background overflow-hidden">
        <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Sidebar Toggle Button - desktop only */}
          <div className="hidden sm:flex w-14 flex-col items-center justify-center space-y-6 mr-5">
            <div className="side-trapezoid py-28 btn-blue-gradient flex flex-col items-center justify-center space-y-2 pr-1">
              <button
                onClick={() => {
                  setChatMode('direct');
                  setIsSidebarOpen(true);
                }}
                className={`flex items-center justify-center hover:opacity-90 transition-all duration-300 w-8 h-8 p-0 flex-shrink-0 aspect-square rounded-full ${
                  chatMode === 'direct' ? 'bg-white shadow-lg scale-110' : 'opacity-70 hover:bg-white/10'
                }`}
                title="Open direct chats"
              >
                <IoMenu className={`w-7 h-7 ${chatMode === 'direct' ? 'text-[#03045E]' : 'text-white'}`} />
              </button>
              <button
                onClick={() => {
                  setChatMode('group');
                  setIsSidebarOpen(true);
                }}
                className={`flex items-center justify-center hover:opacity-90 transition-all duration-300 w-9 h-9 p-0 flex-shrink-0 aspect-square rounded-full ${
                  chatMode === 'group' ? 'bg-white shadow-lg scale-110' : 'opacity-70 hover:bg-white/10'
                }`}
                title="Open group chats"
              >
                <IoPeopleOutline className={`w-6 h-6 ${chatMode === 'group' ? 'text-[#03045E]' : 'text-white'}`} />
              </button>
              <button
                onClick={() => {
                  setChatMode('inner-circle');
                  setIsSidebarOpen(true);
                }}
                className={`flex items-center justify-center hover:opacity-90 transition-all duration-300 w-8 h-8 p-0 flex-shrink-0 aspect-square rounded-full ${
                  chatMode === 'inner-circle' ? 'bg-white shadow-lg scale-110' : 'opacity-70 hover:bg-white/10'
                }`}
                title="Inner Circle (Live Audio)"
              >
                <div className="relative">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                    chatMode === 'inner-circle' ? 'border-[#03045E]' : 'border-white'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      chatMode === 'inner-circle' ? 'bg-red-500 animate-pulse' : 'bg-white'
                    }`}></div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Left Sidebar */}
          <MessagesSidebar
            isSidebarOpen={isSidebarOpen}
            activeChat={activeChat}
            chatMode={chatMode}
            setChatMode={setChatMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchDebounceRef={searchDebounceRef}
            setDebouncedSearch={setDebouncedSearch}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loading={loading}
            users={users}
            debouncedSearch={debouncedSearch}
            sortUsers={sortUsers}
            pinnedUserIds={pinnedUserIds}
            setActiveChat={setActiveChat}
            onlineUsers={onlineUsers}
            handlePinUser={handlePinUser}
            pinningUserId={pinningUserId}
            groupConversations={groupConversations}
            liveInnerCircles={liveInnerCircles}
            loadingGroupConversations={loadingGroupConversations}
            groupOnlineMemberCountMap={groupOnlineMemberCountMap}
            loadingCommunities={loadingCommunities}
            discoverCommunities={discoverCommunities}
            onJoinInnerCircle={handleJoinInnerCircle}
            joiningInnerCircleId={joiningInnerCircleId}
            handleJoinCommunity={handleJoinCommunity}
            joiningCommunityId={joiningCommunityId}
          />

          {/* Main Chat Area */}
          <div className={`flex-1 flex-col overflow-hidden ml-0 sm:ml-4 mr-0 sm:mr-4 my-0 sm:my-4 rounded-none sm:rounded-2xl bg-white/30 backdrop-blur-sm shadow-sm ${(!activeChat || chatMode === 'inner-circle') ? 'hidden' : 'flex'}`}>
            {/* Chat Header */}
            <ChatHeader
              activeChat={activeChat}
              onlineUsers={onlineUsers}
              isConnected={isConnected}
              chatMode={chatMode}
              onlineGroupMemberIds={onlineGroupMemberIds}
              onBackClick={() => setActiveChat(null)}
            />

            {/* Messages List */}
            <MessageList
              activeChat={activeChat}
              messages={messages}
              user={user}
              formatTimestamp={formatTimestamp}
              setReplyingTo={setReplyingTo}
              showReactionPickerFor={showReactionPickerFor}
              setShowReactionPickerFor={setShowReactionPickerFor}
              handleCopyMessage={handleCopyMessage}
              handleDeleteForEveryone={handleDeleteForEveryone}
              deletingMessage={deletingMessage}
              reactionPickerRef={reactionPickerRef}
              commonEmojis={commonEmojis}
              handleToggleReaction={handleToggleReaction}
              isTyping={isTyping}
              messageListRef={messageListRef}
              loadMoreMessages={loadMoreMessages}
              hasMoreMessages={hasMoreMessages}
              loadingMore={loadingMore}
              chatMode={chatMode}
            />

            {/* Message Input */}
            <MessageInput
              activeChat={activeChat}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              user={user}
              messageInput={messageInput}
              handleTyping={handleTyping}
              handleSendMessage={handleSendMessage}
              sendingMessage={sendingMessage}
              chatMode={chatMode}
            />
          </div>

          {/* Inner Circle Area */}
          {chatMode === 'inner-circle' && (
            <div className={`flex-1 flex flex-col overflow-hidden mx-0 sm:mx-4 my-0 sm:my-4 rounded-none sm:rounded-2xl bg-white shadow-sm min-h-0 ${!activeChat ? 'items-center justify-center' : ''}`}>
              {!activeChat ? (
                <div className="text-center p-6 sm:p-8 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-full animate-ping"></div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Inner Circle</h2>
                  <p className="text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                    Select an active Inner Circle from the sidebar to join the live audio stream with your community.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">Waiting for selection...</p>
                </div>
              ) : (
                <InnerCircleRoom 
                  activeChat={activeChat} 
                  roomId={innerCircleRoomId}
                  initialToken={innerCircleToken}
                  onClose={handleCloseInnerCircle}
                  allUsers={users}
                />
              )}
            </div>
          )}
        </div>

        <BottomNavBar />
      </div>
    </>
  );
};

export default Messages;
