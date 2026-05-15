import React, { useEffect } from "react";
import BottomNavBar from "../../components/ui/BottomNavBar";
import { IoMenu } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { scrollbarStyles } from "../../utils/MessageUtils";
import { useMessagesController } from "./hooks/useMessagesController";

// Import subcomponents
import MessagesSidebar from './subcomponents/MessagesSidebar';
import ChatHeader from './subcomponents/ChatHeader';
import MessageList from './subcomponents/MessageList';
import MessageInput from './subcomponents/MessageInput';
import InnerCircleRoom from './subcomponents/InnerCircleRoom';

const Messages = () => {
  const [searchParams] = useSearchParams();
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
  } = useMessagesController();

  const handleCloseInnerCircle = () => {
    resetInnerCircleSession();
    setActiveChat(null);
    setChatMode('group');
  };

  useEffect(() => {
    const chat = searchParams.get('chat');
    const targetUserId = searchParams.get('user');
    const targetCommunityId = searchParams.get('community');

    if (chat === 'direct' && targetUserId && users.length > 0) {
      const targetUser = users.find((item) => item._id === targetUserId);
      if (targetUser) {
        setChatMode('direct');
        setActiveChat(targetUser);
      }
      return;
    }

    if (chat === 'group' && targetCommunityId && groupConversations.length > 0) {
      const targetCommunity = groupConversations.find(
        (item) => item._id === targetCommunityId || item.communityId === targetCommunityId
      );
      if (targetCommunity) {
        setChatMode('group');
        setActiveChat(targetCommunity);
      }
    }
  }, [
    searchParams,
    users,
    groupConversations,
    setChatMode,
    setActiveChat,
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
            <div className="side-trapezoid py-28 btn-blue-gradient flex flex-col items-center justify-center space-y-6 pr-1">
              <button
                onClick={() => {
                  setChatMode('direct');
                  setIsSidebarOpen(true);
                }}
                className={`flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-md ${
                  chatMode === 'direct' ? 'opacity-100' : 'opacity-70'
                }`}
                title="Open direct chats"
              >
                <IoMenu className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => {
                  setChatMode('group');
                  setIsSidebarOpen(true);
                }}
                className={`flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-md ${
                  chatMode === 'group' ? 'opacity-100' : 'opacity-70'
                }`}
                title="Open group chats"
              >
                <IoPeopleOutline className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => {
                  setChatMode('inner-circle');
                  setIsSidebarOpen(true);
                }}
                className={`flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-md ${
                  chatMode === 'inner-circle' ? 'opacity-100 scale-110' : 'opacity-70'
                }`}
                title="Inner Circle (Live Audio)"
              >
                <div className="relative">
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${chatMode === 'inner-circle' ? 'bg-red-500 animate-pulse' : 'bg-white'}`}></div>
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
            <div className={`flex-1 flex-col overflow-hidden ml-0 sm:ml-4 mr-0 sm:mr-4 my-0 sm:my-4 rounded-none sm:rounded-2xl bg-white shadow-sm flex ${!activeChat ? 'items-center justify-center' : ''}`}>
              {!activeChat ? (
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-full animate-ping"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Inner Circle</h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Select an active Inner Circle from the sidebar to join the live audio stream with your community.
                  </p>
                  <p className="text-sm text-gray-400">Waiting for selection...</p>
                </div>
              ) : (
                <InnerCircleRoom 
                  activeChat={activeChat} 
                  roomId={innerCircleRoomId}
                  initialToken={innerCircleToken}
                  onClose={handleCloseInnerCircle}
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
