import React from 'react';
import { IoArrowUndoSharp, IoClose, IoSend } from 'react-icons/io5';

const MessageInput = ({
  activeChat,
  replyingTo,
  setReplyingTo,
  user,
  messageInput,
  handleTyping,
  handleSendMessage,
  sendingMessage
}) => {
  return (
    <div className="px-6 py-4 flex-shrink-0">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <IoArrowUndoSharp className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <p className="text-[11px] font-medium text-blue-600">
                Replying to {replyingTo.sender._id === user._id ? 'yourself' : `${replyingTo.sender.firstname} ${replyingTo.sender.lastname}`}
              </p>
            </div>
            <p className="text-[12px] text-gray-600 line-clamp-1 ml-5">{replyingTo.content}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
          >
            <IoClose className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder={activeChat ? `Reply to ${activeChat.firstname}` : "Select a user to start messaging"}
          disabled={!activeChat || sendingMessage}
          className="flex-1 px-4 py-2.5 rounded-full bg-white/70 border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button 
          onClick={handleSendMessage}
          disabled={!activeChat || !messageInput.trim() || sendingMessage}
          className="btn-blue-gradient w-11 h-11 rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingMessage ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <IoSend className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
