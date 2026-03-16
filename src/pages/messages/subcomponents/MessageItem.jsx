import React from 'react';
import { IoArrowUndoSharp, IoCopyOutline, IoTrash } from 'react-icons/io5';
import ReactionPicker from './ReactionPicker';

const MessageItem = ({
  message,
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
  chatMode = 'direct',
}) => {
  const isGroup = chatMode === 'group';
  const sender = message.sender || {};
  const senderId = sender._id;
  const isOutgoing = senderId === user._id;
  const messageReactions = message.reactions || [];
  const isDeleted = message.isDeletedForEveryone;
  
  // Check if message can be deleted (within 1 hour, sender only)
  const messageTime = new Date(message.createdAt);
  const now = new Date();
  const hoursDiff = (now - messageTime) / (1000 * 60 * 60);
  const canDelete = isOutgoing && hoursDiff <= 1 && !isDeleted;
  
  // Group reactions by emoji
  const groupedReactions = messageReactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {});

  return (
    <div
      className={`flex items-start gap-3 group ${
        isOutgoing ? "justify-end" : "justify-start"
      }`}
    >
      {!isOutgoing && (
        <img
          src={sender.profilePicture || "https://i.pravatar.cc/150?img=12"}
          alt={`${sender.firstname || 'User'} ${sender.lastname || ''}`.trim()}
          className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
        />
      )}
      
      {/* Action Buttons Row - centered with message, shows on hover */}
      {!isDeleted && (
        <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
          isOutgoing ? 'order-first' : 'order-last'
        }`}>
          {/* Reply Button */}
          <button
            onClick={() => setReplyingTo(message)}
            className="w-6 h-6 rounded-full bg-white cursor-pointer shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
            title="Reply to message"
          >
            <IoArrowUndoSharp className="w-3.5 h-3.5" />
          </button>
          
          {/* Reaction Button */}
          <button
            onClick={() => setShowReactionPickerFor(showReactionPickerFor === message._id ? null : message._id)}
            className="w-6 h-6 rounded-full cursor-pointer bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
            title="Add reaction"
          >
            <span className="text-sm">😊</span>
          </button>
          
          {/* Copy Button */}
          <button
            onClick={() => handleCopyMessage(message.content)}
            className="w-6 h-6 rounded-full bg-white cursor-pointer shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
            title="Copy message"
          >
            <IoCopyOutline className="w-3.5 h-3.5" />
          </button>
          
          {/* Delete Button - only for sender within 1 hour */}
          {canDelete && (
            <button
              onClick={() => handleDeleteForEveryone(message._id)}
              disabled={deletingMessage === message._id}
              className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 text-gray-600 cursor-pointer disabled:opacity-50"
              title="Delete for everyone"
            >
              {deletingMessage === message._id ? (
                <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <IoTrash className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      )}
      
      <div className="flex flex-col space-y-1 max-w-md relative">
        {isGroup && !isOutgoing && !isDeleted && (
          <p className="text-[10px] text-gray-500 px-1">
            {`${sender.firstname || 'User'} ${sender.lastname || ''}`.trim()}
          </p>
        )}
        <div className="relative">
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isOutgoing
                ? "btn-blue-gradient text-white"
                : "bg-white/80 text-gray-900 shadow-sm"
            }`}
          >
            {isDeleted ? (
              <p className="text-[13px] italic opacity-60">
                🚫 This message was deleted
              </p>
            ) : (
              <>
                {/* Show replied-to message if exists */}
                {message.replyTo && !message.replyTo.isDeletedForEveryone && (
                  <div className={`mb-2 pb-2 border-l-2 pl-2 ${
                    isOutgoing ? 'border-white/50' : 'border-gray-300'
                  }`}>
                    <p className={`text-[10px] font-medium mb-0.5 ${
                      isOutgoing ? 'text-white/80' : 'text-gray-600'
                    }`}>
                      {message.replyTo.sender?._id === user._id ? 'You' : `${message.replyTo.sender?.firstname || 'User'} ${message.replyTo.sender?.lastname || ''}`.trim()}
                    </p>
                    <p className={`text-[11px] line-clamp-2 ${
                      isOutgoing ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.replyTo.isDeletedForEveryone ? '🚫 This message was deleted' : message.replyTo.content}
                    </p>
                  </div>
                )}
                <p className="text-[13px] leading-relaxed">{message.content}</p>
              </>
            )}
          </div>

          {/* Reaction Picker */}
          {showReactionPickerFor === message._id && !isDeleted && (
            <ReactionPicker
              reactionPickerRef={reactionPickerRef}
              isOutgoing={isOutgoing}
              commonEmojis={commonEmojis}
              onReactionClick={(emoji) => handleToggleReaction(message._id, emoji)}
            />
          )}
        </div>

        {/* Display Reactions */}
        {!isDeleted && Object.keys(groupedReactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 px-1 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(groupedReactions).map(([emoji, reactions]) => {
              const userHasReacted = reactions.some(r => r.user._id === user._id);
              const reactionCount = reactions.length;
              
              return (
                <button
                  key={emoji}
                  onClick={() => handleToggleReaction(message._id, emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all hover:scale-105 ${
                    userHasReacted 
                      ? 'bg-blue-100 border border-blue-300' 
                      : 'bg-gray-100 border border-gray-200'
                  }`}
                  title={reactions.map(r => `${r.user.firstname} ${r.user.lastname}`).join(', ')}
                >
                  <span>{emoji}</span>
                  <span className={userHasReacted ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                    {reactionCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-3 px-1">
          <span className="text-[10px] text-gray-400">
            {formatTimestamp(message.createdAt)}
          </span>
          {message.isRead && isOutgoing && (
            <span className="text-[10px] text-blue-500">Read</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
