import React from 'react';
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
  messagesEndRef
}) => {
  if (!activeChat) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 thin-scrollbar">
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a user to view messages
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 thin-scrollbar">
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet. Start the conversation!
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 thin-scrollbar">
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
      {isTyping && <TypingIndicator activeChat={activeChat} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
