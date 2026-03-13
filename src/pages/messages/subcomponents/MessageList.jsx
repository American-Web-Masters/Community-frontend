import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';

const MessageList = ({
  activeChat,
  messages,
  user,
  formatTimestamp,
  setReplyingTo,
  showReactionPickerFor,
  setShowReactionPickerFor,
  handleCopyMessage,
  handleDeleteForEveryone,
  deletingMessage,
  reactionPickerRef,
  commonEmojis,
  handleToggleReaction,
  isTyping,
  messageListRef,
  loadMoreMessages,
  hasMoreMessages,
  loadingMore,
}) => {
  // Sentinel div at the visual top — IntersectionObserver watches it to trigger pagination
  const sentinelRef = useRef(null);

  // Refs keep the observer callback fresh without re-registering on every render
  const hasMoreRef = useRef(hasMoreMessages);
  const loadingMoreRef = useRef(loadingMore);
  const loadMoreFnRef = useRef(loadMoreMessages);

  useEffect(() => { hasMoreRef.current = hasMoreMessages; }, [hasMoreMessages]);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);
  useEffect(() => { loadMoreFnRef.current = loadMoreMessages; }, [loadMoreMessages]);

  // Re-register the observer every time the active conversation changes so the
  // sentinel (which unmounts on "no active chat") is correctly observed.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingMoreRef.current) {
          loadMoreFnRef.current();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeChat?._id]); // re-register when chat changes

  if (!activeChat) {
    return (
      <div className="flex-1 overflow-y-auto thin-scrollbar flex items-center justify-center">
        <span className="text-gray-500">Select a user to view messages</span>
      </div>
    );
  }

  // ─── Main chat container ────────────────────────────────────────────────────
  // flex-col-reverse means:
  //   • DOM-first child  → VISUAL BOTTOM  (newest messages / typing indicator)
  //   • DOM-last child   → VISUAL TOP     (oldest messages / load-more sentinel)
  // Because index 0 of the array is the newest message (as the backend returns),
  // it naturally lands at the bottom with no manual scrollIntoView required.
  // Appending older pages to the END of the array places them at the visual top.
  return (
    <div
      ref={messageListRef}
      className="flex-1 flex flex-col-reverse overflow-y-auto px-6 py-6 gap-5 thin-scrollbar"
    >
      {/* ── VISUAL BOTTOM ─────────────────────────────────────────────────── */}

      {isTyping && <TypingIndicator activeChat={activeChat} />}

      {/* Empty state */}
      {messages.length === 0 && !loadingMore && (
        <p className="text-center text-gray-500 py-4">
          No messages yet. Start the conversation!
        </p>
      )}

      {/* Messages — newest first in array → renders newest at visual bottom */}
      {messages.map((message) => (
        <MessageItem
          key={message._id}
          message={message}
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
        />
      ))}

      {/* ── VISUAL TOP ────────────────────────────────────────────────────── */}

      {loadingMore && (
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading older messages...</span>
          </div>
        </div>
      )}

      {!hasMoreMessages && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <span className="text-xs text-gray-400">Beginning of conversation</span>
        </div>
      )}

      {/* Sentinel: becomes visible when user scrolls near the top → triggers load more */}
      <div ref={sentinelRef} className="h-px shrink-0" />
    </div>
  );
};

export default MessageList;

